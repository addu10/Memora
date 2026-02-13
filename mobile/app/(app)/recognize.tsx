// Face Recognition Screen - Premium Redesign
// Features: Animated oval guide, camera state management, loading phrases, elderly-friendly UI
import { useState, useRef, useEffect } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, Alert,
    ActivityIndicator, ScrollView, Image, FlatList,
    Dimensions, Animated, Easing, Modal, Platform,
    NativeSyntheticEvent, NativeScrollEvent
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { api } from '../../lib/api';
import { StatusModal } from '../../components/StatusModal';
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
    ChevronLeft,
    Heart,
    CheckCircle2,
    MessageCircle,
    MapPin,
    Calendar,
    ScanLine,
    Play,
    Pause
} from 'lucide-react-native';
import ReAnimated, {
    FadeInDown, FadeInUp, FadeIn,
    useSharedValue, useAnimatedStyle, withTiming,
    Easing as ReEasing, interpolate, runOnJS,
    cancelAnimation, withRepeat, withSequence,
    interpolateColor
} from 'react-native-reanimated';

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
    const pulse = useSharedValue(1);
    const rotation = useSharedValue(0);
    const colorProgress = useSharedValue(faceDetected ? 1 : 0);
    const scale = useSharedValue(1);

    useEffect(() => {
        colorProgress.value = withTiming(faceDetected ? 1 : 0, { duration: 300 });
    }, [faceDetected]);

    useEffect(() => {
        // Subtle pulse for the oval guide
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.03, { duration: 1500, easing: ReEasing.inOut(ReEasing.ease) }),
                withTiming(1, { duration: 1500, easing: ReEasing.inOut(ReEasing.ease) })
            ),
            -1,
            false
        );
    }, []);

    useEffect(() => {
        if (isScanning) {
            rotation.value = withRepeat(
                withTiming(1, { duration: 3000, easing: ReEasing.linear }),
                -1,
                false
            );

            scale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1200, easing: ReEasing.inOut(ReEasing.ease) }),
                    withTiming(0.98, { duration: 1200, easing: ReEasing.inOut(ReEasing.ease) })
                ),
                -1,
                true
            );
        } else {
            rotation.value = 0;
            scale.value = 1;
        }
    }, [isScanning]);

    const hudRingStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value * 360}deg` } as any,
                { scale: scale.value } as any
            ],
            display: isScanning ? 'flex' : 'none'
        } as any;
    }, [isScanning]);

    const ovalStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            colorProgress.value,
            [0, 1],
            isScanning ? ['#FCD34D', '#FCD34D'] : ['#EF4444', '#22C55E']
        );

        return {
            transform: [{ scale: pulse.value }],
            borderColor: borderColor as any, // Cast for reanimated color interpolation
            shadowColor: isScanning ? '#22C55E' : 'transparent',
            shadowOpacity: isScanning ? 0.8 : 0,
        };
    });

    const innerStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            colorProgress.value,
            [0, 1],
            isScanning ? ['#FCD34D', '#FCD34D'] : ['#EF4444', '#22C55E']
        );
        return { borderColor: borderColor as any };
    }, [isScanning]);

    return (
        <View style={styles.ovalContainer}>
            {/* Outer Rotating HUD Ring */}
            <ReAnimated.View style={[styles.hudRing, hudRingStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(34, 197, 94, 0.8)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hudRingGradient}
                />
            </ReAnimated.View>

            <ReAnimated.View style={[styles.ovalGuide, ovalStyle]}>
                <ReAnimated.View style={[styles.ovalInner, innerStyle]} />
            </ReAnimated.View>

            {isScanning && (
                <View style={styles.scanningLineClipper}>
                    <ScanningLine />
                </View>
            )}

            {/* Corner Decorative Elements */}
            <View style={[styles.cornerDeco, styles.cornerTopLeft, { borderColor: isScanning ? '#22C55E' : 'rgba(255,255,255,0.5)' }]} />
            <View style={[styles.cornerDeco, styles.cornerTopRight, { borderColor: isScanning ? '#22C55E' : 'rgba(255,255,255,0.5)' }]} />
            <View style={[styles.cornerDeco, styles.cornerBottomLeft, { borderColor: isScanning ? '#22C55E' : 'rgba(255,255,255,0.5)' }]} />
            <View style={[styles.cornerDeco, styles.cornerBottomRight, { borderColor: isScanning ? '#22C55E' : 'rgba(255,255,255,0.5)' }]} />
        </View>
    );
}

// Scanning Line Animation Component
function ScanningLine() {
    const lineAnim = useSharedValue(0);

    useEffect(() => {
        lineAnim.value = withRepeat(
            withTiming(1, { duration: 1500, easing: ReEasing.inOut(ReEasing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        // Range: -60 to 300 allows the line to fully enter and exit the 300px clipper
        transform: [{ translateY: -60 + (lineAnim.value * 360) }]
    }));

    return (
        <View style={styles.scanLineContainer}>
            <ReAnimated.View style={[styles.scanLine, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', '#22C55E', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.scanLineGradient}
                />
            </ReAnimated.View>
        </View>
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

// Slideshow Modal Component
function SlideshowModal({ photos, visible, onClose }: { photos: string[], visible: boolean, onClose: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Shared values for visual polish
    const fade = useSharedValue(1);
    const zoom = useSharedValue(1);
    const progress = useSharedValue(0);

    const SLIDE_DURATION = 5000;

    const handleNext = () => {
        fade.value = withTiming(0, { duration: 400 }, (finished) => {
            if (finished) {
                runOnJS(setCurrentIndex)((currentIndex + 1) % photos.length);
                fade.value = withTiming(1, { duration: 400 });
            }
        });
    };

    const handlePrevious = () => {
        fade.value = withTiming(0, { duration: 400 }, (finished) => {
            if (finished) {
                runOnJS(setCurrentIndex)((currentIndex - 1 + photos.length) % photos.length);
                fade.value = withTiming(1, { duration: 400 });
            }
        });
    };

    // 1. Handle actual index transitions (State source of truth)
    useEffect(() => {
        if (!visible) return;
        if (!isPlaying || photos.length <= 1) {
            console.log(`[SLIDESHOW] Playback paused/static. Photos: ${photos.length}, Playing: ${isPlaying}`);
            return;
        }

        console.log(`[SLIDESHOW] 🎬 Slide cycle started. Duration: ${SLIDE_DURATION}ms`);
        const timer = setInterval(() => {
            // Start fade out transition
            fade.value = withTiming(0, { duration: 800 }, (finished) => {
                if (finished) {
                    const nextIndex = (currentIndex + 1) % photos.length;
                    console.log(`[SLIDESHOW] ⏭️ Transitioning to slide ${nextIndex + 1}/${photos.length}: ${photos[nextIndex]}`);
                    runOnJS(setCurrentIndex)(nextIndex);
                    fade.value = withTiming(1, { duration: 800 });
                }
            });
        }, SLIDE_DURATION);

        return () => {
            console.log("[SLIDESHOW] Clearing slide transition timer");
            clearInterval(timer);
        };
    }, [visible, isPlaying, photos.length, currentIndex]);

    // 2. Handle visual animations on index or state change
    useEffect(() => {
        if (!visible) {
            if (currentIndex !== 0) setCurrentIndex(0); // Reset for next time
            return;
        }

        console.log(`[SLIDESHOW] Viewing slide ${currentIndex + 1}/${photos.length}`);

        if (isPlaying && photos.length > 1) {
            // Reset and start visuals
            progress.value = 0;
            zoom.value = 1;
            progress.value = withTiming(1, { duration: SLIDE_DURATION, easing: ReEasing.linear });
            zoom.value = withTiming(1.2, { duration: SLIDE_DURATION, easing: ReEasing.linear });
        } else {
            // Pause visuals
            cancelAnimation(progress);
            cancelAnimation(zoom);
        }
    }, [currentIndex, isPlaying, visible, photos.length]);

    const imageAnimatedStyle = useAnimatedStyle(() => ({
        opacity: fade.value,
        transform: [{ scale: zoom.value }]
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`
    }));

    if (photos.length === 0) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent={false}>
            <View style={slideshowStyles.container}>
                <LinearGradient
                    colors={['#FFFFFF', '#F5F3FF']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Subtle themed overlay */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: Theme.colors.primaryUltraLight, opacity: 0.1 }]} />

                <ReAnimated.View style={[slideshowStyles.imageContainer, imageAnimatedStyle]}>
                    <Image
                        source={{ uri: photos[currentIndex] }}
                        style={slideshowStyles.image}
                        resizeMode="contain"
                    />
                </ReAnimated.View>

                {/* Top Progress Bar */}
                <View style={slideshowStyles.progressContainer}>
                    <View style={slideshowStyles.progressBarBg}>
                        <ReAnimated.View style={[slideshowStyles.progressBarFill, progressStyle]} />
                    </View>
                </View>

                <View style={slideshowStyles.controls}>
                    <View style={slideshowStyles.topBar}>
                        <View style={slideshowStyles.headerInfo}>
                            <Heart size={20} color={Theme.colors.primary} fill={Theme.colors.primary} />
                            <Text style={slideshowStyles.headerTitle}>Shared Memories</Text>
                        </View>
                        <TouchableOpacity
                            style={slideshowStyles.glassButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <XCircle size={28} color={Theme.colors.textSecondary} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <View style={slideshowStyles.bottomActions}>
                        <View style={slideshowStyles.mainControls}>
                            <TouchableOpacity
                                style={slideshowStyles.glassNavButton}
                                onPress={handlePrevious}
                                activeOpacity={0.7}
                            >
                                <ChevronLeft size={28} color={Theme.colors.textSecondary} strokeWidth={2.5} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={slideshowStyles.glassPlayButton}
                                onPress={() => setIsPlaying(!isPlaying)}
                                activeOpacity={0.7}
                            >
                                {isPlaying ? (
                                    <Pause size={28} color={Theme.colors.text} fill={Theme.colors.text} />
                                ) : (
                                    <Play size={28} color={Theme.colors.text} fill={Theme.colors.text} />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={slideshowStyles.glassNavButton}
                                onPress={handleNext}
                                activeOpacity={0.7}
                            >
                                <ChevronRight size={28} color={Theme.colors.textSecondary} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>

                        <View style={slideshowStyles.counterBadge}>
                            <Text style={slideshowStyles.counter}>
                                {currentIndex + 1} <Text style={{ fontSize: 14, opacity: 0.6 }}>/ {photos.length}</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={slideshowStyles.footer}>
                    <Text style={slideshowStyles.soothingText}>Hold on to these beautiful moments...</Text>
                </View>
            </View>
        </Modal>
    );
}

const slideshowStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    progressContainer: {
        position: 'absolute',
        top: 100,
        left: 24,
        right: 24,
        zIndex: 20,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: Theme.colors.primaryUltraLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Theme.colors.success,
        borderRadius: 3,
    },
    controls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 24,
        paddingTop: 50,
        justifyContent: 'space-between',
        zIndex: 30,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primaryUltraLight,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
    },
    headerTitle: {
        fontFamily: Theme.typography.fontFamily,
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    glassButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.primaryUltraLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassNavButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Theme.colors.primaryUltraLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.primaryLight,
    },
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 60,
        paddingHorizontal: 12,
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    glassPlayButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.colors.primaryUltraLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.primaryLight,
    },
    counterBadge: {
        backgroundColor: Theme.colors.primaryUltraLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Theme.colors.primaryLight,
    },
    counter: {
        fontFamily: Theme.typography.fontFamily,
        color: Theme.colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    soothingText: {
        fontFamily: Theme.typography.fontFamily,
        color: Theme.colors.textSecondary,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 26,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
    },
});

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
    const [activeRecognitionSlide, setActiveRecognitionSlide] = useState(0); // For success carousel
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [faceDetected, setFaceDetected] = useState(false);
    const [statusModal, setStatusModal] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
    });
    const [phraseIndex, setPhraseIndex] = useState(0);

    const [memories, setMemories] = useState<Memory[]>([]);
    const [relatedPhotos, setRelatedPhotos] = useState<string[]>([]);
    const [slideshowPhotos, setSlideshowPhotos] = useState<string[]>([]);
    const [isSlideshowVisible, setIsSlideshowVisible] = useState(false);
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
        console.log(`[DATA_FETCH] 🔍 Loading shared content for: ${name} (ID: ${id || 'N/A'})`);
        setLoadingRelated(true);
        try {
            // 1. Fetch memories to identify where the person is mentioned
            const memRes = await api.getMemoriesByPerson(name);
            const memoryList = memRes.data || [];
            console.log(`[DATA_FETCH] Found ${memoryList.length} shared memories mentioning ${name}`);
            if (memRes.data) {
                setMemories(memRes.data);
            }

            // 2. Fetch specific photos where this person is tagged (MemoryPhoto table)
            // This is what the user prefers as it's more accurate
            const memoryIds = memoryList.map(m => m.id);
            let taggedPhotos: string[] = [];

            if (memoryIds.length > 0) {
                console.log(`[DATA_FETCH] Checking specific photo tags across ${memoryIds.length} memories...`);
                const taggedRes = await api.getTaggedPhotos(name, memoryIds);
                if (taggedRes.data) {
                    taggedPhotos = taggedRes.data;
                    console.log(`[DATA_FETCH] Found ${taggedPhotos.length} specifically tagged photos of ${name}`);
                }
            }

            // 3. Set profile photos separately for the horizontal strip (if id exists)
            if (id) {
                const famRes = await api.getFamilyMemberById(id);
                if (famRes.data && famRes.data.photoUrls) {
                    console.log(`[DATA_FETCH] Loaded ${famRes.data.photoUrls.length} profile photos from family record`);
                    setRelatedPhotos(famRes.data.photoUrls);
                }
            }

            // 4. Use ONLY tagged memory photos for the slideshow
            const uniqueSlideshowPhotos = Array.from(new Set(
                taggedPhotos
                    .filter(url => url && url.length > 0)
                    .map(url => url.trim())
            ));

            console.log(`[DATA_FETCH] Slideshow initialized with ${uniqueSlideshowPhotos.length} unique tagged photos`);
            setSlideshowPhotos(uniqueSlideshowPhotos);
        } catch (e) {
            console.error("[DATA_FETCH_ERROR] Failed to load related content:", e);
        } finally {
            setLoadingRelated(false);
        }
    };

    useEffect(() => {
        if (result && result.match && result.name) {
            fetchRelatedContent(result.name, result.id);
        }
    }, [result]);

    const handleRecognitionScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = SCREEN_WIDTH - 40; // Width of the slideItem
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setActiveRecognitionSlide(index);
    };

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
        console.log("[RECOGNIZE] 📸 Starting face recognition flow...");
        setRecognizing(true);
        setResult(null);
        setPhraseIndex(0);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.7,
                shutterSound: false,
            });

            console.log(`[RECOGNIZE] Photo captured successfully. URI: ${photo.uri}, Size: ${photo.base64?.length || 0} chars`);
            setCapturedPhoto(`data:image/jpeg;base64,${photo.base64}`);

            let patientId = null;
            const patientData = await AsyncStorage.getItem('patient');
            if (patientData) {
                const p = JSON.parse(patientData);
                patientId = p.id;
                console.log("[RECOGNIZE] Patient profile loaded for recognition:", p.name, `(${patientId})`);
            }

            if (!patientId) {
                console.error("[RECOGNIZE_ERROR] No patient ID found in storage");
                setStatusModal({
                    visible: true,
                    type: 'error',
                    title: 'Error',
                    message: 'Please log in again.'
                });
                setCapturedPhoto(null);
                return;
            }

            console.log("[RECOGNIZE] Sending request to recognition engine...");
            const apiResult = await recognizeFace(photo.base64, patientId);

            if (apiResult.match) {
                console.log(`[RECOGNIZE] ✅ MATCH FOUND: ${apiResult.name} (Confidence: ${Math.round((apiResult.confidence || 0) * 100)}%)`);
            } else {
                console.log(`[RECOGNIZE] ❌ NO MATCH. Error Type: ${apiResult.error_type || 'None'}`);
            }
            setResult(apiResult);
        } catch (error: any) {
            console.error("[RECOGNIZE_ERROR] Exception in capture flow:", error);
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'Oops!',
                message: error.message || 'Something went wrong. Please try again.'
            });
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
        setActiveRecognitionSlide(0);
    };

    const showCamera = !capturedPhoto && !result;
    const showProcessing = capturedPhoto && recognizing && !result;
    const showResult = result !== null;

    return (
        <View style={styles.container}>
            <StatusModal
                visible={statusModal.visible}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}
            />
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
                    <Image source={{ uri: capturedPhoto }} style={styles.capturedImage} resizeMode="contain" />
                    <View style={styles.scanningOverlay}>
                        <FaceGuideOval faceDetected={true} isScanning={true} />
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
                        <>
                            <View style={successStyles.container}>
                                <ScrollView
                                    contentContainerStyle={successStyles.scroll}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <LinearGradient
                                        colors={['#10B981', '#047857']}
                                        style={successStyles.headerGradient}
                                    >
                                        <View>
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

                                            {slideshowPhotos.length > 0 && (
                                                <TouchableOpacity
                                                    style={successStyles.slideshowButton}
                                                    onPress={() => setIsSlideshowVisible(true)}
                                                >
                                                    <Play size={20} color="#10B981" fill="#10B981" />
                                                    <Text style={successStyles.slideshowButtonText}>Watch Slideshow</Text>
                                                </TouchableOpacity>
                                            )}

                                            <View style={successStyles.confidenceContainer}>
                                                <View style={successStyles.confidenceRing}>
                                                    <Text style={successStyles.confidencePercent}>
                                                        {Math.round((result.confidence || 0) * 100)}%
                                                    </Text>
                                                </View>
                                                <Text style={successStyles.confidenceLabel}>Match Confidence</Text>
                                            </View>
                                        </View>
                                    </LinearGradient>

                                    <ReAnimated.View entering={FadeInUp.delay(400).duration(800)}>
                                        {!loadingRelated && relatedPhotos.length > 0 && (
                                            <View style={successStyles.section}>
                                                <View style={successStyles.sectionHeader}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <ImageIcon size={22} color={Theme.colors.primary} />
                                                        <Text style={successStyles.sectionTitle}>Photos of {result.name}</Text>
                                                    </View>
                                                    <Text style={successStyles.photoCount}>{relatedPhotos.length} photos</Text>
                                                </View>

                                                <View style={successStyles.carouselContainer}>
                                                    <ScrollView
                                                        horizontal
                                                        pagingEnabled
                                                        showsHorizontalScrollIndicator={false}
                                                        onScroll={handleRecognitionScroll}
                                                        scrollEventThrottle={16}
                                                        style={successStyles.slideshow}
                                                    >
                                                        {relatedPhotos.map((url, index) => (
                                                            <View key={index} style={successStyles.slideItem}>
                                                                <Image
                                                                    source={{ uri: url }}
                                                                    style={successStyles.heroPhoto}
                                                                    resizeMode="contain"
                                                                />
                                                            </View>
                                                        ))}
                                                    </ScrollView>

                                                    {/* Pagination Dots */}
                                                    {relatedPhotos.length > 1 && (
                                                        <View style={successStyles.pagination}>
                                                            {relatedPhotos.map((_, index) => (
                                                                <View
                                                                    key={index}
                                                                    style={[
                                                                        successStyles.dot,
                                                                        activeRecognitionSlide === index && successStyles.activeDot
                                                                    ]}
                                                                />
                                                            ))}
                                                        </View>
                                                    )}

                                                    <View style={successStyles.slideBadge}>
                                                        <Sparkles size={14} color="#FFFFFF" fill="#FFFFFF" />
                                                        <Text style={successStyles.slideBadgeText}>
                                                            Photo {activeRecognitionSlide + 1}/{relatedPhotos.length}
                                                        </Text>
                                                    </View>
                                                </View>
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
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                                    <Heart size={22} color="#EF4444" fill="#FEE2E2" />
                                                    <Text style={[successStyles.sectionTitle, { marginBottom: 0 }]}>Shared Moments</Text>
                                                </View>
                                                {memories.map((mem) => (
                                                    <View key={mem.id} style={successStyles.memoryCard}>
                                                        {mem.photoUrls?.[0] && (
                                                            <Image
                                                                source={{ uri: mem.photoUrls[0] }}
                                                                style={successStyles.memoryPhoto}
                                                                resizeMode="contain"
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
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                                <MessageCircle size={22} color={Theme.colors.primary} />
                                                <Text style={[successStyles.sectionTitle, { marginBottom: 0 }]}>Start a Conversation</Text>
                                            </View>
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
                            <SlideshowModal
                                photos={slideshowPhotos}
                                visible={isSlideshowVisible}
                                onClose={() => setIsSlideshowVisible(false)}
                            />
                        </>
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
        elevation: 10,
    },
    hudRing: {
        position: 'absolute',
        width: 260,
        height: 340,
        borderRadius: 130,
        borderWidth: 2,
        borderColor: 'rgba(34, 197, 94, 0.2)',
        borderStyle: 'dashed',
    },
    hudRingGradient: {
        flex: 1,
        borderRadius: 130,
        opacity: 0.6,
    },
    scanningLineClipper: {
        position: 'absolute',
        width: 220,
        height: 300,
        borderRadius: 110,
        overflow: 'hidden',
    },
    ovalInner: {
        width: 200,
        height: 280,
        borderRadius: 100,
        borderWidth: 2,
        borderStyle: 'dashed',
        opacity: 0.5,
    },
    scanLineContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 60,
        opacity: 0.6,
    },
    scanLineGradient: {
        flex: 1,
        height: 3,
        marginTop: 28,
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
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
        backgroundColor: '#FFFFFF', // Replaced black with white as per user request
    },
    scanningOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
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
    slideshowButton: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    slideshowButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#10B981',
        fontSize: 16,
        fontWeight: '800',
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
    },
    photoCount: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: Theme.colors.textSecondary,
        letterSpacing: -0.5,
    },
    carouselContainer: {
        position: 'relative',
        height: 280,
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF', // Replaced black with white
    },
    slideshow: {
        width: '100%',
        height: '100%',
    },
    slideItem: {
        width: SCREEN_WIDTH - 40, // Match section padding (SCREEN_WIDTH - 2*20)
        height: 280,
    },
    heroPhoto: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
        width: 16,
    },
    slideBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
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
    photoStrip: {
        marginTop: 4,
    },
    thumbnailPhoto: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 10,
        backgroundColor: Theme.colors.background, // Match theme for thumbnails
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
        backgroundColor: '#FFFFFF',
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


