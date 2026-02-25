// COPY THIS ENTIRE FUNCTION
// REPLACE the old handleSubmitReview function with this

async function handleSubmitReview(e) {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        productId: null,
        customerName: reviewForm.name,
        customerEmail: user ? user.email : '',
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.review
      })
    });

    const data = await res.json();
    
    if (data.success) {
      console.log('✅ Review saved:', data.review._id);
      const newReview = {
        id: data.review._id,
        name: reviewForm.name,
        rating: parseInt(reviewForm.rating),
        date: "Just now",
        review: reviewForm.review
      };
      setReviews([newReview, ...reviews]);
      setReviewForm({ name: "", rating: 5, review: "" });
      setShowReviewForm(false);
      showToast("✅ Thank you for your review!");
    } else {
      throw new Error(data.error || 'Review failed');
    }
  } catch (error) {
    console.error('Review error:', error);
    showToast(`⚠️ ${error.message}`);
  }
}
