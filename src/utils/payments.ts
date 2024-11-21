import { loadStripe } from '@stripe/stripe-js';

export const GENERATION_COST = 2; // R2 per generation cost to service
export const PROFIT_MARGIN = 0.50; // 50% profit margin
export const PRICE_PER_CREDIT = GENERATION_COST / (1 - PROFIT_MARGIN); // ~R4 per credit

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export async function processPayment(amount: number, email: string): Promise<PaymentResult> {
  const merchantId = import.meta.env.VITE_IKHOKHA_MERCHANT_ID;
  const apiKey = import.meta.env.VITE_IKHOKHA_API_KEY;

  if (!merchantId || !apiKey) {
    return {
      success: false,
      error: 'Payment gateway not configured. Please contact the administrator.'
    };
  }

  try {
    // iKhokha API endpoint
    const response = await fetch('https://api.ikhokha.com/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Merchant-Id': merchantId
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency: 'ZAR',
        email,
        description: 'Purchase from Alice Tattoos'
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Payment failed');
    }

    const data = await response.json();
    return {
      success: true,
      transactionId: data.transactionId
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed'
    };
  }
}