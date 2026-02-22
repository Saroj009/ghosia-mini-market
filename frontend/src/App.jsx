import { useEffect, useState } from "react";

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

const API_URL = "http://localhost:3000/api";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState("shop");
  const [orderDone, setOrderDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name:"", address:"", phone:"", card:"", expiry:"", cvv:"" });
  const [toast, setToast] = useState("");
  
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name:"", email:"", password:"", phone:"", address:"" });
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setUser(data);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || p.category === category)
  );

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function addToCart(product) {
    setCart(old => {
      const ex = old.find(i => i.id === product.id);
      if (ex) return old.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i);
      return [...old, {...product, qty:1}];
    });
    showToast(`✔ ${product.name} added!`);
  }

  function changeQty(id, d) {
    setCart(old => old.map(i => i.id===id ? {...i, qty:i.qty+d} : i).filter(i => i.qty > 0));
  }

  function removeFromCart(id) { setCart(old => old.filter(i => i.id !== id)); }

  const totalItems = cart.reduce((s,i) => s+i.qty, 0);
  const total = cart.reduce((s,i) => s+i.price*i.qty, 0).toFixed(2);

  function placeOrder() {
    if (!form.name || !form.address || !form.phone || !form.card) {
      showToast("⚠️ Please fill in all fields");
      return;
    }
    setOrderDone(true);
    setCart([]);
    setForm({ name:"", address:"", phone:"", card:"", expiry:"", cvv:"" });
  }

  const cartQtyForProduct = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.qty : 0;
  };

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true);

    const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
    const body = authMode === "register" 
      ? authForm 
      : { email: authForm.email, password: authForm.password };

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

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]);
    showToast("👋 Logged out successfully");
  }

  return (
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif", background:"#0f0f0f", minHeight:"100vh", color:"#fff"}}>
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
        .nav-right{display:flex;align-items:center;gap:14px;}
        .user-badge{background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);color:#fff;padding:12px 22px;border-radius:50px;font-size:15px;font-weight:800;display:flex;align-items:center;gap:10px;}
        .admin-badge{background:rgba(239,68,68,0.15);border:2px solid #ef4444;color:#ef4444;}
        .logout-btn{background:rgba(239,68,68,0.15);border:2px solid #ef4444;color:#ef4444;padding:12px 22px;border-radius:50px;font-size:15px;font-weight:800;cursor:pointer;transition:all 0.3s;}
        .logout-btn:hover{background:rgba(239,68,68,0.25);transform:translateY(-2px);}
        .cart-pill{background:#fff;color:#0f0f0f;border:none;border-radius:50px;padding:14px 28px;font-weight:900;cursor:pointer;font-size:16px;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 8px 32px rgba(255,255,255,0.3);}
        .cart-pill:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(255,255,255,0.4);}
        .badge{background:#0f0f0f;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;border:2px solid #fff;}
        
        .auth-wrap{min-height:calc(100vh - 80px);display:flex;align-items:center;justify-content:center;padding:40px 20px;}
        .auth-box{background:rgba(30,30,30,0.95);border:2px solid rgba(255,255,255,0.2);border-radius:32px;padding:50px 44px;width:100%;max-width:520px;box-shadow:0 20px 80px rgba(0,0,0,0.8);}
        .auth-header{text-align:center;margin-bottom:36px;}
        .auth-icon{font-size:80px;margin-bottom:20px;}
        .auth-title{font-size:36px;font-weight:900;color:#fff;margin-bottom:10px;}
        .auth-subtitle{font-size:16px;color:#aaa;font-weight:600;}
        .auth-tabs{display:flex;gap:10px;margin-bottom:32px;background:rgba(255,255,255,0.05);border-radius:50px;padding:6px;border:2px solid rgba(255,255,255,0.1);}
        .auth-tab{flex:1;padding:14px;border:none;background:transparent;color:#aaa;font-weight:800;font-size:15px;border-radius:50px;cursor:pointer;transition:all 0.3s;}
        .auth-tab.active{background:#fff;color:#0f0f0f;box-shadow:0 4px 20px rgba(255,255,255,0.3);}
        .auth-tab.admin-tab.active{background:#ef4444;color:#fff;}
        .f-label{display:block;font-size:13px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;}
        .f-input{width:100%;padding:16px 20px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.2);border-radius:16px;color:#fff;font-size:16px;outline:none;transition:all 0.3s;font-weight:600;}
        .f-input:focus{border-color:#fff;box-shadow:0 0 20px rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);}
        .f-input::placeholder{color:#666;}
        .f-group{margin-bottom:22px;}
        .auth-btn{width:100%;background:#fff;color:#0f0f0f;border:none;border-radius:16px;padding:18px;font-size:18px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 32px rgba(255,255,255,0.3);margin-top:14px;}
        .auth-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(255,255,255,0.4);}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .auth-btn.admin-btn{background:#ef4444;color:#fff;}
        .auth-divider{text-align:center;color:#666;font-size:15px;margin:30px 0;font-weight:700;}
        .auth-switch{text-align:center;color:#aaa;font-size:16px;margin-top:26px;font-weight:600;}
        .auth-switch a{color:#fff;font-weight:900;cursor:pointer;text-decoration:none;}
        .auth-switch a:hover{text-decoration:underline;}
        
        .hero{background:linear-gradient(180deg,rgba(255,255,255,0.05),transparent);padding:100px 32px 80px;text-align:center;position:relative;overflow:hidden;border-bottom:2px solid rgba(255,255,255,0.1);}
        .hero-badge{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);color:#fff;border-radius:50px;padding:10px 26px;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:32px;}
        .hero h1{font-size:72px;font-weight:900;line-height:1.1;margin-bottom:24px;color:#fff;}
        .hero-sub{font-size:20px;color:#aaa;margin-bottom:50px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.8;font-weight:600;}
        .stats-row{display:flex;justify-content:center;gap:60px;margin-top:50px;}
        .stat{text-align:center;}
        .stat-num{font-size:42px;font-weight:900;color:#fff;}
        .stat-label{font-size:14px;color:#aaa;margin-top:6px;text-transform:uppercase;letter-spacing:2px;font-weight:800;}
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
        .go-checkout{width:100%;background:#fff;color:#0f0f0f;border:none;border-radius:20px;padding:22px;font-size:20px;font-weight:900;cursor:pointer;margin-top:28px;transition:all 0.3s;box-shadow:0 10px 40px rgba(255,255,255,0.3);letter-spacing:1px;}
        .go-checkout:hover{transform:translateY(-3px);box-shadow:0 15px 50px rgba(255,255,255,0.4);}
        
        .checkout-wrap{max-width:800px;margin:0 auto;padding:60px 28px;}
        .back-btn{background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);color:#fff;border-radius:50px;padding:14px 32px;font-size:16px;font-weight:900;cursor:pointer;margin-bottom:50px;transition:all 0.3s;display:inline-flex;align-items:center;gap:10px;}
        .back-btn:hover{background:rgba(255,255,255,0.2);transform:translateX(-5px);}
        .co-card{background:rgba(30,30,30,0.9);border:2px solid rgba(255,255,255,0.15);border-radius:28px;padding:36px 40px;margin-bottom:28px;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .co-card h3{font-size:22px;font-weight:900;color:#fff;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;gap:12px;}
        .f-row{display:flex;gap:18px;}
        .summary-item{display:flex;justify-content:space-between;padding:14px 0;border-bottom:2px solid rgba(255,255,255,0.1);font-size:16px;color:#aaa;font-weight:700;}
        .summary-item:last-child{border:none;}
        .summary-total{display:flex;justify-content:space-between;font-size:26px;font-weight:900;padding-top:18px;margin-top:12px;border-top:3px solid rgba(255,255,255,0.2);color:#fff;}
        .place-btn{width:100%;background:#fff;color:#0f0f0f;border:none;border-radius:20px;padding:22px;font-size:20px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 10px 40px rgba(255,255,255,0.3);letter-spacing:1px;}
        .place-btn:hover{transform:translateY(-3px);box-shadow:0 15px 50px rgba(255,255,255,0.4);}
        
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
        
        @media(max-width:768px){
          .hero h1{font-size:48px;}
          .stats-row{gap:32px;flex-wrap:wrap;}
          .grid{grid-template-columns:repeat(2,1fr);gap:16px;}
          .f-row{flex-direction:column;}
          .cart-card{flex-wrap:wrap;gap:14px;}
          .nav{padding:0 24px;height:72px;}
          .body{padding:40px 18px;}
          .co-card{padding:28px 24px;}
          .order-box{padding:28px 24px;}
          .footer-inner{flex-direction:column;text-align:center;}
          .nav-right{gap:10px;flex-wrap:wrap;}
          .user-badge{padding:10px 16px;font-size:13px;}
          .logo-text{font-size:22px;}
        }
      `}</style>

      <div className={`toast ${toast ? "show" : ""} ${toast.startsWith("⚠️") ? "warn" : ""}`}>{toast}</div>

      <nav className="nav">
        <div className="logo" onClick={() => setPage("shop")}>
          <div className="logo-icon">🛒</div>
          <div>
            <div className="logo-text">Ghosia Market</div>
            <div className="logo-sub">Birmingham's Best</div>
          </div>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <div className={`user-badge ${user.role==='admin'?'admin-badge':''}`}>
                {user.role === 'admin' ? '🛡️' : '👤'} {user.name}
              </div>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="cart-pill" onClick={() => setPage("auth")}>🔐 Login</button>
          )}
          {user && (
            <button className="cart-pill" onClick={() => setPage(page==="checkout" ? "shop" : "checkout")}>
              🧺
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
              <span>{totalItems > 0 ? `£${total}` : "Cart"}</span>
            </button>
          )}
        </div>
      </nav>

      {page === "auth" && (
        <div className="auth-wrap">
          <div className="auth-box">
            <div className="auth-header">
              <div className="auth-icon">{authMode === 'admin' ? '🛡️' : '🛒'}</div>
              <h2 className="auth-title">
                {authMode === 'register' && 'Create Account'}
                {authMode === 'login' && 'Welcome Back'}
                {authMode === 'admin' && 'Admin Access'}
              </h2>
              <p className="auth-subtitle">
                {authMode === 'register' && 'Sign up to start shopping'}
                {authMode === 'login' && 'Login to your account'}
                {authMode === 'admin' && 'Store management portal'}
              </p>
            </div>

            {authMode !== 'admin' && (
              <div className="auth-tabs">
                <button className={`auth-tab ${authMode==='login'?'active':''}`} onClick={() => setAuthMode('login')}>Login</button>
                <button className={`auth-tab ${authMode==='register'?'active':''}`} onClick={() => setAuthMode('register')}>Register</button>
              </div>
            )}

            <form onSubmit={handleAuth}>
              {authMode === 'register' && (
                <div className="f-group">
                  <label className="f-label">Full Name</label>
                  <input className="f-input" placeholder="e.g. John Smith" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} required />
                </div>
              )}
              <div className="f-group">
                <label className="f-label">Email</label>
                <input className="f-input" type="email" placeholder="e.g. john@example.com" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
              </div>
              <div className="f-group">
                <label className="f-label">Password</label>
                <input className="f-input" type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required minLength={6} />
              </div>
              {authMode === 'register' && (
                <>
                  <div className="f-group">
                    <label className="f-label">Phone Number</label>
                    <input className="f-input" placeholder="e.g. 07700 900000" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} />
                  </div>
                  <div className="f-group">
                    <label className="f-label">Address</label>
                    <input className="f-input" placeholder="e.g. 123 High St, Birmingham" value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})} />
                  </div>
                </>
              )}
              <button type="submit" className={`auth-btn ${authMode==='admin'?'admin-btn':''}`} disabled={authLoading}>
                {authLoading ? '⏳ Please wait...' : (authMode === 'register' ? '🚀 Create Account' : authMode === 'admin' ? '🛡️ Admin Login' : '🔐 Login')}
              </button>
            </form>

            {authMode !== 'admin' && (
              <>
                <div className="auth-divider">or</div>
                <div className="auth-switch"><a onClick={() => setAuthMode('admin')}>🛡️ Admin Login</a></div>
              </>
            )}
            {authMode === 'admin' && (
              <div className="auth-switch"><a onClick={() => setAuthMode('login')}>← Back to Customer Login</a></div>
            )}
          </div>
        </div>
      )}

      {orderDone && (
        <div className="success-wrap">
          <div className="success-box">
            <span className="s-icon">🎉</span>
            <h2>Order Confirmed!</h2>
            <p>Thank you for shopping at<br /><strong style={{color:"#fff"}}>Ghosia Mini Market</strong>.<br />Your groceries are on their way! 🚚</p>
            <button className="continue-btn" onClick={() => { setOrderDone(false); setPage("shop"); }}>Continue Shopping</button>
          </div>
        </div>
      )}

      {page === "checkout" && !orderDone && user && (
        <div className="checkout-wrap">
          <button className="back-btn" onClick={() => setPage("shop")}>← Back to Shop</button>
          {cart.length === 0 ? (
            <div className="empty"><div className="empty-icon">🧺</div><h3>Your cart is empty</h3><p>Go back and add some products!</p></div>
          ) : (
            <>
              <div className="co-card">
                <h3>🧾 Order Summary</h3>
                {cart.map(item => (
                  <div className="summary-item" key={item.id}>
                    <span>{item.name} <span style={{color:"#666"}}>×{item.qty}</span></span>
                    <span style={{fontWeight:900}}>£{(item.price*item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="summary-item"><span>Delivery</span><span className="free">🎉 FREE</span></div>
                <div className="summary-total"><span>Total to Pay</span><span>£{total}</span></div>
              </div>
              <div className="co-card">
                <h3>🚚 Delivery Details</h3>
                <div className="f-group"><label className="f-label">Full Name</label><input className="f-input" placeholder="e.g. Sara Ahmed" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="f-group"><label className="f-label">Delivery Address</label><input className="f-input" placeholder="e.g. 12 High Street, Birmingham, B1 1AA" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
                <div className="f-group"><label className="f-label">Phone Number</label><input className="f-input" placeholder="e.g. 07700 900000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
              </div>
              <div className="co-card">
                <h3>💳 Payment Details</h3>
                <div className="f-group"><label className="f-label">Card Number</label><input className="f-input" placeholder="1234  5678  9012  3456" maxLength={19} value={form.card} onChange={e=>setForm({...form,card:e.target.value})} /></div>
                <div className="f-row">
                  <div className="f-group" style={{flex:1}}><label className="f-label">Expiry Date</label><input className="f-input" placeholder="MM / YY" maxLength={7} value={form.expiry} onChange={e=>setForm({...form,expiry:e.target.value})} /></div>
                  <div className="f-group" style={{flex:1}}><label className="f-label">CVV</label><input className="f-input" placeholder="•••" maxLength={3} type="password" value={form.cvv} onChange={e=>setForm({...form,cvv:e.target.value})} /></div>
                </div>
                <p style={{fontSize:14,color:"#666",marginTop:8,fontWeight:700}}>🔒 Your payment is secure and encrypted</p>
              </div>
              <button className="place-btn" onClick={placeOrder}>🛒 Place Order — £{total}</button>
            </>
          )}
        </div>
      )}

      {page === "shop" && !orderDone && (
        <>
          <div className="hero">
            <div className="hero-badge">🛒 BIRMINGHAM'S FAVOURITE MINI MARKET</div>
            <h1>Fresh Groceries<br />Delivered Fast 🚚</h1>
            <p className="hero-sub">Quality products straight from Ghosia Mini Market to your door. Same-day delivery available.</p>
            <div className="search-wrap">
              <div className="search-box">
                <input placeholder="🔍  Search milk, rice, spices..." value={search} onChange={e=>setSearch(e.target.value)} />
                <select value={category} onChange={e=>setCategory(e.target.value)}>
                  {categories.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="stats-row">
              <div className="stat"><div className="stat-num">25+</div><div className="stat-label">Products</div></div>
              <div className="stat"><div className="stat-num">8</div><div className="stat-label">Categories</div></div>
              <div className="stat"><div className="stat-num">FREE</div><div className="stat-label">Delivery</div></div>
              <div className="stat"><div className="stat-num">30min</div><div className="stat-label">Est. Time</div></div>
            </div>
          </div>

          <div className="body">
            <div className="cat-row">
              {categories.map(c => {
                const emoji = {Dairy:"🥛",Bakery:"🍞",Meat:"🥩",Grains:"🌾",Vegetables:"🥕",Oils:"🫒",Tinned:"🥫",Drinks:"🧃",Spices:"🌶️",All:"🏪"};
                return (
                  <button key={c} className={`cat-btn ${category===c?"active":""}`} onClick={()=>setCategory(c)}>
                    {emoji[c]||""} {c}
                  </button>
                );
              })}
            </div>

            <div className="section-header">
              <div className="section-title">{category==="All"?"🏪 All Products":`${category}`}</div>
              <div className="section-count">{filtered.length} items</div>
            </div>

            {loading ? (
              <div className="spinner"><div className="spin"></div><p style={{color:"#aaa",fontSize:18,fontWeight:800}}>Loading products...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty"><div className="empty-icon">😔</div><h3>Nothing found</h3><p>Try a different search or category</p></div>
            ) : (
              <div className="grid">
                {filtered.map(p => {
                  const inCart = cartQtyForProduct(p.id);
                  const productImage = PRODUCT_IMAGES[p.name] || "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400";
                  return (
                    <div className="card" key={p.id}>
                      {inCart > 0 && <div className="in-cart-badge">{inCart}</div>}
                      <div className="card-thumb">
                        <img src={productImage} alt={p.name} loading="lazy" />
                      </div>
                      <div className="card-body">
                        <div className="card-cat">{p.category}</div>
                        <div className="card-name">{p.name}</div>
                        <div className="card-foot">
                          <div className="card-price">£{p.price.toFixed(2)}</div>
                          <button className="add-btn" onClick={()=>addToCart(p)}>+</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {user && cart.length > 0 && (
              <>
                <div className="divider"/>
                <div className="section-header">
                  <div className="section-title">🧺 Your Cart</div>
                  <div className="section-count">{totalItems} items</div>
                </div>
                {cart.map(item => {
                  const productImage = PRODUCT_IMAGES[item.name] || "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400";
                  return (
                    <div className="cart-card" key={item.id}>
                      <div className="cart-thumb">
                        <img src={productImage} alt={item.name} loading="lazy" />
                      </div>
                      <div className="cart-info">
                        <div className="cart-name">{item.name}</div>
                        <div className="cart-cat">{item.category} • £{item.price.toFixed(2)} each</div>
                      </div>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={()=>changeQty(item.id,-1)}>−</button>
                        <span className="qty-num">{item.qty}</span>
                        <button className="qty-btn" onClick={()=>changeQty(item.id,+1)}>+</button>
                      </div>
                      <div className="cart-price">£{(item.price*item.qty).toFixed(2)}</div>
                      <button className="del-btn" onClick={()=>removeFromCart(item.id)}>✕</button>
                    </div>
                  );
                })}
                <div className="order-box">
                  <div className="order-row"><span>Subtotal ({totalItems} items)</span><span>£{total}</span></div>
                  <div className="order-row"><span>Delivery</span><span className="free">🎉 FREE</span></div>
                  <div className="order-row"><span>Estimated time</span><span>30–45 min</span></div>
                  <div className="order-total"><span>Total</span><span>£{total}</span></div>
                  <button className="go-checkout" onClick={()=>setPage("checkout")}>Proceed to Checkout →</button>
                </div>
              </>
            )}
          </div>

          <footer className="footer">
            <div className="footer-inner">
              <div>
                <div className="footer-brand">🛒 Ghosia Mini Market</div>
                <p style={{color:"#666",fontSize:15,marginTop:10,fontWeight:700}}>Fresh groceries delivered to your door in Birmingham</p>
              </div>
              <div className="footer-links">
                <span className="footer-link">About Us</span>
                <span className="footer-link">Contact</span>
                <span className="footer-link">Privacy</span>
                <span className="footer-link">Terms</span>
              </div>
              <div className="footer-copy">© 2026 Ghosia Mini Market, Birmingham. All rights reserved.</div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
