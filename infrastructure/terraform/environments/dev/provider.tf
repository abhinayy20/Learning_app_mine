terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for Terraform state
  # Uncomment after creating the S3 bucket and DynamoDB table
  # backend "s3" {
  #   bucket         = "learning-platform-terraform-state"
  #   key            = "dev/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

locals {
  common_tags = {
    Project     = "learning-platform"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "DevOps Team"
  }
}
