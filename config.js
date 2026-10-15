// Admin uses secure Neon API; public storefront remains WhatsApp-only until
// authentication and anti-spam safeguards are validated.
const adminPage = /(?:^|\/)admin\.html$/i.test(window.location.pathname);
window.WANELLE_CONFIG = { backend: adminPage ? 'neon' : 'demo', apiPath: '/api/wanelle' };
