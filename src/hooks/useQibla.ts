import { useState, useEffect } from "react";
import { calculateQiblaDirection } from "../utils/qibla";

export function useQibla(latitude: number | null, longitude: number | null) {
    const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);

    useEffect(() => {
        if (latitude !== null && longitude !== null) {
            const angle = calculateQiblaDirection(latitude, longitude);
            setQiblaAngle(angle);
        }
    }, [latitude, longitude]);

    return qiblaAngle;
}
