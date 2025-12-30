"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import MapWrapper from "@/components/map/MapWrapper"
import { useEffect, useState } from "react"
// Statutory beach locations (Static Markers)
// Statutory beach locations (Static Markers)
// Coordinates for major beaches (Approx)
const BEACH_LOCATIONS = [
  { location: "부산 해운대구", lat: 35.1587, lng: 129.1603 }, // Haeundae
  { location: "강원도 강릉시", lat: 37.7915, lng: 128.9087 }, // Gyeongpo
  { location: "제주도 서귀포시", lat: 33.2460, lng: 126.5093 }, // Seogwipo
  { location: "인천광역시 중구", lat: 37.4475, lng: 126.3729 }, // Eulwangni
  { location: "서울특별시 한강공원", lat: 37.5284, lng: 126.9328 }, // Yeouido
  { location: "충청남도 태안군", lat: 36.6041, lng: 126.2965 }, // Mallipo
  { location: "경상남도 거제시", lat: 34.8457, lng: 128.7077 }, // Wahyeon
  { location: "전라남도 여수시", lat: 34.7397, lng: 127.7669 }  // Manseongni
]

export default function MapPage() {
  /* 
   * User requested to show simple markers.
   * Using static beach locations as per request.
   */
  const [trashItems] = useState<any[]>(BEACH_LOCATIONS)

  // No API calls needed

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border flex-none">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">전국 해변 지도</h1>
        </div>
      </header>

      {/* Map Section */}
      <div className="w-full h-[calc(100vh-60px)] relative bg-gray-100">
        <MapWrapper items={trashItems} />
      </div>
    </div>
  )
}
