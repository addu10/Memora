// Face Recognition Screen
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, FlatList, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../../lib/api';
import { recognizeFace, RecognitionResult, getErrorMessage } from '../../lib/recognition';
import { Memory, FamilyMember } from '../../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper: Auto-Scrolling Carousel
function AutoScrollCarousel({ data, renderItem, height = 200, interval = 3000 }: any) {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (data.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex(prev => {
                const next = prev === data.length - 1 ? 0 : prev + 1;
                flatListRef.current?.scrollToIndex({ index: next, animated: true });
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [data.length]);

    return (
        <FlatList
            ref={flatListRef}
            data={data}
            renderItem={renderItem}
            keyExtractor={(_, i) => String(i)}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            style={{ height }}
            contentContainerStyle={{ alignItems: 'center' }}
        />
    );
}

export default function RecognizeScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [recognizing, setRecognizing] = useState(false);
    const [result, setResult] = useState<RecognitionResult | null>(null);

    // New State for Enhanced Experience
    const [memories, setMemories] = useState<Memory[]>([]);
    const [relatedPhotos, setRelatedPhotos] = useState<string[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);


    const fetchRelatedContent = async (name: string, id?: string) => {
        setLoadingRelated(true);
        try {
            // 1. Fetch Memories tagging this person
            const memRes = await api.getMemoriesByPerson(name);
            if (memRes.data) {
                setMemories(memRes.data);
            }

            // 2. Fetch more photos from Family Profile (if ID available)
            if (id) {
                const famRes = await api.getFamilyMemberById(id);
                if (famRes.data && famRes.data.photoUrls) {
                    setRelatedPhotos(famRes.data.photoUrls);
                }
            }
        } catch (e) {
            console.error("Failed to load related content", e);
        } finally {
            setLoadingRelated(false);
        }
    };

    // Effect: Fetch related content when a match is found
    useEffect(() => {
        if (result && result.match && result.name) {
            fetchRelatedContent(result.name, result.id);
        }
    }, [result]);

    const cameraRef = useRef<CameraView>(null);

    // Handle camera permissions
    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <View style={styles.permissionCard}>
                    <Text style={styles.permissionIcon}>📸</Text>
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionText}>
                        To recognize your family members, Memora needs access to your camera.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleCapture = async () => {
        if (!cameraRef.current || recognizing) return;

        setRecognizing(true);
        setResult(null);

        try {
            // 1. Capture
            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.7, // Reduce size for faster upload
                shutterSound: false,
            });

            if (!photo?.base64) {
                throw new Error("Failed to capture image data");
            }

            // 2. Get Patient ID
            // We can get it from api state or AsyncStorage
            let patientId = null;
            const patientData = await AsyncStorage.getItem('patient');
            if (patientData) {
                patientId = JSON.parse(patientData).id;
            }

            if (!patientId) {
                Alert.alert("Error", "No patient logged in. Please re-login.");
                return;
            }

            // 3. Recognize
            const apiResult = await recognizeFace(photo.base64, patientId);
            setResult(apiResult);

        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to recognize face. Please try again.');
        } finally {
            setRecognizing(false);
        }
    };

    const resetRecognition = () => {
        setResult(null);
        setMemories([]);
        setRelatedPhotos([]);
    };



    return (
        <View style={styles.container}>
            {/* 1. Camera View (Only active when no result) */}
            {!result && (
                <>
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing="back"
                    />

                    {/* Overlay */}
                    <View style={styles.overlay} pointerEvents="box-none">
                        <View style={styles.faceGuide}>
                            <View style={styles.faceGuideCorner} />
                            <View style={[styles.faceGuideCorner, styles.topRight]} />
                            <View style={[styles.faceGuideCorner, styles.bottomLeft]} />
                            <View style={[styles.faceGuideCorner, styles.bottomRight]} />
                        </View>

                        <Text style={styles.guideText}>
                            {recognizing ? 'Identifying...' : 'Center face in the box'}
                        </Text>
                    </View>
                </>
            )}

            {/* 2. Controls / Result View */}
            <View style={[styles.controls, result && styles.fullScreenControls]}>
                {result ? (
                    <View style={styles.resultCard}>
                        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                            {/* Header: Match Info */}
                            <View style={styles.resultHeader}>
                                <View style={[
                                    styles.resultIconContainer,
                                    result.match ? styles.iconGreen :
                                        result.error_type === 'no_face' ? styles.iconRed :
                                            result.error_type === 'low_quality_face' ? styles.iconYellow :
                                                styles.iconGray
                                ]}>
                                    <Text style={styles.resultIcon}>
                                        {result.match ? '✅' :
                                            result.error_type === 'no_face' ? '🚫' :
                                                result.error_type === 'low_quality_face' ? '📷' :
                                                    result.error_type === 'unknown_person' ? '❓' : '⚠️'}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.resultName}>
                                        {result.match ? `This is ${result.name}` :
                                            result.error_type === 'no_face' ? 'No Face Detected' :
                                                result.error_type === 'low_quality_face' ? 'Low Quality Image' :
                                                    result.error_type === 'unknown_person' ? 'Unknown Person' :
                                                        'Recognition Failed'}
                                    </Text>
                                    <Text style={styles.resultConfidence}>
                                        {result.match
                                            ? `Certainty: ${Math.round((result.confidence || 0) * 100)}%`
                                            : getErrorMessage(result)
                                        }
                                    </Text>
                                </View>
                            </View>

                            {/* V3: Show Suggestion Hint for errors */}
                            {!result.match && result.suggestion && (
                                <View style={[styles.relationshipHint, { backgroundColor: '#FEF3C7' }]}>
                                    <Text style={styles.hintIcon}>💡</Text>
                                    <Text style={[styles.hintText, { color: '#92400E' }]}>
                                        {result.suggestion}
                                    </Text>
                                </View>
                            )}

                            {/* V3: Show closest match for unknown person */}
                            {result.error_type === 'unknown_person' && result.closest_match && (
                                <View style={[styles.relationshipHint, { backgroundColor: '#F1F5F9' }]}>
                                    <Text style={styles.hintIcon}>🔍</Text>
                                    <Text style={[styles.hintText, { color: '#475569' }]}>
                                        Closest match: {result.closest_match} ({Math.round((1 - (result.closest_distance || 0)) * 100)}% similar)
                                    </Text>
                                </View>
                            )}

                            {/* Relationship Hint */}
                            {result.match && result.relationship && (
                                <View style={styles.relationshipHint}>
                                    <Text style={styles.hintIcon}>💡</Text>
                                    <Text style={styles.hintText}>
                                        {result.relationship}
                                    </Text>
                                </View>
                            )}

                            {/* Loading State for Related Info */}
                            {loadingRelated && (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <ActivityIndicator color="#3B82F6" />
                                    <Text style={{ color: '#64748B', marginTop: 8 }}>Finding memories...</Text>
                                </View>
                            )}

                            {/* SECTION: Photos of Person */}
                            {!loadingRelated && relatedPhotos.length > 0 && (
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Photos of {result.name}</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                                        {relatedPhotos.map((url, idx) => (
                                            <Image
                                                key={`photo-${idx}`}
                                                source={{ uri: url }}
                                                style={styles.relatedPhoto}
                                            />
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* SECTION: Shared Memories */}
                            {!loadingRelated && memories.length > 0 && (
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Shared Moments</Text>
                                    <View style={{ gap: 16, marginTop: 12 }}>
                                        {memories.map((mem) => (
                                            <View key={mem.id} style={styles.memoryCard}>
                                                {mem.photoUrls && mem.photoUrls[0] && (
                                                    <Image
                                                        source={{ uri: mem.photoUrls[0] }}
                                                        style={styles.memoryImage}
                                                    />
                                                )}
                                                <View style={styles.memoryContent}>
                                                    <Text style={styles.memoryTitle}>{mem.title}</Text>
                                                    <Text style={styles.memoryDate}>
                                                        {new Date(mem.date).toLocaleDateString()} • {mem.event}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Suggestion */}
                            {result.match && (
                                <View style={[styles.relationshipHint, { marginTop: 16, backgroundColor: '#FFF7ED' }]}>
                                    <Text style={styles.hintIcon}>🗣️</Text>
                                    <Text style={[styles.hintText, { color: '#C2410C' }]}>
                                        Say: "Hello {result.name}, nice to see you!"
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity style={styles.tryAgainButton} onPress={resetRecognition}>
                                <Text style={styles.tryAgainText}>Scan Another Face</Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.captureButton, recognizing && styles.captureButtonDisabled]}
                        onPress={handleCapture}
                        disabled={recognizing}
                    >
                        <View style={styles.captureButtonInner}>
                            {recognizing ? (
                                <ActivityIndicator size="large" color="#3B82F6" />
                            ) : (
                                <Text style={styles.captureIcon}>🔍</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100, // Shift up slightly to avoid controls
    },
    faceGuide: {
        width: 280,
        height: 320,
        position: 'relative',
    },
    faceGuideCorner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#FEF08A', // Yellow-200 (High contrast against cam)
        borderWidth: 6,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        top: 0,
        left: 0,
        borderTopLeftRadius: 24,
    },
    topRight: {
        borderLeftWidth: 0,
        borderRightWidth: 6,
        left: 'auto',
        right: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 24,
    },
    bottomLeft: {
        borderTopWidth: 0,
        borderBottomWidth: 6,
        top: 'auto',
        bottom: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 24,
    },
    bottomRight: {
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 6,
        borderBottomWidth: 6,
        top: 'auto',
        bottom: 0,
        left: 'auto',
        right: 0,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 24,
    },
    guideText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 32,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        letterSpacing: 0.5,
    },
    controls: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // Default shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
    },
    fullScreenControls: {
        height: '100%',
        borderRadius: 0,
        paddingTop: 60, // Add top padding for safe area
    },
    captureButton: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    captureButtonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
    },
    captureButtonInner: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    captureIcon: {
        fontSize: 32,
    },
    capturingText: {
        fontSize: 32,
    },
    resultCard: {
        width: '100%',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    resultIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconGreen: { backgroundColor: '#DCFCE7' },
    iconGray: { backgroundColor: '#F1F5F9' },
    iconRed: { backgroundColor: '#FEE2E2' },
    iconYellow: { backgroundColor: '#FEF3C7' },
    resultIcon: {
        fontSize: 32,
    },
    resultName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    resultConfidence: {
        fontSize: 16,
        color: '#64748B',
    },
    relationshipHint: {
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    hintIcon: {
        fontSize: 20,
    },
    hintText: {
        color: '#1E40AF',
        fontSize: 18,
        flex: 1,
        lineHeight: 24,
        fontWeight: '500',
    },
    tryAgainButton: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    tryAgainText: {
        color: '#475569',
        fontWeight: '700',
        fontSize: 18,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        padding: 24,
    },
    permissionCard: {
        backgroundColor: '#FFFFFF',
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 18,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 26,
    },
    permissionButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    // New Styles
    sectionContainer: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
    },
    relatedPhoto: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: '#F1F5F9',
    },
    memoryCard: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        gap: 16,
    },
    memoryImage: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
    },
    memoryContent: {
        flex: 1,
    },
    memoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    memoryDate: {
        fontSize: 14,
        color: '#64748B',
    },
});
