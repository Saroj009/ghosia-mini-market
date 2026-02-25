import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// REPLACE WITH YOUR LOCAL IP - Run: ipconfig getifaddr en0
const API_URL = 'http://192.168.1.169:3000/api';

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
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState('shop');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [loginType, setLoginType] = useState('customer'); // 'customer' or 'admin'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', address: '', phone: '', card: '', expiry: '', cvv: '' });
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    loadUser();
    loadProducts();
    loadCart();
  }, []);

  async function loadUser() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.error) setUser(data);
      }
    } catch (e) {
      console.log('Load user error:', e);
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.log('Load products error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadCart() {
    try {
      const saved = await AsyncStorage.getItem('cart');
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      console.log('Load cart error:', e);
    }
  }

  async function saveCart(newCart) {
    setCart(newCart);
    await AsyncStorage.setItem('cart', JSON.stringify(newCart));
  }

  function addToCart(product) {
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      saveCart(cart.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      saveCart([...cart, { ...product, qty: 1 }]);
    }
    Alert.alert('✅ Added', `${product.name} added to cart!`);
  }

  function changeQty(id, delta) {
    saveCart(cart.map(i => i._id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }

  function removeFromCart(id) {
    saveCart(cart.filter(i => i._id !== id));
  }

  async function handleAuth() {
    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const body = authMode === 'register' ? authForm : { email: authForm.email, password: authForm.password };
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        setUser(data.user);
        setPage('shop');
        Alert.alert('✅ Success', `Welcome ${data.user.name}!`);
      } else {
        Alert.alert('❌ Error', data.error || 'Authentication failed');
      }
    } catch (e) {
      Alert.alert('❌ Error', 'Network error');
    }
  }

  async function handleLogout() {
    await AsyncStorage.removeItem('token');
    setUser(null);
    setPage('shop');
    Alert.alert('👋 Logged out');
  }

  async function placeOrder() {
    if (!checkoutForm.name || !checkoutForm.email || !checkoutForm.address || !checkoutForm.phone) {
      Alert.alert('⚠️ Error', 'Please fill all fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: checkoutForm.name,
          customerEmail: checkoutForm.email,
          customerPhone: checkoutForm.phone,
          deliveryAddress: checkoutForm.address,
          items: cart.map(item => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.qty
          })),
          subtotal: cart.reduce((s, i) => s + i.price * i.qty, 0),
          discount: 0,
          total: cart.reduce((s, i) => s + i.price * i.qty, 0)
        })
      });

      const data = await res.json();
      if (data.success) {
        setOrderDone(true);
        saveCart([]);
        setCheckoutForm({ name: '', email: '', address: '', phone: '', card: '', expiry: '', cvv: '' });
      }
    } catch (e) {
      Alert.alert('❌ Error', 'Failed to place order');
    }
  }

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === 'All' || p.category === category)
  );
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);

  if (orderDone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successText}>Thank you! We'll process your order soon.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => { setOrderDone(false); setPage('shop'); }}>
            <Text style={styles.btnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (page === 'auth') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authContainer}>
          <Text style={styles.authEmoji}>{loginType === 'admin' ? '👑' : '🛒'}</Text>
          <Text style={styles.authTitle}>{loginType === 'admin' ? 'Admin Login' : (authMode === 'login' ? 'Customer Login' : 'Register')}</Text>
          
          {loginType === 'customer' && (
            <View style={styles.authTabs}>
              <TouchableOpacity 
                style={[styles.authTab, authMode === 'login' && styles.authTabActive]}
                onPress={() => setAuthMode('login')}
              >
                <Text style={[styles.authTabText, authMode === 'login' && styles.authTabTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.authTab, authMode === 'register' && styles.authTabActive]}
                onPress={() => setAuthMode('register')}
              >
                <Text style={[styles.authTabText, authMode === 'register' && styles.authTabTextActive]}>Register</Text>
              </TouchableOpacity>
            </View>
          )}

          {authMode === 'register' && loginType === 'customer' && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={authForm.name}
              onChangeText={(text) => setAuthForm({ ...authForm, name: text })}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={authForm.email}
            onChangeText={(text) => setAuthForm({ ...authForm, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={authForm.password}
            onChangeText={(text) => setAuthForm({ ...authForm, password: text })}
            secureTextEntry
          />
          {authMode === 'register' && loginType === 'customer' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor="#666"
                value={authForm.phone}
                onChangeText={(text) => setAuthForm({ ...authForm, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#666"
                value={authForm.address}
                onChangeText={(text) => setAuthForm({ ...authForm, address: text })}
              />
            </>
          )}
          <TouchableOpacity style={styles.btnPrimary} onPress={handleAuth}>
            <Text style={styles.btnText}>{loginType === 'admin' ? '👑 Admin Login' : (authMode === 'login' ? '🚀 Login' : '✨ Register')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPage('shop')}>
            <Text style={styles.linkText}>← Back to Shop</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'checkout') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authContainer}>
          <Text style={styles.authTitle}>💳 Checkout</Text>
          
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#666" value={checkoutForm.name} onChangeText={(text) => setCheckoutForm({ ...checkoutForm, name: text })} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={checkoutForm.email} onChangeText={(text) => setCheckoutForm({ ...checkoutForm, email: text })} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Address" placeholderTextColor="#666" value={checkoutForm.address} onChangeText={(text) => setCheckoutForm({ ...checkoutForm, address: text })} />
          <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#666" value={checkoutForm.phone} onChangeText={(text) => setCheckoutForm({ ...checkoutForm, phone: text })} keyboardType="phone-pad" />
          
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <TextInput style={styles.input} placeholder="Card Number" placeholderTextColor="#666" value={checkoutForm.card} onChangeText={(text) => setCheckoutForm({ ...checkoutForm, card: text })} keyboardType="number-pad" />
          <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#666" value={checkoutForm.expiry} onChangeText={(text) => setCheckoutForm({ ...checkoutForm, expiry: text })} />
          <TextInput style={styles.input} placeholder="CVV" placeholderTextColor="#666" value={checkoutForm.cvv} onChangeText={(text) => setCheckoutForm({ ...checkoutForm, cvv: text })} keyboardType="number-pad" secureTextEntry />
          
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>£{total}</Text>
          </View>
          
          <TouchableOpacity style={styles.btnPrimary} onPress={placeOrder}>
            <Text style={styles.btnText}>🚀 Place Order</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPage('cart')}>
            <Text style={styles.linkText}>← Back to Cart</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'cart') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPage('shop')}>
            <Text style={styles.backBtn}>← Shop</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🛒 Cart ({totalItems})</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={styles.content}>
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyEmoji}>🛒</Text>
              <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
          ) : (
            <>
              {cart.map((item) => (
                <View key={item._id} style={styles.cartCard}>
                  <Text style={styles.cartEmoji}>{PRODUCT_EMOJIS[item.name] || '🛒'}</Text>
                  <View style={styles.cartInfo}>
                    <Text style={styles.cartName}>{item.name}</Text>
                    <Text style={styles.cartPrice}>£{(item.price * item.qty).toFixed(2)}</Text>
                  </View>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity onPress={() => changeQty(item._id, -1)}>
                      <Text style={styles.qtyBtn}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{item.qty}</Text>
                    <TouchableOpacity onPress={() => changeQty(item._id, 1)}>
                      <Text style={styles.qtyBtn}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item._id)}>
                    <Text style={styles.deleteBtn}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>£{total}</Text>
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => setPage('checkout')}>
                <Text style={styles.btnText}>Proceed to Checkout 🚀</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛒 Ghosia Market</Text>
          <Text style={styles.headerSubtitle}>Fresh & Authentic</Text>
        </View>
        <View style={styles.headerRight}>
          {user ? (
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.userBadge}>{user.role === 'admin' ? '👑' : '👤'} {user.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={() => { setLoginType('customer'); setAuthMode('login'); setPage('auth'); }}>
                <Text style={styles.loginBtn}>👤 Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setLoginType('admin'); setAuthMode('login'); setPage('auth'); }}>
                <Text style={styles.adminBtn}>👑 Admin</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => setPage('cart')} style={styles.cartBtn}>
            <Text style={styles.cartBtnText}>🛒 {totalItems}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.categoryBtn, category === c && styles.categoryBtnActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {filtered.map((p) => (
            <View key={p._id} style={styles.card}>
              <Text style={styles.cardEmoji}>{PRODUCT_EMOJIS[p.name] || '🛒'}</Text>
              <Text style={styles.cardCategory}>{p.category}</Text>
              <Text style={styles.cardName}>{p.name}</Text>
              <Text style={styles.cardPrice}>£{p.price.toFixed(2)}</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(p)}>
                <Text style={styles.addBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 2, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  userBadge: { color: '#fff', fontSize: 13, fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  loginBtn: { color: '#fff', fontSize: 12, fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  adminBtn: { color: '#fff', fontSize: 12, fontWeight: '800', backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  cartBtn: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  cartBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  searchBox: { padding: 16 },
  searchInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12, color: '#fff', fontSize: 16 },
  categoryRow: { paddingHorizontal: 16, marginBottom: 16 },
  categoryBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  categoryBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  categoryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  categoryTextActive: { color: '#0f0f0f' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { backgroundColor: 'rgba(30,30,30,0.9)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, width: '47%', alignItems: 'center' },
  cardEmoji: { fontSize: 48, marginBottom: 8 },
  cardCategory: { fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '800', marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
  cardPrice: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 12 },
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#0f0f0f', fontWeight: '900', fontSize: 14 },
  content: { flex: 1, padding: 16 },
  cartCard: { backgroundColor: 'rgba(30,30,30,0.9)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartEmoji: { fontSize: 40 },
  cartInfo: { flex: 1 },
  cartName: { fontSize: 16, fontWeight: '800', color: '#fff' },
  cartPrice: { fontSize: 14, color: '#aaa', marginTop: 4 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  qtyBtn: { color: '#fff', fontSize: 20, fontWeight: '900' },
  qtyNum: { color: '#fff', fontSize: 16, fontWeight: '900', minWidth: 24, textAlign: 'center' },
  deleteBtn: { fontSize: 20 },
  emptyCart: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  emptyEmoji: { fontSize: 80, marginBottom: 16 },
  emptyText: { color: '#aaa', fontSize: 18, fontWeight: '700' },
  totalBox: { backgroundColor: 'rgba(30,30,30,0.9)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginTop: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#aaa', fontSize: 18, fontWeight: '700' },
  totalAmount: { color: '#fff', fontSize: 28, fontWeight: '900' },
  btnPrimary: { backgroundColor: '#10b981', borderRadius: 16, padding: 18, marginTop: 8 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  authContainer: { padding: 24 },
  authEmoji: { fontSize: 80, textAlign: 'center', marginBottom: 16 },
  authTitle: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 24 },
  authTabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 50, padding: 4, marginBottom: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  authTab: { flex: 1, paddingVertical: 12, borderRadius: 50, alignItems: 'center' },
  authTabActive: { backgroundColor: '#fff' },
  authTabText: { color: '#aaa', fontWeight: '800', fontSize: 15 },
  authTabTextActive: { color: '#0f0f0f' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, marginBottom: 16 },
  linkText: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 16 },
  backBtn: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginTop: 16, marginBottom: 12 },
  successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successEmoji: { fontSize: 100, marginBottom: 24 },
  successTitle: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 12 },
  successText: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 40, fontWeight: '600' },
});