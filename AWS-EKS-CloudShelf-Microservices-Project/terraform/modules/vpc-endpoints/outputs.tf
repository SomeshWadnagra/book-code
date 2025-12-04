output "security_group_id" {
  description = "Security group ID for VPC endpoints"
  value       = aws_security_group.endpoints.id
}

output "s3_endpoint_id" {
  description = "S3 VPC endpoint ID"
  value       = aws_vpc_endpoint.s3.id
}

output "ecr_api_endpoint_id" {
  description = "ECR API VPC endpoint ID"
  value       = aws_vpc_endpoint.ecr_api.id
}

output "ecr_dkr_endpoint_id" {
  description = "ECR Docker VPC endpoint ID"
  value       = aws_vpc_endpoint.ecr_dkr.id
}

output "ec2_endpoint_id" {
  description = "EC2 VPC endpoint ID"
  value       = aws_vpc_endpoint.ec2.id
}

output "eks_endpoint_id" {
  description = "EKS VPC endpoint ID"
  value       = aws_vpc_endpoint.eks.id
}

output "sts_endpoint_id" {
  description = "STS VPC endpoint ID"
  value       = aws_vpc_endpoint.sts.id
}

output "logs_endpoint_id" {
  description = "CloudWatch Logs VPC endpoint ID"
  value       = aws_vpc_endpoint.logs.id
}

output "sns_endpoint_id" {
  description = "SNS VPC endpoint ID"
  value       = var.enable_sns_endpoint ? aws_vpc_endpoint.sns[0].id : null
}

output "endpoint_dns_entries" {
  description = "DNS entries for interface endpoints"
  value = {
    ecr_api = aws_vpc_endpoint.ecr_api.dns_entry
    ecr_dkr = aws_vpc_endpoint.ecr_dkr.dns_entry
    ec2     = aws_vpc_endpoint.ec2.dns_entry
    eks     = aws_vpc_endpoint.eks.dns_entry
    sts     = aws_vpc_endpoint.sts.dns_entry
    logs    = aws_vpc_endpoint.logs.dns_entry
  }
}

output "elb_endpoint_id" {
  description = "Elastic Load Balancing VPC endpoint ID"
  value       = aws_vpc_endpoint.elasticloadbalancing.id
}