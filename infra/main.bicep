param location string = resourceGroup().location
param baseName string = 'socialswapr'
param appServiceSku string = 'B1'
param includeRedis bool = true
param cosmosLocation string = location

// Names
var acrName = toLower('${baseName}acr${uniqueString(resourceGroup().id)}')
var cosmosName = toLower('${baseName}cosmos${uniqueString(resourceGroup().id)}')
var planName = '${baseName}-plan'
var apiAppName = '${baseName}-api'
var webAppName = '${baseName}-web'
var redisName = toLower('${baseName}-redis')

// ACR
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
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
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.properties.loginServer}/backend:latest'
      appSettings: [
        { name: 'WEBSITES_PORT', value: '3001' }
        { name: 'DOCKER_REGISTRY_SERVER_URL', value: 'https://${acr.properties.loginServer}' }
        // Set these after deployment with real values
        { name: 'DOCKER_REGISTRY_SERVER_USERNAME', value: '' }
        { name: 'DOCKER_REGISTRY_SERVER_PASSWORD', value: '' }
        { name: 'DATABASE_URL', value: '' }
        { name: 'REDIS_URL', value: '' }
        { name: 'CLERK_SECRET_KEY', value: '' }
        { name: 'RAZORPAY_KEY_ID', value: '' }
        { name: 'RAZORPAY_KEY_SECRET', value: '' }
      ]
    }
    httpsOnly: true
  }
  dependsOn: [plan, acr]
}

// Frontend Web App (container)
resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: webAppName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.properties.loginServer}/frontend:latest'
      appSettings: [
        { name: 'WEBSITES_PORT', value: '3000' }
        { name: 'DOCKER_REGISTRY_SERVER_URL', value: 'https://${acr.properties.loginServer}' }
        // Set these after deployment with real values
        { name: 'DOCKER_REGISTRY_SERVER_USERNAME', value: '' }
        { name: 'DOCKER_REGISTRY_SERVER_PASSWORD', value: '' }
        { name: 'NEXT_PUBLIC_API_URL', value: 'https://${apiAppName}.azurewebsites.net' }
        { name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', value: '' }
        { name: 'CLERK_SECRET_KEY', value: '' }
      ]
    }
    httpsOnly: true
  }
  dependsOn: [plan, acr]
}

// Outputs
output acrLoginServer string = acr.properties.loginServer
output cosmosConnectionString string = listConnectionStrings(cosmos.name, '2023-11-15').connectionStrings[0].connectionString
output redisPrimaryKey string = includeRedis ? listKeys(redis.name, redis.apiVersion).primaryKey : ''
output redisHostname string = includeRedis ? redis.properties.hostName : ''
output apiUrl string = 'https://${apiAppName}.azurewebsites.net'
output webUrl string = 'https://${webAppName}.azurewebsites.net'
