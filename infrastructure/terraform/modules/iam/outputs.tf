output "aws_load_balancer_controller_role_arn" {
  description = "ARN of AWS Load Balancer Controller IAM role"
  value       = aws_iam_role.aws_load_balancer_controller.arn
}

output "external_dns_role_arn" {
  description = "ARN of External DNS IAM role"
  value       = aws_iam_role.external_dns.arn
}

output "cert_manager_role_arn" {
  description = "ARN of Cert Manager IAM role"
  value       = aws_iam_role.cert_manager.arn
}

output "cluster_autoscaler_role_arn" {
  description = "ARN of Cluster Autoscaler IAM role"
  value       = aws_iam_role.cluster_autoscaler.arn
}
