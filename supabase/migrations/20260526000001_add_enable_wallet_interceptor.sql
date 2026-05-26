-- Add enable_wallet_interceptor column to user_settings table
alter table public.user_settings 
add column enable_wallet_interceptor boolean default false not null;
