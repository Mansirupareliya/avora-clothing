import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Footer from "../Component/Footer";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", orderNumber: "", message: "" });
  const [status, setStatus] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.post(`${apiUrl}/contact`, form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "General Inquiry", orderNumber: "", message: "" });
    } catch (error) {
      console.error("Failed to send inquiry:", error);
      setStatus("error");
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", paddingTop: "60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>



        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ height: 1, width: 40, background: "var(--accent)" }}></div>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--accent)", fontWeight: 600, margin: 0 }}>
              Client Services
            </p>
            <div style={{ height: 1, width: 40, background: "var(--accent)" }}></div>
          </div>
          <h1 style={{ fontFamily: "var(--heading)", fontSize: "30px", fontWeight: 400, margin: "0 0 24px", color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Contact Us
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 600, margin: "0 auto", fontSize: 15, lineHeight: 1.8 }}>
            Our Client Service team is available to assist you with inquiries about our products, your order, or any other questions you may have. We aim to respond to all inquiries within 24 hours.
          </p>
        </div>

        {/* Content Split */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 60, alignItems: "flex-start" }}>

          {/* Left: Info */}
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 40 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Customer Care</h3>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Call Us</h4>
                <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>+91 98796 25625</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Email Us</h4>
                <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>avora@gmail.com</p>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Hours of Operation</h4>
                <p style={{ fontSize: 14, color: "var(--text)", margin: "0 0 4px" }}>Monday - Friday: 9:00 AM - 6:00 PM (GMT)</p>

              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Boutique Appointments</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", marginBottom: 24 }}>
                Experience our made-to-measure services and view our latest collections in person by booking an appointment at your nearest boutique.
              </p>
              <button style={{
                background: "transparent", border: "1px solid var(--primary)", color: "var(--primary)",
                padding: "12px 24px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                cursor: "pointer", width: "100%", transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.target.style.background = "var(--primary)"; e.target.style.color = "var(--surface)"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "var(--primary)"; }}
              >
                Find a Boutique
              </button>
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ flex: "2 1 500px", background: "var(--surface)", border: "1px solid var(--border)", padding: "48px", boxShadow: "0 12px 40px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 8px" }}>Send a Message</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 32px" }}>Please fill out the form below and we will get back to you shortly.</p>

            {status === "success" ? (
              <div style={{ background: "rgba(45,167,161,0.1)", border: "1px solid rgba(45,167,161,0.3)", padding: 24, color: "var(--primary)", textAlign: "center" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Thank You</h3>
                <p style={{ margin: 0, fontSize: 14 }}>Your message has been received. Our client service team will contact you shortly.</p>
                <button
                  onClick={() => setStatus("")}
                  style={{ marginTop: 20, background: "var(--primary)", color: "var(--surface)", border: "none", padding: "10px 20px", cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {status === "error" && (
                  <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", fontSize: 14 }}>
                    Failed to send message. Please try again.
                  </div>
                )}

                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--text)" }}>Full Name *</label>
                    <input type="text" name="name" required value={form.name} onChange={handle} style={{ width: "100%", padding: "14px 16px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--text)" }}>Email Address *</label>
                    <input type="email" name="email" required value={form.email} onChange={handle} style={{ width: "100%", padding: "14px 16px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--text)" }}>Subject</label>
                    <select name="subject" value={form.subject} onChange={handle} style={{ width: "100%", padding: "14px 16px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: 14, outline: "none", boxSizing: "border-box", appearance: "none" }}
                      onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = "var(--border)"}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Status">Order Status</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                      <option value="Product Information">Product Information</option>
                    </select>
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--text)" }}>Order Number (Optional)</label>
                    <input type="text" name="orderNumber" value={form.orderNumber} onChange={handle} style={{ width: "100%", padding: "14px 16px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--text)" }}>Message *</label>
                  <textarea name="message" required value={form.message} onChange={handle} rows="6" style={{ width: "100%", padding: "14px 16px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" }}
                    onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = "var(--border)"}
                  ></textarea>
                </div>

                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginTop: 8 }}>
                  By submitting this form, you agree to our Privacy Policy and consent to us processing your personal data to assist with your inquiry.
                </div>

                <button type="submit" disabled={status === "sending"} style={{
                  background: status === "sending" ? "var(--muted)" : "var(--primary)",
                  color: "var(--surface)", border: "none", padding: "16px", fontSize: 13, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em", cursor: status === "sending" ? "not-allowed" : "pointer",
                  width: "100%", transition: "all 0.2s"
                }}
                  onMouseEnter={e => { if (status !== "sending") e.target.style.background = "#1a2333"; }}
                  onMouseLeave={e => { if (status !== "sending") e.target.style.background = "var(--primary)"; }}
                >
                  {status === "sending" ? "Sending..." : "Submit Inquiry"}
                </button>

              </form>
            )}
          </div>

        </div>
      </div>
      <div style={{ marginTop: 80 }}>
        <Footer />
      </div>
    </div>
  );
}
