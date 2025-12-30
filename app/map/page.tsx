"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import MapWrapper from "@/components/map/MapWrapper"
import { useEffect, useState } from "react"
import { getRecycleAnalyze, type Hotspot } from "@/lib/api"

export default function MapPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([])

  // Fallback Data (User Provided) for when API is unstable
  const MOCK_HOTSPOTS: Hotspot[] = [
    { locationName: "태안 백리포" },
    { locationName: "고흥 신흥" },
    { locationName: "부안 변산" },
    { locationName: "강화 여차리" },
    { locationName: "완도 신지도" },
    { locationName: "거제 두모" },
    { locationName: "태안 안면도" },
    { locationName: "마산 봉암" },
    { locationName: "진도 가사도" },
    { locationName: "신안 고장" }
  ]

  useEffect(() => {
    getRecycleAnalyze()
      .then(res => {
        console.log("Recycle Analyze Response:", res); // Debug log
        if (res && res.topHotspots) {
          setHotspots(res.topHotspots)
        } else {
          console.warn("Invalid response structure:", res);
        }
      })
      .catch(err => {
        console.error("Failed to fetch hotspots, using fallback data:", err)
        setHotspots(MOCK_HOTSPOTS)
      })
  }, [])

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
        <MapWrapper hotspots={hotspots} />
      </div>
    </div>
  )
}
