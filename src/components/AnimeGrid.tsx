// src/components/AnimeGrid.tsx
import { Anime } from "../api/anime";
import { AnimeCard } from "./AnimeCard";

type Props = {
    animeList: Anime[];
};

export function AnimeGrid({ animeList }: Props) {
    if (!animeList.length) {
        return <div className="home-no-results">Ничего не найдено</div>;
    }

    return (
        <div className="home-anime-grid">
            {animeList.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
            ))}
        </div>
    );
}
