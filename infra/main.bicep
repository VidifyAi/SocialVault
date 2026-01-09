param location string = resourceGroup().location
param baseName string = 'socialswapr'
param appServiceSku string = 'B1'
param includeRedis bool = true
param cosmosLocation string = location
// Optional overrides for URLs (set via GitHub/Azure deployment parameters)
param frontendUrlOverride string = ''
param apiBaseUrlOverride string = ''

// Names
var acrName = toLower('${baseName}acr${uniqueString(resourceGroup().id)}')
var cosmosName = toLower('${baseName}cosmos${uniqueString(resourceGroup().id)}')
var planName = '${baseName}-plan'
var apiAppName = '${baseName}-api'
var webAppName = '${baseName}-web'
var redisName = toLower('${baseName}-redis')

// Role definition ID for AcrPull
var acrPullRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')

// ACR
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Cosmos DB (Mongo API)
resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: cosmosName
  location: cosmosLocation
  kind: 'MongoDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: cosmosLocation
        failoverPriority: 0
        isZoneRedundant: false // avoid zonal placement issues in constrained regions
      }
    ]
    apiProperties: {
      serverVersion: '4.0'
    }
    capabilities: [
      {
        name: 'EnableMongo'
      }
    ]
  }
}

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-11-15' = {
  name: '${cosmos.name}/appdb'
  properties: {
    resource: {
      id: 'appdb'
    }
    options: {}
  }
  dependsOn: [cosmos]
}

// Redis (optional)
resource redis 'Microsoft.Cache/Redis@2023-08-01' = if (includeRedis) {
  name: redisName
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
  }
}

// App Service Plan (Linux)
resource plan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: planName
  location: location
  sku: {
    name: appServiceSku
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

// Backend Web App (container)
resource apiApp 'Microsoft.Web/sites@2022-09-01' = {
  name: apiAppName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.properties.loginServer}/backend:latest'
      acrUseManagedIdentityCreds: true
      healthCheckPath: '/health'
      appSettings: [
        { name: 'WEBSITES_PORT', value: '3001' }
        { name: 'DOCKER_REGISTRY_SERVER_URL', value: 'https://${acr.properties.loginServer}' }
        { name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE', value: 'false' }
        // Cosmos DB connection string (auto-populated from deployment output)
        { name: 'DATABASE_URL', value: listConnectionStrings(cosmos.id, '2023-11-15').connectionStrings[0].connectionString }
        // Redis connection string (if enabled)
        { name: 'REDIS_URL', value: includeRedis ? 'rediss://:${listKeys(redis.id, '2023-08-01').primaryKey}@${redis.properties.hostName}:6380' : '' }
        // Application secrets - set these manually in Azure Portal after deployment
        { name: 'CLERK_SECRET_KEY', value: '' }
        { name: 'RAZORPAY_KEY_ID', value: '' }
        { name: 'RAZORPAY_KEY_SECRET', value: '' }
        { name: 'FRONTEND_URL', value: frontendUrlOverride != '' ? frontendUrlOverride : 'https://${webAppName}.azurewebsites.net' }
      ]
    }
    httpsOnly: true
  }
  dependsOn: [plan, acr, cosmos]
}

// Role assignment for backend to pull from ACR
resource apiAppAcrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, apiApp.id, acrPullRoleDefinitionId)
  scope: acr
  properties: {
    principalId: apiApp.identity.principalId
    roleDefinitionId: acrPullRoleDefinitionId
    principalType: 'ServicePrincipal'
  }
}

// Frontend Web App (container)
resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: webAppName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.properties.loginServer}/frontend:latest'
      acrUseManagedIdentityCreds: true
      healthCheckPath: '/'
      appSettings: [
        { name: 'WEBSITES_PORT', value: '3000' }
        { name: 'DOCKER_REGISTRY_SERVER_URL', value: 'https://${acr.properties.loginServer}' }
        { name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE', value: 'false' }
        { name: 'NEXT_PUBLIC_API_URL', value: apiBaseUrlOverride != '' ? apiBaseUrlOverride : 'https://${apiAppName}.azurewebsites.net' }
        // Application secrets - set these manually in Azure Portal after deployment
        { name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', value: '' }
        { name: 'CLERK_SECRET_KEY', value: '' }
      ]
    }
    httpsOnly: true
  }
  dependsOn: [plan, acr]
}

// Role assignment for frontend to pull from ACR
resource webAppAcrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, webApp.id, acrPullRoleDefinitionId)
  scope: acr
  properties: {
    principalId: webApp.identity.principalId
    roleDefinitionId: acrPullRoleDefinitionId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output acrLoginServer string = acr.properties.loginServer
output cosmosConnectionString string = listConnectionStrings(cosmos.id, '2023-11-15').connectionStrings[0].connectionString
output redisPrimaryKey string = includeRedis ? listKeys(redis.id, '2023-08-01').primaryKey : ''
output redisHostname string = includeRedis ? redis.properties.hostName : ''
output apiUrl string = 'https://${apiAppName}.azurewebsites.net'
output webUrl string = 'https://${webAppName}.azurewebsites.net'
// Also expose app names and resource IDs for CLI workflows
output apiAppName string = apiAppName
output webAppName string = webAppName
output apiAppResourceId string = apiApp.id
output webAppResourceId string = webApp.id
