// Family Member Detail Screen
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../lib/api';
import type { FamilyMember } from '../../../lib/types';

export default function FamilyDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [member, setMember] = useState<FamilyMember | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMember = async () => {
            if (!id) return;
            // In a real app we might fetch just one, but here we can find from list or use a new getFamilyMember(id) API.
            // For simplicity and since we have getAll, we can filter or fetch all.
            // ideally we add `getFamilyMember(id)` to api.ts, but filtering is okay for small lists.
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
                <ActivityIndicator size="large" color="#3B82F6" />
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
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
                <Text style={styles.backArrow}>←</Text>
                <Text style={styles.backText}>Back to Family</Text>
            </TouchableOpacity>

            <View style={styles.profileCard}>
                <View style={styles.imageContainer}>
                    {mainPhoto ? (
                        <Image source={{ uri: mainPhoto }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.image, styles.placeholder]}>
                            <Text style={styles.placeholderIcon}>👤</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{member.name}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{member.relationship}</Text>
                </View>
            </View>

            {member.notes && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.noteCard}>
                        <Text style={styles.noteText}>{member.notes}</Text>
                    </View>
                </View>
            )}

            {member.photoUrls && member.photoUrls.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{member.name.split(' ')[0]}'s Photos</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.photoGallery}
                    >
                        {member.photoUrls.map((url, index) => (
                            <Image
                                key={index}
                                source={{ uri: url }}
                                style={styles.galleryImage}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        paddingBottom: 48,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40, // More top margin for no-header layout
        marginBottom: 24,
    },
    backArrow: {
        fontSize: 28,
        color: '#3B82F6',
        marginRight: 8,
    },
    backText: {
        fontSize: 18,
        color: '#3B82F6',
        fontWeight: '600',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 32,
    },
    imageContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 6,
        borderColor: '#EFF6FF',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 64,
    },
    name: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
        textAlign: 'center',
    },
    badge: {
        backgroundColor: '#DBEAFE',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 100,
    },
    badgeText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E40AF',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
        marginLeft: 4,
    },
    noteCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    noteText: {
        fontSize: 18,
        color: '#475569',
        lineHeight: 28,
    },
    photoGallery: {
        paddingRight: 24,
        gap: 16,
    },
    galleryImage: {
        width: 200,
        height: 150,
        borderRadius: 16,
        backgroundColor: '#E2E8F0',
    },
    errorText: {
        fontSize: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 16,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
});
