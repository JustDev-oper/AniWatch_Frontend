// src/pages/AnimeWatchPage.tsx
import {useEffect, useState, useRef} from "react";
import {useParams} from "react-router-dom";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import "../static/css/anime.css";
import {getAnimeById, type AnimeDetails} from "../api/anime";

type SavedProgress = {
    time: number;
    duration: number | null;
    updatedAt: number;
};

function getVideoKey(id: string) {
    return `anime_${id}`;
}

function savePosition(id: string, time: number, duration?: number) {
    if (!time || Number.isNaN(time) || time <= 0) return;

    if (duration && duration > 0 && time / duration > 0.95) {
        localStorage.removeItem(getVideoKey(id));
        return;
    }

    const payload: SavedProgress = {
        time,
        duration: duration && duration > 0 ? duration : null,
        updatedAt: Date.now(),
    };

    localStorage.setItem(getVideoKey(id), JSON.stringify(payload));
}

function loadPosition(id: string): number | null {
    const saved = localStorage.getItem(getVideoKey(id));
    if (!saved) return null;

    try {
        const obj = JSON.parse(saved) as SavedProgress;
        if (!obj.time || Number.isNaN(obj.time) || obj.time <= 0) return null;
        return obj.time;
    } catch {
        return null;
    }
}

let lastSave = 0;
const SAVE_INTERVAL = 10000;

export function AnimeWatchPage() {
    const {id} = useParams<{ id: string }>();

    const [anime, setAnime] = useState<AnimeDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const plyrRef = useRef<Plyr | null>(null);

    // загрузка данных
    useEffect(() => {
        if (!id) {
            setError("ID аниме не передан");
            return;
        }

        async function loadAnimeData() {
            try {
                const data = await getAnimeById(id);
                setAnime(data);
                document.title = data.title || "Аниме";
                setError(null);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки данных");
            }
        }

        loadAnimeData();
    }, [id]);

    // инициализация Plyr
    useEffect(() => {
        if (!videoRef.current) return;

        // уничтожаем старый инстанс, если был
        if (plyrRef.current) {
            plyrRef.current.destroy();
            plyrRef.current = null;
        }

        const player = new Plyr(videoRef.current, {
            seekTime: 10,
            controls: [
                "play",
                "progress",
                "current-time",
                "mute",
                "pip",
                "settings",
                "fullscreen",
            ],
        });

        plyrRef.current = player;

        // восстановление позиции после загрузки метаданных
        const handleLoaded = () => {
            if (!id) return;
            const saved = loadPosition(id);
            if (saved && saved > 0 && saved < player.duration) {
                player.currentTime = saved;
            }
        };

        const handlePause = () => {
            if (!id) return;
            savePosition(id, player.currentTime, player.duration);

            const indicator = document.getElementById("saveIndicator") as HTMLDivElement | null;
            if (indicator) {
                indicator.classList.add("show");
                setTimeout(() => indicator.classList.remove("show"), 2000);
            }
        };

        const handleTimeUpdate = () => {
            if (!id) return;
            const now = Date.now();
            if (now - lastSave < SAVE_INTERVAL) return;
            lastSave = now;
            savePosition(id, player.currentTime, player.duration);
        };

        player.on("loadedmetadata", handleLoaded);
        player.on("pause", handlePause);
        player.on("timeupdate", handleTimeUpdate);

        return () => {
            player.destroy();
            plyrRef.current = null;
        };
    }, [id, anime?.video_url]);

    // сохранение при выходе
    useEffect(() => {
        if (!id) return;

        function handleBeforeUnload() {
            const player = plyrRef.current;
            if (!player) return;
            savePosition(id, player.currentTime, player.duration);
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("pagehide", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("pagehide", handleBeforeUnload);
        };
    }, [id]);

    if (error) {
        return (
            <div className="watch-page">
                <div className="watch-container">
                    <header className="watch-header">
                        <h1 className="watch-title">Ошибка</h1>
                        <p className="watch-subtitle">{error}</p>
                    </header>
                </div>
            </div>
        );
    }

    if (!anime && !error) {
        return (
            <div className="watch-page">
                <div className="watch-container">
                    <div className="watch-save-indicator" id="saveIndicator">
                        Позиция сохранена
                    </div>

                    <header className="watch-header">
                        <h1 className="watch-title">Загружаем аниме...</h1>
                        <p className="watch-subtitle">
                            Пожалуйста, подождите пару секунд
                        </p>
                    </header>

                    <main className="watch-main">
                        <section className="watch-video-container watch-skeleton-video"/>
                        <section className="watch-info-section">
                            <div className="watch-skeleton-text"/>
                            <div className="watch-skeleton-text short"/>
                        </section>
                    </main>

                    <footer className="watch-footer">
                        © 2025 Смотри Аниме на AniWatch!
                    </footer>
                </div>
            </div>
        );
    }

    const videoUrl =
        anime?.video_url ??
        "http://docs.evostream.com/sample_content/assets/bunny.mp4";

    return (
        <div className="watch-page">
            <div className="watch-container">
                <div className="watch-save-indicator" id="saveIndicator">
                    Позиция сохранена
                </div>

                <header className="watch-header">
                    <h1 className="watch-title">{anime?.title || "Без названия"}</h1>
                    <p className="watch-subtitle">{anime?.subtitle || ""}</p>
                </header>

                <main className="watch-main">
                    <section className="watch-video-container">
                        {/* простой <video>, Plyr навешивается через new Plyr(...) */}
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className="watch-video"
                        />
                        <div className="rewind-indicator" id="rewindIndicator"/>
                    </section>

                    <section className="watch-info-section">
                        <div className="watch-browser-warning">
                            Рекомендуем использовать браузер Chrome!
                        </div>
                        <h2 className="watch-info-title">О сериале</h2>
                        <p className="watch-info-text">
                            {anime?.description || "Описание отсутствует"}
                        </p>
                    </section>
                </main>

                <footer className="watch-footer">
                    © 2025 Смотри Аниме на AniWatch!
                </footer>
            </div>
        </div>
    );
}
