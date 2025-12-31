"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, User, Award, Recycle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUser } from "@/lib/api"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUser()
                setUser(data)
            } catch (e) {
                console.error("Failed to fetch user:", e)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-foreground">내 프로필</h1>
                </div>
            </header>

            <section className="container mx-auto px-4 py-6 space-y-6">
                {/* Profile Card */}
                <Card className="p-6 flex flex-col items-center gap-4 bg-card/50 backdrop-blur-sm border-border">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    {loading ? (
                        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                    ) : (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">{user?.nickname || "사용자"}</h2>
                            <p className="text-muted-foreground text-sm">{user?.email}</p>
                        </div>
                    )}
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 flex flex-col items-center gap-2 border-border bg-card/50">
                        <div className="p-2 bg-yellow-500/10 rounded-full">
                            <Award className="w-6 h-6 text-yellow-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">총 포인트</span>
                        <span className="text-xl font-bold">
                            {user?.totalPoint ? user.totalPoint.toLocaleString() : 0} P
                        </span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center gap-2 border-border bg-card/50">
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <Recycle className="w-6 h-6 text-green-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">환경 기여도</span>
                        <span className="text-xl font-bold">Lv. {Math.floor((user?.totalPoint || 0) / 1000) + 1}</span>
                    </Card>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-bold px-1">계정 관리</h3>
                    <Link href="/">
                        <Button variant="outline" className="w-full justify-start h-12 text-muted-foreground">
                            로그아웃 (준비중)
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
