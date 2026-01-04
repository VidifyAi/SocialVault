output "vnet_id" {
  description = "Virtual network ID"
  value       = azurerm_virtual_network.main.id
}

output "aks_subnet_id" {
  description = "AKS subnet ID"
  value       = azurerm_subnet.aks.id
}

output "postgres_subnet_id" {
  description = "PostgreSQL subnet ID"
  value       = azurerm_subnet.postgres.id
}

output "redis_subnet_id" {
  description = "Redis subnet ID"
  value       = azurerm_subnet.redis.id
}
