// src/api/anime.ts
const API_URL = "https://aniwatch-backend-production.up.railway.app/api/v1/anime";
const API_KEY = "poopgaymaster";

export type Anime = {
    id: number;
    title: string;
    preview_image: string;
};

export type AnimeDetails = {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    video_url?: string;
};

// Список аниме
export async function getAnimeList(): Promise<Anime[]> {
    const res = await fetch(API_URL, {
        method: "GET",
        headers: {
            "X-API-KEY": API_KEY,
        },
    });

    if (!res.ok) {
        throw new Error("Ошибка загрузки API: " + res.status);
    }

    return res.json();
}

// Одно аниме по id
export async function getAnimeById(id: string | number): Promise<AnimeDetails> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: {
            "X-API-KEY": API_KEY,
        },
    });

    if (!res.ok) {
        throw new Error("Ошибка API: " + res.status);
    }

    return res.json();
}
