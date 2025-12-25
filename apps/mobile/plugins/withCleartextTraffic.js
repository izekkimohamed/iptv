const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = (config) => {
  // 1. Add the config file to Android resources
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const resXmlDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      if (!fs.existsSync(resXmlDir)) {
        fs.mkdirSync(resXmlDir, { recursive: true });
      }
      const srcFile = path.join(config.modRequest.projectRoot, 'plugins/network_security_config.xml');
      const destFile = path.join(resXmlDir, 'network_security_config.xml');
      fs.copyFileSync(srcFile, destFile);
      return config;
    },
  ]);

  // 2. Link it in the Manifest
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    mainApplication.$['android:usesCleartextTraffic'] = 'true';
    return config;
  });
};
