import Stripe from "stripe";

export type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  /** Campo retornado pela API mas não declarado nas definitions do Stripe */
  current_period_end: number;
};
