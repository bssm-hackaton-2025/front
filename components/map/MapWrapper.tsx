"use client"

import dynamic from "next/dynamic"

import { Hotspot } from "@/lib/api"

// Dynamic import of the Map component to avoid SSR issues
const Map = dynamic(() => import("./Map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
            <p className="text-muted-foreground">지도를 불러오는 중...</p>
        </div>
    ),
})

interface MapWrapperProps {
    items: any[]
}

export default function MapWrapper({ items }: MapWrapperProps) {
    return <Map items={items} />
}
