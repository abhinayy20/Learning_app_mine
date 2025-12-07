#----------------------------------------------------------------------
# IAM Module - IRSA Roles for Kubernetes Service Accounts
#----------------------------------------------------------------------

locals {
  oidc_provider_id = replace(var.eks_oidc_provider_url, "https://", "")
  name_prefix      = "${var.project_name}-${var.environment}"
}

# AWS Load Balancer Controller IAM Role
resource "aws_iam_role" "aws_load_balancer_controller" {
  name = "${local.name_prefix}-aws-load-balancer-controller"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = var.eks_oidc_provider_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_provider_id}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller"
          "${local.oidc_provider_id}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

resource "aws_iam_policy" "aws_load_balancer_controller" {
  name        = "${local.name_prefix}-aws-load-balancer-controller"
  description = "IAM policy for AWS Load Balancer Controller"

  policy = file("${path.module}/policies/aws-load-balancer-controller.json")
}

resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
  policy_arn = aws_iam_policy.aws_load_balancer_controller.arn
  role       = aws_iam_role.aws_load_balancer_controller.name
}

# External DNS IAM Role
resource "aws_iam_role" "external_dns" {
  name = "${local.name_prefix}-external-dns"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = var.eks_oidc_provider_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_provider_id}:sub" = "system:serviceaccount:kube-system:external-dns"
          "${local.oidc_provider_id}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

resource "aws_iam_policy" "external_dns" {
  name        = "${local.name_prefix}-external-dns"
  description = "IAM policy for External DNS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "route53:ChangeResourceRecordSets"
      ]
      Resource = "arn:aws:route53:::hostedzone/*"
    },
    {
      Effect = "Allow"
      Action = [
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "external_dns" {
  policy_arn = aws_iam_policy.external_dns.arn
  role       = aws_iam_role.external_dns.name
}

# Cert Manager IAM Role
resource "aws_iam_role" "cert_manager" {
  name = "${local.name_prefix}-cert-manager"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = var.eks_oidc_provider_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_provider_id}:sub" = "system:serviceaccount:cert-manager:cert-manager"
          "${local.oidc_provider_id}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

resource "aws_iam_policy" "cert_manager" {
  name        = "${local.name_prefix}-cert-manager"
  description = "IAM policy for Cert Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "route53:GetChange"
      ]
      Resource = "arn:aws:route53:::change/*"
    },
    {
      Effect = "Allow"
      Action = [
        "route53:ChangeResourceRecordSets",
        "route53:ListResourceRecordSets"
      ]
      Resource = "arn:aws:route53:::hostedzone/*"
    },
    {
      Effect = "Allow"
      Action = [
        "route53:ListHostedZonesByName"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cert_manager" {
  policy_arn = aws_iam_policy.cert_manager.arn
  role       = aws_iam_role.cert_manager.name
}

# Cluster Autoscaler IAM Role
resource "aws_iam_role" "cluster_autoscaler" {
  name = "${local.name_prefix}-cluster-autoscaler"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = var.eks_oidc_provider_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_provider_id}:sub" = "system:serviceaccount:kube-system:cluster-autoscaler"
          "${local.oidc_provider_id}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

resource "aws_iam_policy" "cluster_autoscaler" {
  name        = "${local.name_prefix}-cluster-autoscaler"
  description = "IAM policy for Cluster Autoscaler"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "autoscaling:DescribeAutoScalingGroups",
        "autoscaling:DescribeAutoScalingInstances",
        "autoscaling:DescribeLaunchConfigurations",
        "autoscaling:DescribeScalingActivities",
        "autoscaling:DescribeTags",
        "ec2:DescribeInstanceTypes",
        "ec2:DescribeLaunchTemplateVersions"
      ]
      Resource = "*"
    },
    {
      Effect = "Allow"
      Action = [
        "autoscaling:SetDesiredCapacity",
        "autoscaling:TerminateInstanceInAutoScalingGroup",
        "ec2:DescribeImages",
        "ec2:GetInstanceTypesFromInstanceRequirements",
        "eks:DescribeNodegroup"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cluster_autoscaler" {
  policy_arn = aws_iam_policy.cluster_autoscaler.arn
  role       = aws_iam_role.cluster_autoscaler.name
}
