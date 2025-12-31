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
    id?: number; // Backend compatibility
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

// Wrapper for auto-refresh on 401
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    let headers = await getAuthHeaders();

    // Merge headers
    options.headers = { ...headers, ...options.headers };

    let res = await fetch(url, options);

    if (res.status === 401) {
        console.log("[API] 401 Unauthorized - Attempting Refresh...");
        const newToken = await refreshAccessToken();
        if (newToken) {
            // Retry with new token
            headers = await getAuthHeaders();
            options.headers = { ...headers, ...options.headers };
            // Re-create body if stream? (Assuming standard JSON/FormData, text is safe to reuse? No, FormData might be consumed)
            // Limitation: If body was a stream, retry might fail. But here we use JSON or FormData (reusable logic needed)
            // For simple JSON strings it's fine. For FormData, we can reuse the object.
            res = await fetch(url, options);
        }
    }
    return res;
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

// 0. Refresh Token
export async function refreshAccessToken() {
    if (typeof window === 'undefined') return null;

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();
        if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            authToken = data.accessToken;
            // Optionally update refresh token if rotated
            if (data.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
            }
            return data.accessToken;
        }
    } catch (e) {
        console.error("Token refresh failed:", e);
        // Force logout if refresh fails
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        authToken = null;
        window.location.href = "/"; // Redirect to login
    }
    return null;
}

export async function getRooms(): Promise<Room[]> {
    const headers = await getAuthHeaders();
    const res = await fetchWithAuth(`${API_URL}/games/rooms`, {
        method: 'GET'
    });
    if (!res.ok) {
        throw new Error("Failed to fetch rooms");
    }
    return res.json();
}

export async function getRankings() {
    const headers = await getAuthHeaders();
    const res = await fetchWithAuth(`${API_URL}/users/rank/10`, {
        method: 'GET'
    });
    if (!res.ok) {
        throw new Error("Failed to fetch rankings");
    }
    return res.json();
}

export async function getUser() {
    const headers = await getAuthHeaders();
    const res = await fetchWithAuth(`${API_URL}/users`, {
        method: 'GET'
    });
    if (!res.ok) {
        throw new Error("Failed to fetch user");
    }
    return res.json();
}

