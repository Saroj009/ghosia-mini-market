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
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif", background:"#0a0e27", minHeight:"100vh", color:"#fff"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0a0e27;overflow-x:hidden;}
        ::-webkit-scrollbar{width:10px;}
        ::-webkit-scrollbar-track{background:#0f1629;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#00f0ff,#5773ff);border-radius:10px;}
        ::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#00f0ff,#a44cff);}
        
        .nav{position:sticky;top:0;z-index:200;background:rgba(10,14,39,0.8);backdrop-filter:blur(20px);border-bottom:2px solid rgba(0,240,255,0.3);padding:0 40px;height:80px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 32px rgba(0,240,255,0.2);}
        .logo{display:flex;align-items:center;gap:14px;cursor:pointer;transition:transform 0.3s;}
        .logo:hover{transform:scale(1.05);}
        .logo-icon{width:52px;height:52px;background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 8px 32px rgba(0,240,255,0.5),0 0 60px rgba(87,115,255,0.4);animation:glow 2s ease-in-out infinite alternate;}
        @keyframes glow{from{box-shadow:0 8px 32px rgba(0,240,255,0.5),0 0 60px rgba(87,115,255,0.4);}to{box-shadow:0 8px 32px rgba(164,76,255,0.6),0 0 80px rgba(0,240,255,0.5);}}
        .logo-text{font-size:26px;font-weight:900;letter-spacing:-1px;background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 30px rgba(0,240,255,0.5);}
        .logo-sub{font-size:11px;color:#00f0ff;letter-spacing:2px;text-transform:uppercase;margin-top:2px;font-weight:800;text-shadow:0 0 10px rgba(0,240,255,0.8);}
        .nav-right{display:flex;align-items:center;gap:14px;}
        .user-badge{background:rgba(0,240,255,0.1);border:2px solid #00f0ff;color:#00f0ff;padding:12px 22px;border-radius:50px;font-size:15px;font-weight:800;display:flex;align-items:center;gap:10px;box-shadow:0 0 20px rgba(0,240,255,0.3);text-shadow:0 0 10px rgba(0,240,255,0.5);}
        .admin-badge{background:rgba(255,0,255,0.1);border:2px solid #ff00ff;color:#ff00ff;box-shadow:0 0 20px rgba(255,0,255,0.4);}
        .logout-btn{background:rgba(255,0,100,0.15);border:2px solid #ff0064;color:#ff0064;padding:12px 22px;border-radius:50px;font-size:15px;font-weight:800;cursor:pointer;transition:all 0.3s;box-shadow:0 0 20px rgba(255,0,100,0.3);}
        .logout-btn:hover{background:rgba(255,0,100,0.25);transform:translateY(-2px);box-shadow:0 0 30px rgba(255,0,100,0.5);}
        .cart-pill{background:linear-gradient(135deg,#00f0ff,#5773ff);color:#0a0e27;border:none;border-radius:50px;padding:14px 28px;font-weight:900;cursor:pointer;font-size:16px;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 8px 32px rgba(0,240,255,0.4);position:relative;overflow:hidden;}
        .cart-pill::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left 0.5s;}
        .cart-pill:hover::before{left:100%;}
        .cart-pill:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,240,255,0.6);}
        .badge{background:#0a0e27;color:#00f0ff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;border:2px solid #00f0ff;}
        
        .auth-wrap{min-height:calc(100vh - 80px);display:flex;align-items:center;justify-content:center;padding:40px 20px;background:radial-gradient(circle at 50% 50%,rgba(0,240,255,0.1),transparent 70%);}
        .auth-box{background:rgba(15,22,41,0.95);border:2px solid rgba(0,240,255,0.5);border-radius:32px;padding:50px 44px;width:100%;max-width:520px;box-shadow:0 20px 80px rgba(0,240,255,0.3),inset 0 0 60px rgba(0,240,255,0.05);position:relative;overflow:hidden;}
        .auth-box::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,rgba(0,240,255,0.1),transparent 30%);animation:rotate 4s linear infinite;}
        @keyframes rotate{to{transform:rotate(360deg);}}
        .auth-header{text-align:center;margin-bottom:36px;position:relative;z-index:1;}
        .auth-icon{font-size:80px;margin-bottom:20px;filter:drop-shadow(0 0 20px rgba(0,240,255,0.8));}
        .auth-title{font-size:36px;font-weight:900;background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px;}
        .auth-subtitle{font-size:16px;color:#7dd3fc;font-weight:600;}
        .auth-tabs{display:flex;gap:10px;margin-bottom:32px;background:rgba(0,240,255,0.05);border-radius:50px;padding:6px;border:2px solid rgba(0,240,255,0.2);position:relative;z-index:1;}
        .auth-tab{flex:1;padding:14px;border:none;background:transparent;color:#7dd3fc;font-weight:800;font-size:15px;border-radius:50px;cursor:pointer;transition:all 0.3s;}
        .auth-tab.active{background:linear-gradient(135deg,#00f0ff,#5773ff);color:#0a0e27;box-shadow:0 4px 20px rgba(0,240,255,0.5);}
        .auth-tab.admin-tab{color:#ff00ff;}
        .auth-tab.admin-tab.active{background:linear-gradient(135deg,#ff00ff,#a44cff);box-shadow:0 4px 20px rgba(255,0,255,0.5);}
        .f-label{display:block;font-size:13px;font-weight:800;color:#00f0ff;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;text-shadow:0 0 10px rgba(0,240,255,0.5);}
        .f-input{width:100%;padding:16px 20px;background:rgba(0,240,255,0.05);border:2px solid rgba(0,240,255,0.3);border-radius:16px;color:#fff;font-size:16px;outline:none;transition:all 0.3s;font-weight:600;position:relative;z-index:1;}
        .f-input:focus{border-color:#00f0ff;box-shadow:0 0 20px rgba(0,240,255,0.3);background:rgba(0,240,255,0.1);}
        .f-input::placeholder{color:#4a5568;}
        .f-group{margin-bottom:22px;position:relative;z-index:1;}
        .auth-btn{width:100%;background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);color:#0a0e27;border:none;border-radius:16px;padding:18px;font-size:18px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 32px rgba(0,240,255,0.5);margin-top:14px;position:relative;z-index:1;overflow:hidden;}
        .auth-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left 0.5s;}
        .auth-btn:hover::before{left:100%;}
        .auth-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,240,255,0.7);}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .auth-btn.admin-btn{background:linear-gradient(135deg,#ff00ff,#a44cff);box-shadow:0 8px 32px rgba(255,0,255,0.5);}
        .auth-btn.admin-btn:hover{box-shadow:0 12px 40px rgba(255,0,255,0.7);}
        .auth-divider{text-align:center;color:#4a5568;font-size:15px;margin:30px 0;font-weight:700;position:relative;z-index:1;}
        .auth-switch{text-align:center;color:#7dd3fc;font-size:16px;margin-top:26px;font-weight:600;position:relative;z-index:1;}
        .auth-switch a{color:#00f0ff;font-weight:900;cursor:pointer;text-decoration:none;text-shadow:0 0 10px rgba(0,240,255,0.5);}
        .auth-switch a:hover{text-decoration:underline;}
        
        .hero{background:linear-gradient(180deg,rgba(0,240,255,0.1),transparent),radial-gradient(circle at 30% 50%,rgba(87,115,255,0.2),transparent 50%),radial-gradient(circle at 70% 50%,rgba(164,76,255,0.2),transparent 50%);padding:100px 32px 80px;text-align:center;position:relative;overflow:hidden;border-bottom:2px solid rgba(0,240,255,0.3);}
        .hero::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMjQwLDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=');opacity:0.3;}
        .hero-badge{display:inline-flex;align-items:center;gap:10px;background:rgba(0,240,255,0.15);border:2px solid #00f0ff;color:#00f0ff;border-radius:50px;padding:10px 26px;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:32px;backdrop-filter:blur(10px);box-shadow:0 0 30px rgba(0,240,255,0.4);position:relative;z-index:1;}
        .hero h1{font-size:72px;font-weight:900;line-height:1.1;margin-bottom:24px;background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 60px rgba(0,240,255,0.3);position:relative;z-index:1;}
        .hero-sub{font-size:20px;color:#7dd3fc;margin-bottom:50px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.8;font-weight:600;position:relative;z-index:1;}
        .stats-row{display:flex;justify-content:center;gap:60px;margin-top:50px;position:relative;z-index:1;}
        .stat{text-align:center;}
        .stat-num{font-size:42px;font-weight:900;background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 20px rgba(0,240,255,0.6));}
        .stat-label{font-size:14px;color:#7dd3fc;margin-top:6px;text-transform:uppercase;letter-spacing:2px;font-weight:800;}
        .search-wrap{max-width:700px;margin:0 auto;position:relative;z-index:1;}
        .search-box{display:flex;background:rgba(15,22,41,0.8);border:2px solid rgba(0,240,255,0.5);border-radius:60px;overflow:hidden;transition:all 0.3s;box-shadow:0 10px 40px rgba(0,240,255,0.3);backdrop-filter:blur(10px);}
        .search-box:focus-within{border-color:#00f0ff;box-shadow:0 10px 50px rgba(0,240,255,0.5);}
        .search-box input{flex:1;background:transparent;border:none;padding:20px 30px;font-size:17px;color:#fff;outline:none;font-weight:600;}
        .search-box input::placeholder{color:#4a5568;}
        .search-box select{background:linear-gradient(135deg,#00f0ff,#5773ff);color:#0a0e27;border:none;padding:18px 30px;font-size:15px;font-weight:900;cursor:pointer;outline:none;}
        
        .body{max-width:1300px;margin:0 auto;padding:60px 28px;}
        .cat-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:50px;}
        .cat-btn{background:rgba(0,240,255,0.05);border:2px solid rgba(0,240,255,0.3);color:#00f0ff;border-radius:50px;padding:14px 28px;font-size:15px;font-weight:900;cursor:pointer;transition:all 0.3s;white-space:nowrap;box-shadow:0 4px 20px rgba(0,240,255,0.2);backdrop-filter:blur(10px);}
        .cat-btn:hover{border-color:#00f0ff;transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,240,255,0.4);background:rgba(0,240,255,0.1);}
        .cat-btn.active{background:linear-gradient(135deg,#00f0ff,#5773ff);color:#0a0e27;border-color:transparent;box-shadow:0 8px 32px rgba(0,240,255,0.5);}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;}
        .section-title{font-size:32px;font-weight:900;background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 20px rgba(0,240,255,0.4));}
        .section-count{background:rgba(0,240,255,0.1);color:#00f0ff;border-radius:50px;padding:10px 22px;font-size:15px;font-weight:900;border:2px solid rgba(0,240,255,0.3);box-shadow:0 0 20px rgba(0,240,255,0.3);}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px;}
        .card{background:rgba(15,22,41,0.6);border-radius:24px;border:2px solid rgba(0,240,255,0.3);overflow:hidden;transition:all 0.4s;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.3);backdrop-filter:blur(10px);}
        .card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,rgba(0,240,255,0.1),transparent);opacity:0;transition:opacity 0.4s;}
        .card:hover::before{opacity:1;}
        .card:hover{border-color:#00f0ff;transform:translateY(-10px) scale(1.02);box-shadow:0 20px 60px rgba(0,240,255,0.4);}
        .card-thumb{height:160px;display:flex;align-items:center;justify-content:center;font-size:72px;position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(0,240,255,0.05),rgba(87,115,255,0.05));}
        .card-body{padding:22px 24px 24px;position:relative;z-index:1;}
        .card-cat{font-size:12px;font-weight:900;color:#00f0ff;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;text-shadow:0 0 10px rgba(0,240,255,0.5);}
        .card-name{font-size:18px;font-weight:800;color:#fff;margin-bottom:20px;line-height:1.4;min-height:50px;}
        .card-foot{display:flex;justify-content:space-between;align-items:center;}
        .card-price{font-size:28px;font-weight:900;background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .in-cart-badge{position:absolute;top:14px;right:14px;background:linear-gradient(135deg,#ff00ff,#a44cff);color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;box-shadow:0 0 30px rgba(255,0,255,0.6);z-index:2;}
        .add-btn{background:linear-gradient(135deg,#00f0ff,#5773ff);color:#0a0e27;border:none;border-radius:16px;width:50px;height:50px;font-size:28px;font-weight:900;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,240,255,0.4);position:relative;overflow:hidden;}
        .add-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);transition:left 0.5s;}
        .add-btn:hover::before{left:100%;}
        .add-btn:hover{transform:scale(1.15);box-shadow:0 8px 32px rgba(0,240,255,0.6);}
        
        .divider{height:2px;background:linear-gradient(90deg,transparent,rgba(0,240,255,0.5),transparent);margin:70px 0;box-shadow:0 0 20px rgba(0,240,255,0.3);}
        .cart-card{background:rgba(15,22,41,0.6);border:2px solid rgba(0,240,255,0.3);border-radius:22px;padding:22px 26px;margin-bottom:16px;display:flex;align-items:center;gap:20px;transition:all 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.3);backdrop-filter:blur(10px);}
        .cart-card:hover{border-color:#00f0ff;box-shadow:0 8px 32px rgba(0,240,255,0.3);transform:translateX(5px);}
        .cart-thumb{width:70px;height:70px;background:linear-gradient(135deg,rgba(0,240,255,0.1),rgba(87,115,255,0.1));border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:36px;flex-shrink:0;border:2px solid rgba(0,240,255,0.3);}
        .cart-info{flex:1;}
        .cart-name{font-weight:900;color:#fff;font-size:18px;}
        .cart-cat{font-size:14px;color:#7dd3fc;margin-top:6px;font-weight:700;}
        .qty-control{display:flex;align-items:center;gap:14px;background:rgba(0,240,255,0.05);border-radius:50px;padding:10px 18px;border:2px solid rgba(0,240,255,0.3);}
        .qty-btn{background:none;border:none;color:#00f0ff;font-size:22px;cursor:pointer;font-weight:900;line-height:1;transition:all 0.3s;text-shadow:0 0 10px rgba(0,240,255,0.5);}
        .qty-btn:hover{color:#5773ff;transform:scale(1.3);}
        .qty-num{font-weight:900;color:#fff;font-size:18px;min-width:32px;text-align:center;}
        .cart-price{font-weight:900;font-size:20px;background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;min-width:80px;text-align:right;}
        .del-btn{background:rgba(255,0,100,0.15);border:2px solid #ff0064;color:#ff0064;border-radius:14px;width:44px;height:44px;cursor:pointer;font-size:18px;transition:all 0.3s;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:900;box-shadow:0 0 20px rgba(255,0,100,0.3);}
        .del-btn:hover{background:rgba(255,0,100,0.25);transform:scale(1.1);box-shadow:0 0 30px rgba(255,0,100,0.5);}
        
        .order-box{background:rgba(15,22,41,0.8);border:2px solid rgba(0,240,255,0.4);border-radius:30px;padding:36px 40px;margin-top:28px;box-shadow:0 12px 40px rgba(0,240,255,0.3);backdrop-filter:blur(10px);}
        .order-row{display:flex;justify-content:space-between;font-size:16px;color:#7dd3fc;padding:12px 0;font-weight:700;}
        .order-row:not(:last-child){border-bottom:2px solid rgba(0,240,255,0.2);}
        .order-total{display:flex;justify-content:space-between;font-size:32px;font-weight:900;padding-top:22px;margin-top:14px;border-top:3px solid rgba(0,240,255,0.4);}
        .order-total span:first-child{color:#fff;}
        .order-total span:last-child{background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .free{background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;}
        .go-checkout{width:100%;background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);color:#0a0e27;border:none;border-radius:20px;padding:22px;font-size:20px;font-weight:900;cursor:pointer;margin-top:28px;transition:all 0.3s;box-shadow:0 10px 40px rgba(0,240,255,0.5);letter-spacing:1px;position:relative;overflow:hidden;}
        .go-checkout::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left 0.5s;}
        .go-checkout:hover::before{left:100%;}
        .go-checkout:hover{transform:translateY(-3px);box-shadow:0 15px 50px rgba(0,240,255,0.7);}
        
        .checkout-wrap{max-width:800px;margin:0 auto;padding:60px 28px;}
        .back-btn{background:rgba(0,240,255,0.1);border:2px solid rgba(0,240,255,0.4);color:#00f0ff;border-radius:50px;padding:14px 32px;font-size:16px;font-weight:900;cursor:pointer;margin-bottom:50px;transition:all 0.3s;display:inline-flex;align-items:center;gap:10px;box-shadow:0 0 20px rgba(0,240,255,0.3);}
        .back-btn:hover{background:rgba(0,240,255,0.2);transform:translateX(-5px);box-shadow:0 0 30px rgba(0,240,255,0.5);}
        .co-card{background:rgba(15,22,41,0.8);border:2px solid rgba(0,240,255,0.3);border-radius:28px;padding:36px 40px;margin-bottom:28px;box-shadow:0 8px 32px rgba(0,0,0,0.3);backdrop-filter:blur(10px);}
        .co-card h3{font-size:22px;font-weight:900;background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid rgba(0,240,255,0.3);display:flex;align-items:center;gap:12px;}
        .f-row{display:flex;gap:18px;}
        .summary-item{display:flex;justify-content:space-between;padding:14px 0;border-bottom:2px solid rgba(0,240,255,0.2);font-size:16px;color:#7dd3fc;font-weight:700;}
        .summary-item:last-child{border:none;}
        .summary-total{display:flex;justify-content:space-between;font-size:26px;font-weight:900;padding-top:18px;margin-top:12px;border-top:3px solid rgba(0,240,255,0.4);}
        .place-btn{width:100%;background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);color:#0a0e27;border:none;border-radius:20px;padding:22px;font-size:20px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 10px 40px rgba(0,240,255,0.5);letter-spacing:1px;position:relative;overflow:hidden;}
        .place-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left 0.5s;}
        .place-btn:hover::before{left:100%;}
        .place-btn:hover{transform:translateY(-3px);box-shadow:0 15px 50px rgba(0,240,255,0.7);}
        
        .success-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 50%,rgba(0,240,255,0.2),transparent 70%);}
        .success-box{text-align:center;padding:90px 70px;background:rgba(15,22,41,0.95);border:3px solid rgba(0,240,255,0.5);border-radius:40px;max-width:600px;box-shadow:0 30px 100px rgba(0,240,255,0.4),inset 0 0 80px rgba(0,240,255,0.1);}
        .s-icon{font-size:110px;margin-bottom:36px;display:block;filter:drop-shadow(0 0 30px rgba(0,240,255,0.8));}
        .success-box h2{font-size:44px;font-weight:900;margin-bottom:18px;background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .success-box p{color:#7dd3fc;font-size:19px;line-height:1.8;margin-bottom:44px;font-weight:600;}
        .continue-btn{background:linear-gradient(135deg,#00f0ff,#5773ff,#a44cff);color:#0a0e27;border:none;border-radius:18px;padding:18px 50px;font-size:19px;font-weight:900;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 32px rgba(0,240,255,0.5);position:relative;overflow:hidden;}
        .continue-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left 0.5s;}
        .continue-btn:hover::before{left:100%;}
        .continue-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,240,255,0.7);}
        
        .toast{position:fixed;bottom:40px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,#00f0ff,#5773ff);color:#0a0e27;padding:18px 36px;border-radius:50px;font-weight:900;font-size:16px;opacity:0;pointer-events:none;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);z-index:9999;box-shadow:0 12px 50px rgba(0,240,255,0.6);white-space:nowrap;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .toast.warn{background:linear-gradient(135deg,#ff0064,#ff00ff);box-shadow:0 12px 50px rgba(255,0,100,0.6);color:#fff;}
        
        .spinner{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:28px;}
        .spin{width:64px;height:64px;border:4px solid rgba(0,240,255,0.2);border-top:4px solid #00f0ff;border-radius:50%;animation:spin 0.8s linear infinite;box-shadow:0 0 30px rgba(0,240,255,0.5);}
        @keyframes spin{to{transform:rotate(360deg);}}
        .empty{text-align:center;padding:120px 24px;}
        .empty-icon{font-size:96px;margin-bottom:24px;filter:drop-shadow(0 0 20px rgba(0,240,255,0.5));}
        .empty h3{font-size:32px;font-weight:900;background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:14px;}
        .empty p{color:#7dd3fc;font-size:18px;font-weight:700;}
        
        .footer{background:rgba(10,14,39,0.8);border-top:2px solid rgba(0,240,255,0.3);padding:60px 36px;margin-top:120px;backdrop-filter:blur(10px);box-shadow:0 -8px 32px rgba(0,240,255,0.2);}
        .footer-inner{max-width:1300px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:28px;}
        .footer-brand{font-size:24px;font-weight:900;background:linear-gradient(135deg,#00f0ff,#5773ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .footer-brand span{background:linear-gradient(135deg,#00f0ff,#a44cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .footer-links{display:flex;gap:32px;}
        .footer-link{color:#7dd3fc;font-size:16px;font-weight:800;cursor:pointer;transition:all 0.3s;text-decoration:none;}
        .footer-link:hover{color:#00f0ff;text-shadow:0 0 15px rgba(0,240,255,0.8);transform:translateY(-2px);}
        .footer-copy{color:#4a5568;font-size:14px;width:100%;text-align:center;margin-top:28px;padding-top:28px;border-top:2px solid rgba(0,240,255,0.2);font-weight:700;}
        
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
            <p>Thank you for shopping at<br /><strong style={{color:"#00f0ff"}}>Ghosia Mini Market</strong>.<br />Your groceries are on their way! 🚚</p>
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
                    <span>{item.name} <span style={{color:"#4a5568"}}>×{item.qty}</span></span>
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
                <p style={{fontSize:14,color:"#4a5568",marginTop:8,fontWeight:700}}>🔒 Your payment is secure and encrypted</p>
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
              <div className="spinner"><div className="spin"></div><p style={{color:"#7dd3fc",fontSize:18,fontWeight:800}}>Loading products...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty"><div className="empty-icon">😔</div><h3>Nothing found</h3><p>Try a different search or category</p></div>
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
                <p style={{color:"#4a5568",fontSize:15,marginTop:10,fontWeight:700}}>Fresh groceries delivered to your door in Birmingham</p>
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
