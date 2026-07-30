// Configuração de URLs de assets locais
// As imagens serão servidas localmente durante desenvolvimento

export const ASSETS_BASE_URL = "";

// URLs de assets específicos
export const ASSETS = {
  logo: `/logorealstore.png`,
  // Adicione mais assets conforme necessário
  // heroBanner: `/hero-banner.jpg`,
  // placeholder: `/placeholder.jpg`,
};

// Função helper para obter URL de asset
export function getAssetUrl(path: string): string {
  return `/${path}`;
}
