#!/bin/bash
set -e

exec > >(tee /var/log/jump-server-setup.log)
exec 2>&1

echo "[$(date)] Starting Jump Server setup..."

# Update system
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

# Install basic tools
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    jq \
    vim \
    htop \
    tree

# Install Docker
echo "[$(date)] Installing Docker..."
apt-get install -y docker.io
systemctl enable --now docker
usermod -aG docker ubuntu

# Install kubectl
echo "[$(date)] Installing kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/
kubectl version --client

# Install helm
echo "[$(date)] Installing Helm..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install eksctl
echo "[$(date)] Installing eksctl..."
curl -sLO "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"
tar -xzf eksctl_Linux_amd64.tar.gz -C /tmp
mv /tmp/eksctl /usr/local/bin
rm eksctl_Linux_amd64.tar.gz

# Install AWS CLI v2
echo "[$(date)] Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Configure AWS region
mkdir -p /root/.aws
cat > /root/.aws/config << EOF
[default]
region = ${aws_region}
output = json
EOF

mkdir -p /home/ubuntu/.aws
cat > /home/ubuntu/.aws/config << EOF
[default]
region = ${aws_region}
output = json
EOF
chown -R ubuntu:ubuntu /home/ubuntu/.aws

# Configure kubectl for EKS
echo "[$(date)] Configuring kubectl for EKS..."
su - ubuntu << 'UBUNTU_COMMANDS'
aws eks update-kubeconfig --region ${aws_region} --name ${cluster_name}
UBUNTU_COMMANDS

# Set environment variables
cat >> /home/ubuntu/.bashrc << 'BASHRC'
# CloudShelf Environment Variables
export AWS_REGION=${aws_region}
export EKS_CLUSTER_NAME=${cluster_name}
export ECR_REGISTRY=${ecr_registry}
export PROJECT_NAME=${project_name}

# Kubernetes aliases
alias k='kubectl'
alias kgp='kubectl get pods -n cloudshelf'
alias kgs='kubectl get services -n cloudshelf'
alias kgn='kubectl get nodes'
alias kgd='kubectl get deployments -n cloudshelf'
alias kdp='kubectl describe pod -n cloudshelf'
alias klf='kubectl logs -f -n cloudshelf'

# ECR login helper
ecr-login() {
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
}

# Deployment helper
deploy-cloudshelf() {
    cd ~/cloudshelf-deployment
    ./deploy-to-eks.sh
}
BASHRC

# Clone GitHub repository
echo "[$(date)] Cloning GitHub repository..."
su - ubuntu << 'UBUNTU_COMMANDS'
cd /home/ubuntu
if [ ! -d "cloudshelf-deployment" ]; then
    git clone ${github_repo} cloudshelf-deployment
    cd cloudshelf-deployment
    git checkout ${github_branch}
fi
UBUNTU_COMMANDS

# Create deployment directory
mkdir -p /home/ubuntu/cloudshelf-deployment/scripts
chown -R ubuntu:ubuntu /home/ubuntu/cloudshelf-deployment

# Create helpful README
cat > /home/ubuntu/README.md << 'README'
# CloudShelf Jump Server

## Quick Start

### Connect to EKS Cluster
```bash
kubectl get nodes
kubectl get pods -n cloudshelf
```

### Login to ECR
```bash
ecr-login
```

### Deploy Application
```bash
cd ~/cloudshelf-deployment
./deploy-to-eks.sh
```

## Available Tools
- kubectl (Kubernetes CLI)
- helm (Package manager)
- eksctl (EKS management)
- aws (AWS CLI)
- docker (Container runtime)

## Useful Aliases
- k = kubectl
- kgp = get pods in cloudshelf namespace
- kgs = get services in cloudshelf namespace
- kgn = get nodes
- kgd = get deployments in cloudshelf namespace

## Environment Variables
- AWS_REGION: ${aws_region}
- EKS_CLUSTER_NAME: ${cluster_name}
- ECR_REGISTRY: ${ecr_registry}
- PROJECT_NAME: ${project_name}

## Logs
Setup log: /var/log/jump-server-setup.log
README

chown ubuntu:ubuntu /home/ubuntu/README.md

echo "[$(date)] Jump Server setup complete!"
echo "[$(date)] Please logout and login again for group changes to take effect."