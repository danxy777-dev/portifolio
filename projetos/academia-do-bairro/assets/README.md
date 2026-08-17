# Pasta de Imagens (assets/)

Coloque aqui as imagens do site. O HTML já referencia os caminhos abaixo — basta colocar os arquivos com esses nomes.

## Imagens necessárias

| Arquivo | Onde aparece | Dimensões recomendadas |
|---------|--------------|------------------------|
| `hero-bg.jpg` | Imagem de fundo do topo (hero) | 1920x1080 px ou maior (paisagem) |
| `sobre.jpg` | Imagem da seção "Quem Somos" | 800x600 px (paisagem) |
| `logo.png` | *(opcional)* Logo da academia para o header | 240x80 px, fundo transparente |

## Formatos aceitos

- `.jpg` / `.jpeg` — fotos (compressão menor)
- `.png` — imagens com transparência (logo)
- `.webp` — formato moderno, menor tamanho

## Dicas

- **Otimize antes de subir**: use ferramentas como [TinyPNG](https://tinypng.com) ou [Squoosh](https://squoosh.app). Imagens pesadas deixam o site lento.
- **Tamanho máximo recomendado**: cada imagem deve ter menos de 500 KB.
- Se você **não adicionar** a imagem, o site continua funcionando — o HTML mostra um placeholder cinza com a mensagem "ADICIONE A IMAGEM".
- Quando trocar uma imagem, mantenha o mesmo nome do arquivo para o site reconhecer automaticamente.

## Substituir imagens no HTML

Se você quiser usar nomes diferentes (por exemplo `foto-academia.jpg` em vez de `sobre.jpg`), edite o `index.html` e procure pelos comentários `EDITAR:` que indicam o caminho da imagem.

Exemplo de trecho para editar:

```html
<img src="assets/sobre.jpg" alt="...">
```

Troque `sobre.jpg` pelo nome do seu arquivo.

---

## Hospedagem gratuita sugerida

Quando o site estiver pronto, você pode hospedá-lo gratuitamente em:

- **GitHub Pages** — ideal se você usa Git. Crie um repositório e ative Pages em Settings.
- **Netlify** — basta arrastar a pasta `academia-do-bairro` no painel do Netlify (https://app.netlify.com/drop).
- **Vercel** — similar ao Netlify, com deploy instantâneo.
- **InfinityFree** — hospedagem tradicional gratuita com PHP/MySQL (caso queira evoluir o site no futuro).