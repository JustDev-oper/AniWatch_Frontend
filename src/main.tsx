import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {App} from "./App";
import "./static/css/index.css";
import "./static/css/anime.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <BrowserRouter basename="/AniWatch_Frontend/">
            <App/>
        </BrowserRouter>
    </React.StrictMode>
);
