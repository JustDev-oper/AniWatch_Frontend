// AnimeCard.tsx
import { Link } from "react-router-dom";
import { Anime } from "../api/anime";

type Props = {
    anime: Anime;
};

export function AnimeCard({ anime }: Props) {
    const url = `/anime/${anime.id}`;

    return (
        <Link to={url} className="home-anime-card">
            <img
                src={anime.preview_image}
                alt={anime.title}
                className="home-anime-preview"
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/no-preview.png";
                }}
            />
            <button
                className="home-anime-btn"
                onClick={(e) => e.preventDefault()}
            >
                {anime.title}
            </button>
        </Link>
    );
}
