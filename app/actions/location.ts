"use server"

export async function getReverseGeocode(lat: number, lon: number) {
    // Primary: Nominatim (Better detail for Korea - Gu/Dong)
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'MarineCleanupGame/1.0 (contact@example.com)'
                }
            }
        )

        if (response.ok) {
            const data = await response.json()
            return {
                address: {
                    // Map Nominatim fields to our structure
                    // Nominatim structure varies: city/town/county for Level 1, suburb/borough for Level 2, road/quarter/hamlet for Level 3
                    city: data.address.city || data.address.town || data.address.county || data.address.province || "",
                    district: data.address.borough || data.address.suburb || data.address.neighbourhood || data.address.district || "",
                    road: data.address.road || data.address.quarter || data.address.hamlet || data.address.village || ""
                }
            }
        }
    } catch (error) {
        console.error("Primary Geocode Error (Nominatim):", error)
    }

    // Fallback: BigDataCloud
    try {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`
        )

        if (!response.ok) {
            throw new Error(`BigDataCloud API Error: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            address: {
                city: data.city || data.principalSubdivision,
                district: data.locality,
                road: ""
            }
        }
    } catch (error) {
        console.error("Fallback Geocode Error (BigDataCloud):", error)
        return null
    }
}
