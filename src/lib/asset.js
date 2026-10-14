// Absolute URL for a file in public/. Relative paths break on nested routes
// (/projects/...) and on the base path without its trailing slash.
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
