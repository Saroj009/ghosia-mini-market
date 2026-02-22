# Ghosia Mini Market - Backend

## MongoDB Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the backend folder:

```bash
cp .env.example .env
```

Then edit `.env` and add your MongoDB credentials:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.oaxjmmf.mongodb.net/ghosia-market?retryWrites=true&w=majority
PORT=3000
```

### 3. Run the Server
```bash
node index.js
# or with auto-reload
npm run dev
```

## Features

- ✅ MongoDB integration with Mongoose
- ✅ Automatic database seeding (25 products)
- ✅ Fallback to static data if DB is unavailable
- ✅ Product management routes
- ✅ Order management routes
- ✅ CORS enabled for frontend

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/admin/products/:id` - Get single product
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status

### Health Check
- `GET /api/health` - Check server and database status

## Database Models

### Product
```javascript
{
  name: String,
  price: Number,
  category: String,
  description: String,
  inStock: Boolean,
  image: String
}
```

### Order
```javascript
{
  customerName: String,
  address: String,
  phone: String,
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: String,
  paymentMethod: String
}
```
