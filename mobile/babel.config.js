module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    alias: {
                        'react-native-worklets/plugin': require.resolve('react-native-worklets/plugin'),
                    },
                },
            ],
            // Note: Reanimated is handled by babel-preset-expo in standard configurations.
            // If the preset fails to load it, we would add it here, but adding it explicitly
            // can cause "Duplicate plugin detected" errors.
        ],
    };
};
