// Memories Screen - Dynamic Gallery from Supabase
import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api } from '../../../lib/api';
import type { Memory } from '../../../lib/types';

export default function MemoriesScreen() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState('All');
    const [sessionResults, setSessionResults] = useState<any[]>([]);
    const router = useRouter();

    const events = ['All', 'Happy', 'Family', 'Travel', 'Festival'];

    const loadMemories = async () => {
        setLoading(true);
        const { data: mems } = await api.getMemories();
        const { data: results } = await api.getLatestSessionMemories();

        if (mems) setMemories(mems);
        if (results) setSessionResults(results);

        setLoading(false);
    };

    const getRecallStatus = (memoryId: string) => {
        const result = sessionResults.find(r => r.memoryId === memoryId);
        if (!result) return null;

        const score = result.recallScore;
        const date = new Date(result.reviewedAt).toLocaleDateString();

        if (score >= 4) return { label: 'Mastered', color: '#10B981', date };
        if (score >= 2) return { label: 'In Progress', color: '#F59E0B', date };
        return { label: 'Need Practice', color: '#EF4444', date };
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
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading your beautiful memories...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Photos</Text>
                <Text style={styles.subtitle}>Tap any photo to remember</Text>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
            >
                {events.map((event) => (
                    <TouchableOpacity
                        key={event}
                        style={[
                            styles.filterTab,
                            selectedEvent === event && styles.filterTabActive
                        ]}
                        onPress={() => setSelectedEvent(event)}
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

            {/* Memory Cards */}
            <View style={styles.memoriesGrid}>
                {filteredMemories.map((memory) => {
                    const mainPhoto = (memory.photoUrls && memory.photoUrls.length > 0)
                        ? memory.photoUrls[0]
                        : null;

                    return (
                        <TouchableOpacity
                            key={memory.id}
                            style={styles.memoryCard}
                            accessibilityLabel={`View ${memory.title} photo`}
                            onPress={() => router.push(`/memories/${memory.id}`)}
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
                                        <Text style={styles.memoryIcon}>📷</Text>
                                    </View>
                                )}
                                {getRecallStatus(memory.id) && (
                                    <View style={[styles.badge, { backgroundColor: getRecallStatus(memory.id)?.color }]}>
                                        <Text style={styles.badgeText}>{getRecallStatus(memory.id)?.label}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={styles.memoryTitle} numberOfLines={1}>{memory.title}</Text>
                                <View style={styles.footerRow}>
                                    <Text style={styles.memoryDate}>
                                        {memory.date ? new Date(memory.date).toLocaleDateString() : 'No date'}
                                    </Text>
                                    {getRecallStatus(memory.id) && (
                                        <Text style={styles.lastReviewText}>Reviewed {getRecallStatus(memory.id)?.date}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {filteredMemories.length === 0 && (
                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>📸</Text>
                    <Text style={styles.infoTitle}>No photos yet</Text>
                    <Text style={styles.infoText}>
                        Ask your family to add photos from the Portal.
                        They will appear here instantly!
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slate-50
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        color: '#64748B',
    },
    content: {
        padding: 24,
        paddingBottom: 48,
    },
    header: {
        marginBottom: 24,
        marginTop: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 18,
        color: '#64748B',
    },
    filterContainer: {
        gap: 12,
        paddingBottom: 8,
        marginBottom: 24,
    },
    filterTab: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minHeight: 48,
        justifyContent: 'center',
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    filterText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
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
    memoryCard: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    memoryImageContainer: {
        height: 160,
        backgroundColor: '#F1F5F9',
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
    memoryIcon: {
        fontSize: 48,
    },
    cardFooter: {
        padding: 16,
    },
    memoryTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    memoryDate: {
        fontSize: 12,
        color: '#94A3B8',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    lastReviewText: {
        fontSize: 10,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    infoCard: {
        backgroundColor: '#DBEAFE', // Blue-100
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        marginTop: 32,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    infoIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E40AF', // Blue-800
        marginBottom: 12,
    },
    infoText: {
        fontSize: 18,
        color: '#2563EB', // Blue-600
        textAlign: 'center',
        lineHeight: 26,
    },
});
