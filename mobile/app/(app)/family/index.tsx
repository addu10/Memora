// Family Directory Screen
import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api } from '../../../lib/api';
import type { FamilyMember } from '../../../lib/types';

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
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading family...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>My Family</Text>
                <Text style={styles.subtitle}>People who love you ❤️</Text>
            </View>

            <View style={styles.list}>
                {familyMembers.map((member) => (
                    <TouchableOpacity
                        key={member.id}
                        style={styles.card}
                        onPress={() => router.push(`/family/${member.id}`)}
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
                                    <Text style={styles.placeholderIcon}>👤</Text>
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
                            <Text style={styles.arrow}>→</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {familyMembers.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👨‍👩‍👧</Text>
                        <Text style={styles.emptyText}>No family members added yet.</Text>
                        <Text style={styles.emptySubtext}>Ask your caregiver to add them in the portal.</Text>
                    </View>
                )}
            </View>
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
        marginTop: 20,
        marginBottom: 32,
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
    list: {
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#F1F5F9',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 32,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 6,
    },
    relationTag: {
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 100,
    },
    relationText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },
    arrowContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    arrow: {
        fontSize: 20,
        color: '#64748B',
        fontWeight: '800',
        marginBottom: 4, // Visual alignment
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 48,
        padding: 32,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#475569',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 24,
    },
});
