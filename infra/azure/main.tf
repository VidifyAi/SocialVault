terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }

  # Backend configuration - update with your values
  backend "azurerm" {
    # resource_group_name  = "terraform-state-rg"
    # storage_account_name = "tfstatesocialvault"
    # container_name       = "tfstate"
    # key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}
