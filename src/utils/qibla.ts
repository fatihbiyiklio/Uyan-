export const KAABA_COORDS = {
    latitude: 21.422487,
    longitude: 39.826206,
};

function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

export function calculateQiblaDirection(latitude: number, longitude: number): number {
    const phiK = toRadians(KAABA_COORDS.latitude);
    const lambdaK = toRadians(KAABA_COORDS.longitude);
    const phi = toRadians(latitude);
    const lambda = toRadians(longitude);

    const y = Math.sin(lambdaK - lambda);
    const x =
        Math.cos(phi) * Math.tan(phiK) -
        Math.sin(phi) * Math.cos(lambdaK - lambda);

    let qibla = toDegrees(Math.atan2(y, x));

    // Normalize to 0-360
    return (qibla + 360) % 360;
}
