# Inventory Management - Deployment Checklist

Complete checklist for deploying and verifying the inventory management system.

## Pre-Deployment (Before Going Live)

### Database Setup
- [ ] Backup current database
  ```bash
  pg_dump -U postgres -d cse340 > backup_$(date +%Y%m%d).sql
  ```

- [ ] Run migration script
  ```bash
  psql -U postgres -d cse340 < database/rebuild.sql
  ```

- [ ] Verify tables created
  ```sql
  \dt orders
  \dt order_items
  \d inventory
  ```

- [ ] Verify columns added to inventory
  ```sql
  \d inventory
  -- Check for: inv_quantity
  ```

- [ ] Create indexes (optional but recommended)
  ```sql
  CREATE INDEX idx_orders_account ON orders(account_id);
  CREATE INDEX idx_order_items_order ON order_items(order_id);
  CREATE INDEX idx_inventory_quantity ON inventory(inv_quantity);
  CREATE INDEX idx_orders_date ON orders(order_date DESC);
  ```

### File Verification
- [ ] All new files created
  - [ ] models/inventory-management-model.js
  - [ ] models/order-management-model.js
  - [ ] controllers/checkoutController.js
  - [ ] routes/checkoutRoute.js
  - [ ] views/checkout/view.ejs
  - [ ] views/checkout/confirmation.ejs
  - [ ] views/checkout/order-history.ejs

- [ ] Modified files updated
  - [ ] server.js (has checkout route import and registration)
  - [ ] views/cart/view.ejs (checkout button updated)

- [ ] Documentation in place
  - [ ] INVENTORY_MANAGEMENT_GUIDE.md
  - [ ] INVENTORY_SETUP.md
  - [ ] INVENTORY_IMPLEMENTATION_SUMMARY.md
  - [ ] INVENTORY_SYSTEM_OVERVIEW.md
  - [ ] INVENTORY_FEATURES_SUMMARY.txt
  - [ ] INVENTORY_DEPLOYMENT_CHECKLIST.md

### Code Verification
- [ ] No syntax errors
  ```bash
  npm run dev  # Should start without errors
  ```

- [ ] All dependencies available (no new npm packages added)
- [ ] No breaking changes to existing code
- [ ] All routes properly registered in server.js
- [ ] All models properly imported in controllers

### Configuration
- [ ] .env file has all required variables
  - [ ] DATABASE_URL set
  - [ ] PORT set
  - [ ] JWT_SECRET set
  - [ ] SESSION_SECRET set

- [ ] Database connection pool working
  ```bash
  node test-db-connection.js
  ```

## Testing Phase

### Unit Tests

#### Stock Management
- [ ] Test getStock()
  ```javascript
  const stock = await inventoryManagementModel.getStock(1);
  // Should return { inv_id: 1, inv_quantity: 1 }
  ```

- [ ] Test reduceStock()
  ```javascript
  const before = await inventoryManagementModel.getStock(1);
  const reduced = await inventoryManagementModel.reduceStock(1, 1);
  const after = await inventoryManagementModel.getStock(1);
  // after.inv_quantity should be before.inv_quantity - 1
  ```

- [ ] Test isInStock()
  ```javascript
  const available = await inventoryManagementModel.isInStock(1, 1);
  // Should return true or false
  ```

- [ ] Test increaseStock()
  ```javascript
  const before = await inventoryManagementModel.getStock(1);
  const increased = await inventoryManagementModel.increaseStock(1, 1);
  const after = await inventoryManagementModel.getStock(1);
  // after.inv_quantity should be before.inv_quantity + 1
  ```

#### Order Management
- [ ] Test createOrder() with valid cart
- [ ] Test getOrderById()
- [ ] Test getOrdersByAccountId()
- [ ] Test updateOrderStatus()
- [ ] Test cancelOrder()

### Integration Tests

#### Checkout Flow
- [ ] Login to application
  - [ ] User can login successfully
  - [ ] JWT token created
  - [ ] Session established

- [ ] Browse products
  - [ ] Product detail page loads
  - [ ] Stock level displays
  - [ ] "Add to Cart" button visible (if logged in)

