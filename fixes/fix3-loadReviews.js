// COPY THIS ENTIRE useEffect
// REPLACE the two old useEffects (localStorage ones) with just this one

  // Load reviews from API
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`${API_URL}/reviews`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const formatted = data.map(r => ({
            id: r._id,
            name: r.customerName,
            rating: r.rating,
            date: new Date(r.createdAt).toLocaleDateString(),
            review: r.comment
          }));
          setReviews(formatted);
        }
      } catch (error) {
        console.error('Load reviews error:', error);
      }
    }
    loadReviews();
  }, []);
