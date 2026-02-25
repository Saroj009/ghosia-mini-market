// Run this in your frontend/src directory to fix App.jsx
// Usage: node fix-app.js

const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// 1. Fix placeOrder function
const oldPlaceOrder = /async function placeOrder\(\) \{[\s\S]*?setOrderDone\(true\);[\s\S]*?localStorage\.removeItem\('ghosia_cart'\);[\s\S]*?\}/;
const newPlaceOrder = `async function placeOrder() {
    if (!form.name || !form.email || !form.address || !form.phone || !form.card) { 
      showToast("⚠️ Please fill in all required fields"); 
      return; 
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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
        const res = await fetch(\`\${API_URL}/auth/register\`, {
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
          showToast(\`✅ Account created! Welcome \${data.user.name}!\`);
        } else {
          showToast(\`⚠️ \${data.error || 'Failed to create account'}\`);
          return;
        }
      } catch (error) {
        showToast("⚠️ Failed to create account. Continuing as guest.");
      }
    }

    // SEND ORDER TO API
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = \`Bearer \${token}\`;

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

      const res = await fetch(\`\${API_URL}/orders\`, {
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
      showToast(\`⚠️ Failed to place order: \${error.message}\`);
    }
  }`;

if (content.match(oldPlaceOrder)) {
  content = content.replace(oldPlaceOrder, newPlaceOrder);
  console.log('✅ Fixed placeOrder function');
} else {
  console.log('⚠️ Could not find placeOrder function to replace');
}

// 2. Fix handleSubmitReview function
const oldHandleSubmitReview = /function handleSubmitReview\(e\) \{[\s\S]*?showToast\("✅ Thank you for your review!"\);[\s\S]*?\}/;
const newHandleSubmitReview = `async function handleSubmitReview(e) {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = \`Bearer \${token}\`;

      const reviewData = {
        productId: null,
        customerName: reviewForm.name,
        customerEmail: user ? user.email : '',
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.review
      };

      const res = await fetch(\`\${API_URL}/reviews\`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(reviewData)
      });

      const data = await res.json();
      
      if (data.success) {
        console.log('✅ Review saved to database:', data.review._id);
        
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
      showToast(\`⚠️ Failed to submit review: \${error.message}\`);
    }
  }`;

if (content.match(oldHandleSubmitReview)) {
  content = content.replace(oldHandleSubmitReview, newHandleSubmitReview);
  console.log('✅ Fixed handleSubmitReview function');
} else {
  console.log('⚠️ Could not find handleSubmitReview function to replace');
}

// 3. Fix reviews loading - replace localStorage with API
const oldReviewsEffect = /\/\/ Load reviews from localStorage[\s\S]*?useEffect\(\(\) => \{[\s\S]*?localStorage\.setItem\('ghosia_reviews', JSON\.stringify\(reviews\)\);[\s\S]*?\}, \[reviews\]\);/;

const newReviewsEffect = `// Load reviews from API
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(\`\${API_URL}/reviews\`);
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
        setReviews([
          { id: 1, name: "Priya Sharma", rating: 5, date: "2 weeks ago", review: "Best Nepali grocery store in Birmingham! Fresh vegetables and authentic spices. The owner is very friendly and helpful. Highly recommend!" },
          { id: 2, name: "Raj Gurung", rating: 5, date: "1 month ago", review: "Finally found a place that sells authentic Nepali products! The basmati rice quality is excellent and prices are very reasonable. Will definitely come back." },
          { id: 3, name: "Aisha Patel", rating: 5, date: "3 weeks ago", review: "Great selection of Indian groceries! Fresh vegetables, wide variety of spices, and everything I need for cooking authentic meals. Fast delivery too!" },
          { id: 4, name: "Kumar Thapa", rating: 4, date: "1 week ago", review: "Good quality products and convenient location. The store has all Asian essentials. Sometimes gets busy but service is always quick." },
          { id: 5, name: "Sarah Ahmed", rating: 5, date: "2 months ago", review: "Love this store! They have everything from fresh produce to specialty ingredients. The staff is always welcoming and helpful. Best prices in Birmingham!" },
          { id: 6, name: "Bikash Rai", rating: 5, date: "3 weeks ago", review: "Excellent Nepali mini market! Found all the ingredients I needed for momo and curry. Fresh meat section is great too. Five stars!" }
        ]);
      }
    }
    
    loadReviews();
  }, []);`;

if (content.match(oldReviewsEffect)) {
  content = content.replace(oldReviewsEffect, newReviewsEffect);
  console.log('✅ Fixed reviews loading');
} else {
  console.log('⚠️ Could not find reviews useEffect to replace');
}

fs.writeFileSync(appJsxPath, content, 'utf8');
console.log('\n✅ App.jsx has been fixed! Restart your dev server.');
