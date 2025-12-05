// src/pages/HomePage.tsx
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {AnimeGrid} from "../components/AnimeGrid";
import {Header} from "../components/Header";
import {TelegramButton} from "../components/TelegramButton";
import {Footer} from "../components/Footer";
import {getAnimeList, Anime} from "../api/anime";
import {SearchBar} from "../components/SearchBar";
import {AnimeCardSkeleton} from "../components/AnimeCardSkeleton";

type SavedProgress = {
    time: number;
    duration: number | null;
    updatedAt: number;
};

type ContinueItem = {
    id: string;
    anime: Anime;
    progressPercent: number;
};

function getVideoKey(id: string) {
    return `anime_${id}`;
}

export function HomePage() {
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [filtered, setFiltered] = useState<Anime[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [continueList, setContinueList] = useState<ContinueItem[]>([]);

    // загрузка списка аниме
    useEffect(() => {
        getAnimeList()
            .then((data) => {
                setAnimeList(data);
                setFiltered(data);
            })
            .catch((e) => setError(e.message))
            .finally(() => setIsLoading(false));
    }, []);

    // поиск
    useEffect(() => {
        const term = search.toLowerCase().trim();
        if (!term) {
            setFiltered(animeList);
            return;
        }
        setFiltered(
            animeList.filter((a) => a.title.toLowerCase().includes(term))
        );
    }, [search, animeList]);

    // «Продолжить просмотр»
    useEffect(() => {
        if (!animeList.length) return;

        const items: { id: string; progress: SavedProgress }[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith("anime_")) continue;

            const id = key.replace("anime_", "");
            const raw = localStorage.getItem(key);
            if (!raw) continue;

            try {
                const data = JSON.parse(raw) as SavedProgress;
                if (!data.time || Number.isNaN(data.time) || data.time <= 0) continue;
                if (data.duration && data.duration > 0 && data.time / data.duration > 0.95) {
                    continue;
                }
                items.push({id, progress: data});
            } catch {
                continue;
            }
        }

        items.sort((a, b) => (b.progress.updatedAt || 0) - (a.progress.updatedAt || 0));
        const sliced = items.slice(0, 6);

        const mapped: ContinueItem[] = sliced
            .map(({id, progress}) => {
                const anime = animeList.find((a) => String(a.id) === id);
                if (!anime) return null;

                const duration = progress.duration && progress.duration > 0 ? progress.duration : null;
                const percent = duration ? Math.min(99, (progress.time / duration) * 100) : 0;

                return {
                    id,
                    anime,
                    progressPercent: percent,
                };
            })
            .filter((x): x is ContinueItem => x !== null);

        setContinueList(mapped);
    }, [animeList]);

    return (
        <div className="home-body">
            <div className="home-container">
                <Header/>
                <SearchBar value={search} onChange={setSearch}/>

                <main className="home-main">
                    {/* Блок "Продолжить просмотр" */}
                    {continueList.length > 0 && (
                        <section className="home-continue">
                            <h2 className="home-continue-title">Продолжить просмотр</h2>
                            <div className="home-anime-grid">
                                {continueList.map(({id, anime, progressPercent}) => (
                                    <Link
                                        key={id}
                                        to={`/anime/${id}`}
                                        className="home-anime-card"
                                    >
                                        <div className="home-anime-inner">
                                            <div className="home-anime-content">
                                                <img
                                                    src={anime.preview_image}
                                                    alt={anime.title}
                                                    className="home-anime-preview"
                                                />
                                                <div className="home-progress">
                                                    <div
                                                        className="home-progress-bar"
                                                        style={{width: `${progressPercent}%`}}
                                                    />
                                                </div>
                                            </div>
                                            <button className="home-anime-btn">
                                                Продолжить
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {isLoading && (
                        <div className="home-anime-grid">
                            {Array.from({length: 4}).map((_, i) => (
                                <AnimeCardSkeleton key={i}/>
                            ))}
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="home-no-results">Ошибка: {error}</div>
                    )}

                    {!isLoading && !error && (
                        <section className="home-continue">
                            <h2 className="home-continue-title">Все аниме</h2>
                            <div>
                                <AnimeGrid animeList={filtered}/>
                            </div>
                        </section>
                    )}
                </main>

                <TelegramButton/>
                <Footer/>
            </div>
        </div>
    );
}
