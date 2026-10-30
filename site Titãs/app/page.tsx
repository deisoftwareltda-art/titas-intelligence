"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import { formatPrice, products, StoreProduct } from "@/lib/products";

type CartLine = { productId: string; size: string; quantity: number };
type Buyer = {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
};

const emptyBuyer: Buyer = {
  name: "",
  email: "",
  phone: "",
  postalCode: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
};

function Icon({ name, size = 20 }: { name: "bag" | "close" | "arrow" | "lock" | "plus" | "minus"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "bag") return <svg {...common}><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  if (name === "arrow") return <svg {...common}><path d="M4 12h15M13 5l7 7-7 7"/></svg>;
  if (name === "lock") return <svg {...common}><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  return <svg {...common}><path d="M5 12h14"/></svg>;
}

function ShirtArt({ color, large = false }: { color: StoreProduct["color"]; large?: boolean }) {
  const uniqueId = useId().replace(/:/g, "");
  const fabric = color === "navy" ? "#092351" : color === "white" ? "#f8f8f4" : "#eeb22c";
  const trim = color === "white" ? "#092351" : "#eeb22c";
  const ink = color === "white" ? "#092351" : "#ffffff";
  return (
    <svg className={large ? "shirt-art shirt-art-large" : "shirt-art"} viewBox="0 0 500 520" role="img" aria-label="Ilustração da camisa Titãs">
      <defs>
        <linearGradient id={`fabric-${color}-${uniqueId}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={fabric}/><stop offset="1" stopColor={color === "navy" ? "#102f66" : color === "white" ? "#dfe4eb" : "#c78515"}/></linearGradient>
        <filter id={`shirt-shadow-${uniqueId}`} x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#061633" floodOpacity=".23"/></filter>
      </defs>
      <ellipse cx="250" cy="475" rx="155" ry="17" fill="#122b53" opacity=".12"/>
      <g filter={`url(#shirt-shadow-${uniqueId})`}>
        <path d="m160 57 55-25 35 46 35-46 55 25 105 88-55 68-48-36v274H158V177l-48 36-55-68 105-88Z" fill={`url(#fabric-${color}-${uniqueId})`} stroke={color === "white" ? "#d5dbe4" : "#071b3d"} strokeWidth="3" strokeLinejoin="round"/>
        <path d="m215 32 35 46 35-46-14 54-21 27-21-27-14-54Z" fill={trim}/>
        <path d="M160 57 91 116l34 44 33-26M340 57l69 59-34 44-33-26" fill="none" stroke={trim} strokeWidth="9" opacity=".92"/>
        <path d="M164 190v245M336 190v245" stroke={trim} strokeWidth="4" opacity=".78"/>
        <circle cx="250" cy="173" r="26" fill={trim}/><text x="250" y="181" textAnchor="middle" fill={color === "white" ? "#fff" : "#092351"} fontSize="20" fontWeight="900" fontFamily="Arial">TV</text>
        <text x="250" y="269" textAnchor="middle" fill={ink} fontSize="35" fontWeight="900" letterSpacing="5" fontFamily="Arial">TITÃS</text>
        <path d="M207 286h86" stroke={trim} strokeWidth="3" opacity=".9"/>
        <text x="250" y="376" textAnchor="middle" fill={ink} fontSize="88" fontWeight="800" fontFamily="Arial">07</text>
        <text x="250" y="408" textAnchor="middle" fill={ink} fontSize="12" fontWeight="700" letterSpacing="3" fontFamily="Arial">GARANHUNS</text>
      </g>
    </svg>
  );
}

function ProductCard({
  product,
  selectedSize,
  onSize,
  onAdd,
}: {
  product: StoreProduct;
  selectedSize: string;
  onSize: (size: string) => void;
  onAdd: () => void;
}) {
  return (
    <article className="product-card">
      <div className={`product-art product-art-${product.color}`}>
        <span className="product-tag">{product.label}</span>
        <ShirtArt color={product.color} />
        <span className="image-caption">Ilustração da camisa</span>
      </div>
      <div className="product-info">
        <div className="product-title-line"><div><p className="product-category">COLEÇÃO TITÃS</p><h3>{product.name}</h3></div><span className="product-price">{formatPrice(product.price)}</span></div>
        <p className="product-description">{product.description}</p>
        <div className="product-actions">
          <label className="size-select"><span>Tamanho</span><select value={selectedSize} onChange={(event) => onSize(event.target.value)} aria-label={`Tamanho da ${product.name}`}>
            {product.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select></label>
          <button className="button button-dark add-button" onClick={onAdd}>Adicionar <Icon name="plus" size={17}/></button>
        </div>
      </div>
    </article>
  );
}

export default function StorePage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    Object.fromEntries(products.map((product) => [product.id, product.sizes[0]])),
  );
  const [buyer, setBuyer] = useState<Buyer>(emptyBuyer);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("titas-store-cart");
      if (saved) setCart(JSON.parse(saved) as CartLine[]);
    } catch {
      localStorage.removeItem("titas-store-cart");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("titas-store-cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = useMemo(() => cart.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    return sum + (product?.price ?? 0) * line.quantity;
  }, 0), [cart]);

  function addToCart(product: StoreProduct) {
    const size = selectedSizes[product.id] || product.sizes[0];
    setCart((current) => {
      const match = current.find((line) => line.productId === product.id && line.size === size);
      if (match) return current.map((line) => line === match ? { ...line, quantity: Math.min(10, line.quantity + 1) } : line);
      return [...current, { productId: product.id, size, quantity: 1 }];
    });
    setCartOpen(true);
    setCheckoutError("");
  }

  function changeQuantity(line: CartLine, delta: number) {
    setCart((current) => current.flatMap((item) => {
      if (item.productId !== line.productId || item.size !== line.size) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity: Math.min(10, quantity) }] : [];
    }));
  }

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutError("");
    if (!consent) {
      setCheckoutError("Confirme o uso dos dados para processar o pedido.");
      return;
    }
    setCheckoutBusy(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, buyer }),
      });
      const result = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Não foi possível iniciar o pagamento.");
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.");
      setCheckoutBusy(false);
    }
  }

  function updateBuyer(field: keyof Buyer, value: string) {
    setBuyer((current) => ({ ...current, [field]: value }));
  }

  return (
    <main>
      <div className="launch-note"><span className="launch-dot"/> LOJA EM PRÉ-LANÇAMENTO <span className="launch-divider">·</span> Catálogo, preços e entrega serão confirmados pelo clube antes da abertura das vendas.</div>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Titãs Vôlei Garanhuns, início">
          <img src="/logo-titas.jpeg" alt="Escudo do Titãs Vôlei Garanhuns"/>
          <span><strong>TITÃS</strong><small>VÔLEI GARANHUNS</small></span>
        </a>
        <nav className="main-nav" aria-label="Navegação principal"><a href="#colecao">Coleção</a><a href="#clube">O clube</a></nav>
        <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Abrir sacola, ${cartCount} itens`}>
          <Icon name="bag"/><span className="cart-trigger-label">Sacola</span><span className="cart-count">{cartCount}</span>
        </button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-content">
          <p className="eyebrow"><span/> GARANHUNS · PERNAMBUCO</p>
          <h1>Vista a força<br/>que move <em>Garanhuns.</em></h1>
          <p className="hero-copy">As cores dos Titãs carregam a energia de quem acredita no esporte, na cidade e em tudo que construímos juntos.</p>
          <div className="hero-actions"><a className="button button-gold" href="#colecao">Escolha sua camisa <Icon name="arrow" size={18}/></a><span className="hero-season">TEMPORADA 2026</span></div>
          <div className="hero-proof"><span><b>01</b> Orgulho da cidade</span><span><b>02</b> Feita para torcer</span><span><b>03</b> Titãs Vôlei Garanhuns</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-ring ring-one"/><div className="hero-ring ring-two"/>
          <div className="hero-spark spark-one">✳</div><div className="hero-spark spark-two">✦</div>
          <div className="hero-shirt-wrap"><ShirtArt color="navy" large/></div>
          <div className="hero-sticker"><span>FEITO</span><strong>DE<br/>PAIXÃO</strong><small>DESDE 2023</small></div>
          <div className="hero-vertical">TITÃS VÔLEI · GARANHUNS</div>
        </div>
        <div className="hero-bottom-label">TITÃS VÔLEI GARANHUNS <span>07° 53′ S · 36° 29′ O</span></div>
      </section>

      <section className="trust-strip" aria-label="Informações da loja">
        <div><span className="trust-icon"><Icon name="lock" size={19}/></span><span><strong>Pagamento protegido</strong><small>Você finaliza no ambiente Mercado Pago</small></span></div>
        <div><span className="trust-number">01</span><span><strong>Escolha seu tamanho</strong><small>Confira a grade disponível de cada modelo</small></span></div>
        <div><span className="trust-number">02</span><span><strong>Atendimento Titãs</strong><small>A equipe acompanha seu pedido</small></span></div>
      </section>

      <section className="collection section-wrap" id="colecao">
        <div className="section-heading"><div><p className="eyebrow">COLEÇÃO TITÃS · 2026</p><h2>Vista o nosso jogo.</h2></div><p>Escolha o modelo, selecione seu tamanho e leve as cores de Garanhuns com você.</p></div>
        <div className="catalog-note"><span>!</span> Modelos e preços ilustrativos enquanto o clube confirma o catálogo oficial.</div>
        <div className="product-grid">
          {products.map((product, index) => <ProductCard key={product.id} product={product} selectedSize={selectedSizes[product.id]} onSize={(size) => setSelectedSizes((current) => ({ ...current, [product.id]: size }))} onAdd={() => addToCart(product)}/>)}
        </div>
      </section>

      <section className="club-band" id="clube">
        <div className="club-band-inner"><p className="eyebrow">MAIS QUE UM TIME</p><h2>Uma cidade inteira<br/>joga junto.</h2><p>O Titãs Vôlei Garanhuns trabalha para formar atletas, fortalecer a comunidade e levar o nome da cidade cada vez mais longe.</p><a href="#colecao" className="text-link">Faça parte dessa torcida <Icon name="arrow" size={17}/></a></div>
        <div className="club-mark"><span>TV</span><i/><i/><i/><small>GARANHUNS</small></div>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#inicio"><span className="brand-mark">TV</span><span><strong>TITÃS</strong><small>VÔLEI GARANHUNS</small></span></a>
        <p>Paixão que representa nossa cidade.</p>
        <span className="footer-copy">© 2026 Titãs Vôlei Garanhuns</span>
      </footer>

      {cartOpen && <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
        <aside className="cart-drawer" aria-label="Sacola de compras">
          <div className="drawer-header"><div><p className="eyebrow">SUA COMPRA</p><h2>Sacola <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fechar sacola"><Icon name="close"/></button></div>
          {cart.length === 0 ? <div className="empty-cart"><div className="empty-bag"><Icon name="bag" size={26}/></div><h3>Sua sacola está vazia</h3><p>Escolha uma camisa da coleção para começar.</p><button className="button button-dark" onClick={() => { setCartOpen(false); document.getElementById("colecao")?.scrollIntoView({ behavior: "smooth" }); }}>Ver coleção</button></div> : <>
            <div className="cart-lines">{cart.map((line) => {
              const product = products.find((item) => item.id === line.productId)!;
              return <div className="cart-line" key={`${line.productId}-${line.size}`}>
                <div className={`cart-line-art product-art-${product.color}`}><ShirtArt color={product.color}/></div>
                <div className="cart-line-info"><strong>{product.name}</strong><span>Tamanho {line.size}</span><b>{formatPrice(product.price * line.quantity)}</b>
                  <div className="quantity-control"><button onClick={() => changeQuantity(line, -1)} aria-label="Diminuir quantidade"><Icon name="minus" size={14}/></button><span>{line.quantity}</span><button onClick={() => changeQuantity(line, 1)} aria-label="Aumentar quantidade"><Icon name="plus" size={14}/></button></div>
                </div>
                <button className="remove-line" onClick={() => setCart((current) => current.filter((item) => item.productId !== line.productId || item.size !== line.size))} aria-label={`Remover ${product.name}`}><Icon name="close" size={16}/></button>
              </div>;
            })}</div>
            <form className="checkout-form" onSubmit={startCheckout}>
              <div className="checkout-total"><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
              <p className="shipping-note">Frete não incluído. A equipe combina a entrega ou retirada com você após o pedido.</p>
              <div className="form-heading"><span>01</span><strong>Seus dados para contato</strong></div>
              <label>Nome completo<input required autoComplete="name" value={buyer.name} onChange={(e) => updateBuyer("name", e.target.value)} placeholder="Como podemos chamar você?"/></label>
              <div className="form-row"><label>E-mail<input required type="email" autoComplete="email" value={buyer.email} onChange={(e) => updateBuyer("email", e.target.value)} placeholder="voce@email.com"/></label><label>Celular<input required type="tel" autoComplete="tel" value={buyer.phone} onChange={(e) => updateBuyer("phone", e.target.value)} placeholder="(87) 99999-9999"/></label></div>
              <div className="form-heading address-heading"><span>02</span><strong>Endereço para combinar a entrega</strong></div>
              <div className="form-row"><label>CEP<input required autoComplete="postal-code" value={buyer.postalCode} onChange={(e) => updateBuyer("postalCode", e.target.value)} placeholder="00000-000"/></label><label>Estado<input required maxLength={2} autoComplete="address-level1" value={buyer.state} onChange={(e) => updateBuyer("state", e.target.value.toUpperCase())} placeholder="PE"/></label></div>
              <div className="form-row"><label className="street-field">Rua / avenida<input required autoComplete="street-address" value={buyer.street} onChange={(e) => updateBuyer("street", e.target.value)} placeholder="Nome da via"/></label><label>Nº<input required value={buyer.number} onChange={(e) => updateBuyer("number", e.target.value)} placeholder="Nº"/></label></div>
              <div className="form-row"><label>Bairro<input required value={buyer.neighborhood} onChange={(e) => updateBuyer("neighborhood", e.target.value)} placeholder="Seu bairro"/></label><label>Cidade<input required autoComplete="address-level2" value={buyer.city} onChange={(e) => updateBuyer("city", e.target.value)} placeholder="Garanhuns"/></label></div>
              <label className="consent-row"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}/><span>Autorizo o uso destes dados para processar o pedido e entrar em contato sobre a entrega.</span></label>
              {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
              <button className="button button-gold checkout-button" type="submit" disabled={checkoutBusy}>{checkoutBusy ? "Conectando ao Mercado Pago…" : <>Continuar para pagamento <Icon name="arrow" size={18}/></>}</button>
              <p className="secure-note"><Icon name="lock" size={14}/> O pagamento é concluído no ambiente seguro do Mercado Pago.</p>
            </form>
          </>}
        </aside>
      </div>}
    </main>
  );
}
