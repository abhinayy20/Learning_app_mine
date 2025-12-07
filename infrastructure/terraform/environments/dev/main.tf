# VPC Module
module "vpc" {
  source = "../../modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = var.single_nat_gateway
}

# EKS Module
module "eks" {
  source = "../../modules/eks"

  project_name          = var.project_name
  environment           = var.environment
  cluster_version       = var.eks_cluster_version
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  node_instance_types   = var.eks_node_instance_types
  node_desired_size     = var.eks_node_desired_size
  node_min_size         = var.eks_node_min_size
  node_max_size         = var.eks_node_max_size
}

# IAM Module for IRSA (IAM Roles for Service Accounts)
module "iam" {
  source = "../../modules/iam"

  project_name           = var.project_name
  environment            = var.environment
  eks_cluster_name       = module.eks.cluster_name
  eks_oidc_provider_arn  = module.eks.oidc_provider_arn
  eks_oidc_provider_url  = module.eks.oidc_provider_url
}
