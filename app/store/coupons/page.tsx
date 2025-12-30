"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Ticket, QrCode } from "lucide-react"
import { getMyCoupons, type Coupon } from "@/lib/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function CouponPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMyCoupons()
            .then(setCoupons)
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/store">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-foreground">내 쿠폰함</h1>
                </div>
            </header>

            <section className="container mx-auto px-4 py-6 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                        <div className="p-6 bg-muted rounded-full">
                            <Ticket className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">보유한 쿠폰이 없습니다.</p>
                        <Link href="/store">
                            <Button variant="outline">쓰레기 줍고 쿠폰 받으러 가기</Button>
                        </Link>
                    </div>
                ) : (
                    coupons.map((coupon) => (
                        <Dialog key={coupon.id}>
                            <DialogTrigger asChild>
                                <Card className="p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary"></div>
                                    <div className="pl-4">
                                        <h3 className="font-bold text-lg">{coupon.experienceName}</h3>
                                        <p className="text-sm text-muted-foreground">{coupon.businessName}</p>
                                        {coupon.validUntil && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                유효기간: {coupon.validUntil}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                                        <QrCode className="w-6 h-6 text-primary" />
                                    </div>
                                </Card>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm rounded-xl">
                                <DialogHeader className="text-center">
                                    <DialogTitle className="text-xl">{coupon.businessName}</DialogTitle>
                                    <DialogDescription>
                                        {coupon.experienceName}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                                    <div className="w-48 h-48 bg-white p-2 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        {/* Simulated QR Code */}
                                        <div className="w-full h-full bg-black/5 flex items-center justify-center">
                                            <QrCode className="w-24 h-24 text-black/80" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground">
                                        직원에게 이 화면을 보여주세요.<br />
                                        (스캔 시 자동 사용 처리됩니다)
                                    </p>
                                    <div className="text-xs font-mono bg-muted px-3 py-1 rounded">
                                        COUPON-NUM-{coupon.id}-AB12
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))
                )}
            </section>
        </div>
    )
}
