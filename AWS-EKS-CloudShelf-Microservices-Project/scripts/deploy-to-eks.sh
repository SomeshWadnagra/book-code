#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "CloudShelf - Deploy to EKS"
echo -e "==========================================${NC}"

# Navigate to kubernetes directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$SCRIPT_DIR/../spring-microservices-bookstore-demo/kubernetes"

if [ ! -d "$K8S_DIR" ]; then
    echo -e "${RED}Error: Kubernetes directory not found${NC}"
    exit 1
fi

cd "$K8S_DIR"

# Verify kubectl connection
echo -e "${BLUE}Verifying cluster connection...${NC}"
if ! kubectl cluster-info &>/dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    echo "Run: aws eks update-kubeconfig --region us-east-1 --name cloudshelf-eks"
    exit 1
fi

kubectl get nodes
echo ""

# Deploy namespace
echo -e "${BLUE}1. Deploying namespace...${NC}"
kubectl apply -f 00-namespace/
echo ""

# Deploy secrets
echo -e "${BLUE}2. Deploying secrets...${NC}"
kubectl apply -f 02-secrets/
echo ""

# Deploy ConfigMaps
echo -e "${BLUE}3. Deploying ConfigMaps...${NC}"
kubectl apply -f 01-configmaps/
echo ""

# Deploy infrastructure
echo -e "${BLUE}4. Deploying infrastructure (MongoDB, Kafka, Zipkin)...${NC}"
kubectl apply -f 03-infrastructure/

echo -e "${YELLOW}Waiting for MongoDB to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=mongodb -n cloudshelf --timeout=300s || true

echo -e "${YELLOW}Waiting for Kafka to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=kafka -n cloudshelf --timeout=300s || true

echo -e "${GREEN}✅ Infrastructure ready${NC}"
echo ""

# Deploy services
echo -e "${BLUE}5. Deploying microservices...${NC}"
kubectl apply -f 04-services/

echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 30

echo ""

# Deploy ingress
echo -e "${BLUE}6. Deploying ingress...${NC}"
kubectl apply -f 05-ingress/
echo ""

# Wait for deployments
echo -e "${BLUE}7. Waiting for deployments...${NC}"
kubectl wait --for=condition=available --timeout=600s \
    deployment/api-gateway \
    deployment/book-service \
    deployment/author-service \
    deployment/order-service \
    deployment/stock-check-service \
    deployment/message-service \
    deployment/frontend \
    -n cloudshelf || true

echo ""

# Show status
echo -e "${BLUE}=========================================="
echo "Deployment Status"
echo -e "==========================================${NC}"

echo -e "${BLUE}Pods:${NC}"
kubectl get pods -n cloudshelf

echo ""
echo -e "${BLUE}Services:${NC}"
kubectl get services -n cloudshelf

echo ""
echo -e "${BLUE}Deployments:${NC}"
kubectl get deployments -n cloudshelf

echo ""
echo -e "${BLUE}Ingress:${NC}"
kubectl get ingress -n cloudshelf

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Deployment Complete!"
echo -e "==========================================${NC}"

# Get Load Balancer URL
echo ""
echo -e "${BLUE}Getting Application URL...${NC}"
sleep 10

LB_URL=$(kubectl get ingress cloudshelf-ingress -n cloudshelf -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ -n "$LB_URL" ]; then
    echo -e "${GREEN}🌐 Application URL: http://$LB_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Load Balancer URL not ready yet.${NC}"
    echo "Check later with: kubectl get ingress -n cloudshelf"
fi

echo ""