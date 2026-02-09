// Face Recognition Screen - Premium Redesign
// Features: Animated oval guide, camera state management, loading phrases, elderly-friendly UI
import { useState, useRef, useEffect } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, Alert,
    ActivityIndicator, ScrollView, Image, FlatList,
    Dimensions, Animated, Easing
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { api } from '../../lib/api';
import { recognizeFace, RecognitionResult, getErrorMessage } from '../../lib/recognition';
import { Memory } from '../../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Camera,
    UserCheck,
    RefreshCw,
    Search,
    Brain,
    ImageIcon,
    Sparkles,
    Target,
    XCircle,
    AlertCircle,
    UserX,
    Users,
    Settings,
    AlertTriangle,
    Lightbulb,
    ChevronRight,
    Heart,
    MessageCircle,
    MapPin,
    Calendar,
    ScanLine
} from 'lucide-react-native';
import ReAnimated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Loading phrases for interactive waiting experience
const LOADING_PHRASES = [
    { icon: <Search size={24} color={Theme.colors.primary} />, text: 'Scanning face...' },
    { icon: <Brain size={24} color={Theme.colors.primary} />, text: 'Checking my memory...' },
    { icon: <Search size={24} color={Theme.colors.primary} />, text: 'Looking for a match...' },
    { icon: <Sparkles size={24} color={Theme.colors.primary} />, text: 'Let me think...' },
    { icon: <ImageIcon size={24} color={Theme.colors.primary} />, text: 'Searching family photos...' },
    { icon: <Sparkles size={24} color={Theme.colors.primary} />, text: 'Almost there...' },
    { icon: <Target size={24} color={Theme.colors.primary} />, text: 'Finding the right person...' },
];

// Animated Oval Face Guide Component
function FaceGuideOval({ faceDetected, isScanning }: { faceDetected: boolean; isScanning: boolean }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const colorAnim = useRef(new Animated.Value(faceDetected ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(colorAnim, {
            toValue: faceDetected ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [faceDetected]);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.03,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        if (isScanning) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                })
            ).start();
        } else {
            rotateAnim.setValue(0);
        }
    }, [isScanning]);

    const borderColor = colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: isScanning ? ['#FCD34D', '#FCD34D'] : ['#EF4444', '#22C55E'],
    });

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.ovalContainer}>
            <Animated.View
                style={[
                    styles.ovalGuide,
                    {
                        transform: [{ scale: pulseAnim }],
                        borderColor: borderColor,
                    },
                ]}
            >
                <Animated.View style={[styles.ovalInner, { borderColor: borderColor }]} />
            </Animated.View>

            {isScanning && (
                <Animated.View
                    style={[
                        styles.scanningIndicator,
                        { transform: [{ rotate }] }
                    ]}
                >
                    <View style={styles.scanningDot} />
                </Animated.View>
            )}

            <View style={[styles.cornerDeco, styles.cornerTopLeft]} />
            <View style={[styles.cornerDeco, styles.cornerTopRight]} />
            <View style={[styles.cornerDeco, styles.cornerBottomLeft]} />
            <View style={[styles.cornerDeco, styles.cornerBottomRight]} />
        </View>
    );
}

// Scanning Line Animation Component
function ScanningLine() {
    const lineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(lineAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(lineAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateY = lineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 280],
    });

    return (
        <Animated.View
            style={[
                styles.scanLine,
                { transform: [{ translateY }] }
            ]}
        />
    );
}

// Error Modal Component
interface ErrorModalProps {
    result: RecognitionResult;
    onTryAgain: () => void;
}

const ERROR_CONFIG: Record<string, {
    icon: any;
    title: string;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    no_face: {
        icon: XCircle,
        title: 'No Face Detected',
        color: '#DC2626',
        bgColor: '#FEE2E2',
        borderColor: '#FECACA',
    },
    low_quality_face: {
        icon: Camera,
        title: 'Image Too Blurry',
        color: '#D97706',
        bgColor: '#FEF3C7',
        borderColor: '#FDE68A',
    },
    unknown_person: {
        icon: UserX,
        title: 'Person Not Recognized',
        color: '#2563EB',
        bgColor: '#DBEAFE',
        borderColor: '#BFDBFE',
    },
    no_family_data: {
        icon: Users,
        title: 'No Family Data',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        borderColor: '#E5E7EB',
    },
    processing_error: {
        icon: Settings,
        title: 'Processing Failed',
        color: '#EA580C',
        bgColor: '#FFEDD5',
        borderColor: '#FED7AA',
    },
    detection_error: {
        icon: AlertTriangle,
        title: 'Detection Error',
        color: '#DC2626',
        bgColor: '#FEE2E2',
        borderColor: '#FECACA',
    },
};

