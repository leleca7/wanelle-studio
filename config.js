// Configuração pública da Wanelle. SEM SEGREDOS.
// O Vercel disponibilizará /api/wanelle, que acessa o Neon de forma protegida.
// No navegador local (arquivo HTML ou localhost), o sistema permanece em demonstração.
window.WANELLE_CONFIG = { backend: 'neon', apiPath: '/api/wanelle' };
