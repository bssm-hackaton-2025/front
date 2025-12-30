"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Upload, Sparkles, Fish, Award, Loader2 } from "lucide-react"
import { submitTrash } from "@/lib/api"

export default function UploadPage() {
  const [uploadStep, setUploadStep] = useState<"initial" | "uploaded" | "success">("initial")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedTrashId, setUploadedTrashId] = useState<number | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUploading(true)
    const file = e.target.files[0]

    try {
      // 1. Get Location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
      })
      const locationString = `${position.coords.latitude},${position.coords.longitude}`

      // 2. Submit API
      const result = await submitTrash(file, locationString)
      console.log("Upload success:", result)

      // Assuming result has id, though interface wasn't fully checked, it's safe to store if needed
      if (result && result.id) {
        setUploadedTrashId(result.id)
      }

      setUploadStep("uploaded")
    } catch (error) {
      console.error("Upload failed:", error)
      alert("업로드에 실패했습니다. 위치 권한을 확인해주세요.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">수거 인증</h1>
        </div>
      </header>

      {uploadStep === "initial" && (
        <section className="container mx-auto px-4 pt-6">
          {/* Instructions */}
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-3 mb-4">

              <div>
                <h3 className="font-bold text-card-foreground mb-2">인증 방법</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>수거한 쓰레기 사진을 촬영하세요</li>
                  <li>{"지정된 곳에 쓰레기를 버리고 인증 버튼을 눌러주세요"}</li>
                  <li>랜덤으로 다양한 쿠폰을 받을 수 있습니다             </li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center bg-card/50 hover:bg-card hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <h3 className="font-bold text-lg text-card-foreground">업로드 중...</h3>
                <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-card-foreground mb-2">사진 촬영 또는 업로드</h3>
                <p className="text-sm text-muted-foreground mb-6">수거한 쓰레기를 찍어주세요</p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Camera className="w-4 h-4 mr-2" />
                  사진 촬영하기
                </Button>
              </>
            )}
          </div>

          {/* Tips */}
          <Card className="p-4 mt-6">
            <h4 className="font-semibold text-sm text-card-foreground mb-3">💡 인증 팁</h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li>• 밝은 곳에서 촬영하면 인식률이 높아집니다</li>
              <li>• 쓰레기를 한곳에 모아 찍으면 정확도가 올라갑니다</li>
              <li>• 대형 쓰레기는 더 많은 보상을 받을 수 있어요</li>
            </ul>
          </Card>
        </section>
      )}

      {uploadStep === "uploaded" && (
        <section className="container mx-auto px-4 pt-6">
          <Card className="p-6 mb-6">
            <div className="aspect-video bg-muted rounded-xl mb-4 flex items-center justify-center">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-card-foreground">1단계 인증 완료</h4>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: "70%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  사진이 전송되었습니다. 관리자 승인 후 최종 완료됩니다.
                </p>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setUploadStep("success")}
              >
                확인
              </Button>
            </div>
          </Card>
        </section>
      )}

      {uploadStep === "success" && (
        <section className="container mx-auto px-4 pt-6">
          {/* Success Animation */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <Award className="w-12 h-12 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">인증 신청 완료!</h2>
            <p className="text-muted-foreground">바다를 지켜주셔서 감사합니다 🌊</p>
          </div>

          {/* Rewards */}
          <Card className="p-6 mb-4 bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
            <h3 className="font-bold text-center mb-4 text-card-foreground">예상 보상</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
                  <Fish className="w-8 h-8 text-accent" />
                </div>

                <p className="text-xs text-muted-foreground">경험치 획득</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>

                <p className="text-xs text-muted-foreground">지역 화폐 적립</p>
              </div>
            </div>
          </Card>

          <Link href="/">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">홈으로 돌아가기</Button>
          </Link>
        </section>
      )}
    </div>
  )
}