function ErrorModal({ result, onTryAgain }: ErrorModalProps) {
    const errorType = result.error_type || 'detection_error';
    const config = ERROR_CONFIG[errorType] || ERROR_CONFIG.detection_error;
    const IconComponent = config.icon;

    return (
        <View style={errorModalStyles.overlay}>
            <ReAnimated.View entering={FadeIn.duration(300)} style={errorModalStyles.backdrop} />

            <ReAnimated.View
                entering={FadeInUp.duration(500).springify()}
                style={[
                    errorModalStyles.modal,
                    { borderColor: config.borderColor }
                ]}
            >
                <View style={[
                    errorModalStyles.iconCircle,
                    { backgroundColor: config.bgColor }
                ]}>
                    <IconComponent size={48} color={config.color} strokeWidth={2.5} />
                </View>

                <Text style={[errorModalStyles.title, { color: config.color }]}>
                    {config.title}
                </Text>

                <Text style={errorModalStyles.message}>
                    {getErrorMessage(result)}
                </Text>

                {result.suggestion && (
                    <View style={[errorModalStyles.suggestionCard, { backgroundColor: config.bgColor }]}>
                        <Lightbulb size={20} color={config.color} style={{ marginRight: 12 }} />
                        <Text style={[errorModalStyles.suggestionText, { color: config.color }]}>
                            {result.suggestion}
                        </Text>
                    </View>
                )}

                {errorType === 'unknown_person' && result.closest_match && (
                    <View style={errorModalStyles.closestMatchCard}>
                        <Text style={errorModalStyles.closestMatchLabel}>Closest Match:</Text>
                        <Text style={errorModalStyles.closestMatchName}>{result.closest_match}</Text>
                        <Text style={errorModalStyles.closestMatchConfidence}>
                            {Math.round((1 - (result.closest_distance || 0)) * 100)}% similar
                        </Text>
                    </View>
                )}

                <View style={errorModalStyles.divider} />

                <TouchableOpacity
                    style={[errorModalStyles.button, { backgroundColor: config.color }]}
                    onPress={onTryAgain}
                    activeOpacity={0.8}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <RefreshCw size={20} color="#FFFFFF" strokeWidth={2.5} />
                        <Text style={errorModalStyles.buttonText}>Try Again</Text>
                    </View>
                </TouchableOpacity>

                <Text style={errorModalStyles.helpText}>
                    {errorType === 'no_face' && 'Make sure the face is clearly visible in the frame'}
                    {errorType === 'low_quality_face' && 'Try moving to a brighter area'}
                    {errorType === 'unknown_person' && 'This person may not be in the family database'}
                    {errorType === 'no_family_data' && 'Contact your caregiver to add family members'}
                    {errorType === 'processing_error' && 'There was a temporary issue. Please try again.'}
                    {errorType === 'detection_error' && 'Something went wrong. Please try again.'}
                </Text>
            </ReAnimated.View>
        </View>
    );
}

