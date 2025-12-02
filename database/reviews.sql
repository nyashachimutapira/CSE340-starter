-- SQL to create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  review_id SERIAL PRIMARY KEY,
  inv_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Example insert (replace ids with real values)
-- INSERT INTO public.reviews (inv_id, account_id, rating, review_text) VALUES (1, 1, 5, 'Great car!');
