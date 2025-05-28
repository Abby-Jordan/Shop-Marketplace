import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount,
      orderId 
    } = body;

    if (!orderId) {
      return Response.json({ 
        success: false, 
        message: 'Order ID is required' 
      }, { status: 400 });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    let actualMethod = "RAZORPAY";

    // Step 3: If signature is valid, fetch payment method
    if (isValid) {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      actualMethod = paymentDetails.method.toUpperCase(); // e.g. CARD, UPI, NETBANKING
    }

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // First check if order exists
      const order = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (isValid) {
        // Create payment record
        await tx.payment.create({
          data: {
            orderId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount,
            status: PaymentStatus.PAID,
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.PROCESSING,
            paymentMethod: actualMethod,
          },
        });
      } else {
        // Payment verification failed
        await tx.payment.create({
          data: {
            orderId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount,
            status: PaymentStatus.FAILED,
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: PaymentStatus.FAILED,
            status: OrderStatus.CANCELLED,
          },
        });
      }
    });

    return Response.json({ 
      success: isValid,
      message: isValid ? 'Payment verified and recorded successfully' : 'Payment verification failed'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to verify payment'
    }, { status: 500 });
  }
}
