import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Fish, Gem, Gift } from "lucide-react"

export default function ShopPage() {
  const items = [
    {
      id: 1,
      emoji: "⚡",
      name: "속도 부스터",
      description: "30분간 수거 효율 2배 증가",
      price: 500,
      currency: "fish",
      rarity: "common",
      dropChance: 15,
    },
    {
      id: 2,
      emoji: "🧲",
      name: "자석 효과",
      description: "1시간 동안 쓰레기 발견 확률 50% 증가",
      price: 750,
      currency: "fish",
      rarity: "rare",
      dropChance: 35,
    },
    {
      id: 3,
      emoji: "💰",
      name: "이중 보상",
      description: "1시간 동안 모든 보상 2배",
      price: 10,
      currency: "gem",
      rarity: "epic",
      dropChance: 60,
    },
    {
      id: 4,
      emoji: "🛡️",
      name: "생명력 보너스",
      description: "활동 지속력 30% 증가",
      price: 600,
      currency: "fish",
      rarity: "common",
      dropChance: 20,
    },
    {
      id: 5,
      emoji: "🧼",
      name: "먹물 얼룩 제거",
      description: "수거 시 오염도 감소 효과",
      price: 850,
      currency: "fish",
      rarity: "rare",
      dropChance: 40,
    },
    {
      id: 6,
      emoji: "👑",
      name: "레전더리 팩",
      description: "최고급 아이템 + 100% 리워드 부착",
      price: 25,
      currency: "gem",
      rarity: "legendary",
      dropChance: 100,
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-muted/10 to-muted/5 border-muted/20"
      case "rare":
        return "from-primary/10 to-primary/5 border-primary/20"
      case "epic":
        return "from-secondary/10 to-secondary/5 border-secondary/20"
      case "legendary":
        return "from-accent/10 to-accent/5 border-accent/20"
      default:
        return "from-muted/10 to-muted/5 border-muted/20"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">게임 상점</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10">
              <Fish className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">2,450</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
              <Gem className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">38</span>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <section className="container mx-auto px-4 pt-6 pb-4">
        <Card className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <div className="flex items-start gap-3">
            <Gift className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-card-foreground mb-1">랜덤 리워드 시스템</h3>
              <p className="text-xs text-muted-foreground text-pretty">
                아이템 구매 시 지역 상점 쿠폰이 랜덤으로 부착됩니다! 높은 등급일수록 부착 확률이 높아요.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Items Grid */}
      <section className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`p-4 bg-gradient-to-br ${getRarityColor(item.rarity)} relative overflow-hidden`}
            >
              {/* Drop Chance Badge */}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent/90 text-accent-foreground text-[10px] font-bold flex items-center gap-1">
                <Gift className="w-2.5 h-2.5" />
                {item.dropChance}%
              </div>

              <div className="text-4xl mb-3">{item.emoji}</div>
              <h4 className="font-bold text-sm mb-1 text-card-foreground text-balance">{item.name}</h4>
              <p className="text-xs text-muted-foreground mb-4 text-pretty min-h-[32px]">{item.description}</p>

              <Button
                size="sm"
                className={`w-full ${
                  item.currency === "gem"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-accent hover:bg-accent/90 text-accent-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {item.currency === "fish" ? <Fish className="w-4 h-4" /> : <Gem className="w-4 h-4" />}
                  <span className="font-bold">{item.price}</span>
                </div>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Coupon Box Link */}
      <section className="container mx-auto px-4 pb-6">
        <Link href="/coupons">
          <Card className="p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground mb-0.5">내 쿠폰함</h3>
                  <p className="text-xs text-muted-foreground">사용 가능한 쿠폰 12개</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </div>
          </Card>
        </Link>
      </section>
    </div>
  )
}
