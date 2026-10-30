export type StoreProduct = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  price: number;
  color: "navy" | "white" | "gold";
  label: string;
  sizes: string[];
};

// Catálogo e preços de demonstração. Substitua pelos produtos e valores
// aprovados pelo clube antes de conectar um token de produção.
export const products: StoreProduct[] = [
  {
    id: "camisa-titular",
    name: "Camisa Titãs Titular",
    shortName: "Titular",
    description: "Azul-marinho Titãs, com detalhes dourados e modelagem esportiva.",
    price: 149.9,
    color: "navy",
    label: "A camisa da torcida",
    sizes: ["P", "M", "G", "GG"],
  },
  {
    id: "camisa-visitante",
    name: "Camisa Titãs Visitante",
    shortName: "Visitante",
    description: "Visual claro, escudo em destaque e acabamento azul-marinho.",
    price: 149.9,
    color: "white",
    label: "Edição visitante",
    sizes: ["P", "M", "G", "GG"],
  },
  {
    id: "camisa-torcida",
    name: "Camisa Titãs Torcida",
    shortName: "Torcida",
    description: "Leve e versátil para acompanhar o time dentro e fora do ginásio.",
    price: 119.9,
    color: "gold",
    label: "Feita para vibrar",
    sizes: ["P", "M", "G", "GG"],
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
