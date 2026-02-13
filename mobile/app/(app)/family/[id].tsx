// Family Member Detail Screen 
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '../../../constants/Theme';
import { api } from '../../../lib/api';
import type { FamilyMember } from '../../../lib/types';
import { ChevronLeft, User, MessageSquare, BookOpen, Camera } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function FamilyDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [member, setMember] = useState<FamilyMember | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMember = async () => {
            if (!id) return;
            const { data } = await api.getFamilyMembers();
            const found = data?.find(m => m.id === id);
            setMember(found || null);
            setLoading(false);
        };
        loadMember();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    if (!member) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Family member not found.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const mainPhoto = member.photoUrls?.[0];

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
                        <Text style={styles.backText}>Back to Family</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(200).duration(800).springify()}
                    style={[styles.profileCard, styles.cardShadow]}
                >
                    <View style={styles.imageContainer}>
                        {mainPhoto ? (
                            <Image source={{ uri: mainPhoto }} style={styles.image} resizeMode="cover" />
                        ) : (
                            <View style={[styles.image, styles.placeholder]}>
                                <User size={64} color={Theme.colors.textSecondary} strokeWidth={1.5} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{member.name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{member.relationship}</Text>
                    </View>
                </Animated.View>

                {member.notes && (
                    <Animated.View
                        entering={FadeInUp.delay(400).duration(800).springify()}
                        style={styles.section}
                    >
                        <View style={styles.sectionHeader}>
                            <BookOpen size={20} color={Theme.colors.textSecondary} />
                            <Text style={styles.sectionTitle}>About {member.name.split(' ')[0]}</Text>
                        </View>
                        <View style={styles.noteCard}>
                            <Text style={styles.noteText}>{member.notes}</Text>
                        </View>
                    </Animated.View>
                )}

                {member.photoUrls && member.photoUrls.length > 0 && (
                    <Animated.View
                        entering={FadeInUp.delay(600).duration(800).springify()}
                        style={styles.section}
                    >
                        <View style={styles.sectionHeader}>
                            <Camera size={20} color={Theme.colors.textSecondary} />
                            <Text style={styles.sectionTitle}>Shared Gallery</Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.photoGallery}
                        >
                            {member.photoUrls.map((url, index) => (
                                <View key={index} style={styles.galleryImageContainer}>
                                    <Image
                                        source={{ uri: url }}
                                        style={styles.galleryImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            ))}
                        </ScrollView>
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
    content: {
        padding: 24,
        paddingBottom: 48,
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
    profileCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 36,
        padding: 32,
        alignItems: 'center',
        marginBottom: 32,
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
    imageContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: Theme.colors.background,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 6,
        borderColor: '#FFFFFF',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 36,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -1,
    },
    badge: {
        backgroundColor: Theme.colors.primaryUltraLight,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 100,
    },
    badgeText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        fontWeight: '800',
        color: Theme.colors.primary,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        marginLeft: 4,
    },
    sectionTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 22,
        fontWeight: '900',
        color: Theme.colors.text,
        letterSpacing: -0.5,
    },
    noteCard: {
        backgroundColor: Theme.colors.surface,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    noteText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        color: Theme.colors.text,
        lineHeight: 28,
        fontWeight: '500',
    },
    photoGallery: {
        paddingRight: 24,
        gap: 20,
    },
    galleryImageContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    galleryImage: {
        width: 240,
        height: 180,
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        color: Theme.colors.text,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '700',
    },
    backButton: {
        padding: 16,
        backgroundColor: Theme.colors.primary,
        borderRadius: 12,
        alignItems: 'center',
    },
    backButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
