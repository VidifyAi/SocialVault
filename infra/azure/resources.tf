resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.region
  tags     = var.tags
}

# Network Module
module "network" {
  source = "./modules/network"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  tags                = var.tags
}

# Container Registry Module
module "acr" {
  source = "./modules/acr"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  tags                = var.tags
}

# Azure Kubernetes Service Module
module "aks" {
  source = "./modules/aks"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  subnet_id           = module.network.aks_subnet_id
  tags                = var.tags
}

# PostgreSQL Flexible Server Module
module "postgres" {
  source = "./modules/postgres"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  subnet_id           = module.network.postgres_subnet_id
  tags                = var.tags
}

# Redis Cache Module
module "redis" {
  source = "./modules/redis"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  subnet_id           = module.network.redis_subnet_id
  tags                = var.tags
}

# Key Vault Module
module "keyvault" {
  source = "./modules/keyvault"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  tags                = var.tags
}

# Storage Account Module
module "storage" {
  source = "./modules/storage"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  tags                = var.tags
}
