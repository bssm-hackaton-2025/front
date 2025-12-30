"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Fish, Map, PlusIcon, MapPin, Swords, User, ShoppingBag, Trophy, Sparkles } from "lucide-react"
import { LocationDisplay } from "@/components/main/LocationDisplay"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signup, getUser } from "@/lib/api"

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [currentUser, setCurrentUser] = useState<{ nickname: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getUser().then(setCurrentUser).catch(e => {
        console.error(e);
        localStorage.removeItem("accessToken");
        setCurrentUser(null);
      });
    }
  }, [])

  const handleAuth = async () => {
    console.log("[Auth] handleAuth started", { isSignUpMode, email });
    try {
      if (isSignUpMode) {
        console.log("[Auth] Calling signup...");
        await signup(email, nickname, password);
        console.log("[Auth] Signup successful. Calling login...");
        await login(email, password); // Auto login after signup
        console.log("[Auth] Login successful.");
        alert("회원가입 및 로그인 성공!");
      } else {
        console.log("[Auth] Calling login...");
        await login(email, password);
        console.log("[Auth] Login successful.");
        alert("로그인 성공!");
      }
      console.log("[Auth] Fetching user profile...");
      const user = await getUser();
      console.log("[Auth] User profile fetched:", user);
      setCurrentUser(user);
      setIsLoginOpen(false);
    } catch (e: any) {
      console.error("[Auth] Error caught:", e);
      let msg = "인증 실패. 입력을 확인해주세요.";
      if (e.message) msg += ` (${e.message})`;
      alert(msg);
    }
  }

  const beaches = [
    { name: "해운대", city: "부산", users: 234, image: "beach" },
    { name: "송정", city: "부산", users: 156, image: "beach" },
    { name: "경포대", city: "강릉", users: 142, image: "beach" },
    { name: "속초", city: "강원", users: 98, image: "beach" },
  ]

  const topUsers = [
    { rank: 1, name: "바다수호자", score: 45820, badge: "🥇", color: "text-yellow-500" },
    { rank: 2, name: "파도타기", score: 42150, badge: "🥈", color: "text-gray-400" },
    { rank: 3, name: "해변지킴이", score: 38900, badge: "🥉", color: "text-amber-600" },
    { rank: 4, name: "환경수호", score: 35200, badge: "4", color: "text-muted-foreground" },
    { rank: 5, name: "클린오션", score: 32100, badge: "5", color: "text-muted-foreground" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Fish className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">OS</h1>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                if (confirm("로그아웃 하시겠습니까?")) {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  setCurrentUser(null);
                }
              }}>
                <span className="text-sm font-bold text-foreground hover:text-primary transition-colors">{currentUser.nickname}님</span>
              </div>
            ) : (
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-primary">
                    로그인
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isSignUpMode ? "회원가입" : "로그인"}</DialogTitle>
                    <DialogDescription>
                      {isSignUpMode ? "새로운 계정을 생성합니다." : "이메일과 비밀번호를 입력하세요."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input id="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    {isSignUpMode && (
                      <div className="space-y-2">
                        <Label htmlFor="nickname">닉네임</Label>
                        <Input id="nickname" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter className="flex-col gap-2 sm:gap-0">
                    <Button className="w-full" onClick={handleAuth}>
                      {isSignUpMode ? "가입하기" : "로그인"}
                    </Button>
                    <Button variant="link" className="w-full text-xs" onClick={() => setIsSignUpMode(!isSignUpMode)}>
                      {isSignUpMode ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors">
                <User className="w-5 h-5 text-accent" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-6 pb-4">
        <Card className="p-5 border-2 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-primary" />
          </div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              {currentUser && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold">Lv. 1</div>
                  <div className="px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-semibold">바다의 수호자</div>
                </div>
              )}
              <h2 className="text-lg font-bold text-foreground mb-1">Ocean Saver</h2>
              <p className="text-xs text-muted-foreground">바다의 악당 해양 쓰레기를 처리하고, 리워드를 받아</p>
              <p className="text-xs text-muted-foreground mb-4">지역 상점에서 혜택을 누리세요</p>

              <div className="flex gap-2 mb-4">

                <LocationDisplay />
              </div>
              <div className="flex gap-2">
                <Link href="/guide">
                  <Button size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-md">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI 분리수거 가이드
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Leaderboard Section */}
      <section className="container mx-auto px-4 pb-4">
        <Card className="p-5 border-2 border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              실시간 랭킹
            </h3>
            <Link href="/ranking" className="text-xs text-primary font-semibold">
              전체보기
            </Link>
          </div>
          <div className="space-y-3">
            {topUsers.map((user, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className={`text-lg font-bold w-8 text-center italic ${idx < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-card-foreground">{user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-primary">{user.score.toLocaleString()} XP</span>
                    {user.rank <= 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-accent/20 text-accent text-[10px] font-bold">
                        TOP 3
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Beaches Section */}
      <section className="container mx-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground">전국 해변</h3>
          <Link href="/map" className="text-xs text-primary font-semibold">
            전체보기
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {beaches.map((beach, idx) => (
            <Card key={idx} className="min-w-[140px] overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div className="p-3">
                <p className="font-bold text-sm">{beach.name}</p>
                <p className="text-xs text-muted-foreground">{beach.city}</p>
                <p className="text-xs text-primary font-semibold mt-1">{beach.users}명 활동중</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link href="/" className="flex flex-col items-center gap-1">
              <Fish className="w-6 h-6 text-primary" />
              <span className="text-xs text-primary font-semibold">홈</span>
            </Link>
            <Link href="/map" className="flex flex-col items-center gap-1">
              <Map className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">탐험</span>
            </Link>
            <Link href="/upload" className="flex flex-col items-center gap-1 -mt-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <PlusIcon className="w-7 h-7 text-primary-foreground" />
              </div>
            </Link>
            <Link href="/battle" className="flex flex-col items-center gap-1">
              <Swords className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">전투</span>
            </Link>
            <Link href="/store" className="flex flex-col items-center gap-1">
              <ShoppingBag className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">상점</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
