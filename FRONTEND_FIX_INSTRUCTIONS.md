# Frontend Fix Instructions

## Problem
The `placeOrder()` and `handleSubmitReview()` functions in `frontend/src/App.jsx` don't actually send data to the backend API. They only update local state.

## Solution
Replace the two functions in App.jsx with these versions:

### 1. Fix placeOrder() function

Find the `placeOrder` function (around line 260) and replace it with:

```javascript
async function placeOrder() {
  if (!form.name || !form.email || !form.address || !form.phone || !form.card) { 
    showToast("⚠️ Please fill in all required fields"); 
    return; 
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    showToast("⚠️ Please enter a valid email address");
    return;
  }

  if (createAccount && !user) {
    if (!accountPassword || accountPassword.length < 6) {
      showToast("⚠️ Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: accountPassword,
          phone: form.phone,
          address: form.address
        })
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        showToast(`✅ Account created! Welcome ${data.user.name}!`);
      } else {
        showToast(`⚠️ ${data.error || 'Failed to create account'}`);
        return;
      }
    } catch (error) {
      showToast("⚠️ Failed to create account. Continuing as guest.");
    }
  }

  // **THIS IS THE NEW PART - ACTUALLY SEND ORDER TO API**
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
    
    if (data.success) {
      console.log('✅ Order saved to database:', data.orderId);
      showToast('✅ Order placed successfully!');
      setOrderDone(true); 
      setCart([]); 
      setForm({ name:"", email:"", address:"", phone:"", card:"", expiry:"", cvv:"" });
      setCreateAccount(false);
      setAccountPassword("");
      setAppliedPromo(null);
      setPromoCode("");
      localStorage.removeItem('ghosia_cart');
    } else {
      throw new Error(data.error || 'Order failed');
    }
  } catch (error) {
    console.error('Order error:', error);
    showToast(`⚠️ Failed to place order: ${error.message}`);
  }
}
```

### 2. Fix handleSubmitReview() function

Find the `handleSubmitReview` function (around line 220) and replace it with:

```javascript
async function handleSubmitReview(e) {
  e.preventDefault();
  
  // **THIS IS THE NEW PART - SEND REVIEW TO API**
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const reviewData = {
      productId: null, // We're posting general store reviews, not product-specific
      customerName: reviewForm.name,
      customerEmail: user ? user.email : '',
      rating: parseInt(reviewForm.rating),
      comment: reviewForm.review
    };

    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(reviewData)
    });

    const data = await res.json();
    
    if (data.success) {
      console.log('✅ Review saved to database:', data.review._id);
      
      // Add to local state to show immediately
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
    showToast(`⚠️ Failed to submit review: ${error.message}`);
  }
}
```

### 3. Load reviews from API on mount

Find the `useEffect` that loads reviews from localStorage (around line 100) and replace it with:

```javascript
// Load reviews from API instead of localStorage
useEffect(() => {
  async function loadReviews() {
    try {
      const res = await fetch(`${API_URL}/reviews`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const formattedReviews = data.map(review => ({
          id: review._id,
          name: review.customerName,
          rating: review.rating,
          date: new Date(review.createdAt).toLocaleDateString(),
          review: review.comment
        }));
        setReviews(formattedReviews);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      // Fallback to default reviews if API fails
      setReviews([
        { id: 1, name: "Priya Sharma", rating: 5, date: "2 weeks ago", review: "Best Nepali grocery store in Birmingham! Fresh vegetables and authentic spices. The owner is very friendly and helpful. Highly recommend!" },
        { id: 2, name: "Raj Gurung", rating: 5, date: "1 month ago", review: "Finally found a place that sells authentic Nepali products! The basmati rice quality is excellent and prices are very reasonable. Will definitely come back." },
        { id: 3, name: "Aisha Patel", rating: 5, date: "3 weeks ago", review: "Great selection of Indian groceries! Fresh vegetables, wide variety of spices, and everything I need for cooking authentic meals. Fast delivery too!" }
      ]);
    }
  }
  
  loadReviews();
}, []);
```

### 4. Remove the localStorage save effect for reviews

Find and DELETE this useEffect (it's no longer needed):

```javascript
// DELETE THIS:
useEffect(() => {
  localStorage.setItem('ghosia_reviews', JSON.stringify(reviews));
}, [reviews]);
```

## How to Apply

1. Open `frontend/src/App.jsx`
2. Find each function mentioned above
3. Replace with the new versions
4. Save the file
5. Restart your frontend: `npm run dev`

## Test

1. Place an order - it should show in admin Orders section
2. Submit a review - it should persist after refresh
3. Check browser console for "✅ Order saved to database" and "✅ Review saved to database" messages