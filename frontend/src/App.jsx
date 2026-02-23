import { useEffect, useState } from "react";

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
  const [authMode, setAuthMode] = useState("login"); // login, register, admin
  const [authLoading, setAuthLoading] = useState(false);

  // Guest checkout states
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");

  // Promo code states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  // Admin states
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", price: "", category: "", stock: 100, image: "" });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adminTab, setAdminTab] = useState("products");

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, review: "", date: "" });

  // Orders/Sales states
  const [orders, setOrders] = useState([
    { id: "ORD001", customerName: "John Doe", total: 45.99, items: 5, status: "Completed", date: "2026-02-20" },
    { id: "ORD002", customerName: "Jane Smith", total: 78.50, items: 8, status: "Completed", date: "2026-02-21" },
    { id: "ORD003", customerName: "Bob Wilson", total: 32.25, items: 3, status: "Pending", date: "2026-02-22" },
    { id: "ORD004", customerName: "Alice Brown", total: 156.80, items: 12, status: "Completed", date: "2026-02-22" },
    { id: "ORD005", customerName: "Charlie Davis", total: 91.40, items: 7, status: "Completed", date: "2026-02-22" },
  ]);

  const PROMO_CODES = {
    "WELCOME10": { discount: 10, type: "percentage", description: "10% off your order" },
    "SAVE5": { discount: 5, type: "fixed", description: "£5 off your order" },
    "FREESHIP": { discount: 0, type: "shipping", description: "Free shipping (already free!)" },
    "FIRST20": { discount: 20, type: "percentage", description: "20% off first order" },
  };

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

  useEffect(() => {
    localStorage.setItem('ghosia_reviews', JSON.stringify(reviews));
  }, [reviews]);

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

    const newOrder = {
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      customerName: form.name,
      total: parseFloat(total),
      items: totalItems,
      status: "Pending",
      date: new Date().toISOString().split('T')[0]
    };
    setOrders([...orders, newOrder]);

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

  async function handleAuth(e) {
    e.preventDefault(); 
    setAuthLoading(true);
    
    // Determine endpoint based on auth mode
    let endpoint, body;
    
    if (authMode === "admin") {
      // Admin login - only email and password
      endpoint = "/auth/login";
      body = { email: authForm.email, password: authForm.password };
    } else if (authMode === "register") {
      // Customer registration
      endpoint = "/auth/register";
      body = authForm;
    } else {
      // Customer login
      endpoint = "/auth/login";
      body = { email: authForm.email, password: authForm.password };
    }
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token); 
        setUser(data.user); 
        
        // Redirect admin to admin panel, customers to shop
        if (data.user.isAdmin) {
          setPage('admin');
          setAdminTab('dashboard');
        } else {
          setPage('shop');
        }
        
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

  function handleLogout() { 
    localStorage.removeItem('token'); 
    setUser(null); 
    setPage('shop'); 
    showToast("👋 Logged out successfully"); 
  }

  async function handleImageUpload(e, isEdit = false) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('⚠️ Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Image must be less than 5MB'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/admin/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData });
      const data = await res.json();
      if (data.imageUrl) {
        if (isEdit) { setEditingProduct({ ...editingProduct, image: data.imageUrl }); }
        else { setProductForm({ ...productForm, image: data.imageUrl }); }
        showToast('✅ Image uploaded successfully!');
      } else { showToast('⚠️ ' + (data.error || 'Upload failed')); }
    } catch (error) { console.error('Upload error:', error); showToast('⚠️ Failed to upload image'); }
    setUploading(false);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(productForm) });
      const data = await res.json();
      if (!data.error) { showToast("✅ Product added successfully!"); setProductForm({ name: "", price: "", category: "", stock: 100, image: "" }); setShowAddProduct(false); loadProducts(); }
      else { showToast(`⚠️ ${data.error}`); }
    } catch (error) { showToast("⚠️ Failed to add product"); }
  }

  async function handleUpdateProduct(product) {
    try {
      const res = await fetch(`${API_URL}/admin/products/${product._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(product) });
      const data = await res.json();
      if (!data.error) { showToast("✅ Product updated successfully!"); setEditingProduct(null); loadProducts(); }
      else { showToast(`⚠️ ${data.error}`); }
    } catch (error) { showToast("⚠️ Failed to update product"); }
  }

  async function handleDeleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (data.success) { showToast("✅ Product deleted successfully!"); loadProducts(); }
      else { showToast(`⚠️ ${data.error}`); }
    } catch (error) { showToast("⚠️ Failed to delete product"); }
  }

  function handleAddReview(e) {
    e.preventDefault();
    const newReview = {
      id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
      name: reviewForm.name,
      rating: parseInt(reviewForm.rating),
      date: reviewForm.date || "Just now",
      review: reviewForm.review
    };
    setReviews([...reviews, newReview]);
    setReviewForm({ name: "", rating: 5, review: "", date: "" });
    setShowAddReview(false);
    showToast("✅ Review added successfully!");
  }

  function handleUpdateReview(review) {
    setReviews(reviews.map(r => r.id === review.id ? review : r));
    setEditingReview(null);
    showToast("✅ Review updated successfully!");
  }

  function handleDeleteReview(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setReviews(reviews.filter(r => r.id !== id));
    showToast("✅ Review deleted successfully!");
  }

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

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === "Completed").length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  // Continue in next part due to character limit...
  return (
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif", background:"#0f0f0f", minHeight:"100vh", color:"#fff"}}>
      {/* Styles and remaining components from main branch */}
    </div>
  );
}