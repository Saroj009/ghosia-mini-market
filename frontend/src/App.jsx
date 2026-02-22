import { useEffect, useState } from "react";

const EMOJI = { Dairy:"🥛", Bakery:"🍞", Meat:"🥩", Grains:"🌾", Vegetables:"🥦", Oils:"🫙", Tinned:"🥫", Drinks:"🧃", Spices:"🌶️", All:"🏪" };

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

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || p.category === category)
  );

  function addToCart(product) {
    setCart(old => {
      const ex = old.find(i => i.id === product.id);
      if (ex) return old.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i);
      return [...old, {...product, qty:1}];
    });
    setToast(`✔ ${product.name} added!`);
    setTimeout(() => setToast(""), 2200);
  }

  function changeQty(id, d) {
    setCart(old => old.map(i => i.id===id ? {...i, qty:i.qty+d} : i).filter(i => i.qty > 0));
  }

  function removeFromCart(id) { setCart(old => old.filter(i => i.id !== id)); }

  const totalItems = cart.reduce((s,i) => s+i.qty, 0);
  const total = cart.reduce((s,i) => s+i.price*i.qty, 0).toFixed(2);

  function placeOrder() {
    if (!form.name || !form.address || !form.phone || !form.card) {
      setToast("⚠️ Please fill in all fields");
      setTimeout(() => setToast(""), 2500);
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

  return (
    <div style={{fontFamily:"'Segoe UI',Arial,sans-serif", background:"#0f1117", minHeight:"100vh", color:"#fff"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:#1a1d27;} ::-webkit-scrollbar-thumb{background:#2ecc71;border-radius:3px;}
        .nav{position:sticky;top:0;z-index:200;background:rgba(15,17,23,0.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(46,204,113,0.12);padding:0 32px;height:68px;display:flex;align-items:center;justify-content:space-between;}
        .logo{display:flex;align-items:center;gap:12px;cursor:pointer;}
        .logo-icon{width:42px;height:42px;background:linear-gradient(135deg,#2ecc71,#1a9e55);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 16px rgba(46,204,113,0.25);}
        .logo-text{font-size:20px;font-weight:900;letter-spacing:-0.5px;color:#fff;}
        .logo-text span{color:#2ecc71;}
        .logo-sub{font-size:10px;color:#4a5568;letter-spacing:1px;text-transform:uppercase;margin-top:1px;}
        .cart-pill{background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;border:none;border-radius:50px;padding:10px 22px;font-weight:800;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:8px;transition:all 0.2s;box-shadow:0 4px 20px rgba(46,204,113,0.3);}
        .cart-pill:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(46,204,113,0.45);}
        .badge{background:#0f1117;color:#2ecc71;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;}
        .hero{background:linear-gradient(160deg,#0f1117 0%,#141820 40%,#0f1117 100%);padding:80px 28px 64px;text-align:center;position:relative;overflow:hidden;border-bottom:1px solid rgba(46,204,113,0.08);}
        .hero::before{content:"";position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:700px;height:700px;background:radial-gradient(circle,rgba(46,204,113,0.1) 0%,transparent 65%);pointer-events:none;}
        .hero::after{content:"";position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(46,204,113,0.3),transparent);}
        .hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.25);color:#2ecc71;border-radius:50px;padding:6px 18px;font-size:12px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:24px;}
        .hero h1{font-size:54px;font-weight:900;line-height:1.1;margin-bottom:18px;background:linear-gradient(135deg,#ffffff 0%,#a8f0c8 50%,#2ecc71 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .hero-sub{font-size:17px;color:#6b7280;margin-bottom:44px;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.6;}
        .stats-row{display:flex;justify-content:center;gap:40px;margin-top:40px;}
        .stat{text-align:center;}
        .stat-num{font-size:28px;font-weight:900;color:#2ecc71;}
        .stat-label{font-size:12px;color:#4a5568;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;}
        .search-wrap{max-width:600px;margin:0 auto;}
        .search-box{display:flex;background:#1a1d27;border:1.5px solid rgba(46,204,113,0.15);border-radius:60px;overflow:hidden;transition:border-color 0.2s;box-shadow:0 8px 40px rgba(0,0,0,0.35);}
        .search-box:focus-within{border-color:rgba(46,204,113,0.5);box-shadow:0 8px 40px rgba(46,204,113,0.1);}
        .search-box input{flex:1;background:transparent;border:none;padding:16px 24px;font-size:15px;color:#fff;outline:none;}
        .search-box input::placeholder{color:#374151;}
        .search-box select{background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;border:none;padding:14px 22px;font-size:13px;font-weight:800;cursor:pointer;outline:none;}
        .body{max-width:1200px;margin:0 auto;padding:44px 24px;}
        .cat-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px;}
        .cat-btn{background:#1a1d27;border:1.5px solid rgba(255,255,255,0.06);color:#6b7280;border-radius:50px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .cat-btn:hover{border-color:rgba(46,204,113,0.35);color:#2ecc71;background:#1e2030;}
        .cat-btn.active{background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;border-color:transparent;font-weight:800;box-shadow:0 4px 16px rgba(46,204,113,0.2);}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
        .section-title{font-size:22px;font-weight:800;color:#f1f5f9;}
        .section-count{background:#1a1d27;color:#6b7280;border-radius:50px;padding:5px 14px;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,0.05);}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;}
        .card{background:#1a1d27;border-radius:20px;border:1px solid rgba(255,255,255,0.05);overflow:hidden;transition:all 0.3s;position:relative;}
        .card:hover{border-color:rgba(46,204,113,0.25);transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(46,204,113,0.1);}
        .card-thumb{height:128px;display:flex;align-items:center;justify-content:center;font-size:52px;position:relative;overflow:hidden;background:linear-gradient(135deg,#1e2030,#161924);}
        .card-body{padding:16px 18px 18px;}
        .card-cat{font-size:10px;font-weight:800;color:#2ecc71;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}
        .card-name{font-size:15px;font-weight:700;color:#e2e8f0;margin-bottom:16px;line-height:1.4;min-height:40px;}
        .card-foot{display:flex;justify-content:space-between;align-items:center;}
        .card-price{font-size:22px;font-weight:900;color:#fff;}
        .in-cart-badge{position:absolute;top:10px;right:10px;background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;}
        .add-btn{background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;border:none;border-radius:12px;width:40px;height:40px;font-size:24px;font-weight:900;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(46,204,113,0.2);}
        .add-btn:hover{transform:scale(1.12);box-shadow:0 6px 24px rgba(46,204,113,0.4);}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(46,204,113,0.15),transparent);margin:52px 0;}
        .cart-card{background:#1a1d27;border:1px solid rgba(255,255,255,0.05);border-radius:18px;padding:18px 22px;margin-bottom:12px;display:flex;align-items:center;gap:16px;transition:border-color 0.2s;}
        .cart-card:hover{border-color:rgba(46,204,113,0.18);}
        .cart-thumb{width:52px;height:52px;background:linear-gradient(135deg,rgba(46,204,113,0.12),rgba(46,204,113,0.05));border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;border:1px solid rgba(46,204,113,0.1);}
        .cart-info{flex:1;}
        .cart-name{font-weight:700;color:#e2e8f0;font-size:15px;}
        .cart-cat{font-size:12px;color:#374151;margin-top:3px;}
        .qty-control{display:flex;align-items:center;gap:10px;background:#0f1117;border-radius:50px;padding:6px 14px;border:1px solid rgba(255,255,255,0.05);}
        .qty-btn{background:none;border:none;color:#2ecc71;font-size:18px;cursor:pointer;font-weight:900;line-height:1;transition:all 0.15s;}
        .qty-btn:hover{color:#fff;transform:scale(1.2);}
        .qty-num{font-weight:900;color:#fff;font-size:15px;min-width:22px;text-align:center;}
        .cart-price{font-weight:900;font-size:16px;color:#2ecc71;min-width:64px;text-align:right;}
        .del-btn{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.12);color:#ef4444;border-radius:10px;width:36px;height:36px;cursor:pointer;font-size:14px;transition:all 0.15s;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .del-btn:hover{background:rgba(239,68,68,0.18);border-color:rgba(239,68,68,0.25);}
        .order-box{background:linear-gradient(135deg,#1a1d27,#1b2035);border:1px solid rgba(46,204,113,0.15);border-radius:24px;padding:28px 32px;margin-top:20px;}
        .order-row{display:flex;justify-content:space-between;font-size:14px;color:#6b7280;padding:7px 0;}
        .order-row:not(:last-child){border-bottom:1px solid rgba(255,255,255,0.03);}
        .order-total{display:flex;justify-content:space-between;font-size:26px;font-weight:900;padding-top:18px;margin-top:10px;border-top:1px solid rgba(46,204,113,0.12);}
        .order-total span:first-child{color:#fff;}
        .order-total span:last-child{color:#2ecc71;}
        .free{color:#2ecc71;font-weight:700;}
        .go-checkout{width:100%;background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;border:none;border-radius:16px;padding:18px;font-size:17px;font-weight:900;cursor:pointer;margin-top:22px;transition:all 0.2s;box-shadow:0 8px 32px rgba(46,204,113,0.25);letter-spacing:0.3px;}
        .go-checkout:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(46,204,113,0.38);}
        .checkout-wrap{max-width:700px;margin:0 auto;padding:40px 24px;}
        .back-btn{background:rgba(46,204,113,0.07);border:1px solid rgba(46,204,113,0.18);color:#2ecc71;border-radius:50px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:36px;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px;}
        .back-btn:hover{background:rgba(46,204,113,0.14);transform:translateX(-2px);}
        .co-card{background:#1a1d27;border:1px solid rgba(255,255,255,0.06);border-radius:22px;padding:28px 32px;margin-bottom:20px;}
        .co-card h3{font-size:16px;font-weight:800;color:#fff;margin-bottom:22px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:8px;}
        .f-label{display:block;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;}
        .f-input{width:100%;padding:13px 16px;background:#0f1117;border:1.5px solid rgba(255,255,255,0.06);border-radius:12px;color:#e2e8f0;font-size:15px;outline:none;transition:all 0.2s;}
        .f-input:focus{border-color:#2ecc71;background:#111318;box-shadow:0 0 0 3px rgba(46,204,113,0.08);}
        .f-input::placeholder{color:#1f2937;}
        .f-group{margin-bottom:16px;}
        .f-row{display:flex;gap:14px;}
        .summary-item{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:14px;color:#6b7280;}
        .summary-item:last-child{border:none;}
        .summary-total{display:flex;justify-content:space-between;font-size:19px;font-weight:900;color:#2ecc71;padding-top:14px;margin-top:8px;border-top:1px solid rgba(46,204,113,0.12);}
        .place-btn{width:100%;background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;border:none;border-radius:16px;padding:18px;font-size:17px;font-weight:900;cursor:pointer;transition:all 0.2s;box-shadow:0 8px 32px rgba(46,204,113,0.25);letter-spacing:0.3px;}
        .place-btn:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(46,204,113,0.38);}
        .success-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(46,204,113,0.1),transparent 60%);}
        .success-box{text-align:center;padding:72px 52px;background:#1a1d27;border:1px solid rgba(46,204,113,0.18);border-radius:32px;max-width:500px;box-shadow:0 32px 100px rgba(0,0,0,0.6);}
        .s-icon{font-size:88px;margin-bottom:28px;display:block;}
        .success-box h2{font-size:34px;font-weight:900;margin-bottom:14px;background:linear-gradient(135deg,#fff,#a8f0c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .success-box p{color:#6b7280;font-size:16px;line-height:1.8;margin-bottom:36px;}
        .continue-btn{background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;border:none;border-radius:14px;padding:14px 40px;font-size:16px;font-weight:800;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px rgba(46,204,113,0.25);}
        .continue-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(46,204,113,0.38);}
        .toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(16px);background:linear-gradient(135deg,#2ecc71,#1a9e55);color:#0f1117;padding:13px 28px;border-radius:50px;font-weight:800;font-size:14px;opacity:0;pointer-events:none;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);z-index:9999;box-shadow:0 8px 32px rgba(46,204,113,0.35);white-space:nowrap;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .toast.warn{background:linear-gradient(135deg,#f59e0b,#d97706);}
        .spinner{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:20px;}
        .spin{width:48px;height:48px;border:3px solid rgba(46,204,113,0.15);border-top:3px solid #2ecc71;border-radius:50%;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .empty{text-align:center;padding:80px 20px;}
        .empty-icon{font-size:72px;margin-bottom:16px;}
        .empty h3{font-size:22px;font-weight:700;color:#374151;margin-bottom:8px;}
        .empty p{color:#1f2937;font-size:15px;}
        .footer{background:#0a0c12;border-top:1px solid rgba(255,255,255,0.04);padding:40px 28px;margin-top:80px;}
        .footer-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
        .footer-brand{font-size:18px;font-weight:900;color:#fff;}
        .footer-brand span{color:#2ecc71;}
        .footer-links{display:flex;gap:24px;}
        .footer-link{color:#374151;font-size:13px;font-weight:600;cursor:pointer;transition:color 0.2s;text-decoration:none;}
        .footer-link:hover{color:#2ecc71;}
        .footer-copy{color:#1f2937;font-size:12px;width:100%;text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.03);}
        @media(max-width:640px){
          .hero h1{font-size:36px;}
          .stats-row{gap:24px;}
          .grid{grid-template-columns:repeat(2,1fr);gap:12px;}
          .f-row{flex-direction:column;}
          .cart-card{flex-wrap:wrap;}
          .nav{padding:0 16px;}
          .body{padding:28px 14px;}
          .co-card{padding:22px 20px;}
          .order-box{padding:22px 20px;}
          .footer-inner{flex-direction:column;text-align:center;}
        }
      `}</style>

      {/* TOAST */}
      <div className={`toast ${toast ? "show" : ""} ${toast.startsWith("⚠️") ? "warn" : ""}`}>{toast}</div>

      {/* SUCCESS */}
      {orderDone && (
        <div className="success-wrap">
          <div className="success-box">
            <span className="s-icon">🎉</span>
            <h2>Order Confirmed!</h2>
            <p>Thank you for shopping at<br /><strong style={{color:"#2ecc71"}}>Ghosia Mini Market</strong>.<br />Your groceries are on their way! 🚚</p>
            <button className="continue-btn" onClick={() => { setOrderDone(false); setPage("shop"); }}>Continue Shopping</button>
          </div>
        </div>
      )}

      {!orderDone && (
        <>
          {/* NAV */}
          <nav className="nav">
            <div className="logo" onClick={() => setPage("shop")}>
              <div className="logo-icon">🛒</div>
              <div>
                <div className="logo-text">Ghosia <span>Market</span></div>
                <div className="logo-sub">Birmingham&apos;s Mini Market</div>
              </div>
            </div>
            <button className="cart-pill" onClick={() => setPage(page==="checkout" ? "shop" : "checkout")}>
              🧺
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
              <span>{totalItems > 0 ? `£${total}` : "Cart"}</span>
            </button>
          </nav>

          {/* CHECKOUT PAGE */}
          {page === "checkout" && (
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
                        <span style={{color:"#d1d5db"}}>{item.name} <span style={{color:"#374151"}}>×{item.qty}</span></span>
                        <span style={{color:"#e2e8f0",fontWeight:700}}>£{(item.price*item.qty).toFixed(2)}</span>
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
                    <p style={{fontSize:12,color:"#1f2937",marginTop:4}}>🔒 Your payment is secure and encrypted</p>
                  </div>

                  <button className="place-btn" onClick={placeOrder}>🛒 Place Order — £{total}</button>
                </>
              )}
            </div>
          )}

          {/* SHOP PAGE */}
          {page === "shop" && (
            <>
              <div className="hero">
                <div className="hero-badge">🛒 Birmingham&apos;s Favourite Mini Market</div>
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
                  <div className="spinner"><div className="spin"></div><p style={{color:"#374151",fontSize:14}}>Loading products...</p></div>
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

                {cart.length > 0 && (
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
                      <div className="order-row"><span>Subtotal ({totalItems} items)</span><span style={{color:"#d1d5db"}}>£{total}</span></div>
                      <div className="order-row"><span>Delivery</span><span className="free">🎉 FREE</span></div>
                      <div className="order-row"><span>Estimated time</span><span style={{color:"#d1d5db"}}>30–45 min</span></div>
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
                    <p style={{color:"#1f2937",fontSize:13,marginTop:6}}>Fresh groceries delivered to your door in Birmingham</p>
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
        </>
      )}
    </div>
  );
}
