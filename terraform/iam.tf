# Trust policy: allows EC2 to assume this role
data "aws_iam_policy_document" "smia_ec2_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# The IAM role itself
resource "aws_iam_role" "smia_ec2_role" {
  name               = "${var.project_name}-${var.environment}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.smia_ec2_assume_role.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-role"
  }
}

# Inline policy: S3 read/write for our bucket only
resource "aws_iam_role_policy" "smia_s3_access" {
  name = "smia-s3-access"
  role = aws_iam_role.smia_ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.smia_storage.arn,
          "${aws_s3_bucket.smia_storage.arn}/*"
        ]
      }
    ]
  })
}

# Attach SSM policy so you can shell in via AWS Console without SSH if needed
resource "aws_iam_role_policy_attachment" "smia_ssm" {
  role       = aws_iam_role.smia_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile wraps the role so EC2 can use it
resource "aws_iam_instance_profile" "smia_profile" {
  name = "${var.project_name}-${var.environment}-profile"
  role = aws_iam_role.smia_ec2_role.name
}
