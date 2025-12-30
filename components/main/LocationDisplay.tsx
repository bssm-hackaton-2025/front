"use client"

import { Navigation, RotateCw } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function LocationDisplay() {
    const [locationName, setLocationName] = useState<string>("위치 찾는 중...")
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const handleRetry = () => {
        setError(null)
        setLocationName("위치 찾는 중...")
        // Removed setRetryCount((prev) => prev + 1)
        // To trigger a retry, we can simply re-run the effect by changing a state that is a dependency,
        // or by calling the core logic directly. For now, let's assume the effect will run once on mount
        // and if an error occurs, the user can click retry.
        // For a true retry, we'd need a state to trigger the effect again.
        // Let's add a simple `triggerFetch` state for this.
        setTriggerFetch(prev => prev + 1);
    }

    const [triggerFetch, setTriggerFetch] = useState(0);



    useEffect(() => {
        let checkKakaoInterval: number | undefined;
        let kakaoLoadTimeout: number | undefined;

        console.log("[LocationDisplay] Starting effect...");
        setLocationName("GPS 확인 중...");

        if (!navigator.geolocation) {
            setError("GPS 미지원")
            setLocationName("GPS 미지원")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                console.log("[LocationDisplay] GPS Success:", latitude, longitude);
                setLocationName("지도 SDK 대기 중...");

                // Wait for Kakao SDK to load
                checkKakaoInterval = window.setInterval(() => {
                    console.log("[LocationDisplay] Checking window.kakao...", !!window.kakao);
                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                        window.clearInterval(checkKakaoInterval);
                        window.clearTimeout(kakaoLoadTimeout);
                        checkKakaoInterval = undefined;

                        setLocationName("주소 변환 시작...");
                        window.kakao.maps.load(() => {
                            console.log("[LocationDisplay] Kakao Maps Loaded. Geocoding...");
                            const geocoder = new window.kakao.maps.services.Geocoder()
                            const coord = new window.kakao.maps.LatLng(latitude, longitude)

                            const callback = function (result: any, status: any) {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    console.log("[LocationDisplay] Geocode Success:", result[0]);
                                    // Prefer Road Address if available
                                    const fullAddress = result[0].road_address
                                        ? result[0].road_address.address_name
                                        : result[0].address.address_name;

                                    setLocationName(fullAddress)
                                } else {
                                    console.error("Kakao Geocoder Failed:", status)
                                    setLocationName(`주소 변환 실패 (${status})`)
                                }
                            };

                            geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
                        })
                    }
                }, 500)

                // Timeout after 10 seconds if Kakao SDK doesn't load
                kakaoLoadTimeout = window.setTimeout(() => {
                    if (checkKakaoInterval) {
                        window.clearInterval(checkKakaoInterval);
                        checkKakaoInterval = undefined;

                        if (!window.kakao) {
                            console.error("Kakao Maps SDK not found on window object after timeout.");
                            setError("지도 로드 실패 (도메인/키 확인 필요)");
                            setLocationName("지도를 불러올 수 없음");
                        }
                    }
                }, 10000)
            },
            (err) => {
                console.error("Geolocation error:", err)
                let msg = "위치 확인 불가"
                if (err.code === err.PERMISSION_DENIED) msg = "위치 권한 거부됨"
                setError(msg)
                setLocationName(msg)
            },
            { enableHighAccuracy: true }
        )

        // Cleanup function for useEffect
        return () => {
            // Use window.clear... to be safe
            if (checkKakaoInterval) window.clearInterval(checkKakaoInterval);
            if (kakaoLoadTimeout) window.clearTimeout(kakaoLoadTimeout);
        };

    }, [triggerFetch])

    if (error) {
        return (
            <div className="flex items-center gap-1 text-red-500 animate-in fade-in">
                <Navigation className="w-3.5 h-3.5" />
                <span className="text-xs truncate max-w-[200px]" title={error}>
                    {error}
                </span>
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-red-100 rounded-full" onClick={handleRetry}>
                    <RotateCw className="w-3 h-3" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1 text-muted-foreground animate-in fade-in duration-500">
            <Navigation className="w-3.5 h-3.5" />
            <span className="text-xs truncate max-w-[200px]" title={locationName}>
                {locationName}
            </span>
        </div>
    )
}
