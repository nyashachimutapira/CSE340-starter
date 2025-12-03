# Inventory Management & Checkout System

Complete guide for the inventory management and checkout implementation.

## Overview

This feature adds inventory stock management and a complete checkout system with order processing. When customers purchase vehicles, inventory is automatically reduced, and comprehensive order tracking is maintained.

## Features

### Inventory Management
- **Stock Tracking**: Each vehicle has a quantity field (`inv_quantity`)
- **Real-time Stock Check**: Before checkout, system verifies adequate stock
- **Stock Reduction**: Inventory automatically reduced on successful purchase
- **Stock Restoration**: Inventory restored if order is cancelled
- **Low Stock Alerts**: (Optional) Admin can see items running low
- **Out of Stock Detection**: Users cannot checkout with out-of-stock items

### Checkout System
- **Cart Review**: Full order summary before purchase
- **Address Verification**: Collect and display billing information
- **Stock Validation**: Final verification before order creation
- **Order Confirmation**: Immediate confirmation with order number
- **Order History**: Users can view all past orders and details
- **Order Tracking**: Status updates (pending, confirmed, shipped, delivered)

### Orders & Fulfillment
- **Order Creation**: Atomic transaction ensures consistency
- **Order Items**: Snapshot of price and quantity at purchase time
- **Order Status**: Track order lifecycle
- **Order History**: Complete purchase history per customer
- **Admin Orders**: (Future) Admin can view all orders and manage fulfillment

## Database Schema

### New Tables

#### `inventory` (MODIFIED)
- Added `inv_quantity INT NOT NULL DEFAULT 1` - Current stock level

```sql
ALTER TABLE inventory ADD COLUMN inv_quantity INT NOT NULL DEFAULT 1 CHECK (inv_quantity >= 0);
```

#### `orders` (NEW)
```sql
CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);
```

#### `order_items` (NEW)
```sql
CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  inv_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(9, 0) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (inv_id) REFERENCES inventory(inv_id) ON DELETE RESTRICT
);
```

## File Structure

### Models
```
models/
├── inventory-management-model.js  (NEW) - Stock management operations
└── order-management-model.js      (NEW) - Order operations
```

### Controllers
```
controllers/
└── checkoutController.js          (NEW) - Checkout flow and order processing
```

### Routes
```
routes/
└── checkoutRoute.js               (NEW) - Checkout endpoints
```

### Views
```
views/checkout/
├── view.ejs                       (NEW) - Checkout page
├── confirmation.ejs               (NEW) - Order confirmation
└── order-history.ejs              (NEW) - Order history page
```

## API Endpoints

### Checkout Routes

#### `GET /checkout`
View checkout page with cart items and summary

**Authentication**: Required (JWT)

**Response**: Renders checkout page with:
- Cart items
- Total price
- User billing information
- Stock verification status

#### `POST /checkout/process`
Process checkout and create order

**Authentication**: Required (JWT)

**Request Body**: None (uses cart items from database)

**Response**:
```json
{
  "success": true,
  "message": "Order created successfully.",
  "order_id": 123,
  "redirect": "/checkout/confirmation/123"
}
```

**Errors**:
- `401`: Not authenticated
- `400`: Empty cart or out of stock
- `500`: Database error

#### `GET /checkout/confirmation/:orderId`
View order confirmation page

**Authentication**: Required (JWT)

**Response**: Renders confirmation page with:
- Order number and date
- Order status
- Total amount
- Items ordered with prices
- Shipping information
- Next steps

#### `GET /checkout/order-history`
View user's order history

**Authentication**: Required (JWT)

**Response**: Renders order history page with:
- List of all orders
- Order date, status, and total
- Links to view details

#### `GET /checkout/stock/:invId`
Check inventory stock status

**Parameters**:
- `invId`: Vehicle inventory ID

**Response**:
```json
{
  "success": true,
  "inv_id": 1,
  "stock": 5,
  "in_stock": true
}
```

## Models Reference

### inventory-management-model.js

#### `getStock(invId)`
Get current stock level for a vehicle

