output "instance_id" {
  description = "Jump server instance ID"
  value       = aws_instance.main.id
}

output "public_ip" {
  description = "Jump server public IP"
  value       = aws_eip.main.public_ip
}

output "private_ip" {
  description = "Jump server private IP"
  value       = aws_instance.main.private_ip
}

output "security_group_id" {
  description = "Jump server security group ID"
  value       = aws_security_group.main.id
}

output "iam_role_name" {
  description = "Jump server IAM role name"
  value       = aws_iam_role.main.name
}

output "iam_role_arn" {
  description = "Jump server IAM role ARN"
  value       = aws_iam_role.main.arn
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i ~/.ssh/${var.ssh_key_name}.pem ubuntu@${aws_eip.main.public_ip}"
}