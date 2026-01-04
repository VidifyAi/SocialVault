output "redis_id" {
  description = "Redis cache ID"
  value       = azurerm_redis_cache.main.id
}

output "redis_hostname" {
  description = "Redis hostname"
  value       = azurerm_redis_cache.main.hostname
}

output "redis_primary_key" {
  description = "Redis primary access key"
  value       = azurerm_redis_cache.main.primary_access_key
  sensitive   = true
}
