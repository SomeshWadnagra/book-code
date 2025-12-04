# S3 and SNS Module

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ==================== S3 BUCKET ====================

resource "aws_s3_bucket" "main" {
  bucket = "${var.project_name}-${data.aws_region.current.name}-${data.aws_caller_identity.current.account_id}"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-bucket"
    }
  )
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Disabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  count  = var.enable_lifecycle_policy ? 1 : 0
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "transition-old-versions"
    status = "Enabled"
    filter {}
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }
    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER"
    }
    noncurrent_version_expiration {
      noncurrent_days = 180
    }
  }

  rule {
    id     = "delete-old-incomplete-uploads"
    status = "Enabled"
    filter {}
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# ==================== SNS TOPIC ====================

resource "aws_sns_topic" "main" {
  name = "${var.project_name}-notifications"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-notifications"
    }
  )
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.notification_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.main.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

# ==================== S3 EVENT NOTIFICATIONS ====================

resource "aws_s3_bucket_notification" "main" {
  count  = var.enable_s3_notifications ? 1 : 0
  bucket = aws_s3_bucket.main.id

  topic {
    topic_arn = aws_sns_topic.main.arn
    events    = var.s3_notification_events
  }
}
