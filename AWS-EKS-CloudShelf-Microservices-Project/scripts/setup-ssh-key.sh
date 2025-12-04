#!/bin/bash
set -e

KEY_NAME="cloudshelf-key"
REGION="us-east-1"
SSH_DIR="$HOME/.ssh"
PRIVATE_KEY="$SSH_DIR/$KEY_NAME"
PUBLIC_KEY="$SSH_DIR/$KEY_NAME.pub"

echo "=========================================="
echo "CloudShelf SSH Key Setup"
echo "=========================================="

# Create .ssh directory
mkdir -p "$SSH_DIR"

# Check if key already exists locally
if [ -f "$PRIVATE_KEY" ]; then
    echo "✅ SSH key already exists locally: $PRIVATE_KEY"
else
    echo "🔑 Generating new SSH key..."
    ssh-keygen -t rsa -b 4096 -f "$PRIVATE_KEY" -N "" -C "$KEY_NAME"
    echo "✅ SSH key generated"
fi

# Set permissions
chmod 400 "$PRIVATE_KEY"
chmod 644 "$PUBLIC_KEY"
echo "✅ Permissions set"

# Check if key exists in AWS
echo "🔍 Checking AWS for key '$KEY_NAME'..."
if aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" &>/dev/null; then
    echo "⚠️  Key '$KEY_NAME' already exists in AWS"
    read -p "Delete and recreate? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        aws ec2 delete-key-pair --key-name "$KEY_NAME" --region "$REGION"
        echo "🗑️  Deleted old key from AWS"
        
        aws ec2 import-key-pair \
            --key-name "$KEY_NAME" \
            --public-key-material fileb://"$PUBLIC_KEY" \
            --region "$REGION"
        echo "✅ New key imported to AWS"
    fi
else
    echo "📤 Importing key to AWS..."
    aws ec2 import-key-pair \
        --key-name "$KEY_NAME" \
        --public-key-material fileb://"$PUBLIC_KEY" \
        --region "$REGION"
    echo "✅ Key imported to AWS"
fi

echo ""
echo "=========================================="
echo "✅ SSH Key Setup Complete!"
echo "=========================================="
echo "Private Key: $PRIVATE_KEY"
echo "Public Key:  $PUBLIC_KEY"
echo "AWS Key Name: $KEY_NAME"
echo ""
echo "Add this to terraform.tfvars:"
echo "ssh_key_name = \"$KEY_NAME\""
echo ""
echo "=========================================="