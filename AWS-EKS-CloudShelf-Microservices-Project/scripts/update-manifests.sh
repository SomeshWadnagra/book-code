#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "CloudShelf - Update Kubernetes Manifests"
echo -e "==========================================${NC}"

# Get AWS Account ID and Region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo -e "${BLUE}AWS Account ID:${NC} $AWS_ACCOUNT_ID"
echo -e "${BLUE}AWS Region:${NC} $AWS_REGION"
echo -e "${BLUE}ECR Registry:${NC} $ECR_REGISTRY"
echo ""

# Navigate to kubernetes directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$SCRIPT_DIR/../spring-microservices-bookstore-demo/kubernetes"

if [ ! -d "$K8S_DIR" ]; then
    echo -e "${YELLOW}Error: Kubernetes directory not found at $K8S_DIR${NC}"
    exit 1
fi

cd "$K8S_DIR"

echo -e "${BLUE}Updating image references...${NC}"

# Update all deployment files
find 04-services -name "deployment.yaml" -type f | while read file; do
    echo "  Updating: $file"
    sed -i.bak "s|image: shpro123/|image: ${ECR_REGISTRY}/cloudshelf/|g" "$file"
    rm "${file}.bak"
done

echo -e "${GREEN}✅ Image references updated!${NC}"
echo ""

echo -e "${BLUE}Updated images:${NC}"
grep "image:" 04-services/*/deployment.yaml | head -n 7

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Manifests Updated Successfully!"
echo -e "==========================================${NC}"