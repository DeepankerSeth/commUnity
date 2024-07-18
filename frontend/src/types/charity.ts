export interface Nonprofit {
  id: string;
  name: string;
  description: string;
}

export interface NonprofitDetails extends Nonprofit {
  website: string;
  logoUrl: string;
}

export interface Fundraiser {
  id: string;
  nonprofitId: string;
  title: string;
  description: string;
}

export interface DonateLinkRequest {
  identifier: string;
  amount?: number;
  suggestedAmounts?: number[];
  min_value?: number;
  frequency?: 'ONCE' | 'MONTHLY' | 'YEARLY';
  first_name?: string;
  last_name?: string;
  description?: string;
  no_exit?: boolean;
  success_url?: string;
  exit_url?: string;
  partner_donation_id?: string;
  partner_metadata?: string;
  require_share_info?: boolean;
  share_info?: boolean;
  designation?: string;
  webhook_token?: string;
  theme_color?: string;
  method?: 'CARD' | 'BANK' | 'PAYPAL';
}
