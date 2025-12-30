"use client"

import { useEffect, useState } from "react"
import { Marker, Popup } from "react-leaflet"
import { renderToStaticMarkup } from "react-dom/server"
import { MapPin, Users } from "lucide-react"
import type L from "leaflet"

interface MapMarkerProps {
    position: [number, number]
    title: string
    rank: number
    activity: number
    city?: string
    onClick?: () => void
}

export default function MapMarker({ position, title, rank, activity, city }: MapMarkerProps) {
    const [icon, setIcon] = useState<L.DivIcon | null>(null)

    useEffect(() => {
        // Dynamically import leaflet on the client side only
        import("leaflet").then((L) => {
            const iconMarkup = renderToStaticMarkup(
                <div className="relative group">
                    {/* Marker Pin */}
                    <div className="flex flex-col items-center transform transition-transform duration-300 hover:scale-110 hover:-translate-y-2">
                        <div
                            className={`
                w-12 h-12 rounded-2xl rotate-45 border-4 shadow-lg flex items-center justify-center
                ${rank <= 3 ? "bg-amber-400 border-white" : "bg-primary border-white"}
              `}
                        >
                            <div className="-rotate-45 text-white font-bold text-lg">#{rank}</div>
                        </div>
                        {/* Label */}
                        <div className="mt-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-primary/20 whitespace-nowrap opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-primary">{title}</span>
                        </div>
                        {/* Shadow */}
                        <div className="w-8 h-2 bg-black/20 rounded-full blur-sm mt-1" />
                    </div>
                </div>
            )

            const customIcon = L.divIcon({
                html: iconMarkup,
                className: "custom-marker-icon",
                iconSize: [48, 80],
                iconAnchor: [24, 60],
                popupAnchor: [0, -60],
            })

            setIcon(customIcon)
        })
    }, [rank, title])

    if (!icon) return null

    return (
        <Marker position={position} icon={icon}>
            <Popup className="custom-popup">
                <div className="p-1 min-w-[160px]">
                    <h3 className="font-bold text-base mb-1">{title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{city}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs text-gray-500">현재 활동</span>
                        <div className="flex items-center gap-1 font-semibold text-primary">
                            <Users className="w-3 h-3" />
                            <span>{activity}명</span>
                        </div>
                    </div>
                    <button className="w-full mt-3 bg-primary text-primary-foreground py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                        입장하기
                    </button>
                </div>
            </Popup>
        </Marker>
    )
}