- [ ] Add to cart
  - [ ] Item added to cart successfully
  - [ ] Flash message shows
  - [ ] Cart count updates

- [ ] View cart
  - [ ] All items displayed
  - [ ] Quantities correct
  - [ ] Total price correct
  - [ ] "Proceed to Checkout" button visible

- [ ] Checkout page
  - [ ] GET /checkout loads
  - [ ] Cart items display with images
  - [ ] Total calculation correct
  - [ ] Billing address shows
  - [ ] Stock verified (no error messages)

- [ ] Complete purchase
  - [ ] POST /checkout/process succeeds
  - [ ] Order created in database
  - [ ] Order ID returned in response
  - [ ] Redirects to confirmation page

- [ ] Order confirmation
  - [ ] Confirmation page displays
  - [ ] Order number correct
  - [ ] Order date shows
  - [ ] Order status is "confirmed"
  - [ ] Items displayed correctly
  - [ ] Total amount correct

- [ ] Inventory reduction
  - [ ] Stock decreased in database
  - [ ] Quantity reduced by correct amount
  - [ ] Other items unaffected

- [ ] Cart cleared
  - [ ] User's cart is empty after purchase
  - [ ] SELECT * FROM shopping_cart WHERE account_id = ? returns empty

- [ ] Order history
  - [ ] GET /checkout/order-history loads
  - [ ] Order appears in list
  - [ ] Order details clickable
  - [ ] Can view order details

### Edge Cases

- [ ] Empty cart checkout
  - [ ] Cannot checkout with empty cart
  - [ ] Shows appropriate error message

- [ ] Out of stock item
  - [ ] Set inv_quantity = 0
  - [ ] Try to add to cart
  - [ ] Try to checkout
  - [ ] Shows "out of stock" error

- [ ] Insufficient stock
  - [ ] Set inv_quantity = 1
  - [ ] Add quantity 2 to cart
  - [ ] Try to checkout
  - [ ] Shows insufficient stock error

- [ ] Stock changed during shopping
  - [ ] Add item to cart
  - [ ] Admin reduces stock to 0
  - [ ] Try to checkout
  - [ ] Shows stock error

- [ ] Multiple users checkout
  - [ ] User A adds item to cart
  - [ ] User B adds same item to cart
  - [ ] Both checkout simultaneously
  - [ ] No race condition issues
  - [ ] Both orders created correctly
  - [ ] Stock reduced for both

- [ ] Order cancellation
  - [ ] Cancel order via database
  - [ ] UPDATE orders SET status = 'cancelled'
  - [ ] Check inventory restored
  - [ ] SELECT inv_quantity should be increased

### Security Tests

- [ ] Authentication required
  - [ ] Logout from account
  - [ ] Try /checkout
  - [ ] Redirects to login

- [ ] User isolation
  - [ ] User A creates order
  - [ ] User B tries to view User A's order
  - [ ] Gets 403 forbidden or cannot view

- [ ] SQL injection prevention
  - [ ] Try SQL injection in search/parameters
  - [ ] No errors or unexpected data returned
  - [ ] Parameterized queries prevent issues

- [ ] CSRF protection
  - [ ] Session cookies set correctly
  - [ ] Cross-origin requests handled properly

### Performance Tests

- [ ] Page load times acceptable
  - [ ] /checkout loads in < 500ms
  - [ ] /checkout/order-history loads in < 300ms

- [ ] Database queries efficient
  - [ ] Stock checks use indexed columns
  - [ ] Order queries use proper indexes

- [ ] No memory leaks
  - [ ] Server handles 100+ sequential requests
  - [ ] Memory usage stable

## Post-Deployment

### Monitoring
- [ ] Set up error logging
- [ ] Monitor database performance
- [ ] Watch for failed transactions
- [ ] Track checkout conversion rate

### Backup Strategy
- [ ] Automated daily backups
  ```bash
  # Add to cron job
  0 2 * * * pg_dump -U postgres -d cse340 > /backup/cse340_$(date +\%Y\%m\%d).sql
  ```

