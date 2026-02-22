import { useEffect, useState } from "react";

const EMOJI = { Dairy:"🥛", Bakery:"🍞", Meat:"🥩", Grains:"🌾", Vegetables:"🥦", Oils:"🫙", Tinned:"🥫", Drinks:"🧃", Spices:"🌶️", All:"🏪" };

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState("shop");
  const [orderDone, setOrderDone] = useState(false);
  const [form, setForm] = useState({ name:"", address:"", phone:"", card:"", expiry:"", cvv:"" });
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(r => r.json()).then(setProducts).catch(console.error);
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
    setToast(`${product.name} added to cart!`);
    setTimeout(() => setToast(""), 2000);
  }

  function changeQty(id, d) {
    setCart(old => old.map(i => i.id===id ? {...i, qty:i.qty+d} : i).filter(i => i.qty > 0));
  }

  function removeFromCart(id) { setCart(old => old.filter(i => i.id !== id)); }

  const totalItems = cart.reduce((s,i) => s+i.qty, 0);
  const total = cart.reduce((s,i) => s+i.price*i.qty, 0).toFixed(2);

  function placeOrder() { setOrderDone(true); setCart([]); setPage("shop"); }

  return (
    <div style={{fontFamily:"'Segoe UI',Arial,sans-serif", background:"#0f1117", minHeight:"100vh", color:"#fff"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:#1a1d27;} ::-webkit-scrollbar-thumb{background:#2ecc71;border-radius:3px;}
        .nav{position:sticky;top:0;z-index:200;background:rgba(15,17,23,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(46,204,113,0.15);padding:0 28px;height:68px;display:flex;align-items:center;justify-content:space-between;}
        .logo{display:flex;align-items:center;gap:10px;}
        .logo-icon{width:40px;height:40px;background:linear-gradient(135deg,#2ecc71,#27ae60);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;}
        .logo-text{font-size:20px;font-weight:800;letter-spacing:-0.5px;}
        .logo-text span{color:#2ecc71;}
        .nav-right{display:flex;align-items:center;gap:12px;}
        .cart-pill{background:linear-gradient(135deg,#2ecc71,#27ae60);color:#0f1117;border:none;border-radius:50px;padding:10px 20px;font-weight:800;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:8px;transition:all 0.2s;box-shadow:0 4px 20px rgba(46,204,113,0.3);}
        .cart-pill:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(46,204,113,0.4);}
        .cart-pill .badge{background:#0f1117;color:#2ecc71;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;}
        .hero{background:linear-gradient(135deg,#0f1117 0%,#1a1d27 50%,#0f1117 100%);padding:72px 28px 56px;text-align:center;position:relative;overflow:hidden;border-bottom:1px solid rgba(46,204,113,0.1);}
        .hero::before{content:"";position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(46,204,113,0.12) 0%,transparent 70%);pointer-events:none;}
        .hero-tag{display:inline-block;background:rgba(46,204,113,0.12);border:1px solid rgba(46,204,113,0.3);color:#2ecc71;border-radius:50px;padding:6px 18px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;}
        .hero h1{font-size:52px;font-weight:900;line-height:1.1;margin-bottom:16px;background:linear-gradient(135deg,#fff 0%,#a8f0c8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .hero p{font-size:17px;color:#8892a4;margin-bottom:40px;}
        .search-wrap{max-width:580px;margin:0 auto;position:relative;}
        .search-box{display:flex;background:#1a1d27;border:1.5px solid rgba(46,204,113,0.2);border-radius:60px;overflow:hidden;transition:border-color 0.2s;box-shadow:0 8px 40px rgba(0,0,0,0.3);}
        .search-box:focus-within{border-color:#2ecc71;}
        .search-box input{flex:1;background:transparent;border:none;padding:16px 24px;font-size:15px;color:#fff;outline:none;}
        .search-box input::placeholder{color:#4a5568;}
        .search-box select{background:#2ecc71;color:#0f1117;border:none;padding:12px 20px;font-size:13px;font-weight:700;cursor:pointer;outline:none;border-radius:0 60px 60px 0;}
        .body{max-width:1200px;margin:0 auto;padding:40px 20px;}
        .cat-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px;}
        .cat-btn{background:#1a1d27;border:1.5px solid rgba(255,255,255,0.07);color:#8892a4;border-radius:50px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .cat-btn:hover{border-color:rgba(46,204,113,0.4);color:#2ecc71;}
        .cat-btn.active{background:linear-gradient(135deg,#2ecc71,#27ae60);color:#0f1117;border-color:transparent;box-shadow:0 4px 16px rgba(46,204,113,0.25);font-weight:800;}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
        .section-title{font-size:22px;font-weight:800;color:#fff;}
        .section-count{background:#1a1d27;color:#8892a4;border-radius:50px;padding:4px 14px;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,0.06);}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px;}
        .card{background:#1a1d27;border-radius:20px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;transition:all 0.25s;position:relative;}
        .card:hover{border-color:rgba(46,204,113,0.3);transform:translateY(-5px);box-shadow:0 16px 48px rgba(0,0,0,0.4);}
        .card-thumb{height:130px;display:flex;align-items:center;justify-content:center;font-size:52px;position:relative;overflow:hidden;}
        .card-thumb::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(46,204,113,0.08),rgba(39,174,96,0.04));}
        .card-body{padding:16px;}
        .card-cat{font-size:11px;font-weight:700;color:#2ecc71;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;}
        .card-name{font-size:15px;font-weight:700;color:#e2e8f0;margin-bottom:16px;line-height:1.4;}
        .card-foot{display:flex;justify-content:space-between;align-items:center;}
        .card-price{font-size:22px;font-weight:900;color:#fff;}
        .card-price span{font-size:13px;font-weight:600;color:#8892a4;}
        .add-btn{background:linear-gradient(135deg,#2ecc71,#27ae60);color:#0f1117;border:none;border-radius:12px;width:40px;height:40px;font-size:22px;font-weight:900;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(46,204,113,0.2);}
        .add-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(46,204,113,0.35);}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(46,204,113,0.2),transparent);margin:48px 0;}
        .cart-section{}
        .cart-card{background:#1a1d27;border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:20px 24px;margin-bottom:14px;display:flex;align-items:center;gap:16px;transition:all 0.2s;}
        .cart-card:hover{border-color:rgba(46,204,113,0.2);}
        .cart-thumb{width:52px;height:52px;background:rgba(46,204,113,0.1);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;}
        .cart-info{flex:1;}
        .cart-name{font-weight:700;color:#e2e8f0;font-size:15px;}
        .cart-cat{font-size:12px;color:#4a5568;margin-top:2px;}
        .qty-control{display:flex;align-items:center;gap:10px;background:#0f1117;border-radius:50px;padding:6px 12px;}
        .qty-btn{background:none;border:none;color:#2ecc71;font-size:20px;cursor:pointer;font-weight:700;width:24px;height:24px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
        .qty-btn:hover{color:#fff;}
        .qty-num{font-weight:800;color:#fff;font-size:15px;min-width:20px;text-align:center;}
        .cart-price{font-weight:800;font-size:17px;color:#2ecc71;min-width:60px;text-align:right;}
        .del-btn{background:rgba(239,68,68,0.1);border:none;color:#ef4444;border-radius:10px;width:36px;height:36px;cursor:pointer;font-size:16px;transition:all 0.15s;display:flex;align-items:center;justify-content:center;}
        .del-btn:hover{background:rgba(239,68,68,0.2);}
        .order-box{background:linear-gradient(135deg,#1a1d27,#1e2332);border:1px solid rgba(46,204,113,0.2);border-radius:24px;padding:28px 32px;margin-top:24px;}
        .order-row{display:flex;justify-content:space-between;font-size:14px;color:#8892a4;margin-bottom:10px;}
        .order-total{display:flex;justify-content:space-between;font-size:26px;font-weight:900;color:#fff;padding-top:16px;margin-top:8px;border-top:1px solid rgba(255,255,255,0.07);}
        .order-total span:last-child{color:#2ecc71;}
        .free-tag{color:#2ecc71;font-weight:700;}
        .go-checkout{width:100%;background:linear-gradient(135deg,#2ecc71,#27ae60);color:#0f1117;border:none;border-radius:16px;padding:18px;font-size:17px;font-weight:900;cursor:pointer;margin-top:20px;transition:all 0.2s;letter-spacing:0.3px;box-shadow:0 8px 32px rgba(46,204,113,0.25);}
        .go-checkout:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(46,204,113,0.35);}
        .checkout-wrap{max-width:680px;margin:0 auto;padding:36px 20px;}
        .back-btn{background:rgba(46,204,113,0.08);border:1px solid rgba(46,204,113,0.2);color:#2ecc71;border-radius:50px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:32px;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px;}
        .back-btn:hover{background:rgba(46,204,113,0.15);}
        .co-card{background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:22px;padding:28px 30px;margin-bottom:20px;}
        .co-card h3{font-size:16px;font-weight:800;color:#fff;margin-bottom:22px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:8px;}
        .f-label{display:block;font-size:11px;font-weight:700;color:#4a5568;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;}
        .f-input{width:100%;padding:13px 16px;background:#0f1117;border:1.5px solid rgba(255,255,255,0.07);border-radius:12px;color:#e2e8f0;font-size:15px;outline:none;transition:border-color 0.2s;}
        .f-input:focus{border-color:#2ecc71;}
        .f-input::placeholder{color:#2d3748;}
        .f-group{margin-bottom:16px;}
        .f-row{display:flex;gap:14px;}
        .summary-item{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:14px;color:#8892a4;}
        .summary-item:last-child{border:none;}
        .summary-total{display:flex;justify-content:space-between;font-size:18px;font-weight:800;color:#2ecc71;padding-top:14px;margin-top:6px;border-top:1px solid rgba(46,204,113,0.15);}
        .place-btn{width:100%;background:linear-gradient(135deg,#2ecc71,#27ae60);color:#0f1117;border:none;border-radius:16px;padding:18px;font-size:17px;font-weight:900;cursor:pointer;transition:all 0.2s;box-shadow:0 8px 32px rgba(46,204,113,0.25);letter-spacing:0.3px;}
        .place-btn:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(46,204,113,0.35);}
        .success-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(46,204,113,0.12),transparent 60%);}
        .success-box{text-align:center;padding:64px 48px;background:#1a1d27;border:1px solid rgba(46,204,113,0.2);border-radius:32px;max-width:480px;box-shadow:0 24px 80px rgba(0,0,0,0.5);}
        .success-icon{font-size:80px;margin-bottom:24px;display:block;}
        .success-box h2{font-size:32px;font-weight:900;margin-bottom:12px;}
        .success-box p{color:#8892a4;font-size:16px;line-height:1.7;margin-bottom:32px;}
        .continue-btn{background:linear-gradient(135deg,#2ecc71,#27ae60);color:#0f1117;border:none;border-radius:14px;padding:14px 36px;font-size:16px;font-weight:800;cursor:pointer;transition:all 0.2s;}
        .continue-btn:hover{transform:translateY(-2px);}
        .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,#2ecc71,#27ae60);color:#0f1117;padding:12px 28px;border-radius:50px;font-weight:700;font-size:14px;opacity:0;pointer-events:none;transition:all 0.3s;z-index:1000;box-shadow:0 8px 32px rgba(46,204,113,0.3);}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .empty{text-align:center;padding:80px 20px;color:#2d3748;}
        .empty-icon{font-size:72px;margin-bottom:16px;}
        .empty h3{font-size:22px;font-weight:700;margin-bottom:8px;color:#4a5568;}
        @media(max-width:640px){
          .hero h1{font-size:34px;}
          .search-box{flex-direction:column;border-radius:20px;}
          .search-box select{border-radius:0 0 20px 20px;}
          .grid{grid-template-columns:repeat(2,1fr);gap:12px;}
          .f-row{flex-direction:column;}
          .cart-card{flex-wrap:wrap;}
          .nav{padding:0 16px;}
          .body{padding:24px 14px;}
        }
      `}</style>

      {/* TOAST */}
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>

      {/* SUCCESS */}
      {orderDone && (
        <div className="success-wrap">
          <div className="success-box">
            <span className="success-icon">🎉</span>
            <h2>Order Confirmed!</h2>
            <p>Thank you for shopping at<br /><strong style={{color:"#2ecc71"}}>Ghosia Mini Market</strong>.<br />Your order is on its way!</p>
            <button className="continue-btn" onClick={() => { setOrderDone(false); setPage("shop"); }}>Continue Shopping</button>
          </div>
        </div>
      )}

      {!orderDone && (
        <>
          {/* NAV */}
          <nav className="nav">
            <div className="logo">
              <div className="logo-icon">🛒</div>
              <div className="logo-text">Ghosia <span>Market</span></div>
            </div>
            <div className="nav-right">
              <button className="cart-pill" onClick={() => setPage(page==="checkout" ? "shop" : "checkout")}>
                🧺
                {totalItems > 0 && <span className="badge">{totalItems}</span>}
                <span>{totalItems > 0 ? `£${total}` : "Cart"}</span>
              </button>
            </div>
          </nav>

          {/* CHECKOUT */}
          {page === "checkout" && (
            <div className="checkout-wrap">
              <button className="back-btn" onClick={() => setPage("shop")}>← Back to Shop</button>
              {cart.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🧺</div>
                  <h3>Your cart is empty</h3>
                  <p style={{color:"#4a5568"}}>Go add some products first!</p>
                </div>
              ) : (
                <>
                  <div className="co-card">
                    <h3>🧾 Order Summary</h3>
                    {cart.map(item => (
                      <div className="summary-item" key={item.id}>
                        <span>{item.name} <span style={{color:"#4a5568"}}>×{item.qty}</span></span>
                        <span style={{color:"#e2e8f0",fontWeight:700}}>£{(item.price*item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="summary-total"><span>Total</span><span>£{total}</span></div>
                  </div>

                  <div className="co-card">
                    <h3>🚚 Delivery Details</h3>
                    <div className="f-group"><label className="f-label">Full Name</label><input className="f-input" placeholder="Sara Ahmed" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                    <div className="f-group"><label className="f-label">Delivery Address</label><input className="f-input" placeholder="12 Green Lane, Bristol, BS1 1AA" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
                    <div className="f-group"><label className="f-label">Phone Number</label><input className="f-input" placeholder="07700 900000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                  </div>

                  <div className="co-card">
                    <h3>💳 Payment</h3>
                    <div className="f-group"><label className="f-label">Card Number</label><input className="f-input" placeholder="1234  5678  9012  3456" maxLength={19} value={form.card} onChange={e=>setForm({...form,card:e.target.value})} /></div>
                    <div className="f-row">
                      <div className="f-group" style={{flex:1}}><label className="f-label">Expiry</label><input className="f-input" placeholder="MM / YY" maxLength={7} value={form.expiry} onChange={e=>setForm({...form,expiry:e.target.value})} /></div>
                      <div className="f-group" style={{flex:1}}><label className="f-label">CVV</label><input className="f-input" placeholder="•••" maxLength={3} type="password" value={form.cvv} onChange={e=>setForm({...form,cvv:e.target.value})} /></div>
                    </div>
                  </div>

                  <button className="place-btn" onClick={placeOrder}>🛒 Place Order — £{total}</button>
                </>
              )}
            </div>
          )}

          {/* SHOP */}
          {page === "shop" && (
            <>
              <div className="hero">
                <div className="hero-tag">🛒 Bristol&apos;s Favourite Mini Market</div>
                <h1>Fresh Groceries<br />Delivered Fast</h1>
                <p>Quality products straight from Ghosia Mini Market to your door</p>
                <div className="search-wrap">
                  <div className="search-box">
                    <input placeholder="🔍  Search milk, rice, spices..." value={search} onChange={e=>setSearch(e.target.value)} />
                    <select value={category} onChange={e=>setCategory(e.target.value)}>
                      {categories.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
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

                {filtered.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">😔</div>
                    <h3>Nothing found</h3>
                    <p style={{color:"#4a5568"}}>Try a different search or category</p>
                  </div>
                ) : (
                  <div className="grid">
                    {filtered.map(p => (
                      <div className="card" key={p.id}>
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
                    ))}
                  </div>
                )}

                {cart.length > 0 && (
                  <>
                    <div className="divider"/>
                    <div className="section-header">
                      <div className="section-title">🧺 Your Cart</div>
                      <div className="section-count">{totalItems} items</div>
                    </div>
                    <div className="cart-section">
                      {cart.map(item => (
                        <div className="cart-card" key={item.id}>
                          <div className="cart-thumb">{EMOJI[item.category]||""}</div>
                          <div className="cart-info">
                            <div className="cart-name">{item.name}</div>
                            <div className="cart-cat">{item.category}</div>
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
                        <div className="order-row"><span>Subtotal</span><span>£{total}</span></div>
                        <div className="order-row"><span>Delivery</span><span className="free-tag">🎉 FREE</span></div>
                        <div className="order-row"><span>Estimated time</span><span>30-45 min</span></div>
                        <div className="order-total"><span>Total</span><span>£{total}</span></div>
                        <button className="go-checkout" onClick={()=>setPage("checkout")}>Proceed to Checkout →</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
