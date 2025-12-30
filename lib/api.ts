import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// API CONFIG
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ocean-saver-server.parafara.cloud";

// TYPES
export interface Room {
    roomId: number;
    title: string;
    isPrivate: boolean;
    hostName: string;
    teams: Team[];
}

export interface Team {
    id?: number; // Added optional ID based on SSE spec requirements
    teamName: "A" | "B";
    maxMembers: number;
    users: string[]; // nicknames
}

// ... existing code ...

// --- SSE (Real-time) ---

export function subscribeToGame(id: string | number, onMessage: (data: any) => void) {
    const controller = new AbortController();

    async function connect() {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/games/${id}/subscribe`, {
                headers,
                signal: controller.signal
            });

            if (!response.ok) {
                console.error("SSE Connection failed", response.status);
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            if (!reader) return;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");

                // Process all full messages (chunks ending with \n\n)
                buffer = lines.pop() || ""; // Keep the last partial chunk

                for (const line of lines) {
                    const match = line.match(/data: (.*)/);
                    if (match) {
                        try {
                            const json = JSON.parse(match[1]);
                            onMessage(json);
                        } catch (e) {
                            console.error("Failed to parse SSE JSON", e);
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("SSE Error:", err);
                // Optional: Reconnect logic could be added here
            }
        }
    }

    connect();

    return () => controller.abort(); // Cleanup function
}


export interface CreateRoomRequest {
    title: string;
    isPrivate: boolean;
    password?: string | null;
}

// AUTH HELPER (Temporary for testing)
// In a real app, this would be handled by a proper AuthContext
let authToken: string | null = null;

if (typeof window !== "undefined") {
    authToken = localStorage.getItem("accessToken");
}

async function getAuthHeaders() {
    if (!authToken && typeof window !== 'undefined') {
        authToken = localStorage.getItem("accessToken");
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
    };
}

// API METHODS

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        throw new Error("Login failed");
    }

    const data = await res.json();
    authToken = data.accessToken;
    if (typeof window !== 'undefined') {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
}

export async function signup(email: string, nickname: string, password: string) {
    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname, password })
    });

    if (!res.ok) {
        throw new Error(`Signup failed: ${res.status}`);
    }
    // Handle potential empty body for 201 Created
    try {
        return await res.json();
    } catch (e) {
        return { success: true }; // Fallback if no body
    }
}

export async function getRooms(): Promise<Room[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/games/rooms`, {
        method: 'GET',
        headers
    });
    if (!res.ok) {
        throw new Error("Failed to fetch rooms");
    }
    return res.json();
}

export async function getRankings() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/users/rank/10`, {
        method: 'GET',
        headers
    });
    if (!res.ok) {
        throw new Error("Failed to fetch rankings");
    }
    return res.json();
}

export async function getUser() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers
    });
    if (!res.ok) {
        throw new Error("Failed to fetch user");
    }
    return res.json();
}

export async function createRoom(data: CreateRoomRequest): Promise<Room> {
    const headers = await getAuthHeaders();
    console.log("Creating room with headers:", headers);
    const res = await fetch(`${API_URL}/games/rooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error(`Failed to create room: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

export async function getRoom(roomId: string | number): Promise<Room> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/games/rooms/${roomId}`, {
        method: 'GET',
        headers
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch room: ${res.status}`);
    }
    return res.json();
}

export async function joinRoom(roomId: string | number, password?: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/games/rooms/${roomId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ password })
    });

    if (!res.ok) {
        throw new Error(`Failed to join room: ${res.status}`);
    }
    return res.json();
}

export async function startGame(roomId: string | number) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/games/${roomId}`, {
        method: 'PATCH', // As per spec '게임시작'
        headers
    });
    // Spec says 'x' (no response body?) or generic
    if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to start game: ${res.status}`);
    }
    return true; // Success
}

// --- TRASH APIs ---

// 1. Submit Trash (1st Verification)
export async function submitTrash(file: File, location: string) {
    const headers = await getAuthHeaders();
    // Remove Content-Type for FormData (browser sets it with boundary)
    delete (headers as any)['Content-Type'];

    const formData = new FormData();
    formData.append("imageData", file);
    formData.append("location", location);

    const res = await fetch(`${API_URL}/trashes`, {
        method: 'POST',
        headers,
        body: formData
    });

    if (!res.ok) {
        throw new Error(`Failed to submit trash: ${res.status}`);
    }
    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = { success: true }; // Fallback for empty body
    }
    return data;
}

// 2. Get Trash List
export interface TrashItem {
    trashId: number;
    imageURL: string;
    location: string;
    createdAt: string;
    secondImageURL: string | null;
    secondLocation: string | null;
    certified: "pending" | "confirmed" | "rejected" | null;
}

export async function getTrashes(): Promise<TrashItem[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/trashes`, {
        method: 'GET',
        headers
    });

    if (!res.ok) {
        throw new Error("Failed to fetch trash list");
    }
    return res.json();
}

