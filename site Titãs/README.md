# Loja Titãs

Loja virtual em Next.js para a coleção de camisas do Titãs Vôlei Garanhuns. O checkout usa Mercado Pago Checkout Pro: o servidor cria uma preferência com os produtos e valores definidos no catálogo e encaminha o comprador ao ambiente do Mercado Pago.

## Desenvolvimento local

1. Instale Node.js 22 ou superior.
2. Na pasta `site Titãs`, execute `npm install`.
3. Copie `.env.example` para `.env.local` e preencha `MP_ACCESS_TOKEN` com uma credencial de teste do Mercado Pago.
4. Execute `npm run dev` e abra `http://localhost:3001`.

Sem `MP_ACCESS_TOKEN`, a loja abre normalmente, mas a API de checkout permanece desativada.

## Catálogo

Edite `lib/products.ts` para atualizar nomes, descrições, tamanhos e preços. O servidor usa esse mesmo catálogo para calcular os valores enviados ao Mercado Pago; o navegador não pode definir o preço de um pedido. Os modelos e preços que vêm no projeto são demonstrativos e precisam ser substituídos pelos dados aprovados pelo clube.

As imagens das camisas são ilustrações vetoriais do protótipo. Substitua-as por fotos oficiais dos produtos quando estiverem disponíveis. O escudo está em `public/logo-titas.jpeg`.

## Mercado Pago e publicação

- Crie uma aplicação e obtenha o Access Token em **Suas integrações** no Mercado Pago Developers.
- Configure `MP_ACCESS_TOKEN` como variável de ambiente privada no ambiente de desenvolvimento e na hospedagem. Não use prefixo `NEXT_PUBLIC_` para essa chave.
- Configure `NEXT_PUBLIC_STORE_URL` com a URL HTTPS pública da loja para que os retornos do Checkout Pro levem ao domínio correto.
- Configure a publicação Netlify para esta pasta, usando `npm run build` como comando e `.next` como diretório publicado. A configuração está em `netlify.toml`.
- Use credenciais de teste antes de habilitar a credencial de produção. O Mercado Pago cria uma preferência no backend e retorna `init_point`; o comprador conclui o pagamento no Checkout Pro.

O checkout envia os dados de contato e entrega à preferência do Mercado Pago. Este protótipo não mantém banco próprio de pedidos, estoque ou cálculo de frete. A equipe deve confirmar disponibilidade, frete/retirada e entrega com o comprador; antes da operação comercial, defina esse processo e as políticas de troca, privacidade e atendimento.

## Estrutura

- `app/page.tsx`: vitrine, catálogo, sacola e formulário de checkout.
- `app/api/checkout/route.ts`: valida produtos e cria a preferência no Mercado Pago.
- `app/pedido/page.tsx`: consulta o pagamento ao Mercado Pago ao retornar à loja.
- `lib/products.ts`: catálogo usado pela vitrine e pelo servidor.