- [ ] Test backup restoration
  ```bash
  psql -U postgres -d cse340_test < backup_20251203.sql
  ```

### Regular Maintenance
- [ ] Weekly: Check error logs
- [ ] Weekly: Verify inventory counts
- [ ] Monthly: Review order statistics
- [ ] Monthly: Analyze performance metrics
- [ ] Quarterly: Update documentation

## Rollback Plan

If issues discovered after deployment:

### Quick Rollback
1. Stop application
   ```bash
   # Kill Node process
   pkill -f "node server.js"
   ```

2. Restore database from backup
   ```bash
   psql -U postgres -d cse340 < backup_20251203.sql
   ```

3. Revert code changes
   ```bash
   git revert HEAD
   # or
   git checkout HEAD -- server.js views/cart/view.ejs
   ```

4. Remove new files (if needed)
   ```bash
   rm models/inventory-management-model.js
   rm models/order-management-model.js
   rm controllers/checkoutController.js
   rm routes/checkoutRoute.js
   rm -rf views/checkout/
   ```

5. Restart application
   ```bash
   npm run dev
   ```

### Partial Rollback
- Keep database changes
- Revert only code changes
- Allows easier re-deployment

## Sign-Off

### Development Lead
- [ ] Code reviewed
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Date: _________________

### QA/Testing
- [ ] Testing completed
- [ ] All scenarios passed
- [ ] Edge cases tested
- [ ] Security verified
- [ ] Date: _________________

### Database Administrator
- [ ] Database migrated successfully
- [ ] Backups created
- [ ] Indexes created
- [ ] Performance verified
- [ ] Date: _________________

### Project Manager
- [ ] Requirements met
- [ ] Deployment scheduled
- [ ] Stakeholders notified
- [ ] Date: _________________

## Post-Deployment Verification (First 24 Hours)

### Hour 1
- [ ] Server running without errors
- [ ] Database responding normally
- [ ] No critical errors in logs
- [ ] Basic checkout test succeeds

### Hour 6
- [ ] Monitor error logs for issues
- [ ] Check database connection pool
- [ ] Verify payment processing (if applicable)
- [ ] Spot check random orders

### Hour 24
- [ ] Review all error logs
- [ ] Analyze checkout success rate
- [ ] Verify inventory accuracy
- [ ] Check order creation times
- [ ] Analyze customer feedback

## Common Issues & Solutions

### Issue: Orders table doesn't exist
**Solution**:
```sql
SELECT EXISTS(SELECT 1 FROM information_schema.tables 
WHERE table_name = 'orders');
-- If false, run rebuild.sql again
```

### Issue: Inventory not reducing
**Check**:
1. Order created: `SELECT * FROM orders ORDER BY order_date DESC LIMIT 1;`
2. Inventory query: `SELECT inv_quantity FROM inventory WHERE inv_id = 1;`
3. Check transaction: Look for ROLLBACK in logs

### Issue: "Cannot POST /checkout/process"
**Check**:
1. Route registered: `grep "checkoutRoute" server.js`
2. File exists: `ls -la routes/checkoutRoute.js`
3. Server restarted: `npm run dev` shows no import errors

### Issue: Slow checkout process
**Optimize**:
1. Add indexes: See "Create indexes" above
2. Check query performance: `EXPLAIN ANALYZE SELECT ...;`
3. Monitor connection pool

## Documentation Checklist

- [ ] API documentation updated
- [ ] User guide created
- [ ] Admin guide created (for future admins)
- [ ] Architecture documentation current
- [ ] README updated with new features
- [ ] Database schema documented
- [ ] All endpoints documented

## Final Verification

Before marking as complete:

- [ ] All checklist items completed
- [ ] All tests passed
- [ ] Documentation finalized
- [ ] Team trained on new system
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback plan reviewed
- [ ] Sign-offs obtained

---

**Deployment Date**: December 3, 2025
**Status**: Ready for Deployment
**Next Review Date**: December 10, 2025

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Signed by**:

Development: _________________________ Date: _________

QA Testing: _________________________ Date: _________

Database: _________________________ Date: _________

Management: _________________________ Date: _________
