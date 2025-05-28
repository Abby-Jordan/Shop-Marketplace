import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { amount, orderItems, deliveryFee, paymentMethod } = await req.json();
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Fetch complete user data from database
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { address: true }
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    if (!user.address) {
      return new Response("Address not found", { status: 400 });
    }

    // Create Razorpay order
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

    const razorpayOrder = await instance.orders.create(options);

    // Format shipping address
    const shippingAddress = {
      fullName: user.name,
      address: user.address.street,
      city: user.address.city,
      state: user.address.state,
      country: user.address.country,
      postalCode: user.address.zipCode,
      phone: user.phoneNumber || '',
    };

    // Create order and order items in database using a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount: amount,
          shippingFee: deliveryFee,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod || "RAZORPAY",
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      // Create order items
      if (orderItems && Array.isArray(orderItems)) {
        await Promise.all(
          orderItems.map((item: any) =>
            tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
              },
            })
          )
        );
      }

      return order;
    });

    return Response.json({ 
      orderId: razorpayOrder.id,
      dbOrderId: order.id // Send this back to frontend
    });
  } catch (error) {
    console.error("Razorpay error", error);
    return new Response("Failed to create Razorpay order", { status: 500 });
  }
}