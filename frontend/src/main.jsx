import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App";
import "./index.css";
import ThemeContextProvider
from "./theme/ColorModeContext";
import { AvatarProvider } from "./context/AvatarContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <BrowserRouter>

      <ThemeContextProvider>

        <AvatarProvider>

          <App />

        </AvatarProvider>

      </ThemeContextProvider>

    </BrowserRouter>

  </React.StrictMode>

);