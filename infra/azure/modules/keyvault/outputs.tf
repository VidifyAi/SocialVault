output "keyvault_id" {
  description = "Key Vault ID"
  value       = azurerm_key_vault.main.id
}

output "keyvault_uri" {
  description = "Key Vault URI"
  value       = azurerm_key_vault.main.vault_uri
}
