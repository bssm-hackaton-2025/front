"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Camera, Loader2, CheckCircle2, Recycle, MapPin } from "lucide-react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { submitTrash, submitRecycle } from "@/lib/api"

// Steps: 'upload' -> 'guidance' -> 'verify' -> 'complete'
type VerificationStep = 'upload' | 'guidance' | 'verify' | 'complete';

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [currentTrashId, setCurrentTrashId] = useState<number | null>(null)
  const [guidanceText, setGuidanceText] = useState<string>("")
  const [targetLocation, setTargetLocation] = useState<string>("")
  const [earnedCoupon, setEarnedCoupon] = useState<{ name: string, shop: string } | null>(null)

  const handleTrashUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      // 1. Get Location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      const locationString = `${position.coords.latitude},${position.coords.longitude}`;

      if (verificationStep === 'upload') {
        // --- Step 1: Initial Trash Upload ---
        const res = await submitTrash(file, locationString);

        const newTrashId = res?.trashId || res?.id || Date.now(); // Fallback ID
        setCurrentTrashId(newTrashId);

        // Set Guidance (Mock Gemini Response for Demo)
        // In a real app, we might call getRecycleGuide here or use the response from submitTrash if it includes analysis
        setGuidanceText("분석 결과: 플라스틱 (PET)");
        setTargetLocation("근처 분리수거장 (해운대점)");
        setVerificationStep('guidance');

      } else if (verificationStep === 'verify') {
        // --- Step 3: Final Recycle Verification ---
        if (!currentTrashId) throw new Error("Trash ID missing");

        await submitRecycle(currentTrashId, file, locationString);

        // --- Mock Coupon Issuance for Demo ---
        setEarnedCoupon({
          name: "아메리카노 1잔 무료",
          shop: "오션 카페 (해운대점)"
        });
        setVerificationStep('complete');
      }

    } catch (error: any) {
      console.error("Location/Upload Error:", error);
      const isMockMode = confirm("위치 정보를 가져올 수 없습니다. \n(테스트용) 임시 위치로 진행하시겠습니까?");

      if (isMockMode) {
        try {
          const mockLoc = "35.1587,129.1603";
          if (verificationStep === 'upload') {
            const res = await submitTrash(file, mockLoc);
            setCurrentTrashId(res?.trashId || 101);
            setGuidanceText("분석 결과: 폐어구 (그물)");
            setTargetLocation("해안 쓰레기 집하장");
            setVerificationStep('guidance');
          } else if (verificationStep === 'verify') {
            await submitRecycle(currentTrashId || 101, file, mockLoc);
            setVerificationStep('complete');
          }
        } catch (e) {
          alert("업로드 실패.");
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border flex-none">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">쓰레기 수거 인증</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handleTrashUpload}
        />

        {/* --- Verification Card logic (duplicated from Battle for standalone) --- */}
        {verificationStep === 'complete' && (
          <Card className="z-10 w-full max-w-md bg-green-950/40 backdrop-blur-md border-green-500/30 p-8 flex flex-col items-center gap-6 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-white drop-shadow-md">인증 완료! 🎉</h3>
              <p className="text-gray-300">
                지구를 위한 행동 감사합니다.<br />
                <span className="text-green-400 font-bold">포인트가 지급되었습니다!</span>
              </p>
            </div>

            {earnedCoupon && (
              <div className="w-full bg-white text-black rounded-lg p-4 shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                <div className="border-2 border-dashed border-gray-300 rounded p-3 flex flex-col items-center gap-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">New Reward!</span>
                  <h4 className="text-lg font-black text-gray-800">{earnedCoupon.name}</h4>
                  <p className="text-sm text-gray-500">{earnedCoupon.shop}</p>
                  <div className="w-full h-px bg-gray-200 my-1" />
                  <p className="text-[10px] text-gray-400">유효기간: 2024.12.31까지</p>
                </div>
              </div>
            )}

            <div className="flex flex-col w-full gap-2">
              <Link href="/store/coupons" className="w-full">
                <Button className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20">
                  쿠폰함 확인하기
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white hover:bg-white/10">
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {verificationStep === 'guidance' && (
          <Card className="z-10 w-full max-w-md bg-card/50 backdrop-blur-md border-border p-8 flex flex-col items-center gap-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4 w-full">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-100 rounded-full animate-pulse">
                  <Recycle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-600">AI 분석 완료</h3>
              </div>

              <div className="bg-muted p-4 rounded-xl w-full text-left space-y-2">
                <p className="text-sm text-muted-foreground">쓰레기 종류</p>
                <p className="text-lg font-bold text-foreground">{guidanceText}</p>
                <div className="h-px bg-border my-2" />
                <p className="text-sm text-muted-foreground">배출 장소</p>
                <p className="text-lg font-bold text-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {targetLocation}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                위 장소로 이동하여<br />
                <span className="font-bold text-foreground">분리수거 하는 모습</span>을 촬영해주세요.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full text-lg font-bold"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="w-5 h-5 mr-2" />
              도착! 인증샷 촬영
            </Button>
          </Card>
        )}

        {verificationStep === 'upload' && (
          <Card className="z-10 w-full max-w-md bg-card/50 backdrop-blur-md border-border p-8 flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">쓰레기를 발견하셨나요?</h3>
              <p className="text-muted-foreground">카메라로 쓰레기를 촬영하여 점수를 획득하세요!</p>
            </div>

            <Button
              size="lg"
              className="w-full h-24 text-xl rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>업로드 중...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-8 h-8 mb-1" />
                  <span>쓰레기 인증하기</span>
                </div>
              )}
            </Button>

            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              📍 위치 정보가 함께 전송됩니다
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
