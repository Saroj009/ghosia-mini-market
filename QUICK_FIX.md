# Quick Manual Fix for App.jsx

Since the automated script isn't working, follow these 3 simple steps:

## Step 1: Fix placeOrder function

In `frontend/src/App.jsx`, find this line (around line 300):

```javascript
setOrderDone(true); 
setCart([]); 
```

**ADD THIS CODE RIGHT BEFORE those lines:**

```javascript
// SEND ORDER TO API
try {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const orderData = {
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone,
    deliveryAddress: form.address,
    items: cart.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      image: getProductImage(item)
    })),
    subtotal: subtotal,
    discount: discount,
    total: parseFloat(total),
    promoCode: appliedPromo ? promoCode : ''
  };

  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(orderData)
  });

  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Order failed');
  }
  console.log('✅ Order saved:', data.orderId);
} catch (error) {
  console.error('Order error:', error);
  showToast(`⚠️ ${error.message}`);
  return;
}
```

## Step 2: Fix handleSubmitReview function

In `frontend/src/App.jsx`, find the `handleSubmitReview` function (around line 220).

**REPLACE the entire function** with:

```javascript
async function handleSubmitReview(e) {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        productId: null,
        customerName: reviewForm.name,
        customerEmail: user ? user.email : '',
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.review
      })
    });

    const data = await res.json();
    
    if (data.success) {
      console.log('✅ Review saved:', data.review._id);
      const newReview = {
        id: data.review._id,
        name: reviewForm.name,
        rating: parseInt(reviewForm.rating),
        date: "Just now",
        review: reviewForm.review
      };
      setReviews([newReview, ...reviews]);
      setReviewForm({ name: "", rating: 5, review: "" });
      setShowReviewForm(false);
      showToast("✅ Thank you for your review!");
    } else {
      throw new Error(data.error || 'Review failed');
    }
  } catch (error) {
    console.error('Review error:', error);
    showToast(`⚠️ ${error.message}`);
  }
}
```

## Step 3: Load reviews from API

Find the useEffect that loads reviews (around line 100-130).

**REPLACE both useEffects** (the one that loads from localStorage and the one that saves) with:

```javascript
// Load reviews from API
useEffect(() => {
  async function loadReviews() {
    try {
      const res = await fetch(`${API_URL}/reviews`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const formatted = data.map(r => ({
          id: r._id,
          name: r.customerName,
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString(),
          review: r.comment
        }));
        setReviews(formatted);
      }
    } catch (error) {
      console.error('Load reviews error:', error);
    }
  }
  loadReviews();
}, []);
```

## Save and Test

1. Save the file
2. Restart frontend: `npm run dev`
3. Test: Place order → Check admin panel
4. Test: Submit review → Refresh page → Should persist

✅ Done!