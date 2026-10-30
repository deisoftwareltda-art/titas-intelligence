import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/products";

export const runtime = "nodejs";

type CheckoutBody = {
  items?: Array<{ productId?: string; size?: string; quantity?: number }>;
  buyer?: {
    name?: string;
    email?: string;
    phone?: string;
    postalCode?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
};

const digits = (value: string) => value.replace(/\D/g, "");

export async function POST(request: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "O checkout ainda não está configurado. Fale com a loja." },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const buyer = body.buyer;
  if (
    !buyer?.name?.trim() ||
    !buyer.email?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email) ||
    !body.items?.length ||
    body.items.length > 12
  ) {
    return NextResponse.json(
      { error: "Confira seus dados e os itens do pedido." },
      { status: 400 },
    );
  }

  const mpItems = [];
  const orderLines = [];
  for (const line of body.items) {
    const product = products.find((item) => item.id === line.productId);
    const quantity = Number(line.quantity);
    if (
      !product ||
      !line.size ||
      !product.sizes.includes(line.size) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      return NextResponse.json(
        { error: "Um dos produtos, tamanhos ou quantidades não está disponível." },
        { status: 400 },
      );
    }

    mpItems.push({
      id: `${product.id}-${line.size.toLowerCase()}`,
      title: `${product.name} · tamanho ${line.size}`,
      description: product.description,
      quantity,
      currency_id: "BRL",
      unit_price: product.price,
    });
    orderLines.push({ productId: product.id, name: product.name, size: line.size, quantity });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_STORE_URL || request.nextUrl.origin).replace(/\/$/, "");
  const orderId = `TITAS-${randomUUID()}`;
  const nameParts = buyer.name.trim().split(/\s+/);
  let phoneDigits = digits(buyer.phone || "");
  if (phoneDigits.startsWith("55") && (phoneDigits.length === 12 || phoneDigits.length === 13)) {
    phoneDigits = phoneDigits.slice(2);
  }

  const preference = {
    items: mpItems,
    external_reference: orderId,
    back_urls: {
      success: `${siteUrl}/pedido`,
      pending: `${siteUrl}/pedido`,
      failure: `${siteUrl}/pedido`,
    },
    ...(siteUrl.startsWith("https://") ? { auto_return: "approved" } : {}),
    payer: {
      name: nameParts[0],
      surname: nameParts.slice(1).join(" ") || undefined,
      email: buyer.email.trim(),
      ...(phoneDigits.length >= 10
        ? { phone: { area_code: phoneDigits.slice(0, 2), number: phoneDigits.slice(2) } }
        : {}),
    },
    metadata: {
      order_id: orderId,
      items: orderLines,
      shipping: {
        postal_code: digits(buyer.postalCode || ""),
        street: buyer.street?.trim(),
        number: buyer.number?.trim(),
        neighborhood: buyer.neighborhood?.trim(),
        city: buyer.city?.trim(),
        state: buyer.state?.trim().toUpperCase(),
      },
    },
  };

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": orderId,
      },
      body: JSON.stringify(preference),
      cache: "no-store",
    });
    const result = (await response.json()) as { init_point?: string; message?: string };
    if (!response.ok || !result.init_point) {
      console.error("Mercado Pago preference error", response.status, result.message);
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." },
        { status: 502 },
      );
    }
    return NextResponse.json({ checkoutUrl: result.init_point, orderId });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar ao Mercado Pago agora." },
      { status: 502 },
    );
  }
}
