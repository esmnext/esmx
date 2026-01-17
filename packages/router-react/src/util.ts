/**
 * Check if a value is an ES module.
 * @param obj - The object to check
 * @returns True if the object is an ES module
 */
export function isESModule(obj: unknown): obj is Record<string | symbol, any> {
    if (!obj || typeof obj !== 'object') return false;
    const module = obj as Record<string | symbol, any>;
    return (
        Boolean(module.__esModule) || module[Symbol.toStringTag] === 'Module'
    );
}

/**
 * Resolve a component from potentially wrapped module format.
 * Handles ES modules with default exports.
 * @param component - The component to resolve
 * @returns The resolved component
 */
export function resolveComponent(component: unknown): unknown {
    if (!component) return null;

    if (isESModule(component)) {
        return component.default || component;
    }

    if (
        component &&
        typeof component === 'object' &&
        !Array.isArray(component) &&
        'default' in component &&
        Object.keys(component).length === 1
    ) {
        return (component as { default: unknown }).default;
    }

    return component;
}
