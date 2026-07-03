import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { resolveTheme, type ThemePreference } from "../workspace/workspace-preferences.js";
const Context = createContext<{ preference: ThemePreference; setPreference: (preference: ThemePreference) => void }>({ preference: "system", setPreference: () => undefined });
export function ThemeProvider({ children }: { readonly children: ReactNode }) { const [preference, setPreference] = useState<ThemePreference>("system"); useEffect(() => { const media = matchMedia("(prefers-color-scheme: dark)"), apply = () => document.documentElement.dataset.theme = resolveTheme(preference, media.matches); apply(); media.addEventListener("change", apply); return () => media.removeEventListener("change", apply); }, [preference]); return <Context.Provider value={{ preference, setPreference }}>{children}</Context.Provider>; }
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(Context);
