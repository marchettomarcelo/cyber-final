output "dev_instance_ip" {
  description = "Endereço IP da instância de desenvolvimento"
  value       = aws_instance.dev_instance.public_ip
}

output "db_instance_ip" {
  description = "Endereço IP da instância do banco de dados"
  value       = aws_instance.db_instance.private_ip
}

output "zabbix_instance_ip" {
  description = "Endereço IP da instância do Zabbix"
  value       = aws_instance.zabbix_instance.public_ip
}
