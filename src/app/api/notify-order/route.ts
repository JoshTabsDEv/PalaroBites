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

    // Email functionality removed - just return success
    // This endpoint can be used for logging or other notification purposes
    console.log(`Order notification: ${orderId} - ${status}`, {
      email,
      customerName,
      total
    });

    return NextResponse.json({ ok: true, message: "Notification logged (email service removed)" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}


