import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Fetching products from:', API_URL);
    fetch(`${API_URL}/products`)
      .then(r => r.json())
      .then(data => {
        console.log('✅ Got products:', data.length);
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error:', err);
        setLoading(false);
      });
  }, []);

  console.log('🎨 Rendering App, products:', products.length, 'loading:', loading);

  return (
    <div style={{
      background: '#0f0f0f',
      minHeight: '100vh',
      color: 'white',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🛒 Ghosia Mini Market</h1>
      
      {loading ? (
        <div style={{ fontSize: '24px' }}>⏳ Loading products...</div>
      ) : (
        <div>
          <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Found {products.length} products!</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {products.slice(0, 12).map(p => (
              <div key={p._id} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.3s'
              }}>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{p.name}</h3>
                <p style={{ color: '#aaa', marginBottom: '10px' }}>{p.category}</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>£{p.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
