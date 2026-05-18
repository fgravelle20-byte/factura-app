// Supabase Edge Function — Stripe Webhook
// Déployez avec: supabase functions deploy stripe-webhook
// Dans Stripe Dashboard > Webhooks > Ajouter endpoint:
// https://VOTRE_PROJECT.supabase.co/functions/v1/stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const getPlanFromPriceId = (priceId: string): string => {
    const PRICE_TO_PLAN: Record<string, string> = {
      'price_STARTER_ID': 'starter',  // Remplacez avec votre Price ID Stripe
      'price_PRO_ID': 'pro',          // Remplacez avec votre Price ID Stripe
    };
    return PRICE_TO_PLAN[priceId] || 'free';
  };

  switch (event.type) {

    // Paiement réussi — activer le plan
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const userId = session.metadata?.user_id;

      if (userId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const plan = getPlanFromPriceId(priceId);

        await supabase.from('profiles').update({
          plan,
          stripe_customer_id: customerId,
          send_count: 0,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          plan,
          status: 'active',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
      }
      break;
    }

    // Abonnement renouvelé
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id, plan')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (sub) {
        await supabase.from('profiles').update({
          send_count: 0,
          send_reset_at: new Date().toISOString(),
        }).eq('id', sub.user_id);
      }
      break;
    }

    // Abonnement annulé
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase.from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (sub) {
        await supabase.from('profiles').update({ plan: 'free' }).eq('id', sub.user_id);
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
