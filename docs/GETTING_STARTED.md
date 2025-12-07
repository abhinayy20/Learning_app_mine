# Getting Started - Quick Setup Guide

This guide will help you get the Learning Platform up and running quickly.

## Prerequisites

Before you begin, ensure you have:

- ✅ AWS Account with administrator access
- ✅ GitHub account
- ✅ Docker installed
- ✅ AWS CLI configured
- ✅ Terraform ≥ 1.5.0
- ✅ kubectl ≥ 1.28
- ✅ Helm ≥ 3.0

## Local Development (5 minutes)

Run the entire platform locally with Docker Compose:

```bash
# Clone repository
git clone <your-repo-url>
cd LEARNING_PROJECT

# Start all services
docker-compose up -d

# Wait for services to be ready (~30 seconds)
docker-compose ps

# Access the application
# Frontend: http://localhost:3000
# Course API: http://localhost:3001
# User API: http://localhost:3002
# Notification API: http://localhost:3003

# View logs
docker-compose logs -f course-service

# Stop services
docker-compose down
```

## AWS Deployment (30-45 minutes)

### Step 1: Configure AWS Credentials

```bash
aws configure
# AWS Access Key ID: [YOUR_KEY]
# AWS Secret Access Key: [YOUR_SECRET]
# Default region: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### Step 2: Deploy Infrastructure with Terraform

```bash
cd infrastructure/terraform/environments/dev

# Review variables (optional - defaults are optimized for cost)
cat variables.tf

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy infrastructure (15-20 minutes)
terraform apply -auto-approve

# Save outputs
terraform output > ../../../../terraform-outputs.txt
```

**What gets created:**
- VPC with public/private subnets across 3 AZs
- EKS cluster with 2 nodes (t3.medium)
- NAT Gateway (single for cost optimization)
- Security groups and IAM roles
- OIDC provider for IRSA

### Step 3: Configure kubectl

```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name learning-platform-dev-eks

# Verify connection
kubectl get nodes
# Should show 2 nodes in Ready state
```

### Step 4: Deploy Platform Infrastructure

```bash
cd ../../../../kubernetes/infrastructure

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD pods
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# Get ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""

# Access ArgoCD UI (in new terminal)
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open: https://localhost:8080
# Username: admin
# Password: (from above command)

# Install Prometheus & Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Access Grafana (in new terminal)
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Open: http://localhost:3000
# Username: admin
# Password: prom-operator

# Install Nginx Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"

# Get Load Balancer URL
kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Step 5: Build and Push Docker Images

```bash
# Configure ECR
aws ecr create-repository --repository-name learning-platform/course-service --region us-east-1
aws ecr create-repository --repository-name learning-platform/user-service --region us-east-1
aws ecr create-repository --repository-name learning-platform/notification-service --region us-east-1
aws ecr create-repository --repository-name learning-platform/frontend --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# Build and push Course Service
cd ../../apps/course-service
docker build -t course-service:latest .
docker tag course-service:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/learning-platform/course-service:latest
docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/learning-platform/course-service:latest

# Repeat for other services (user-service, notification-service, frontend)
```

### Step 6: Deploy Applications with Helm

```bash
cd ../../kubernetes/helm-charts/course-service

helm install course-service . \
  --namespace learning-platform-dev \
  --create-namespace \
  --set image.repository=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/learning-platform/course-service \
  --set image.tag=latest

# Verify deployment
kubectl get pods -n learning-platform-dev
kubectl get svc -n learning-platform-dev
```

## Verification

### Check Application Health

```bash
# Port forward to course service
kubectl port-forward -n learning-platform-dev svc/course-service 3001:80

# Test health endpoint
curl http://localhost:3001/health

# Test API
curl http://localhost:3001/api/courses
```

### Check Monitoring

```bash
# Access Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Open: http://localhost:9090
# Query: http_requests_total

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Open: http://localhost:3000
# Check pre-installed dashboards
```

## Next Steps

1. **Set up CI/CD**:
   - Configure GitHub Actions secrets
   - Push code to trigger pipeline
   - Watch automated deployment

2. **Configure GitOps**:
   - Apply ArgoCD applications: `kubectl apply -f gitops/`
   - Enable auto-sync for continuous deployment

3. **Set up DNS** (optional):
   - Point your domain to Load Balancer
   - Configure TLS with cert-manager

4. **Explore Dashboards**:
   - ArgoCD: Deployment status
   - Grafana: Application metrics
   - Prometheus: Raw metrics

## Troubleshooting

### Pods not starting

```bash
kubectl describe pod <POD_NAME> -n learning-platform-dev
kubectl logs <POD_NAME> -n learning-platform-dev
```

### Can't access services

```bash
# Check service endpoints
kubectl get endpoints -n learning-platform-dev

# Check ingress
kubectl describe ingress -n learning-platform-dev
```

### Terraform errors

```bash
# Re-run initialization
terraform init -upgrade

# Check AWS permissions
aws iam get-user

# Destroy and retry
terraform destroy -auto-approve
terraform apply -auto-approve
```

## Clean Up

To avoid AWS charges when not in use:

```bash
# Delete Kubernetes resources
helm uninstall course-service -n learning-platform-dev
helm uninstall prometheus -n monitoring
helm uninstall ingress-nginx -n ingress-nginx
kubectl delete namespace learning-platform-dev
kubectl delete namespace monitoring
kubectl delete namespace ingress-nginx
kubectl delete namespace argocd

# Destroy infrastructure
cd infrastructure/terraform/environments/dev
terraform destroy -auto-approve
```

## Cost Optimization

- Use `t3.medium` instances (default)
- Single NAT Gateway (default)
- Delete resources when not in use
- Use AWS Free Tier where applicable

**Estimated monthly cost**: $150-300 (mostly EKS control plane $73 + EC2 instances)

## Support

- 📖 **Documentation**: `docs/` directory
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions
- 📧 **Email**: devops@learningplatform.com

---

**Congratulations! 🎉** You now have a production-grade DevOps platform running on AWS!
