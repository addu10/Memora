// Welcome/Landing Screen - Elderly-Friendly Design
import { Link } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    return (
        <View style={styles.container}>
            {/* Hero Section */}
            <View style={styles.hero}>
                <Text style={styles.logo}>🧠</Text>
                <Text style={styles.title}>Memora</Text>
                <Text style={styles.subtitle}>
                    Memory Therapy{'\n'}Made Simple
                </Text>
            </View>

            {/* Simple Features */}
            <View style={styles.features}>
                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>👤</Text>
                    <Text style={styles.featureText}>Recognize{'\n'}Family</Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>📷</Text>
                    <Text style={styles.featureText}>View{'\n'}Memories</Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>💬</Text>
                    <Text style={styles.featureText}>Therapy{'\n'}Sessions</Text>
                </View>
            </View>

            {/* Large Buttons */}
            <View style={styles.buttonContainer}>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity style={styles.primaryButton} accessibilityLabel="Start using the app">
                        <Text style={styles.primaryButtonText}>Start</Text>
                    </TouchableOpacity>
                </Link>

                <Link href="/(app)/home" asChild>
                    <TouchableOpacity style={styles.secondaryButton} accessibilityLabel="Continue without logging in">
                        <Text style={styles.secondaryButtonText}>Skip Login</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                Made with ❤️ for Kerala's elders
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f9ff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 100,
        marginBottom: 16,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 22,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 32,
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 48,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        minHeight: 80,
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        minHeight: 70,
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#64748b',
        fontSize: 22,
        fontWeight: '600',
    },
    footer: {
        marginTop: 48,
        fontSize: 16,
        color: '#94a3b8',
    },
});
