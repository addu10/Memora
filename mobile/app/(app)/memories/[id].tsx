// Memory Detail View with Slideshow
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '../../../constants/Theme';
import { api } from '../../../lib/api';
import type { Memory } from '../../../lib/types';
import { ChevronLeft, Calendar, MapPin, Users, BookOpen, Camera, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

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
        <View style={styles.container}>
            {/* Mesh Background */}
            <Animated.View
                entering={FadeIn.duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.08)', top: -100, left: -100 }]}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(800).springify()}>
                    <TouchableOpacity style={styles.backRow} onPress={() => router.back()} activeOpacity={0.7}>
                        <View style={styles.backIconBg}>
                            <ChevronLeft size={24} color={Theme.colors.primary} strokeWidth={3} />
                        </View>
                        <Text style={styles.backText}>Back to Photos</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(200).duration(800).springify()}
                    style={[styles.card, styles.cardShadow]}
                >
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
                                    <Camera size={64} color={Theme.colors.textSecondary} opacity={0.3} />
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

                        <View style={styles.slideBadge}>
                            <Sparkles size={14} color="#FFFFFF" fill="#FFFFFF" />
                            <Text style={styles.slideBadgeText}>Memory {activeSlide + 1}/{photos.length || 1}</Text>
                        </View>
                    </View>

                    <View style={styles.details}>
                        <Text style={styles.title}>{memory.title}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.tag}>
                                <Calendar size={14} color={Theme.colors.primary} strokeWidth={2.5} />
                                <Text style={styles.tagText}>{new Date(memory.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                            </View>
                            {memory.location && (
                                <View style={[styles.tag, { backgroundColor: Theme.colors.secondaryUltraLight }]}>
                                    <MapPin size={14} color={Theme.colors.secondary} strokeWidth={2.5} />
                                    <Text style={[styles.tagText, { color: Theme.colors.secondary }]}>{memory.location}</Text>
                                </View>
                            )}
                        </View>

                        {memory.description && (
                            <View style={styles.descBox}>
                                <View style={styles.descHeader}>
                                    <BookOpen size={18} color="#854D0E" strokeWidth={2.5} />
                                    <Text style={styles.descTitle}>The Story</Text>
                                </View>
                                <Text style={styles.description}>{memory.description}</Text>
                            </View>
                        )}

                        <View style={styles.peopleBox}>
                            <View style={styles.peopleIconBg}>
                                <Users size={20} color={Theme.colors.primary} />
                            </View>
                            <View style={styles.peopleContent}>
                                <Text style={styles.peopleLabel}>Shared with:</Text>
                                <Text style={styles.peopleList}>{memory.people}</Text>
                            </View>
                        </View>
                    </View>
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
    loading: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    content: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    backIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    backText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        color: Theme.colors.textSecondary,
        fontWeight: '700',
    },
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 36,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.secondary,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
            },
            android: {
                elevation: 6,
            }
        })
    },
    slideshowContainer: {
        position: 'relative',
    },
    slideshow: {
        width: '100%',
        height: 380,
        backgroundColor: Theme.colors.background,
    },
    slideImage: {
        width: width - 48,
        height: 380,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    slideBadgeText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
    pagination: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
        width: 24,
    },
    details: {
        padding: 28,
    },
    title: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 32,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 16,
        letterSpacing: -1,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 28,
    },
    tag: {
        backgroundColor: Theme.colors.primaryUltraLight,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tagText: {
        fontFamily: Theme.typography.fontFamily,
        color: Theme.colors.primary,
        fontWeight: '700',
        fontSize: 15,
    },
    descBox: {
        backgroundColor: '#FEFCE8',
        padding: 24,
        borderRadius: 24,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#FEF08A',
    },
    descHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    descTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        fontWeight: '900',
        color: '#854D0E',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    description: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        color: '#713F12',
        lineHeight: 32,
        fontStyle: 'italic',
        fontWeight: '600',
    },
    peopleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.background,
    },
    peopleIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Theme.colors.primaryUltraLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    peopleContent: {
        flex: 1,
    },
    peopleLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        fontWeight: '800',
        color: Theme.colors.textSecondary,
        marginBottom: 2,
    },
    peopleList: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        fontWeight: '700',
        color: Theme.colors.text,
    },
});
