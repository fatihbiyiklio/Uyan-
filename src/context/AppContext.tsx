import React, { createContext, useContext, useState, useEffect } from "react";
import { PrayerTimes, HijriDate, GregorianDate } from "../types/api";
import { getPrayerTimesByCoordinates } from "../services/api";

interface Coords {
    latitude: number;
    longitude: number;
}

export interface LocationData {
    mode: 'auto' | 'manual';
    city?: string;
    district?: string;
    country?: string;
    coords: Coords | null;
}

interface AppContextType {
    // Theme Mode (Light/Dark/Gray)
    theme: 'light' | 'dark' | 'gray';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark' | 'gray') => void;

    // Accent Color
    themeColor: string;
    setThemeColor: (color: string) => void;

    // Location
    location: LocationData;
    setLocation: (data: LocationData) => void;

    // Sound
    sound: string;
    setSound: (id: string) => void;

    // Notifications
    enabledNotifications: Record<string, boolean>;
    toggleNotification: (key: string) => void;

    // Features
    ramadanMode: boolean;
    setRamadanMode: (enabled: boolean) => void;
    // Background Mode (Battery Intensive)
    backgroundKeepAlive: boolean;
    setBackgroundKeepAlive: (enabled: boolean) => void;

    // Prayer Times (Global State for Persistence)
    prayerData: {
        timings: PrayerTimes | null;
        date: {
            hijri: HijriDate;
            gregorian: GregorianDate;
        } | null;
    };
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    loading: boolean;
    error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    // --- Theme Mode ---
    const [theme, setTheme] = useState<'light' | 'dark' | 'gray'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('uyan_theme_mode');
            if (saved === 'light' || saved === 'dark' || saved === 'gray') return saved;

            // Auto detect system preference if no saved theme
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'gray');
        root.classList.add(theme);
        localStorage.setItem('uyan_theme_mode', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'gray';
            return 'light';
        });
    };

    // --- Accent Color ---
    const [themeColor, setThemeColorState] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('uyan_theme_color') || 'blue';
        }
        return 'blue';
    });

    const setThemeColor = (color: string) => {
        setThemeColorState(color);
        localStorage.setItem('uyan_theme_color', color);
        updateThemeColor(color);
    };

    useEffect(() => {
        updateThemeColor(themeColor);
    }, [themeColor]);

    // --- Location ---
    const [location, setLocationState] = useState<LocationData>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('uyan_location');
            if (saved) return JSON.parse(saved);
        }
        return { mode: 'auto', coords: null };
    });

    const setLocation = (data: LocationData) => {
        setLocationState(data);
        localStorage.setItem('uyan_location', JSON.stringify(data));
    };

    // --- Sound ---
    const [sound, setSoundState] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('notificationSound') || 'beep';
        }
        return 'beep';
    });

    // Default all true
    const [enabledNotifications, setEnabledNotifications] = useState<Record<string, boolean>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('uyan_enabled_notifications');
            if (saved) return JSON.parse(saved);
        }
        return {
            'İmsak': true,
            'Güneş': false, // No notification for sunrise usually
            'Öğle': true,
            'İkindi': true,
            'Akşam': true,
            'Yatsı': true,
            'İftar': true,
            'Sahur': true,
            'Teravih': true
        };
    });

    const setSound = (id: string) => {
        setSoundState(id);
        localStorage.setItem('notificationSound', id);
    };

    const toggleNotification = (key: string) => {
        setEnabledNotifications(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('uyan_enabled_notifications', JSON.stringify(next));
            return next;
        });
    };

    // --- Ramadan Mode ---
    const [ramadanMode, setRamadanMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ramadanMode') === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('ramadanMode', String(ramadanMode));
    }, [ramadanMode]);

    // --- Background Keep Alive ---
    const [backgroundKeepAlive, setBackgroundKeepAlive] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('backgroundKeepAlive') === 'true';
        }
        return false; // Default false for battery saving
    });

    useEffect(() => {
        localStorage.setItem('backgroundKeepAlive', String(backgroundKeepAlive));
    }, [backgroundKeepAlive]);

    // --- Prayer Times Logic (Global) ---
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [prayerData, setPrayerData] = useState<AppContextType['prayerData']>({ timings: null, date: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTimes = async () => {
            // Only fetch if we have coordinates
            if (!location.coords) return;

            setLoading(true);
            setError(null);
            try {
                const response = await getPrayerTimesByCoordinates(
                    location.coords.latitude,
                    location.coords.longitude,
                    selectedDate
                );
                setPrayerData({
                    timings: response.data.timings,
                    date: response.data.date
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Vakitler alınamadı");
            } finally {
                setLoading(false);
            }
        };

        fetchTimes();
    }, [location.coords, selectedDate]);

    return (
        <AppContext.Provider value={{
            theme,
            toggleTheme,
            setTheme,
            themeColor,
            setThemeColor,
            location,
            setLocation,
            sound,
            setSound,
            ramadanMode,
            setRamadanMode,
            enabledNotifications,
            toggleNotification,
            backgroundKeepAlive,
            setBackgroundKeepAlive,
            prayerData,
            selectedDate,
            setSelectedDate,
            loading,
            error
        }}>
            {children}
        </AppContext.Provider>
    );
}

function updateThemeColor(color: string) {
    const root = document.documentElement;
    // Map of Friendly Name -> HSL values for --primary
    const colors: Record<string, string> = {
        blue: "221.2 83.2% 53.3%",
        green: "142.1 76.2% 36.3%",
        red: "346.8 77.2% 49.8%",
        violet: "262.1 83.3% 57.8%",
        orange: "24.6 95% 53.1%",
        gray: "220 9% 46%",
    };

    // Also update ring
    const rings: Record<string, string> = {
        blue: "221.2 83.2% 53.3%",
        green: "142.1 76.2% 36.3%",
        red: "346.8 77.2% 49.8%",
        violet: "262.1 83.3% 57.8%",
        orange: "24.6 95% 53.1%",
        gray: "220 9% 46%",
    };

    if (colors[color]) {
        root.style.setProperty('--primary', colors[color]);
        root.style.setProperty('--ring', rings[color]);
    }
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
