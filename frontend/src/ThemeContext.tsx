import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext<{
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme(t => t === 'dark' ? 'light' : 'dark');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);

type ThemeSwitchProps = {
  onClick: () => void;
  top?: number;
  right?: number;
};


const ThemeSwitch: React.FC = ({
    onClick,
    top = 15,
    right = 60,
}) => {
    const {theme, toggleTheme} = useTheme();
    return (
        <button
        className="theme-toggle"
        title="Toggle theme"
        style={{ position: "fixed", top, right }}
        onClick={toggleTheme} 
        >
        
        {theme === 'dark' ? '☀' : '☾'}
        </button>
    );
};

export default ThemeSwitch;