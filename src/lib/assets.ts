// Configuração de URLs de assets do GitHub
// As imagens serão servidas diretamente do repositório GitHub

const GITHUB_REPO = "omatheusberteli-cloud/site-szmultimarcas";
const GITHUB_BRANCH = "main";

export const ASSETS_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/assets`;

// URLs de assets específicos
export const ASSETS = {
  logo: `${ASSETS_BASE_URL}/logo.png`,
  // Adicione mais assets conforme necessário
  // heroBanner: `${ASSETS_BASE_URL}/hero-banner.jpg`,
  // placeholder: `${ASSETS_BASE_URL}/placeholder.jpg`,
};

// Função helper para obter URL de asset
export function getAssetUrl(path: string): string {
  return `${ASSETS_BASE_URL}/${path}`;
}
