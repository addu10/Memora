// Login Screen - Luxurious Light Aesthetic
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
    ScrollView,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { Theme } from '../../constants/Theme';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!name || !pin) {
            Alert.alert('Required', 'Please enter both Your Name and PIN');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.rpc('login_patient', {
                p_name: name.trim(),
                p_pin: pin
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            api.setPatientId(data.patientId);

            await AsyncStorage.setItem('patient', JSON.stringify({
                id: data.patientId,
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
            {/* Mesh Background */}
            <Animated.View
                entering={FadeIn.duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.12)', top: -100, left: -100 }]}
            />
            <Animated.View
                entering={FadeIn.delay(300).duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(221, 214, 254, 0.12)', bottom: -100, right: -50, opacity: undefined }]}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.header}
                >
                    <Text style={styles.welcomeEmoji}>👋</Text>
                    <Text style={styles.title}>Hello there!</Text>
                    <Text style={styles.subtitle}>Who is joining us today?</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(200).duration(800).springify()}
                    style={[styles.card, styles.cardShadow]}
                >
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor={Theme.colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your PIN</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="4 Digit PIN"
                            placeholderTextColor={Theme.colors.textSecondary}
                            value={pin}
                            onChangeText={setPin}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry={true}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButtonContainer, styles.buttonShadow, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={Theme.colors.brandGradient as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Enter Memora</Text>
                                    <View style={styles.arrowBg}>
                                        <ArrowRight size={18} color="#FFFFFF" strokeWidth={3} />
                                    </View>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(800).duration(1000)}>
                    <TouchableOpacity
                        style={styles.backLink}
                        onPress={() => router.back()}
                    >
                        <View style={styles.backLinkContent}>
                            <ChevronLeft size={16} color={Theme.colors.textSecondary} />
                            <Text style={styles.backLinkText}>Change my mind</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    meshGradient: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        opacity: 0.8,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: height * 0.12,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    welcomeEmoji: {
        fontSize: 52,
        marginBottom: 16,
    },
    title: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 36,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        color: Theme.colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius['3xl'],
        padding: 24,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.secondary,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.06,
                shadowRadius: 20,
            },
            android: {
                elevation: 6,
            }
        })
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 15,
        fontWeight: '700',
        color: Theme.colors.text,
        marginBottom: 10,
        marginLeft: 4,
    },
    input: {
        fontFamily: Theme.typography.fontFamily,
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.borderRadius.xl,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 18,
        color: Theme.colors.text,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        fontWeight: '500',
    },
    loginButtonContainer: {
        height: 68,
        borderRadius: Theme.borderRadius.full,
        marginTop: 12,
        overflow: 'hidden',
    },
    loginButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    buttonShadow: {
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            }
        })
    },
    loginButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    arrowBg: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    backLink: {
        marginTop: 32,
        alignSelf: 'center',
    },
    backLinkText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 15,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
    },
    backLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});
