const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

/**
 * react-native-track-player ships its own AndroidManifest with the playback
 * service and FOREGROUND_SERVICE permissions, which autolinking merges in.
 * Android 13+ additionally requires POST_NOTIFICATIONS to show the media
 * notification, which is added here.
 */
const withTrackPlayer = (config) => {
  config = AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.POST_NOTIFICATIONS',
  ]);

  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    return config;
  });
};

module.exports = withTrackPlayer;
