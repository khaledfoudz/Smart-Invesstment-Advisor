resource "aws_s3_bucket" "smia_storage" {
  bucket        = "${var.s3_bucket_name}-${var.environment}"
  force_destroy = true # Allows terraform destroy to delete non-empty bucket

  tags = {
    Name = "${var.project_name}-${var.environment}-storage"
  }
}

# Block all public access (private bucket)
resource "aws_s3_bucket_public_access_block" "smia_storage_block" {
  bucket = aws_s3_bucket.smia_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning to protect against accidental deletes
resource "aws_s3_bucket_versioning" "smia_storage_versioning" {
  bucket = aws_s3_bucket.smia_storage.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "smia_storage_sse" {
  bucket = aws_s3_bucket.smia_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
