# Pendências antes de publicar

Nada abaixo foi inventado no site: o que não foi confirmado está vazio e simplesmente não aparece.

## Dados da empresa (`.env` e `src/config/company.ts`)

- [x] WhatsApp configurado: +55 49 9979-6208 (`VITE_WHATSAPP_NUMBER=554999796208`). Fazer um envio
      real de teste pelo celular para confirmar que o link abre a conversa certa.
- [ ] Telefone, endereço, região atendida e horários (opcionais; só aparecem se preenchidos).
- [ ] Confirmar o texto curto “Sobre” (hoje apenas factual: massas, pães e coffee break).

## Catálogo (`src/data/catalog.json` ou painel)

- [ ] Nomes comerciais reais dos produtos.
- [ ] Unidade de venda de cada produto (pacote, unidade, bandeja, caixa, peso da embalagem…).
- [ ] Preços confirmados (ou deixar “sob consulta”).
- [ ] Variações reais (formatos de massa, recheios, tamanhos de bandeja/caixa).
- [ ] Descrições, ingredientes e alergênicos — somente se confirmados pela empresa.
- [ ] Remover os 5 itens de exemplo (`isDemo: true`) e definir `VITE_DEMO_MODE=false`.
- [ ] Condições comerciais (pedido mínimo, prazo, entrega/retirada, frete) — hoje o site só diz que são
      confirmadas pelo atendimento.

## Imagens

- [x] Logo: o WebP recebido já é transparente (fundo com alpha 0, brancos internos preservados).
      Opcional: uma versão SVG para nitidez máxima em tamanhos grandes.
- [ ] **Fotografias reais.** As imagens atuais em `public/produtos/` (5 produtos, hero e coffee break)
      são **ilustrativas, geradas com IA**, e não registram os produtos da empresa. Validar com a Do Nono
      e substituir por fotos reais (mesmos nomes de arquivo) antes do uso comercial.
- [ ] Imagem Open Graph 1200×630 (hoje usa a logo).

### Orientação para tratar as fotos reais (com ou sem IA)

Partir sempre da foto original do produto. Permitido: corrigir exposição e balanço de branco, nitidez
natural, enquadramento padrão 4:3 (cards) e 4:5 (hero), limpar distrações e trocar o fundo por creme,
madeira clara ou mesa neutra. Preservar formato, textura, recheio, cobertura, quantidade de unidades
da embalagem e rótulos. Não adicionar ingredientes nem acompanhamentos. Não usar capturas do Instagram
com barras, molduras ou nomes de usuário.

Prompt base sugerido (ferramenta de edição a partir da foto real):
> “Mantenha o alimento exatamente como está (formato, textura, quantidade e recheio). Corrija a
> exposição e o balanço de branco para luz natural quente, aumente a nitidez de forma sutil, enquadre
> em 4:3 com o produto centralizado e substitua o fundo por uma superfície de madeira clara/creme
> neutra, sem adicionar nenhum outro objeto ou ingrediente.”

Exportar em WebP, ~1600 px no lado maior para o hero e ~1200 px para os cards, em `public/produtos/`.

## Painel

- [ ] Definir um `VITE_ADMIN_PIN` próprio (o do `.env.example` é só para teste).
- [ ] Decidir se a cliente precisará publicar sozinha. Se sim, conectar um backend com login real
      (ver README, seção “Painel administrativo”).
