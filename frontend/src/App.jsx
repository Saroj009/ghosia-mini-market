import { useEffect, useState } from "react";

const EMOJI = { Dairy:"🥛", Bakery:"🍞", Meat:"🥩", Grains:"🌾", Vegetables:"🥦", Oils:"🫙", Tinned:"🥫", Drinks:"🧃", Spices:"🌶️", All:"🏪" };
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
  
  // Auth state
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name:"", email:"", password:"", phone:"", address:"" });
  const [authMode, setAuthMode] = useState("login"); // login, register, admin
  const [authLoading, setAuthLoading] = useState(false);

  // Check if user is logged in on mount
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

  // Auth functions
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
    <div style={{fontFamily:"'Segoe UI',Arial,sans-serif", background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight:"100vh", color:"#fff"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);}
        ::-webkit-scrollbar{width:8px;} ::-webkit-scrollbar-track{background:rgba(255,255,255,0.1);} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.3);border-radius:4px;}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.5);}
        .nav{position:sticky;top:0;z-index:200;background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);border-bottom:2px solid rgba(102,126,234,0.2);padding:0 32px;height:72px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
        .logo{display:flex;align-items:center;gap:12px;cursor:pointer;}
        .logo-icon{width:48px;height:48px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 16px rgba(102,126,234,0.4);}
        .logo-text{font-size:22px;font-weight:900;letter-spacing:-0.5px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .logo-text span{color:#667eea;}
        .logo-sub{font-size:10px;color:#7c3aed;letter-spacing:1px;text-transform:uppercase;margin-top:2px;font-weight:700;}
        .nav-right{display:flex;align-items:center;gap:12px;}
        .user-badge{background:linear-gradient(135deg,rgba(102,126,234,0.15),rgba(118,75,162,0.15));border:2px solid rgba(102,126,234,0.3);color:#667eea;padding:10px 18px;border-radius:50px;font-size:14px;font-weight:800;display:flex;align-items:center;gap:8px;}
        .admin-badge{background:linear-gradient(135deg,rgba(239,68,68,0.15),rgba(220,38,38,0.15));border:2px solid rgba(239,68,68,0.3);color:#ef4444;}
        .logout-btn{background:rgba(239,68,68,0.1);border:2px solid rgba(239,68,68,0.3);color:#ef4444;padding:10px 18px;border-radius:50px;font-size:14px;font-weight:800;cursor:pointer;transition:all 0.3s;}
        .logout-btn:hover{background:rgba(239,68,68,0.2);transform:translateY(-2px);}
        .cart-pill{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:50px;padding:12px 24px;font-weight:800;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 4px 20px rgba(16,185,129,0.4);}
        .cart-pill:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(16,185,129,0.5);}
        .badge{background:#fff;color:#10b981;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;}
        .auth-wrap{min-height:calc(100vh - 72px);display:flex;align-items:center;justify-content:center;padding:40px 20px;}
        .auth-box{background:rgba(255,255,255,0.98);border:none;border-radius:32px;padding:48px 40px;width:100%;max-width:480px;box-shadow:0 20px 80px rgba(0,0,0,0.3);}
        .auth-header{text-align:center;margin-bottom:32px;}
        .auth-icon{font-size:72px;margin-bottom:16px;}
        .auth-title{font-size:32px;font-weight:900;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;}
        .auth-subtitle{font-size:15px;color:#6b7280;}
        .auth-tabs{display:flex;gap:8px;margin-bottom:28px;background:rgba(102,126,234,0.08);border-radius:50px;padding:6px;}
        .auth-tab{flex:1;padding:12px;border:none;background:transparent;color:#6b7280;font-weight:800;font-size:14px;border-radius:50px;cursor:pointer;transition:all 0.3s;}
        .auth-tab.active{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;box-shadow:0 4px 16px rgba(102,126,234,0.3);}
        .auth-tab.admin-tab{color:#ef4444;}
        .auth-tab.admin-tab.active{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 4px 16px rgba(239,68,68,0.3);}
        .f-label{display:block;font-size:12px;font-weight:800;color:#667eea;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
        .f-input{width:100%;padding:16px 18px;background:#fff;border:2px solid rgba(102,126,234,0.2);border-radius:16px;color:#1f2937;font-size:15px;outline:none;transition:all 0.3s;font-weight:500;}
        .f-input:focus{border-color:#667eea;box-shadow:0 0 0 4px rgba(102,126,234,0.1);}
        .f-input::placeholder{color:#9ca3af;}
        .f-group{margin-bottom:20px;}
        .auth-btn{width:100%;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:16px;padding:18px;font-size:17px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 6px 24px rgba(102,126,234,0.4);margin-top:12px;}
        .auth-btn:hover{transform:translateY(-3px);box-shadow:0 10px 35px rgba(102,126,234,0.5);}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .auth-btn.admin-btn{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 6px 24px rgba(239,68,68,0.4);}
        .auth-btn.admin-btn:hover{box-shadow:0 10px 35px rgba(239,68,68,0.5);}
        .auth-divider{text-align:center;color:#9ca3af;font-size:14px;margin:28px 0;font-weight:600;}
        .auth-switch{text-align:center;color:#6b7280;font-size:15px;margin-top:24px;font-weight:500;}
        .auth-switch a{color:#667eea;font-weight:800;cursor:pointer;text-decoration:none;}
        .auth-switch a:hover{text-decoration:underline;}
        .hero{background:linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);padding:80px 28px 64px;text-align:center;position:relative;overflow:hidden;border-bottom:2px solid rgba(255,255,255,0.2);backdrop-filter:blur(10px);}
        .hero::before{content:"";position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%);pointer-events:none;}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.4);color:#fff;border-radius:50px;padding:8px 22px;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:28px;backdrop-filter:blur(10px);}
        .hero h1{font-size:60px;font-weight:900;line-height:1.1;margin-bottom:20px;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,0.2);}
        .hero-sub{font-size:18px;color:rgba(255,255,255,0.9);margin-bottom:48px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.7;font-weight:500;}
        .stats-row{display:flex;justify-content:center;gap:48px;margin-top:48px;}
        .stat{text-align:center;}
        .stat-num{font-size:32px;font-weight:900;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,0.2);}
        .stat-label{font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;text-transform:uppercase;letter-spacing:1px;font-weight:700;}
        .search-wrap{max-width:650px;margin:0 auto;}
        .search-box{display:flex;background:rgba(255,255,255,0.95);border:2px solid rgba(255,255,255,0.3);border-radius:60px;overflow:hidden;transition:all 0.3s;box-shadow:0 10px 40px rgba(0,0,0,0.2);}
        .search-box:focus-within{border-color:#fff;box-shadow:0 10px 50px rgba(0,0,0,0.3);}
        .search-box input{flex:1;background:transparent;border:none;padding:18px 28px;font-size:16px;color:#1f2937;outline:none;font-weight:500;}
        .search-box input::placeholder{color:#9ca3af;}
        .search-box select{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:16px 26px;font-size:14px;font-weight:800;cursor:pointer;outline:none;}
        .body{max-width:1200px;margin:0 auto;padding:48px 24px;}
        .cat-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px;}
        .cat-btn{background:rgba(255,255,255,0.95);border:2px solid rgba(102,126,234,0.2);color:#667eea;border-radius:50px;padding:12px 24px;font-size:14px;font-weight:800;cursor:pointer;transition:all 0.3s;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.1);}
        .cat-btn:hover{border-color:#667eea;transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.3);}
        .cat-btn.active{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-color:transparent;box-shadow:0 6px 24px rgba(102,126,234,0.4);}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;}
        .section-title{font-size:26px;font-weight:900;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,0.2);}
        .section-count{background:rgba(255,255,255,0.25);color:#fff;border-radius:50px;padding:8px 18px;font-size:14px;font-weight:800;border:2px solid rgba(255,255,255,0.3);backdrop-filter:blur(10px);}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;}
        .card{background:rgba(255,255,255,0.98);border-radius:24px;border:2px solid rgba(255,255,255,0.3);overflow:hidden;transition:all 0.4s;position:relative;box-shadow:0 4px 20px rgba(0,0,0,0.15);}
        .card:hover{border-color:#667eea;transform:translateY(-8px);box-shadow:0 20px 60px rgba(102,126,234,0.3);}
        .card-thumb{height:140px;display:flex;align-items:center;justify-content:center;font-size:64px;position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(102,126,234,0.1),rgba(118,75,162,0.1));}
        .card-body{padding:20px 22px 22px;}
        .card-cat{font-size:11px;font-weight:900;color:#667eea;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px;}
        .card-name{font-size:16px;font-weight:800;color:#1f2937;margin-bottom:18px;line-height:1.4;min-height:44px;}
        .card-foot{display:flex;justify-content:space-between;align-items:center;}
        .card-price{font-size:24px;font-weight:900;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .in-cart-badge{position:absolute;top:12px;right:12px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;box-shadow:0 4px 12px rgba(16,185,129,0.4);}
        .add-btn{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:14px;width:44px;height:44px;font-size:26px;font-weight:900;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(16,185,129,0.3);}
        .add-btn:hover{transform:scale(1.15);box-shadow:0 8px 28px rgba(16,185,129,0.5);}
        .divider{height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);margin:60px 0;}
        .cart-card{background:rgba(255,255,255,0.95);border:2px solid rgba(102,126,234,0.2);border-radius:20px;padding:20px 24px;margin-bottom:14px;display:flex;align-items:center;gap:18px;transition:all 0.3s;box-shadow:0 2px 10px rgba(0,0,0,0.1);}
        .cart-card:hover{border-color:#667eea;box-shadow:0 6px 24px rgba(102,126,234,0.25);}
        .cart-thumb{width:60px;height:60px;background:linear-gradient(135deg,rgba(102,126,234,0.15),rgba(118,75,162,0.15));border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0;border:2px solid rgba(102,126,234,0.2);}
        .cart-info{flex:1;}
        .cart-name{font-weight:800;color:#1f2937;font-size:16px;}
        .cart-cat{font-size:13px;color:#6b7280;margin-top:4px;font-weight:600;}
        .qty-control{display:flex;align-items:center;gap:12px;background:rgba(102,126,234,0.1);border-radius:50px;padding:8px 16px;border:2px solid rgba(102,126,234,0.2);}
        .qty-btn{background:none;border:none;color:#667eea;font-size:20px;cursor:pointer;font-weight:900;line-height:1;transition:all 0.2s;}
        .qty-btn:hover{color:#764ba2;transform:scale(1.3);}
        .qty-num{font-weight:900;color:#1f2937;font-size:16px;min-width:28px;text-align:center;}
        .cart-price{font-weight:900;font-size:18px;background:linear-gradient(135deg,#10b981,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent;min-width:72px;text-align:right;}
        .del-btn{background:rgba(239,68,68,0.1);border:2px solid rgba(239,68,68,0.2);color:#ef4444;border-radius:12px;width:40px;height:40px;cursor:pointer;font-size:16px;transition:all 0.3s;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:900;}
        .del-btn:hover{background:rgba(239,68,68,0.2);border-color:#ef4444;transform:scale(1.1);}
        .order-box{background:rgba(255,255,255,0.95);border:2px solid rgba(102,126,234,0.3);border-radius:28px;padding:32px 36px;margin-top:24px;box-shadow:0 8px 32px rgba(0,0,0,0.15);}
        .order-row{display:flex;justify-content:space-between;font-size:15px;color:#6b7280;padding:10px 0;font-weight:600;}
        .order-row:not(:last-child){border-bottom:2px solid rgba(102,126,234,0.1);}
        .order-total{display:flex;justify-content:space-between;font-size:28px;font-weight:900;padding-top:20px;margin-top:12px;border-top:3px solid rgba(102,126,234,0.2);}
        .order-total span:first-child{color:#1f2937;}
        .order-total span:last-child{background:linear-gradient(135deg,#10b981,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .free{background:linear-gradient(135deg,#10b981,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;}
        .go-checkout{width:100%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:18px;padding:20px;font-size:18px;font-weight:900;cursor:pointer;margin-top:24px;transition:all 0.3s;box-shadow:0 8px 32px rgba(16,185,129,0.4);letter-spacing:0.5px;}
        .go-checkout:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(16,185,129,0.5);}
        .checkout-wrap{max-width:750px;margin:0 auto;padding:48px 24px;}
        .back-btn{background:rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.4);color:#fff;border-radius:50px;padding:12px 28px;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:40px;transition:all 0.3s;display:inline-flex;align-items:center;gap:8px;backdrop-filter:blur(10px);}
        .back-btn:hover{background:rgba(255,255,255,0.35);transform:translateX(-4px);}
        .co-card{background:rgba(255,255,255,0.98);border:2px solid rgba(102,126,234,0.2);border-radius:24px;padding:32px 36px;margin-bottom:24px;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
        .co-card h3{font-size:18px;font-weight:900;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid rgba(102,126,234,0.2);display:flex;align-items:center;gap:10px;}
        .f-row{display:flex;gap:16px;}
        .summary-item{display:flex;justify-content:space-between;padding:12px 0;border-bottom:2px solid rgba(102,126,234,0.1);font-size:15px;color:#6b7280;font-weight:600;}
        .summary-item:last-child{border:none;}
        .summary-total{display:flex;justify-content:space-between;font-size:22px;font-weight:900;padding-top:16px;margin-top:10px;border-top:3px solid rgba(102,126,234,0.2);}
        .place-btn{width:100%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:18px;padding:20px;font-size:18px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 32px rgba(16,185,129,0.4);letter-spacing:0.5px;}
        .place-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(16,185,129,0.5);}
        .success-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;}
        .success-box{text-align:center;padding:80px 60px;background:rgba(255,255,255,0.98);border:none;border-radius:36px;max-width:550px;box-shadow:0 32px 100px rgba(0,0,0,0.3);}
        .s-icon{font-size:96px;margin-bottom:32px;display:block;}
        .success-box h2{font-size:38px;font-weight:900;margin-bottom:16px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .success-box p{color:#6b7280;font-size:17px;line-height:1.8;margin-bottom:40px;font-weight:500;}
        .continue-btn{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:16px;padding:16px 44px;font-size:17px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 6px 24px rgba(16,185,129,0.4);}
        .continue-btn:hover{transform:translateY(-3px);box-shadow:0 10px 36px rgba(16,185,129,0.5);}
        .toast{position:fixed;bottom:36px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:16px 32px;border-radius:50px;font-weight:900;font-size:15px;opacity:0;pointer-events:none;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);z-index:9999;box-shadow:0 10px 40px rgba(16,185,129,0.5);white-space:nowrap;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .toast.warn{background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 10px 40px rgba(245,158,11,0.5);}
        .spinner{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:24px;}
        .spin{width:56px;height:56px;border:4px solid rgba(255,255,255,0.3);border-top:4px solid #fff;border-radius:50%;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .empty{text-align:center;padding:100px 20px;}
        .empty-icon{font-size:80px;margin-bottom:20px;}
        .empty h3{font-size:26px;font-weight:900;color:#fff;margin-bottom:12px;text-shadow:0 2px 10px rgba(0,0,0,0.2);}
        .empty p{color:rgba(255,255,255,0.8);font-size:16px;font-weight:600;}
        .footer{background:rgba(0,0,0,0.2);border-top:2px solid rgba(255,255,255,0.2);padding:48px 32px;margin-top:100px;backdrop-filter:blur(10px);}
        .footer-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;}
        .footer-brand{font-size:20px;font-weight:900;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,0.2);}
        .footer-brand span{color:#fff;}
        .footer-links{display:flex;gap:28px;}
        .footer-link{color:rgba(255,255,255,0.8);font-size:14px;font-weight:700;cursor:pointer;transition:color 0.3s;text-decoration:none;}
        .footer-link:hover{color:#fff;}
        .footer-copy{color:rgba(255,255,255,0.7);font-size:13px;width:100%;text-align:center;margin-top:24px;padding-top:24px;border-top:2px solid rgba(255,255,255,0.15);font-weight:600;}
        @media(max-width:640px){
          .hero h1{font-size:42px;}
          .stats-row{gap:28px;}
          .grid{grid-template-columns:repeat(2,1fr);gap:14px;}
          .f-row{flex-direction:column;}
          .cart-card{flex-wrap:wrap;}
          .nav{padding:0 20px;}
          .body{padding:32px 16px;}
          .co-card{padding:26px 22px;}
          .order-box{padding:26px 22px;}
          .footer-inner{flex-direction:column;text-align:center;}
          .nav-right{gap:8px;}
          .user-badge{padding:8px 14px;font-size:12px;}
        }
      `}</style>

      {/* TOAST */}
      <div className={`toast ${toast ? "show" : ""} ${toast.startsWith("⚠️") ? "warn" : ""}`}>{toast}</div>

      {/* NAV */}
      <nav className="nav">
        <div className="logo" onClick={() => setPage("shop")}>
          <div className="logo-icon">🛒</div>
          <div>
            <div className="logo-text">Ghosia <span>Market</span></div>
            <div className="logo-sub">Birmingham's Mini Market</div>
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

      {/* AUTH PAGE */}
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
                <button 
                  className={`auth-tab ${authMode==='login'?'active':''}`}
                  onClick={() => setAuthMode('login')}
                >Login</button>
                <button 
                  className={`auth-tab ${authMode==='register'?'active':''}`}
                  onClick={() => setAuthMode('register')}
                >Register</button>
              </div>
            )}

            <form onSubmit={handleAuth}>
              {authMode === 'register' && (
                <div className="f-group">
                  <label className="f-label">Full Name</label>
                  <input 
                    className="f-input" 
                    placeholder="e.g. John Smith" 
                    value={authForm.name}
                    onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    required
                  />
                </div>
              )}

              <div className="f-group">
                <label className="f-label">Email</label>
                <input 
                  className="f-input" 
                  type="email"
                  placeholder="e.g. john@example.com" 
                  value={authForm.email}
                  onChange={e => setAuthForm({...authForm, email: e.target.value})}
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
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div className="f-group">
                    <label className="f-label">Phone Number</label>
                    <input 
                      className="f-input" 
                      placeholder="e.g. 07700 900000" 
                      value={authForm.phone}
                      onChange={e => setAuthForm({...authForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="f-group">
                    <label className="f-label">Address</label>
                    <input 
                      className="f-input" 
                      placeholder="e.g. 123 High St, Birmingham" 
                      value={authForm.address}
                      onChange={e => setAuthForm({...authForm, address: e.target.value})}
                    />
                  </div>
                </>
              )}

              <button 
                type="submit"
                className={`auth-btn ${authMode==='admin'?'admin-btn':''}`}
                disabled={authLoading}
              >
                {authLoading ? '⏳ Please wait...' : (
                  authMode === 'register' ? '🚀 Create Account' :
                  authMode === 'admin' ? '🛡️ Admin Login' :
                  '🔐 Login'
                )}
              </button>
            </form>

            {authMode !== 'admin' && (
              <>
                <div className="auth-divider">or</div>
                <div className="auth-switch">
                  <a onClick={() => setAuthMode('admin')}>🛡️ Admin Login</a>
                </div>
              </>
            )}

            {authMode === 'admin' && (
              <div className="auth-switch">
                <a onClick={() => setAuthMode('login')}>← Back to Customer Login</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {orderDone && (
        <div className="success-wrap">
          <div className="success-box">
            <span className="s-icon">🎉</span>
            <h2>Order Confirmed!</h2>
            <p>Thank you for shopping at<br /><strong style={{color:"#667eea"}}>Ghosia Mini Market</strong>.<br />Your groceries are on their way! 🚚</p>
            <button className="continue-btn" onClick={() => { setOrderDone(false); setPage("shop"); }}>Continue Shopping</button>
          </div>
        </div>
      )}

      {/* REST OF THE APP - CHECKOUT PAGE */}
      {page === "checkout" && !orderDone && user && (
        <div className="checkout-wrap">
          <button className="back-btn" onClick={() => setPage("shop")}>← Back to Shop</button>
          {cart.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🧺</div>
              <h3>Your cart is empty</h3>
              <p>Go back and add some products!</p>
            </div>
          ) : (
            <>
              <div className="co-card">
                <h3>🧾 Order Summary</h3>
                {cart.map(item => (
                  <div className="summary-item" key={item.id}>
                    <span style={{color:"#1f2937"}}>{item.name} <span style={{color:"#9ca3af"}}>×{item.qty}</span></span>
                    <span style={{color:"#1f2937",fontWeight:800}}>£{(item.price*item.qty).toFixed(2)}</span>
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
                <p style={{fontSize:13,color:"#9ca3af",marginTop:6,fontWeight:600}}>🔒 Your payment is secure and encrypted</p>
              </div>

              <button className="place-btn" onClick={placeOrder}>🛒 Place Order — £{total}</button>
            </>
          )}
        </div>
      )}

      {/* SHOP PAGE */}
      {page === "shop" && !orderDone && (
        <>
          <div className="hero">
            <div className="hero-badge">🛒 Birmingham's Favourite Mini Market</div>
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
              {categories.map(c => (
                <button key={c} className={`cat-btn ${category===c?"active":""}`} onClick={()=>setCategory(c)}>
                  {EMOJI[c]||""} {c}
                </button>
              ))}
            </div>

            <div className="section-header">
              <div className="section-title">{EMOJI[category]||""} {category==="All"?"All Products":category}</div>
              <div className="section-count">{filtered.length} items</div>
            </div>

            {loading ? (
              <div className="spinner"><div className="spin"></div><p style={{color:"#fff",fontSize:16,fontWeight:700}}>Loading products...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">😔</div>
                <h3>Nothing found</h3>
                <p>Try a different search or category</p>
              </div>
            ) : (
              <div className="grid">
                {filtered.map(p => {
                  const inCart = cartQtyForProduct(p.id);
                  return (
                    <div className="card" key={p.id}>
                      {inCart > 0 && <div className="in-cart-badge">{inCart}</div>}
                      <div className="card-thumb">{EMOJI[p.category]||""}</div>
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
                {cart.map(item => (
                  <div className="cart-card" key={item.id}>
                    <div className="cart-thumb">{EMOJI[item.category]||""}</div>
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
                ))}
                <div className="order-box">
                  <div className="order-row"><span>Subtotal ({totalItems} items)</span><span style={{color:"#1f2937",fontWeight:700}}>£{total}</span></div>
                  <div className="order-row"><span>Delivery</span><span className="free">🎉 FREE</span></div>
                  <div className="order-row"><span>Estimated time</span><span style={{color:"#1f2937",fontWeight:700}}>30–45 min</span></div>
                  <div className="order-total"><span>Total</span><span>£{total}</span></div>
                  <button className="go-checkout" onClick={()=>setPage("checkout")}>Proceed to Checkout →</button>
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          <footer className="footer">
            <div className="footer-inner">
              <div>
                <div className="footer-brand">🛒 Ghosia <span>Mini Market</span></div>
                <p style={{color:"rgba(255,255,255,0.7)",fontSize:14,marginTop:8,fontWeight:600}}>Fresh groceries delivered to your door in Birmingham</p>
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
