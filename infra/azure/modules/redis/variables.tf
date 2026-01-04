variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet for Redis"
  type        = string
}

variable "sku_name" {
  description = "Redis SKU name"
  type        = string
}

variable "capacity" {
  description = "Redis capacity"
  type        = number
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
