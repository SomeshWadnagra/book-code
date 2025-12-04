variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

# S3 Variables
variable "enable_versioning" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = true
}

variable "enable_lifecycle_policy" {
  description = "Enable S3 lifecycle policy"
  type        = bool
  default     = true
}

variable "enable_s3_notifications" {
  description = "Enable S3 event notifications to SNS"
  type        = bool
  default     = false
}

variable "s3_notification_events" {
  description = "S3 events to send notifications for"
  type        = list(string)
  default     = ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]
}

# SNS Variables
variable "notification_email" {
  description = "Email address for SNS notifications (leave empty to skip)"
  type        = string
  default     = "shamtk315@gmail.com"
}

# IAM Variables
variable "eks_node_role_arn" {
  description = "EKS node IAM role ARN"
  type        = string
  default     = "*"
}

variable "jump_server_role_arn" {
  description = "Jump server IAM role ARN"
  type        = string
  default     = "*"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}