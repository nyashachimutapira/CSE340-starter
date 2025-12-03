# Multi-Currency Support Feature

Complete multi-currency support with USD, EUR, and Zimbabwean Dollar (ZWD).

## Features

✅ **3 Supported Currencies**
- USD - US Dollar ($)
- EUR - Euro (€)
- ZWD - Zimbabwean Dollar (Z$)

✅ **Real-time Conversion**
- Convert prices between currencies
- Display prices in user's preferred currency
- Configurable exchange rates

✅ **User Preference Storage**
- Remember user's currency selection
- Stored in browser localStorage
- Automatic persistence

✅ **API Endpoints**
- Get available currencies
- Convert specific prices
- Get prices in all currencies
- Update exchange rates (admin)

## API Endpoints

### GET /currency/available
Get all available currencies

**Response:**
```json
{
  "success": true,
  "currencies": [
    {
      "code": "USD",
      "symbol": "$",
      "name": "US Dollar",
      "rate": 1.0
    },
    {
      "code": "EUR",
      "symbol": "€",
      "name": "Euro",
      "rate": 0.92
    },
    {
      "code": "ZWD",
      "symbol": "Z$",
      "name": "Zimbabwean Dollar",
      "rate": 800.0
    }
  ]
}
```

### GET /currency/convert?priceUSD=25000&targetCurrency=ZWD
Convert a price to specific currency

**Query Parameters:**
- `priceUSD` - Price in US dollars (required)
- `targetCurrency` - Target currency code (default: USD)

**Response:**
```json
{
  "success": true,
  "priceUSD": 25000,
  "targetCurrency": "ZWD",
  "convertedPrice": 20000000,
  "formatted": "Z$20,000,000.00",
  "symbol": "Z$",
  "name": "Zimbabwean Dollar"
}
```

### GET /currency/all-prices?priceUSD=25000
Get price in all available currencies

**Query Parameters:**
- `priceUSD` - Price in US dollars (required)

**Response:**
```json
{
  "success": true,
  "priceUSD": 25000,
  "allPrices": {
    "USD": {
      "formatted": "$25,000.00",
      "formattedWithCode": "25000.00 USD",
      "value": 25000
    },
    "EUR": {
      "formatted": "€23,000.00",
      "formattedWithCode": "23000.00 EUR",
      "value": 23000
    },
    "ZWD": {
      "formatted": "Z$20,000,000.00",
      "formattedWithCode": "20000000.00 ZWD",
      "value": 20000000
    }
  }
}
```

### POST /currency/update-rate
Update exchange rate for a currency (admin only)

**Request Body:**
```json
{
  "currency": "ZWD",
  "rate": 850.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange rate updated for ZWD",
  "currency": "ZWD",
  "newRate": 850.0
}
```

## Usage Examples

### In JavaScript

```javascript
// Get available currencies
fetch('/currency/available')
  .then(res => res.json())
  .then(data => console.log(data.currencies));

// Convert price
fetch('/currency/convert?priceUSD=25000&targetCurrency=ZWD')
  .then(res => res.json())
  .then(data => console.log(data.formatted)); // Z$20,000,000.00

// Get all prices
fetch('/currency/all-prices?priceUSD=25000')
  .then(res => res.json())
  .then(data => console.log(data.allPrices));
```

### In EJS Templates

```ejs
<!-- Include currency selector -->
<%- include("../partials/currency-selector"); %>

<!-- Format price in current currency -->
<% 
  const currency = req.query.currency || 'USD';
  const price = utilities.formatPrice(25000, currency);
%>
<p>Price: <%= price %></p>

<!-- Show all prices -->
<%
  const allPrices = utilities.getAvailableCurrencies();
  allPrices.forEach(curr => {
%>
  <p><%= curr.name %>: <%= utilities.formatPrice(25000, curr.code) %></p>
<% }); %>
```

### In Controllers

```javascript
const currency = require("../utilities/currency");

// Format a price
const formattedPrice = currency.formatPrice(25000, 'ZWD');
// Returns: "Z$20,000,000.00"

// Convert price
const convertedPrice = currency.convertPrice(25000, 'EUR');
// Returns: 23000

// Get all prices
const allPrices = currency.getPriceInAllCurrencies(25000);
```

## Files Added

