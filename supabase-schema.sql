-- ============================================
-- FACTURA — BASE DE DONNÉES SUPABASE
-- Copiez-collez ce SQL dans Supabase > SQL Editor
-- ============================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: profiles (entreprises)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  phone text,
  email text,
  address text,
  web text,
  tps text,
  tvq text,
  sector text default 'construction',
  logo_url text,
  extra jsonb default '{}',
  plan text default 'free',
  send_count integer default 0,
  send_reset_at timestamptz default now(),
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sécurité: chaque user voit seulement son profil
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ============================================
-- TABLE: invoices (factures)
-- ============================================
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  number text not null,
  date date not null,
  due_date date,
  client_name text not null,
  client_email text,
  client_phone text,
  client_address text,
  items jsonb default '[]',
  notes text,
  subtotal numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) default 0,
  status text default 'draft', -- draft | sent | paid
  pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sécurité
alter table public.invoices enable row level security;
create policy "Users can view own invoices" on public.invoices for select using (auth.uid() = user_id);
create policy "Users can insert own invoices" on public.invoices for insert with check (auth.uid() = user_id);
create policy "Users can update own invoices" on public.invoices for update using (auth.uid() = user_id);
create policy "Users can delete own invoices" on public.invoices for delete using (auth.uid() = user_id);

-- ============================================
-- TABLE: subscriptions (abonnements Stripe)
-- ============================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  plan text not null default 'free',
  status text not null default 'active', -- active | canceled | past_due
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- ============================================
-- FUNCTION: créer profil automatiquement
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- FUNCTION: reset quota mensuel automatique
-- ============================================
create or replace function public.reset_monthly_quota()
returns void as $$
begin
  update public.profiles
  set send_count = 0, send_reset_at = now()
  where send_reset_at < date_trunc('month', now());
end;
$$ language plpgsql security definer;

-- ============================================
-- INDEX pour performance
-- ============================================
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_status_idx on public.invoices(status);
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_stripe_id_idx on public.subscriptions(stripe_subscription_id);
