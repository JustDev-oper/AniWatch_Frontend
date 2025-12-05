// src/pages/HomePage.tsx
import {useEffect, useState} from "react";
import {AnimeGrid} from "../components/AnimeGrid";
import {Header} from "../components/Header";
import {TelegramButton} from "../components/TelegramButton";
import {Footer} from "../components/Footer";
import {getAnimeList, Anime} from "../api/anime";
import {SearchBar} from "../components/SearchBar";
import {AnimeCardSkeleton} from "../components/AnimeCardSkeleton";

export function HomePage() {
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [filtered, setFiltered] = useState<Anime[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAnimeList()
            .then((data) => {
                setAnimeList(data);
                setFiltered(data);
            })
            .catch((e) => setError(e.message))
            .finally(() => setIsLoading(false));
    }, []);

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

    return (
        <div className="home-body">
            <div className="home-container">
                <Header/>
                <SearchBar value={search} onChange={setSearch}/>

                <main className="home-main">
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

                    {!isLoading && !error && <AnimeGrid animeList={filtered}/>}
                </main>

                <TelegramButton/>
                <Footer/>
            </div>
        </div>
    );
}
