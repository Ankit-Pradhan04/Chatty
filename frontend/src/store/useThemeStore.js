import { create } from "zustand";

//zustand is used for the same purpose redux/useContex/prop-dirlling is used
//its short , thats why this is preffered 
export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("Chatty-theme") || "night",
  setTheme: (theme) => {
    localStorage.setItem("Chatty-theme", theme);
    set({ theme });
  },
}));