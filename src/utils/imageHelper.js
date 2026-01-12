const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('https')) {
    return url;
  }

  return `${BASE_URL}${url}`;
};
