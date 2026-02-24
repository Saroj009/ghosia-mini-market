import { useEffect, useState } from "react";
import AdminDashboard from './AdminDashboard';

// Use environment variable for API URL (works in both dev and production)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getProductImage(product) {
  if (product.image) return product.image;
  
  const PRODUCT_IMAGES = {
    "Whole Milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
    "Cheddar Cheese": "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400",
    "Greek Yogurt": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    "Butter": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400",
    "White Bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    "Croissants": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
    "Bagels": "https://images.unsplash.com/photo-1584131097598-cf7eca77ff42?w=400",
    "Chicken Breast": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
    "Ground Beef": "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400",
    "Pork Chops": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400",
    "Basmati Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    "Quinoa": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    "Oats": "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400",
    "Carrots": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
    "Broccoli": "https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=400",
    "Tomatoes": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
    "Bell Peppers": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400",
    "Olive Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
    "Vegetable Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
    "Coconut Oil": "https://images.unsplash.com/photo-1520693727906-ff5d0f066a7e?w=400",
    "Baked Beans": "https://images.unsplash.com/photo-1571942676516-bcab84649e44?w=400",
    "Tomato Soup": "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400",
    "Tuna": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400",
    "Orange Juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
    "Cola": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
    "Sparkling Water": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400",
    "Black Pepper": "https://images.unsplash.com/photo-1599909533730-f80e2c3b3f05?w=400",
    "Turmeric": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400",
    "Cumin": "https://images.unsplash.com/photo-1596040033229-a0b548b2f047?w=400"
  };
  
  return PRODUCT_IMAGES[product.name] || "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400";
}

