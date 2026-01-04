variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "socialvault"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
  default     = "socialvault-rg"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "SocialVault"
    ManagedBy   = "Terraform"
  }
}
