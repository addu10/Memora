import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Theme = {
    colors: {
        primary: '#8B5CF6', // Violet-500
        primaryLight: '#F5F3FF', // Violet-50
        primaryUltraLight: 'rgba(139, 92, 246, 0.08)',
        secondary: '#6366F1', // Indigo-500
        secondaryLight: '#EEF2FF', // Indigo-50
        secondaryUltraLight: 'rgba(99, 102, 241, 0.08)',
        background: '#FDFBFF',
        surface: '#FFFFFF',
        text: '#0F172A', // Slate-900 (Main text)
        textSecondary: '#64748B', // Slate-500 (Subtext)
        border: '#F1F5F9', // Slate-100
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
        // Signature Branding Gradients (from Portal)
        brandGradient: ['#7C3AED', '#9333EA', '#4F46E5'], // violet-600, purple-600, indigo-600
    },
    typography: {
        fontFamily: 'Outfit_800ExtraBold',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
        full: 9999,
    },
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#6366F1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 4,
        },
        lg: {
            shadowColor: '#6366F1',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 8,
        },
    },
    layout: {
        width,
        height,
    }
};
