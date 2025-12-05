import Stripe from "stripe";

export type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end: number;
};
