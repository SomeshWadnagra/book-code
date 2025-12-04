# ==================== REQUIRED VARIABLES ====================
# Copy this file to terraform.tfvars and fill in your values
# cp terraform.tfvars.example terraform.tfvars

# AWS Configuration
aws_region   = "us-east-1"
project_name = "cloudshelf"
environment  = "prod"
owner        = "DevOps"

# SSH Key (Create first with: ssh-keygen -t rsa -b 4096 -f ~/.ssh/cloudshelf-key)
ssh_key_name = "cloudshelf-key"

# Your IP for SSH access (Get with: curl ifconfig.me)
allowed_ssh_cidrs = ["172.112.204.3/32"]  # Replace with your IP

# GitHub Configuration
github_repo   = "https://github.com/Shantanumtk/AWS-CloudShelf-Microservices-Project"
github_branch = "main"

# ==================== OPTIONAL - Email Notifications ====================
# Leave empty to skip
notification_email = "shamtk315@gmail.com" # e.g., "your-email@example.com"

# ==================== VPC CONFIGURATION ====================
vpc_cidr = "10.0.0.0/16"
az_count = 3

# ==================== EKS CONFIGURATION ====================
kubernetes_version = "1.34"

# EKS API Access
cluster_endpoint_public_access       = true
cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]

# EKS Logging (reduce for cost savings)
cluster_enabled_log_types = ["api", "audit", "authenticator"]

# Node Group Configuration
node_instance_types     = ["t3.large"]
node_capacity_type      = "ON_DEMAND" # or "SPOT" for cost savings
node_disk_size          = 50
node_group_desired_size = 3
node_group_min_size     = 2
node_group_max_size     = 6

# ==================== ECR CONFIGURATION ====================
service_names = [
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

ecr_image_tag_mutability = "MUTABLE"
ecr_scan_on_push         = true
ecr_max_image_count      = 10

# ==================== VPC ENDPOINTS ====================
enable_dynamodb_endpoint        = false # Enable if using DynamoDB
enable_sns_endpoint             = true
enable_secrets_manager_endpoint = true
enable_ssm_endpoint             = true

# ==================== JUMP SERVER ====================
jump_server_ami_id           = "ami-0e2c8caa4b6378d8c" # Ubuntu 24.04 LTS (us-east-1)
jump_server_instance_type    = "t3.medium"
jump_server_root_volume_size = 30

# ==================== S3 & SNS ====================
s3_enable_versioning       = true
s3_enable_lifecycle_policy = true
s3_enable_notifications    = false
s3_notification_events     = ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]

# ==================== RDS (OPTIONAL - FOR FUTURE) ====================
# Set to true when ready to use RDS instead of database containers
enable_rds = true

# RDS Configuration (only used if enable_rds = true)
rds_engine_version              = "16"
rds_engine_minor_version        = "4"
rds_instance_class              = "db.t3.micro"
rds_allocated_storage           = 20
rds_max_allocated_storage       = 50
rds_database_name               = "reviews_db"
rds_master_username             = "reviews_user"
rds_master_password             = "ReviewsSecure123!" # CHANGE THIS!
rds_backup_retention_period     = 7
rds_backup_window               = "03:00-04:00"
rds_maintenance_window          = "mon:04:00-mon:05:00"
rds_skip_final_snapshot         = true
rds_deletion_protection         = false
rds_enable_performance_insights = false
rds_enable_cloudwatch_alarms    = true