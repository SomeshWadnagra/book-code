# Get OIDC provider from EKS module
data "aws_iam_openid_connect_provider" "eks" {
  arn = module.eks.oidc_provider_arn
}

# IAM Role for message-service to publish SNS
resource "aws_iam_role" "message_service_sns_role" {
  name = "${local.project_name}-message-service-sns-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Federated = module.eks.oidc_provider_arn
        },
        Action = "sts:AssumeRoleWithWebIdentity",
        Condition = {
          StringEquals = {
            "${module.eks.oidc_provider_url}:sub" = "system:serviceaccount:cloudshelf:message-service-sa"
          }
        }
      }
    ]
  })
}

# SNS Publish Permissions
resource "aws_iam_policy" "message_service_sns_policy" {
  name        = "${local.project_name}-message-service-sns-policy"
  description = "SNS publish permission for message-service"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "sns:Publish"
        ],
        Resource = module.s3_sns.sns_topic_arn
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "message_service_sns_attach" {
  role       = aws_iam_role.message_service_sns_role.name
  policy_arn = aws_iam_policy.message_service_sns_policy.arn
}
