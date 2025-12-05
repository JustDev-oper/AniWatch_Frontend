// src/components/SearchBar.tsx
import React from "react";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export function SearchBar({value, onChange}: Props) {
    const handleKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key === "Enter") {
            // Если поиск уже завязан на value (через useEffect/фильтрацию),
            // здесь можно оставить пусто или, например, сделать scroll к результатам.
        }
    };

    return (
        <div className="home-search-container">
            <input
                type="text"
                className="home-search-input"
                placeholder="Введите название аниме..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}
