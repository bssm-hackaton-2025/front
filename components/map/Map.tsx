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
    /* -------------------------------
     * 1. Kakao Map 초기화
     * ------------------------------- */
    useEffect(() => {
        console.log("[Map] Component Mounted. Checking Kakao SDK...");
        const initMap = () => {
            // Check if Kakao is loaded
            if (!window.kakao || !window.kakao.maps) {
                console.log("[Map] Kakao SDK not ready. Retrying...");
                // Retry after 100ms
                setTimeout(initMap, 100)
                return
            }

            console.log("[Map] Kakao SDK Ready. Initializing Map...");

            // Check if map instance already exists
            if (!mapRef.current || mapInstance.current) {
                console.log("[Map] Map ref missing or instance already exists.");
                return
            }

            window.kakao.maps.load(() => {
                console.log("[Map] Kakao Maps Load Callback Fired");
                const map = new window.kakao.maps.Map(mapRef.current, {
                    center: new window.kakao.maps.LatLng(36.5, 127.8),
                    level: 13,
                })

                const zoomControl = new window.kakao.maps.ZoomControl()
                map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

                mapInstance.current = map
                setIsMapReady(true)
                console.log("[Map] Map Instance Created.");
            })
        }

        initMap()

        // Timeout cleanup not strictly necessary as it's just checking window
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
            // Check if item has explicit lat/lng coordinates (bypass Geocoding)
            if (item.lat && item.lng) {
                const coords = new window.kakao.maps.LatLng(item.lat, item.lng)
                createMarker(map, coords, item.location || item.locationName, index, true)
                return
            }

            // Fallback: Use item.location for address search
            const address = item.location || item.locationName // Fallback for hotspots if mixed
            if (!address) return

            geocoder.addressSearch(address, (result: any, status: any) => {
                if (status !== window.kakao.maps.services.Status.OK) return
                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)
                createMarker(map, coords, address, index)
            })
        })

        function createMarker(map: any, position: any, title: string, index: number, isStatic: boolean = false) {
            const content = `
          <div style="text-align:center;">
            <div style="
              width:32px;height:32px;
              background:${isStatic ? '#2563eb' : '#ef4444'}; /* Blue for Static, Red for Trash */
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
              ${isStatic ? '📍' : '🗑️'}
            </div>
            <div style="
              margin-top:4px;
              background:white;
              padding:2px 6px;
              border-radius:4px;
              font-size:11px;
              box-shadow:0 1px 4px rgba(0,0,0,0.2);
            ">
              ${title}
            </div>
          </div>
        `
            const overlay = new window.kakao.maps.CustomOverlay({
                map,
                position,
                content,
                yAnchor: 1,
                zIndex: 10 + index,
            })
            overlaysRef.current.push(overlay)
        }
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
