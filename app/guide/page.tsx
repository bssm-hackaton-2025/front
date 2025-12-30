"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Sparkles, MapPin, Recycle, Trash2 } from "lucide-react"
import { getRecycleGuide, type GeminiGuideResponse } from "@/lib/api"

export default function GuidePage() {
    const [trashName, setTrashName] = useState("")
    const [result, setResult] = useState<GeminiGuideResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [currentAddress, setCurrentAddress] = useState<string>("")
    const [isLocationLoading, setIsLocationLoading] = useState(true)

    // Fetch Location on Mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setCurrentAddress("위치 정보 없음")
            setIsLocationLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords

                // Wait for Kakao to be ready
                const interval = setInterval(() => {
                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                        clearInterval(interval)

                        window.kakao.maps.load(() => {
                            const geocoder = new window.kakao.maps.services.Geocoder()
                            const coord = new window.kakao.maps.LatLng(latitude, longitude)

                            geocoder.coord2Address(coord.getLng(), coord.getLat(), (result: any, status: any) => {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    const addr = result[0].road_address
                                        ? result[0].road_address.address_name
                                        : result[0].address.address_name
                                    console.log("[Guide] Location Found:", addr)
                                    setCurrentAddress(addr)
                                } else {
                                    setCurrentAddress("위치 변환 실패")
                                }
                                setIsLocationLoading(false)
                            })
                        })
                    }
                }, 100)

                // Timeout
                setTimeout(() => {
                    clearInterval(interval)
                    if (isLocationLoading) setIsLocationLoading(false)
                }, 5000)
            },
            (err) => {
                console.error("Geolocation Error:", err)
                setCurrentAddress("위치 권한 없음")
                setIsLocationLoading(false)
            }
        )
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!trashName.trim()) return

        setLoading(true)
        setError("")
        setResult(null)

        try {
            // Use real location if available, otherwise fallback
            const locationToSend = currentAddress || "알 수 없는 위치"
            console.log("[Guide] Sending Query:", trashName, "Location:", locationToSend)

            const data = await getRecycleGuide(trashName, locationToSend)
            setResult(data)
        } catch (err) {
            console.error(err)
            setError("분석에 실패했습니다. 잠시 후 다시 시도해주세요.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            AI 분리수거 가이드
                        </h1>
                    </div>
                </div>
            </header>

            <section className="container mx-auto px-4 py-6">
                {/* Search Form */}
                <Card className="p-6 mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-bold mb-2">무엇을 버리시나요?</h2>
                        <p className="text-sm text-muted-foreground">
                            쓰레기 이름을 입력하면 AI가 올바른 분리배출 방법을 알려드립니다.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="예: 생수병, 피자박스, 건전지"
                            value={trashName}
                            onChange={(e) => setTrashName(e.target.value)}
                            className="bg-background"
                        />
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </Button>
                    </form>
                </Card>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12 space-y-4 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <p className="text-lg font-bold text-primary">Gemini가 분석 중입니다...</p>
                        <p className="text-sm text-muted-foreground">최적의 분리배출 방법을 찾고 있어요</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Result Card */}
                {result && !loading && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-3 py-1 bg-accent/10 rounded-full text-accent text-xs font-bold border border-accent/20">
                                {result.category}
                            </div>
                            <div className="px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold border border-primary/20">
                                {result.trashType}
                            </div>
                        </div>

                        <Card className="p-0 overflow-hidden border-2 border-primary/20">
                            <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                    <Recycle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">분리배출 방법</h3>
                                    <p className="text-xs text-muted-foreground">How into separate</p>
                                </div>
                            </div>
                            <div className="p-5 text-sm leading-relaxed text-foreground">
                                {result.howToSeparate}
                            </div>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="p-4 bg-muted/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <h4 className="font-bold text-sm">배출 장소</h4>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {result.whereToDispose}
                                </p>
                            </Card>

                            <Card className="p-4 bg-yellow-50/50 border-yellow-200/50 dark:bg-yellow-900/10 dark:border-yellow-900/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                                    <h4 className="font-bold text-sm text-yellow-700 dark:text-yellow-400">꿀팁</h4>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {result.additionalTips}
                                </p>
                            </Card>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
