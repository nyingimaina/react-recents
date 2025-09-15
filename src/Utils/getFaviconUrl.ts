export const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (error) {
    console.error("Invalid URL:", url);
    return ""; // Return a path to a default/placeholder icon if you have one
  }
};
