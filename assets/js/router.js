/**
 * BlueTEXT Client-Side Router
 * Navigation states are handled dynamically by window.appNavigate in app.js.
 */
export const navigateTo = (category, subcategory = '') => {
  if (window.appNavigate) {
    window.appNavigate(category, subcategory);
  }
};
