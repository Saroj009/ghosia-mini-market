import { useEffect, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState("shop");
  const [orderDone, setOrderDone] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", card: "", expiry: "", cvv: "" });

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error(err));
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const categoryEmoji = {
    Dairy: "🥛", Bakery: "🍞", Meat: "🥩", Grains: "🌾",
    Vegetables: "🥦", Oils: "🫙", Tinned: "🥫", Drinks: "🧃", Spices: "🌶️",
  };

  function addToCart(product) {
    setCart((old) => {
      const existing = old.find((i) => i.id === product.id);
      if (existing) return old.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...old, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id) { setCart((old) => old.filter((i) => i.id !== id)); }

  function changeQty(id, delta) {
    setCart((old) => old.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0));
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);

  function placeOrder() { setOrderDone(true); setCart([]); }

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f0f4f8", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        .nav { background: linear-gradient(135deg, #1a7a4a 0%, #0d5c35 100%); color: white; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.15); position: sticky; top: 0; z-index: 100; }
        .nav-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .nav-title span { color: #a8e6c1; }
        .cart-btn { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1.5px solid rgba(255,255,255,0.3); color: white; border-radius: 50px; padding: 8px 20px; font-weight: 700; cursor: pointer; font-size: 14px; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .cart-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
        .cart-badge { background: #ff6b35; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }
        .hero { background: linear-gradient(135deg, #1a7a4a 0%, #0d5c35 100%); color: white; padding: 48px 32px 64px; text-align: center; }
        .hero h2 { font-size: 36px; font-weight: 800; margin-bottom: 8px; }
        .hero p { font-size: 16px; opacity: 0.85; margin-bottom: 32px; }
        .search-bar { max-width: 600px; margin: 0 auto; display: flex; gap: 10px; }
        .search-input { flex: 1; padding: 14px 20px; border-radius: 50px; border: none; font-size: 15px; outline: none; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .search-select { padding: 14px 20px; border-radius: 50px; border: none; font-size: 14px; font-weight: 600; outline: none; background: white; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .body { max-width: 1100px; margin: 0 auto; padding: 32px 20px; }
        .cat-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
        .cat-pill { padding: 8px 18px; border-radius: 50px; border: 2px solid #dde3ea; background: white; cursor: pointer; font-size: 13px; font-weight: 600; color: #555; transition: all 0.2s; }
        .cat-pill:hover { border-color: #1a7a4a; color: #1a7a4a; }
        .cat-pill.active { background: #1a7a4a; color: white; border-color: #1a7a4a; }
        .section-title { font-size: 22px; font-weight: 800; color: #1a2e1f; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); transition: all 0.25s; cursor: default; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
        .card-img { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); height: 120px; display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .card-body { padding: 14px 16px 16px; }
        .card-cat { font-size: 11px; font-weight: 700; color: #1a7a4a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .card-name { font-size: 15px; font-weight: 700; color: #1a2e1f; margin-bottom: 14px; line-height: 1.3; }
        .card-bottom { display: flex; justify-content: space-between; align-items: center; }
        .card-price { font-size: 20px; font-weight: 800; color: #1a7a4a; }
        .add-btn { background: #1a7a4a; color: white; border: none; border-radius: 10px; padding: 8px 16px; font-weight: 700; cursor: pointer; font-size: 18px; transition: all 0.2s; line-height: 1; }
        .add-btn:hover { background: #0d5c35; transform: scale(1.05); }
        .cart-section { margin-top: 48px; }
        .cart-item { background: white; border-radius: 14px; padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .cart-item-name { font-weight: 700; color: #1a2e1f; font-size: 15px; }
        .cart-item-cat { font-size: 12px; color: #888; margin-top: 2px; }
        .qty-row { display: flex; align-items: center; gap: 10px; }
        .qty-btn { background: #f0f4f8; border: none; border-radius: 8px; width: 32px; height: 32px; font-size: 18px; cursor: pointer; font-weight: 700; color: #1a7a4a; transition: all 0.15s; }
        .qty-btn:hover { background: #1a7a4a; color: white; }
        .qty-num { font-weight: 800; font-size: 16px; min-width: 24px; text-align: center; }
        .item-price { font-weight: 800; color: #1a7a4a; font-size: 16px; min-width: 64px; text-align: right; }
        .remove-btn { background: none; border: none; color: #ccc; cursor: pointer; font-size: 18px; transition: color 0.15s; margin-left: 8px; }
        .remove-btn:hover { color: #e53935; }
        .total-box { background: linear-gradient(135deg, #1a7a4a, #0d5c35); color: white; border-radius: 16px; padding: 24px 28px; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; font-size: 13px; opacity: 0.85; margin-bottom: 6px; }
        .total-final { display: flex; justify-content: space-between; font-size: 24px; font-weight: 800; margin: 12px 0 20px; }
        .checkout-btn { width: 100%; background: white; color: #1a7a4a; border: none; border-radius: 12px; padding: 16px; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .checkout-btn:hover { background: #f0fdf4; transform: translateY(-1px); }
        .empty-cart { text-align: center; padding: 60px 20px; color: #aaa; }
        .empty-cart-icon { font-size: 64px; margin-bottom: 16px; }
        .back-btn { background: none; border: 2px solid #1a7a4a; color: #1a7a4a; border-radius: 50px; padding: 10px 24px; font-weight: 700; cursor: pointer; font-size: 14px; margin-bottom: 28px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .back-btn:hover { background: #1a7a4a; color: white; }
        .checkout-page { max-width: 680px; margin: 0 auto; padding: 32px 20px; }
        .checkout-card { background: white; border-radius: 20px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.07); margin-bottom: 20px; }
        .checkout-card h3 { font-size: 17px; font-weight: 800; color: #1a2e1f; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #f0f4f8; display: flex; align-items: center; gap: 8px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 12px 16px; border-radius: 10px; border: 2px solid #e8edf2; font-size: 15px; outline: none; transition: border-color 0.2s; background: #fafbfc; }
        .form-input:focus { border-color: #1a7a4a; background: white; }
        .form-row { display: flex; gap: 14px; }
        .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f4f8; font-size: 14px; }
        .order-item:last-child { border-bottom: none; }
        .order-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 18px; color: #1a7a4a; margin-top: 14px; padding-top: 14px; border-top: 2px solid #e8f5e9; }
        .place-order-btn { width: 100%; background: linear-gradient(135deg, #1a7a4a, #0d5c35); color: white; border: none; border-radius: 14px; padding: 18px; font-size: 17px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 20px rgba(26,122,74,0.3); }
        .place-order-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(26,122,74,0.4); }
        .success-page { max-width: 500px; margin: 80px auto; padding: 0 20px; text-align: center; }
        .success-icon { font-size: 80px; margin-bottom: 24px; }
        .success-card { background: white; border-radius: 24px; padding: 48px 40px; box-shadow: 0 8px 40px rgba(0,0,0,0.1); }
        .success-card h2 { font-size: 28px; font-weight: 800; color: #1a2e1f; margin-bottom: 10px; }
        .success-card p { color: #666; font-size: 15px; margin-bottom: 28px; line-height: 1.6; }
        .continue-btn { background: linear-gradient(135deg, #1a7a4a, #0d5c35); color: white; border: none; border-radius: 14px; padding: 16px 40px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .continue-btn:hover { transform: translateY(-2px); }
        .no-products { text-align: center; padding: 60px; color: #aaa; font-size: 16px; }
        @media (max-width: 600px) {
          .nav { padding: 0 16px; }
          .hero { padding: 32px 16px 48px; }
          .hero h2 { font-size: 26px; }
          .search-bar { flex-direction: column; }
          .form-row { flex-direction: column; }
          .grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-title">🛒 Ghosia <span>Mini Market</span></div>
        <button className="cart-btn" onClick={() => setPage(page === "shop" ? "checkout" : "shop")}>
          🧺 Cart
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          {totalItems > 0 && <span>£{total}</span>}
        </button>
      </nav>

      {/* SUCCESS PAGE */}
      {orderDone && (
        <div className="success-page">
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h2>Order Placed!</h2>
            <p>Thank you for shopping at Ghosia Mini Market.<br />Your order is being prepared and will be delivered soon.</p>
            <button className="continue-btn" onClick={() => { setOrderDone(false); setPage("shop"); }}>Continue Shopping</button>
          </div>
        </div>
      )}

      {/* CHECKOUT PAGE */}
      {!orderDone && page === "checkout" && (
        <div className="checkout-page">
          <button className="back-btn" onClick={() => setPage("shop")}>← Back to Shop</button>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🧺</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Your cart is empty</h3>
              <p>Add some products first!</p>
            </div>
          ) : (
            <>
              <div className="checkout-card">
                <h3>🧾 Order Summary</h3>
                {cart.map((item) => (
                  <div className="order-item" key={item.id}>
                    <span>{item.name} <span style={{ color: "#aaa" }}>×{item.qty}</span></span>
                    <span style={{ fontWeight: 700 }}>£{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="order-total">
                  <span>Total</span>
                  <span>£{total}</span>
                </div>
              </div>

              <div className="checkout-card">
                <h3>🚚 Delivery Details</h3>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="e.g. Sara Ahmed" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <input className="form-input" placeholder="e.g. 12 Green Lane, Bristol, BS1 1AA" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="e.g. 07700 900000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div className="checkout-card">
                <h3>💳 Payment Details</h3>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input className="form-input" placeholder="1234  5678  9012  3456" maxLength={19} value={form.card} onChange={e => setForm({...form, card: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Expiry Date</label>
                    <input className="form-input" placeholder="MM / YY" maxLength={7} value={form.expiry} onChange={e => setForm({...form, expiry: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">CVV</label>
                    <input className="form-input" placeholder="• • •" maxLength={3} type="password" value={form.cvv} onChange={e => setForm({...form, cvv: e.target.value})} />
                  </div>
                </div>
              </div>

              <button className="place-order-btn" onClick={placeOrder}>Place Order — £{total}</button>
            </>
          )}
        </div>
      )}

      {/* SHOP PAGE */}
      {!orderDone && page === "shop" && (
        <>
          <div className="hero">
            <h2>Fresh Groceries Delivered 🥬</h2>
            <p>Quality products from your local Ghosia Mini Market</p>
            <div className="search-bar">
              <input
                className="search-input"
                placeholder="🔍  Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="search-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="body">
            {/* Category pills */}
            <div className="cat-pills">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`cat-pill ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {categoryEmoji[c] || "🏪"} {c}
                </button>
              ))}
            </div>

            {/* Products grid */}
            <div className="section-title">🏪 {category === "All" ? "All Products" : category} ({filtered.length})</div>
            {filtered.length === 0 ? (
              <div className="no-products">😔 No products found. Try a different search.</div>
            ) : (
              <div className="grid">
                {filtered.map((p) => (
                  <div className="card" key={p.id}>
                    <div className="card-img">{categoryEmoji[p.category] || "🛒"}</div>
                    <div className="card-body">
                      <div className="card-cat">{p.category}</div>
                      <div className="card-name">{p.name}</div>
                      <div className="card-bottom">
                        <span className="card-price">£{p.price.toFixed(2)}</span>
                        <button className="add-btn" onClick={() => addToCart(p)}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart */}
            {cart.length > 0 && (
              <div className="cart-section">
                <div className="section-title">🧺 Your Cart</div>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-cat">{item.category}</div>
                    </div>
                    <div className="qty-row">
                      <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(item.id, +1)}>+</button>
                      <span className="item-price">£{(item.price * item.qty).toFixed(2)}</span>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>
                  </div>
                ))}
                <div className="total-box">
                  <div className="total-row"><span>Subtotal ({totalItems} items)</span><span>£{total}</span></div>
                  <div className="total-row"><span>Delivery</span><span>FREE 🎉</span></div>
                  <div className="total-final"><span>Total</span><span>£{total}</span></div>
                  <button className="checkout-btn" onClick={() => setPage("checkout")}>Proceed to Checkout →</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