const PRODUCT_EMOJIS = {
  "Whole Milk": "🥛", "Cheddar Cheese": "🧀", "Greek Yogurt": "🥛", "Butter": "🧈",
  "White Bread": "🍞", "Croissants": "🥐", "Bagels": "🥯", "Chicken Breast": "🍗",
  "Ground Beef": "🥩", "Pork Chops": "🥓", "Basmati Rice": "🍚", "Quinoa": "🌾",
  "Oats": "🌾", "Carrots": "🥕", "Broccoli": "🥦", "Tomatoes": "🍅",
  "Bell Peppers": "🫑", "Olive Oil": "🫒", "Vegetable Oil": "🌻", "Coconut Oil": "🥥",
  "Baked Beans": "🫘", "Tomato Soup": "🥫", "Tuna": "🐟", "Orange Juice": "🧃",
  "Cola": "🥤", "Sparkling Water": "💧", "Black Pepper": "🌶️", "Turmeric": "🌶️", "Cumin": "🌶️"
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState("shop");
  const [orderDone, setOrderDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name:"", email:"", address:"", phone:"", card:"", expiry:"", cvv:"" });
  const [toast, setToast] = useState("");
  
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name:"", email:"", password:"", phone:"", address:"" });
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);

  // Guest checkout states
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");

  // Promo code states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  // Admin login state
  const [adminLoginForm, setAdminLoginForm] = useState({ email: "", password: "" });
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, review: "" });

  const PROMO_CODES = {
    "WELCOME10": { discount: 10, type: "percentage", description: "10% off your order" },
    "SAVE5": { discount: 5, type: "fixed", description: "£5 off your order" },
    "FREESHIP": { discount: 0, type: "shipping", description: "Free shipping (already free!)" },
    "FIRST20": { discount: 20, type: "percentage", description: "20% off first order" },
  };

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('ghosia_reviews');
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error('Failed to parse reviews:', e);
        setReviews([
          { id: 1, name: "Priya Sharma", rating: 5, date: "2 weeks ago", review: "Best Nepali grocery store in Birmingham! Fresh vegetables and authentic spices. The owner is very friendly and helpful. Highly recommend!" },
          { id: 2, name: "Raj Gurung", rating: 5, date: "1 month ago", review: "Finally found a place that sells authentic Nepali products! The basmati rice quality is excellent and prices are very reasonable. Will definitely come back." },
          { id: 3, name: "Aisha Patel", rating: 5, date: "3 weeks ago", review: "Great selection of Indian groceries! Fresh vegetables, wide variety of spices, and everything I need for cooking authentic meals. Fast delivery too!" },
          { id: 4, name: "Kumar Thapa", rating: 4, date: "1 week ago", review: "Good quality products and convenient location. The store has all Asian essentials. Sometimes gets busy but service is always quick." },
          { id: 5, name: "Sarah Ahmed", rating: 5, date: "2 months ago", review: "Love this store! They have everything from fresh produce to specialty ingredients. The staff is always welcoming and helpful. Best prices in Birmingham!" },
          { id: 6, name: "Bikash Rai", rating: 5, date: "3 weeks ago", review: "Excellent Nepali mini market! Found all the ingredients I needed for momo and curry. Fresh meat section is great too. Five stars!" }
        ]);
      }
    } else {
      setReviews([
        { id: 1, name: "Priya Sharma", rating: 5, date: "2 weeks ago", review: "Best Nepali grocery store in Birmingham! Fresh vegetables and authentic spices. The owner is very friendly and helpful. Highly recommend!" },
        { id: 2, name: "Raj Gurung", rating: 5, date: "1 month ago", review: "Finally found a place that sells authentic Nepali products! The basmati rice quality is excellent and prices are very reasonable. Will definitely come back." },
        { id: 3, name: "Aisha Patel", rating: 5, date: "3 weeks ago", review: "Great selection of Indian groceries! Fresh vegetables, wide variety of spices, and everything I need for cooking authentic meals. Fast delivery too!" },
        { id: 4, name: "Kumar Thapa", rating: 4, date: "1 week ago", review: "Good quality products and convenient location. The store has all Asian essentials. Sometimes gets busy but service is always quick." },
        { id: 5, name: "Sarah Ahmed", rating: 5, date: "2 months ago", review: "Love this store! They have everything from fresh produce to specialty ingredients. The staff is always welcoming and helpful. Best prices in Birmingham!" },
        { id: 6, name: "Bikash Rai", rating: 5, date: "3 weeks ago", review: "Excellent Nepali mini market! Found all the ingredients I needed for momo and curry. Fresh meat section is great too. Five stars!" }
      ]);
    }
  }, []);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ghosia_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ghosia_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ghosia_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (!data.error) setUser(data);
        else localStorage.removeItem('token');
      })
      .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  useEffect(() => { loadProducts(); }, []);

  function loadProducts() {
    fetch(`${API_URL}/products`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || p.category === category)
  );

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function addToCart(product) {
    setCart(old => {
      const ex = old.find(i => i._id === product._id);
      if (ex) return old.map(i => i._id === product._id ? {...i, qty: i.qty+1} : i);
      return [...old, {...product, qty:1}];
    });
    showToast(`✔ ${product.name} added!`);
  }

  function changeQty(id, d) { setCart(old => old.map(i => i._id===id ? {...i, qty:i.qty+d} : i).filter(i => i.qty > 0)); }
  function removeFromCart(id) { setCart(old => old.filter(i => i._id !== id)); }

  const totalItems = cart.reduce((s,i) => s+i.qty, 0);
  const subtotal = cart.reduce((s,i) => s+i.price*i.qty, 0);
  
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discount = (subtotal * appliedPromo.discount) / 100;
    } else if (appliedPromo.type === "fixed") {
      discount = appliedPromo.discount;
    }
  }
  
  const total = (subtotal - discount).toFixed(2);

  function goToCart() {
    if (cart.length === 0) { showToast("⚠️ Your cart is empty"); return; }
    setPage("cart");
  }

  function goToCheckout() {
    if (cart.length === 0) { showToast("⚠️ Your cart is empty"); return; }
    setPage("checkout");
  }

  function applyPromoCode() {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a promo code");
      return;
    }
    
    if (PROMO_CODES[code]) {
      setAppliedPromo(PROMO_CODES[code]);
      setPromoError("");
      showToast(`✅ Promo code applied: ${PROMO_CODES[code].description}`);
    } else {
      setPromoError("Invalid promo code");
      setAppliedPromo(null);
    }
  }

  function removePromoCode() {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
    showToast("🗑️ Promo code removed");
  }

  function handleSubmitReview(e) {
    e.preventDefault();
    const newReview = {
      id: Date.now(),
      name: reviewForm.name,
      rating: parseInt(reviewForm.rating),
      date: "Just now",
      review: reviewForm.review
    };
    setReviews([newReview, ...reviews]);
    setReviewForm({ name: "", rating: 5, review: "" });
    setShowReviewForm(false);
    showToast("✅ Thank you for your review!");
  }

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

    setOrderDone(true); 
    setCart([]); 
    setForm({ name:"", email:"", address:"", phone:"", card:"", expiry:"", cvv:"" });
    setCreateAccount(false);
    setAccountPassword("");
    setAppliedPromo(null);
    setPromoCode("");
    localStorage.removeItem('ghosia_cart');
  }

  const cartQtyForProduct = (id) => { const item = cart.find(i => i._id === id); return item ? item.qty : 0; };

  // Customer login/register
  async function handleAuth(e) {
    e.preventDefault(); setAuthLoading(true);
    const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
    const body = authMode === "register" ? authForm : { email: authForm.email, password: authForm.password };
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token); 
        setUser(data.user); 
        setPage('shop');
        showToast(`✅ Welcome ${data.user.name}!`); 
        setAuthForm({ name:"", email:"", password:"", phone:"", address:"" });
      } else { 
        showToast(`⚠️ ${data.error || 'Authentication failed'}`); 
      }
    } catch (error) { 
      showToast("⚠️ Network error. Please try again."); 
    }
    setAuthLoading(false);
  }

  // Admin login
  async function handleAdminLogin(e) {
    e.preventDefault();
    setAdminLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminLoginForm)
      });
      const data = await res.json();
      
      if (data.token && data.user.isAdmin) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setPage('admin-dashboard');
        showToast(`✅ Welcome Admin ${data.user.name}!`);
        setAdminLoginForm({ email: "", password: "" });
      } else if (data.token && !data.user.isAdmin) {
        showToast('⚠️ Access denied. Admin credentials required.');
      } else {
        showToast(`⚠️ ${data.error || 'Invalid admin credentials'}`);
      }
    } catch (error) {
      showToast("⚠️ Network error. Please try again.");
    }
    setAdminLoginLoading(false);
  }

  function handleLogout() { 
    localStorage.removeItem('token'); 
    setUser(null); 
    setPage('shop'); 
    showToast("👋 Logged out successfully"); 
  }

  // Render star rating
  function renderStars(rating) {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? "star filled" : "star"}>
            ★
          </span>
        ))}
      </div>
    );
  }

  // If admin is logged in and viewing admin dashboard, render AdminDashboard component
  if (page === "admin-dashboard" && user && user.isAdmin) {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Rest of the customer-facing application continues below...
  return (
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif", background:"#0f0f0f", minHeight:"100vh", color:"#fff"}}>
      {/* ALL STYLES - keeping intact */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0f0f0f;overflow-x:hidden;}
        ::-webkit-scrollbar{width:10px;}
        ::-webkit-scrollbar-track{background:#1a1a1a;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#fff,#ddd);border-radius:10px;}
        ::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#fff,#f0f0f0);}
        .nav{position:sticky;top:0;z-index:200;background:rgba(15,15,15,0.95);backdrop-filter:blur(20px);border-bottom:2px solid rgba(255,255,255,0.15);padding:0 40px;height:80px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .logo{display:flex;align-items:center;gap:16px;cursor:pointer;transition:transform 0.3s;}
        .logo:hover{transform:scale(1.05);}
        .logo-icon{width:56px;height:56px;background:linear-gradient(135deg,#fff,#e0e0e0);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 8px 32px rgba(255,255,255,0.3);}
        .logo-text{font-size:26px;font-weight:900;letter-spacing:-1px;color:#fff;}
        .logo-sub{font-size:11px;color:#aaa;letter-spacing:2px;text-transform:uppercase;margin-top:2px;font-weight:800;}
        .nav-center{display:flex;align-items:center;gap:24px;}
        .nav-link{color:#aaa;font-size:15px;font-weight:800;cursor:pointer;transition:all 0.3s;text-decoration:none;padding:8px 16px;border-radius:50px;}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,0.1);transform:translateY(-2px);}
        .nav-link.admin-link{color:#ef4444;}
        .nav-link.admin-link:hover{background:rgba(239,68,68,0.15);}
        .nav-right{display:flex;align-items:center;gap:14px;}
        .user-badge{background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);color:#fff;padding:12px 22px;border-radius:50px;font-size:15px;font-weight:800;display:flex;align-items:center;gap:10px;}
        .admin-badge{background:rgba(239,68,68,0.15);border:2px solid #ef4444;color:#ef4444;}
        .logout-btn{background:rgba(239,68,68,0.15);border:2px solid #ef4444;color:#ef4444;padding:12px 22px;border-radius:50px;font-size:15px;font-weight:800;cursor:pointer;transition:all 0.3s;}
        .logout-btn:hover{background:rgba(239,68,68,0.25);transform:translateY(-2px);}
        .nav-btn{background:#fff;color:#0f0f0f;border:none;border-radius:50px;padding:14px 28px;font-weight:900;cursor:pointer;font-size:16px;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 8px 32px rgba(255,255,255,0.3);}
        .nav-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(255,255,255,0.4);}
        .admin-btn{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;}
        .admin-btn:hover{box-shadow:0 12px 40px rgba(239,68,68,0.4);}
        .checkout-btn{background:linear-gradient(135deg,#10b981,#059669);color:#fff;}
        .checkout-btn:hover{box-shadow:0 12px 40px rgba(16,185,129,0.4);}
        .badge{background:#0f0f0f;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;border:2px solid #fff;}
        .content-page{max-width:900px;margin:0 auto;padding:80px 28px;}
        .page-title{font-size:48px;font-weight:900;color:#fff;margin-bottom:20px;display:flex;align-items:center;gap:16px;}
        .page-subtitle{font-size:18px;color:#aaa;margin-bottom:50px;line-height:1.8;font-weight:600;}
        .info-card{background:rgba(30,30,30,0.9);border:2px solid rgba(255,255,255,0.15);border-radius:24px;padding:40px;margin-bottom:30px;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .info-card h2{font-size:28px;font-weight:900;color:#fff;margin-bottom:20px;display:flex;align-items:center;gap:12px;}
        .info-card h3{font-size:22px;font-weight:800;color:#fff;margin:30px 0 16px;padding-top:20px;border-top:2px solid rgba(255,255,255,0.1);}
        .info-card h3:first-of-type{margin-top:0;padding-top:0;border:none;}
        .info-card p{font-size:17px;color:#ddd;line-height:1.8;margin-bottom:16px;font-weight:600;}
        .info-card ul{margin:20px 0 20px 24px;}
        .info-card li{font-size:17px;color:#ddd;line-height:1.8;margin-bottom:12px;font-weight:600;}
        .info-item{display:flex;align-items:start;gap:16px;padding:16px 0;border-bottom:2px solid rgba(255,255,255,0.1);}
        .info-item:last-child{border:none;}
        .info-icon{font-size:28px;flex-shrink:0;}
        .info-content{flex:1;}
        .info-label{font-size:13px;color:#aaa;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;}
        .info-value{font-size:18px;color:#fff;font-weight:700;}
        .info-value a{color:#fff;text-decoration:none;transition:all 0.3s;}
        .info-value a:hover{color:#10b981;}
        .reviews-section{max-width:1300px;margin:0 auto;padding:80px 28px;}
        .reviews-header{text-align:center;margin-bottom:60px;}
        .reviews-title{font-size:48px;font-weight:900;color:#fff;margin-bottom:20px;display:flex;align-items:center;justify-content:center;gap:16px;}
        .reviews-subtitle{font-size:18px;color:#aaa;font-weight:600;max-width:600px;margin:0 auto 30px;}
        .reviews-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;margin-top:40px;}
        .review-card{background:rgba(30,30,30,0.9);border:2px solid rgba(255,255,255,0.15);border-radius:24px;padding:32px;transition:all 0.3s;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .review-card:hover{border-color:#fff;transform:translateY(-5px);box-shadow:0 20px 60px rgba(255,255,255,0.15);}
        .review-header{display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;}
        .reviewer-info h3{font-size:20px;font-weight:900;color:#fff;margin-bottom:6px;}
        .review-date{font-size:13px;color:#666;font-weight:700;}
        .star-rating{display:flex;gap:4px;margin-bottom:16px;}
        .star{font-size:20px;color:#333;}
        .star.filled{color:#fbbf24;}
        .review-text{font-size:16px;color:#ddd;line-height:1.8;font-weight:600;}
        .review-form-card{background:rgba(16,185,129,0.05);border:2px solid rgba(16,185,129,0.3);border-radius:24px;padding:40px;max-width:700px;margin:0 auto 50px;}
        .review-form-header{font-size:28px;font-weight:900;color:#fff;margin-bottom:10px;text-align:center;}
        .review-form-subtitle{font-size:16px;color:#aaa;font-weight:600;margin-bottom:30px;text-align:center;}
        .auth-wrap{min-height:calc(100vh - 80px);display:flex;align-items:center;justify-content:center;padding:40px 20px;}
        .auth-box{background:rgba(30,30,30,0.95);border:2px solid rgba(255,255,255,0.2);border-radius:32px;padding:50px 44px;width:100%;max-width:520px;box-shadow:0 20px 80px rgba(0,0,0,0.8);}
        .auth-box.admin-auth-box{border:2px solid #ef4444;}
        .auth-header{text-align:center;margin-bottom:36px;}
        .auth-icon{font-size:80px;margin-bottom:20px;}
        .auth-title{font-size:36px;font-weight:900;color:#fff;margin-bottom:10px;}
        .auth-title.admin-title{color:#ef4444;}
        .auth-subtitle{font-size:16px;color:#aaa;font-weight:600;}
        .auth-tabs{display:flex;gap:10px;margin-bottom:32px;background:rgba(255,255,255,0.05);border-radius:50px;padding:6px;border:2px solid rgba(255,255,255,0.1);}
        .auth-tab{flex:1;padding:14px;border:none;background:transparent;color:#aaa;font-weight:800;font-size:15px;border-radius:50px;cursor:pointer;transition:all 0.3s;}
        .auth-tab.active{background:#fff;color:#0f0f0f;box-shadow:0 4px 20px rgba(255,255,255,0.3);}
        .f-label{display:block;font-size:13px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;}
        .f-input{width:100%;padding:16px 20px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.2);border-radius:16px;color:#fff;font-size:16px;outline:none;transition:all 0.3s;font-weight:600;}
        .f-input:focus{border-color:#fff;box-shadow:0 0 20px rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);}
        .f-input::placeholder{color:#666;}
        .f-textarea{width:100%;padding:16px 20px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.2);border-radius:16px;color:#fff;font-size:16px;outline:none;transition:all 0.3s;font-weight:600;min-height:120px;resize:vertical;font-family:inherit;}
        .f-textarea:focus{border-color:#fff;box-shadow:0 0 20px rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);}
        .f-select{width:100%;padding:16px 20px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.2);border-radius:16px;color:#fff;font-size:16px;outline:none;transition:all 0.3s;font-weight:600;cursor:pointer;}
        .f-select:focus{border-color:#fff;box-shadow:0 0 20px rgba(255,255,255,0.2);}
        .f-group{margin-bottom:22px;}
        .auth-btn{width:100%;background:#fff;color:#0f0f0f;border:none;border-radius:16px;padding:18px;font-size:18px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 32px rgba(255,255,255,0.3);margin-top:14px;}
        .auth-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(255,255,255,0.4);}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .auth-btn.admin-login-btn{background:#ef4444;color:#fff;}
        .submit-review-btn{background:linear-gradient(135deg,#10b981,#059669);color:#fff;}
        .auth-divider{text-align:center;color:#666;font-size:15px;margin:30px 0;font-weight:700;}
        .auth-switch{text-align:center;color:#aaa;font-size:16px;margin-top:26px;font-weight:600;}
        .auth-switch a{color:#fff;font-weight:900;cursor:pointer;text-decoration:none;}
        .auth-switch a:hover{text-decoration:underline;}
        .hero{background:linear-gradient(180deg,rgba(255,255,255,0.05),transparent);padding:80px 32px 60px;text-align:center;position:relative;overflow:hidden;border-bottom:2px solid rgba(255,255,255,0.1);}
        .hero-badge{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);color:#fff;border-radius:50px;padding:10px 26px;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px;}
        .hero h1{font-size:64px;font-weight:900;line-height:1.1;margin-bottom:20px;color:#fff;}
        .hero-sub{font-size:18px;color:#aaa;margin-bottom:40px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.7;font-weight:600;}
        .search-wrap{max-width:700px;margin:0 auto;}
        .search-box{display:flex;background:rgba(30,30,30,0.8);border:2px solid rgba(255,255,255,0.2);border-radius:60px;overflow:hidden;transition:all 0.3s;box-shadow:0 10px 40px rgba(0,0,0,0.5);}
        .search-box:focus-within{border-color:#fff;box-shadow:0 10px 50px rgba(255,255,255,0.2);}
        .search-box input{flex:1;background:transparent;border:none;padding:20px 30px;font-size:17px;color:#fff;outline:none;font-weight:600;}
        .search-box input::placeholder{color:#666;}
        .search-box select{background:#fff;color:#0f0f0f;border:none;padding:18px 30px;font-size:15px;font-weight:900;cursor:pointer;outline:none;}
        .body{max-width:1300px;margin:0 auto;padding:60px 28px;}
        .cat-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:50px;}
        .cat-btn{background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.2);color:#fff;border-radius:50px;padding:14px 28px;font-size:15px;font-weight:900;cursor:pointer;transition:all 0.3s;white-space:nowrap;}
        .cat-btn:hover{border-color:#fff;transform:translateY(-3px);box-shadow:0 8px 30px rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);}
        .cat-btn.active{background:#fff;color:#0f0f0f;border-color:transparent;box-shadow:0 8px 32px rgba(255,255,255,0.3);}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;}
        .section-title{font-size:32px;font-weight:900;color:#fff;}
        .section-count{background:rgba(255,255,255,0.1);color:#fff;border-radius:50px;padding:10px 22px;font-size:15px;font-weight:900;border:2px solid rgba(255,255,255,0.2);}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px;}
        .card{background:rgba(30,30,30,0.8);border-radius:24px;border:2px solid rgba(255,255,255,0.15);overflow:hidden;transition:all 0.4s;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .card:hover{border-color:#fff;transform:translateY(-10px) scale(1.02);box-shadow:0 20px 60px rgba(255,255,255,0.2);}
        .card-thumb{height:200px;background:#1a1a1a;overflow:hidden;position:relative;}
        .card-thumb img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s;}
        .card:hover .card-thumb img{transform:scale(1.1);}
        .product-emoji{position:absolute;top:14px;left:14px;font-size:42px;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border-radius:14px;width:64px;height:64px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.2);z-index:1;}
        .card-body{padding:22px 24px 24px;}
        .card-cat{font-size:12px;font-weight:900;color:#aaa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;}
        .card-name{font-size:18px;font-weight:800;color:#fff;margin-bottom:20px;line-height:1.4;min-height:50px;}
        .card-foot{display:flex;justify-content:space-between;align-items:center;}
        .card-price{font-size:28px;font-weight:900;color:#fff;}
        .in-cart-badge{position:absolute;top:14px;right:14px;background:#ef4444;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;box-shadow:0 4px 16px rgba(239,68,68,0.6);z-index:2;}
        .add-btn{background:#fff;color:#0f0f0f;border:none;border-radius:16px;width:50px;height:50px;font-size:28px;font-weight:900;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(255,255,255,0.3);}
        .add-btn:hover{transform:scale(1.15);box-shadow:0 8px 32px rgba(255,255,255,0.5);}
        .divider{height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);margin:70px 0;}
        .cart-card{background:rgba(30,30,30,0.8);border:2px solid rgba(255,255,255,0.15);border-radius:22px;padding:22px 26px;margin-bottom:16px;display:flex;align-items:center;gap:20px;transition:all 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.5);}
        .cart-card:hover{border-color:#fff;box-shadow:0 8px 32px rgba(255,255,255,0.15);transform:translateX(5px);}
        .cart-thumb{width:80px;height:80px;background:#1a1a1a;border-radius:16px;overflow:hidden;flex-shrink:0;border:2px solid rgba(255,255,255,0.1);}
        .cart-thumb img{width:100%;height:100%;object-fit:cover;}
        .cart-info{flex:1;}
        .cart-name{font-weight:900;color:#fff;font-size:18px;}
        .cart-cat{font-size:14px;color:#aaa;margin-top:6px;font-weight:700;}
        .qty-control{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.05);border-radius:50px;padding:10px 18px;border:2px solid rgba(255,255,255,0.2);}
        .qty-btn{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;font-weight:900;line-height:1;transition:all 0.3s;}
        .qty-btn:hover{color:#aaa;transform:scale(1.3);}
        .qty-num{font-weight:900;color:#fff;font-size:18px;min-width:32px;text-align:center;}
        .cart-price{font-weight:900;font-size:20px;color:#fff;min-width:80px;text-align:right;}
        .del-btn{background:rgba(239,68,68,0.15);border:2px solid #ef4444;color:#ef4444;border-radius:14px;width:44px;height:44px;cursor:pointer;font-size:18px;transition:all 0.3s;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:900;}
        .del-btn:hover{background:rgba(239,68,68,0.25);transform:scale(1.1);}
        .order-box{background:rgba(30,30,30,0.9);border:2px solid rgba(255,255,255,0.2);border-radius:30px;padding:36px 40px;margin-top:28px;box-shadow:0 12px 40px rgba(0,0,0,0.5);}
        .order-row{display:flex;justify-content:space-between;font-size:16px;color:#aaa;padding:12px 0;font-weight:700;}
        .order-row:not(:last-child){border-bottom:2px solid rgba(255,255,255,0.1);}
        .order-total{display:flex;justify-content:space-between;font-size:32px;font-weight:900;padding-top:20px;margin-top:12px;border-top:3px solid rgba(255,255,255,0.2);}
        .order-total span{color:#fff;}
        .free{color:#10b981;font-weight:900;}
        .discount{color:#ef4444;font-weight:900;}
        .go-checkout{width:100%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:20px;padding:22px;font-size:20px;font-weight:900;cursor:pointer;margin-top:28px;transition:all 0.3s;box-shadow:0 10px 40px rgba(16,185,129,0.3);letter-spacing:1px;}
        .go-checkout:hover{transform:translateY(-3px);box-shadow:0 15px 50px rgba(16,185,129,0.4);}
        .checkout-wrap{max-width:800px;margin:0 auto;padding:60px 28px;}
        .back-btn{background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);color:#fff;border-radius:50px;padding:14px 32px;font-size:16px;font-weight:900;cursor:pointer;margin-bottom:50px;transition:all 0.3s;display:inline-flex;align-items:center;gap:10px;}
        .back-btn:hover{background:rgba(255,255,255,0.2);transform:translateX(-5px);}
        .co-card{background:rgba(30,30,30,0.9);border:2px solid rgba(255,255,255,0.15);border-radius:28px;padding:36px 40px;margin-bottom:28px;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .co-card h3{font-size:22px;font-weight:900;color:#fff;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;gap:12px;}
        .f-row{display:flex;gap:18px;}
        .summary-item{display:flex;justify-content:space-between;padding:14px 0;border-bottom:2px solid rgba(255,255,255,0.1);font-size:16px;color:#aaa;font-weight:700;}
        .summary-item:last-child{border:none;}
        .summary-total{display:flex;justify-content:space-between;font-size:26px;font-weight:900;padding-top:18px;margin-top:12px;border-top:3px solid rgba(255,255,255,0.2);color:#fff;}
        .place-btn{width:100%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:20px;padding:22px;font-size:20px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 10px 40px rgba(16,185,129,0.3);letter-spacing:1px;}
        .place-btn:hover{transform:translateY(-3px);box-shadow:0 15px 50px rgba(16,185,129,0.4);}
        .success-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;}
        .success-box{text-align:center;padding:90px 70px;background:rgba(30,30,30,0.95);border:2px solid rgba(255,255,255,0.3);border-radius:40px;max-width:600px;box-shadow:0 30px 100px rgba(0,0,0,0.8);}
        .s-icon{font-size:110px;margin-bottom:36px;display:block;}
        .success-box h2{font-size:44px;font-weight:900;margin-bottom:18px;color:#fff;}
        .success-box p{color:#aaa;font-size:19px;line-height:1.8;margin-bottom:44px;font-weight:600;}
        .continue-btn{background:#fff;color:#0f0f0f;border:none;border-radius:18px;padding:18px 50px;font-size:19px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 32px rgba(255,255,255,0.3);}
        .continue-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(255,255,255,0.4);}
        .toast{position:fixed;bottom:40px;left:50%;transform:translateX(-50%) translateY(20px);background:#fff;color:#0f0f0f;padding:18px 36px;border-radius:50px;font-weight:900;font-size:16px;opacity:0;pointer-events:none;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);z-index:9999;box-shadow:0 12px 50px rgba(255,255,255,0.4);white-space:nowrap;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .toast.warn{background:#ef4444;color:#fff;}
        .spinner{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:28px;}
        .spin{width:64px;height:64px;border:4px solid rgba(255,255,255,0.2);border-top:4px solid #fff;border-radius:50%;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .empty{text-align:center;padding:120px 24px;}
        .empty-icon{font-size:96px;margin-bottom:24px;}
        .empty h3{font-size:32px;font-weight:900;color:#fff;margin-bottom:14px;}
        .empty p{color:#aaa;font-size:18px;font-weight:700;}
        .footer{background:rgba(20,20,20,0.9);border-top:2px solid rgba(255,255,255,0.15);padding:60px 36px;margin-top:120px;}
        .footer-inner{max-width:1300px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:28px;}
        .footer-brand{font-size:24px;font-weight:900;color:#fff;}
        .footer-links{display:flex;gap:32px;}
        .footer-link{color:#aaa;font-size:16px;font-weight:800;cursor:pointer;transition:all 0.3s;text-decoration:none;}
        .footer-link:hover{color:#fff;transform:translateY(-2px);}
        .footer-copy{color:#666;font-size:14px;width:100%;text-align:center;margin-top:28px;padding-top:28px;border-top:2px solid rgba(255,255,255,0.1);font-weight:700;}
        .promo-section{background:rgba(16,185,129,0.05);border:2px solid rgba(16,185,129,0.2);border-radius:20px;padding:24px;margin-top:20px;}
        .promo-input-group{display:flex;gap:12px;margin-bottom:12px;}
        .promo-input{flex:1;padding:14px 18px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.2);border-radius:14px;color:#fff;font-size:15px;outline:none;transition:all 0.3s;font-weight:600;}
        .promo-input:focus{border-color:#10b981;box-shadow:0 0 20px rgba(16,185,129,0.2);}
        .promo-btn{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:14px;padding:14px 28px;font-size:15px;font-weight:900;cursor:pointer;transition:all 0.3s;white-space:nowrap;}
        .promo-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(16,185,129,0.4);}
        .promo-error{color:#ef4444;font-size:14px;font-weight:700;margin-top:8px;}
        .promo-success{background:rgba(16,185,129,0.15);border:2px solid #10b981;border-radius:12px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;}
        .promo-success-text{color:#10b981;font-size:15px;font-weight:800;}
        .promo-remove{background:none;border:none;color:#ef4444;font-size:20px;cursor:pointer;transition:all 0.3s;padding:0 8px;}
        .promo-remove:hover{transform:scale(1.2);}
        .promo-available{margin-top:16px;padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.1);}
        .promo-available-title{font-size:14px;color:#aaa;font-weight:800;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;}
        .promo-item{padding:12px;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);border-radius:10px;margin-bottom:10px;}
        .promo-item:last-child{margin-bottom:0;}
        .promo-code{font-size:15px;font-weight:900;color:#10b981;margin-bottom:4px;}
        .promo-desc{font-size:13px;color:#aaa;font-weight:600;}
        .checkbox-group{display:flex;align-items:start;gap:12px;background:rgba(59,130,246,0.05);border:2px solid rgba(59,130,246,0.2);border-radius:16px;padding:18px;margin-top:20px;}
        .checkbox-input{width:22px;height:22px;cursor:pointer;margin-top:2px;}
        .checkbox-label{flex:1;color:#ddd;font-size:15px;font-weight:600;line-height:1.6;}
        .checkbox-label strong{color:#fff;font-weight:900;}
        .guest-badge{background:rgba(59,130,246,0.15);border:2px solid #3b82f6;color:#3b82f6;padding:8px 16px;border-radius:50px;font-size:13px;font-weight:800;display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;}
        @media(max-width:768px){
          .hero h1{font-size:48px;}
          .grid{grid-template-columns:repeat(2,1fr);gap:16px;}
          .f-row{flex-direction:column;}
          .cart-card{flex-wrap:wrap;gap:14px;}
          .nav{padding:0 24px;height:72px;flex-wrap:wrap;}
          .nav-center{display:none;}
          .body{padding:40px 18px;}
          .co-card{padding:28px 24px;}
          .order-box{padding:28px 24px;}
          .footer-inner{flex-direction:column;text-align:center;}
          .nav-right{gap:10px;flex-wrap:wrap;}
          .user-badge{padding:10px 16px;font-size:13px;}
          .logo-text{font-size:22px;}
          .product-emoji{font-size:32px;width:52px;height:52px;}
          .content-page{padding:60px 20px;}
          .page-title{font-size:36px;}
          .promo-input-group{flex-direction:column;}
          .reviews-grid{grid-template-columns:1fr;}
          .reviews-title{font-size:36px;}
        }
      `}</style>

      {/* Navigation */}
      <nav className="nav">
        <div className="logo" onClick={() => { setPage("shop"); setOrderDone(false); }}>
          <div className="logo-icon">🛒</div>
          <div>
            <div className="logo-text">Ghosia Mini Market</div>
            <div className="logo-sub">NEPALI & ASIAN GROCERY</div>
          </div>
        </div>

        <div className="nav-center">
          <span className="nav-link" onClick={() => { setPage("shop"); setOrderDone(false); }}>Home</span>
          <span className="nav-link" onClick={() => setPage("about")}>About Us</span>
          <span className="nav-link" onClick={() => setPage("contact")}>Contact</span>
          <span className="nav-link admin-link" onClick={() => setPage("admin-login")}>🔒 Admin</span>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <div className={`user-badge ${user.isAdmin ? "admin-badge" : ""}`}>
                👤 {user.name} {user.isAdmin && "🔒"}
              </div>
              {user.isAdmin && (
                <button className="nav-btn admin-btn" onClick={() => setPage("admin-dashboard")}>
                  ⚙️ Admin Panel
                </button>
              )}
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          ) : (
            <button className="nav-btn" onClick={() => setPage("auth")}>
                🔐 Login
            </button>
          )}
          <button className="nav-btn checkout-btn" onClick={goToCart}>
            🛒 Cart <div className="badge">{totalItems}</div>
          </button>
        </div>
      </nav>

      {/* Toast Notification */}
      {toast && <div className={`toast show ${toast.includes("⚠️") ? "warn" : ""}`}>{toast}</div>}

      {/* PRIVACY POLICY PAGE */}
      {page === "privacy" && (
        <div className="content-page">
          <h1 className="page-title">🔒 Privacy Policy</h1>
          <p className="page-subtitle">
            Last updated: February 24, 2026
          </p>

          <div className="info-card">
            <h2>📋 Introduction</h2>
            <p>
              Ghosia Mini Market ("we", "us", or "our") operates the online grocery store. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
            </p>
            <p>
              We use your data to provide and improve our service. By using our service, you agree to the collection and use of information in accordance with this policy.
            </p>

            <h3>🔍 Information We Collect</h3>
            <p>
              We collect several types of information for various purposes to provide and improve our service to you:
            </p>
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, phone number, delivery address</li>
              <li><strong>Payment Information:</strong> Credit/debit card details (processed securely through our payment partners)</li>
              <li><strong>Order Data:</strong> Purchase history, shopping cart contents, product preferences</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
            </ul>

            <h3>🎯 How We Use Your Information</h3>
            <p>
              We use the collected data for various purposes:
            </p>
            <ul>
              <li>To process and deliver your orders</li>
              <li>To send order confirmations and delivery updates</li>
              <li>To provide customer support and respond to your inquiries</li>
              <li>To improve our website and services</li>
              <li>To send promotional offers and newsletters (you can opt-out anytime)</li>
              <li>To detect and prevent fraud or unauthorized activities</li>
            </ul>

            <h3>🔐 Data Security</h3>
            <p>
              The security of your data is important to us. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p>
              However, please note that no method of transmission over the internet is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>

            <h3>🍪 Cookies</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>

            <h3>🤝 Sharing Your Information</h3>
            <p>
              We may share your personal information with:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, delivery services)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p>
              We do not sell your personal information to third parties for marketing purposes.
            </p>

            <h3>✅ Your Rights</h3>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal data we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h3>📞 Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@ghosia.com<br/>
              <strong>Phone:</strong> +44 123 456 7890<br/>
              <strong>Address:</strong> 349 High Street, West Bromwich, B70 9QG
            </p>
          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS PAGE */}
      {page === "terms" && (
        <div className="content-page">
          <h1 className="page-title">📜 Terms & Conditions</h1>
          <p className="page-subtitle">
            Last updated: February 24, 2026
          </p>

          <div className="info-card">
            <h2>📋 Agreement to Terms</h2>
            <p>
              By accessing and using Ghosia Mini Market's website and services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our service.
            </p>

            <h3>🛒 Use of Our Service</h3>
            <p>
              To use our service, you must:
            </p>
            <ul>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Use our service only for lawful purposes</li>
            </ul>

            <h3>💳 Orders and Payment</h3>
            <p>
              When you place an order with us:
            </p>
            <ul>
              <li>All prices are displayed in British Pounds (£) and include VAT where applicable</li>
              <li>We reserve the right to refuse or cancel any order at our discretion</li>
              <li>Payment must be made in full at the time of ordering</li>
              <li>We accept major credit/debit cards and other payment methods as displayed</li>
              <li>Product availability and prices are subject to change without notice</li>
            </ul>

            <h3>🚚 Delivery</h3>
            <p>
              Our delivery terms:
            </p>
            <ul>
              <li>We deliver to addresses within Birmingham and surrounding areas</li>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>You must be present to receive delivery of age-restricted products</li>
              <li>Risk of loss passes to you upon delivery</li>
              <li>We are not responsible for delays caused by factors beyond our control</li>
            </ul>

            <h3>↩️ Returns and Refunds</h3>
            <p>
              Returns policy:
            </p>
            <ul>
              <li>Fresh and perishable items cannot be returned unless faulty or damaged</li>
              <li>Non-perishable items can be returned within 14 days in original condition</li>
              <li>Contact us within 24 hours if you receive damaged or incorrect items</li>
              <li>Refunds will be processed within 7-10 business days</li>
              <li>Original delivery charges are non-refundable unless we made an error</li>
            </ul>

            <h3>🏷️ Product Information</h3>
            <p>
              We strive to provide accurate product information, but:
            </p>
            <ul>
              <li>Product images are for illustration purposes and may differ from actual items</li>
              <li>We do not warrant that product descriptions are error-free</li>
              <li>Weights and measures are approximate</li>
              <li>Check product labels for allergen and dietary information</li>
            </ul>

            <h3>🔒 Intellectual Property</h3>
            <p>
              All content on our website, including text, graphics, logos, and images, is the property of Ghosia Mini Market and protected by copyright laws. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>

            <h3>⚠️ Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by law:
            </p>
            <ul>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the value of your order</li>
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>You use our service at your own risk</li>
            </ul>

            <h3>📝 Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our service after changes constitutes acceptance of the new terms.
            </p>

            <h3>⚖️ Governing Law</h3>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h3>📞 Contact Information</h3>
            <p>
              For questions about these Terms and Conditions, contact us at:
            </p>
            <p>
              <strong>Email:</strong> info@ghosia.com<br/>
              <strong>Phone:</strong> +44 123 456 7890<br/>
              <strong>Address:</strong> 349 High Street, West Bromwich, B70 9QG
            </p>
          </div>
        </div>
      )}

      {/* CUSTOMER AUTH PAGE */}
      {page === "auth" && !user && (
        <div className="auth-wrap">
          <div className="auth-box">
            <div className="auth-header">
              <div className="auth-icon">🛒</div>
              <h2 className="auth-title">Customer Login</h2>
              <p className="auth-subtitle">
                {authMode === "login" ? "Login to your account" : "Create a new account"}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuth}>
              {authMode === "register" && (
                <div className="f-group">
                  <label className="f-label">Full Name</label>
                  <input
                    className="f-input"
                    placeholder="Your name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required={authMode === "register"}
                  />
                </div>
              )}

              <div className="f-group">
                <label className="f-label">Email</label>
                <input
                  className="f-input"
                  type="email"
                  placeholder="your@email.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="f-group">
                <label className="f-label">Password</label>
                <input
                  className="f-input"
                  type="password"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                />
              </div>

              {authMode === "register" && (
                <>
                  <div className="f-group">
                    <label className="f-label">Phone</label>
                    <input
                      className="f-input"
                      placeholder="Phone number"
                      value={authForm.phone}
                      onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                      required={authMode === "register"}
                    />
                  </div>

                  <div className="f-group">
                    <label className="f-label">Address</label>
                    <input
                      className="f-input"
                      placeholder="Delivery address"
                      value={authForm.address}
                      onChange={(e) => setAuthForm({ ...authForm, address: e.target.value })}
                      required={authMode === "register"}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="auth-btn" disabled={authLoading}>
                {authLoading ? "⏳ Wait..." : authMode === "login" ? "🚀 Login" : "✨ Register"}
              </button>
            </form>

            <div className="auth-switch">
              {authMode === "login" ? (
                <span>
                  New here?{" "}
                  <a onClick={() => setAuthMode("register")}>Create account</a>
                </span>
              ) : (
                <span>
                  Have account?{" "}
                  <a onClick={() => setAuthMode("login")}>Login</a>
                </span>
              )}
            </div>

            <div className="auth-divider">───</div>

            <div className="auth-switch">
              <span>
                Admin?{" "}
                <a onClick={() => setPage("admin-login")} style={{color: "#ef4444"}}>Login here →</a>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN PAGE */}
      {page === "admin-login" && !user && (
        <div className="auth-wrap">
          <div className="auth-box admin-auth-box">
            <div className="auth-header">
              <div className="auth-icon">🔒</div>
              <h2 className="auth-title admin-title">Admin Login</h2>
              <p className="auth-subtitle">
                Restricted access for administrators
              </p>
            </div>

            <form onSubmit={handleAdminLogin}>
              <div className="f-group">
                <label className="f-label">Email</label>
                <input
                  className="f-input"
                  type="email"
                  placeholder="admin@ghosia.com"
                  value={adminLoginForm.email}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="f-group">
                <label className="f-label">Password</label>
                <input
                  className="f-input"
                  type="password"
                  placeholder="••••••••"
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="auth-btn admin-login-btn" disabled={adminLoginLoading}>
                {adminLoginLoading ? "⏳ Authenticating..." : "🔐 Admin Login"}
              </button>
            </form>

            <div className="auth-divider">───</div>

            <div className="auth-switch">
              <span>
                Customer?{" "}
                <a onClick={() => setPage("auth")}>Login here →</a>
              </span>
            </div>

            <div style={{marginTop: "30px", padding: "16px", background: "rgba(239,68,68,0.1)", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.3)"}}>
              <p style={{fontSize: "13px", color: "#aaa", textAlign: "center", marginBottom: "8px", fontWeight: "700"}}>🔒 TEST CREDENTIALS</p>
              <p style={{fontSize: "14px", color: "#fff", textAlign: "center", fontWeight: "600"}}>Email: <strong>admin@ghosia.com</strong></p>
              <p style={{fontSize: "14px", color: "#fff", textAlign: "center", fontWeight: "600"}}>Pass: <strong>admin123</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Main Shop Page - Keep all existing shop code */}

      {/* CONTACT PAGE */}
      {page === "contact" && (
        <div className="content-page">
          <h1 className="page-title">📍 Contact Us</h1>
          <p className="page-subtitle">
            Visit us or get in touch. We're here to help with all your grocery needs!
          </p>

          <div className="info-card">
            <h2>🏪 Store Location</h2>
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <div className="info-label">Address</div>
                <div className="info-value">349 High Street, West Bromwich, B70 9QG</div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <div className="info-label">Phone</div>
                <div className="info-value"><a href="tel:+441234567890">+44 123 456 7890</a></div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <div className="info-label">Email</div>
                <div className="info-value"><a href="mailto:info@ghosia.com">info@ghosia.com</a></div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">🕐</div>
              <div className="info-content">
                <div className="info-label">Opening Hours</div>
                <div className="info-value">Mon-Sat: 8:00 AM - 9:00 PM<br/>Sunday: 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT PAGE */}
      {page === "about" && (
        <div className="content-page">
          <h1 className="page-title">🛒 About Us</h1>
          <p className="page-subtitle">
            Your trusted source for authentic Nepali and Asian groceries in Birmingham.
          </p>

          <div className="info-card">
            <h2>📖 Our Story</h2>
            <p>
              Ghosia Mini Market is Birmingham's premier destination for authentic Nepali and Asian groceries. 
              We pride ourselves on offering fresh vegetables, premium spices, and traditional products that 
              bring the taste of home to your kitchen.
            </p>
            <p>
              Located in the heart of West Bromwich, we serve the local community with quality products at 
              competitive prices. Our friendly staff is always ready to help you find exactly what you need.
            </p>
          </div>

          <div className="info-card">
            <h2>✨ What We Offer</h2>
            <p>
              • Fresh vegetables and fruits<br/>
              • Authentic Nepali and Asian spices<br/>
              • Rice, grains, and pulses<br/>
              • Dairy products and beverages<br/>
              • Meat and poultry<br/>
              • Canned goods and frozen items
            </p>
          </div>
        </div>
      )}
      
      {page === "shop" && !orderDone && (
        <>
          <div className="hero">
            <div className="hero-badge">
              FRESH & AUTHENTIC
            </div>
            <h1>Your Nepali & Asian Grocery Store</h1>
            <p className="hero-sub">
              Authentic Nepali and Asian products, fresh vegetables, premium spices in Birmingham.
            </p>
            <div className="search-wrap">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="body">
            <div className="cat-row">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`cat-btn ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="spinner">
                <div className="spin"></div>
                <span style={{ color: "#aaa", fontWeight: 800 }}>Loading...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📦</div>
                <h3>No Products Found</h3>
                <p>Try different search or category.</p>
              </div>
            ) : (
              <>
                <div className="section-header">
                  <h2 className="section-title">Products</h2>
                  <div className="section-count">{filtered.length} items</div>
                </div>
                <div className="grid">
                  {filtered.map((p) => {
                    const qty = cartQtyForProduct(p._id);
                    return (
                      <div key={p._id} className="card">
                        {qty > 0 && <div className="in-cart-badge">{qty}</div>}
                        <div className="card-thumb">
                          <div className="product-emoji">{PRODUCT_EMOJIS[p.name] || "🛒"}</div>
                          <img src={getProductImage(p)} alt={p.name} />
                        </div>
                        <div className="card-body">
                          <div className="card-cat">{p.category}</div>
                          <div className="card-name">{p.name}</div>
                          <div className="card-foot">
                            <div className="card-price">£{p.price.toFixed(2)}</div>
                            <button className="add-btn" onClick={() => addToCart(p)}>
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Reviews - Keep existing review section */}
          <div className="reviews-section">
            <div className="reviews-header">
              <h2 className="reviews-title">
                <span>⭐</span>
                Customer Reviews
                <span>⭐</span>
              </h2>
              <p className="reviews-subtitle">
                See what customers are saying about us!
              </p>
              <button 
                className="nav-btn checkout-btn" 
                onClick={() => setShowReviewForm(!showReviewForm)}
                style={{ marginTop: "20px" }}
              >
                {showReviewForm ? "✕ Cancel" : "⭐ Write a Review"}
              </button>
            </div>

            {showReviewForm && (
              <div className="review-form-card">
                <h3 className="review-form-header">Share Your Experience</h3>
                <p className="review-form-subtitle">We'd love to hear from you!</p>
                <form onSubmit={handleSubmitReview}>
                  <div className="f-group">
                    <label className="f-label">Your Name</label>
                    <input
                      className="f-input"
                      placeholder="Enter your name"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="f-group">
                    <label className="f-label">Rating</label>
                    <select
                      className="f-select"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      required
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                      <option value="4">⭐⭐⭐⭐ Very Good</option>
                      <option value="3">⭐⭐⭐ Good</option>
                      <option value="2">⭐⭐ Fair</option>
                      <option value="1">⭐ Poor</option>
                    </select>
                  </div>

                  <div className="f-group">
                    <label className="f-label">Your Review</label>
                    <textarea
                      className="f-textarea"
                      placeholder="Tell us about your experience..."
                      value={reviewForm.review}
                      onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="auth-btn submit-review-btn">
                    ✨ Submit Review
                  </button>
                </form>
              </div>
            )}

            <div className="reviews-grid">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <h3>{review.name}</h3>
                      <p className="review-date">{review.date}</p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                  <p className="review-text">{review.review}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CART PAGE - Keep existing cart code */}
      {page === "cart" && (
        <div className="checkout-wrap">
          <button className="back-btn" onClick={() => setPage("shop")}>
            ← Continue Shopping
          </button>

          <h1 className="page-title">
            <span>🛒</span>
            Shopping Cart
          </h1>
          <p className="page-subtitle">
            Review your items before checkout
          </p>

          {cart.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some products to get started!</p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item._id} className="cart-card">
                  <div className="cart-thumb">
                    <img src={getProductImage(item)} alt={item.name} />
                  </div>
                  <div className="cart-info">
                    <div className="cart-name">{item.name}</div>
                    <div className="cart-cat">{item.category}</div>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => changeQty(item._id, -1)}>
                      −
                    </button>
                    <div className="qty-num">{item.qty}</div>
                    <button className="qty-btn" onClick={() => changeQty(item._id, 1)}>
                      +
                    </button>
                  </div>
                  <div className="cart-price">£{(item.price * item.qty).toFixed(2)}</div>
                  <button className="del-btn" onClick={() => removeFromCart(item._id)}>
                    🗑
                  </button>
                </div>
              ))}

              <div className="promo-section">
                <h4 style={{fontSize: "18px", fontWeight: "900", color: "#fff", marginBottom: "16px"}}>🎫 Promo Code</h4>
                {!appliedPromo ? (
                  <>
                    <div className="promo-input-group">
                      <input
                        className="promo-input"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError("");
                        }}
                      />
                      <button className="promo-btn" onClick={applyPromoCode}>
                        Apply
                      </button>
                    </div>
                    {promoError && <div className="promo-error">❌ {promoError}</div>}
                    
                    <div className="promo-available">
                      <div className="promo-available-title">📌 Available Codes:</div>
                      {Object.entries(PROMO_CODES).map(([code, details]) => (
                        <div key={code} className="promo-item">
                          <div className="promo-code">{code}</div>
                          <div className="promo-desc">{details.description}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="promo-success">
                    <span className="promo-success-text">
                      🎉 {appliedPromo.description}
                    </span>
                    <button className="promo-remove" onClick={removePromoCode}>
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="order-box">
                <div className="order-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && discount > 0 && (
                  <div className="order-row">
                    <span>Discount ({appliedPromo.type === "percentage" ? `${appliedPromo.discount}%` : `£${appliedPromo.discount}`})</span>
                    <span className="discount">−£{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="order-row">
                  <span>Shipping</span>
                  <span className="free">FREE</span>
                </div>
                <div className="order-total">
                  <span>Total</span>
                  <span>£{total}</span>
                </div>
                <button className="go-checkout" onClick={goToCheckout}>
                  Proceed to Checkout 🚀
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* CHECKOUT PAGE - Keep existing checkout code */}
      {page === "checkout" && (
        <div className="checkout-wrap">
          <button className="back-btn" onClick={() => setPage("cart")}>
            ← Back to Cart
          </button>

          <h1 className="page-title">
            <span>💳</span>
            Checkout
          </h1>

          {!user && (
            <div className="guest-badge">
              👤 Checking out as guest
            </div>
          )}

          <div className="co-card">
            <h3>📦 Shipping Information</h3>
            <div className="f-row">
              <div className="f-group" style={{flex:1}}>
                <label className="f-label">Full Name</label>
                <input className="f-input" placeholder="John Doe" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="f-group" style={{flex:1}}>
                <label className="f-label">Email</label>
                <input className="f-input" type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="f-group">
              <label className="f-label">Delivery Address</label>
              <input className="f-input" placeholder="123 Main St, Birmingham" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
            </div>
            <div className="f-group">
              <label className="f-label">Phone Number</label>
              <input className="f-input" placeholder="0121 123 4567" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            </div>

            {!user && (
              <div className="checkbox-group">
                <input type="checkbox" className="checkbox-input" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                <label className="checkbox-label">
                  <strong>Create an account</strong> for faster checkout next time (optional)
                </label>
              </div>
            )}

            {createAccount && !user && (
              <div className="f-group" style={{marginTop: "20px"}}>
                <label className="f-label">Create Password</label>
                <input className="f-input" type="password" placeholder="••••••••" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} />
              </div>
            )}
          </div>

          <div className="co-card">
            <h3>💳 Payment Information</h3>
            <div className="f-group">
              <label className="f-label">Card Number</label>
              <input className="f-input" placeholder="1234 5678 9012 3456" value={form.card} onChange={(e) => setForm({...form, card: e.target.value})} />
            </div>
            <div className="f-row">
              <div className="f-group" style={{flex:1}}>
                <label className="f-label">Expiry Date</label>
                <input className="f-input" placeholder="MM/YY" value={form.expiry} onChange={(e) => setForm({...form, expiry: e.target.value})} />
              </div>
              <div className="f-group" style={{flex:1}}>
                <label className="f-label">CVV</label>
                <input className="f-input" placeholder="123" value={form.cvv} onChange={(e) => setForm({...form, cvv: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="co-card">
            <h3>📋 Order Summary</h3>
            {cart.map((item) => (
              <div key={item._id} className="summary-item">
                <span>{item.name} x {item.qty}</span>
                <span>£{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-item">
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            {appliedPromo && discount > 0 && (
              <div className="summary-item">
                <span>Discount</span>
                <span className="discount">−£{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-item">
              <span>Shipping</span>
              <span className="free">FREE</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>£{total}</span>
            </div>
          </div>

          <button className="place-btn" onClick={placeOrder}>
            Place Order 🚀
          </button>
        </div>
      )}

      {/* Success Page */}
      {orderDone && (
        <div className="success-wrap">
          <div className="success-box">
            <span className="s-icon">🎉</span>
            <h2>Order Placed!</h2>
            <p>
              Thank you for your order! We'll process it soon and notify you when it's ready.
            </p>
            <button className="continue-btn" onClick={() => { setOrderDone(false); setPage("shop"); }}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Ghosia Mini Market 🛒</div>
          <div className="footer-links">
            <span className="footer-link" onClick={() => setPage("privacy")}>Privacy Policy</span>
            <span className="footer-link" onClick={() => setPage("terms")}>Terms & Conditions</span>
          </div>
          <div className="footer-copy">
            © 2026 Ghosia Mini Market. Nepali & Asian grocery in Birmingham.
          </div>
        </div>
      </footer>
    </div>
  );
}