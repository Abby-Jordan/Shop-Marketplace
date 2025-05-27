import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json(); // amount in rupees

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_order_${Math.random().toString(36).substr(2, 9)}`,
      payment_capture: 1,
    };

    const order = await instance.orders.create(options);

    return Response.json({ orderId: order.id });
  } catch (error) {
    console.error("Razorpay error", error);
    return new Response("Failed to create Razorpay order", { status: 500 });
  }
}
