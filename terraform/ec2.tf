resource "aws_instance" "smia_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.smia_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.smia_profile.name

  # Bootstrap: install Docker + Docker Compose on first boot
  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    apt-get update -y
    apt-get upgrade -y

    # Install Docker
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
      gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Allow ubuntu user to run docker without sudo
    usermod -aG docker ubuntu

    # Enable Docker on startup
    systemctl enable docker
    systemctl start docker

    echo "SMIA EC2 bootstrap complete" >> /var/log/smia-init.log
  EOF

  root_block_device {
    volume_size           = 20    # GB — enough for Docker images
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-server"
  }
}
