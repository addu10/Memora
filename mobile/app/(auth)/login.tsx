// Login Screen - Patient-Centric, Elderly-Friendly
import { useState } from 'react';
import { router } from 'expo-router';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';

export default function LoginScreen() {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!name || !pin) {
            Alert.alert('Required', 'Please enter both Name and PIN');
            return;
        }

        setLoading(true);

        try {
            // Direct Supabase RPC Login
            const { data, error } = await supabase.rpc('login_patient', {
                p_name: name.trim(),
                p_pin: pin
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            // Update API state immediately to prevent "No patient selected" error
            api.setPatientId(data.patientId);

            // Store verify patient data
            await AsyncStorage.setItem('patient', JSON.stringify({
                id: data.patientId, // Critical for data isolation
                name: data.name,
                pin: pin,
                photoUrl: data.photoUrl,
                loggedIn: true,
                loginTime: new Date().toISOString()
            }));

            router.replace('/(app)/home');
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Check your name and PIN');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>🧠</Text>
                    <Text style={styles.title}>Hello!</Text>
                    <Text style={styles.subtitle}>Who is using Memora today?</Text>
                </View>

                {/* Simple Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor="#94a3b8"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoFocus={true}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>PIN (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="4 digit PIN"
                            placeholderTextColor="#94a3b8"
                            value={pin}
                            onChangeText={setPin}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                        <Text style={styles.hint}>Leave blank if you don't have one</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        accessibilityLabel="Continue to the app"
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Please wait...' : 'Continue →'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Help */}
                <View style={styles.help}>
                    <Text style={styles.helpTitle}>Need Help?</Text>
                    <Text style={styles.helpText}>
                        Ask your family member to help you log in
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f9ff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 32,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 22,
        color: '#64748b',
        textAlign: 'center',
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        marginBottom: 8,
    },
    label: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e3a8a',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 20,
        fontSize: 22,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    hint: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 8,
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        minHeight: 80,
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '700',
    },
    help: {
        marginTop: 48,
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
    },
    helpTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
    },
});
