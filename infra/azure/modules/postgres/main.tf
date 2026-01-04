resource "azurerm_private_dns_zone" "postgres" {
  name                = "${var.project_name}-${var.environment}-postgres.private.postgres.database.azure.com"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.project_name}-${var.environment}-postgres"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "15"
  delegated_subnet_id    = var.subnet_id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres.id
  administrator_login    = "psqladmin"
  administrator_password = "P@ssw0rd1234!" # TODO: Use Key Vault secret
  zone                   = "1"
  storage_mb             = var.storage_mb
  sku_name               = var.sku_name
  tags                   = var.tags

  depends_on = [azurerm_private_dns_zone.postgres]
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "socialvault"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
