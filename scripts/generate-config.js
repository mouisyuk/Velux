const fs = require('fs');
const path = require('path');
const packageConfig = require('../package.json');

/* eslint-disable no-console */

/**
 * Generate config
 * The object returned from this function will be made available by importing src/temp/config.js.
 * This is executed prior to the build running, so it's a way to inject environment or build config-specific
 * settings as variables into the JSS app.
 * NOTE! Any configs returned here will be written into the client-side JS bundle. DO NOT PUT SECRETS HERE.
 * @param {object} configOverrides Keys in this object will override any equivalent global config keys.
 */
module.exports = {
  generateRuntimeConfig,
  generateRenderingHostConfig,
  generateSitecoreProxyConfig,
};

function generateRuntimeConfig(configOverrides) {
  const standardConfig = resolveStandardConfig();

  const envConfigKeyMap = {
    SITECORE_API_HOST: 'sitecoreApiHost',
    SITECORE_API_KEY: 'sitecoreApiKey',
    SITECORE_GRAPHQL_ENDPOINT: 'graphQLEndpoint',
    SITECORE_GRAPHQL_ENDPOINT_PATH: 'graphQLEndpointPath',
    SITECORE_JSS_APP_NAME: 'jssAppName',
    SITECORE_JSS_DEFAULT_LANGUAGE: 'defaultLanguage',
    SITECORE_SITE_NAME: 'sitecoreSiteName',
  };

  const envConfig = resolveEnvConfig(envConfigKeyMap);

  const config = Object.assign(standardConfig, envConfig, configOverrides);

  const moduleFormats = [
    { exportStatement: 'export ', filename: 'config.js' },
    { exportStatement: 'module.exports = { getConfig };\n', filename: 'config.cjs.js' },
  ];
  moduleFormats.forEach((moduleFormat) => {
    const configText = `/* eslint-disable */
// Do not edit this file, it is auto-generated at build time!
// See scripts/generate-config.js to modify the generation of this file.
${moduleFormat.exportStatement} function getConfig() {
  const config = ${JSON.stringify(config, null, 2)};

  if (typeof window !== 'undefined' && typeof window.__NUXT__ !== 'undefined' && typeof window.__NUXT__.jssConfig !== 'undefined') {
    Object.assign(config, window.__NUXT__.jssConfig);
  }

  return config;
}`;

    const configPath = writeConfigFile(configText, moduleFormat.filename);
    console.log(`Runtime config written to ${configPath}`);
  });
}

function generateRenderingHostConfig(configOverrides) {
  const standardConfig = resolveStandardConfig();

  const envConfigKeyMap = {
    RENDERING_HOST_SITECORE_API_HOST: 'sitecoreApiHost',
    RENDERING_HOST_SITECORE_API_KEY: 'sitecoreApiKey',
    RENDERING_HOST_SITECORE_SITE_NAME: 'sitecoreSiteName',
  };

  const envConfig = resolveEnvConfig(envConfigKeyMap);

  const config = Object.assign(standardConfig, envConfig, configOverrides);

  const configText = `/* eslint-disable */
// Do not edit this file, it is auto-generated at build time!
// See scripts/generate-config.js to modify the generation of this file.
module.exports = { getConfig };
function getConfig() {
  const config = ${JSON.stringify(config, null, 2)};
  return config;
}`;

  const configPath = writeConfigFile(configText, 'jss-config-rendering-host.js');

  console.log(`Rendering Host config written to ${configPath}`);
}

function generateSitecoreProxyConfig(configOverrides) {
  const standardConfig = resolveStandardConfig();

  const envConfigKeyMap = {
    SITECORE_PROXY_SITECORE_API_HOST: 'sitecoreApiHost',
    SITECORE_PROXY_SITECORE_API_KEY: 'sitecoreApiKey',
    SITECORE_PROXY_SITECORE_SITE_NAME: 'sitecoreSiteName',
  };

  const envConfig = resolveEnvConfig(envConfigKeyMap);

  const config = Object.assign(standardConfig, envConfig, configOverrides);

  const configText = `/* eslint-disable */
// Do not edit this file, it is auto-generated at build time!
// See scripts/generate-config.js to modify the generation of this file.
module.exports = { getConfig };
function getConfig() {
  const config = ${JSON.stringify(config, null, 2)};
  return config;
}`;

  const configPath = writeConfigFile(configText, 'jss-config-sitecore-proxy.js');

  console.log(`Sitecore Proxy config written to ${configPath}`);
}

function resolveEnvConfig(envConfigKeyMap) {
  const envConfig = {};
  Object.keys(envConfigKeyMap).forEach((envConfigKey) => {
    if (process.env[envConfigKey]) {
      envConfig[envConfigKeyMap[envConfigKey]] = process.env[envConfigKey];
    }
  });

  return envConfig;
}

function resolveStandardConfig() {
  const defaultConfig = {
    sitecoreApiKey: 'no-api-key-set',
    sitecoreApiHost: '',
    jssAppName: 'Unknown',
  };

  // require + combine config sources
  const scjssConfig = transformScJssConfig();
  const packageJson = transformPackageConfig();

  // optional:
  // do any other dynamic config source (e.g. environment-specific config files)
  // Object.assign merges the objects in order, so the
  // package.json config can override the calculated config,
  // scjssconfig.json overrides it,
  // and finally config passed in the configOverrides param wins.
  const config = Object.assign(defaultConfig, packageJson, scjssConfig);

  // The GraphQL endpoint is an example of making a _computed_ config setting
  // based on other config settings.
  addGraphQLConfig(config);

  return config;
}

function transformScJssConfig() {
  // scjssconfig.json may not exist if you've never run setup
  // so if it doesn't we substitute a fake object
  let config;
  try {
    // eslint-disable-next-line global-require
    config = require('../scjssconfig.json');
  } catch (e) {
    return {};
  }

  if (!config) return {};

  return {
    sitecoreApiKey: config.sitecore.apiKey,
    sitecoreApiHost: config.sitecore.layoutServiceHost,
  };
}

function transformPackageConfig() {
  if (!packageConfig.config) {
    return {};
  }

  return {
    jssAppName: packageConfig.config.appName,
    // Typically, app name and site name will be the same, but sometimes they're not.
    // And that causes all sorts of unpleasantness. So we allow for separate config values.
    sitecoreSiteName: packageConfig.config.sitecoreSiteName || packageConfig.config.appName,
    defaultLanguage: packageConfig.config.language || 'en',
    graphQLEndpointPath: packageConfig.config.graphQLEndpointPath || null,
    appLanguages: packageConfig.config.appLanguages || [packageConfig.config.language || 'en'],
  };
}

/**
 * Adds the GraphQL endpoint URL to the config object, and ensures that components needed to calculate it are valid
 */
function addGraphQLConfig(baseConfig) {
  if (!baseConfig.graphQLEndpointPath || typeof baseConfig.sitecoreApiHost === 'undefined') {
    console.error(
      'The `graphQLEndpointPath` and/or `layoutServiceHost` configurations were not defined. You may need to run `jss setup`.'
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-param-reassign
  baseConfig.graphQLEndpoint = `${baseConfig.sitecoreApiHost}${baseConfig.graphQLEndpointPath}?sc_apikey=${baseConfig.sitecoreApiKey}`;
}

function writeConfigFile(configData, filename) {
  const configPath = path.resolve(`temp/${filename}`);

  fs.writeFileSync(configPath, configData, { encoding: 'utf8' });

  return configPath;
}
