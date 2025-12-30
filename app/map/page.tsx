"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import MapWrapper from "@/components/map/MapWrapper"
import { useEffect, useState } from "react"
// Statutory beach locations (Static Markers)
const BEACH_LOCATIONS = [
  { location: "부산 해운대구" },
  { location: "강원도 강릉시" },
  { location: "제주도 서귀포시" },
  { location: "인천광역시 중구" },
  { location: "서울특별시 한강공원" },
  { location: "충청남도 태안군" },
  { location: "경상남도 거제시" },
  { location: "전라남도 여수시" }
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
      <div className="flex-1 w-full bg-gray-100 relative">
        <MapWrapper items={trashItems} />
      </div>
    </div>
  )
}
