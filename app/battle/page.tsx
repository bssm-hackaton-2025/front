"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Swords, Users, Clock, Trophy, Zap, Lock, Unlock, Shield, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/* API Integration */
import { createRoom, getRooms, joinRoom, type Room } from "@/lib/api"
import { useEffect } from "react"

export default function BattlePage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const [rooms, setRooms] = useState<Room[]>([])

  // Join Private Room State
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [joinPassword, setJoinPassword] = useState("")

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        console.log("Fetched Rooms Data:", data); // Debugging: Check for 'id' vs 'roomId'
        setRooms(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 3000); // Refresh every 3s
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = async () => {
    if (!title) return;

    setIsCreating(true)
    try {
      const room = await createRoom({
        title,
        isPrivate,
        password: isPrivate ? password : null
      });
      setIsOpen(false);
      router.push(`/battle/room/${room.roomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("방 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  }

  const handleJoinClick = (room: Room) => {
    const rId = room.roomId || room.id;
    if (!rId) {
      alert("Invalid Room ID");
      return;
    }

    if (room.isPrivate) {
      setSelectedRoomId(rId);
      setJoinPassword("");
      setIsJoinDialogOpen(true);
    } else {
      joinRoom(rId).then(() => {
        router.push(`/battle/room/${rId}`);
      }).catch(() => {
        router.push(`/battle/room/${rId}`); // Try entering anyway or handle error
      });
    }
  }

  const handleJoinConfirm = async () => {
    if (!selectedRoomId) return;
    try {
      await joinRoom(selectedRoomId, joinPassword);
      setIsJoinDialogOpen(false);
      router.push(`/battle/room/${selectedRoomId}`);
    } catch (e) {
      alert("입장이 거부되었습니다. 비밀번호를 확인하세요.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            배틀 로비
          </h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>해적단 만들기</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>해적단 만들기</DialogTitle>
                <DialogDescription>
                  해양 쓰레기를 소탕할 해적단을 창설하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">방 제목</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="함께 바다를 구해요!" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="private">비공개 설정</Label>
                  <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
                </div>
                {isPrivate && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
                <Button type="submit" onClick={handleCreateRoom} disabled={!title || isCreating}>
                  {isCreating ? "생성 중..." : "만들기"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Join Private Room Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비공개 방 입장</DialogTitle>
            <DialogDescription>비밀번호를 입력하세요.</DialogDescription>
          </DialogHeader>
          <Input type="password" value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} placeholder="비밀번호" />
          <DialogFooter>
            <Button onClick={handleJoinConfirm}>입장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto p-4">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
            <p>아직 생성된 방이 없습니다.</p>
            <p className="text-sm">첫 번째 해적단을 만들어보세요!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const rId = room.roomId || room.id;
              if (!rId) return null; // Skip invalid rooms

              return (
                <Card
                  key={rId}
                  className="p-4 cursor-pointer hover:border-primary transition-colors flex flex-col justify-between group"
                  onClick={() => handleJoinClick(room)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg group-hover:text-primary truncate">{room.title}</h3>
                      {room.isPrivate && <Shield className="w-4 h-4 text-accent" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">방장: {room.hostName}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{room.teams ? room.teams.reduce((acc, t) => acc + t.users.length, 0) : 0} / {room.teams ? room.teams.reduce((acc, t) => acc + t.maxMembers, 0) : 4}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8">입장하기 &rarr;</Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Hero Section (Hidden or Removed) */}
    </div>
  )
}
/* End of Component */
function _BackupHeroCode() {
  return (
    <div />
  )
}
