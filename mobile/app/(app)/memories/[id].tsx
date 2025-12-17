// Memory Detail View with Slideshow
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../lib/api';
import type { Memory } from '../../../lib/types';

const { width } = Dimensions.get('window');

export default function MemoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [memory, setMemory] = useState<Memory | null>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const loadMemory = async () => {
            if (!id) return;
            const { data } = await api.getMemories();
            const found = data?.find(m => m.id === id);
            setMemory(found || null);
        };
        loadMemory();
    }, [id]);

    if (!memory) return <View style={styles.loading} />;

    const photos = memory.photoUrls || [];

    const handleScroll = (event: any) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeSlide) {
            setActiveSlide(slide);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
                <Text style={styles.backArrow}>←</Text>
                <Text style={styles.backText}>Back to Photos</Text>
            </TouchableOpacity>

            <View style={styles.card}>
                <View style={styles.slideshowContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.slideshow}
                    >
                        {photos.length > 0 ? (
                            photos.map((url, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: url }}
                                    style={styles.slideImage}
                                    resizeMode="cover"
                                />
                            ))
                        ) : (
                            <View style={[styles.slideImage, styles.placeholder]}>
                                <Text style={styles.placeholderIcon}>📷</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Pagination Dots */}
                    {photos.length > 1 && (
                        <View style={styles.pagination}>
                            {photos.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        activeSlide === index && styles.activeDot
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.details}>
                    <Text style={styles.title}>{memory.title}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>📅 {new Date(memory.date).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>📍 {memory.location}</Text>
                        </View>
                    </View>

                    {memory.description && (
                        <View style={styles.descBox}>
                            <Text style={styles.description}>{memory.description}</Text>
                        </View>
                    )}

                    <View style={styles.peopleBox}>
                        <Text style={styles.peopleLabel}>With:</Text>
                        <Text style={styles.peopleList}>{memory.people}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loading: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        padding: 24,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    backArrow: {
        fontSize: 24,
        color: '#3B82F6',
        marginRight: 8,
        marginTop: -4,
    },
    backText: {
        fontSize: 18,
        color: '#3B82F6',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 32,
    },
    slideshowContainer: {
        position: 'relative',
    },
    slideshow: {
        width: '100%',
        height: 300,
        backgroundColor: '#F1F5F9',
    },
    slideImage: {
        width: width - 48, // Card width (Screen width - 2*padding)
        height: 300,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 64,
    },
    pagination: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
        width: 24,
    },
    details: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    tag: {
        backgroundColor: '#EFF6FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 100,
    },
    tagText: {
        color: '#1E40AF',
        fontWeight: '600',
        fontSize: 16,
    },
    descBox: {
        backgroundColor: '#FFFBEB',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    description: {
        fontSize: 20,
        color: '#475569',
        lineHeight: 30,
        fontStyle: 'italic',
    },
    peopleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    peopleLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#94A3B8',
    },
    peopleList: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
        flex: 1,
    },
});
