"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Store, Upload, CheckCircle2 } from "lucide-react"
import { registerStore } from "@/lib/api"

export default function StoreRegisterPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.target as HTMLFormElement)
            // Add any missing required fields if necessary
            // e.g. formData.append("experienceName", "신규 입점 혜택 (음료 1잔)") // Default benefit
            // formData.append("price", "3000")

            await registerStore(formData)
            setStep(3)
        } catch (error) {
            console.error("Registration failed:", error)
            alert("업체 등록에 실패했습니다. 다시 시도해주세요.")
        } finally {
            setLoading(false)
        }
    }

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
                    <h1 className="text-xl font-bold text-foreground">업체 등록 신청</h1>
                </div>
            </header>

            <section className="container mx-auto px-4 py-6">
                {step === 3 ? (
                    <div className="text-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold">등록이 완료되었습니다!</h2>
                        <p className="text-muted-foreground">
                            이제 업체 목록에서 확인하실 수 있습니다.<br />
                            (바로 영업을 시작해보세요!)
                        </p>
                        <Link href="/store">
                            <Button className="mt-4">확인</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">상호명</Label>
                            <Input id="businessName" name="businessName" placeholder="예: 바다 횟집" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ownerName">대표자명</Label>
                            <Input id="ownerName" name="ownerName" placeholder="실명을 입력해주세요" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="businessRegistrationNumber">사업자 등록번호</Label>
                            <Input id="businessRegistrationNumber" name="businessRegistrationNumber" placeholder="000-00-00000" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">사업장 주소</Label>
                            <Input id="location" name="location" placeholder="도로명 주소를 입력해주세요" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">업체/체험 소개</Label>
                            <Textarea id="description" name="description" placeholder="체험에 대한 간단한 소개를 적어주세요." className="h-24" required />
                        </div>

                        <div className="space-y-2">
                            <Label>사업자 등록증 첨부</Label>
                            <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <Upload className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium">클릭하여 이미지 업로드</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG, PDF (최대 10MB)</p>
                                </div>
                                <input type="file" name="file" className="hidden" accept="image/*,.pdf" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? "제출 중..." : "등록 신청하기"}
                        </Button>
                    </form>
                )}
            </section>
        </div>
    )
}
