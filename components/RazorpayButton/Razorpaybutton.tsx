'use client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { NextResponse } from 'next/server';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}
export default function RazorpayButton({
  totalAmount,
  onSuccess,
  onError,
}: {
  totalAmount: number
  onSuccess?: (res: any) => void
  onError?: (err: any) => void
}) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

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

    if (!user.address) {
      toast({
        title: "Address Required",
        description: "Please add an address and phone number to your profile",
        variant: "destructive",
      })
      router.push("/profile")
      return
    }
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    setLoading(true);

    const response = await fetch('/api/razorpay', {
      method: 'POST',
      body: JSON.stringify({ amount: totalAmount }), // 500 INR
    });

    const { orderId } = await response.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // from env
      amount: totalAmount * 100, // in paise
      currency: "INR",
      name: "Shree Mahakali Dairy",
      description: "Test Transaction",
      order_id: orderId,
      handler: async function (response: NextResponse) {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          body: JSON.stringify(response),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await verifyRes.json();
        if (data.valid) {
          alert('Payment Verified Successfully!');
          onSuccess?.(response);
          // optionally save order to DB here
        } else {
          alert('Payment verification failed. Do not proceed.');
          onError?.(new Error('Invalid Signature'));
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
      // This shows all payment methods: cards, UPI, wallet, etc.
      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full mt-6 bg-red-600 hover:bg-red-700"
    >
      {loading ? 'Processing...' : ' Proceed to Checkout'}

      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
