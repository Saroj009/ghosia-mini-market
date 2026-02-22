import { useEffect, useState } from "react";

const PRODUCT_IMAGES = {
  "Whole Milk": "🥛",
  "Cheddar Cheese": "🧀",
  "Greek Yogurt": "🥛",
  "Butter": "🧈",
  "White Bread": "🍞",
  "Croissants": "🥐",
  "Bagels": "🥯",
  "Chicken Breast": "🍗",
  "Ground Beef": "🥩",
  "Pork Chops": "🥓",
  "Basmati Rice": "🍚",
  "Quinoa": "🌾",
  "Oats": "🌾",
  "Carrots": "🥕",
  "Broccoli": "🥦",
  "Tomatoes": "🍅",
  "Bell Peppers": "🫑",
  "Olive Oil": "🫒",
  "Vegetable Oil": "🌻",
  "Coconut Oil": "🥥",
  "Baked Beans": "🫘",
  "Tomato Soup": "🥫",
  "Tuna": "🐟",
  "Orange Juice": "🧃",
  "Cola": "🥤",
  "Sparkling Water": "💧",
  "Black Pepper": "🌶️",
  "Turmeric": "🌶️",
  "Cumin": "🌶️"
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
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif", background:"#0a0a0a", minHeight:"100vh", color:"#fff"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0a0a0a;overflow-x:hidden;}
        ::-webkit-scrollbar{width:10px;}
        ::-webkit-scrollbar-track{background:#1a1a1a;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#ffd700,#ffaa00);border-radius:10px;}
        ::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#ffed4e,#ffd700);}
        
        .nav{position:sticky;top:0;z-index:200;background:rgba(10,10,10,0.95);backdrop-filter:blur(20px);border-bottom:3px solid rgba(255,215,0,0.4);padding:0 40px;height:85px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 10px 40px rgba(255,215,0,0.3);}
        .logo{display:flex;align-items:center;gap:16px;cursor:pointer;transition:transform 0.3s;}
        .logo:hover{transform:scale(1.08);}
        .logo-icon{width:56px;height:56px;background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 10px 40px rgba(255,215,0,0.6),0 0 80px rgba(255,170,0,0.5);animation:glow 2s ease-in-out infinite alternate;}
        @keyframes glow{from{box-shadow:0 10px 40px rgba(255,215,0,0.6),0 0 80px rgba(255,170,0,0.5);}to{box-shadow:0 10px 40px rgba(255,237,78,0.8),0 0 100px rgba(255,215,0,0.7);}}
        .logo-text{font-size:28px;font-weight:900;letter-spacing:-1px;background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 20px rgba(255,215,0,0.8));}
        .logo-sub{font-size:11px;color:#ffd700;letter-spacing:2.5px;text-transform:uppercase;margin-top:3px;font-weight:900;text-shadow:0 0 15px rgba(255,215,0,0.9);}
        .nav-right{display:flex;align-items:center;gap:16px;}
        .user-badge{background:rgba(255,215,0,0.15);border:2px solid #ffd700;color:#ffd700;padding:13px 24px;border-radius:50px;font-size:16px;font-weight:900;display:flex;align-items:center;gap:10px;box-shadow:0 0 25px rgba(255,215,0,0.4);text-shadow:0 0 15px rgba(255,215,0,0.6);}
        .admin-badge{background:rgba(255,140,0,0.15);border:2px solid #ff8c00;color:#ff8c00;box-shadow:0 0 25px rgba(255,140,0,0.5);}
        .logout-btn{background:rgba(255,69,0,0.2);border:2px solid #ff4500;color:#ff4500;padding:13px 24px;border-radius:50px;font-size:16px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 0 25px rgba(255,69,0,0.4);}
        .logout-btn:hover{background:rgba(255,69,0,0.3);transform:translateY(-3px);box-shadow:0 0 35px rgba(255,69,0,0.6);}
        .cart-pill{background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);color:#0a0a0a;border:none;border-radius:50px;padding:16px 32px;font-weight:900;cursor:pointer;font-size:17px;display:flex;align-items:center;gap:12px;transition:all 0.3s;box-shadow:0 10px 40px rgba(255,215,0,0.5);position:relative;overflow:hidden;}
        .cart-pill::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);transition:left 0.5s;}
        .cart-pill:hover::before{left:100%;}
        .cart-pill:hover{transform:translateY(-4px);box-shadow:0 15px 50px rgba(255,215,0,0.7);}
        .badge{background:#0a0a0a;color:#ffd700;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;border:2px solid #ffd700;}
        
        .auth-wrap{min-height:calc(100vh - 85px);display:flex;align-items:center;justify-content:center;padding:40px 20px;background:radial-gradient(circle at 50% 50%,rgba(255,215,0,0.15),transparent 70%);}
        .auth-box{background:rgba(20,20,20,0.95);border:3px solid rgba(255,215,0,0.6);border-radius:36px;padding:55px 48px;width:100%;max-width:540px;box-shadow:0 25px 100px rgba(255,215,0,0.4),inset 0 0 80px rgba(255,215,0,0.08);position:relative;overflow:hidden;}
        .auth-box::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,rgba(255,215,0,0.15),transparent 30%);animation:rotate 4s linear infinite;}
        @keyframes rotate{to{transform:rotate(360deg);}}
        .auth-header{text-align:center;margin-bottom:40px;position:relative;z-index:1;}
        .auth-icon{font-size:90px;margin-bottom:24px;filter:drop-shadow(0 0 30px rgba(255,215,0,0.9));}
        .auth-title{font-size:40px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:12px;}
        .auth-subtitle{font-size:17px;color:#ffdb58;font-weight:700;}
        .auth-tabs{display:flex;gap:12px;margin-bottom:36px;background:rgba(255,215,0,0.08);border-radius:50px;padding:8px;border:2px solid rgba(255,215,0,0.25);position:relative;z-index:1;}
        .auth-tab{flex:1;padding:16px;border:none;background:transparent;color:#ffdb58;font-weight:900;font-size:16px;border-radius:50px;cursor:pointer;transition:all 0.3s;}
        .auth-tab.active{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#0a0a0a;box-shadow:0 6px 25px rgba(255,215,0,0.6);}
        .auth-tab.admin-tab{color:#ff8c00;}
        .auth-tab.admin-tab.active{background:linear-gradient(135deg,#ff8c00,#ff6600);box-shadow:0 6px 25px rgba(255,140,0,0.6);}
        .f-label{display:block;font-size:14px;font-weight:900;color:#ffd700;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;text-shadow:0 0 15px rgba(255,215,0,0.6);}
        .f-input{width:100%;padding:18px 22px;background:rgba(255,215,0,0.05);border:2px solid rgba(255,215,0,0.35);border-radius:18px;color:#fff;font-size:17px;outline:none;transition:all 0.3s;font-weight:600;position:relative;z-index:1;}
        .f-input:focus{border-color:#ffd700;box-shadow:0 0 25px rgba(255,215,0,0.4);background:rgba(255,215,0,0.12);}
        .f-input::placeholder{color:#666;}
        .f-group{margin-bottom:24px;position:relative;z-index:1;}
        .auth-btn{width:100%;background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);color:#0a0a0a;border:none;border-radius:18px;padding:20px;font-size:20px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 10px 40px rgba(255,215,0,0.6);margin-top:16px;position:relative;z-index:1;overflow:hidden;}
        .auth-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);transition:left 0.5s;}
        .auth-btn:hover::before{left:100%;}
        .auth-btn:hover{transform:translateY(-4px);box-shadow:0 15px 50px rgba(255,215,0,0.8);}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .auth-btn.admin-btn{background:linear-gradient(135deg,#ff8c00,#ff6600);box-shadow:0 10px 40px rgba(255,140,0,0.6);}
        .auth-btn.admin-btn:hover{box-shadow:0 15px 50px rgba(255,140,0,0.8);}
        .auth-divider{text-align:center;color:#666;font-size:16px;margin:32px 0;font-weight:800;position:relative;z-index:1;}
        .auth-switch{text-align:center;color:#ffdb58;font-size:17px;margin-top:28px;font-weight:700;position:relative;z-index:1;}
        .auth-switch a{color:#ffd700;font-weight:900;cursor:pointer;text-decoration:none;text-shadow:0 0 15px rgba(255,215,0,0.6);}
        .auth-switch a:hover{text-decoration:underline;}
        
        .hero{background:linear-gradient(180deg,rgba(255,215,0,0.12),transparent),radial-gradient(circle at 30% 50%,rgba(255,170,0,0.25),transparent 50%),radial-gradient(circle at 70% 50%,rgba(255,140,0,0.25),transparent 50%);padding:110px 36px 90px;text-align:center;position:relative;overflow:hidden;border-bottom:3px solid rgba(255,215,0,0.4);}
        .hero::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyMTUsMCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=');opacity:0.35;}
        .hero-badge{display:inline-flex;align-items:center;gap:12px;background:rgba(255,215,0,0.2);border:3px solid #ffd700;color:#ffd700;border-radius:50px;padding:12px 30px;font-size:15px;font-weight:900;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:36px;backdrop-filter:blur(10px);box-shadow:0 0 40px rgba(255,215,0,0.5);position:relative;z-index:1;}
        .hero h1{font-size:80px;font-weight:900;line-height:1.1;margin-bottom:28px;background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 40px rgba(255,215,0,0.5));position:relative;z-index:1;}
        .hero-sub{font-size:22px;color:#ffdb58;margin-bottom:55px;max-width:650px;margin-left:auto;margin-right:auto;line-height:1.9;font-weight:700;position:relative;z-index:1;}
        .stats-row{display:flex;justify-content:center;gap:70px;margin-top:55px;position:relative;z-index:1;}
        .stat{text-align:center;}
        .stat-num{font-size:48px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 25px rgba(255,215,0,0.7));}
        .stat-label{font-size:15px;color:#ffdb58;margin-top:8px;text-transform:uppercase;letter-spacing:2.5px;font-weight:900;}
        .search-wrap{max-width:750px;margin:0 auto;position:relative;z-index:1;}
        .search-box{display:flex;background:rgba(20,20,20,0.9);border:3px solid rgba(255,215,0,0.6);border-radius:60px;overflow:hidden;transition:all 0.3s;box-shadow:0 12px 50px rgba(255,215,0,0.4);backdrop-filter:blur(10px);}
        .search-box:focus-within{border-color:#ffd700;box-shadow:0 12px 60px rgba(255,215,0,0.6);}
        .search-box input{flex:1;background:transparent;border:none;padding:22px 34px;font-size:18px;color:#fff;outline:none;font-weight:700;}
        .search-box input::placeholder{color:#666;}
        .search-box select{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#0a0a0a;border:none;padding:20px 34px;font-size:16px;font-weight:900;cursor:pointer;outline:none;}
        
        .body{max-width:1350px;margin:0 auto;padding:70px 32px;}
        .cat-row{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:55px;}
        .cat-btn{background:rgba(255,215,0,0.08);border:2px solid rgba(255,215,0,0.35);color:#ffd700;border-radius:50px;padding:16px 32px;font-size:16px;font-weight:900;cursor:pointer;transition:all 0.3s;white-space:nowrap;box-shadow:0 6px 25px rgba(255,215,0,0.25);backdrop-filter:blur(10px);}
        .cat-btn:hover{border-color:#ffd700;transform:translateY(-4px);box-shadow:0 10px 40px rgba(255,215,0,0.5);background:rgba(255,215,0,0.15);}
        .cat-btn.active{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#0a0a0a;border-color:transparent;box-shadow:0 10px 40px rgba(255,215,0,0.6);}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;}
        .section-title{font-size:36px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 25px rgba(255,215,0,0.5));}
        .section-count{background:rgba(255,215,0,0.12);color:#ffd700;border-radius:50px;padding:12px 26px;font-size:17px;font-weight:900;border:2px solid rgba(255,215,0,0.35);box-shadow:0 0 25px rgba(255,215,0,0.35);}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;}
        .card{background:rgba(20,20,20,0.7);border-radius:28px;border:2px solid rgba(255,215,0,0.35);overflow:hidden;transition:all 0.4s;position:relative;box-shadow:0 10px 40px rgba(0,0,0,0.4);backdrop-filter:blur(10px);}
        .card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,rgba(255,215,0,0.15),transparent);opacity:0;transition:opacity 0.4s;}
        .card:hover::before{opacity:1;}
        .card:hover{border-color:#ffd700;transform:translateY(-12px) scale(1.03);box-shadow:0 25px 70px rgba(255,215,0,0.5);}
        .card-thumb{height:180px;display:flex;align-items:center;justify-content:center;font-size:90px;position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,170,0,0.08));}
        .card-body{padding:24px 28px 28px;position:relative;z-index:1;}
        .card-cat{font-size:13px;font-weight:900;color:#ffd700;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;text-shadow:0 0 15px rgba(255,215,0,0.6);}
        .card-name{font-size:20px;font-weight:900;color:#fff;margin-bottom:22px;line-height:1.4;min-height:56px;}
        .card-foot{display:flex;justify-content:space-between;align-items:center;}
        .card-price{font-size:32px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .in-cart-badge{position:absolute;top:16px;right:16px;background:linear-gradient(135deg,#ff8c00,#ff6600);color:#fff;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;box-shadow:0 0 35px rgba(255,140,0,0.7);z-index:2;}
        .add-btn{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#0a0a0a;border:none;border-radius:18px;width:56px;height:56px;font-size:32px;font-weight:900;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 25px rgba(255,215,0,0.5);position:relative;overflow:hidden;}
        .add-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent);transition:left 0.5s;}
        .add-btn:hover::before{left:100%;}
        .add-btn:hover{transform:scale(1.2);box-shadow:0 10px 40px rgba(255,215,0,0.7);}
        
        .divider{height:3px;background:linear-gradient(90deg,transparent,rgba(255,215,0,0.6),transparent);margin:80px 0;box-shadow:0 0 25px rgba(255,215,0,0.4);}
        .cart-card{background:rgba(20,20,20,0.7);border:2px solid rgba(255,215,0,0.35);border-radius:26px;padding:24px 30px;margin-bottom:18px;display:flex;align-items:center;gap:24px;transition:all 0.3s;box-shadow:0 6px 25px rgba(0,0,0,0.4);backdrop-filter:blur(10px);}
        .cart-card:hover{border-color:#ffd700;box-shadow:0 10px 40px rgba(255,215,0,0.4);transform:translateX(6px);}
        .cart-thumb{width:80px;height:80px;background:linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,170,0,0.12));border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:42px;flex-shrink:0;border:2px solid rgba(255,215,0,0.35);}
        .cart-info{flex:1;}
        .cart-name{font-weight:900;color:#fff;font-size:20px;}
        .cart-cat{font-size:15px;color:#ffdb58;margin-top:8px;font-weight:800;}
        .qty-control{display:flex;align-items:center;gap:16px;background:rgba(255,215,0,0.08);border-radius:50px;padding:12px 22px;border:2px solid rgba(255,215,0,0.35);}
        .qty-btn{background:none;border:none;color:#ffd700;font-size:26px;cursor:pointer;font-weight:900;line-height:1;transition:all 0.3s;text-shadow:0 0 15px rgba(255,215,0,0.6);}
        .qty-btn:hover{color:#ffaa00;transform:scale(1.4);}
        .qty-num{font-weight:900;color:#fff;font-size:20px;min-width:36px;text-align:center;}
        .cart-price{font-weight:900;font-size:22px;background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;min-width:90px;text-align:right;}
        .del-btn{background:rgba(255,69,0,0.2);border:2px solid #ff4500;color:#ff4500;border-radius:16px;width:48px;height:48px;cursor:pointer;font-size:20px;transition:all 0.3s;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:900;box-shadow:0 0 25px rgba(255,69,0,0.4);}
        .del-btn:hover{background:rgba(255,69,0,0.3);transform:scale(1.15);box-shadow:0 0 35px rgba(255,69,0,0.6);}
        
        .order-box{background:rgba(20,20,20,0.85);border:3px solid rgba(255,215,0,0.5);border-radius:34px;padding:40px 44px;margin-top:32px;box-shadow:0 15px 50px rgba(255,215,0,0.4);backdrop-filter:blur(10px);}
        .order-row{display:flex;justify-content:space-between;font-size:18px;color:#ffdb58;padding:14px 0;font-weight:800;}
        .order-row:not(:last-child){border-bottom:2px solid rgba(255,215,0,0.25);}
        .order-total{display:flex;justify-content:space-between;font-size:36px;font-weight:900;padding-top:24px;margin-top:16px;border-top:3px solid rgba(255,215,0,0.5);}
        .order-total span:first-child{color:#fff;}
        .order-total span:last-child{background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .free{background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;}
        .go-checkout{width:100%;background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);color:#0a0a0a;border:none;border-radius:24px;padding:24px;font-size:22px;font-weight:900;cursor:pointer;margin-top:32px;transition:all 0.3s;box-shadow:0 12px 50px rgba(255,215,0,0.6);letter-spacing:1px;position:relative;overflow:hidden;}
        .go-checkout::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);transition:left 0.5s;}
        .go-checkout:hover::before{left:100%;}
        .go-checkout:hover{transform:translateY(-4px);box-shadow:0 18px 60px rgba(255,215,0,0.8);}
        
        .checkout-wrap{max-width:850px;margin:0 auto;padding:70px 32px;}
        .back-btn{background:rgba(255,215,0,0.12);border:2px solid rgba(255,215,0,0.5);color:#ffd700;border-radius:50px;padding:16px 36px;font-size:18px;font-weight:900;cursor:pointer;margin-bottom:55px;transition:all 0.3s;display:inline-flex;align-items:center;gap:12px;box-shadow:0 0 25px rgba(255,215,0,0.4);}
        .back-btn:hover{background:rgba(255,215,0,0.2);transform:translateX(-6px);box-shadow:0 0 35px rgba(255,215,0,0.6);}
        .co-card{background:rgba(20,20,20,0.85);border:2px solid rgba(255,215,0,0.35);border-radius:32px;padding:40px 44px;margin-bottom:32px;box-shadow:0 10px 40px rgba(0,0,0,0.4);backdrop-filter:blur(10px);}
        .co-card h3{font-size:26px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid rgba(255,215,0,0.35);display:flex;align-items:center;gap:14px;}
        .f-row{display:flex;gap:20px;}
        .summary-item{display:flex;justify-content:space-between;padding:16px 0;border-bottom:2px solid rgba(255,215,0,0.25);font-size:18px;color:#ffdb58;font-weight:800;}
        .summary-item:last-child{border:none;}
        .summary-total{display:flex;justify-content:space-between;font-size:30px;font-weight:900;padding-top:20px;margin-top:14px;border-top:3px solid rgba(255,215,0,0.5);}
        .place-btn{width:100%;background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);color:#0a0a0a;border:none;border-radius:24px;padding:24px;font-size:22px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 12px 50px rgba(255,215,0,0.6);letter-spacing:1px;position:relative;overflow:hidden;}
        .place-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);transition:left 0.5s;}
        .place-btn:hover::before{left:100%;}
        .place-btn:hover{transform:translateY(-4px);box-shadow:0 18px 60px rgba(255,215,0,0.8);}
        
        .success-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 50%,rgba(255,215,0,0.25),transparent 70%);}
        .success-box{text-align:center;padding:100px 80px;background:rgba(20,20,20,0.95);border:3px solid rgba(255,215,0,0.6);border-radius:44px;max-width:650px;box-shadow:0 35px 120px rgba(255,215,0,0.5),inset 0 0 100px rgba(255,215,0,0.12);}
        .s-icon{font-size:120px;margin-bottom:40px;display:block;filter:drop-shadow(0 0 40px rgba(255,215,0,0.9));}
        .success-box h2{font-size:50px;font-weight:900;margin-bottom:20px;background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .success-box p{color:#ffdb58;font-size:21px;line-height:1.9;margin-bottom:50px;font-weight:700;}
        .continue-btn{background:linear-gradient(135deg,#ffd700,#ffaa00,#ff8c00);color:#0a0a0a;border:none;border-radius:20px;padding:20px 56px;font-size:21px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 10px 40px rgba(255,215,0,0.6);position:relative;overflow:hidden;}
        .continue-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);transition:left 0.5s;}
        .continue-btn:hover::before{left:100%;}
        .continue-btn:hover{transform:translateY(-4px);box-shadow:0 15px 50px rgba(255,215,0,0.8);}
        
        .toast{position:fixed;bottom:44px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,#ffd700,#ffaa00);color:#0a0a0a;padding:20px 40px;border-radius:50px;font-weight:900;font-size:18px;opacity:0;pointer-events:none;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);z-index:9999;box-shadow:0 15px 60px rgba(255,215,0,0.7);white-space:nowrap;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .toast.warn{background:linear-gradient(135deg,#ff4500,#ff6600);box-shadow:0 15px 60px rgba(255,69,0,0.7);color:#fff;}
        
        .spinner{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:32px;}
        .spin{width:72px;height:72px;border:5px solid rgba(255,215,0,0.25);border-top:5px solid #ffd700;border-radius:50%;animation:spin 0.8s linear infinite;box-shadow:0 0 35px rgba(255,215,0,0.6);}
        @keyframes spin{to{transform:rotate(360deg);}}
        .empty{text-align:center;padding:140px 28px;}
        .empty-icon{font-size:110px;margin-bottom:28px;filter:drop-shadow(0 0 30px rgba(255,215,0,0.6));}
        .empty h3{font-size:38px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;}
        .empty p{color:#ffdb58;font-size:20px;font-weight:800;}
        
        .footer{background:rgba(10,10,10,0.9);border-top:3px solid rgba(255,215,0,0.4);padding:70px 40px;margin-top:140px;backdrop-filter:blur(10px);box-shadow:0 -10px 40px rgba(255,215,0,0.25);}
        .footer-inner{max-width:1350px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:32px;}
        .footer-brand{font-size:28px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .footer-brand span{background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .footer-links{display:flex;gap:36px;}
        .footer-link{color:#ffdb58;font-size:18px;font-weight:900;cursor:pointer;transition:all 0.3s;text-decoration:none;}
        .footer-link:hover{color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,0.9);transform:translateY(-2px);}
        .footer-copy{color:#666;font-size:16px;width:100%;text-align:center;margin-top:32px;padding-top:32px;border-top:2px solid rgba(255,215,0,0.25);font-weight:800;}
        
        @media(max-width:768px){
          .hero h1{font-size:52px;}
          .stats-row{gap:36px;flex-wrap:wrap;}
          .grid{grid-template-columns:repeat(2,1fr);gap:18px;}
          .f-row{flex-direction:column;}
          .cart-card{flex-wrap:wrap;gap:16px;}
          .nav{padding:0 28px;height:76px;}
          .body{padding:50px 20px;}
          .co-card{padding:32px 28px;}
          .order-box{padding:32px 28px;}
          .footer-inner{flex-direction:column;text-align:center;}
          .nav-right{gap:12px;flex-wrap:wrap;}
          .user-badge{padding:12px 18px;font-size:14px;}
          .logo-text{font-size:24px;}
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
            <p>Thank you for shopping at<br /><strong style={{color:"#ffd700"}}>Ghosia Mini Market</strong>.<br />Your groceries are on their way! 🚚</p>
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
              <div className="spinner"><div className="spin"></div><p style={{color:"#ffdb58",fontSize:20,fontWeight:900}}>Loading products...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty"><div className="empty-icon">😔</div><h3>Nothing found</h3><p>Try a different search or category</p></div>
            ) : (
              <div className="grid">
                {filtered.map(p => {
                  const inCart = cartQtyForProduct(p.id);
                  const productEmoji = PRODUCT_IMAGES[p.name] || "🏷️";
                  return (
                    <div className="card" key={p.id}>
                      {inCart > 0 && <div className="in-cart-badge">{inCart}</div>}
                      <div className="card-thumb">{productEmoji}</div>
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
                  const productEmoji = PRODUCT_IMAGES[item.name] || "🏷️";
                  return (
                    <div className="cart-card" key={item.id}>
                      <div className="cart-thumb">{productEmoji}</div>
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
                <div className="footer-brand">🛒 Ghosia <span>Mini Market</span></div>
                <p style={{color:"#666",fontSize:16,marginTop:12,fontWeight:800}}>Fresh groceries delivered to your door in Birmingham</p>
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
