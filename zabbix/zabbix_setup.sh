#!/bin/bash
sudo apt update
sudo apt install -y apache2 php mysql-server zabbix-server-mysql zabbix-frontend-php zabbix-agent

sudo systemctl enable apache2
sudo systemctl start apache2
sudo systemctl enable zabbix-server
sudo systemctl start zabbix-server
sudo systemctl enable zabbix-agent
sudo systemctl start zabbix-agent
