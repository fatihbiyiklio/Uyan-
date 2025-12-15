import { Moon, Sun, RotateCcw, Bell, ArrowDownCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { useNotification } from "../hooks/useNotification";
import { useApp } from "../context/AppContext";
import { ThemeSelector } from "./ThemeSelector";
import { LocationSelector } from "./LocationSelector";
import { SoundSelector } from "./SoundSelector";

export function SettingsPage() {
    const { permission, requestPermission } = useNotification();
    const { ramadanMode, setRamadanMode, enabledNotifications, toggleNotification, theme, setTheme, backgroundKeepAlive, setBackgroundKeepAlive } = useApp();

    const clearData = () => {
        if (confirm("Konum verileri sıfırlanacak ve sayfa yenilenecek. Onaylıyor musunuz?")) {
            // Clear local storage if we used it (not yet, but good practice)
            window.location.reload();
        }
    };

    // --- Install PWA Logic ---
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold">Ayarlar</h2>

            {deferredPrompt && (
                <Card className="p-4 bg-primary text-primary-foreground flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity" onClick={handleInstallClick}>
                    <div className="flex items-center space-x-3">
                        <ArrowDownCircle className="h-6 w-6" />
                        <div className="flex flex-col">
                            <span className="font-bold">Uygulamayı Yükle</span>
                            <span className="text-xs opacity-90">Ana ekrana eklemek için dokunun</span>
                        </div>
                    </div>
                </Card>
            )}

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
                    <SoundSelector />
                </Card>

                <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="font-medium">Ramazan Modu</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={ramadanMode}
                            onChange={(e) => setRamadanMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </Card>

                <Card className="p-4 flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                        <span className="font-medium">Kilit Ekranı Sayacı</span>
                        <span className="text-[10px] text-muted-foreground">Pil tüketimini artırabilir (Şarjda önerilir)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={backgroundKeepAlive}
                            onChange={(e) => setBackgroundKeepAlive(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </Card>

                <Card className="p-4">
                    <LocationSelector />
                </Card>

                <Card className="p-4 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Bell className="h-5 w-5" />
                            <span>Bildirimler</span>
                        </div>
                        <button
                            onClick={requestPermission}
                            disabled={permission === 'granted'}
                            className="px-3 py-1 bg-secondary rounded-md text-sm font-medium transition-colors hover:bg-secondary/80 disabled:opacity-50"
                        >
                            {permission === 'granted' ? 'İzin Verildi' : permission === 'denied' ? 'Reddedildi' : 'İzin İste'}
                        </button>
                    </div>

                    {/* Per-Prayer Toggles */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                        {['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'].map((prayer) => (
                            <div key={prayer} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                                <span>{prayer}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={enabledNotifications[prayer] ?? true}
                                        onChange={() => toggleNotification(prayer)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        ))}
                    </div>
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
