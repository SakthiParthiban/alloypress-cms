"use client";

import { useServerInsertedHTML } from "next/navigation";

const themeInitScript = `
(function () {
  try {
    var key = "alloypress-theme";
    var savedTheme = localStorage.getItem(key);

    var theme;

    if (savedTheme === "light" || savedTheme === "dark") {
      theme = savedTheme;
    } else {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    document.documentElement.setAttribute("data-theme", theme);
  } catch (error) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export default function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="alloypress-theme"
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
    );
  });

  return null;
}