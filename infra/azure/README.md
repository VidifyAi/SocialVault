# SocialVault Azure Infrastructure

Terraform configuration for deploying SocialVault to Azure.

## Architecture

The infrastructure includes:

- **Virtual Network**: Private network with subnets for AKS and PostgreSQL
- **Azure Container Registry (ACR)**: Container image registry
- **Azure Kubernetes Service (AKS)**: Managed Kubernetes cluster
- **PostgreSQL Flexible Server**: Managed PostgreSQL database
- **Redis Cache**: Managed Redis cache
- **Key Vault**: Secrets management
- **Storage Account**: Blob storage for media files

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.7.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Azure subscription with appropriate permissions

## Configuration

### Backend Setup

Before using this infrastructure, configure the Terraform backend in `main.tf`:

```hcl
backend "azurerm" {
  resource_group_name  = "tfstate-rg"
  storage_account_name = "tfstatesocialvault"
  container_name       = "tfstate"
  key                  = "socialvault.tfstate"
}
```

### Variables

Key variables in `variables.tf`:

- `project_name`: Project name (default: "socialvault")
- `environment`: Environment name (default: "dev")
- `location`: Azure region (default: "eastus")
- `aks_node_count`: Number of AKS nodes (default: 2)
- `aks_node_vm_size`: AKS node VM size (default: "Standard_B2s")

Create a `terraform.tfvars` file for custom values:

```hcl
project_name = "socialvault"
environment  = "prod"
location     = "eastus"
aks_node_count = 3
```

## Deployment

### 1. Login to Azure

```bash
az login
az account set --subscription <subscription-id>
```

### 2. Initialize Terraform

```bash
cd infra/azure
terraform init
```

### 3. Plan Changes

```bash
terraform plan
```

### 4. Apply Changes

```bash
terraform apply
```

### 5. View Outputs

```bash
terraform output
```

## Modules

### Network Module

Creates:
- Virtual Network
- AKS subnet
- PostgreSQL subnet with delegation

### ACR Module

Creates:
- Container Registry
- Admin credentials

### AKS Module

Creates:
- Kubernetes cluster
- System-assigned identity
- ACR pull role assignment

### PostgreSQL Module

Creates:
- PostgreSQL Flexible Server (v15)
- Private DNS zone
- Database

### Redis Module

Creates:
- Redis Cache
- TLS 1.2 enabled

### Key Vault Module

Creates:
- Key Vault
- Access policies

### Storage Module

Creates:
- Storage Account
- Upload container (private)
- Media container (blob access)

## Outputs

After deployment, Terraform outputs:

- `resource_group_name`: Resource group name
- `vnet_id`: Virtual network ID
- `acr_login_server`: ACR login server URL
- `aks_cluster_name`: AKS cluster name
- `postgres_fqdn`: PostgreSQL FQDN (sensitive)
- `redis_hostname`: Redis hostname (sensitive)
- `key_vault_uri`: Key Vault URI
- `storage_account_name`: Storage account name

## CI/CD Integration

The `.github/workflows/terraform-plan.yml` workflow:

1. Authenticates to Azure using OIDC
2. Runs Terraform format check
3. Initializes Terraform
4. Validates configuration
5. Runs Terraform plan
6. Comments plan on PR

### Required GitHub Secrets

Configure these in GitHub repository settings:

- `AZURE_CLIENT_ID`: Azure service principal client ID
- `AZURE_TENANT_ID`: Azure tenant ID
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID

## Security Considerations

- PostgreSQL uses private subnet with delegation
- Redis requires TLS 1.2+
- Key Vault has soft delete enabled
- Storage accounts use minimum TLS 1.2
- AKS uses Azure CNI and network policies
- ACR admin credentials should be rotated regularly

## Cost Optimization

Default configuration uses cost-effective resources:

- **AKS**: B-series VMs (burstable)
- **PostgreSQL**: B-series (burstable)
- **Redis**: Basic tier
- **Storage**: LRS replication

For production, consider:
- Increase AKS node size and count
- Use PostgreSQL GP or MO tiers
- Use Redis Standard/Premium tier
- Use ZRS/GRS storage replication

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all resources including databases!

## Troubleshooting

### AKS Node Pool Errors

If AKS node pool fails to create, check:
- Subnet has enough IP addresses
- VM size is available in the region

### PostgreSQL Connection Issues

- Verify private DNS zone is linked to VNet
- Check subnet delegation
- Verify firewall rules

### ACR Pull Issues

- Verify AKS has AcrPull role assignment
- Check ACR admin credentials

## License

MIT
