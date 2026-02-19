function groupCartItems(cartItems) {
  const grouped = {};
  cartItems.forEach(item => {
    if (!grouped[item.id]) {
      grouped[item.id] = { ...item, quantity: 1 };
    } else {
      grouped[item.id].quantity += 1;
    }
  });
  return Object.values(grouped);
}

function Cart({ cartItems, onBack, onRemove, onIncrease, onDecrease }) {
  const groupedItems = groupCartItems(cartItems);
  const total = groupedItems.reduce(
    (sum, item) => sum + (item.list_price || 0) * item.quantity,
    0
  );

  return (
    <section className="cart">
      <h2>Kundvagn</h2>

      <button className="back-btn" onClick={onBack}>
        ← Tillbaka till produkter
      </button>

      {groupedItems.length === 0 ? (
        <p className="empty-cart">Kundvagnen är tom.</p>
      ) : (
        <>
          <ul className="cart-list">
            {groupedItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <span>{item.list_price} kr</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                  <button className="remove-btn" style={{padding: '0.3em 0.7em', fontSize: '1.2em'}} onClick={() => onDecrease(item.id)}>-</button>
                  <span style={{ minWidth: 24, display: 'inline-block', textAlign: 'center' }}>{item.quantity} st</span>
                  <button className="remove-btn" style={{padding: '0.3em 0.7em', fontSize: '1.2em', background: '#4f8cff'}} onClick={() => onIncrease(item.id)}>+</button>
                </div>
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
