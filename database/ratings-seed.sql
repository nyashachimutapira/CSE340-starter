-- Seed data for ratings (ensure accounts and inventory items exist)
INSERT INTO public.ratings (inv_id, account_id, rating)
VALUES
  (1, 1, 5),
  (1, 2, 4),
  (2, 1, 3),
  (3, 3, 5);
