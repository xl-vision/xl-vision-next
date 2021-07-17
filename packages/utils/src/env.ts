export const isBrowser = typeof window === 'object';

export const isServer = !isBrowser;

export const isProduction = process.env.NODE_ENV === 'production';

export const isDevelopment = !isProduction;