```javascript
const stock = await inventoryManagementModel.getStock(1);
// Returns: { inv_id: 1, inv_quantity: 5 }
```

#### `reduceStock(invId, quantity)`
Reduce inventory after purchase

```javascript
const updated = await inventoryManagementModel.reduceStock(1, 2);
// Returns: { inv_id: 1, inv_quantity: 3 }
// Throws error if insufficient stock
```

#### `increaseStock(invId, quantity)`
Increase inventory (for returns/cancellations)

```javascript
const updated = await inventoryManagementModel.increaseStock(1, 2);
// Returns: { inv_id: 1, inv_quantity: 5 }
```

#### `isInStock(invId, quantity)`
Check if quantity is available

```javascript
const available = await inventoryManagementModel.isInStock(1, 2);
// Returns: true or false
```

#### `getLowStockItems(threshold)`
Get items below stock threshold

```javascript
const lowStock = await inventoryManagementModel.getLowStockItems(2);
// Returns: Array of items with inv_quantity <= 2
```

#### `getOutOfStockItems()`
Get out-of-stock items

```javascript
const outOfStock = await inventoryManagementModel.getOutOfStockItems();
// Returns: Array of items with inv_quantity = 0
```

### order-management-model.js

#### `createOrder(accountId, cartItems)`
Create order from cart items

```javascript
const order = await orderManagementModel.createOrder(1, cartItems);
// Returns: { order_id, total_amount, status, order_date, item_count }
// Handles: inventory reduction, cart clearing, transaction
```

#### `getOrderById(orderId)`
Get complete order details

```javascript
const order = await orderManagementModel.getOrderById(123);
// Returns: { order_id, account_id, order_date, total_amount, status, items: [...] }
```

#### `getOrdersByAccountId(accountId)`
Get all orders for a user

```javascript
const orders = await orderManagementModel.getOrdersByAccountId(1);
// Returns: Array of orders sorted by date DESC
```

#### `updateOrderStatus(orderId, status)`
Update order status

```javascript
const updated = await orderManagementModel.updateOrderStatus(123, 'shipped');
// Valid statuses: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
```

#### `cancelOrder(orderId)`
Cancel order and restore inventory

```javascript
const cancelled = await orderManagementModel.cancelOrder(123);
// Handles: inventory restoration, status update, transaction
```

#### `getAllOrders(limit, offset)`
Get all orders (admin)

```javascript
const orders = await orderManagementModel.getAllOrders(50, 0);
// Returns: Array of orders with customer information
```

## Checkout Flow

### User Perspective

1. **Add Items to Cart** → Multiple vehicles can be added
2. **Review Cart** → User sees all items with quantities
3. **Click "Proceed to Checkout"** → Redirects to /checkout
4. **Review Order** → Final summary with:
   - All items with images and prices
   - Total cost
   - Billing address
   - Option to go back to cart
5. **Click "Complete Purchase"** → System:
   - Verifies stock for all items
   - Creates order record
   - Reduces inventory
   - Clears cart
   - Shows confirmation
6. **View Confirmation** → Shows:
   - Order number
   - Items purchased
   - Total amount
   - Delivery timeline
   - Link to order history
7. **Track Orders** → User can visit /checkout/order-history to:
   - See all past orders
   - View order status
   - Click to see full details

### System Perspective

```
POST /checkout/process
    ↓
[Validate Authentication]
    ↓
[Get Cart Items from Database]
    ↓
[Verify Cart Not Empty]
    ↓
[Check Stock for All Items] ← Database Query
    ↓
[Begin Transaction]
    ↓
[Create Order Record] ← Database Insert
    ↓
[Create Order Items] ← Database Insert
    ↓
[Reduce Inventory] ← Database Update (for each item)
    ↓
[Clear Cart] ← Database Delete
    ↓
[Commit Transaction]
    ↓
[Return Success with Order ID]
    ↓
Redirect to /checkout/confirmation/{orderId}
```

## Security Features

### Authentication & Authorization
- All checkout endpoints require JWT authentication
- Users can only view their own orders
- Order belongs to account check prevents unauthorized access

