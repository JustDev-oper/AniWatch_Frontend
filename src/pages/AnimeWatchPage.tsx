// src/pages/AnimeWatchPage.tsx
import {useEffect, useState, useRef} from "react";
import {useParams} from "react-router-dom";
import Plyr, {PlyrInstance, PlyrProps} from "plyr-react";
import "plyr-react/plyr.css";
import "../static/css/anime.css";
import {getAnimeById, type AnimeDetails} from "../api/anime";

export function AnimeWatchPage() {
    const {id} = useParams<{ id: string }>();

    const [anime, setAnime] = useState<AnimeDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    const plyrRef = useRef<PlyrInstance | null>(null);

    // 1. Грузим данные аниме
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

    // 2. Сохранение позиции при закрытии страницы
    useEffect(() => {
        if (!id) return;
        const VIDEO_POSITION_KEY = `anime_${id}`;

        function handleBeforeUnload() {
            const player = plyrRef.current?.plyr;
            if (!player) return;
            const t = player.currentTime;
            if (t && t > 0) {
                localStorage.setItem(VIDEO_POSITION_KEY, t.toString());
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("pagehide", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("pagehide", handleBeforeUnload);
        };
    }, [id]);

    // 3. Восстановление позиции
    useEffect(() => {
        if (!anime?.video_url || !id) return;
        const player = plyrRef.current?.plyr;
        if (!player) return;

        const VIDEO_POSITION_KEY = `anime_${id}`;
        const saved = localStorage.getItem(VIDEO_POSITION_KEY);
        if (!saved) return;

        const pos = parseFloat(saved);
        if (!pos || Number.isNaN(pos)) return;

        const interval = setInterval(() => {
            const duration = player.duration || 0;
            if (duration > 0) {
                if (pos > 0 && pos < duration) {
                    player.currentTime = pos;
                }
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, [anime, id]);

    // 4. Сохранение при паузе
    function handlePause() {
        if (!id) return;
        const player = plyrRef.current?.plyr;
        if (!player) return;

        const VIDEO_POSITION_KEY = `anime_${id}`;
        const t = player.currentTime;
        if (t && t > 0) {
            localStorage.setItem(VIDEO_POSITION_KEY, t.toString());
        }

        const indicator = document.getElementById(
            "saveIndicator"
        ) as HTMLDivElement | null;
        if (indicator) {
            indicator.classList.add("show");
            setTimeout(() => indicator.classList.remove("show"), 2000);
        }
    }

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

    const plyrSource: PlyrProps["source"] = {
        type: "video",
        sources: [
            {
                src: videoUrl,
                type: "video/mp4",
            },
        ],
    };

    const plyrOptions: PlyrProps["options"] = {
        seekTime: 10,
        keyboard: {
            focused: true,
            global: true,
        },
        controls: [
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "settings",
            "fullscreen",
        ],
    };

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
                        <Plyr
                            ref={plyrRef}
                            source={plyrSource}
                            options={plyrOptions}
                            onPause={handlePause}
                        />
                        <div className="rewind-indicator" id="rewindIndicator"></div>
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
