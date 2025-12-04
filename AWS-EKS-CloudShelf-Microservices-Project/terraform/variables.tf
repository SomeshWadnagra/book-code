# Global Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "cloudshelf"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "owner" {
  description = "Owner/Team name"
  type        = string
  default     = "DevOps"
}

# ==================== VPC Variables ====================
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones"
  type        = number
  default     = 3
}

# ==================== ECR Variables ====================
variable "service_names" {
  description = "List of microservice names"
  type        = list(string)
  default = [
    "api-gateway",
    "book-service",
    "author-service",
    "order-service",
    "stock-check-service",
    "message-service",
    "frontend",
    "reviews-service",
    "cart-service"
  ]
}

variable "ecr_image_tag_mutability" {
  description = "ECR image tag mutability"
  type        = string
  default     = "MUTABLE"
}

variable "ecr_scan_on_push" {
  description = "Scan images on push"
  type        = bool
  default     = true
}

variable "ecr_max_image_count" {
  description = "Max images to keep per repository"
  type        = number
  default     = 10
}

# ==================== VPC Endpoints Variables ====================
variable "enable_dynamodb_endpoint" {
  description = "Enable DynamoDB VPC endpoint"
  type        = bool
  default     = false
}

variable "enable_sns_endpoint" {
  description = "Enable SNS VPC endpoint"
  type        = bool
  default     = true
}

variable "enable_secrets_manager_endpoint" {
  description = "Enable Secrets Manager VPC endpoint"
  type        = bool
  default     = true
}

variable "enable_ssm_endpoint" {
  description = "Enable SSM VPC endpoint"
  type        = bool
  default     = true
}

# ==================== EKS Variables ====================
variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "cluster_endpoint_public_access" {
  description = "Enable public API endpoint"
  type        = bool
  default     = true
}

variable "cluster_endpoint_public_access_cidrs" {
  description = "CIDRs allowed to access public API"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "cluster_enabled_log_types" {
  description = "EKS control plane logs"
  type        = list(string)
  default     = ["api", "audit", "authenticator"]
}

variable "node_instance_types" {
  description = "EKS node instance types"
  type        = list(string)
  default     = ["t3.large"]
}

variable "node_capacity_type" {
  description = "EKS node capacity type (ON_DEMAND or SPOT)"
  type        = string
  default     = "ON_DEMAND"
}

variable "node_disk_size" {
  description = "EKS node disk size in GB"
  type        = number
  default     = 50
}

variable "node_group_desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 3
}

variable "node_group_min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 2
}

variable "node_group_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 6
}

variable "ssh_key_name" {
  description = "SSH key name for EC2 instances"
  type        = string
}

# ==================== Jump Server Variables ====================
variable "jump_server_ami_id" {
  description = "AMI ID for Jump Server (Ubuntu 24.04)"
  type        = string
  default     = "ami-0e2c8caa4b6378d8c" # us-east-1
}

variable "jump_server_instance_type" {
  description = "Jump Server instance type"
  type        = string
  default     = "t3.medium"
}

variable "jump_server_root_volume_size" {
  description = "Jump Server root volume size in GB"
  type        = number
  default     = 30
}

variable "allowed_ssh_cidrs" {
  description = "CIDRs allowed to SSH to Jump Server"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/Shantanumtk/AWS-CloudShelf-Microservices-Project"
}

variable "github_branch" {
  description = "GitHub branch"
  type        = string
  default     = "main"
}

# ==================== S3 & SNS Variables ====================
variable "s3_enable_versioning" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "s3_enable_lifecycle_policy" {
  description = "Enable S3 lifecycle policy"
  type        = bool
  default     = true
}

variable "s3_enable_notifications" {
  description = "Enable S3 event notifications"
  type        = bool
  default     = false
}

variable "s3_notification_events" {
  description = "S3 events to notify on"
  type        = list(string)
  default     = ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]
}

variable "notification_email" {
  description = "Email for SNS notifications (optional)"
  type        = string
  default     = ""
}

# ==================== RDS Variables (Optional) ====================
variable "enable_rds" {
  description = "Enable RDS module (for future services)"
  type        = bool
  default     = false
}

variable "rds_engine_version" {
  description = "PostgreSQL major version"
  type        = string
  default     = "16"
}

variable "rds_engine_minor_version" {
  description = "PostgreSQL minor version"
  type        = string
  default     = "1"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 100
}

variable "rds_max_allocated_storage" {
  description = "RDS max storage for autoscaling in GB"
  type        = number
  default     = 200
}

variable "rds_database_name" {
  description = "RDS initial database name"
  type        = string
  default     = "cloudshelf"
}

variable "rds_master_username" {
  description = "RDS master username"
  type        = string
  default     = "admin"
}

variable "rds_master_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "rds_backup_retention_period" {
  description = "RDS backup retention in days"
  type        = number
  default     = 7
}

variable "rds_backup_window" {
  description = "RDS backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "rds_maintenance_window" {
  description = "RDS maintenance window"
  type        = string
  default     = "mon:04:00-mon:05:00"
}

variable "rds_skip_final_snapshot" {
  description = "Skip final snapshot on destroy"
  type        = bool
  default     = false
}

variable "rds_deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "rds_enable_performance_insights" {
  description = "Enable Performance Insights"
  type        = bool
  default     = false
}

variable "rds_enable_cloudwatch_alarms" {
  description = "Enable CloudWatch alarms"
  type        = bool
  default     = true
}