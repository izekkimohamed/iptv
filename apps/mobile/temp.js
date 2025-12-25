const withCleartextTraffic = require('./plugins/withCleartextTraffic');

export default {
  expo: {
    name: 'mobile',
    slug: 'mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/adaptive-icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.med0506.mobile',
    },
    android: {
      usesCleartextTraffic: true,
      intentFilters: [],
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#121212',
      },
      package: 'com.med0506.app',
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
        'INTERNET',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'server',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      withCleartextTraffic,
      [
        'expo-video',
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
        },
      ],
       [
      "expo-router",
      {
         "origin": "https://example.com"
      }
    ],
      [
        'expo-screen-orientation',
        {
          initialOrientation: 'DEFAULT',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/adaptive-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#121212',
        },
      ],
      [
          "expo-build-properties",
          {
            "android": {
              "enableProguardInReleaseBuilds": true,
              "enableShrinkResourcesInReleaseBuilds": true
            }
          }
        ],
      'expo-font',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "57223061-6ea8-4376-9093-96c186176a22",
      },
    },
  },
};
