import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/products`;

function Products() {
  const [products, setProducts] = useState([]);
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
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    const res = await axios.get(API_URL);
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files?.[0] ?? null);
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

    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditingId(null);
    } else {
      await axios.post(API_URL, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      ...product,
      category: product.category ?? "",
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes ?? "",
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6 text-[var(--text)]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--primary)] font-semibold">
                Product Management
              </p>
              <h1 className="mt-3 text-4xl font-bold text-[var(--text)]">
                Manage Avora
              </h1>
              <p className="mt-2 text-[var(--muted)] font-light">
                Add, edit, and organize your premium collection with ease.
              </p>
            </div>

            <div className="inline-flex items-center gap-3  bg-[var(--primary)] px-6 py-4 text-[var(--surface)] shadow-lg border border-[var(--border)]">
              <div className="flex h-10 w-10 items-center justify-center  bg-[var(--surface)] text-lg text-[var(--primary)]">
                📦
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--surface)]/70 font-medium">
                  Status
                </p>
                <p className="text-lg font-semibold text-[var(--surface)]">Ready</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form & Tips Grid */}
        <section className="grid gap-8 lg:grid-cols-[1.6fr_0.4fr]">
          {/* Form Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg">
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text)]">
                  {editingId ? "✏️ Edit Product" : "➕ Add Product"}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)] font-light">
                  {editingId ? "Update product details" : "Create a new item"}
                </p>
              </div>

              {editingId && (
                <span className="rounded-lg bg-[var(--accent)]/15 px-4 py-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wide">
                  Editing
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Premium Cotton Shirt"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full  border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-2">Description</label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Short description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full  border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-2">MRP</label>
                  <input
                    type="number"
                    name="mrp"
                    placeholder="Original price"
                    value={form.mrp}
                    onChange={handleChange}
                    className="w-full  border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-2">Discount %</label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="0-100"
                    value={form.discount}
                    onChange={handleChange}
                    className="w-full  border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-2">Selling Price</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Final price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full  border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-2">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full  border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="plan">Plan</option>
                    <option value="checks">Checks</option>
                    <option value="office">Office</option>
                    <option value="traditional">Traditional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-2">Available Sizes</label>
                  <input
                    type="text"
                    name="sizes"
                    placeholder="e.g., S, M, L, XL"
                    value={form.sizes}
                    onChange={handleChange}
                    className="w-full  border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <label className="flex flex-col justify-center  border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-sm text-[var(--muted)] transition hover:border-[var(--primary)] hover:bg-[var(--bg)] cursor-pointer">
                  <span className="font-semibold text-[var(--text)]">📸 Upload Image</span>
                  <span className="mt-1 text-xs text-[var(--muted)]">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-bold text-[var(--surface)] transition hover:shadow-lg active:scale-95"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>

          {/* Tips Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent)]/10 p-6 shadow-md">
            <h3 className="text-lg font-bold text-[var(--text)]">✨ Pro Tips</h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex gap-2">
                <span className="text-lg">📝</span>
                <span>Use clear, descriptive names</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg">💰</span>
                <span>Keep pricing accurate</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg">🖼️</span>
                <span>Upload quality images</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg">⚡</span>
                <span>Edit or delete anytime</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Products Table */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--text)]">Products List</h2>
              <p className="mt-1 text-sm text-[var(--muted)] font-light">
                Edit or delete items from your collection
              </p>
            </div>
            <span className="inline-flex items-center  bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--surface)]">
              {products.length} {products.length === 1 ? "Product" : "Products"}
            </span>
          </div>

          <div className="overflow-x-auto  border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[var(--primary)] text-[var(--surface)] border-b border-[var(--border)]">
                  <th className="px-5 py-4 font-semibold">ID</th>
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Image</th>
                  <th className="px-5 py-4 font-semibold">Details</th>
                  <th className="px-5 py-4 font-semibold">Pricing</th>
                  <th className="px-5 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                {products.length > 0 ? (
                  products.map((product, idx) => (
                    <tr
                      key={product.id}
                      className="hover:bg-[var(--bg)] transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8  bg-[var(--bg)] text-xs font-bold text-[var(--text)]">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="product-name font-semibold text-[var(--text)]">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-14 w-14  object-cover shadow-md group-hover:shadow-lg transition"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center  border-2 border-dashed border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--muted)]">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[var(--muted)] text-xs">
                        {product.description}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="text-xs text-[var(--muted)]">MRP: ₹{product.mrp}</div>
                          <div className="inline-flex  bg-[var(--accent)]/15 px-2 py-1 text-xs font-bold text-[var(--accent)]">
                            -{product.discount}%
                          </div>
                          <div className="text-sm font-bold text-[var(--text)]">₹{product.price}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="rounded-md bg-[var(--primary)]/95 hover:bg-[var(--primary)] px-3 py-2 text-xs font-bold text-[var(--surface)] transition active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-md bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-3 py-2 text-xs font-bold text-[var(--surface)] transition active:scale-95"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center text-[var(--muted)]"
                    >
                      <p className="text-lg font-semibold">📭 No products yet</p>
                      <p className="text-sm mt-1">Add your first product using the form above</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Products;