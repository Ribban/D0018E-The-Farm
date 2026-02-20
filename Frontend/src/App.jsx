import Login from "./Pages/login"
import Profile from "./Pages/profile"
import useToken from "./Pages/useToken"
import "./App.css";
import { useEffect, useState } from "react";
import Cart from "./Pages/cart";
import axios from "axios";

function Header({ onCartClick, onHomeClick, logMeOut, onLoginClick, onProfileClick, token }) {
  return (
    <header className="header">
      <div className="logo" onClick={onHomeClick} style={{ cursor: "pointer" }}>
        Lönåsgården
      </div>
      <nav className="nav">
        <button className="menu-btn" onClick={onHomeClick}>
          Meny
        </button>

        {token && 
        <button className="profile-btn" onClick={onProfileClick}>
          Profil
        </button>}
        
        <button className="cart-btn" onClick={onCartClick}>
          Kundvagn
        </button>

        {token && token !== "" && token !== undefined ? (
          <button className="logout-btn" onClick={logMeOut}> 
            Logga ut
          </button>
        ) : (
          <button className="login-btn" onClick={onLoginClick}> 
            Logga in
          </button>
        )}
      </nav>
    </header>
  );
}

function ProductList({ onAddToCart }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const sortOptions = [
    { value: "price", label: "Pris" },
    { value: "unitPrice", label: "Jämförpris" },
    { value: "animalAge", label: "Djurets ålder" },
    { value: "packagingDate", label: "Packdatum" },
  ];

  const getUnitPrice = (product) => {
    if (!product.weight || !product.list_price) return 0;
    return product.list_price / product.weight;
  };

  useEffect(() => {
    fetch("http://95.155.245.165:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue, bValue;

    switch (sortKey) {
      case "price":
        aValue = a.list_price;
        bValue = b.list_price;
        break;
      case "unitPrice":
        aValue = getUnitPrice(a);
        bValue = getUnitPrice(b);
        break;
      case "animalAge":
        aValue = a.animal_age || 0;
        bValue = b.animal_age || 0;
        break;
      case "packagingDate":
        aValue = new Date(a.packaging_date);
        bValue = new Date(b.packaging_date);
        break;
      default:
        return 0;
    }

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  return (
    <section className="product-list">
      <h2>Produkter</h2>
      <div className="sort-controls">
        <label>Sök:</label>
        <input
          type="text"
          placeholder="Sök produkt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <label>Sortera:</label>
        <select
          value={sortKey + "-" + sortOrder}
          onChange={(e) => {
            const [key, order] = e.target.value.split("-");
            setSortKey(key);
            setSortOrder(order);
          }}
        >
          <option value="-asc">Ingen</option>

          {sortOptions.map((opt) => (
            <>
              <option key={opt.value + "-asc"} value={opt.value + "-asc"}>
                {opt.label} (Stigande)
              </option>
              <option key={opt.value + "-desc"} value={opt.value + "-desc"}>
                {opt.label} (Sänkande)
              </option>
            </>
          ))}
        </select>
      </div>

      <div className="products">
        {sortedProducts.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>

            {product.category_id === 2 ? (
              <>
                <p>Volym: {product.weight} L</p>
                <p>
                  Jämförpris:{" "}
                  {(product.list_price / product.weight).toFixed(2)} kr/L
                </p>
              </>
            ) : (
              <>
                <p>Vikt: {product.weight} kg</p>
                <p>
                  Jämförpris:{" "}
                  {(product.list_price / product.weight).toFixed(2)} kr/kg
                </p>

                {product.category_id === 1 && (
                  <p>Djurets Ålder: {product.animal_age} år</p>
                )}
              </>
            )}

            <p>Packdatum: {product.packaging_date}</p>

            <span>{product.list_price} kr</span>

            <button onClick={() => onAddToCart(product)}>
              Lägg till i kundvagn
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [page, setPage] = useState("products");
  const [cart, setCart] = useState([]);
  const { token, removeToken, setToken } = useToken();

  const Logout = () => {
    axios({
      method: "POST",
      url: "http://95.155.245.165:5000/logout",
    })
    .then(() => {
      removeToken(); 
      setPage("products"); 
    })
    .catch((err) => console.error("Logout failed", err));
  };

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const handleDecreaseQuantity = (id) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx !== -1) {
        return prev.slice(0, idx).concat(prev.slice(idx + 1));
      }
      return prev;
    });
  };

  const handleIncreaseQuantity = (id) => {
    const product = cart.find((item) => item.id === id);
    if (product) {
      setCart((prev) => [...prev, product]);
    }
  };

  return (
    <div className="App">
      <div className="page-container">
        <Header
          onCartClick={() => setPage("cart")}
          onHomeClick={() => setPage("products")}
          onProfileClick={() => setPage("profile")}
          onLoginClick={() => setPage("login")} 
          logMeOut={Logout}
          token={token}
        />
        <main>
          {page === "products" && (
            <ProductList
             onAddToCart={handleAddToCart} 
             />
          )}

          {page === "cart" && (
            <Cart
              cartItems={cart}
              onBack={() => setPage("products")}
              onDecrease={handleDecreaseQuantity}
              onIncrease={handleIncreaseQuantity}
            />
          )}

          {page === "login" && (
            <Login setToken={(newToken) => {
              setToken(newToken);
              setPage("products"); 
            }} />
          )}

          {page === "profile" && (
            <Profile token={token} setToken={setToken} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;