# Main Terraform Configuration - Ties All Modules Together

locals {
  project_name = var.project_name
  cluster_name = "${var.project_name}-eks"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}

# ==================== VPC MODULE ====================
module "vpc" {
  source = "./modules/vpc"

  project_name = local.project_name
  cluster_name = local.cluster_name
  vpc_cidr     = var.vpc_cidr
  az_count     = var.az_count

  tags = local.common_tags
}

# ==================== ECR MODULE ====================
module "ecr" {
  source = "./modules/ecr"

  project_name         = local.project_name
  service_names        = var.service_names
  image_tag_mutability = var.ecr_image_tag_mutability
  scan_on_push         = var.ecr_scan_on_push
  max_image_count      = var.ecr_max_image_count
  eks_node_role_arn    = "*" # Will be updated via policy later

  tags = local.common_tags

  depends_on = [module.vpc]
}

# ==================== VPC ENDPOINTS MODULE ====================
module "vpc_endpoints" {
  source = "./modules/vpc-endpoints"

  project_name            = local.project_name
  vpc_id                  = module.vpc.vpc_id
  vpc_cidr                = module.vpc.vpc_cidr
  aws_region              = var.aws_region
  private_subnet_ids      = module.vpc.private_subnet_ids
  public_route_table_id   = module.vpc.public_route_table_id
  private_route_table_ids = module.vpc.private_route_table_ids

  enable_dynamodb_endpoint        = var.enable_dynamodb_endpoint
  enable_sns_endpoint             = var.enable_sns_endpoint
  enable_secrets_manager_endpoint = var.enable_secrets_manager_endpoint
  enable_ssm_endpoint             = var.enable_ssm_endpoint

  tags = local.common_tags

  depends_on = [module.vpc]
}

# ==================== S3 & SNS MODULE (NO DEPENDENCIES) ====================
module "s3_sns" {
  source = "./modules/s3-sns"

  project_name = local.project_name

  enable_versioning       = var.s3_enable_versioning
  enable_lifecycle_policy = var.s3_enable_lifecycle_policy
  enable_s3_notifications = var.s3_enable_notifications
  s3_notification_events  = var.s3_notification_events

  notification_email = var.notification_email

  # Use wildcards instead of specific role ARNs to break circular dependency
  eks_node_role_arn    = "*"
  jump_server_role_arn = "*"

  tags = local.common_tags
}

# ==================== EKS MODULE ====================
module "eks" {
  source = "./modules/eks"

  project_name       = local.project_name
  cluster_name       = local.cluster_name
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids

  kubernetes_version                   = var.kubernetes_version
  cluster_endpoint_public_access       = var.cluster_endpoint_public_access
  cluster_endpoint_public_access_cidrs = var.cluster_endpoint_public_access_cidrs
  cluster_enabled_log_types            = var.cluster_enabled_log_types

  node_instance_types     = var.node_instance_types
  node_capacity_type      = var.node_capacity_type
  node_disk_size          = var.node_disk_size
  node_group_desired_size = var.node_group_desired_size
  node_group_min_size     = var.node_group_min_size
  node_group_max_size     = var.node_group_max_size

  ssh_key_name                  = var.ssh_key_name
  ssh_source_security_group_ids = []

  s3_bucket_arns = ["*"] # Wildcard to avoid circular dependency
  sns_topic_arns = ["*"] # Wildcard to avoid circular dependency

  tags = local.common_tags

  depends_on = [module.vpc, module.vpc_endpoints]
}

# Configure aws-auth ConfigMap for GitHub Actions access
resource "null_resource" "configure_aws_auth" {
  depends_on = [module.eks, module.jump_server]

  provisioner "local-exec" {
    command = <<-EOT
      aws eks update-kubeconfig --region ${var.aws_region} --name ${local.cluster_name}
      
      kubectl apply -f - <<EOF
      apiVersion: v1
      kind: ConfigMap
      metadata:
        name: aws-auth
        namespace: kube-system
      data:
        mapRoles: |
          - groups:
            - system:bootstrappers
            - system:nodes
            rolearn: ${module.eks.node_role_arn}
            username: system:node:{{EC2PrivateDNSName}}
          - groups:
            - system:masters
            rolearn: ${module.jump_server.iam_role_arn}
            username: jump-server-admin
        mapUsers: |
          - userarn: arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/gh-actions-cloudshelf
            username: gh-actions-cloudshelf
            groups:
              - system:masters
      EOF
    EOT
  }
}

# ==================== JUMP SERVER MODULE ====================
module "jump_server" {
  source = "./modules/jump-server"

  project_name = local.project_name
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = module.vpc.vpc_cidr
  subnet_id    = module.vpc.public_subnet_ids[0]

  ami_id            = var.jump_server_ami_id
  instance_type     = var.jump_server_instance_type
  root_volume_size  = var.jump_server_root_volume_size
  ssh_key_name      = var.ssh_key_name
  allowed_ssh_cidrs = var.allowed_ssh_cidrs

  aws_region       = var.aws_region
  cluster_name     = local.cluster_name
  ecr_registry_url = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
  github_repo      = var.github_repo
  github_branch    = var.github_branch

  s3_bucket_arns = ["*"] # Wildcard to avoid circular dependency
  sns_topic_arns = ["*"] # Wildcard to avoid circular dependency

  tags = local.common_tags

  depends_on = [module.vpc, module.eks]
}

# ==================== UPDATE IAM POLICIES AFTER CREATION ====================
# Update SNS topic policy with actual role ARNs
resource "aws_sns_topic_policy" "update_policy" {
  arn = module.s3_sns.sns_topic_arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid: "AllowS3Publish"
        Effect: "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action: "SNS:Publish"
        Resource: module.s3_sns.sns_topic_arn
        Condition = {
          ArnLike = {
            "aws:SourceArn": module.s3_sns.s3_bucket_arn
          }
        }
      },
      {
        Sid: "AllowEKSPublish"
        Effect: "Allow"
        Principal = {
          AWS: module.eks.node_role_arn
        }
        Action: "SNS:Publish"
        Resource: module.s3_sns.sns_topic_arn
      },
      {
        Sid: "AllowJumpServerPublish"
        Effect: "Allow"
        Principal = {
          AWS: module.jump_server.iam_role_arn
        }
        Action: "SNS:Publish"
        Resource: module.s3_sns.sns_topic_arn
      }
    ]
  })

  depends_on = [module.s3_sns, module.eks, module.jump_server]
}


# ==================== RDS MODULE (OPTIONAL) ====================
module "rds" {
  count  = var.enable_rds ? 1 : 0
  source = "./modules/rds"

  project_name       = local.project_name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids

  eks_node_security_group_ids    = [module.eks.node_security_group_id]
  jump_server_security_group_ids = [module.jump_server.security_group_id]

  engine_version        = var.rds_engine_version
  engine_minor_version  = var.rds_engine_minor_version
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage

  database_name   = var.rds_database_name
  master_username = var.rds_master_username
  master_password = var.rds_master_password

  backup_retention_period = var.rds_backup_retention_period
  backup_window           = var.rds_backup_window
  maintenance_window      = var.rds_maintenance_window
  skip_final_snapshot     = var.rds_skip_final_snapshot
  deletion_protection     = var.rds_deletion_protection

  enable_performance_insights = var.rds_enable_performance_insights
  enable_cloudwatch_alarms    = var.rds_enable_cloudwatch_alarms
  sns_topic_arn               = module.s3_sns.sns_topic_arn

  tags = local.common_tags
  eks_cluster_name = module.eks.cluster_name
  depends_on = [module.vpc, module.eks, module.jump_server]
}



# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}