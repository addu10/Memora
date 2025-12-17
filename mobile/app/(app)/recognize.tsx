// Face Recognition Screen
import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function RecognizeScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [recognizing, setRecognizing] = useState(false);
    const [result, setResult] = useState<{ name: string; confidence: number } | null>(null);
    const cameraRef = useRef(null);

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
            // Simulator Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Demo result
            const demoResults = [
                { name: 'Amma', confidence: 0.92 },
                { name: 'Achan', confidence: 0.88 },
                { name: 'Priya', confidence: 0.95 },
                { name: 'Unknown', confidence: 0.30 },
            ];

            const randomResult = demoResults[Math.floor(Math.random() * demoResults.length)];
            setResult(randomResult);

        } catch (error) {
            Alert.alert('Error', 'Failed to recognize face. Please try again.');
        } finally {
            setRecognizing(false);
        }
    };

    const resetRecognition = () => {
        setResult(null);
    };

    return (
        <View style={styles.container}>
            {/* Camera View */}
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
            >
                {/* Overlay */}
                <View style={styles.overlay}>
                    {/* Face Guide */}
                    {!result && (
                        <>
                            <View style={styles.faceGuide}>
                                <View style={styles.faceGuideCorner} />
                                <View style={[styles.faceGuideCorner, styles.topRight]} />
                                <View style={[styles.faceGuideCorner, styles.bottomLeft]} />
                                <View style={[styles.faceGuideCorner, styles.bottomRight]} />
                            </View>

                            <Text style={styles.guideText}>
                                {recognizing ? 'Identifying...' : 'Center face in the box'}
                            </Text>
                        </>
                    )}
                </View>
            </CameraView>

            {/* Controls */}
            <View style={styles.controls}>
                {result ? (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <View style={[styles.resultIconContainer, result.confidence > 0.7 ? styles.iconGreen : styles.iconGray]}>
                                <Text style={styles.resultIcon}>
                                    {result.confidence > 0.7 ? '✅' : '❓'}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.resultName}>
                                    {result.confidence > 0.7 ? `This is ${result.name}` : 'Not Recognized'}
                                </Text>
                                <Text style={styles.resultConfidence}>
                                    {result.confidence > 0.7
                                        ? `Certainty: ${Math.round(result.confidence * 100)}%`
                                        : 'Try moving closer to better light'
                                    }
                                </Text>
                            </View>
                        </View>

                        {result.confidence > 0.7 && (
                            <View style={styles.relationshipHint}>
                                <Text style={styles.hintIcon}>💡</Text>
                                <Text style={styles.hintText}>
                                    Ask: "What do you remember about {result.name}?"
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.tryAgainButton} onPress={resetRecognition}>
                            <Text style={styles.tryAgainText}>Scan Another Face</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.captureButton, recognizing && styles.captureButtonDisabled]}
                        onPress={handleCapture}
                        disabled={recognizing}
                    >
                        <View style={styles.captureButtonInner}>
                            {recognizing ? (
                                <Text style={styles.capturingText}>⏳</Text>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
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
        marginBottom: 24,
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
    },
    tryAgainButton: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
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
});
