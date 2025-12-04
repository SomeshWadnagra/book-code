# CloudShelf Terraform Infrastructure

This directory contains Terraform configurations to deploy CloudShelf microservices on AWS EC2 with Minikube.

## Prerequisites

- AWS CLI configured with credentials
- Terraform >= 1.0
- SSH key pair (will be created automatically if not exists)

## Quick Start
```bash
# Run from project root
./deploy-infrastructure.sh
```

## Manual Deployment
```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan \
  -var="key_name=cloudshelf-key" \
  -var="github_repo=https://github.com/Shantanumtk/AWS-CloudShelf-Microservices-Project.git"

# Apply changes
terraform apply \
  -var="key_name=cloudshelf-key" \
  -var="github_repo=https://github.com/Shantanumtk/AWS-CloudShelf-Microservices-Project.git"

# View outputs
terraform output
```

## Infrastructure Created

- VPC with public subnet
- Internet Gateway
- Security Group (SSH, HTTP, HTTPS, NodePort 30000-32767)
- EC2 Instance (t3.xlarge)
- Elastic IP
- IAM Role for SSM access

## Accessing the Instance
```bash
# Get SSH command
terraform output ssh_command

# Connect
ssh -i ~/.ssh/cloudshelf-key.pem ubuntu@$(terraform output -raw public_ip)
```

## Monitoring Deployment
```bash
# View deployment logs
ssh -i ~/.ssh/cloudshelf-key.pem ubuntu@$(terraform output -raw public_ip) \
  'tail -f /var/log/cloud-init-output.log'

# Check pod status
ssh -i ~/.ssh/cloudshelf-key.pem ubuntu@$(terraform output -raw public_ip) \
  'kubectl get pods -n cloudshelf'
```

## Cleanup
```bash
terraform destroy \
  -var="key_name=cloudshelf-key" \
  -var="github_repo=https://github.com/Shantanumtk/AWS-CloudShelf-Microservices-Project.git"
```

## Variables

| Variable | Default | Description |
|----------|---------|-------------|
| aws_region | us-east-1 | AWS region |
| project_name | cloudshelf | Project name |
| instance_type | t3.xlarge | EC2 instance type |
| root_volume_size | 50 | Root volume size in GB |
| key_name | cloudshelf-key | SSH key pair name |
| github_repo | [repo URL] | GitHub repository |
| github_branch | main | Git branch |

## Outputs

- `public_ip` - Elastic IP address
- `frontend_url` - Frontend application URL
- `api_gateway_url` - API Gateway URL
- `ssh_command` - SSH connection command
- Various monitoring commands

## Notes

- Deployment takes approximately 10-15 minutes
- Application will be available at port 32250
- All logs are available in `/var/log/` on the instance
```

---

## 📁 **Final Terraform Directory Structure**
```
terraform/
├── main.tf              # Main infrastructure configuration
├── variables.tf         # Input variables
├── outputs.tf          # Output values
├── user-data.sh        # EC2 startup script
├── .gitignore          # Git ignore file
└── README.md           # Documentation