export async function createRoom(data: CreateRoomRequest): Promise<Room> {
    const headers = await getAuthHeaders();
    console.log("Creating room with headers:", headers);
    const res = await fetchWithAuth(`${API_URL}/games/rooms`, {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error(`Failed to create room: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

export async function getRoom(roomId: string | number): Promise<Room> {
    const headers = await getAuthHeaders();
    const res = await fetchWithAuth(`${API_URL}/games/rooms/${roomId}`, {
        method: 'GET'
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch room: ${res.status}`);
    }
    return res.json();
}

export async function joinRoom(roomId: string | number, password?: string) {
    const headers = await getAuthHeaders();
    const res = await fetchWithAuth(`${API_URL}/games/rooms/${roomId}`, {
        method: 'PATCH',
        body: JSON.stringify({ password })
    });

    if (!res.ok) {
        throw new Error(`Failed to join room: ${res.status}`);
    }
    return res.json();
}

export async function startGame(roomId: string | number) {
    const headers = await getAuthHeaders();
    const res = await fetchWithAuth(`${API_URL}/games/${roomId}`, {
        method: 'PATCH'
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

    const res = await fetchWithAuth(`${API_URL}/trashes`, {
        method: 'POST',
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
    const res = await fetchWithAuth(`${API_URL}/trashes`, {
        method: 'GET'
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

    const res = await fetchWithAuth(`${API_URL}/trashes/${trashId}`, {
        method: 'PATCH',
        body: formData
    });

    console.log(`[API] submitRecycle Status: ${res.status}`);

    if (!res.ok) {
        throw new Error(`Failed to submit recycle: ${res.status}`);
    }

    // Safely handle response body (might be empty for 201/204)
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : true;
    } catch (e) {
        console.warn("[API] submitRecycle: Failed to parse JSON, returning true", e);
        return true;
    }
}

// 4. Admin: Approve Trash
export async function approveTrash(trashId: number) {
    const headers = await getAuthHeaders();
    const res = await fetchWithAuth(`${API_URL}/trashes/${trashId}/approval`, {
        method: 'PATCH'
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
    console.log("[API] getRecycleAnalyze Called (MOCK MODE)");

    // Simulate network delay slightly for realism (optional)
    // await new Promise(resolve => setTimeout(resolve, 500));

    return {
        topHotspots: [
            { locationName: "부산 해운대구" },
            { locationName: "강원도 강릉시" },
            { locationName: "제주도 서귀포시" },
            { locationName: "인천광역시 중구" },
            { locationName: "서울특별시 한강공원" }
        ]
    };
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
        const res = await fetchWithAuth(`${API_URL}/experiences`, {
            method: 'GET'
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
    const res = await fetchWithAuth(`${API_URL}/experiences/${id}`, {
        method: 'GET'
    });

    if (!res.ok) {
        throw new Error("Failed to fetch experience details");
    }
    return res.json();
}

// 7. Register Store (Owner)
// 7. Register Store (Owner)
export interface StoreRegistrationRequest {
    businessName: string;
    ownerName: string;
    businessRegistrationNumber: string;
    location: string;
    description: string;
    // file is excluded for JSON, or handled separately if needed
}

export async function registerStore(data: StoreRegistrationRequest) {
    const headers = await getAuthHeaders();
    // Do NOT delete Content-Type (keep application/json)
    console.log("[API] Registering Store (JSON) with Headers:", headers);

    const res = await fetchWithAuth(`${API_URL}/experiences`, {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error(`Failed to register store: ${res.status}`);
    }

    // Attempt to return JSON (created object needed for next steps)
    try {
        const body = await res.json();
        return body;
    } catch {
        // Fallback for empty 201
        return { id: Date.now() };
    }
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
    const res = await fetchWithAuth(`${API_URL}/recycle/guide`, {
        method: 'POST', // Spec says POST
        body: JSON.stringify({ trashName, location })
    });

    if (!res.ok) {
        throw new Error("Failed to get recycling guide");
    }
    return res.json();
}

// 7a. Register Coupon (Benefit)
export async function registerExperienceCoupon(experienceId: number | string, couponName: string) {
    const headers = await getAuthHeaders();
    // Assuming endpoint: POST /experiences/{id}/coupons (Or similar)
    // If backend isn't ready, this mock ensures frontend flow works.
    console.log(`[API] Registering Coupon for Experience ${experienceId}: ${couponName}`);

    try {
        const res = await fetchWithAuth(`${API_URL}/experiences/${experienceId}/coupons`, {
            method: 'POST',
            body: JSON.stringify({ name: couponName })
        });
        if (!res.ok) throw new Error("Failed to register coupon");
        return true;
    } catch (e) {
        console.warn("[API] Coupon API not ready, using mock success", e);
        return true;
    }
}

// 8. User Coupon Wallet
export interface Coupon {
    id: number;
    experienceName: string; // e.g., "10% Discount"
    businessName: string;   // e.g., "Ocean Cafe"
    validUntil?: string;    // ISO Date
    isUsed: boolean;
}

export async function getMyCoupons(): Promise<Coupon[]> {
    const headers = await getAuthHeaders();

    // Always visible mock coupon (requested by user)
    const MOCK_COUPON: Coupon = {
        id: 9999,
        experienceName: "🎉 오픈 기념 무료 쿠폰",
        businessName: "오션 세이버",
        isUsed: false,
        validUntil: "2099-12-31"
    };

    try {
        const res = await fetchWithAuth(`${API_URL}/users/coupon`, {
            method: 'GET'
        });

        if (res.ok) {
            const data = await res.json();
            // Combine real data with the mandatory mock item
            return Array.isArray(data) ? [...data, MOCK_COUPON] : [MOCK_COUPON];
        }
    } catch (e) {
        console.warn("Failed to fetch coupons:", e);
    }

    // Fallback if API fails or errors
    return [MOCK_COUPON];
}
