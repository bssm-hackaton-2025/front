"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ShoppingBag, MapPin, Store, Tag, Sparkles } from "lucide-react"
import { getExperiences, type Experience } from "@/lib/api"

export default function StorePage() {
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getExperiences()
            .then(setExperiences)
            .catch(err => {
                console.error(err)
            })
            .finally(() => setLoading(false))
    }, [])

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
                    <h1 className="text-xl font-bold text-foreground">상점 / 체험</h1>
                </div>
            </header>

            {/* Banner */}
            <section className="container mx-auto px-4 py-6">
                <Card className="p-6 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-background/50 rounded-full backdrop-blur-sm">
                            <ShoppingBag className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">지역 상점을 이용해보세요</h2>
                            <p className="text-sm text-muted-foreground">
                                보유하고 있는 쿠폰으로 다양한 혜택을 받을 수 있습니다.
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Store List */}
            <section className="container mx-auto px-4 pb-20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Store className="w-5 h-5 text-accent" />
                        제휴 업체 목록
                    </h3>
                    <span className="text-sm text-muted-foreground">{experiences.length}곳</span>
                </div>

                <Link href="/store/register">
                    <Card className="mb-6 p-4 border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-full group-hover:scale-110 transition-transform">
                                    <Store className="w-5 h-5 text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm text-primary">사장님이신가요?</p>
                                    <p className="text-xs text-muted-foreground">업체 등록하고 지역 주민에게 홍보하세요!</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary font-bold">
                                등록하기 &rarr;
                            </Button>
                        </div>
                    </Card>
                </Link>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
                ) : experiences.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl border-muted">
                        <p className="text-muted-foreground">등록된 상점이 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {experiences.map((store) => (
                            <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-32 bg-muted relative">
                                    {store.imageURL ? (
                                        <img src={store.imageURL} alt={store.businessName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <Store className="w-10 h-10 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {store.experienceName}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-lg">{store.businessName}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {store.location}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {store.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div className="text-sm font-semibold">{store.ownerName} 사장님</div>
                                        <div className="flex items-center gap-1 text-primary font-bold">
                                            <Sparkles className="w-4 h-4" />
                                            {store.price.toLocaleString()} P
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
