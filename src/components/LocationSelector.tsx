import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getCoordinatesFromCity } from "../services/geocoding";

// Turkey Administrative Data Interfaces
interface Province {
    id: number;
    name: string;
    coordinates?: { latitude: number; longitude: number };
}

interface District {
    id: number;
    provinceId: number;
    name: string;
}

// Reliable raw GitHub URLs for data
const PROVINCES_URL = "https://raw.githubusercontent.com/ubeydeozdmr/turkiye-api/main/src/data/provinces.json";
const DISTRICTS_URL = "https://raw.githubusercontent.com/ubeydeozdmr/turkiye-api/main/src/data/districts.json";

export function LocationSelector() {
    const { location, setLocation } = useApp();
    const [mode, setMode] = useState<'view' | 'edit'>('view');

    // Data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [allDistricts, setAllDistricts] = useState<District[]>([]);
    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

    // Selection
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

    const [loadingData, setLoadingData] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial load of data
    useEffect(() => {
        if (mode === 'edit' && provinces.length === 0) {
            setLoadingData(true);

            Promise.all([
                fetch(PROVINCES_URL).then(r => r.json()),
                fetch(DISTRICTS_URL).then(r => r.json())
            ]).then(([pData, dData]) => {
                // Handle different potential response structures (API wrapper vs Raw list)
                const pList = Array.isArray(pData) ? pData : (pData.data || []);
                const dList = Array.isArray(dData) ? dData : (dData.data || []);

                if (Array.isArray(pList)) {
                    setProvinces(pList.sort((a: any, b: any) => a.name.localeCompare(b.name)));
                }

                if (Array.isArray(dList)) {
                    setAllDistricts(dList);
                }

                setLoadingData(false);
            }).catch(e => {
                console.error("Failed to load location data", e);
                setLoadingData(false);
            });
        }
    }, [mode]);

    // Filter districts when province changes
    useEffect(() => {
        if (selectedProvinceId && allDistricts.length > 0) {
            const filtered = allDistricts.filter(d => d.provinceId === selectedProvinceId);
            setFilteredDistricts(filtered.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
            setFilteredDistricts([]);
            setSelectedDistrictId(null);
        }
    }, [selectedProvinceId, allDistricts]);

    const handleConfirm = async () => {
        if (selectedProvinceId && selectedDistrictId) {
            setSaving(true);
            const p = provinces.find(x => x.id === selectedProvinceId);
            const d = filteredDistricts.find(x => x.id === selectedDistrictId);

            if (p && d) {
                // Determine coordinates
                // 1. Try to get precise district coords via Geocoding
                // 2. Fallback to province coords

                let lat = p.coordinates?.latitude;
                let lon = p.coordinates?.longitude;

                // Try geocoding for better precision
                try {
                    const query = `${d.name}, ${p.name}, Turkey`;
                    const coords = await getCoordinatesFromCity(query);
                    if (coords) {
                        lat = coords.latitude;
                        lon = coords.longitude;
                    }
                } catch (e) {
                    console.warn("Geocoding failed, using province default", e);
                }

                if (lat && lon) {
                    setLocation({
                        mode: 'manual',
                        city: p.name,
                        country: 'Turkey',
                        district: d.name,
                        coords: {
                            latitude: Number(lat),
                            longitude: Number(lon)
                        }
                    });
                    setMode('view');
                    alert(`Konum ayarlandı: ${p.name} / ${d.name}`);
                } else {
                    alert("Koordinat bilgisi alınamadı.");
                }
            }
            setSaving(false);
        }
    };

    const switchToAuto = () => {
        setLocation({ mode: 'auto', coords: null });
        alert("Otomatik konum moduna geçildi. Sayfa yenilenebilir.");
        window.location.reload();
    };

    if (mode === 'view') {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Konum Ayarları</h3>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-medium">{location.mode === 'auto' ? 'Otomatik Konum' : `${location.city || ''} ${location.district ? '/ ' + location.district : ''}`}</p>
                            <p className="text-xs text-muted-foreground">{location.country || 'Türkiye'}</p>
                        </div>
                    </div>
                    <button onClick={() => setMode('edit')} className="text-sm text-primary hover:underline">Değiştir</button>
                </div>
            </div>
        );
    }

    // Edit Mode
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Konum Seçimi</h3>
                <button onClick={() => setMode('view')} className="text-sm text-muted-foreground">İptal</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={switchToAuto} className="col-span-2 py-2 text-sm border rounded-md hover:bg-accent flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" /> Otomatik Konum Bul
                </button>
            </div>

            {loadingData ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">İl ve ilçe listesi yükleniyor...</div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">İl Seçiniz</label>
                        <select
                            className="w-full p-2 rounded-md border bg-background"
                            value={selectedProvinceId || ''}
                            onChange={(e) => {
                                setSelectedProvinceId(Number(e.target.value));
                                setSelectedDistrictId(null);
                            }}
                        >
                            <option value="">Seçiniz...</option>
                            {provinces.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">İlçe Seçiniz</label>
                        <select
                            className="w-full p-2 rounded-md border bg-background"
                            value={selectedDistrictId || ''}
                            onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
                            disabled={!selectedProvinceId}
                        >
                            <option value="">{selectedProvinceId ? 'İlçe Seçiniz...' : 'Önce İl Seçiniz...'}</option>
                            {filteredDistricts.length > 0 ? (
                                filteredDistricts.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))
                            ) : (
                                // If province selected but no districts found (shouldn't happen with correct data)
                                selectedProvinceId && <option disabled>İlçe bulunamadı</option>
                            )}
                        </select>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!selectedProvinceId || !selectedDistrictId || saving}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {saving ? 'Kaydediliyor...' : 'Onayla ve Kaydet'}
                    </button>
                </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center pt-2">
                * Namaz vakitleri ilçe bazlı hesaplanmaktadır.
            </p>
        </div>
    );
}
