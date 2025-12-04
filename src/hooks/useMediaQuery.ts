import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Check if window is defined (client-side)
        if (typeof window === 'undefined') {
            return;
        }

        const media = window.matchMedia(query);

        // Set initial value
        setMatches(media.matches);

        // Create event listener
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener
        media.addEventListener('change', listener);

        // Cleanup
        return () => {
            media.removeEventListener('change', listener);
        };
    }, [query]);

    return matches;
}

// Pre-defined breakpoint hooks for convenience
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
    return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
    return useMediaQuery('(min-width: 1024px)');
}
