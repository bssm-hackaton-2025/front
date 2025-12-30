"use client"

import Script from "next/script"

export default function KakaoMapScript() {
    return (
        <Script
            src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services,clusterer&autoload=false`}
            strategy="afterInteractive"
            onLoad={() => {
                console.log("✅ Kakao Maps SDK Loaded Successfully")
                // Optionally trigger a custom event or set a global flag if needed
            }}
            onError={(e) => {
                console.error("❌ Kakao Maps SDK Failed to Load", e)
                // This usually means the domain is not registered or network is blocked
            }}
        />
    )
}
