// API Configuration
// Centralized config for mobile app settings

export const config = {
    // API endpoint for portal
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',

    // Supabase (when ready)
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

    // App settings
    app: {
        name: 'Memora',
        version: '1.0.0',
    },

    // Design tokens (matching portal)
    colors: {
        primary: '#3b82f6',
        primaryDark: '#1e3a8a',
        accent: '#f97316',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#f0f9ff',
        surface: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
    },

    // Typography
    fonts: {
        title: 36,
        heading: 28,
        body: 20,
        caption: 16,
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
};

export default config;
