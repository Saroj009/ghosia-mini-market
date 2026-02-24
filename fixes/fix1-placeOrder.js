// COPY THIS ENTIRE CODE
// PASTE IT RIGHT BEFORE THE LINE: setOrderDone(true);
// in the placeOrder function

    // SEND ORDER TO API
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const orderData = {
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        deliveryAddress: form.address,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          image: getProductImage(item)
        })),
        subtotal: subtotal,
        discount: discount,
        total: parseFloat(total),
        promoCode: appliedPromo ? promoCode : ''
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Order failed');
      }
      console.log('✅ Order saved:', data.orderId);
    } catch (error) {
      console.error('Order error:', error);
      showToast(`⚠️ ${error.message}`);
      return;
    }
