output "s3_bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.main.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.main.arn
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.main.bucket
}

output "s3_bucket_region" {
  description = "S3 bucket region"
  value       = aws_s3_bucket.main.region
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.main.bucket_domain_name
}

output "sns_topic_arn" {
  description = "SNS topic ARN"
  value       = aws_sns_topic.main.arn
}

output "sns_topic_name" {
  description = "SNS topic name"
  value       = aws_sns_topic.main.name
}

output "sns_topic_id" {
  description = "SNS topic ID"
  value       = aws_sns_topic.main.id
}