// Error Modal Styles
const errorModalStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modal: {
        width: SCREEN_WIDTH - 48,
        backgroundColor: Theme.colors.surface,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        width: '100%',
    },
    suggestionText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    closestMatchCard: {
        backgroundColor: Theme.colors.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    closestMatchLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 12,
        color: Theme.colors.textSecondary,
        marginBottom: 4,
    },
    closestMatchName: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        fontWeight: '700',
        color: Theme.colors.text,
        marginBottom: 4,
    },
    closestMatchConfidence: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: Theme.colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: Theme.colors.border,
        width: '100%',
        marginBottom: 20,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    helpText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 13,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default function RecognizeScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [recognizing, setRecognizing] = useState(false);
    const [result, setResult] = useState<RecognitionResult | null>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [faceDetected, setFaceDetected] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);

    const [memories, setMemories] = useState<Memory[]>([]);
    const [relatedPhotos, setRelatedPhotos] = useState<string[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        if (capturedPhoto || result) return;
        const timer = setTimeout(() => setFaceDetected(true), 2000);
        return () => {
            clearTimeout(timer);
            setFaceDetected(false);
        };
    }, [capturedPhoto, result]);

    useEffect(() => {
        if (!recognizing) return;
        const interval = setInterval(() => {
            setPhraseIndex(prev => (prev + 1) % LOADING_PHRASES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [recognizing]);

    const fetchRelatedContent = async (name: string, id?: string) => {
        setLoadingRelated(true);
        try {
            const memRes = await api.getMemoriesByPerson(name);
            if (memRes.data) {
                setMemories(memRes.data);
            }

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

    useEffect(() => {
        if (result && result.match && result.name) {
            fetchRelatedContent(result.name, result.id);
        }
    }, [result]);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <ReAnimated.View
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.permissionCard}
                >
                    <View style={styles.permissionIconBg}>
                        <Camera size={48} color={Theme.colors.primary} strokeWidth={2} />
                    </View>
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionText}>
                        To help you recognize your loved ones, Memora needs access to your camera.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Allow Camera</Text>
                    </TouchableOpacity>
                </ReAnimated.View>
            </View>
        );
    }

    const handleCapture = async () => {
        if (!cameraRef.current || recognizing) return;
        setRecognizing(true);
        setResult(null);
        setPhraseIndex(0);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.7,
                shutterSound: false,
            });

            if (!photo?.base64) throw new Error("Failed to capture image");
            setCapturedPhoto(`data:image/jpeg;base64,${photo.base64}`);

            let patientId = null;
            const patientData = await AsyncStorage.getItem('patient');
            if (patientData) patientId = JSON.parse(patientData).id;

            if (!patientId) {
                Alert.alert("Error", "Please log in again.");
                setCapturedPhoto(null);
                return;
            }

            const apiResult = await recognizeFace(photo.base64, patientId);
            setResult(apiResult);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Oops!', error.message || 'Something went wrong. Please try again.');
            setCapturedPhoto(null);
        } finally {
            setRecognizing(false);
        }
    };

    const resetRecognition = () => {
        setResult(null);
        setCapturedPhoto(null);
        setMemories([]);
        setRelatedPhotos([]);
        setPhraseIndex(0);
    };

    const showCamera = !capturedPhoto && !result;
    const showProcessing = capturedPhoto && recognizing && !result;
    const showResult = result !== null;

    return (
        <View style={styles.container}>
            {showCamera && (
                <>
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing="back"
                    />

                    <Animated.View style={styles.header}>
                        <Text style={styles.headerTitle}>Who Is This?</Text>
                        <Text style={styles.headerSubtitle}>
                            {faceDetected ? '✓ Ready! Tap to scan' : 'Center the face in the oval'}
                        </Text>
                    </Animated.View>

                    <View style={styles.guideContainer}>
                        <FaceGuideOval faceDetected={faceDetected} isScanning={false} />
                    </View>

                    <View style={styles.captureContainer}>
                        <Text style={styles.captureHint}>Tap to scan</Text>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={handleCapture}
                            activeOpacity={0.8}
                        >
                            <View style={styles.captureButtonInner}>
                                <ScanLine size={36} color={Theme.colors.primary} strokeWidth={2.5} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {showProcessing && capturedPhoto && (
                <View style={styles.processingContainer}>
                    <Image source={{ uri: capturedPhoto }} style={styles.capturedImage} resizeMode="cover" />
                    <View style={styles.scanningOverlay}>
                        <FaceGuideOval faceDetected={true} isScanning={true} />
                        <ScanningLine />
                    </View>

                    <ReAnimated.View
                        entering={FadeInUp.duration(600).springify()}
                        style={styles.loadingCard}
                    >
                        <View style={styles.loadingIconBox}>
                            {LOADING_PHRASES[phraseIndex].icon}
                        </View>
                        <Text style={styles.loadingText}>
                            {LOADING_PHRASES[phraseIndex].text}
                        </Text>
                        <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 16 }} />
                    </ReAnimated.View>
                </View>
            )}

            {showResult && result && (
                <>
                    {!result.match && (
                        <ErrorModal result={result} onTryAgain={resetRecognition} />
                    )}

                    {result.match && (
                        <View style={successStyles.container}>
                            <ScrollView
                                contentContainerStyle={successStyles.scroll}
                                showsVerticalScrollIndicator={false}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#047857']}
                                    style={successStyles.headerGradient}
                                >
                                    <ReAnimated.View entering={FadeInDown.delay(200).duration(800).springify()}>
                                        <View style={successStyles.checkBadge}>
                                            <UserCheck size={32} color="#FFFFFF" strokeWidth={3} />
                                        </View>
                                        <Text style={successStyles.personName}>{result.name}</Text>
                                        {result.relationship && (
                                            <View style={successStyles.relationshipBadge}>
                                                <Text style={successStyles.relationshipText}>
                                                    {result.relationship}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={successStyles.confidenceContainer}>
                                            <View style={successStyles.confidenceRing}>
                                                <Text style={successStyles.confidencePercent}>
                                                    {Math.round((result.confidence || 0) * 100)}%
                                                </Text>
                                            </View>
                                            <Text style={successStyles.confidenceLabel}>Match Confidence</Text>
                                        </View>
                                    </ReAnimated.View>
                                </LinearGradient>

                                <ReAnimated.View entering={FadeInUp.delay(400).duration(800)}>
                                    {!loadingRelated && relatedPhotos.length > 0 && (
                                        <View style={successStyles.section}>
                                            <View style={successStyles.sectionHeader}>
                                                <Text style={successStyles.sectionTitle}>📸 Photos of {result.name}</Text>
                                                <Text style={successStyles.photoCount}>{relatedPhotos.length} photos</Text>
                                            </View>

                                            <Image
                                                source={{ uri: relatedPhotos[0] }}
                                                style={successStyles.heroPhoto}
                                            />

                                            {relatedPhotos.length > 1 && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={successStyles.photoStrip}>
                                                    {relatedPhotos.slice(1).map((url, idx) => (
                                                        <Image
                                                            key={`photo-${idx}`}
                                                            source={{ uri: url }}
                                                            style={successStyles.thumbnailPhoto}
                                                        />
                                                    ))}
                                                </ScrollView>
                                            )}
                                        </View>
                                    )}

                                    {loadingRelated && (
                                        <View style={successStyles.loadingSection}>
                                            <ActivityIndicator color={Theme.colors.primary} size="large" />
                                            <Text style={successStyles.loadingText}>Finding your shared memories...</Text>
                                        </View>
                                    )}

                                    {!loadingRelated && memories.length > 0 && (
                                        <View style={successStyles.section}>
                                            <Text style={successStyles.sectionTitle}>💝 Shared Moments</Text>
                                            {memories.map((mem) => (
                                                <View key={mem.id} style={successStyles.memoryCard}>
                                                    {mem.photoUrls?.[0] && (
                                                        <Image
                                                            source={{ uri: mem.photoUrls[0] }}
                                                            style={successStyles.memoryPhoto}
                                                        />
                                                    )}
                                                    <View style={successStyles.memoryContent}>
                                                        <Text style={successStyles.memoryTitle}>{mem.title}</Text>
                                                        <View style={successStyles.memoryMeta}>
                                                            <View style={successStyles.dateBadge}>
                                                                <Text style={successStyles.dateText}>
                                                                    <Calendar size={12} color={Theme.colors.primary} /> {new Date(mem.date).toLocaleDateString()}
                                                                </Text>
                                                            </View>
                                                            <View style={successStyles.eventBadge}>
                                                                <Text style={successStyles.eventText}>
                                                                    <Sparkles size={12} color="#D97706" /> {mem.event}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <View style={successStyles.section}>
                                        <Text style={successStyles.sectionTitle}>💬 Start a Conversation</Text>
                                        <View style={successStyles.conversationCard}>
                                            <MessageCircle size={28} color={Theme.colors.primary} style={{ marginRight: 16 }} />
                                            <Text style={successStyles.conversationText}>
                                                "Hello {result.name}, it's so nice to see you!"
                                            </Text>
                                        </View>
                                        <View style={successStyles.conversationCard}>
                                            <Heart size={28} color="#EF4444" fill="#FEE2E2" style={{ marginRight: 16 }} />
                                            <Text style={successStyles.conversationText}>
                                                "I'm happy you're here, {result.name}!"
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={successStyles.scanButton}
                                        onPress={resetRecognition}
                                        activeOpacity={0.8}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <ScanLine size={24} color="#FFFFFF" strokeWidth={2.5} />
                                            <Text style={successStyles.scanButtonText}>Scan Another Face</Text>
                                        </View>
                                    </TouchableOpacity>
                                </ReAnimated.View>
                            </ScrollView>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    headerTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    headerSubtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
    },
    guideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 100,
    },
    ovalContainer: {
        width: 240,
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ovalGuide: {
        width: 220,
        height: 300,
        borderRadius: 110,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ovalInner: {
        width: 200,
        height: 280,
        borderRadius: 100,
        borderWidth: 2,
        borderStyle: 'dashed',
        opacity: 0.5,
    },
    scanningIndicator: {
        position: 'absolute',
        width: 240,
        height: 320,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    scanningDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FCD34D',
        marginTop: -6,
    },
    cornerDeco: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: 'rgba(255,255,255,0.5)',
        borderWidth: 3,
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 8,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 8,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 8,
    },
    captureContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captureHint: {
        fontFamily: Theme.typography.fontFamily,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        marginBottom: 16,
        fontWeight: '500',
    },
    captureButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    captureButtonInner: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingContainer: {
        flex: 1,
    },
    capturedImage: {
        ...StyleSheet.absoluteFillObject,
    },
    scanningOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    scanLine: {
        position: 'absolute',
        width: 200,
        height: 3,
        backgroundColor: '#22C55E',
        borderRadius: 2,
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    loadingCard: {
        position: 'absolute',
        bottom: 60,
        left: 24,
        right: 24,
        backgroundColor: Theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    loadingIconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    loadingText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        fontWeight: '700',
        color: Theme.colors.text,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        padding: 24,
    },
    permissionCard: {
        backgroundColor: Theme.colors.surface,
        padding: 40,
        borderRadius: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
    },
    permissionIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    permissionTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 26,
        fontWeight: '800',
        color: Theme.colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    permissionText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 28,
    },
    permissionButton: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    permissionButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

// Success View Styles
const successStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scroll: {
        paddingBottom: 40,
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    checkBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        alignSelf: 'center',
    },
    personName: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    relationshipBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
        alignSelf: 'center',
    },
    relationshipText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    confidenceContainer: {
        alignItems: 'center',
    },
    confidenceRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    confidencePercent: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    confidenceLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        fontWeight: '700',
        color: Theme.colors.text,
        marginBottom: 16,
    },
    photoCount: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
    },
    heroPhoto: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        marginBottom: 12,
    },
    photoStrip: {
        marginTop: 4,
    },
    thumbnailPhoto: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 10,
    },
    loadingSection: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: Theme.typography.fontFamily,
        marginTop: 16,
        fontSize: 16,
        color: Theme.colors.textSecondary,
    },
    memoryCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    memoryPhoto: {
        width: '100%',
        height: 160,
    },
    memoryContent: {
        padding: 16,
    },
    memoryTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        fontWeight: '700',
        color: Theme.colors.text,
        marginBottom: 12,
    },
    memoryMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dateBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    dateText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 13,
        color: Theme.colors.primary,
        fontWeight: '600',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    eventText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 13,
        color: '#D97706',
        fontWeight: '600',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    conversationCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Theme.colors.border,
    },
    conversationText: {
        fontFamily: Theme.typography.fontFamily,
        flex: 1,
        fontSize: 16,
        color: Theme.colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 24,
    },
    scanButton: {
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: Theme.colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    scanButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
