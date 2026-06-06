output "ec2_public_ip" {
  description = "Public IP address of the SMIA EC2 instance"
  value       = aws_instance.smia_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS hostname of the SMIA EC2 instance"
  value       = aws_instance.smia_server.public_dns
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.smia_server.id
}

output "s3_bucket_name" {
  description = "Name of the S3 storage bucket"
  value       = aws_s3_bucket.smia_storage.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the S3 storage bucket"
  value       = aws_s3_bucket.smia_storage.arn
}

output "security_group_id" {
  description = "ID of the SMIA security group"
  value       = aws_security_group.smia_sg.id
}

output "ssh_command" {
  description = "Ready-to-use SSH command to connect to the server"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_instance.smia_server.public_ip}"
}

output "app_urls" {
  description = "Application endpoint URLs"
  value = {
    frontend = "http://${aws_instance.smia_server.public_ip}"
    backend  = "http://${aws_instance.smia_server.public_ip}:4000"
    ml_api   = "http://${aws_instance.smia_server.public_ip}:8000"
    jenkins  = "http://${aws_instance.smia_server.public_ip}:8080"
    grafana  = "http://${aws_instance.smia_server.public_ip}:3000"
  }
}
