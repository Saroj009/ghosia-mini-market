import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Product form states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", price: "", category: "", stock: 100, image: "" });
  const [uploading, setUploading] = useState(false);

  // Review form states
  const [showAddReview, setShowAddReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ name: "", email: "", rating: 5, review: "" });

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadCustomers();
    loadReviews();
    loadNotifications();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Load products error:', error);
    }
  }

  async function loadOrders() {
    // Mock orders for now - replace with real API
    const mockOrders = [
      { id: "ORD001", customerName: "John Doe", customerEmail: "john@example.com", total: 45.99, items: 5, status: "Completed", date: "2026-02-20", address: "123 Main St, Birmingham" },
      { id: "ORD002", customerName: "Jane Smith", customerEmail: "jane@example.com", total: 78.50, items: 8, status: "Completed", date: "2026-02-21", address: "456 Oak Ave, Birmingham" },
      { id: "ORD003", customerName: "Bob Wilson", customerEmail: "bob@example.com", total: 32.25, items: 3, status: "Pending", date: "2026-02-22", address: "789 Elm Rd, Birmingham" },
      { id: "ORD004", customerName: "Alice Brown", customerEmail: "alice@example.com", total: 156.80, items: 12, status: "Processing", date: "2026-02-22", address: "321 Pine St, Birmingham" },
      { id: "ORD005", customerName: "Charlie Davis", customerEmail: "charlie@example.com", total: 91.40, items: 7, status: "Completed", date: "2026-02-23", address: "654 Birch Ln, Birmingham" },
      { id: "ORD006", customerName: "Diana Prince", customerEmail: "diana@example.com", total: 67.20, items: 4, status: "Pending", date: "2026-02-23", address: "987 Cedar Dr, Birmingham" },
    ];
    setOrders(mockOrders);
  }

  async function loadCustomers() {
    // Mock customers for now - replace with real API
    setCustomers([
      { id: 1, name: "John Doe", email: "john@example.com", phone: "0121-234-5678", totalOrders: 12, totalSpent: 345.60, joinDate: "2025-11-15" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "0121-345-6789", totalOrders: 8, totalSpent: 234.50, joinDate: "2025-12-01" },
      { id: 3, name: "Bob Wilson", email: "bob@example.com", phone: "0121-456-7890", totalOrders: 5, totalSpent: 167.25, joinDate: "2026-01-10" },
      { id: 4, name: "Alice Brown", email: "alice@example.com", phone: "0121-567-8901", totalOrders: 15, totalSpent: 567.80, joinDate: "2025-10-20" },
      { id: 5, name: "Charlie Davis", email: "charlie@example.com", phone: "0121-678-9012", totalOrders: 9, totalSpent: 289.40, joinDate: "2025-12-15" },
    ]);
  }

  function loadReviews() {
    const savedReviews = localStorage.getItem('ghosia_reviews');
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        setReviews([]);
      }
    }
  }

  function loadNotifications() {
    const savedNotifications = localStorage.getItem('ghosia_admin_notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (e) {
        setNotifications([]);
      }
    } else {
      // Initialize with sample notifications
      const initialNotifications = [
        { id: 1, type: "order", title: "New Order Received", message: "Order #ORD006 from Diana Prince - £67.20", time: "5 minutes ago", read: false },
        { id: 2, type: "delivery", title: "Order Delivered", message: "Order #ORD005 delivered to Charlie Davis", time: "2 hours ago", read: false },
        { id: 3, type: "review", title: "New Customer Review", message: "Bikash Rai left a 5-star review", time: "1 day ago", read: false },
        { id: 4, type: "order", title: "Order Pending", message: "Order #ORD003 from Bob Wilson is pending", time: "2 days ago", read: true },
      ];
      localStorage.setItem('ghosia_admin_notifications', JSON.stringify(initialNotifications));
      setNotifications(initialNotifications);
    }
  }

  function saveReviews(updatedReviews) {
    localStorage.setItem('ghosia_reviews', JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
  }

  function saveNotifications(updatedNotifications) {
    localStorage.setItem('ghosia_admin_notifications', JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (!data.error) {
        showToast("✅ Product added successfully!");
        setProductForm({ name: "", price: "", category: "", stock: 100, image: "" });
        setShowAddProduct(false);
        loadProducts();
      } else {
        showToast(`⚠️ ${data.error}`);
      }
    } catch (error) {
      showToast("⚠️ Failed to add product");
    }
  }

  async function handleUpdateProduct(product) {
    try {
      const res = await fetch(`${API_URL}/admin/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(product)
      });
      const data = await res.json();
      if (!data.error) {
        showToast("✅ Product updated successfully!");
        setEditingProduct(null);
        loadProducts();
      } else {
        showToast(`⚠️ ${data.error}`);
      }
    } catch (error) {
      showToast("⚠️ Failed to update product");
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ Product deleted successfully!");
        loadProducts();
      } else {
        showToast(`⚠️ ${data.error}`);
      }
    } catch (error) {
      showToast("⚠️ Failed to delete product");
    }
  }

  async function handleImageUpload(e, isEdit = false) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ Image must be less than 5MB');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (data.imageUrl) {
        if (isEdit) {
          setEditingProduct({ ...editingProduct, image: data.imageUrl });
        } else {
          setProductForm({ ...productForm, image: data.imageUrl });
        }
        showToast('✅ Image uploaded successfully!');
      } else {
        showToast('⚠️ ' + (data.error || 'Upload failed'));
      }
    } catch (error) {
      showToast('⚠️ Failed to upload image');
    }
    setUploading(false);
  }

  function handleAddReview(e) {
    e.preventDefault();
    const newReview = {
      id: Date.now(),
      name: reviewForm.name,
      rating: parseInt(reviewForm.rating),
      date: "Just now",
      review: reviewForm.review
    };
    const updatedReviews = [newReview, ...reviews];
    saveReviews(updatedReviews);
    setReviewForm({ name: "", email: "", rating: 5, review: "" });
    setShowAddReview(false);
    showToast("✅ Review added successfully!");
    
    // Add notification
    const newNotification = {
      id: Date.now(),
      type: "review",
      title: "New Review Added",
      message: `${reviewForm.name} left a ${reviewForm.rating}-star review`,
      time: "Just now",
      read: false
    };
    saveNotifications([newNotification, ...notifications]);
  }

  function handleUpdateReview() {
    const updatedReviews = reviews.map(r => 
      r.id === editingReview.id ? editingReview : r
    );
    saveReviews(updatedReviews);
    setEditingReview(null);
    showToast("✅ Review updated successfully!");
  }

  function handleDeleteReview(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const updatedReviews = reviews.filter(r => r.id !== id);
    saveReviews(updatedReviews);
    showToast("✅ Review deleted successfully!");
  }

  function updateOrderStatus(orderId, newStatus) {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    showToast(`✅ Order ${orderId} status updated to ${newStatus}`);
    
    // Add notification
    const order = orders.find(o => o.id === orderId);
    if (order) {
      let notificationMessage = "";
      let notificationType = "order";
      
      if (newStatus === "Completed") {
        notificationMessage = `Order ${orderId} delivered to ${order.customerName}`;
        notificationType = "delivery";
      } else if (newStatus === "Processing") {
        notificationMessage = `Order ${orderId} is now processing`;
      } else if (newStatus === "Pending") {
        notificationMessage = `Order ${orderId} is pending`;
      }
      
      const newNotification = {
        id: Date.now(),
        type: notificationType,
        title: newStatus === "Completed" ? "Order Delivered" : "Order Status Updated",
        message: notificationMessage,
        time: "Just now",
        read: false
      };
      saveNotifications([newNotification, ...notifications]);
    }
  }

  function markNotificationAsRead(id) {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updatedNotifications);
  }

  function markAllNotificationsAsRead() {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updatedNotifications);
    showToast("✅ All notifications marked as read");
  }

  function deleteNotification(id) {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    saveNotifications(updatedNotifications);
    showToast("✅ Notification deleted");
  }

  function renderStars(rating) {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} style={{ fontSize: '20px', color: star <= rating ? '#fbbf24' : '#333' }}>
            ★
          </span>
        ))}
      </div>
    );
  }

  // Calculate stats
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const completedOrders = orders.filter(o => o.status === "Completed").length;
  const processingOrders = orders.filter(o => o.status === "Processing").length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 20).length;
  const totalCustomers = customers.length;
  const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Get today's orders
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date === today);
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0f0f0f", minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f0f; }
        
        .admin-nav {
          position: sticky;
          top: 0;
          z-index: 200;
          background: rgba(15,15,15,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid #ef4444;
          padding: 0 40px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 32px rgba(239,68,68,0.3);
        }
        
        .admin-logo {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .admin-logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          box-shadow: 0 8px 32px rgba(239,68,68,0.4);
        }
        
        .admin-logo-text {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -1px;
          color: #fff;
        }
        
        .admin-logo-sub {
          font-size: 11px;
          color: #ef4444;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 2px;
          font-weight: 800;
        }
        
        .admin-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .admin-badge {
          background: rgba(239,68,68,0.15);
          border: 2px solid #ef4444;
          color: #ef4444;
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .notification-btn {
          position: relative;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.2);
          color: #fff;
          padding: 12px 20px;
          border-radius: 50px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .notification-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: #ef4444;
        }
        
        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: #fff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 4px 12px rgba(239,68,68,0.6);
        }
        
        .logout-btn {
          background: rgba(239,68,68,0.15);
          border: 2px solid #ef4444;
          color: #ef4444;
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .logout-btn:hover {
          background: rgba(239,68,68,0.25);
          transform: translateY(-2px);
        }
        
        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 28px;
        }
        
        .admin-header {
          margin-bottom: 40px;
        }
        
        .admin-title {
          font-size: 48px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .admin-subtitle {
          font-size: 18px;
          color: #aaa;
          font-weight: 600;
        }
        
        .admin-tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 40px;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 8px;
          border: 2px solid rgba(255,255,255,0.1);
        }
        
        .admin-tab {
          padding: 16px 24px;
          border: none;
          background: transparent;
          color: #aaa;
          font-weight: 800;
          font-size: 15px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
        }
        
        .admin-tab:hover {
          background: rgba(255,255,255,0.05);
        }
        
        .admin-tab.active {
          background: #ef4444;
          color: #fff;
          box-shadow: 0 4px 20px rgba(239,68,68,0.4);
        }
        
        .tab-badge {
          background: rgba(239,68,68,0.9);
          color: #fff;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
          position: absolute;
          top: 8px;
          right: 8px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          background: rgba(30,30,30,0.9);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 28px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .stat-card:hover {
          border-color: #ef4444;
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(239,68,68,0.3);
        }
        
        .stat-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }
        
        .stat-value {
          font-size: 36px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #aaa;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .content-card {
          background: rgba(30,30,30,0.9);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 30px;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(255,255,255,0.1);
        }
        
        .card-title {
          font-size: 28px;
          font-weight: 900;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .add-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .add-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(239,68,68,0.4);
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          overflow-x: auto;
        }
        
        .data-table th {
          background: rgba(255,255,255,0.05);
          padding: 18px;
          text-align: left;
          font-weight: 900;
          color: #fff;
          border-bottom: 2px solid rgba(255,255,255,0.1);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }
        
        .data-table td {
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          color: #ddd;
          font-weight: 600;
          font-size: 15px;
        }
        
        .data-table tr:hover {
          background: rgba(255,255,255,0.05);
        }
        
        .product-img {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.2);
        }
        
        .action-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
          margin-right: 8px;
        }
        
        .btn-edit {
          background: rgba(59,130,246,0.15);
          border: 2px solid #3b82f6;
          color: #3b82f6;
        }
        
        .btn-edit:hover {
          background: rgba(59,130,246,0.25);
        }
        
        .btn-save {
          background: rgba(16,185,129,0.15);
          border: 2px solid #10b981;
          color: #10b981;
        }
        
        .btn-save:hover {
          background: rgba(16,185,129,0.25);
        }
        
        .btn-cancel {
          background: rgba(156,163,175,0.15);
          border: 2px solid #9ca3af;
          color: #9ca3af;
        }
        
        .btn-cancel:hover {
          background: rgba(156,163,175,0.25);
        }
        
        .btn-delete {
          background: rgba(239,68,68,0.15);
          border: 2px solid #ef4444;
          color: #ef4444;
        }
        
        .btn-delete:hover {
          background: rgba(239,68,68,0.25);
        }
        
        .status-badge {
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-block;
        }
        
        .status-completed {
          background: rgba(16,185,129,0.15);
          border: 2px solid #10b981;
          color: #10b981;
        }
        
        .status-pending {
          background: rgba(251,191,36,0.15);
          border: 2px solid #fbbf24;
          color: #fbbf24;
        }
        
        .status-processing {
          background: rgba(59,130,246,0.15);
          border: 2px solid #3b82f6;
          color: #3b82f6;
        }
        
        .status-low {
          background: rgba(239,68,68,0.15);
          border: 2px solid #ef4444;
          color: #ef4444;
        }
        
        .status-ok {
          background: rgba(16,185,129,0.15);
          border: 2px solid #10b981;
          color: #10b981;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }
        
        .form-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
          font-weight: 600;
        }
        
        .form-input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 20px rgba(239,68,68,0.2);
        }
        
        .form-textarea {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
          font-weight: 600;
          min-height: 120px;
          resize: vertical;
          font-family: inherit;
        }
        
        .form-textarea:focus {
          border-color: #ef4444;
          box-shadow: 0 0 20px rgba(239,68,68,0.2);
        }
        
        .form-select {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
          font-weight: 600;
          cursor: pointer;
        }
        
        .form-select:focus {
          border-color: #ef4444;
        }
        
        .img-preview {
          max-width: 150px;
          max-height: 150px;
          border-radius: 12px;
          margin-top: 12px;
          border: 2px solid rgba(255,255,255,0.2);
        }
        
        .upload-btn-wrapper {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }
        
        .upload-btn {
          background: rgba(59,130,246,0.15);
          border: 2px solid #3b82f6;
          color: #3b82f6;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        
        .upload-btn:hover {
          background: rgba(59,130,246,0.25);
        }
        
        .upload-btn-wrapper input[type=file] {
          font-size: 100px;
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          cursor: pointer;
        }
        
        .notification-card {
          background: rgba(30,30,30,0.9);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          display: flex;
          align-items: start;
          gap: 16px;
          transition: all 0.3s;
        }
        
        .notification-card:hover {
          border-color: #ef4444;
          transform: translateX(5px);
        }
        
        .notification-card.unread {
          background: rgba(239,68,68,0.05);
          border-color: rgba(239,68,68,0.3);
        }
        
        .notification-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-title {
          font-size: 16px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 6px;
        }
        
        .notification-message {
          font-size: 14px;
          color: #aaa;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .notification-time {
          font-size: 12px;
          color: #666;
          font-weight: 700;
        }
        
        .notification-actions {
          display: flex;
          gap: 8px;
        }
        
        .toast {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          color: #0f0f0f;
          padding: 18px 36px;
          border-radius: 50px;
          font-weight: 900;
          font-size: 16px;
          box-shadow: 0 12px 50px rgba(255,255,255,0.4);
          z-index: 9999;
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        
        .empty-state {
          text-align: center;
          padding: 80px 24px;
        }
        
        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        
        .empty-title {
          font-size: 28px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 12px;
        }
        
        .empty-text {
          color: #aaa;
          font-size: 16px;
          font-weight: 600;
        }

        .order-details {
          font-size: 13px;
          color: #aaa;
          margin-top: 4px;
        }
        
        .review-card {
          background: rgba(30,30,30,0.9);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
          transition: all 0.3s;
        }
        
        .review-card:hover {
          border-color: #fff;
          transform: translateY(-3px);
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 16px;
        }
        
        .review-author {
          font-size: 18px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 8px;
        }
        
        .review-date {
          font-size: 13px;
          color: #666;
          font-weight: 700;
        }
        
        .review-text {
          font-size: 15px;
          color: #ddd;
          line-height: 1.6;
          font-weight: 600;
          margin-top: 12px;
        }

        @media(max-width: 768px) {
          .admin-nav {
            padding: 0 20px;
            height: auto;
            flex-wrap: wrap;
            padding-top: 16px;
            padding-bottom: 16px;
          }
          
          .admin-container {
            padding: 40px 18px;
          }
          
          .admin-title {
            font-size: 32px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .data-table {
            font-size: 12px;
          }
          
          .data-table th,
          .data-table td {
            padding: 12px 8px;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-logo">
          <div className="admin-logo-icon">⚡</div>
          <div>
            <div className="admin-logo-text">Admin Dashboard</div>
            <div className="admin-logo-sub">GHOSIA MINI MARKET</div>
          </div>
        </div>

        <div className="admin-user">
          <button 
            className="notification-btn" 
            onClick={() => setActiveTab("notifications")}
            title="Notifications"
          >
            🔔
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
          <div className="admin-badge">
            ⚡ {user.name}
          </div>
          <button className="logout-btn" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Main Content */}
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">
            <span>📊</span>
            Admin Control Panel
          </h1>
          <p className="admin-subtitle">Manage your store, products, orders, customers, reviews, and notifications</p>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            📦 Products ({totalProducts})
          </button>
          <button
            className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            🛒 Orders ({totalOrders})
          </button>
          <button
            className={`admin-tab ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            👥 Customers ({totalCustomers})
          </button>
          <button
            className={`admin-tab ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            ⭐ Reviews ({reviews.length})
          </button>
          <button
            className={`admin-tab ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            🔔 Notifications
            {unreadNotifications > 0 && (
              <span className="tab-badge">{unreadNotifications}</span>
            )}
          </button>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab("orders")}>
                <div className="stat-icon">💰</div>
                <div className="stat-value">£{totalSales.toFixed(2)}</div>
                <div className="stat-label">Total Sales</div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("orders")}>
                <div className="stat-icon">📦</div>
                <div className="stat-value">{totalOrders}</div>
                <div className="stat-label">Total Orders</div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("orders")}>
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{pendingOrders}</div>
                <div className="stat-label">Pending Orders</div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("orders")}>
                <div className="stat-icon">✅</div>
                <div className="stat-value">{completedOrders}</div>
                <div className="stat-label">Completed</div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("products")}>
                <div className="stat-icon">🏪</div>
                <div className="stat-value">{totalProducts}</div>
                <div className="stat-label">Products</div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("customers")}>
                <div className="stat-icon">👥</div>
                <div className="stat-value">{totalCustomers}</div>
                <div className="stat-label">Customers</div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("reviews")}>
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{reviews.length}</div>
                <div className="stat-label">Reviews</div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("notifications")}>
                <div className="stat-icon">🔔</div>
                <div className="stat-value">{unreadNotifications}</div>
                <div className="stat-label">Unread Notifications</div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  <span>📦</span>
                  Recent Orders
                </h2>
                <button className="add-btn" onClick={() => setActiveTab("orders")}>
                  View All →
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong></td>
                        <td>{order.customerName}</td>
                        <td>{order.items}</td>
                        <td><strong>£{order.total.toFixed(2)}</strong></td>
                        <td>
                          <span className={`status-badge status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts > 0 && (
              <div className="content-card" style={{ borderColor: '#ef4444' }}>
                <div className="card-header">
                  <h2 className="card-title">
                    <span>⚠️</span>
                    Low Stock Alert
                  </h2>
                  <button className="add-btn" onClick={() => setActiveTab("products")}>
                    Manage Stock →
                  </button>
                </div>
                <p style={{ color: '#aaa', fontSize: '16px', fontWeight: 600 }}>
                  {lowStockProducts} product(s) have stock below 20 units. Click "Manage Stock" to restock.
                </p>
              </div>
            )}
          </>
        )}

        {/* PRODUCTS TAB - Keeping exactly as is */}
        {activeTab === "products" && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <span>📦</span>
                Product Management
              </h2>
              <button className="add-btn" onClick={() => setShowAddProduct(!showAddProduct)}>
                {showAddProduct ? "− Cancel" : "+ Add Product"}
              </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <form onSubmit={handleAddProduct} style={{ marginBottom: '30px', padding: '24px', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '2px solid rgba(239,68,68,0.2)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '20px' }}>Add New Product</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g., Basmati Rice"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (£)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 3.99"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      className="form-input"
                      placeholder="e.g., Grains"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="e.g., 100"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (or upload)</label>
                  <input
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  />
                  
                  <div style={{ marginTop: '12px' }}>
                    <div className="upload-btn-wrapper">
                      <button type="button" className="upload-btn" disabled={uploading}>
                        {uploading ? "⏳ Uploading..." : "📁 Upload Image"}
                      </button>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={uploading} />
                    </div>
                  </div>

                  {productForm.image && (
                    <img src={productForm.image} alt="Preview" className="img-preview" />
                  )}
                </div>

                <button type="submit" className="add-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  ✅ Add Product
                </button>
              </form>
            )}

            {/* Products Table */}
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3 className="empty-title">No Products Yet</h3>
                <p className="empty-text">Add your first product to get started!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          {product.image && (
                            <img src={product.image} alt={product.name} className="product-img" />
                          )}
                        </td>
                        <td>
                          {editingProduct?._id === product._id ? (
                            <input
                              className="form-input"
                              value={editingProduct.name}
                              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            />
                          ) : (
                            <strong>{product.name}</strong>
                          )}
                        </td>
                        <td>
                          {editingProduct?._id === product._id ? (
                            <input
                              className="form-input"
                              value={editingProduct.category}
                              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            />
                          ) : (
                            product.category
                          )}
                        </td>
                        <td>
                          {editingProduct?._id === product._id ? (
                            <input
                              className="form-input"
                              type="number"
                              step="0.01"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            />
                          ) : (
                            <strong>£{product.price.toFixed(2)}</strong>
                          )}
                        </td>
                        <td>
                          {editingProduct?._id === product._id ? (
                            <input
                              className="form-input"
                              type="number"
                              value={editingProduct.stock}
                              onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                            />
                          ) : (
                            <span className={`status-badge ${product.stock < 20 ? 'status-low' : 'status-ok'}`}>
                              {product.stock} units
                            </span>
                          )}
                        </td>
                        <td>
                          {editingProduct?._id === product._id ? (
                            <>
                              <button
                                className="action-btn btn-save"
                                onClick={() => handleUpdateProduct(editingProduct)}
                              >
                                ✓ Save
                              </button>
                              <button
                                className="action-btn btn-cancel"
                                onClick={() => setEditingProduct(null)}
                              >
                                ✕ Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="action-btn btn-edit"
                                onClick={() => setEditingProduct(product)}
                              >
                                ✎ Edit
                              </button>
                              <button
                                className="action-btn btn-delete"
                                onClick={() => handleDeleteProduct(product._id)}
                              >
                                🗑 Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <span>🛒</span>
                Order Management
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span className="status-badge status-pending">{pendingOrders} Pending</span>
                <span className="status-badge status-processing">{processingOrders} Processing</span>
                <span className="status-badge status-completed">{completedOrders} Completed</span>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <h3 className="empty-title">No Orders Yet</h3>
                <p className="empty-text">Orders will appear here once customers start shopping!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong></td>
                        <td>
                          <div>{order.customerName}</div>
                          <div className="order-details">{order.customerEmail}</div>
                        </td>
                        <td>
                          <div className="order-details">{order.address}</div>
                        </td>
                        <td>{order.items} items</td>
                        <td><strong>£{order.total.toFixed(2)}</strong></td>
                        <td>
                          <select
                            className="form-select"
                            style={{ padding: '8px 12px', fontSize: '13px', minWidth: '140px' }}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{order.date}</td>
                        <td>
                          <button className="action-btn btn-edit" onClick={() => showToast(`📦 Viewing order ${order.id}`)}>
                            👁 View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <span>👥</span>
                Customer Management
              </h2>
              <div style={{ color: '#aaa', fontSize: '15px', fontWeight: 700 }}>
                Total: {totalCustomers} customers
              </div>
            </div>

            {customers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3 className="empty-title">No Customers Yet</h3>
                <p className="empty-text">Customers will appear here when they create accounts!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Total Orders</th>
                      <th>Total Spent</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td><strong>{customer.name}</strong></td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.totalOrders}</td>
                        <td><strong>£{customer.totalSpent.toFixed(2)}</strong></td>
                        <td>{customer.joinDate}</td>
                        <td>
                          <button className="action-btn btn-edit" onClick={() => showToast(`👤 Viewing ${customer.name}'s profile`)}>
                            👁 View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <span>⭐</span>
                Reviews Management
              </h2>
              <button className="add-btn" onClick={() => setShowAddReview(!showAddReview)}>
                {showAddReview ? "− Cancel" : "+ Add Review"}
              </button>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
              <form onSubmit={handleAddReview} style={{ marginBottom: '30px', padding: '24px', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '2px solid rgba(239,68,68,0.2)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '20px' }}>Add New Review</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g., John Smith"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rating (1-5 stars)</label>
                    <select
                      className="form-select"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      required
                    >
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Good</option>
                      <option value="2">2 Stars - Fair</option>
                      <option value="1">1 Star - Poor</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Text</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Write the review here..."
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="add-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  ✅ Add Review
                </button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <h3 className="empty-title">No Reviews Yet</h3>
                <p className="empty-text">Customer reviews will appear here!</p>
              </div>
            ) : (
              <div>
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    {editingReview?.id === review.id ? (
                      <div>
                        <div className="form-group">
                          <label className="form-label">Customer Name</label>
                          <input
                            className="form-input"
                            value={editingReview.name}
                            onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Rating</label>
                          <select
                            className="form-select"
                            value={editingReview.rating}
                            onChange={(e) => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })}
                          >
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Review Text</label>
                          <textarea
                            className="form-textarea"
                            value={editingReview.review}
                            onChange={(e) => setEditingReview({ ...editingReview, review: e.target.value })}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button className="action-btn btn-save" onClick={handleUpdateReview}>
                            ✓ Save Changes
                          </button>
                          <button className="action-btn btn-cancel" onClick={() => setEditingReview(null)}>
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="review-header">
                          <div>
                            <div className="review-author">{review.name}</div>
                            {renderStars(review.rating)}
                            <div className="review-date">{review.date}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="action-btn btn-edit" onClick={() => setEditingReview(review)}>
                              ✎ Edit
                            </button>
                            <button className="action-btn btn-delete" onClick={() => handleDeleteReview(review.id)}>
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                        <p className="review-text">{review.review}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <span>🔔</span>
                Notifications
              </h2>
              {unreadNotifications > 0 && (
                <button className="add-btn" onClick={markAllNotificationsAsRead}>
                  ✓ Mark All as Read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <h3 className="empty-title">No Notifications</h3>
                <p className="empty-text">You're all caught up!</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => {
                  const icons = {
                    order: "🛒",
                    delivery: "✅",
                    review: "⭐"
                  };
                  return (
                    <div key={notification.id} className={`notification-card ${!notification.read ? 'unread' : ''}`}>
                      <div className="notification-icon">{icons[notification.type] || "📢"}</div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                      <div className="notification-actions">
                        {!notification.read && (
                          <button 
                            className="action-btn btn-edit" 
                            onClick={() => markNotificationAsRead(notification.id)}
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button 
                          className="action-btn btn-delete" 
                          onClick={() => deleteNotification(notification.id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
