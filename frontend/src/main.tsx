import ReactDOM from "react-dom/client";
import * as React from 'react';
import "./style/output.css";
import "@/style/md.css";
import "@/style/syntax.css";
import { App } from '@/app';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
