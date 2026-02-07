import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // "Soft Lavender" Palette
                primary: {
                    50: '#f5f3ff', // very light lavender
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6', // main purple
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
                lavender: {
                    50: '#F7F7FF',
                    100: '#EBEBFF',
                    200: '#D9D9FF',
                    300: '#BDB9FE',
                    400: '#9D93FD',
                    500: '#7B6EF6',
                    600: '#644EE6',
                },
                'soft-blue': {
                    50: '#F0F5FF',
                    100: '#E0EAFF',
                    500: '#3B82F6',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                'vibrant-mesh': 'radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.3) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.3) 0, transparent 50%)',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'soft-blue': '0 10px 40px -10px rgba(59, 130, 246, 0.15)',
                'lifted': '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            borderRadius: {
                '3xl': '1.5rem', // Soft rounded corners specific to the new design
                '4xl': '2rem',
            }
        },
    },
    plugins: [],
};
export default config;
