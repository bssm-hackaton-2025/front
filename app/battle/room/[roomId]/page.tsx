"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Users, Copy, Share2, Crown, User, ShieldAlert, Timer, MapPin, Camera, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getRoom, startGame, getUser, submitTrash, subscribeToGame, type Room } from "@/lib/api"

export default function RoomLobbyPage() {
    const params = useParams()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Game States: 'lobby' | 'starting' | 'playing'
    const [gameState, setGameState] = useState<'lobby' | 'starting' | 'playing'>('lobby')
    const [countdown, setCountdown] = useState(5)
    const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds

    const [room, setRoom] = useState<Room | null>(null)
    const [currentUser, setCurrentUser] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [teamAScore, setTeamAScore] = useState(0)
    const [teamBScore, setTeamBScore] = useState(0)

    useEffect(() => {
        getUser().then(u => setCurrentUser(u.nickname)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!params.roomId) return;

        const fetchRoom = async () => {
            try {
                const data = await getRoom(params.roomId as string);
                setRoom(data);
            } catch (e) {
                console.error(e);
                // router.push('/battle'); // Optional: redirect if room not found
            }
        };

        fetchRoom();
        const interval = setInterval(fetchRoom, 3000); // Polling every 3s
        return () => clearInterval(interval);
    }, [params.roomId]);

    // SSE Subscription for Real-time Scores
    useEffect(() => {
        if (gameState !== 'playing' || !room || !room.roomId) return;

        console.log("Subscribing to game SSE:", room.roomId);
        const unsubscribe = subscribeToGame(room.roomId, (data) => {
            console.log("SSE Received:", data);
            // Expected format: { teams: [{ name: "A", score: 10 }, { name: "B", score: 5 }] }
            if (data && data.teams && Array.isArray(data.teams)) {
                data.teams.forEach((team: any) => {
                    if (team.name === "A" || team.teamName === "A") setTeamAScore(team.score || 0);
                    if (team.name === "B" || team.teamName === "B") setTeamBScore(team.score || 0);
                });
            }
        });

        return () => unsubscribe();
    }, [gameState, room?.roomId]);

    const handleStartGame = async () => {
        if (!room) return;
        try {
            await startGame(room.roomId);
            setGameState('starting');
        } catch (e) {
            console.error(e);
            alert("게임을 시작할 수 없습니다.");
        }
    }

    const handleTrashUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);

        try {
            // 1. Get Location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const locationString = `${position.coords.latitude},${position.coords.longitude}`;

            // 2. Submit API
            await submitTrash(file, locationString);

            alert("쓰레기 인증 완료! 점수가 집계됩니다. 🎉");
        } catch (error) {
            console.error(error);
            alert("업로드에 실패했습니다. 위치 권한을 확인해주세요.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset
        }
    }

    // Countdown Logic
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (gameState === 'starting' && countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        } else if (gameState === 'starting' && countdown === 0) {
            setGameState('playing')
        }
        return () => clearTimeout(timer)
    }, [gameState, countdown])

    // Battle Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (gameState === 'playing' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(t => t - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [gameState, timeLeft])

    // Format seconds to MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    if (!room) return <div className="min-h-screen flex items-center justify-center text-white">방 정보를 불러오는 중...</div>;

    const isHost = currentUser === room.hostName;

    // 1. Countdown Overlay
    if (gameState === 'starting') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
                <div className="text-center z-10">
                    <h2 className="text-white text-2xl font-bold mb-4 animate-bounce">전투 시작까지</h2>
                    <div className="text-[150px] font-black text-white leading-none tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                        {countdown}
                    </div>
                </div>
            </div>
        )
    }

    // 2. Playing UI (Battle Mode)
    if (gameState === 'playing') {
        return (
            <div className="min-h-screen bg-slate-900 text-white relative flex flex-col">
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleTrashUpload}
                />

                {/* HUD Header */}
                <header className="bg-black/50 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10 z-50">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">A</div>
                        <div>
                            <div className="text-xs text-primary font-bold">TEAM A</div>
                            <div className="text-xl font-bold">{teamAScore}개</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-400 font-medium">남은 시간</div>
                        <div className={`text-3xl font-black tracking-wider ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                        <div>
                            <div className="text-xs text-accent font-bold">TEAM B</div>
                            <div className="text-xl font-bold">{teamBScore}개</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold">B</div>
                    </div>
                </header>

                {/* Main Activity Area */}
                <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Synthetik_Map.png')] bg-cover bg-center mix-blend-overlay" />

                    <Card className="z-10 w-full max-w-md bg-black/40 backdrop-blur-md border-white/10 p-8 flex flex-col items-center gap-6 text-center">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">쓰레기를 발견하셨나요?</h3>
                            <p className="text-gray-400">카메라로 쓰레기를 촬영하여 점수를 획득하세요!</p>
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

                        <div className="text-xs text-gray-500 bg-black/20 px-3 py-1 rounded-full">
                            📍 위치 정보가 함께 전송됩니다
                        </div>
                    </Card>
                </div>

                {/* Quit Button */}
                <div className="p-4 bg-black/50 backdrop-blur-md border-t border-white/10 flex justify-center">
                    <Button variant="destructive" onClick={() => {
                        if (confirm('전투를 포기하시겠습니까?')) setGameState('lobby')
                    }}>
                        전투 포기
                    </Button>
                </div>
            </div>
        )
    }

    // 3. Lobby UI (Original)
    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-foreground truncate">{room.title}</h1>
                            {room.isPrivate && <ShieldAlert className="w-4 h-4 text-accent" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Room ID: {params.roomId}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Room Status */}
            <section className="container mx-auto px-4 py-6">
                <div className="flex justify-center mb-8">
                    <div className="bg-background rounded-full px-4 py-1.5 shadow-sm border flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">방장: {room.hostName}</span>
                    </div>
                </div>

                {/* Teams Layout */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Team A */}
                    <div className="space-y-3">
                        <div className="text-center font-bold text-primary mb-2">TEAM A</div>
                        {Array.from({ length: room.teams[0]?.maxMembers || 2 }).map((_, idx) => {
                            const user = room.teams[0]?.users[idx]
                            return (
                                <Card key={`team-a-${idx}`} className="aspect-square flex flex-col items-center justify-center p-2 relative overflow-hidden border-2 border-primary/20 bg-primary/5">
                                    {user ? (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <span className="font-bold text-sm truncate w-full text-center">{user}</span>
                                            {user === room.hostName && <Crown className="w-4 h-4 text-yellow-500 absolute top-2 right-2" />}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-50">
                                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mb-2">
                                                <Users className="w-5 h-5 text-primary/40" />
                                            </div>
                                            <span className="text-xs text-muted-foreground">대기 중</span>
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>

                    {/* Team B */}
                    <div className="space-y-3">
                        <div className="text-center font-bold text-accent mb-2">TEAM B</div>
                        {Array.from({ length: room.teams[1]?.maxMembers || 2 }).map((_, idx) => {
                            const user = room.teams[1]?.users[idx]
                            return (
                                <Card key={`team-b-${idx}`} className="aspect-square flex flex-col items-center justify-center p-2 relative overflow-hidden border-2 border-accent/20 bg-accent/5">
                                    {user ? (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                                                <User className="w-6 h-6 text-accent" />
                                            </div>
                                            <span className="font-bold text-sm truncate w-full text-center">{user}</span>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-50">
                                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-accent/30 flex items-center justify-center mb-2">
                                                <Users className="w-5 h-5 text-accent/40" />
                                            </div>
                                            <span className="text-xs text-muted-foreground">대기 중</span>
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-4 pb-8 z-40">
                <div className="container mx-auto px-4 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => {
                        const passInfo = room.isPrivate ? `\n비밀번호: (설정한 비밀번호를 전달하세요)` : "";
                        alert(`[초대 정보]\n방 제목: ${room.title}\nRoom ID: ${room.roomId}${passInfo}`);
                    }}>
                        <Copy className="w-4 h-4 mr-2" />
                        초대 정보
                    </Button>
                    <Button
                        className="flex-[2] bg-primary hover:bg-primary/90 font-bold text-lg"
                        onClick={handleStartGame}
                        disabled={!isHost}
                    >
                        {isHost ? "게임 시작" : "호스트 대기 중"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

