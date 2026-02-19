function Cart({ cartItems, onBack, onRemove }) {
  const total = cartItems.reduce(
    (sum, item) => sum + (item.list_price || 0),
    0
  );

  return (
    <section className="cart">
      <h2>Kundvagn</h2>

      <button className="back-btn" onClick={onBack}>
        ← Tillbaka till produkter
      </button>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Kundvagnen är tom.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item, idx) => (
              <li key={idx} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <span>{item.list_price} kr</span>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => onRemove(idx)}
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            Totalt: {total.toFixed(2)} kr
          </div>
        </>
      )}
    </section>
  );
}

export default Cart;
