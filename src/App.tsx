import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";      // твоя главная (то, что уже сделали)
import { AnimeWatchPage } from "./pages/AnimeWatchPage";

export function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/anime/:id" element={<AnimeWatchPage />} />
        </Routes>
    );
}
