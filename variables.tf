variable "aws_region" {
  description = "Região da AWS"
  default     = "us-east-1"
}

variable "dev_instance_type" {
  description = "Tipo de instância para o ambiente de desenvolvimento"
  default     = "t2.micro"
}

variable "db_instance_type" {
  description = "Tipo de instância para o banco de dados"
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI para as instâncias (Ubuntu 20.04)"
  default     = "ami-0c55b159cbfafe1f0"
}

variable "key_name" {
  description = "Nome da chave SSH"
  default     = "my-key"
}

variable "allowed_ssh_ip" {
  description = "Endereço IP permitido para SSH"
  default     = "0.0.0.0/0"
}
