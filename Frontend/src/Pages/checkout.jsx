import { useState } from "react";

function Checkout({ cartItems, onBack, onOrder, loading, error, success }) {
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [payment, setPayment] = useState("dummy");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickupDate || !pickupTime) return;
    onOrder({ pickup_date: `${pickupDate}T${pickupTime}`, payment_method: payment });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="checkout">
      <h2>Slutför köp</h2>
      <button className="back-btn" onClick={onBack}>
        ← Tillbaka till kundvagn
      </button>
      <form onSubmit={handleSubmit}>
        <label>
          Upphämtningsdatum:
          <input
            type="date"
            min={today}
            value={pickupDate}
            onChange={e => setPickupDate(e.target.value)}
            required
          />
        </label>
        <label>
          Tid:
          <input
            type="time"
            value={pickupTime}
            onChange={e => setPickupTime(e.target.value)}
            required
          />
        </label>
        <label>
          Betalsätt:
          <select value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="dummy">Dummy-betalning (test)</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          Slutför köp
        </button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      {success && <p style={{color:'green'}}>Ordern är lagd! Order-ID: {success}</p>}
    </section>
  );
}

export default Checkout;