// 3. Submit Recycle (2nd Verification)
export async function submitRecycle(trashId: number, file: File, location: string) {
    const headers = await getAuthHeaders();
    delete (headers as any)['Content-Type'];

    const formData = new FormData();
    formData.append("imageData", file);
    formData.append("location", location);

    const res = await fetch(`${API_URL}/trashes/${trashId}`, {
        method: 'PATCH',
        headers,
        body: formData
    });

    if (!res.ok) {
        throw new Error(`Failed to submit recycle: ${res.status}`);
    }
    return true; // 204 No Content
}

// 4. Admin: Approve Trash
export async function approveTrash(trashId: number) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/trashes/${trashId}/approval`, {
        method: 'PATCH',
        headers
    });
    if (!res.ok) throw new Error("Failed to approve trash");
    return true;
}

// 5. Admin: Reject Trash
// 6. Analyze Recycle Hotspots
export interface Hotspot {
    locationName: string;
}

export interface AnalyzeResponse {
    topHotspots: Hotspot[];
}

export async function getRecycleAnalyze(): Promise<AnalyzeResponse> {
    console.log("[API] getRecycleAnalyze Called");
    try {
        const headers = await getAuthHeaders();
        console.log("[API] Fetching /recycle/analyze...");
        const res = await fetch(`${API_URL}/recycle/analyze`, {
            method: 'GET',
            headers
        });
        console.log("[API] /recycle/analyze Status:", res.status);

        if (!res.ok) {
            console.warn("[API Error] (Recycle Analyze), returning empty hotspots:", res.status);
            // Fallback provided by consumer (app/map/page.tsx) or return empty here
            throw new Error("Failed to fetch recycle analysis");
        }
        const json = await res.json();
        console.log("[API] /recycle/analyze JSON:", json);
        return json;
    } catch (e) {
        console.warn("[Network Error] (Recycle Analyze):", e);
        // We throw here so the UI can handle fallback or show error
        throw e;
    }
}

// --- STORE / EXPERIENCE APIs ---

export interface Experience {
    id: number | string;
    businessName: string;
    ownerName: string;
    location: string;
    description: string;
    price: number;
    experienceName: string;
    imageURL?: string; // Optional if not in spec but good for UI
}

export async function getExperiences(): Promise<Experience[]> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/experience`, {
            method: 'GET',
            headers
        });

        if (!res.ok) {
            console.warn("API Error, returning mock data:", res.status);
            return MOCK_EXPERIENCES;
        }
        return res.json();
    } catch (error) {
        console.error("Network Error, returning mock data:", error);
        return MOCK_EXPERIENCES;
    }
}

const MOCK_EXPERIENCES: Experience[] = [
    {
        id: 1,
        businessName: "바다 횟집",
        ownerName: "김해양",
        location: "부산 해운대구 해변로 123",
        description: "싱싱한 활어회와 해산물을 즐길 수 있는 곳입니다. 오션세이버 포인트로 10% 할인을 받아보세요!",
        price: 5000,
        experienceName: "10% 할인 쿠폰",
        imageURL: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: 2,
        businessName: "오션 카페",
        ownerName: "이바다",
        location: "부산 해운대구 달맞이길 45",
        description: "바다가 보이는 멋진 뷰와 함께 커피 한 잔의 여유를 즐기세요.",
        price: 3000,
        experienceName: "아메리카노 1잔 무료",
        imageURL: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: 3,
        businessName: "서핑 스쿨",
        ownerName: "박파도",
        location: "강원도 양양군 현남면",
        description: "초보자도 쉽게 배울 수 있는 서핑 강습입니다. 장비 대여 포함.",
        price: 50000,
        experienceName: "서핑 입문 강습 (1회)",
        imageURL: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=1000"
    }
];

export async function getExperience(id: string | number): Promise<Experience> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/experience/${id}`, {
        method: 'GET',
        headers
    });

    if (!res.ok) {
        throw new Error("Failed to fetch experience details");
    }
    return res.json();
}

// 7. Register Store (Owner)
export async function registerStore(formData: FormData) {
    const headers = await getAuthHeaders();
    delete (headers as any)['Content-Type']; // Multipart

    const res = await fetch(`${API_URL}/experiences`, {
        method: 'POST',
        headers,
        body: formData
    });

    if (!res.ok) {
        throw new Error(`Failed to register store: ${res.status}`);
    }
    return true; // 204 or 201
}

// --- GEMINI API ---

export interface GeminiGuideRequest {
    trashName: string;
    location: string;
}

export interface GeminiGuideResponse {
    trashType: string;
    category: string;
    howToSeparate: string;
    whereToDispose: string;
    additionalTips: string;
}

export async function getRecycleGuide(trashName: string, location: string): Promise<GeminiGuideResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/recycle/guide`, {
        method: 'POST', // Spec says POST
        headers,
        body: JSON.stringify({ trashName, location })
    });

    if (!res.ok) {
        throw new Error("Failed to get recycling guide");
    }
    return res.json();
}
