# ==================== VPC Outputs ====================
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

# ==================== ECR Outputs ====================
output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

output "ecr_login_command" {
  description = "ECR login command"
  value       = module.ecr.ecr_login_command
}

# ==================== EKS Outputs ====================
output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_version" {
  description = "EKS cluster Kubernetes version"
  value       = module.eks.cluster_version
}

output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value       = module.eks.kubeconfig_command
}

# ==================== Jump Server Outputs ====================
output "jump_server_public_ip" {
  description = "Jump Server public IP"
  value       = module.jump_server.public_ip
}

output "jump_server_ssh_command" {
  description = "SSH command to connect to Jump Server"
  value       = module.jump_server.ssh_command
}

# ==================== S3 & SNS Outputs ====================
output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.s3_sns.s3_bucket_name
}

output "sns_topic_arn" {
  description = "SNS topic ARN"
  value       = module.s3_sns.sns_topic_arn
}

# ==================== RDS Outputs (if enabled) ====================
output "rds_endpoint" {
  description = "RDS endpoint"
  value       = var.enable_rds ? module.rds[0].db_instance_endpoint : "RDS not enabled"
}

output "rds_secret_name" {
  description = "RDS credentials secret name"
  value       = var.enable_rds ? module.rds[0].secret_name : "RDS not enabled"
}

# ==================== Quick Start Guide ====================
output "quick_start_guide" {
  description = "Quick start guide"
  value       = <<-EOT
    
    ════════════════════════════════════════════════════════════════
    ✅ CloudShelf EKS Infrastructure Deployed Successfully!
    ════════════════════════════════════════════════════════════════
    
    📋 NEXT STEPS:
    
    1️⃣  Connect to Jump Server:
       ${module.jump_server.ssh_command}
    
    2️⃣  Verify EKS Cluster:
       kubectl get nodes
    
    3️⃣  Login to ECR:
       ${module.ecr.ecr_login_command}
    
    4️⃣  Check Resources:
       kubectl get all -n cloudshelf
    
    ════════════════════════════════════════════════════════════════
    📊 RESOURCE INFORMATION:
    
    VPC ID:           ${module.vpc.vpc_id}
    EKS Cluster:      ${module.eks.cluster_name}
    S3 Bucket:        ${module.s3_sns.s3_bucket_name}
    SNS Topic:        ${module.s3_sns.sns_topic_arn}
    Jump Server IP:   ${module.jump_server.public_ip}
    
    ════════════════════════════════════════════════════════════════
  EOT
}

output "message_service_sns_role_arn" {
  description = "IAM role ARN for message-service SNS access"
  value       = aws_iam_role.message_service_sns_role.arn
}