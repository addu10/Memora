// Family Directory Screen
import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Theme } from '../../../constants/Theme';
import { api } from '../../../lib/api';
import type { FamilyMember } from '../../../lib/types';
import { Heart, User, ChevronRight, Users, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function FamilyScreen() {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadFamily = async () => {
        setLoading(true);
        const { data, error } = await api.getFamilyMembers();
        if (data) {
            setFamilyMembers(data);
        } else {
            console.error("Error loading family:", error);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadFamily();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={styles.loadingText}>Loading family...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Mesh Background */}
            <Animated.View
                entering={FadeIn.duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.08)', top: -100, left: -100 }]}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.header}
                >
                    <Text style={styles.title}>My Family</Text>
                    <Text style={styles.subtitle}>People who love you <Heart size={18} color="#EF4444" fill="#EF4444" /></Text>
                </Animated.View>

                <View style={styles.list}>
                    {familyMembers.map((member, index) => (
                        <Animated.View
                            key={member.id}
                            entering={FadeInUp.delay(200 + index * 100).duration(600).springify()}
                        >
                            <TouchableOpacity
                                style={[styles.card, styles.cardShadow]}
                                onPress={() => router.push(`/family/${member.id}`)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.imageContainer}>
                                    {member.photoUrls && member.photoUrls.length > 0 ? (
                                        <Image
                                            source={{ uri: member.photoUrls[0] }}
                                            style={styles.image}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[styles.image, styles.imagePlaceholder]}>
                                            <User size={32} color={Theme.colors.textSecondary} strokeWidth={1.5} />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.name}>{member.name}</Text>
                                    <View style={styles.relationTag}>
                                        <Text style={styles.relationText}>{member.relationship}</Text>
                                    </View>
                                </View>
                                <View style={styles.arrowContainer}>
                                    <ChevronRight size={20} color={Theme.colors.primary} strokeWidth={3} />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    {familyMembers.length === 0 && (
                        <Animated.View
                            entering={FadeInUp.delay(300).duration(800)}
                            style={styles.emptyState}
                        >
                            <View style={styles.emptyIconBg}>
                                <Users size={48} color={Theme.colors.textSecondary} opacity={0.5} />
                            </View>
                            <Text style={styles.emptyText}>No family members added yet.</Text>
                            <Text style={styles.emptySubtext}>Ask your caregiver to add them in the portal.</Text>
                        </Animated.View>
                    )}
                </View>
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
        marginTop: 20,
        marginBottom: 32,
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
    list: {
        gap: 16,
    },
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 28,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
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
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 20,
    },
    name: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 22,
        fontWeight: '800',
        color: Theme.colors.text,
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    relationTag: {
        backgroundColor: Theme.colors.primaryUltraLight,
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 100,
    },
    relationText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    arrowContainer: {
        width: 44,
        height: 44,
        backgroundColor: Theme.colors.background,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
        padding: 40,
        backgroundColor: Theme.colors.surface,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderStyle: 'dashed',
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
});
