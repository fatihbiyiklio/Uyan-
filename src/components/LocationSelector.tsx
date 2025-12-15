import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card } from "./ui/card";
import { getPrayerTimesByCity } from "../services/api";

export function LocationSelector() {
    const { location, setLocation } = useApp();
    const [query, setQuery] = useState("");
    const [cityResult, setCityResult] = useState<any>(null); // Ideally typed
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setError(null);
        try {
            // Aladhan API allows getting timings by city which resolves coords.
            // There isn't a dedicated "search city" endpoint in Aladhan freely without getting times,
            // but we can try to fetch times for the city and if it works, we use the meta data for coords.
            const response = await getPrayerTimesByCity(query, "Turkey");
            setCityResult({
                city: query,
                country: "Turkey",
                coords: {
                    latitude: response.data.meta.latitude,
                    longitude: response.data.meta.longitude
                }
            });
        } catch (e) {
            setError("Şehir bulunamadı veya bir hata oluştu.");
            setCityResult(null);
        } finally {
            setLoading(false);
        }
    };

    const confirmLocation = () => {
        if (cityResult) {
            setLocation({
                mode: 'manual',
                city: cityResult.city,
                country: cityResult.country,
                coords: cityResult.coords
            });
            // Close dialog or reset logic handled by parent usually, but here we just update store.
            alert("Konum başarıyla güncellendi.");
            setQuery("");
            setCityResult(null);
        }
    };

    const switchToAuto = () => {
        setLocation({
            mode: 'auto',
            coords: null // will be re-detected
        });
        alert("Otomatik konum moduna geçildi. Sayfa yenilenebilir.");
        window.location.reload();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Konum Ayarları</h3>

            <div className="flex gap-2">
                <button
                    onClick={switchToAuto}
                    className={`flex-1 py-2 text-sm rounded-md border ${location.mode === 'auto' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'}`}
                >
                    Otomatik
                </button>
                <button
                    onClick={() => { }} // Just visual state, input area is below
                    className={`flex-1 py-2 text-sm rounded-md border ${location.mode === 'manual' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background pointer-events-none opacity-50'}`}
                >
                    Manuel
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Şehir Arayın (Türkiye)</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Örn: Istanbul, Ankara"
                        className="flex-1 px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-3 py-2 bg-secondary rounded-md hover:bg-secondary/80 disabled:opacity-50"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </div>

                {loading && <p className="text-sm text-muted-foreground">Aranıyor...</p>}
                {error && <p className="text-sm text-destructive">{error}</p>}

                {cityResult && (
                    <Card className="p-3 mt-2 flex items-center justify-between animate-in fade-in">
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                                <p className="font-medium capitalize">{cityResult.city}</p>
                                <p className="text-xs text-muted-foreground">Enlem: {cityResult.coords.latitude}, Boylam: {cityResult.coords.longitude}</p>
                            </div>
                        </div>
                        <button
                            onClick={confirmLocation}
                            className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-md"
                        >
                            Seç
                        </button>
                    </Card>
                )}
            </div>
        </div>
    );
}
