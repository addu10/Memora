// Memories Screen - Dynamic Gallery from Supabase
import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Theme } from '../../../constants/Theme';
import { api } from '../../../lib/api';
import type { Memory } from '../../../lib/types';
import {
    Heart,
    Camera,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Filter,
    ImageOff,
    Sparkles
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function MemoriesScreen() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState('All');
    const [events, setEvents] = useState(['All']);
    const [sessionResults, setSessionResults] = useState<any[]>([]);
    const router = useRouter();


    const loadMemories = async () => {
        setLoading(true);
        const { data: mems } = await api.getMemories();
        const { data: results } = await api.getLatestSessionMemories();
        const { data: eventTypes } = await api.getEventTypes();

        if (mems) setMemories(mems);
        if (results) setSessionResults(results);
        if (eventTypes) {
            setEvents(['All', ...eventTypes]);
        }

        setLoading(false);
    };

    const getRecallStatus = (memoryId: string) => {
        const result = sessionResults.find(r => r.memoryId === memoryId);
        if (!result) return null;

        const score = result.recallScore;
        const date = new Date(result.reviewedAt).toLocaleDateString();

        if (score >= 4) return { label: 'Mastered', color: '#10B981', icon: CheckCircle2, date };
        if (score >= 2) return { label: 'In Progress', color: '#F59E0B', icon: Clock, date };
        return { label: 'Need Practice', color: '#EF4444', icon: AlertCircle, date };
    };

    useFocusEffect(
        useCallback(() => {
            loadMemories();
        }, [])
    );

    useEffect(() => {
        api.init().then(loadMemories);
    }, []);

    const filteredMemories = selectedEvent === 'All'
        ? memories
        : memories.filter(m => m.event?.includes(selectedEvent) || m.people?.includes(selectedEvent));

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={styles.loadingText}>Loading your beautiful memories...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Mesh Background */}
            <Animated.View
                entering={FadeIn.duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.08)', top: -100, left: -100, opacity: undefined }]}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.header}
                >
                    <Text style={styles.title}>My Photos</Text>
                    <Text style={styles.subtitle}>Tap any photo to remember <Heart size={18} color="#EF4444" fill="#EF4444" /></Text>
                </Animated.View>

                {/* Filter Tabs */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(800).springify()}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContainer}
                    >
                        <TouchableOpacity
                            style={styles.filterIconBg}
                            onPress={() => setSelectedEvent('All')}
                            activeOpacity={0.7}
                        >
                            <Filter size={20} color={Theme.colors.primary} strokeWidth={2.5} />
                        </TouchableOpacity>
                        {events.map((event) => (
                            <TouchableOpacity
                                key={event}
                                style={[
                                    styles.filterTab,
                                    selectedEvent === event && styles.filterTabActive
                                ]}
                                onPress={() => setSelectedEvent(event)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedEvent === event && styles.filterTextActive
                                ]}>
                                    {event}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Memory Cards */}
                <View style={styles.memoriesGrid}>
                    {filteredMemories.map((memory, index) => {
                        const mainPhoto = (memory.photoUrls && memory.photoUrls.length > 0)
                            ? memory.photoUrls[0]
                            : null;

                        const status = getRecallStatus(memory.id);

                        return (
                            <Animated.View
                                key={memory.id}
                                entering={FadeInUp.delay(300 + index * 100).duration(600).springify()}
                                style={styles.memoryCardContainer}
                            >
                                <TouchableOpacity
                                    style={[styles.memoryCard, styles.cardShadow]}
                                    accessibilityLabel={`View ${memory.title} photo`}
                                    onPress={() => router.push(`/memories/${memory.id}`)}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.memoryImageContainer}>
                                        {mainPhoto ? (
                                            <Image
                                                source={{ uri: mainPhoto }}
                                                style={styles.memoryImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[styles.memoryImage, styles.placeholderImage]}>
                                                <Camera size={48} color={Theme.colors.textSecondary} opacity={0.3} />
                                            </View>
                                        )}
                                        {status && (
                                            <View style={[styles.badge, { backgroundColor: status.color }]}>
                                                {(() => {
                                                    const StatusIcon = status.icon;
                                                    return <StatusIcon size={12} color="white" strokeWidth={3} />;
                                                })()}
                                                <Text style={styles.badgeText}>{status.label}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.memoryTitle} numberOfLines={1}>{memory.title}</Text>
                                        <View style={styles.footerRow}>
                                            <View style={styles.dateGroup}>
                                                <Calendar size={12} color={Theme.colors.textSecondary} />
                                                <Text style={styles.memoryDate}>
                                                    {memory.date ? new Date(memory.date).toLocaleDateString() : 'No date'}
                                                </Text>
                                            </View>
                                        </View>
                                        {status && (
                                            <Text style={styles.lastReviewText}>Reviewed {status.date}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                {filteredMemories.length === 0 && (
                    <Animated.View
                        entering={FadeInUp.delay(400).duration(800)}
                        style={styles.infoCard}
                    >
                        <View style={styles.infoIconBg}>
                            <ImageOff size={48} color="#2563EB" style={{ opacity: 0.5 }} />
                        </View>
                        <Text style={styles.infoTitle}>No photos yet</Text>
                        <Text style={styles.infoText}>
                            Ask your family to add photos from the Portal.
                            They will appear here instantly!
                        </Text>
                    </Animated.View>
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    loadingText: {
        fontFamily: Theme.typography.fontFamily,
        marginTop: 16,
        fontSize: 18,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
    },
    content: {
        padding: 24,
        paddingBottom: 48,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        marginBottom: 24,
        marginTop: 20,
    },
    title: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 36,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filterContainer: {
        gap: 12,
        paddingBottom: 8,
        marginBottom: 24,
        alignItems: 'center',
    },
    filterIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginRight: 4,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: Theme.colors.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        justifyContent: 'center',
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    filterText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.textSecondary,
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    memoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    memoryCardContainer: {
        width: (width - 48 - 16) / 2, // Robust 2-column calculation
        marginBottom: 4,
    },
    memoryCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 28,
        overflow: 'hidden',
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
    memoryImageContainer: {
        height: 160,
        backgroundColor: Theme.colors.background,
        width: '100%',
    },
    memoryImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardFooter: {
        padding: 16,
    },
    memoryTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 17,
        fontWeight: '800',
        color: Theme.colors.text,
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    dateGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    memoryDate: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 12,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    lastReviewText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 10,
        color: Theme.colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 6,
        fontWeight: '500',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    badgeText: {
        fontFamily: Theme.typography.fontFamily,
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    infoCard: {
        backgroundColor: Theme.colors.secondaryUltraLight,
        borderRadius: 32,
        padding: 40,
        alignItems: 'center',
        marginTop: 32,
        borderWidth: 1,
        borderColor: Theme.colors.secondaryLight,
    },
    infoIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    infoTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 24,
        fontWeight: '900',
        color: '#1E40AF',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    infoText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        color: '#2563EB',
        textAlign: 'center',
        lineHeight: 28,
        fontWeight: '600',
    },
});
