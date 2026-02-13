import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Network from 'expo-network';
import { WifiOff } from 'lucide-react-native';

export const NetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        const checkConnection = async () => {
            const state = await Network.getNetworkStateAsync();
            setIsConnected(state.isConnected ?? false);
        };

        checkConnection();

        // Check periodically since expo-network doesn't have a listener in older SDKs or sometimes it's unreliable
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isConnected) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isConnected]);

    if (isConnected) return null;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.alertBar}>
                <WifiOff size={16} color="#FFFFFF" />
                <Text style={styles.text}>No Internet Connection. Some features may be unavailable.</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    alertBar: {
        flexDirection: 'row',
        backgroundColor: '#EF4444',
        paddingVertical: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
});
