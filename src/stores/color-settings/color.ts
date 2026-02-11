import type { StateCreator } from "zustand";

export interface ColorSettingsState {
    backgroundColor: string;
    textColor: string;
    sidebarColor: string;
    setBackgroundColor: (obj: any) => void;
    setTextColor: (obj: any) => void;
    setSidebarColor: (obj: any) => void;
}

export const colorSettingSlice : StateCreator<ColorSettingsState> = (set) => ({
    backgroundColor: "#ffffff",
    textColor: "#000000",
    sidebarColor: "#f0f0f0",

    setBackgroundColor : (value : string) => {
        set((state) => ({backgroundColor: value}));
    },
    setTextColor : (value : string) => {
        set((state) => ({textColor: value}));
    },
    setSidebarColor : (value : string) => {
        set((state) => ({sidebarColor: value}));
    },
})