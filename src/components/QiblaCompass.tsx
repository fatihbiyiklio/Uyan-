import { useEffect, useState } from "react";
import { useLocation } from "../hooks/useLocation";
import { useQibla } from "../hooks/useQibla";
import { Compass, ArrowUp, LocateFixed } from "lucide-react";
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

        const handleOrientation = (event: any) => {
            let compass = null;

            // iOS
            if (event.webkitCompassHeading) {
                compass = event.webkitCompassHeading;
            }
            // Android Absolute
            else if (event.absolute && event.alpha !== null) {
                compass = Math.abs(event.alpha - 360);
            }
            // Android Relative attempt (fallback, likely inaccurate for Qibla but shows rotation)
            else if (event.alpha !== null) {
                compass = Math.abs(event.alpha - 360);
            }

            if (compass !== null) {
                setHeading(compass);
            }
        };

        // Try absolute first for Android
        if ('ondeviceorientationabsolute' in (window as any)) {
            (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            if ('ondeviceorientationabsolute' in (window as any)) {
                (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
            } else {
                window.removeEventListener('deviceorientation', handleOrientation);
            }
        };
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

    const isAligned = qiblaAngle !== null && heading !== null && Math.abs(heading - qiblaAngle) < 5;

    return (
        <div className="flex flex-col items-center justify-center p-4 space-y-12 min-h-[70vh]">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Kıble Bulucu</h2>
                {qiblaAngle !== null && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                        <LocateFixed className="w-3 h-3 mr-2" />
                        Kıble Açısı: {qiblaAngle.toFixed(1)}°
                    </div>
                )}
            </div>

            {!permissionGranted ? (
                <button
                    onClick={requestAccess}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-lg hover:opacity-90 transition-opacity"
                >
                    Pusulayı Başlat
                </button>
            ) : (
                <div className="relative h-72 w-72">
                    {/* Glowing effect when aligned */}
                    <div className={cn(
                        "absolute inset-0 rounded-full blur-xl transition-opacity duration-500",
                        isAligned ? "bg-green-500/30 opacity-100" : "opacity-0"
                    )} />

                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-[6px] border-muted/30" />

                    {/* Rotating Compass Disk */}
                    <div
                        className="absolute inset-2 rounded-full border-2 border-primary/20 bg-card shadow-2xl flex items-center justify-center transition-transform duration-300 ease-out"
                        style={{ transform: `rotate(${-1 * (heading ?? 0)}deg)` }}
                    >
                        {/* NSEW Markers */}
                        <div className="absolute top-4 text-xs font-bold text-primary">K</div>
                        <div className="absolute bottom-4 text-xs font-bold text-muted-foreground">G</div>
                        <div className="absolute right-4 text-xs font-bold text-muted-foreground">D</div>
                        <div className="absolute left-4 text-xs font-bold text-muted-foreground">B</div>

                        <div className="absolute inset-10 border border-dashed border-primary/10 rounded-full" />

                        {/* Qibla Indicator (Target) */}
                        {qiblaAngle !== null && (
                            <div
                                className="absolute h-1/2 w-8 origin-bottom flex flex-col items-center justify-start pt-2"
                                style={{ transform: `rotate(${qiblaAngle}deg)`, bottom: '50%' }}
                            >
                                <div className={cn(
                                    "w-3 h-3 rounded-full shadow-lg transition-colors duration-300",
                                    isAligned ? "bg-green-500 shadow-green-500/50" : "bg-primary shadow-primary/40"
                                )} />
                                <div className={cn(
                                    "w-0.5 h-full mt-1 bg-gradient-to-b from-primary/50 to-transparent",
                                    isAligned && "from-green-500/50"
                                )} />
                            </div>
                        )}
                    </div>

                    {/* Center Point */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center shadow-sm">
                            <Compass className={cn(
                                "h-8 w-8 transition-colors",
                                isAligned ? "text-green-500" : "text-muted-foreground"
                            )} />
                        </div>
                    </div>

                    {/* Device Direction Indicator (Top Arrow) */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                        <ArrowUp className="h-6 w-6 text-primary fill-current" />
                    </div>
                </div>
            )}

            <div className="h-8 flex items-center justify-center">
                {heading !== null && (
                    <div className={cn(
                        "text-xl font-bold transition-all duration-300",
                        isAligned ? "text-green-600 scale-110" : "text-muted-foreground"
                    )}>
                        {isAligned ? "KIBDESİNİZ!" : "Telefonu çevirin"}
                    </div>
                )}
            </div>
        </div>
    );
}
