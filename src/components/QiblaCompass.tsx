import { useEffect, useState } from "react";
import { useLocation } from "../hooks/useLocation";
import { useQibla } from "../hooks/useQibla";
import { Compass, ArrowUp } from "lucide-react";
import { cn } from "../lib/utils";

export function QiblaCompass() {
    const { coords, loading: locLoading, error: locError } = useLocation();
    const qiblaAngle = useQibla(coords?.latitude ?? null, coords?.longitude ?? null);
    const [heading, setHeading] = useState<number | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

    useEffect(() => {
        // Check if DeviceOrientationEvent is defined
        if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
            // iOS 13+ requires permission
            // @ts-ignore
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Need a user gesture to request permission, so we show a button if not granted
            } else {
                setPermissionGranted(true);
            }
        }
    }, []);

    useEffect(() => {
        if (!permissionGranted) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            // webkitCompassHeading for iOS, alpha for Android (approximate)
            // @ts-ignore
            let compass = event.webkitCompassHeading;
            if (!compass && event.alpha !== null) {
                compass = Math.abs(event.alpha - 360);
            }

            if (compass !== null && compass !== undefined) {
                setHeading(compass);
            }
        };

        window.addEventListener("deviceorientation", handleOrientation);
        return () => window.removeEventListener("deviceorientation", handleOrientation);
    }, [permissionGranted]);

    const requestAccess = async () => {
        // @ts-ignore
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                // @ts-ignore
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    setPermissionGranted(true);
                } else {
                    alert("Pusula için izin gerekli.");
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            setPermissionGranted(true);
        }
    };

    if (locLoading) return <div className="p-10 text-center">Konum aranıyor...</div>;
    if (locError) return <div className="p-10 text-center text-destructive">{locError}</div>;

    return (
        <div className="flex flex-col items-center justify-center p-4 space-y-8 h-[80vh]">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Kıble Bulucu</h2>
                <p className="text-muted-foreground">Telefonunuzu düz bir zeminde tutun.</p>
                {qiblaAngle !== null && (
                    <p className="text-sm">Kıble Açısı: {qiblaAngle.toFixed(1)}°</p>
                )}
            </div>

            {!permissionGranted ? (
                <button
                    onClick={requestAccess}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
                >
                    Pusulayı Başlat
                </button>
            ) : (
                <div className="relative h-64 w-64">
                    {/* Compass Disk */}
                    <div
                        className="absolute inset-0 rounded-full border-4 border-muted flex items-center justify-center shadow-2xl transition-transform duration-200 ease-out"
                        style={{ transform: `rotate(${-1 * (heading ?? 0)}deg)` }}
                    >
                        <div className="text-xs text-muted-foreground absolute top-2 font-bold">K</div>
                        <div className="text-xs text-muted-foreground absolute bottom-2 font-bold">G</div>
                        <div className="text-xs text-muted-foreground absolute right-2 font-bold">D</div>
                        <div className="text-xs text-muted-foreground absolute left-2 font-bold">B</div>

                        {/* Qibla Indicator on the Disk */}
                        {qiblaAngle !== null && (
                            <div
                                className="absolute h-1/2 w-1 bg-gradient-to-t from-transparent to-green-500 origin-bottom flex items-start justify-center pt-1"
                                style={{ transform: `rotate(${qiblaAngle}deg)`, bottom: '50%' }}
                            >
                                <div className="h-3 w-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                            </div>
                        )}
                    </div>

                    {/* Static Center Marker (User) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Compass className="h-10 w-10 text-muted-foreground opacity-20" />
                    </div>

                    {/* Main Arrow indicating 'Forward' of device */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <ArrowUp className="h-6 w-6 text-foreground" />
                    </div>
                </div>
            )}

            {qiblaAngle !== null && heading !== null && (
                <div className={cn(
                    "text-xl font-bold transition-colors",
                    Math.abs(heading - qiblaAngle) < 5 ? "text-green-500" : "text-muted-foreground"
                )}>
                    {Math.abs(heading - qiblaAngle) < 5 ? "KIBDESİNİZ!" : "Döndürün"}
                </div>
            )}
        </div>
    );
}
