export const isNull = (value: unknown): value is null => value === null;

export const isUndefined = (value: unknown): value is undefined => typeof value === 'undefined';

export const isNullish = (value: unknown): value is null | undefined => isNull(value) || isUndefined(value);

export const isNotNull = <T>(value: T | null): value is T => !isNull(value);

export const isNotUndefined = <T>(value: T | undefined): value is T => !isUndefined(value);

export const isNotNullish = <T>(value: T | null | undefined): value is T => !isNullish(value);

export const stringify = (value: unknown): string => (typeof value === 'string' ? value.trim() : JSON.stringify(value));

/**
 * like `Object.entries` but with better type checking
 */
export const objectEntries = <T extends object>(obj: T) => Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
