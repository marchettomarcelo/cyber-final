provider "aws" {
  region = var.aws_region
}

# Security Group para Desenvolvimento
resource "aws_security_group" "dev_sg" {
  name        = "dev-sg"
  description = "Security Group para ambiente de desenvolvimento"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group para Banco de Dados
resource "aws_security_group" "db_sg" {
  name        = "db-sg"
  description = "Security Group para banco de dados"

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Instância de Desenvolvimento
resource "aws_instance" "dev_instance" {
  ami           = var.ami_id
  instance_type = var.dev_instance_type
  key_name      = var.key_name
  security_groups = [aws_security_group.dev_sg.name]

  tags = {
    Name = "Dev-Instance"
  }
}

# Instância de Banco de Dados
resource "aws_instance" "db_instance" {
  ami           = var.ami_id
  instance_type = var.db_instance_type
  key_name      = var.key_name
  security_groups = [aws_security_group.db_sg.name]

  tags = {
    Name = "DB-Instance"
  }
}

# Instância para Zabbix Server
resource "aws_instance" "zabbix_instance" {
  ami           = var.ami_id
  instance_type = "t2.micro"
  key_name      = var.key_name
  security_groups = [aws_security_group.dev_sg.name]

  user_data = file("zabbix/zabbix_setup.sh")

  tags = {
    Name = "Zabbix-Server"
  }
}
