"use client"

import Script from "next/script"

export default function KakaoMapScript() {
    const APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!APP_KEY) {
        console.error("⚠️ Kakao Map API Key is missing in .env.local");
        return null; // Don't try to load invalid script
    }

    return (
        <Script
            src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&libraries=services,clusterer&autoload=false`}
            strategy="afterInteractive"
            onLoad={() => {
                console.log("✅ Kakao Maps SDK Loaded Successfully")
            }}
            onError={(e) => {
                console.error("❌ Kakao Maps SDK Failed to Load. Check your API Key and Domain settings.", e)
            }}
        />
    )
}
