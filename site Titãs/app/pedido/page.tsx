import Link from "next/link";

type MercadoPagoPayment = {
  status?: string;
  status_detail?: string;
  external_reference?: string;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function getPayment(paymentId?: string): Promise<MercadoPagoPayment | null> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!paymentId || !token || !/^\d+$/.test(paymentId)) return null;
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payment = (await response.json()) as MercadoPagoPayment;
    return payment.external_reference?.startsWith("TITAS-") ? payment : null;
  } catch {
    return null;
  }
}

export default async function OrderResult({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  const paymentId = typeof query.payment_id === "string" ? query.payment_id : undefined;
  const payment = await getPayment(paymentId);
  const approved = payment?.status === "approved";
  const pending = payment?.status === "pending" || payment?.status === "in_process";

  return (
    <main className="result-page">
      <div className="result-card">
        <Link className="brand brand-dark" href="/">
          <span className="brand-mark">TV</span>
          <span><strong>TITÃS</strong><small>VÔLEI GARANHUNS</small></span>
        </Link>
        <div className={`result-icon ${approved ? "success" : pending ? "pending" : "waiting"}`}>
          {approved ? "✓" : pending ? "…" : "•"}
        </div>
        <p className="eyebrow">RETORNO DO PAGAMENTO</p>
        <h1>{approved ? "Pedido confirmado" : pending ? "Pagamento em análise" : "Aguardando confirmação"}</h1>
        <p className="result-copy">
          {approved
            ? "O Mercado Pago confirmou o pagamento. A equipe Titãs seguirá com a conferência do pedido e combinará a entrega pelos contatos informados."
            : pending
              ? "O Mercado Pago ainda está processando o pagamento. Você pode acompanhar a atualização na sua conta Mercado Pago."
              : "Não encontramos uma confirmação de pagamento. Confira sua conta Mercado Pago antes de tentar novamente."}
        </p>
        {payment?.external_reference && <p className="order-reference">Pedido {payment.external_reference}</p>}
        <Link className="button button-primary result-button" href="/">Voltar à loja</Link>
      </div>
    </main>
  );
}
