# Infrastructure Deployment Guide

This directory contains Kubernetes manifests for platform infrastructure services.

## Prerequisites

- EKS cluster provisioned with Terraform
- kubectl configured with cluster access
- Helm 3.x installed

## Installation Order

```bash
# 1. Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=available --timeout=300s -n argocd deployment/argocd-server

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 2. Install Prometheus Stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --values ../helm-charts/infrastructure/prometheus/values.yaml

# 3. Install Ingress Nginx
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"

# 4. Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager
kubectl wait --for=condition=available --timeout=300s -n cert-manager deployment/cert-manager

# Apply ClusterIssuers
kubectl apply -f cert-manager/letsencrypt-issuer.yaml
```

## Verification

```bash
# Check all pods
kubectl get pods -A

# Check ArgoCD apps
kubectl get applications -n argocd

# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# Check Grafana dashboards
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Username: admin, Password: prom-operator
```
