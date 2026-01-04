terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.85"
    }
  }

  # Backend configuration - update with your actual backend
  backend "azurerm" {
    # resource_group_name  = "tfstate-rg"
    # storage_account_name = "tfstatesocialvault"
    # container_name       = "tfstate"
    # key                  = "socialvault.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}
