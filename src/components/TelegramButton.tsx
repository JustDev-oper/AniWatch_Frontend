// src/components/TelegramButton.tsx
export function TelegramButton() {
    const goToTelegram = () => {
        window.open("https://t.me/AniWatchRU", "_blank");
    };

    return (
        <div className="home-telegram-container">
            <button className="home-telegram-btn" onClick={goToTelegram}>
                <svg className="home-telegram-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.509l-3-2.21-1.447 1.394c-.14.14-.26.26-.534.26l.213-3.05 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.652-.64.136-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Наш Telegram канал
            </button>
        </div>
    );
}
