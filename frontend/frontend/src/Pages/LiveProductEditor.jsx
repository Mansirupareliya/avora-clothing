import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/products`;

export default function LiveProductEditor() {
  const [products, setProducts] = useState([]);
  const [editedProducts, setEditedProducts] = useState({}); // { [id]: { name, mrp, discount, price, category, sizes, newImageFile, isDirty } }
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [saveStatus, setSaveStatus] = useState({}); // { [id]: 'saving' | 'saved' | 'error' }
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setProducts(res.data);
      
      // Initialize edit state
      const initialMap = {};
      res.data.forEach((p) => {
        initialMap[p.id] = {
          name: p.name || "",
          mrp: p.mrp || "",
          discount: p.discount || "",
          price: p.price || "",
          category: p.category || "",
          sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : p.sizes || "",
          imageUrl: p.imageUrl || "",
          newImageFile: null,
          isDirty: false,
        };
      });
      setEditedProducts(initialMap);
    } catch (err) {
      console.error("Failed to fetch products for live editor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFieldChange = (id, field, value) => {
    setEditedProducts((prev) => {
      const current = prev[id] || {};
      const updated = { ...current, [field]: value, isDirty: true };

      // Auto calculate price if mrp or discount changes
      if (field === "mrp" || field === "discount") {
        const mrpNum = Number(field === "mrp" ? value : current.mrp) || 0;
        const discNum = Number(field === "discount" ? value : current.discount) || 0;
        if (mrpNum > 0 && discNum >= 0) {
          updated.price = Math.round(mrpNum * (1 - discNum / 100));
        }
      }

      return { ...prev, [id]: updated };
    });
  };

  const handleImageFileChange = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedProducts((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          newImageFile: file,
          imageUrl: reader.result,
          isDirty: true,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (id) => {
    const item = editedProducts[id];
    if (!item) return;

    try {
      setSaveStatus((prev) => ({ ...prev, [id]: "saving" }));

      const data = new FormData();
      data.append("name", item.name);
      data.append("mrp", item.mrp);
      data.append("discount", item.discount);
      data.append("price", item.price);
      data.append("category", item.category);
      if (item.sizes) data.append("sizes", item.sizes);
      if (item.newImageFile) data.append("image", item.newImageFile);

      await axios.put(`${API_URL}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSaveStatus((prev) => ({ ...prev, [id]: "saved" }));
      
      // Mark clean
      setEditedProducts((prev) => ({
        ...prev,
        [id]: { ...prev[id], isDirty: false, newImageFile: null },
      }));

      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [id]: null }));
      }, 2500);

    } catch (err) {
      console.error("Live save failed:", err);
      setSaveStatus((prev) => ({ ...prev, [id]: "error" }));
      alert(`Failed to save product ID #${id}`);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (window.confirm(`Delete "${name}" from store live?`)) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchProducts();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete product.");
      }
    }
  };

  const handleSaveAllDirty = async () => {
    const dirtyIds = Object.keys(editedProducts).filter(
      (id) => editedProducts[id].isDirty
    );
    if (dirtyIds.length === 0) {
      alert("No modified items to save.");
      return;
    }

    let successCount = 0;
    for (const id of dirtyIds) {
      try {
        await handleSaveItem(id);
        successCount++;
      } catch (err) {
        console.error(`Error saving item ${id}:`, err);
      }
    }
    alert(`Successfully saved ${successCount} modified products live!`);
  };

  // Filter products
  const categoriesList = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category?.trim()).filter(Boolean))),
  ];

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQ =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      String(p.id).includes(q);

    const matchesCat =
      selectedCategory === "All" ||
      (p.category && p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());

    return matchesQ && matchesCat;
  });

  const dirtyCount = Object.keys(editedProducts).filter(
    (id) => editedProducts[id]?.isDirty
  ).length;

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-8 text-[var(--text)]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Bar */}
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-semibold mb-1">
                AVORA Real-Time Inventory Control
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-[var(--text)] uppercase tracking-wide">
                Live Product &amp; Price Editor
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)] font-light">
                Directly edit product names, MRP, discount %, selling price, categories, and sizes live. Changes take effect instantly in your store!
              </p>
            </div>

            {/* Save All Batch Button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSaveAllDirty}
                disabled={dirtyCount === 0}
                className={`px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                  dirtyCount > 0
                    ? "bg-[#c86f49] text-white shadow-lg cursor-pointer animate-pulse"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed border border-[var(--border)]"
                }`}
              >
                💾 Save All Modified ({dirtyCount})
              </button>

              <button
                onClick={fetchProducts}
                className="px-4 py-3 bg-[var(--primary)] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Search live listing by name or ID..."
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
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
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

            {/* View Mode Toggle */}
            <div className="flex border border-[var(--border)] bg-[var(--bg)] p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-xs font-semibold uppercase transition ${
                  viewMode === "table" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"
                }`}
              >
                📋 Table View
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 text-xs font-semibold uppercase transition ${
                  viewMode === "grid" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"
                }`}
              >
                🎴 Cards View
              </button>
            </div>

          </div>
        </div>

        {/* LIVE EDITABLE TABLE VIEW */}
        {viewMode === "table" && (
          <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-bold text-[var(--text)] uppercase tracking-wider">
                Live Inventory Table ({filteredProducts.length} Products)
              </h2>
              <span className="text-xs text-[var(--muted)]">
                Edit any input field directly and click <strong className="text-[var(--primary)]">"Save Live"</strong>
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-[var(--muted)] uppercase tracking-widest">
                Loading products for live editing...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="overflow-x-auto border border-[var(--border)]">
                <table className="w-full text-left text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="bg-[var(--primary)] text-white border-b border-[var(--border)] uppercase tracking-wider text-[11px]">
                      <th className="px-4 py-3.5 font-semibold w-16">Image</th>
                      <th className="px-4 py-3.5 font-semibold">Product Title</th>
                      <th className="px-4 py-3.5 font-semibold w-24">MRP (₹)</th>
                      <th className="px-4 py-3.5 font-semibold w-24">Disc %</th>
                      <th className="px-4 py-3.5 font-semibold w-28">Selling Price (₹)</th>
                      <th className="px-4 py-3.5 font-semibold w-32">Category</th>
                      <th className="px-4 py-3.5 font-semibold w-36">Sizes</th>
                      <th className="px-4 py-3.5 font-semibold text-center w-40">Live Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] bg-[var(--bg)]">
                    {filteredProducts.map((p) => {
                      const item = editedProducts[p.id] || {};
                      const status = saveStatus[p.id];
                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            item.isDirty ? "bg-amber-50/50" : "hover:bg-[var(--surface)]"
                          }`}
                        >
                          {/* Image */}
                          <td className="px-4 py-3 align-middle">
                            <label className="relative block w-12 h-14 bg-white border border-[var(--border)] cursor-pointer group overflow-hidden">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:opacity-75 transition"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--muted)]">No Img</div>
                              )}
                              <div className="absolute inset-0 bg-black/40 text-white text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                Change
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileChange(p.id, e.target.files?.[0])}
                                className="hidden"
                              />
                            </label>
                          </td>

                          {/* Product Title */}
                          <td className="px-4 py-3 align-middle">
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) => handleFieldChange(p.id, "name", e.target.value)}
                              className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                            />
                            <span className="text-[10px] text-[var(--muted)]">ID: #{p.id}</span>
                          </td>

                          {/* MRP */}
                          <td className="px-4 py-3 align-middle">
                            <input
                              type="number"
                              value={item.mrp || ""}
                              onChange={(e) => handleFieldChange(p.id, "mrp", e.target.value)}
                              className="w-full bg-[var(--surface)] border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--primary)]"
                            />
                          </td>

                          {/* Discount */}
                          <td className="px-4 py-3 align-middle">
                            <input
                              type="number"
                              value={item.discount || ""}
                              onChange={(e) => handleFieldChange(p.id, "discount", e.target.value)}
                              className="w-full bg-[var(--surface)] border border-[var(--border)] px-2 py-1.5 text-xs font-bold text-[#c86f49] outline-none focus:border-[var(--primary)]"
                            />
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 align-middle">
                            <input
                              type="number"
                              value={item.price || ""}
                              onChange={(e) => handleFieldChange(p.id, "price", e.target.value)}
                              className="w-full bg-[var(--surface)] border border-[var(--border)] px-2 py-1.5 text-xs font-bold text-[var(--primary)] outline-none focus:border-[var(--primary)]"
                            />
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 align-middle">
                            <select
                              value={item.category || ""}
                              onChange={(e) => handleFieldChange(p.id, "category", e.target.value)}
                              className="w-full bg-[var(--surface)] border border-[var(--border)] px-2 py-1.5 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                            >
                              <option value="plan">Plan</option>
                              <option value="checks">Checks</option>
                              <option value="office">Office</option>
                              <option value="traditional">Traditional</option>
                            </select>
                          </td>

                          {/* Sizes */}
                          <td className="px-4 py-3 align-middle">
                            <input
                              type="text"
                              value={item.sizes || ""}
                              onChange={(e) => handleFieldChange(p.id, "sizes", e.target.value)}
                              placeholder="S, M, L, XL"
                              className="w-full bg-[var(--surface)] border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--primary)]"
                            />
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 align-middle text-center">
                            <div className="flex flex-col gap-1.5 items-center">
                              <button
                                onClick={() => handleSaveItem(p.id)}
                                disabled={status === "saving"}
                                className={`w-full py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider transition ${
                                  status === "saved"
                                    ? "bg-emerald-600 text-white"
                                    : item.isDirty
                                    ? "bg-[#c86f49] text-white shadow-sm"
                                    : "bg-[var(--primary)] text-white hover:opacity-90"
                                }`}
                              >
                                {status === "saving" ? "Saving..." : status === "saved" ? "✓ Saved Live!" : "💾 Save Live"}
                              </button>

                              <button
                                onClick={() => handleDeleteItem(p.id, item.name)}
                                className="text-[10px] text-red-600 hover:underline uppercase"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[var(--muted)] uppercase tracking-wider">
                No products found matching your search.
              </div>
            )}
          </div>
        )}

        {/* LIVE CARDS EDITABLE VIEW */}
        {viewMode === "grid" && (
          <div className="border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
            <h2 className="text-base font-bold text-[var(--text)] uppercase tracking-wider border-b border-[var(--border)] pb-3">
              Editable Product Cards ({filteredProducts.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const item = editedProducts[p.id] || {};
                const status = saveStatus[p.id];
                return (
                  <div
                    key={p.id}
                    className={`border border-[var(--border)] bg-[var(--bg)] p-5 space-y-4 transition ${
                      item.isDirty ? "border-[#c86f49]" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <label className="relative w-20 h-24 bg-white border border-[var(--border)] cursor-pointer group flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--muted)]">No Img</div>
                        )}
                        <span className="absolute inset-0 bg-black/40 text-white text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          Change
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileChange(p.id, e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>

                      {/* Fields */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--muted)]">Title</label>
                          <input
                            type="text"
                            value={item.name || ""}
                            onChange={(e) => handleFieldChange(p.id, "name", e.target.value)}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] px-2 py-1 text-xs font-bold text-[var(--text)] outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--muted)]">Category</label>
                          <select
                            value={item.category || ""}
                            onChange={(e) => handleFieldChange(p.id, "category", e.target.value)}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--text)] outline-none"
                          >
                            <option value="plan">Plan</option>
                            <option value="checks">Checks</option>
                            <option value="office">Office</option>
                            <option value="traditional">Traditional</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Price Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-[var(--surface)] p-3 border border-[var(--border)]">
                      <div>
                        <label className="text-[9px] uppercase font-semibold text-[var(--muted)]">MRP (₹)</label>
                        <input
                          type="number"
                          value={item.mrp || ""}
                          onChange={(e) => handleFieldChange(p.id, "mrp", e.target.value)}
                          className="w-full bg-[var(--bg)] border border-[var(--border)] px-2 py-1 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-semibold text-[var(--muted)]">Disc %</label>
                        <input
                          type="number"
                          value={item.discount || ""}
                          onChange={(e) => handleFieldChange(p.id, "discount", e.target.value)}
                          className="w-full bg-[var(--bg)] border border-[var(--border)] px-2 py-1 text-xs font-bold text-[#c86f49] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-semibold text-[var(--muted)]">Price (₹)</label>
                        <input
                          type="number"
                          value={item.price || ""}
                          onChange={(e) => handleFieldChange(p.id, "price", e.target.value)}
                          className="w-full bg-[var(--bg)] border border-[var(--border)] px-2 py-1 text-xs font-bold text-[var(--primary)] outline-none"
                        />
                      </div>
                    </div>

                    {/* Save Action */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveItem(p.id)}
                        disabled={status === "saving"}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition ${
                          status === "saved"
                            ? "bg-emerald-600 text-white"
                            : item.isDirty
                            ? "bg-[#c86f49] text-white"
                            : "bg-[var(--primary)] text-white"
                        }`}
                      >
                        {status === "saving" ? "Saving..." : status === "saved" ? "✓ Saved!" : "💾 Save Live"}
                      </button>

                      <button
                        onClick={() => handleDeleteItem(p.id, item.name)}
                        className="px-3 border border-red-300 text-red-600 text-xs font-semibold"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
