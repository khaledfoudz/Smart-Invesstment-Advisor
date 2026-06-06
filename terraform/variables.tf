variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Short name used to prefix all resource names"
  type        = string
  default     = "smia"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI for us-east-1 (update if region changes)"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS us-east-1
}

variable "key_pair_name" {
  description = "Name of an existing EC2 key pair for SSH access"
  type        = string
  default     = "smia-keypair"
}

variable "s3_bucket_name" {
  description = "Globally unique name for the S3 bucket (must be lowercase, no underscores)"
  type        = string
  default     = "smia-storage-bucket"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into the EC2 instance (restrict to your IP in prod)"
  type        = string
  default     = "0.0.0.0/0" # ⚠️ Lock this down to your IP for security
}
