"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trophy, Medal, Crown } from "lucide-react"
import { useState, useEffect } from "react"
import { getRankings } from "@/lib/api"

export default function RankingPage() {
    const [rankings, setRankings] = useState<any[]>([])

    useEffect(() => {
        getRankings().then(setRankings).catch(console.error);
    }, []);

    const top3 = rankings.slice(0, 3);
    const others = rankings.slice(3);

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
                    <h1 className="text-xl font-bold text-foreground">전체 랭킹</h1>
                </div>
            </header>

            {/* Top Header Section */}
            <section className="container mx-auto px-4 py-6 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-full mb-4 ring-2 ring-accent/20">
                    <Trophy className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-1">명예의 전당</h2>
                <p className="text-muted-foreground text-sm mb-8">이번 시즌 최고의 환경 지킴이는 누구일까요?</p>
            </section>

            {/* Ranking List */}
            <section className="container mx-auto px-4 pb-20 mb-8">
                {/* Top 3 Podium */}
                <div className="flex items-end justify-center gap-4 mb-8">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className="flex flex-col items-center mb-2">
                            <div className="bg-slate-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                                2위
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm truncate w-20 mx-auto">{top3[1]?.nickname || "-"}</div>
                            <div className="text-xs text-muted-foreground">{top3[1]?.totalScore?.toLocaleString() || 0} XP</div>
                        </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center w-1/3 -mt-6">
                        <div className="flex flex-col items-center mb-3">
                            <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-20">
                                1위
                            </div>
                        </div>
                        <div className="text-center mt-1">
                            <div className="font-bold text-lg truncate w-24 mx-auto">{top3[0]?.nickname || "-"}</div>
                            <div className="text-sm font-bold text-primary">{top3[0]?.totalScore?.toLocaleString() || 0} XP</div>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className="flex flex-col items-center mb-2">
                            <div className="bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                                3위
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm truncate w-20 mx-auto">{top3[2]?.nickname || "-"}</div>
                            <div className="text-xs text-muted-foreground">{top3[2]?.totalScore?.toLocaleString() || 0} XP</div>
                        </div>
                    </div>
                </div>

                {/* Rest of Users List */}
                <div className="space-y-2 bg-card/50 rounded-xl p-2 border border-border/50">
                    {others.map((user, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50 shadow-sm transition-all active:scale-[0.99]"
                        >
                            <div className="w-6 text-center font-bold text-muted-foreground text-sm font-mono">
                                {idx + 4}
                            </div>

                            <div className="font-bold text-muted-foreground bg-muted w-8 h-8 rounded-full flex items-center justify-center text-xs">
                                {user.nickname[0]}
                            </div>

                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm truncate">{user.nickname}</span>
                                    {/* <span className="text-[10px] text-muted-foreground">{user.tier} • Lv.{Math.max(20 - user.rank, 5)}</span> */}
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-sm">{user.totalScore.toLocaleString()}</span>
                                    <span className="text-[10px] text-muted-foreground ml-1">XP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {others.length === 0 && rankings.length > 3 && (
                        <div className="text-center py-4 text-muted-foreground">순위 데이터가 없습니다.</div>
                    )}
                </div>
            </section>
        </div>
    )
}
