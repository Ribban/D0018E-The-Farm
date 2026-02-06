import '/src/App.css';
import { useEffect, useState } from "react";

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

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://95.155.245.165:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="product-list">
      <h2>Produkter</h2>
      <div className="products">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>Vikt: {product.weight} kg</p>
            <p>Packdatum: {product.packaging_date}</p>
            <span>{product.list_price} kr</span>
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