variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

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
    "reviews-service",
    "cart-service",
    "frontend"

  ]
}

variable "image_tag_mutability" {
  description = "Image tag mutability setting"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Scan images for vulnerabilities on push"
  type        = bool
  default     = true
}

variable "max_image_count" {
  description = "Maximum number of images to keep"
  type        = number
  default     = 10
}

variable "eks_node_role_arn" {
  description = "EKS node IAM role ARN for pull permissions"
  type        = string
  default     = "*"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}