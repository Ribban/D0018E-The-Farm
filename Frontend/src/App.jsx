import '/src/App.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">Lönås Gården</div>
      <nav className="nav">
        <button className="menu-btn">Meny</button>
        <button className="profile-btn">Profil</button>
        <button className="cart-btn">Kundvagn</button>
      </nav>
    </header>
  );
}

const mockProducts = [
  { id: 1, name: 'Mjölk', price: '20Kr/L', description: 'Färsk mjölk från vår gård.' }
];

function ProductList() {
  return (
    <section className="product-list">
      <h2>Produkter</h2>
      <div className="products">
        {mockProducts.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span>{product.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <ProductList />
      </main>
    </div>
  );
}

export default App;