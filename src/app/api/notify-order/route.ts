import { NextRequest, NextResponse } from "next/server";

type Payload = {
  orderId: string;
  status: "confirmed" | "out_for_delivery";
  email?: string | null;
  customerName?: string | null;
  total?: number | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;
    const { orderId, status, email, customerName, total } = body;
    if (!orderId || !status) {
      return NextResponse.json({ ok: false, error: "Missing orderId or status" }, { status: 400 });
    }
    if (!email) {
      // No email provided; nothing to send
      return NextResponse.json({ ok: true, skipped: true });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // No email provider configured; act as no-op
      return NextResponse.json({ ok: true, provider: "none" });
    }

    // Lazy import to keep edge size small if unused
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const subject = status === "confirmed" ? "Your order has been confirmed" : "Your order is out for delivery";
    const greeting = customerName ? `Hi ${customerName},` : "Hi,";
    const totalText = typeof total === "number" ? `\nTotal: ₱${total.toFixed(2)}` : "";

    await resend.emails.send({
      from: process.env.NOTIFY_FROM_EMAIL || "notifications@palarobites.app",
      to: email,
      subject,
      text: `${greeting}\n\nOrder #${orderId} ${status.replaceAll("_", " ")}.
${totalText}\n\nThank you for ordering with PalaroBites!`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}


