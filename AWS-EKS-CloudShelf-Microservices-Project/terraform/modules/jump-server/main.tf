# Jump Server Module - Bastion Host

# Jump Server Security Group
resource "aws_security_group" "main" {
  name_prefix = "${var.project_name}-jump-server-"
  description = "Security group for Jump Server"
  vpc_id      = var.vpc_id

  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
    description = "SSH access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-jump-server-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Jump Server IAM Role
resource "aws_iam_role" "main" {
  name = "${var.project_name}-jump-server-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

# IAM Policy for Jump Server
resource "aws_iam_policy" "main" {
  name        = "${var.project_name}-jump-server-policy"
  description = "Policy for Jump Server"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters",
          "eks:DescribeNodegroup",
          "eks:ListNodegroups"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:DescribeRepositories",
          "ecr:ListImages"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:*"
        ]
        Resource = var.s3_bucket_arns
      },
      {
        Effect = "Allow"
        Action = [
          "sns:*"
        ]
        Resource = var.sns_topic_arns
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "main" {
  policy_arn = aws_iam_policy.main.arn
  role       = aws_iam_role.main.name
}

# SSM for Session Manager (optional but recommended)
resource "aws_iam_role_policy_attachment" "ssm" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = aws_iam_role.main.name
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "main" {
  name = "${var.project_name}-jump-server-profile"
  role = aws_iam_role.main.name

  tags = var.tags
}

locals {
  user_data = templatefile("${path.module}/user-data.sh", {
    aws_region     = var.aws_region
    cluster_name   = var.cluster_name
    ecr_registry   = var.ecr_registry_url
    github_repo    = var.github_repo
    github_branch  = var.github_branch
    project_name   = var.project_name
  })
}

# Jump Server EC2 Instance
resource "aws_instance" "main" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.ssh_key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.main.id]
  iam_instance_profile   = aws_iam_instance_profile.main.name

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  user_data = local.user_data 

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-jump-server"
    }
  )

  depends_on = [
    aws_iam_instance_profile.main
  ]
}

# Elastic IP for Jump Server
resource "aws_eip" "main" {
  instance = aws_instance.main.id
  domain   = "vpc"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-jump-server-eip"
    }
  )
}