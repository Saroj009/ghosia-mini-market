import { useEffect, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState("shop");
  const [orderDone, setOrderDone] = useState(false);

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

  function addToCart(product) {
    setCart((old) => {
      const existing = old.find((i) => i.id === product.id);
      if (existing) {
        return old.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...old, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((old) => old.filter((i) => i.id !== id));
  }

  function changeQty(id, delta) {
    setCart((old) =>
      old
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);

  function placeOrder() {
    setOrderDone(true);
    setCart([]);
  }

  const s = {
    page: { fontFamily: "'Segoe UI', sans-serif", background: "#f5f5f5", minHeight: "100vh", margin: 0 },
    nav: { background: "#1a7a4a", color: "white", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    navTitle: { margin: 0, fontSize: 22 },
    cartBtn: { background: "white", color: "#1a7a4a", border: "none", borderRadius: 20, padding: "8px 18px", fontWeight: "bold", cursor: "pointer", fontSize: 14 },
    body: { maxWidth: 750, margin: "0 auto", padding: 20 },
    searchRow: { display: "flex", gap: 10, marginBottom: 20 },
    input: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 },
    select: { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
    card: { background: "white", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between" },
    cardName: { fontWeight: "bold", fontSize: 15, marginBottom: 4 },
    cardCat: { fontSize: 12, color: "#888", marginBottom: 12 },
    cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    price: { fontWeight: "bold", color: "#1a7a4a", fontSize: 16 },
    addBtn: { background: "#1a7a4a", color: "white", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 14 },
    sectionTitle: { fontSize: 20, marginBottom: 16 },
    cartItem: { background: "white", borderRadius: 8, padding: "12px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    qtyRow: { display: "flex", alignItems: "center", gap: 8 },
    qtyBtn: { background: "#eee", border: "none", borderRadius: 4, width: 28, height: 28, cursor: "pointer", fontSize: 16 },
    removeBtn: { background: "none", border: "none", color: "#e53935", cursor: "pointer", fontSize: 13 },
    totalBox: { background: "white", borderRadius: 10, padding: 20, marginTop: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
    checkoutBtn: { width: "100%", background: "#1a7a4a", color: "white", border: "none", borderRadius: 8, padding: "14px", fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 12 },
    backBtn: { background: "none", border: "1px solid #1a7a4a", color: "#1a7a4a", borderRadius: 8, padding: "10px 20px", cursor: "pointer", marginBottom: 20 },
    formGroup: { marginBottom: 14 },
    label: { display: "block", fontSize: 13, marginBottom: 4, color: "#555" },
    formInput: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" },
    successBox: { background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 10, padding: 30, textAlign: "center" },
  };

  if (page === "checkout") {
    return (
      <div style={s.page}>
        <nav style={s.nav}>
          <h1 style={s.navTitle}>🛒 Ghosia Mini Market</h1>
        </nav>
        <div style={s.body}>
          {orderDone ? (
            <div style={s.successBox}>
              <h2>✅ Order Placed!</h2>
              <p>Thank you for shopping at Ghosia Mini Market.</p>
              <button style={s.checkoutBtn} onClick={() => { setOrderDone(false); setPage("shop"); }}>Continue Shopping</button>
            </div>
          ) : (
            <>
              <button style={s.backBtn} onClick={() => setPage("shop")}>← Back to Shop</button>
              <h2 style={s.sectionTitle}>Checkout</h2>
              <div style={s.totalBox}>
                <strong>Order Summary</strong>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span>{item.name} x{item.qty}</span>
                    <span>£{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                  <span>Total</span><span>£{total}</span>
                </div>
              </div>
              <div style={{ ...s.totalBox, marginTop: 16 }}>
                <strong>Delivery Details</strong>
                <div style={{ marginTop: 12 }}>
                  <div style={s.formGroup}><label style={s.label}>Full Name</label><input style={s.formInput} placeholder="e.g. Sara Ahmed" /></div>
                  <div style={s.formGroup}><label style={s.label}>Address</label><input style={s.formInput} placeholder="e.g. 12 Green Lane, Bristol" /></div>
                  <div style={s.formGroup}><label style={s.label}>Phone Number</label><input style={s.formInput} placeholder="e.g. 07700 900000" /></div>
                </div>
              </div>
              <div style={{ ...s.totalBox, marginTop: 16 }}>
                <strong>Payment</strong>
                <div style={{ marginTop: 12 }}>
                  <div style={s.formGroup}><label style={s.label}>Card Number</label><input style={s.formInput} placeholder="1234 5678 9012 3456" maxLength={19} /></div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ ...s.formGroup, flex: 1 }}><label style={s.label}>Expiry Date</label><input style={s.formInput} placeholder="MM/YY" maxLength={5} /></div>
                    <div style={{ ...s.formGroup, flex: 1 }}><label style={s.label}>CVV</label><input style={s.formInput} placeholder="123" maxLength={3} /></div>
                  </div>
                </div>
              </div>
              <button style={s.checkoutBtn} onClick={placeOrder}>Place Order — £{total}</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <h1 style={s.navTitle}>🛒 Ghosia Mini Market</h1>
        <button style={s.cartBtn} onClick={() => setPage("checkout")}>🧺 Cart ({totalItems}) — £{total}</button>
      </nav>
      <div style={s.body}>
        <div style={s.searchRow}>
          <input style={s.input} placeholder="🔍 Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={s.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={s.grid}>
          {filtered.map((p) => (
            <div key={p.id} style={s.card}>
              <div>
                <div style={s.cardName}>{p.name}</div>
                <div style={s.cardCat}>{p.category}</div>
              </div>
              <div style={s.cardBottom}>
                <span style={s.price}>£{p.price.toFixed(2)}</span>
                <button style={s.addBtn} onClick={() => addToCart(p)}>+ Add</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={s.sectionTitle}>🧺 Your Cart</h2>
            {cart.map((item) => (
              <div key={item.id} style={s.cartItem}>
                <span style={{ fontWeight: "bold" }}>{item.name}</span>
                <div style={s.qtyRow}>
                  <button style={s.qtyBtn} onClick={() => changeQty(item.id, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button style={s.qtyBtn} onClick={() => changeQty(item.id, +1)}>+</button>
                  <span style={{ minWidth: 60, textAlign: "right" }}>£{(item.price * item.qty).toFixed(2)}</span>
                  <button style={s.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))}
            <div style={s.totalBox}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: "bold" }}>
                <span>Total ({totalItems} items)</span>
                <span style={{ color: "#1a7a4a" }}>£{total}</span>
              </div>
              <button style={s.checkoutBtn} onClick={() => setPage("checkout")}>Proceed to Checkout →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
