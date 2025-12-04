import { useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery';

export interface ResponsiveLayout {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isSmallScreen: boolean; // mobile or tablet
}

export function useMobileLayout(): ResponsiveLayout {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isDesktop = useIsDesktop();

    return {
        isMobile,
        isTablet,
        isDesktop,
        isSmallScreen: isMobile || isTablet,
    };
}
