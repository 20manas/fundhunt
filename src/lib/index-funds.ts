/**
 * @example indexDataURL`abcd/efgh` => 'https://index-funds-path/abcd/efgh'
 */
export const indexDataURL = (path: TemplateStringsArray, ...rest: unknown[]) =>
  `https://raw.githubusercontent.com/20manas/fundhunt/refs/heads/data/${String.raw({raw: path}, ...rest)}`;