1. **utilities/currency.js** (175 lines)
   - Core currency conversion logic
   - Exchange rate management
   - Formatting functions

2. **controllers/currencyController.js** (100 lines)
   - API endpoint handlers
   - Currency conversion endpoints
   - Exchange rate updates

3. **routes/currencyRoute.js** (15 lines)
   - Route definitions
   - Request routing

4. **views/partials/currency-selector.ejs** (65 lines)
   - Currency dropdown selector
   - localStorage persistence
   - Custom event handling

5. **CURRENCY_FEATURE.md** (This file)
   - Feature documentation
   - Usage examples

## Files Modified

1. **utilities/index.js**
   - Added `formatPrice()` helper
   - Added `convertPrice()` helper
   - Added `getAvailableCurrencies()` helper
   - Imported currency module

2. **server.js**
   - Added currencyRoute import
   - Registered /currency routes

## Exchange Rates

Current exchange rates (can be updated via API):

- **1 USD = 1.0 USD**
- **1 USD = 0.92 EUR**
- **1 USD = 800 ZWD** (Zimbabwean Dollar)

To update exchange rates:

```bash
curl -X POST http://localhost:5500/currency/update-rate \
  -H "Content-Type: application/json" \
  -d '{"currency": "ZWD", "rate": 850}'
```

## Implementation Details

### Currency Conversion Process

1. User selects currency from dropdown
2. Selection stored in browser's localStorage
3. JavaScript sends API request with price and currency
4. Server converts price using exchange rates
5. Formatted price returned to client
6. UI displays price in selected currency

### Exchange Rate Storage

Exchange rates are stored in memory (runtime):
```javascript
const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  ZWD: { code: 'ZWD', symbol: 'Z$', rate: 800.0 }
};
```

For production, consider storing in database for persistence.

## Integration with Cart/Checkout

To use multi-currency in cart and checkout:

### In Cart View
```ejs
<%- include("../partials/currency-selector"); %>

<script>
  document.addEventListener('currencyChanged', function(e) {
    const currency = e.detail.currency;
    // Reload cart with new currency
    location.reload();
  });
</script>

<!-- Display prices in selected currency -->
<% const curr = localStorage.getItem('preferred-currency') || 'USD'; %>
<% cartItems.forEach(item => { %>
  <p>Price: <%= utilities.formatPrice(item.inv_price, curr) %></p>
<% }); %>
```

### In Checkout View
```ejs
<%- include("../partials/currency-selector"); %>

<% const curr = localStorage.getItem('preferred-currency') || 'USD'; %>
<p>Total: <%= utilities.formatPrice(total, curr) %></p>
```

## Testing

### Test Currency Conversion

```bash
# Get available currencies
curl http://localhost:5500/currency/available

# Convert $25,000 to ZWD
curl "http://localhost:5500/currency/convert?priceUSD=25000&targetCurrency=ZWD"

# Get all prices
curl "http://localhost:5500/currency/all-prices?priceUSD=25000"

# Update exchange rate
curl -X POST http://localhost:5500/currency/update-rate \
  -H "Content-Type: application/json" \
  -d '{"currency": "ZWD", "rate": 850}'
```

### Test in Browser

1. Open browser DevTools (F12)
2. Go to Console
3. Run:
```javascript
// Get available currencies
fetch('/currency/available').then(r => r.json()).then(d => console.log(d));

// Convert price
fetch('/currency/convert?priceUSD=25000&targetCurrency=ZWD')
  .then(r => r.json())
  .then(d => console.log(d.formatted));
```

## Future Enhancements

- [ ] Database storage for exchange rates
- [ ] Real-time API for live exchange rates
- [ ] More currency support
- [ ] Currency auto-detection by location
- [ ] Cryptocurrency support
- [ ] Historical exchange rate tracking
- [ ] Multiple price displays on product cards
- [ ] Currency-specific shipping costs
- [ ] Admin dashboard for rate management

## Notes

- Exchange rates are stored in memory and reset on server restart
- For production, implement persistent storage
- Consider using live exchange rate APIs (OpenExchangeRates, etc.)
- ZWD exchange rate should be updated frequently due to volatility
- All conversions are floating-point; consider using Decimal libraries for financial precision

---

**Implementation Date**: December 3, 2025
**Status**: Ready for Use
**Currencies**: USD, EUR, ZWD
