interface Address {
    city?: string;
    town?: string;
    village?: string;
    province?: string;
    district?: string;
    suburb?: string;
    county?: string;
}

export async function getCityFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
        if (!response.ok) return "Konum Algılandı";

        const data = await response.json();
        const address = data.address as Address;

        // Try to find reasonable City/District combo
        // Turkey structure: Province (Il) -> District (Ilce)
        // Nominatim varies. Usually 'province' is Il. 'town', 'district', 'county' might be Ilce.

        const province = address.province || address.city;
        const district = address.district || address.town || address.county || address.suburb;

        if (province && district) {
            return `${province} / ${district}`;
        }
        return province || district || "Bilinmeyen Konum";
    } catch (e) {
        console.error("Reverse geocoding failed", e);
        return "Konum Algılandı";
    }
}
