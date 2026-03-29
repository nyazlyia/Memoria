import React from "react";
import { createRoot } from "react-dom/client";
import "./bootstrap.js";
import AppComponent from "./AppComponent";

const root = document.getElementById("app");
if (root) {
    createRoot(root).render(<AppComponent />);
} else {
    console.error("Root element #app not found");
}
