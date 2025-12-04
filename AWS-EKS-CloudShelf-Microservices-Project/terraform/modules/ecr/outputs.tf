output "repository_urls" {
  description = "Map of service names to ECR repository URLs"
  value = {
    for name, repo in aws_ecr_repository.services :
    name => repo.repository_url
  }
}

output "repository_arns" {
  description = "Map of service names to ECR repository ARNs"
  value = {
    for name, repo in aws_ecr_repository.services :
    name => repo.arn
  }
}

output "repository_registry_ids" {
  description = "Map of service names to registry IDs"
  value = {
    for name, repo in aws_ecr_repository.services :
    name => repo.registry_id
  }
}

output "ecr_login_command" {
  description = "Command to login to ECR"
  value       = "aws ecr get-login-password --region ${data.aws_region.current.name} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com"
}

# Data sources for outputs
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}