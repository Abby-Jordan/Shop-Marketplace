'use client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton({
  totalAmount,
  onSuccess,
  onError,
  orderItems,
  deliveryFee,
}: {
  totalAmount: number
  onSuccess?: (res: any) => void
  onError?: (err: any) => void
  orderItems: Array<{
    productId: String | undefined;
    quantity: Number;
    price: Number;
    size: String | undefined;
  }>
  deliveryFee: Number;
}) {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { clearCart } = useCart()

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to continue with checkout",
        variant: "destructive",
      })
      router.push("/auth?redirect=/cart")
      return
    }

    // Add a small delay to ensure user data is loaded
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!user.address || !user.phoneNumber) {
      toast({
        title: "Profile Information Required",
        description: "Please ensure your address and phone number are added to your profile",
        variant: "destructive",
      })
      router.push("/profile")
      return
    }

    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order in your backend
      const orderResponse = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: totalAmount, 
          orderItems, 
          deliveryFee,
          paymentMethod: 'RAZORPAY'
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId, dbOrderId } = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: "INR",
        name: "Shree Mahakali Dairy",
        description: "Payment for your order",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            setRedirecting(true);
            // Verify payment
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: totalAmount,
                orderId: dbOrderId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Store order ID in localStorage for verification
              localStorage.setItem('currentOrderId', dbOrderId);
              
              // Clear the cart
              clearCart();
              
              // Call the success callback
              onSuccess?.(response);
              
              // Show success toast
              toast({
                title: "Payment Successful",
                description: "Your order has been placed successfully",
              });
              
              // Redirect to orders page immediately
              router.push('/orders');
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if the amount was deducted",
              variant: "destructive",
            });
            onError?.(error);
            setRedirecting(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phoneNumber,
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your checkout. Please try again.",
        variant: "destructive",
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="w-full mt-6 flex items-center justify-center bg-red-600 text-white py-2 px-4 rounded-md">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Redirecting to orders...
      </div>
    );
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full mt-6 bg-red-600 hover:bg-red-700"
    >
      {loading ? 'Processing...' : 'Proceed to Checkout'}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
