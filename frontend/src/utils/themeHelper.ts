export const applyThemeColor = (color: string) => {
  document.documentElement.style.setProperty("--color-primary", color);
};

export const applyDarkMode = (mode: "light" | "dark" | "system") => {
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else if (mode === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
};

export const updateDocumentTitle = (title: string) => {
  document.title = title;
};

export const updateFavicon = (url: string) => {
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
};
