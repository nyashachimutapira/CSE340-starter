-- SQL to create shopping_cart table
CREATE TABLE IF NOT EXISTS public.shopping_cart (
  cart_id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
  inv_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT shopping_cart_unique UNIQUE (account_id, inv_id)
);

-- Create index for faster lookups by account_id
CREATE INDEX IF NOT EXISTS shopping_cart_account_idx ON public.shopping_cart(account_id);
