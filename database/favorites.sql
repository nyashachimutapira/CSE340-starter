-- SQL to create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  favorite_id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
  inv_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT favorites_unique UNIQUE (account_id, inv_id)
);
