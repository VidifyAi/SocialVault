resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-${var.project_name}-${var.environment}"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "15"
  delegated_subnet_id    = var.subnet_id
  administrator_login    = "psqladmin"
  administrator_password = "P@ssw0rd123!" # Use Key Vault or variables in production
  zone                   = "1"

  storage_mb = 32768

  sku_name = "B_Standard_B1ms"

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "socialvault"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}
