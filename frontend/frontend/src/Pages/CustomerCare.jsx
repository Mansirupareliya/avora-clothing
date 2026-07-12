import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Component/Footer";

export default function CustomerCare() {
  const [activeTab, setActiveTab] = useState("payments");
  const navigate = useNavigate();

  const tabs = [
    { id: "customer-care", label: "Customer Care" },
    { id: "size-guide", label: "Size Guide" },
    { id: "payments", label: "Payments" },
    { id: "shipping", label: "Shipping" },
    { id: "returns", label: "Returns and Refunds" },
    { id: "warranty", label: "Statutory Sales Warranty" },
    { id: "terms", label: "Terms & Conditions" },
    { id: "account", label: "My Account", action: () => navigate("/store/login") },
    { id: "contact", label: "Contact Us", action: () => navigate("/store/contact") },
  ];

  const content = {
    "customer-care": (
      <div className="animate-fadeInUp">
        <h2 style={{ fontSize: 32, fontWeight: 400, margin: "0 0 24px", color: "var(--text)", fontFamily: "var(--heading)" }}>Customer Care</h2>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          Welcome to the AVORA Customer Care area. Here you can find information regarding your orders, shipping, returns, and our policies.
          If you need further assistance, our dedicated Client Service team is at your complete disposal.
        </p>
      </div>
    ),
    "size-guide": (
      <div className="animate-fadeInUp">
        <h2 style={{ fontSize: 32, fontWeight: 400, margin: "0 0 24px", color: "var(--text)", fontFamily: "var(--heading)" }}>Size Guide</h2>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          Our garments are tailored for a precise, elegant fit. Please use the sizing information to find your ideal measurements. If you are between sizes, we recommend sizing up or visiting a boutique for a consultation.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14, marginTop: 24 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "12px 0", color: "var(--text)", fontWeight: 600 }}>Size (IT)</th>
              <th style={{ padding: "12px 0", color: "var(--text)", fontWeight: 600 }}>Size (US/UK)</th>
              <th style={{ padding: "12px 0", color: "var(--text)", fontWeight: 600 }}>Chest (cm)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "16px 0", color: "var(--muted)" }}>46</td>
              <td style={{ padding: "16px 0", color: "var(--muted)" }}>36</td>
              <td style={{ padding: "16px 0", color: "var(--muted)" }}>92</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "16px 0", color: "var(--muted)" }}>48</td>
              <td style={{ padding: "16px 0", color: "var(--muted)" }}>38</td>
              <td style={{ padding: "16px 0", color: "var(--muted)" }}>96</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
    payments: (
      <div className="animate-fadeInUp">
        <h2 style={{ fontSize: 32, fontWeight: 400, margin: "0 0 24px", color: "var(--text)", fontFamily: "var(--heading)" }}>Payments</h2>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          You can purchase items on AVORA.com through our secure payment system either by Credit Card, PayPal or Apple Pay. We use state-of-the-art technology to protect all your data.
          <br /><br />
          If you are a registered user, you can save your payment and shipping details in My Account for a quick and seamless shopping experience.
        </p>

        <div style={{ marginTop: 40 }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", margin: "0 0 12px" }}>Apple Pay</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              Apple Pay is available for those shopping from a Safari browser on a Mac or an Apple mobile device. At checkout, you will be asked to confirm the transaction with Touch ID or Face ID depending on the device.
            </p>
          </div>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", margin: "0 0 12px" }}>Debit and Credit Cards</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              We accept American Express, Discover, JCB, MasterCard, Visa and others. The total will be charged to your credit card once the order is confirmed.
            </p>
          </div>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", margin: "0 0 12px" }}>Klarna</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              With Klarna, you can pay in a simple and flexible way. At checkout, you will be redirected to the Klarna platform to choose the available payment option. Instalment management and due dates are handled directly by Klarna.
            </p>
          </div>
          <div style={{ paddingBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", margin: "0 0 12px" }}>PayPal</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              If you select PayPal as your payment method during checkout, you will be directed to the PayPal website to log in to your account in order to proceed with the order. Payment is debited at the moment the order is confirmed.
            </p>
          </div>
        </div>
      </div>
    ),
    shipping: (
      <div className="animate-fadeInUp">
        <h2 style={{ fontSize: 32, fontWeight: 400, margin: "0 0 24px", color: "var(--text)", fontFamily: "var(--heading)" }}>Shipping</h2>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          We offer complimentary standard shipping on all orders. Expedited shipping options are available at checkout for an additional fee.
        </p>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          All orders are dispatched from our warehouse within 1-2 business days. Once your order has been shipped, you will receive a confirmation email containing the tracking number.
        </p>
      </div>
    ),
    returns: (
      <div className="animate-fadeInUp">
        <h2 style={{ fontSize: 32, fontWeight: 400, margin: "0 0 24px", color: "var(--text)", fontFamily: "var(--heading)" }}>Returns and Refunds</h2>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          You may request a return for any item purchased on our online boutique within 30 days of the delivery date. Items must be returned in their original condition, unworn, unwashed, and with all tags still attached.
        </p>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          Once your return is received and inspected at our warehouse, your refund will be processed and credited to the original payment method within 5-7 business days.
        </p>
      </div>
    ),
    warranty: (
      <div className="animate-fadeInUp">
        <h2 style={{ fontSize: 32, fontWeight: 400, margin: "0 0 24px", color: "var(--text)", fontFamily: "var(--heading)" }}>Statutory Sales Warranty</h2>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          In accordance with current consumer protection laws, all products purchased on our website are covered by a 24-month statutory warranty for conformity defects.
        </p>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          If you encounter a manufacturing defect, please contact our Client Service team immediately with your order details and photographic evidence of the issue.
        </p>
      </div>
    ),
    terms: (
      <div className="animate-fadeInUp">
        <h2 style={{ fontSize: 32, fontWeight: 400, margin: "0 0 24px", color: "var(--text)", fontFamily: "var(--heading)" }}>Terms & Conditions</h2>
        <p style={{ lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
          Welcome to the AVORA website. By accessing and using this website, you agree to comply with and be bound by the following terms and conditions of use.
        </p>
        <div style={{ marginTop: 40 }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", margin: "0 0 12px" }}>1. Intellectual Property</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              All content included on this site, such as text, graphics, logos, images, and software, is the property of AVORA or its content suppliers and protected by international copyright laws.
            </p>
          </div>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", margin: "0 0 12px" }}>2. Product Accuracy</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              We have made every effort to display as accurately as possible the colors and images of our products. However, we cannot guarantee that your computer monitor's display of any color will be accurate.
            </p>
          </div>
          <div style={{ paddingBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", margin: "0 0 12px" }}>3. Governing Law</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the jurisdiction in which our primary business operates.
            </p>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", color: "var(--text)", paddingTop: "30px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Layout: Sidebar + Content */}
        <div style={{ display: "flex", flexWrap: "wrap", minHeight: "calc(100vh - 100px)", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>

          {/* Sidebar Menu */}
          <div style={{ flex: "0 0 280px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>

            {/* Top Contact Block */}
            <div style={{ background: "var(--primary)", color: "var(--surface)", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 500 }}>
                <span>🎧</span> Mon - Fri
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 500 }}>
                <span>📞</span> +91 98796 25625
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: "24px 0", margin: 0, display: "flex", flexDirection: "column" }}>
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => {
                      if (tab.action) {
                        tab.action();
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    style={{
                      width: "100%", textAlign: "left",
                      background: activeTab === tab.id ? "var(--bg)" : "transparent",
                      border: "none",
                      padding: "16px 32px",
                      fontSize: 14,
                      fontWeight: activeTab === tab.id ? 400 : 400,
                      color: "var(--text)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { if (activeTab !== tab.id) e.target.style.background = "var(--bg)"; }}
                    onMouseLeave={e => { if (activeTab !== tab.id) e.target.style.background = "transparent"; }}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Content Area */}
          <div style={{ flex: "1", background: "var(--bg)" }}>
            <div style={{ background: "var(--surface)", padding: "48px 64px", maxWidth: 900 }}>
              {content[activeTab]}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>

      <div style={{ marginTop: 80 }}>
        <Footer />
      </div>
    </div>
  );
}
