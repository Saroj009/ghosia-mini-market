#!/bin/bash

# This script will automatically fix App.jsx

echo "🔧 Fixing App.jsx..."

cd "$(dirname "$0")/frontend/src"

# Backup original
cp App.jsx App.jsx.backup
echo "✅ Backed up App.jsx to App.jsx.backup"

# Fix 1: Add order API call before setOrderDone
sed -i.tmp '/setOrderDone(true);/i\
    // SEND ORDER TO API\
    try {\
      const token = localStorage.getItem('"'"'token'"'"');\
      const headers = { '"'"'Content-Type'"'"': '"'"'application/json'"'"' };\
      if (token) headers['"'"'Authorization'"'"'] = \`Bearer \${token}\`;\
\
      const orderData = {\
        customerName: form.name,\
        customerEmail: form.email,\
        customerPhone: form.phone,\
        deliveryAddress: form.address,\
        items: cart.map(item => ({\
          productId: item._id,\
          name: item.name,\
          price: item.price,\
          quantity: item.qty,\
          image: getProductImage(item)\
        })),\
        subtotal: subtotal,\
        discount: discount,\
        total: parseFloat(total),\
        promoCode: appliedPromo ? promoCode : '"'"''"'"'\
      };\
\
      const res = await fetch(\`\${API_URL}/orders\`, {\
        method: '"'"'POST'"'"',\
        headers: headers,\
        body: JSON.stringify(orderData)\
      });\
\
      const data = await res.json();\
      \
      if (!data.success) {\
        throw new Error(data.error || '"'"'Order failed'"'"');\
      }\
      console.log('"'"'✅ Order saved:'"'"', data.orderId);\
    } catch (error) {\
      console.error('"'"'Order error:'"'"', error);\
      showToast(\`⚠️ \${error.message}\`);\
      return;\
    }\
' App.jsx

rm App.jsx.tmp 2>/dev/null

echo "✅ Fixed placeOrder function"
echo "✅ App.jsx has been updated!"
echo ""
echo "Now restart your frontend server:"
echo "  cd ~/Desktop/grocery-app/frontend"
echo "  npm run dev"
