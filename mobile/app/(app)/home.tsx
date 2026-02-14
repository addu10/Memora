// Home Screen - Luxurious Light Patient Dashboard
import { useState, useEffect, useCallback } from 'react';
import { Link, router, useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, Platform, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../constants/Theme';
import {
    User,
    Sparkles,
    Image as ImageIcon,
    Brain,
    Users,
    ArrowRight,
    Lightbulb,
    Quote as QuoteIcon,
    ChevronRight,
    Heart
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Motivational quotes for elderly
const DAILY_QUOTES = [
    "Every memory is a treasure. Let's explore them together! ✨",
    "Your stories matter. Share them with those you love. 💝",
    "Today is a beautiful day to remember. 🌸",
    "Cherish every moment, big and small. 🌟",
    "Family is the heart of every memory. 👨‍👩‍👧‍👦",
    "You are loved, today and always. ❤️",
    "Small steps lead to big memories. 🪜",
];

export default function HomeScreen() {
    const [patientName, setPatientName] = useState('');
    const [greeting, setGreeting] = useState('Hello');
    const [quote, setQuote] = useState('');
    const [stats, setStats] = useState({ memories: 0, sessions: 0, familyMembers: 0 });
    const [recentMemory, setRecentMemory] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [patientId, setPatientId] = useState<string | null>(null);

    useEffect(() => {
        loadPatientInfo();
        updateGreeting();
        setRandomQuote();
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log('[HOME] Focused, refreshing data...');
            loadStats();
            loadRecentMemory();
        }, [])
    );

    // Setup real-time subscriptions
    useEffect(() => {
        if (!patientId) return;

        console.log(`[HOME] Setting up real-time stats for patient: ${patientId}`);

        const memoriesChannel = supabase
            .channel('home-memories-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Memory',
                    filter: `patientId=eq.${patientId}`
                },
                () => {
                    console.log('[HOME] Memory change detected, refreshing stats...');
                    loadStats();
                    loadRecentMemory();
                }
            )
            .subscribe();

        const sessionsChannel = supabase
            .channel('home-sessions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'TherapySession',
                    filter: `patientId=eq.${patientId}`
                },
                () => {
                    console.log('[HOME] Session change detected, refreshing stats...');
                    loadStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(memoriesChannel);
            supabase.removeChannel(sessionsChannel);
        };
    }, [patientId]);

    const loadPatientInfo = async () => {
        try {
            const patient = await AsyncStorage.getItem('patient');
            if (patient) {
                const parsed = JSON.parse(patient);
                setPatientName(parsed.name || 'Friend');
                setPatientId(parsed.id || null);
                console.log(`[HOME] Dashboard loaded for patient: ${parsed.name} (${parsed.id})`);
            }
        } catch (e) {
            console.error('[HOME] Failed to load patient info:', e);
            setPatientName('Friend');
        }
    };

    const updateGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    };

    const setRandomQuote = () => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        setQuote(DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]);
    };

    const loadStats = async () => {
        try {
            console.log('[HOME] Refreshing dashboard statistics...');
            const statsData = await api.getPatientStats();
            if (statsData.data) {
                setStats({
                    memories: statsData.data.totalMemories || 0,
                    sessions: statsData.data.totalSessions || 0,
                    familyMembers: statsData.data.totalFamily || 0,
                });
                console.log(`[HOME] Stats loaded: ${statsData.data.totalMemories} memories, ${statsData.data.totalSessions} sessions`);
            }
        } catch (e) {
            console.error('[HOME] Stats load error:', e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadStats(), loadRecentMemory()]);
        setRefreshing(false);
    };

    const loadRecentMemory = async () => {
        try {
            console.log('[HOME] Loading recent memory preview...');
            const memoriesRes = await api.getMemories();
            if (memoriesRes.data && memoriesRes.data.length > 0) {
                setRecentMemory(memoriesRes.data[0]);
                console.log(`[HOME] Featured recent memory: ${memoriesRes.data[0].title}`);
            }
        } catch (e) {
            console.error('[HOME] Recent memory load error:', e);
        }
    };

    return (
        <View style={styles.container}>
            {/* Mesh Background */}
            <Animated.View
                entering={FadeIn.duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.08)', top: -100, left: -100 }]}
            />
            <Animated.View
                entering={FadeIn.delay(400).duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(221, 214, 254, 0.08)', bottom: -100, right: -50 }]}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Theme.colors.primary}
                        colors={[Theme.colors.primary]}
                    />
                }
            >
                {/* Header Section */}
                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.header}
                >
                    <View style={styles.greetingSection}>
                        <Text style={styles.greeting}>{greeting},</Text>
                        <Text style={styles.patientName}>{patientName} <Heart size={24} color="#EF4444" fill="#EF4444" /></Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.profileButton, styles.cardShadow]}
                        onPress={() => router.push('/(app)/profile')}
                        activeOpacity={0.7}
                    >
                        <User size={24} color={Theme.colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Daily Quote Card */}
                <Animated.View
                    entering={FadeInUp.delay(200).duration(800).springify()}
                    style={[styles.quoteCard, styles.cardShadow]}
                >
                    <View style={styles.quoteAccent} />
                    <View style={styles.quoteContent}>
                        <QuoteIcon size={16} color={Theme.colors.primary} style={styles.quoteIcon} />
                        <Text style={styles.quoteText}>{quote}</Text>
                    </View>
                </Animated.View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    {[
                        { id: 'memories', icon: ImageIcon, color: Theme.colors.primary, label: 'Memories', value: stats.memories, delay: 400 },
                        { id: 'sessions', icon: Brain, color: Theme.colors.secondary, label: 'Sessions', value: stats.sessions, delay: 500 },
                        { id: 'family', icon: Users, color: '#10B981', label: 'Family', value: stats.familyMembers, delay: 600 }
                    ].map((stat) => (
                        <Animated.View
                            key={stat.id}
                            entering={FadeInRight.delay(stat.delay).duration(600).springify()}
                            style={styles.statCardContainer}
                        >
                            <LinearGradient
                                colors={['#FFFFFF', '#F5F3FF']}
                                style={styles.statCard}
                            >
                                <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                                    <stat.icon size={20} color={stat.color} strokeWidth={2.5} />
                                </View>
                                <Text style={styles.statNumber}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </LinearGradient>
                        </Animated.View>
                    ))}
                </View>

                <Animated.View entering={FadeInUp.delay(700).duration(800).springify()}>
                    <TouchableOpacity
                        style={[styles.featuredCardContainer, styles.featuredShadow]}
                        onPress={() => router.push('/(app)/session')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={Theme.colors.brandGradient as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.featuredCardGradient}
                        >
                            <View style={styles.featuredContent}>
                                <View style={styles.featuredIconOuter}>
                                    <View style={styles.featuredIconBg}>
                                        <Sparkles size={24} color={Theme.colors.primary} fill={Theme.colors.primaryLight} strokeWidth={2} />
                                    </View>
                                </View>
                                <View style={styles.featuredText}>
                                    <Text style={styles.featuredTitle}>Start Memory Exercise</Text>
                                    <Text style={styles.featuredSubtitle}>Keep your mind active and bright</Text>
                                </View>
                            </View>
                            <View style={styles.featuredArrow}>
                                <ArrowRight size={20} color="#FFFFFF" strokeWidth={3} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Recent Memory Preview */}
                {recentMemory && (
                    <Animated.View
                        entering={FadeInUp.delay(900).duration(800)}
                        style={styles.recentSection}
                    >
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Memory</Text>
                            <TouchableOpacity
                                style={styles.viewAllButton}
                                onPress={() => router.push('/(app)/memories/')}
                            >
                                <Text style={styles.viewAllText}>View All</Text>
                                <ArrowRight size={16} color={Theme.colors.primary} strokeWidth={3} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.recentCardContainer}
                            onPress={() => router.push(`/(app)/memories/${recentMemory.id}`)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#FFFFFF', '#F5F3FF']}
                                style={styles.recentCard}
                            >
                                {recentMemory.photoUrls?.[0] && (
                                    <Image
                                        source={{ uri: recentMemory.photoUrls[0] }}
                                        style={styles.recentImage}
                                        resizeMode="contain"
                                    />
                                )}
                                <View style={styles.recentContent}>
                                    <View style={styles.recentInfo}>
                                        <Text style={styles.recentTitle} numberOfLines={1}>{recentMemory.title}</Text>
                                        <Text style={styles.recentDate}>
                                            {new Date(recentMemory.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </Text>
                                    </View>
                                    {recentMemory.event && (
                                        <View style={styles.eventTag}>
                                            <Text style={styles.eventText}>{recentMemory.event}</Text>
                                        </View>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Quick Tip */}
                <Animated.View
                    entering={FadeInUp.delay(1200).duration(800)}
                    style={styles.tipCard}
                >
                    <View style={styles.tipIconBg}>
                        <Lightbulb size={20} color="#F59E0B" fill="#FEF3C7" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.tipText}>
                        Tip: Use <Text style={styles.tipBold}>Who?</Text> to recognize family in real-time.
                    </Text>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
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
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greetingSection: {},
    greeting: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    patientName: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 32,
        fontWeight: '900',
        color: Theme.colors.text,
        letterSpacing: -0.5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    profileButton: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: Theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.secondary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.04,
                shadowRadius: 16,
            },
            android: {
                elevation: 3,
            }
        })
    },
    quoteCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius['2xl'],
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    quoteAccent: {
        width: 4,
        backgroundColor: Theme.colors.primary,
        borderRadius: 2,
        marginRight: 16,
    },
    quoteContent: {
        flex: 1,
    },
    quoteIcon: {
        marginBottom: 8,
        opacity: 0.5,
    },
    quoteText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        color: Theme.colors.text,
        lineHeight: 28,
        fontWeight: '600',
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.xl,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    statIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 24,
        fontWeight: '800',
        color: Theme.colors.text,
    },
    statLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 12,
        color: Theme.colors.textSecondary,
        marginTop: 4,
        fontWeight: '700',
    },
    featuredCardContainer: {
        borderRadius: Theme.borderRadius['3xl'],
        marginBottom: 40,
        overflow: 'hidden',
    },
    featuredCardGradient: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    featuredShadow: {
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.primary,
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.3,
                shadowRadius: 24,
            },
            android: {
                elevation: 10,
            }
        })
    },
    featuredContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    featuredIconOuter: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuredIconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featuredText: {
        flex: 1,
    },
    featuredTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    featuredSubtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    featuredArrow: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statCardContainer: {
        flex: 1,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        elevation: 4,
        shadowColor: Theme.colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    recentCardContainer: {
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.md,
    },
    recentSection: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 22,
        fontWeight: '900',
        color: Theme.colors.text,
        letterSpacing: -0.5,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 15,
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    recentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 16,
    },
    recentImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#FFFFFF',
    },
    recentContent: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recentInfo: {
        flex: 1,
    },
    recentTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.text,
        marginBottom: 4,
    },
    recentDate: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
    },
    eventTag: {
        backgroundColor: Theme.colors.primaryUltraLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Theme.borderRadius.sm,
    },
    eventText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 13,
        color: Theme.colors.primary,
        fontWeight: '800',
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.secondaryLight,
        borderRadius: Theme.borderRadius.xl,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.1)',
    },
    tipIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipText: {
        fontFamily: Theme.typography.fontFamily,
        flex: 1,
        fontSize: 14,
        color: Theme.colors.text,
        lineHeight: 20,
        fontWeight: '600',
    },
    tipBold: {
        fontFamily: Theme.typography.fontFamily,
        color: Theme.colors.primary,
        fontWeight: '800',
    },
});
