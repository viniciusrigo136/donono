/**
 * Dados da empresa. Tudo o que ainda não foi confirmado fica como `null`
 * e simplesmente não aparece na interface. Veja PENDENCIAS.md.
 */
export interface CompanyConfig {
  name: string
  slogan: string
  instagramUrl: string
  instagramHandle: string
  /** Formato internacional, apenas dígitos. Vazio = canal indisponível. */
  whatsappNumber: string
  phoneDisplay: string | null
  address: string | null
  serviceArea: string | null
  openingHours: string | null
  logo: { src: string; width: number; height: number; alt: string }
  /** Fotografia do hero. `null` mostra a logo em destaque até haver foto real. */
  heroImage: { src: string; alt: string; width: number; height: number } | null
  coffeeBreakImage: { src: string; alt: string; width: number; height: number } | null
}

const digitsOnly = (value: string | undefined) => (value ?? '').replace(/\D/g, '')

export const company: CompanyConfig = {
  name: 'Do Nono',
  slogan: 'Para sua mesa',
  instagramUrl: 'https://www.instagram.com/dononopanificados/',
  instagramHandle: '@dononopanificados',
  // Número confirmado pela empresa; VITE_WHATSAPP_NUMBER substitui se definido.
  whatsappNumber: digitsOnly(import.meta.env.VITE_WHATSAPP_NUMBER) || '554999796208',
  phoneDisplay: null,
  address: null,
  serviceArea: null,
  openingHours: null,
  logo: {
    src: '/brand/logo-do-nono.webp',
    width: 1254,
    height: 1254,
    alt: 'Do Nono — Para sua mesa',
  },
  // Imagens ilustrativas (geradas com IA) até haver fotografias reais. Ver PENDENCIAS.md.
  heroImage: { src: '/produtos/hero.webp', alt: 'Produtos Do Nono servidos à mesa', width: 1280, height: 1600 },
  coffeeBreakImage: { src: '/produtos/coffee-break.webp', alt: 'Mesa de coffee break com produtos Do Nono', width: 1200, height: 900 },
}

export const settings = {
  /** Modo de demonstração: exibe aviso e itens marcados como isDemo. */
  demoMode: import.meta.env.VITE_DEMO_MODE !== 'false',
  /** Quantidade máxima por linha do carrinho. */
  maxQuantityPerItem: 99,
  /** Acima deste tamanho de URL o WhatsApp pode cortar a mensagem. */
  maxWhatsAppUrlLength: 3000,
  adminPin: import.meta.env.VITE_ADMIN_PIN ?? '',
}
