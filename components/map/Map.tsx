"use client"

import { useEffect, useRef, useState } from "react"
import { type Hotspot } from "@/lib/api"

declare global {
    interface Window {
        kakao: any
    }
}

interface MapProps {
    items: any[]
}

export default function Map({ items }: MapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<any>(null)
    const overlaysRef = useRef<any[]>([])
    const [isMapReady, setIsMapReady] = useState(false)
    const [loadingError, setLoadingError] = useState(false)

    /* -------------------------------
     * 1. Kakao Map 초기화
     * ------------------------------- */
    useEffect(() => {
        if (!mapRef.current) return

        const initMap = () => {
            window.kakao.maps.load(() => {
                if (!mapRef.current || mapInstance.current) return

                const map = new window.kakao.maps.Map(mapRef.current, {
                    center: new window.kakao.maps.LatLng(36.5, 127.8),
                    level: 13,
                })

                const zoomControl = new window.kakao.maps.ZoomControl()
                map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

                mapInstance.current = map
                setIsMapReady(true)
            })
        }

        // SDK 없으면 직접 로드
        if (!window.kakao) {
            const script = document.createElement("script")
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`
            script.async = true
            script.onerror = () => setLoadingError(true)
            script.onload = initMap
            document.head.appendChild(script)
        } else {
            initMap()
        }
    }, [])

    /* -------------------------------
     * 2. 마커(오버레이) 업데이트
     * ------------------------------- */
    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return
        if (!items || items.length === 0) return

        // 기존 오버레이 제거
        overlaysRef.current.forEach(o => o.setMap(null))
        overlaysRef.current = []

        const map = mapInstance.current
        const geocoder = new window.kakao.maps.services.Geocoder()

        items.forEach((item: any, index: number) => {
            // Use item.location for address search
            const address = item.location || item.locationName // Fallback for hotspots if mixed
            if (!address) return

            geocoder.addressSearch(address, (result: any, status: any) => {
                if (status !== window.kakao.maps.services.Status.OK) return

                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)

                const content = `
          <div style="text-align:center;">
            <div style="
              width:32px;height:32px;
              background:#ef4444; /* Red for Trash */
              color:white;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:12px;
              font-weight:bold;
              border:2px solid white;
              box-shadow:0 2px 6px rgba(0,0,0,0.3);
            ">
              🗑️
            </div>
            <div style="
              margin-top:4px;
              background:white;
              padding:2px 6px;
              border-radius:4px;
              font-size:11px;
              box-shadow:0 1px 4px rgba(0,0,0,0.2);
            ">
              ${address}
            </div>
          </div>
        `

                const overlay = new window.kakao.maps.CustomOverlay({
                    map,
                    position: coords,
                    content,
                    yAnchor: 1,
                    zIndex: 10 + index,
                })

                overlaysRef.current.push(overlay)
            })
        })
    }, [isMapReady, items])

    /* -------------------------------
     * 3. 레이아웃 강제 재계산
     * ------------------------------- */
    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return

        setTimeout(() => {
            mapInstance.current.relayout()
            mapInstance.current.setCenter(
                new window.kakao.maps.LatLng(36.5, 127.8)
            )
        }, 300)
    }, [isMapReady])

    return (
        <div className="w-full h-full relative">
            <div ref={mapRef} className="w-full h-full bg-gray-100" />

            {!isMapReady && !loadingError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <span className="text-gray-400 animate-pulse">지도 로딩 중...</span>
                </div>
            )}

            {loadingError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                    <p className="text-red-500 font-bold">
                        지도를 불러오지 못했습니다. API 키를 확인하세요.
                    </p>
                </div>
            )}
        </div>
    )
}
