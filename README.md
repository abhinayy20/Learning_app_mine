# Learning Platform - Production DevOps Project

> **A complete end-to-end DevOps platform demonstrating modern CI/CD, GitOps, and cloud-native practices**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-623CE4?logo=terraform)](https://www.terraform.io/)
[![Kubernetes](https://img.shields.io/badge/Platform-Kubernetes-326CE5?logo=kubernetes)](https://kubernetes.io/)
[![ArgoCD](https://img.shields.io/badge/GitOps-ArgoCD-EF7B4D?logo=argo)](https://argoproj.github.io/cd/)

## 📚 Overview

This is a **portfolio-grade DevOps project** that implements a complete learning platform with:

- ✅ **5 Microservices** (Node.js, Python, Go, Java, React)
- ✅ **Infrastructure as Code** (Terraform on AWS)
- ✅ **Automated CI/CD** (GitHub Actions)
- ✅ **GitOps Deployment** (ArgoCD)
- ✅ **Container Orchestration** (Kubernetes/EKS)
- ✅ **Observability** (Prometheus + Grafana)
- ✅ **Security Best Practices** (RBAC, Network Policies, Secrets Management)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          GitHub Repository                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Frontend │  │  Course  │  │   User   │  │  Notify  │       │
│  │  (React) │  │ Service  │  │ Service  │  │ Service  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└──────────────────────┬──────────────────────────────────────────┘
                       │ git push
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Actions CI/CD                        │
│  Build → Test → Quality Gate → Security Scan → Build Image     │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Push image & update GitOps repo
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Amazon EKS Cluster                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ArgoCD (GitOps Controller)                              │  │
│  │  - Watches GitOps repo                                   │  │
│  │  - Auto-syncs deployments                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Frontend │  │  Course  │  │   User   │  │  Notify  │      │
│  │   Pods   │  │   Pods   │  │   Pods   │  │   Pods   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Prometheus & Grafana (Observability)                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Tools**: Docker, Terraform, kubectl, Helm, AWS CLI
- **Accounts**: AWS account, GitHub account
- **Skills**: Basic Kubernetes, Docker, and Terraform knowledge

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd LEARNING_PROJECT

# Run services locally with Docker Compose
docker-compose up -d

# Access services
# Frontend: http://localhost:3000
# Course API: http://localhost:3001
# User API: http://localhost:3002
```

### Deploy to AWS EKS

```bash
# 1. Configure AWS credentials
aws configure

# 2. Deploy infrastructure with Terraform
cd infrastructure/terraform/environments/dev
terraform init
terraform apply

# 3. Configure kubectl
aws eks update-kubeconfig --name learning-platform-dev --region us-east-1

# 4. Install ArgoCD and infrastructure components
kubectl apply -k kubernetes/infrastructure/argocd
kubectl apply -k kubernetes/infrastructure/prometheus
kubectl apply -k kubernetes/infrastructure/ingress-nginx

# 5. Deploy applications via ArgoCD
kubectl apply -f gitops/applications/
```

## 📁 Project Structure

```
LEARNING_PROJECT/
├── apps/                      # Application source code
│   ├── frontend/              # React frontend
│   ├── course-service/        # Node.js microservice
│   ├── user-service/          # Python microservice
│   ├── notification-service/  # Go microservice
│   └── legacy-monolith/       # Java Spring Boot
├── infrastructure/            # Terraform IaC
│   └── terraform/
│       ├── environments/      # Dev, staging, prod configs
│       └── modules/           # Reusable Terraform modules
├── kubernetes/                # Kubernetes manifests
│   ├── helm-charts/           # Application Helm charts
│   └── infrastructure/        # Platform services (ArgoCD, Prometheus)
├── gitops/                    # GitOps repository
│   ├── applications/          # ArgoCD application definitions
│   └── environments/          # Environment-specific configs
├── ci-cd/                     # CI/CD pipeline definitions
│   └── github-actions/        # GitHub Actions workflows
└── docs/                      # Documentation
    ├── architecture/          # Architecture diagrams
    ├── runbooks/              # Operational runbooks
    └── labs/                  # Hands-on learning labs
```

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Cloud Provider** | AWS (EKS, VPC, Route53, ECR) |
| **Infrastructure as Code** | Terraform |
| **Container Orchestration** | Kubernetes (EKS) |
| **CI/CD** | GitHub Actions |
| **GitOps** | ArgoCD |
| **Code Quality** | SonarQube |
| **Artifact Storage** | Amazon ECR |
| **Monitoring** | Prometheus + Grafana |
| **Ingress** | Nginx Ingress Controller |
| **Certificates** | cert-manager + Let's Encrypt |
| **Languages** | JavaScript/TypeScript, Python, Go, Java |

## 📖 Documentation

- [Architecture Guide](docs/architecture/README.md)
- [Deployment Runbook](docs/runbooks/deployment.md)
- [Hands-on Labs](docs/labs/)
- [Troubleshooting Guide](docs/troubleshooting.md)

## 🎯 Learning Outcomes

By completing this project, you'll gain hands-on experience with:

1. **Infrastructure as Code**: Provision cloud resources using Terraform
2. **CI/CD Pipelines**: Automate builds, tests, and deployments
3. **Container Orchestration**: Deploy and manage microservices on Kubernetes
4. **GitOps**: Implement declarative deployments with ArgoCD
5. **Observability**: Monitor applications with Prometheus and Grafana
6. **Security**: Implement RBAC, network policies, and secrets management
7. **DevOps Best Practices**: Production-grade workflows for real-world scenarios

## 📊 Project Metrics

- **5** Polyglot microservices
- **100%** Infrastructure as Code
- **Automated** quality gates and security scans
- **Zero-downtime** deployments with GitOps
- **Real-time** observability dashboards

## 🤝 Contributing

This is a learning project. Feel free to fork and customize for your own portfolio!

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

**Built with ❤️ for DevOps learning and portfolio development**
