// Welcome/Landing Screen - Luxurious Light Aesthetic
import { Link, router } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/Theme';
import { Camera, UserCheck, Image as ImageIcon, Brain, ArrowRight, Heart } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    return (
        <View style={styles.container}>
            {/* Luxurious Mesh Gradient Background Elements */}
            <Animated.View
                entering={FadeIn.duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.12)', top: -100, left: -100 }]}
            />
            <Animated.View
                entering={FadeIn.delay(200).duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(196, 181, 253, 0.12)', top: -50, right: -100 }]}
            />
            <Animated.View
                entering={FadeIn.delay(400).duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(221, 214, 254, 0.12)', bottom: -100, right: -50 }]}
            />

            {/* Hero Section */}
            <Animated.View
                entering={FadeInDown.duration(800).springify()}
                style={styles.hero}
            >
                <Image
                    source={require('../Memora_Logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
                <View style={styles.taglineBadge}>
                    <Text style={styles.tagline}>YOUR MEMORY COMPANION</Text>
                </View>
                <Text style={styles.subtitle}>
                    Reconnect with precious moments{'\n'}and the people you love.
                </Text>
            </Animated.View>

            {/* Bento Feature Cards */}
            <View style={styles.features}>
                <Animated.View
                    entering={FadeInUp.delay(300).duration(600).springify()}
                    style={[styles.featureCard, styles.cardShadow]}
                >
                    <View style={[styles.featureIconBg, { backgroundColor: '#F5F3FF' }]}>
                        <UserCheck size={26} color={Theme.colors.primary} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.featureTitle}>Recognize</Text>
                    <Text style={styles.featureDesc}>Family Faces</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(500).duration(600).springify()}
                    style={[styles.featureCard, styles.cardShadow]}
                >
                    <View style={[styles.featureIconBg, { backgroundColor: '#EEF2FF' }]}>
                        <ImageIcon size={26} color="#6366F1" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.featureTitle}>Relive</Text>
                    <Text style={styles.featureDesc}>Memories</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(700).duration(600).springify()}
                    style={[styles.featureCard, styles.cardShadow]}
                >
                    <View style={[styles.featureIconBg, { backgroundColor: '#F0FDF4' }]}>
                        <Brain size={26} color="#10B981" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.featureTitle}>Engage</Text>
                    <Text style={styles.featureDesc}>Therapy</Text>
                </Animated.View>
            </View>

            <Animated.View
                entering={FadeInUp.delay(900).duration(800)}
                style={{ width: '100%' }}
            >
                <TouchableOpacity
                    style={[styles.primaryButtonContainer, styles.buttonShadow]}
                    onPress={() => router.push('/(auth)/login')}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={Theme.colors.brandGradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryButtonGradient}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                        <View style={styles.buttonArrowContainer}>
                            <ArrowRight size={20} color="#FFFFFF" strokeWidth={3} />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View
                entering={FadeIn.delay(1200).duration(1000)}
                style={styles.footerInfo}
            >
                <View style={styles.divider} />
                <Text style={styles.footerText}>
                    Designed with care for elders <Heart size={14} color="#EF4444" fill="#EF4444" />
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    meshGradient: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
    },
    hero: {
        alignItems: 'center',
        marginTop: height * 0.12,
        marginBottom: 48,
    },
    logoImage: {
        width: 240,
        height: 60,
        marginBottom: 24,
    },
    taglineBadge: {
        backgroundColor: Theme.colors.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: Theme.borderRadius.full,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.1)',
    },
    tagline: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 12,
        color: Theme.colors.primary,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    subtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 30,
        fontWeight: '500',
    },
    features: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 64,
    },
    featureCard: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius['2xl'],
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.04,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            }
        })
    },
    featureIconBg: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 15,
        fontWeight: '700',
        color: Theme.colors.text,
        marginBottom: 4,
    },
    featureDesc: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 12,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
    },
    primaryButtonContainer: {
        width: '100%',
        height: 72,
        borderRadius: Theme.borderRadius.full,
        overflow: 'hidden',
    },
    primaryButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    buttonShadow: {
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.primary,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            }
        })
    },
    primaryButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
    },
    buttonArrowContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerInfo: {
        marginTop: 40,
        alignItems: 'center',
    },
    divider: {
        width: 40,
        height: 4,
        backgroundColor: Theme.colors.border,
        borderRadius: 2,
        marginBottom: 16,
    },
    footerText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});
