# Deployment Runbook

## Overview

This runbook provides step-by-step procedures for deploying and managing the Learning Platform.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Deploying Infrastructure](#deploying-infrastructure)
3. [Deploying Applications](#deploying-applications)
4. [Rolling Back Deployments](#rolling-back-deployments)
5. [Scaling Services](#scaling-services)
6. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### 1. Configure AWS Credentials

```bash
aws configure
# Enter AWS Access Key ID, Secret, Region: us-east-1
```

### 2. Install Required Tools

```bash
# Terraform
choco install terraform  # Windows
brew install terraform   # macOS

# kubectl
choco install kubernetes-cli  # Windows
brew install kubectl          # macOS

# Helm
choco install kubernetes-helm  # Windows
brew install helm             # macOS

# AWS CLI
choco install awscli  # Windows
brew install awscli   # macOS
```

---

## Deploying Infrastructure

### Step 1: Deploy AWS Infrastructure with Terraform

```bash
cd infrastructure/terraform/environments/dev

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply infrastructure
terraform apply -auto-approve
```

**Expected Output:**
- VPC with public/private subnets
- EKS cluster (takes ~15 minutes)
- NAT Gateways
- Security Groups

### Step 2: Configure kubectl

```bash
aws eks update-kubeconfig --region us-east-1 --name learning-platform-dev-eks

# Verify connection
kubectl get nodes
```

### Step 3: Install Platform Infrastructure

```bash
# Follow steps in kubernetes/infrastructure/README.md
cd ../../kubernetes/infrastructure

# Install ArgoCD (see README.md for details)
# Install Prometheus
# Install Ingress Nginx
# Install cert-manager
```

---

## Deploying Applications

### Option A: Using ArgoCD (Recommended - GitOps)

```bash
# Apply ArgoCD AppProject
kubectl apply -f gitops/appproject.yaml

# Deploy applications
kubectl apply -f gitops/applications/

# Check sync status
argocd app list
argocd app get course-service-dev
```

### Option B: Using Helm Directly

```bash
cd kubernetes/helm-charts/course-service

helm install course-service . \
  --namespace learning-platform-dev \
  --create-namespace \
  --set image.repository=123456789012.dkr.ecr.us-east-1.amazonaws.com/learning-platform/course-service \
  --set image.tag=latest
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n learning-platform-dev

# Check services
kubectl get svc -n learning-platform-dev

# Check ingress
kubectl get ingress -n learning-platform-dev

# View logs
kubectl logs -f deployment/course-service -n learning-platform-dev
```

---

## Rolling Back Deployments

### Using ArgoCD

```bash
# View history
argocd app history course-service-dev

# Rollback to previous version
argocd app rollback course-service-dev <REVISION>
```

### Using Helm

```bash
# View history
helm history course-service -n learning-platform-dev

# Rollback
helm rollback course-service <REVISION> -n learning-platform-dev
```

### Using kubectl

```bash
# Rollback deployment
kubectl rollout undo deployment/course-service -n learning-platform-dev

# Check rollout status
kubectl rollout status deployment/course-service -n learning-platform-dev
```

---

## Scaling Services

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment/course-service --replicas=5 -n learning-platform-dev
```

### Update HPA

```bash
# Edit HPA
kubectl edit hpa course-service -n learning-platform-dev

# Or update via Helm
helm upgrade course-service ./kubernetes/helm-charts/course-service \
  --set autoscaling.minReplicas=3 \
  --set autoscaling.maxReplicas=10 \
  -n learning-platform-dev
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod
kubectl describe pod <POD_NAME> -n learning-platform-dev

# Check events
kubectl get events -n learning-platform-dev --sort-by='.lastTimestamp'

# Check logs
kubectl logs <POD_NAME> -n learning-platform-dev --previous
```

### Database Connection Issues

```bash
# Check if MongoDB/PostgreSQL pods are running
kubectl get pods -n learning-platform-dev | grep mongo
kubectl get pods -n learning-platform-dev | grep postgres

# Test connectivity from pod
kubectl exec -it <APP_POD> -n learning-platform-dev -- /bin/sh
# Inside pod:
ping mongo
telnet mongo 27017
```

### Ingress Not Working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress resource
kubectl describe ingress -n learning-platform-dev

# Check service
kubectl get svc -n learning-platform-dev

# Get load balancer DNS
kubectl get svc -n ingress-nginx
```

### Certificate Issues

```bash
# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Check certificate status
kubectl get certificate -A
kubectl describe certificate <CERT_NAME> -n learning-platform-dev

# Check certificate requests
kubectl get certificaterequests -n learning-platform-dev
```

### High Resource Usage

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n learning-platform-dev

# Check HPA status
kubectl get hpa -n learning-platform-dev
kubectl describe hpa course-service -n learning-platform-dev
```

### ArgoCD Sync Issues

```bash
# Check app health
argocd app get course-service-dev

# Force sync
argocd app sync course-service-dev --force

# Check sync logs
argocd app logs course-service-dev
```

---

## Emergency Procedures

### Complete Service Outage

1. Check cluster health: `kubectl get nodes`
2. Check all pods: `kubectl get pods -A`
3. Review recent changes in GitOps repo
4. Rollback to last known good state
5. Alert team via Slack/Email

### Database Corruption

1. Stop application pods: `kubectl scale deployment --replicas=0`
2. Restore from latest backup
3. Verify data integrity
4. Restart application pods

### Security Breach

1. Isolate affected pods
2. Review audit logs
3. Rotate credentials
4. Apply security patches
5. Conduct post-mortem

---

## Monitoring and Alerts

### Accessing Dashboards

```bash
# Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# ArgoCD
kubectl port-forward -n argocd svc/argocd-server 8080:443
```

### Key Metrics to Monitor

- Pod CPU/Memory usage
- Request rate and latency
- Error rates
- Database connections
- Certificate expiration dates

---

## Maintenance Windows

### Updating EKS Cluster

```bash
# Plan maintenance window (non-business hours)
# Update Terraform variables
cd infrastructure/terraform/environments/dev
vim variables.tf  # Update eks_cluster_version

terraform plan
terraform apply

# Update node groups (rolling update)
# Verify application health after each node update
```

### Updating Application

1. Merge code to main branch
2. CI/CD pipeline builds and pushes image
3. GitOps repo updated with new image tag
4. ArgoCD auto-syncs deployment
5. Monitor health in Grafana

---

## Contact Information

- **DevOps Team**: devops@learningplatform.com
- **On-Call**: TODO: Add PagerDuty/Ops genie
- **Slack Channel**: #learning-platform-ops
