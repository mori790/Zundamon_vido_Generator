const path = require('node:path');
const publicRelease = process.env.RELEASE_PUBLIC === '1';
const keychainProfile = process.env.APPLE_NOTARY_KEYCHAIN_PROFILE;
if (publicRelease && !keychainProfile) {
  throw new Error('APPLE_NOTARY_KEYCHAIN_PROFILEを設定してください。');
}

module.exports = {
  packagerConfig: {
    name: 'Zundamon Video Generator',
    executableName: 'zundamon-video-generator',
    appBundleId: 'com.tomimorisatoshihare.zundamon-video-generator',
    appCategoryType: 'public.app-category.video',
    buildVersion: require('./package.json').version,
    icon: path.join(__dirname, 'assets', 'app-icon'),
    asar: {
      unpack: '**/node_modules/@remotion/compositor-darwin-arm64/**',
    },
    ignore(file) {
      if (!file) return false;
      return ![
        '/package.json',
        '/dist-studio',
        '/node_modules',
      ].some(
        (allowed) => file === allowed || file.startsWith(`${allowed}/`),
      );
    },
    extendInfo: {
      LSMinimumSystemVersion: '13.0',
    },
    extraResource: [
      path.join(__dirname, 'dist-cli'),
      path.join(__dirname, 'dist-remotion'),
      path.join(__dirname, 'public'),
    ],
    osxSign: publicRelease ? {
      hardenedRuntime: true,
      entitlements: path.join(__dirname, 'assets', 'entitlements.plist'),
      entitlementsInherit: path.join(__dirname, 'assets', 'entitlements.plist'),
      'signature-flags': 'library',
    } : undefined,
    osxNotarize: publicRelease ? {
      tool: 'notarytool',
      keychainProfile,
    } : undefined,
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
};
