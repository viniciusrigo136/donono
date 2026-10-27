# Do Nono — site catálogo (MVP)

Catálogo com seleção de produtos e envio da consulta pelo WhatsApp. Sem pagamento online e sem backend.
React + TypeScript + Vite + Tailwind CSS + Lucide.

## Executar

```bash
npm install
cp .env.example .env   # ajuste os valores
npm run dev            # http://localhost:5173
```

| Comando | O que faz |
| --- | --- |
| `npm run build` | checagem de tipos + build de produção em `dist/` |
| `npm run typecheck` | só a checagem de tipos |
| `npm run lint` | ESLint |
| `npm test` | testes do carrinho, catálogo e mensagem (Vitest) |

## Onde editar

| O quê | Onde |
| --- | --- |
| Produtos, categorias, preços, variações | `src/data/catalog.json` (validado por `src/catalog/validate.ts`; tipos em `src/catalog/types.ts`) — ou pelo painel |
| WhatsApp, modo demonstração, PIN do painel | `.env` (`VITE_WHATSAPP_NUMBER`, `VITE_DEMO_MODE`, `VITE_ADMIN_PIN`) |
| Nome, slogan, Instagram, telefone, endereço, horários, fotos do hero/coffee break | `src/config/company.ts` (campos `null` não aparecem no site) |
| Limite de quantidade por item | `settings.maxQuantityPerItem` em `src/config/company.ts` |
| Logo | `public/brand/logo-do-nono.webp` (troque o arquivo mantendo o nome, ou ajuste `company.logo`) |
| Fotos dos produtos | coloque em `public/produtos/` e informe o caminho (`/produtos/arquivo.webp`) no campo `image` ou no painel |
| Textos e meta tags | `index.html` (SEO/Open Graph) e componentes em `src/components/` |

Preços são sempre **centavos inteiros** (`priceInCents: 1250` = R$ 12,50). Sem preço = “sob consulta”.
Uma opção de variação com `priceInCents` substitui o preço base do produto.

## Painel administrativo

Acesse `/#/admin` e entre com o `VITE_ADMIN_PIN`. Permite cadastrar, editar, ocultar e excluir produtos;
alterar preços (inclusive direto na lista); definir disponibilidade, destaque e variações; enviar fotos
(redimensionadas para WebP); criar, renomear, ordenar e ocultar categorias; exportar e importar o catálogo.

**Importante — como as alterações chegam ao público.** Este MVP não tem servidor. O painel salva as
alterações como rascunho **no navegador de quem editou** (o site daquele navegador já mostra as mudanças).
Para publicar para todos: aba **Publicar → Exportar catalog.json**, substituir `src/data/catalog.json`
e gerar um novo build. Para a cliente editar e o site atualizar sozinho, é preciso um backend
(ex.: Supabase/Firebase com login real) — a camada `src/catalog/catalogStore.ts` é o ponto de troca.

O PIN só esconde a interface: como tudo roda no navegador, ele **não é segurança real**. Nada sensível
fica exposto (o painel só edita o rascunho local), mas não reutilize uma senha pessoal.

## Modo de demonstração

Com `VITE_DEMO_MODE=true` (padrão): faixa de aviso no topo, itens `isDemo` visíveis com a etiqueta
“Exemplo” e `<meta name="robots" content="noindex, nofollow">`.

Para a versão comercial: cadastre os produtos reais, defina `VITE_DEMO_MODE=false` (itens `isDemo` são
ocultados e o site passa a ser indexável), apague os itens de exemplo do `catalog.json` e gere o build.

## O que falta antes de publicar

Veja [PENDENCIAS.md](PENDENCIAS.md).
