variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_id" {
  description = "Public subnet ID for jump server"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for jump server (Ubuntu 24.04)"
  type        = string
  default     = "ami-0e2c8caa4b6378d8c" # Ubuntu 24.04 LTS in us-east-1
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "root_volume_size" {
  description = "Root volume size in GB"
  type        = number
  default     = 30
}

variable "ssh_key_name" {
  description = "SSH key name for instance access"
  type        = string
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "ecr_registry_url" {
  description = "ECR registry URL"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch"
  type        = string
  default     = "main"
}

variable "s3_bucket_arns" {
  description = "S3 bucket ARNs for access"
  type        = list(string)
  default     = ["*"]
}

variable "sns_topic_arns" {
  description = "SNS topic ARNs for access"
  type        = list(string)
  default     = ["*"]
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}