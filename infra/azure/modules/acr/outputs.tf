output "acr_id" {
  description = "Container registry ID"
  value       = azurerm_container_registry.main.id
}

output "acr_login_server" {
  description = "Container registry login server"
  value       = azurerm_container_registry.main.login_server
}