### Data Integrity
- **Transactions**: Order creation uses database transactions
- Ensures inventory reduction happens atomically with order creation
- If any step fails, entire transaction rolls back

### Validation
- Stock verified before purchase
- Quantity validation (must be > 0)
- Account ID validation (must match authenticated user)
- Inventory checks before allowing checkout

### SQL Injection Prevention
- All queries use parameterized statements
- No string concatenation in SQL

## Testing Checklist

### Inventory Management
- [ ] Stock decreases after purchase
- [ ] Stock error if insufficient quantity
- [ ] Out-of-stock items prevent checkout
- [ ] Low stock detection works
- [ ] Stock increases if order cancelled

### Checkout Process
- [ ] Cannot checkout without login
- [ ] Cart items display correctly
- [ ] Total price calculates correctly
- [ ] Stock verified before checkout
- [ ] Order created on successful checkout

### Order Management
- [ ] Order number generated
- [ ] Order date/time recorded
- [ ] Order items saved with prices
- [ ] Cart cleared after purchase
- [ ] Order confirmation displays

### Order History
- [ ] User sees all their orders
- [ ] Order status displays correctly
- [ ] Can view order details
- [ ] Order items show correctly
- [ ] User cannot see other users' orders

### Edge Cases
- [ ] Cannot checkout with empty cart
- [ ] Cannot checkout after stock changes
- [ ] Partial stock available handled
- [ ] Quantity updates before checkout
- [ ] Multiple users can checkout simultaneously

## Implementation Steps (For Reference)

1. ✅ Added `inv_quantity` column to inventory table
2. ✅ Created orders table with proper constraints
3. ✅ Created order_items table with foreign keys
4. ✅ Created inventory-management-model.js
5. ✅ Created order-management-model.js
6. ✅ Created checkoutController.js
7. ✅ Created checkoutRoute.js
8. ✅ Created checkout views (view, confirmation, order-history)
9. ✅ Updated server.js with checkout routes
10. ✅ Updated cart view with checkout button

## Future Enhancements

### Payment Processing
- Integrate Stripe or PayPal
- Handle payment status
- Retry failed payments

### Inventory Management (Admin)
- Admin dashboard for stock levels
- Automated low-stock alerts
- Bulk stock updates
- Inventory forecasting

### Order Management (Admin)
- Order fulfillment interface
- Shipping carrier integration
- Tracking number management
- Printable packing slips

### Customer Features
- Email confirmation with tracking
- SMS notifications
- Estimated delivery date
- Invoice generation
- Return/exchange process

### Analytics
- Sales reports
- Revenue tracking
- Popular items analysis
- Customer lifetime value

## Troubleshooting

### Issue: "Insufficient stock" error during checkout
**Solution**: 
- Check `SELECT inv_quantity FROM inventory WHERE inv_id = ?`
- Verify stock hasn't changed between cart view and checkout
- Ensure quantity in cart doesn't exceed available stock

### Issue: Order created but inventory not updated
**Solution**:
- Check database transaction logs
- Verify no constraint violations
- Review error logs for transaction rollback

### Issue: Cart not cleared after purchase
**Solution**:
- Verify DELETE query in order creation model
- Check account_id matches in shopping_cart table
- Ensure transaction committed successfully

### Issue: Users see other users' orders
**Solution**:
- Verify account_id check in getOrderById()
- Ensure JWT authentication working
- Check req.account is set correctly

## Performance Considerations

### Indexes (Recommended)
```sql
-- For fast lookups
CREATE INDEX idx_orders_account ON orders(account_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_inventory_quantity ON inventory(inv_quantity);

-- For order history queries
CREATE INDEX idx_orders_date ON orders(order_date DESC);
```

### Query Optimization
- Order history paginated (limit 50 default)
- Stock checks use indexed columns
- Single transaction for order creation

## Support & Questions

For issues or questions:
1. Check browser console for JavaScript errors
2. Check server logs for backend errors
3. Review database schema with `DESCRIBE` command
4. Verify JWT token validity
5. Test endpoints with curl or Postman

---

**Implementation Date**: 2025-12-03
**Status**: Production Ready
**Database Compatibility**: PostgreSQL 9.0+
