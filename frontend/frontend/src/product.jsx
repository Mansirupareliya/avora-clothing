import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/products`;

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "add" ? "add" : "listings";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [form, setForm] = useState({
    name: "",
    description: "",
    mrp: "",
    discount: "",
    price: "",
    category: "",
    sizes: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate selling price if mrp & discount exist
      if (name === "mrp" || name === "discount") {
        const mrpNum = Number(name === "mrp" ? value : prev.mrp) || 0;
        const discNum = Number(name === "discount" ? value : prev.discount) || 0;
        if (mrpNum > 0 && discNum >= 0) {
          updated.price = Math.round(mrpNum * (1 - discNum / 100));
        }
      }
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("mrp", form.mrp);
    data.append("discount", form.discount);
    data.append("price", form.price);
    data.append("category", form.category);
    if (form.sizes) {
      data.append("sizes", form.sizes);
    }

    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Product updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(API_URL, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Product added successfully!");
      }

      setForm({
        name: "",
        description: "",
        mrp: "",
        discount: "",
        price: "",
        category: "",
        sizes: "",
      });
      setImageFile(null);
      setImagePreview(null);

      fetchProducts();
      setActiveTab("listings");
      setSearchParams({ tab: "listings" });
    } catch (err) {
      console.error("Save product failed:", err);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      mrp: product.mrp || "",
      discount: product.discount || "",
      price: product.price || "",
      category: product.category || "",
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes || "",
    });
    setImagePreview(product.imageUrl || null);
    setActiveTab("add");
    setSearchParams({ tab: "add" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchProducts();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete product.");
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      mrp: "",
      discount: "",
      price: "",
      category: "",
      sizes: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setActiveTab("listings");
    setSearchParams({ tab: "listings" });
  };

  // Filtered Products for Listings view
  const categoriesList = ["All", ...Array.from(new Set(products.map((p) => p.category?.trim()).filter(Boolean)))];

  const filteredListings = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);

    const matchesCat =
      selectedCategory === "All" ||
      (p.category && p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());

    return matchesQuery && matchesCat;
  });

  const totalCatalogValue = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-8 text-[var(--text)]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-semibold mb-1">
                AVORA Admin Management
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-[var(--text)] uppercase tracking-wide">
                Product Catalog &amp; Listings
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)] font-light">
                View all listed products, update prices, edit details, and add new items to your store anytime.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setActiveTab("listings"); setSearchParams({ tab: "listings" }); }}
                className={`px-5 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider transition ${
                  activeTab === "listings"
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface)]"
                }`}
              >
                📦 My Listed Products ({products.length})
              </button>

              <button
                onClick={() => {
                  if (editingId) cancelEdit();
                  setActiveTab("add");
                  setSearchParams({ tab: "add" });
                }}
                className={`px-5 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider transition ${
                  activeTab === "add"
                    ? "bg-[var(--accent)] text-white shadow-md"
                    : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface)]"
                }`}
              >
                ➕ {editingId ? "Edit Product" : "Add New Product"}
              </button>
            </div>
          </div>
        </section>

        {/* TAB 1: LISTINGS SECTION */}
        {activeTab === "listings" && (
          <div className="space-y-6">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Total Listed Items</p>
                <p className="text-2xl font-bold text-[var(--primary)] mt-1">{products.length} Products</p>
              </div>

              <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Catalog Value</p>
                <p className="text-2xl font-bold text-[#c86f49] mt-1">₹{totalCatalogValue.toLocaleString()}</p>
              </div>

              <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Categories Active</p>
                <p className="text-2xl font-bold text-[var(--text)] mt-1">{categoriesList.length - 1} Categories</p>
              </div>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Search Bar */}
                <div className="w-full md:w-80 relative">
                  <input
                    type="text"
                    placeholder="Search listed products..."
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

                {/* Category Tags */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mr-2">Category:</span>
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider border transition ${
                        selectedCategory.toLowerCase() === cat.toLowerCase()
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Listings Grid / Table Section */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wider">
                    My Listed Products ({filteredListings.length})
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Click "Edit" on any product to change prices, sizes, images or details.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-[var(--muted)] uppercase tracking-widest">
                  Loading catalog products...
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((product) => (
                    <div
                      key={product.id}
                      className="border border-[var(--border)] bg-[var(--bg)] p-4 flex flex-col justify-between hover:border-[var(--primary)] transition-all"
                    >
                      <div>
                        {/* Thumbnail & Badges */}
                        <div className="relative mb-4 bg-white border border-[var(--border)] h-56 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs text-[var(--muted)]">No Image</div>
                          )}
                          {product.discount > 0 && (
                            <span className="absolute top-2 right-2 bg-[#c86f49] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                              -{product.discount}% OFF
                            </span>
                          )}
                          <span className="absolute bottom-2 left-2 bg-[var(--primary)] text-white text-[10px] font-semibold px-2 py-1 uppercase tracking-wider">
                            {product.category || "Uncategorized"}
                          </span>
                        </div>

                        {/* Title & Info */}
                        <h3 className="font-bold text-sm text-[var(--text)] uppercase tracking-wide truncate mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[var(--muted)] line-clamp-2 mb-3 min-h-[32px]">
                          {product.description || "No description provided"}
                        </p>

                        {/* Sizes */}
                        {product.sizes && (
                          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                            <span className="text-[10px] uppercase text-[var(--muted)] font-semibold">Sizes:</span>
                            {(Array.isArray(product.sizes) ? product.sizes : String(product.sizes).split(",")).map((sz, i) => (
                              <span key={i} className="text-[10px] border border-[var(--border)] px-1.5 py-0.5 bg-[var(--surface)] text-[var(--text)] font-semibold uppercase">
                                {String(sz).trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price Details */}
                        <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-3 mb-4">
                          <div>
                            <span className="text-xs text-[var(--muted)] line-through mr-2">
                              ₹{product.mrp}
                            </span>
                            <span className="text-base font-bold text-[#c86f49]">
                              ₹{product.price}
                            </span>
                          </div>
                          <span className="text-[10px] text-green-600 font-semibold uppercase">
                            GST 5% Flat
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-full bg-[var(--primary)] text-white text-xs font-semibold py-2.5 uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-1"
                        >
                          ✏️ Edit Item
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="w-full border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold py-2.5 uppercase tracking-wider transition flex items-center justify-center gap-1"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-[var(--muted)] border border-dashed border-[var(--border)]">
                  <p className="text-base font-semibold uppercase tracking-wider mb-2">No Listed Products Found</p>
                  <p className="text-xs mb-4">Try clearing your search query or add your first product listing.</p>
                  <button
                    onClick={() => { setActiveTab("add"); setSearchParams({ tab: "add" }); }}
                    className="bg-[var(--primary)] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                  >
                    ➕ Add Product Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT PRODUCT FORM */}
        {activeTab === "add" && (
          <div className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <div className="flex items-center justify-between pb-6 border-b border-[var(--border)] mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text)] uppercase tracking-wider">
                  {editingId ? `✏️ Edit Listed Product (ID: #${editingId})` : "➕ Create New Product Listing"}
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {editingId ? "Modify product details and save changes instantly" : "Fill details below to list a new product in your AVORA store"}
                </p>
              </div>

              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="text-xs font-semibold text-[var(--muted)] hover:text-red-600 border border-[var(--border)] px-4 py-2 uppercase tracking-wider"
                >
                  ✕ Cancel Editing
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Grid 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
                    Product Title <span className="text-[#c86f49]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Premium Cotton Printed Shirt"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
                    Category <span className="text-[#c86f49]">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] transition"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    <option value="plan">Plan</option>
                    <option value="checks">Checks</option>
                    <option value="office">Office</option>
                    <option value="traditional">Traditional</option>
                  </select>
                </div>
              </div>

              {/* Grid 2: Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
                  Product Description <span className="text-[#c86f49]">*</span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Enter detailed fabric, fit, and care instructions..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] transition"
                  required
                />
              </div>

              {/* Grid 3: Pricing Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[var(--bg)] p-4 border border-[var(--border)]">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
                    MRP Price (₹) <span className="text-[#c86f49]">*</span>
                  </label>
                  <input
                    type="number"
                    name="mrp"
                    placeholder="e.g., 999"
                    value={form.mrp}
                    onChange={handleChange}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
                    Discount (%) <span className="text-[#c86f49]">*</span>
                  </label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="e.g., 10"
                    value={form.discount}
                    onChange={handleChange}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
                    Final Selling Price (₹) <span className="text-[#c86f49]">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Calculated price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[#c86f49] outline-none focus:border-[var(--primary)]"
                    required
                  />
                </div>
              </div>

              {/* Grid 4: Sizes & Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
                    Available Sizes (Comma Separated)
                  </label>
                  <input
                    type="text"
                    name="sizes"
                    placeholder="e.g., S, M, L, XL"
                    value={form.sizes}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
                    Product Image {editingId ? "(Optional to update)" : "*"}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-xs text-[var(--muted)] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary)] file:text-white hover:file:opacity-90 cursor-pointer"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-14 h-14 object-cover border border-[var(--border)]"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)]">
                <button
                  type="submit"
                  className="bg-[var(--primary)] text-white px-8 py-3.5 text-xs md:text-sm font-bold uppercase tracking-widest hover:opacity-90 transition shadow-md"
                >
                  {editingId ? "Save Changes to Listing" : "Publish New Product Listing"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="border border-[var(--border)] text-[var(--text)] px-6 py-3.5 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-[var(--bg)] transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default Products;