import React, {createContext, useContext, useState, useEffect} from "react";

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children} : {children: React.ReactNode}) => {
    const [theme, setTheme] = useState<string>(() => {
        return localStorage.getItem('theme') || 'default';
    });

    useEffect( () => {
        //apply theme to the document 
        document.documentElement.setAttribute("data-theme", theme);

        // save current theme to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
};

export const useTheme = () => useContext(ThemeContext);
