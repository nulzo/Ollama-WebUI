import { useState, useEffect, useCallback } from 'react';

// Type definition for the hook's return value
interface UseThemeHook {
  setTheme: (theme: string) => void;
  getTheme: () => string;
  currentTheme: string;
}

const useTheme = (initialTheme: string = 'theme-default'): UseThemeHook => {
  const [currentTheme, setCurrentTheme] = useState<string>(initialTheme);

  useEffect(() => {
    const bodyElement = document.body;

    // Extract all classes on the body element
    const classList = bodyElement.className.split(' ');

    // Find the current theme class (assuming it starts with 'theme-')
    const themeClassIndex = classList.findIndex(className => className.startsWith('theme-'));

    if (themeClassIndex !== -1) {
      // Replace the old theme class with the new one
      classList[themeClassIndex] = currentTheme;
    } else {
      // If no theme class is found, add the new theme class
      classList.push(currentTheme);
    }

    // Update the body element className
    bodyElement.className = classList.join(' ');

    // Clean up function to reset theme class when the component unmounts or the theme changes
    return () => {
      const cleanClassList = bodyElement.className
        .split(' ')
        .filter(className => className !== currentTheme);
      bodyElement.className = cleanClassList.join(' ');
    };
  }, [currentTheme]); // Run when currentTheme changes

  const setTheme = useCallback((theme: string) => {
    console.log(theme);
    setCurrentTheme(theme);
  }, []);

  const getTheme = useCallback((): string => {
    return currentTheme;
  }, [currentTheme]);

  return { setTheme, getTheme, currentTheme };
};

export default useTheme;
