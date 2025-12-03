// Package color mapping utility
// Each package gets a unique, visually distinct color

export const PACKAGE_COLORS: Record<string, string> = {
    'Standard Package': '#10B981',    // Green
    'Economy Package': '#3B82F6',     // Blue
    'Executive Package': '#8B5CF6',   // Purple
    'Gold Package': '#F59E0B',        // Amber/Gold
    'Platinum Package': '#6B7280',    // Gray/Platinum
    'VIP Package': '#EF4444',         // Red
    'VVIP Package': '#EC4899',        // Pink
};

/**
 * Get the color for a given package name
 * Returns a default gray color if package is not found
 */
export function getPackageColor(packageName: string): string {
    return PACKAGE_COLORS[packageName] || '#9CA3AF'; // Default gray
}

/**
 * Get all package colors as an array of [packageName, color] tuples
 */
export function getAllPackageColors(): [string, string][] {
    return Object.entries(PACKAGE_COLORS);
}

/**
 * Get a lighter version of the package color for backgrounds
 */
export function getPackageColorLight(packageName: string, opacity: number = 0.1): string {
    const color = getPackageColor(packageName);
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}
