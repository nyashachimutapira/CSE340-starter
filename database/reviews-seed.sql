-- Seed data for reviews (ensure accounts and inventory items exist)
INSERT INTO public.reviews (inv_id, account_id, rating, review_text)
VALUES
  (1, 1, 5, 'Excellent car — runs great and looks amazing.'),
  (1, 2, 4, 'Very good overall; a few minor issues.'),
  (2, 1, 3, 'Average, meets expectations.'),
  (3, 3, 5, 'Fantastic purchase! Highly recommended.');
