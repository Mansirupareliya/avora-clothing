import { useEffect, useState } from "react";
import axios from "axios";

const REVIEWS_API = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/reviews`;

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyInput, setReplyInput] = useState({}); // { [reviewId]: string }
  const [activeReplyId, setActiveReplyId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(REVIEWS_API);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch admin reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (reviewId) => {
    const text = replyInput[reviewId];
    if (!text || !text.trim()) {
      alert("Please write a reply message first.");
      return;
    }

    try {
      await axios.patch(`${REVIEWS_API}/${reviewId}/reply`, { reply: text.trim() });
      alert("Admin reply saved successfully!");
      setActiveReplyId(null);
      fetchReviews();
    } catch (err) {
      console.error("Failed to save reply:", err);
      alert("Failed to save reply.");
    }
  };

  const handleDeleteReview = async (reviewId, name) => {
    if (window.confirm(`Are you sure you want to delete the review by "${name}"?`)) {
      try {
        await axios.delete(`${REVIEWS_API}/${reviewId}`);
        fetchReviews();
      } catch (err) {
        console.error("Delete review failed:", err);
        alert("Failed to delete review.");
      }
    }
  };

  // Filtering
  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQ =
      !q ||
      r.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.product?.name?.toLowerCase().includes(q);

    const matchesRating =
      ratingFilter === "all" || String(r.rating) === String(ratingFilter);

    return matchesQ && matchesRating;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
      : "5.0";

  const repliedCount = reviews.filter((r) => r.adminReply).length;
  const pendingCount = reviews.length - repliedCount;

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-8 text-[var(--text)]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-semibold mb-1">
                AVORA Admin Management
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-[var(--text)] uppercase tracking-wide">
                Customer Reviews &amp; Comments
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)] font-light">
                View all customer product reviews, ratings, and write official admin replies directly to your customers.
              </p>
            </div>

            <button
              onClick={fetchReviews}
              className="px-5 py-2.5 bg-[var(--primary)] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              🔄 Refresh Reviews
            </button>
          </div>
        </section>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Total Customer Reviews</p>
            <p className="text-2xl font-bold text-[var(--primary)] mt-1">{reviews.length} Reviews</p>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Average Customer Rating</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#c86f49]">★ {avgRating}</span>
              <span className="text-xs text-[var(--muted)]">out of 5.0</span>
            </div>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Admin Reply Status</p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1">
                {repliedCount} Replied
              </span>
              <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1">
                {pendingCount} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Search reviews by customer or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2.5 text-xs md:text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Rating Filter buttons */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mr-2">Filter Rating:</span>
              {["all", "5", "4", "3", "2", "1"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatingFilter(r)}
                  className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider border transition ${
                    ratingFilter === r
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]"
                  }`}
                >
                  {r === "all" ? "All Ratings" : `★ ${r}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
          <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wider pb-3 border-b border-[var(--border)]">
            All Reviews ({filteredReviews.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-[var(--muted)] uppercase tracking-widest">
              Loading customer reviews...
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-[var(--border)] bg-[var(--bg)] p-5 space-y-4 hover:border-[var(--primary)] transition-all"
                >
                  {/* Top Bar: Customer info & Rating */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm uppercase">
                        {review.name ? review.name[0] : "U"}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[var(--text)] uppercase tracking-wide">
                          {review.name}
                        </h3>
                        <p className="text-[11px] text-[var(--muted)]">
                          {new Date(review.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Rating Stars */}
                      <div className="flex text-amber-500 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </div>

                      {/* Product Tag */}
                      {review.product && (
                        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-xs">
                          {review.product.imageUrl && (
                            <img
                              src={review.product.imageUrl}
                              alt={review.product.name}
                              className="w-6 h-6 object-cover"
                            />
                          )}
                          <span className="font-semibold text-[var(--text)] truncate max-w-[150px]">
                            {review.product.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-[var(--text)] leading-relaxed bg-[var(--surface)] p-4 border border-[var(--border)] font-light">
                    "{review.comment}"
                  </p>

                  {/* Admin Reply Display if exists */}
                  {review.adminReply && (
                    <div className="bg-emerald-50/60 border border-emerald-200 p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🛡️</span> AVORA Official Admin Reply
                        </span>
                        {review.replyDate && (
                          <span className="text-[10px] text-emerald-600">
                            {new Date(review.replyDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                        {review.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Admin Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <button
                      onClick={() => {
                        setActiveReplyId(activeReplyId === review.id ? null : review.id);
                        setReplyInput((prev) => ({ ...prev, [review.id]: review.adminReply || "" }));
                      }}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline uppercase tracking-wider flex items-center gap-1"
                    >
                      {activeReplyId === review.id ? "✕ Close Reply" : review.adminReply ? "✏️ Edit Admin Reply" : "💬 Reply to Customer"}
                    </button>

                    <button
                      onClick={() => handleDeleteReview(review.id, review.name)}
                      className="text-xs font-semibold text-red-600 hover:underline uppercase tracking-wider flex items-center gap-1"
                    >
                      🗑️ Delete Review
                    </button>
                  </div>

                  {/* Reply Form Box (when open) */}
                  {activeReplyId === review.id && (
                    <div className="mt-3 bg-[var(--surface)] p-4 border border-[var(--primary)] space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                        Write Official AVORA Reply to {review.name}:
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Thank you for your feedback! We appreciate your support..."
                        value={replyInput[review.id] || ""}
                        onChange={(e) => setReplyInput({ ...replyInput, [review.id]: e.target.value })}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] p-3 text-xs md:text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSendReply(review.id)}
                          className="bg-[var(--primary)] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
                        >
                          Save &amp; Send Reply →
                        </button>
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="border border-[var(--border)] text-[var(--muted)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-[var(--muted)] border border-dashed border-[var(--border)]">
              <p className="text-base font-semibold uppercase tracking-wider mb-1">No Customer Reviews Found</p>
              <p className="text-xs">When customers submit reviews on product pages, they will appear here for you to read and reply.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
