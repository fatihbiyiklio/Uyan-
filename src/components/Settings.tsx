import { Moon, Sun, RotateCcw, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { useNotification } from "../hooks/useNotification";
import { ThemeSelector } from "./ThemeSelector";
import { LocationSelector } from "./LocationSelector";

export function SettingsPage() {
    const { permission, requestPermission } = useNotification();
    const [theme, setTheme] = useState<'light' | 'dark' | 'gray'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('uyan_theme_mode');
            if (saved === 'light' || saved === 'dark' || saved === 'gray') return saved;

            if (document.documentElement.classList.contains('gray')) return 'gray';
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'gray');
        root.classList.add(theme);
        localStorage.setItem('uyan_theme_mode', theme); // Better persistence
    }, [theme]);

    const clearData = () => {
        if (confirm("Konum verileri sıfırlanacak ve sayfa yenilenecek. Onaylıyor musunuz?")) {
            // Clear local storage if we used it (not yet, but good practice)
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold">Ayarlar</h2>

            <div className="space-y-4">
                <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        <span>Görünüm</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTheme('light')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                        >
                            Aydınlık
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                        >
                            Koyu
                        </button>
                        <button
                            onClick={() => setTheme('gray')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${theme === 'gray' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                        >
                            Gri
                        </button>
                    </div>
                </Card>

                <Card className="p-4">
                    <ThemeSelector />
                </Card>

                <Card className="p-4">
                    <LocationSelector />
                </Card>

                <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5" />
                        <span>Bildirimler</span>
                    </div>
                    <button
                        onClick={requestPermission}
                        disabled={permission === 'granted'}
                        className="px-3 py-1 bg-secondary rounded-md text-sm font-medium transition-colors hover:bg-secondary/80 disabled:opacity-50"
                    >
                        {permission === 'granted' ? 'Açık' : permission === 'denied' ? 'Reddedildi' : 'Aktifleştir'}
                    </button>
                </Card>

                <Card className="p-4 flex items-center space-x-3 text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
                    onClick={clearData}
                >
                    <RotateCcw className="h-5 w-5" />
                    <span>Verileri Sıfırla & Konumu Yenile</span>
                </Card>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-10">
                <p>Uyan! Web App v1.0.0</p>
                <p>Diyanet İşleri Başkanlığı uyumlu vakitler.</p>
            </div>
        </div>
    );
}
