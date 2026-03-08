import Login from "./Pages/login"
import Profile from "./Pages/profile"
import Register from "./Pages/register"
import useToken from "./Pages/useToken"
import "./App.css";
import { useEffect, useState } from "react";
import Cart from "./Pages/cart";
import axios from "axios";
import Checkout from "./Pages/checkout";
import AdminProducts from "./Pages/admin";
import Comments from "./Pages/Comments";
import About from "./Pages/about";
import lägd from "./assets/lägd.jpg";

function Header({ onCartClick, onHomeClick, logMeOut, onLoginClick, onProfileClick, onAdminClick, onAboutClick, token, isAdmin }) {
  return (
    <header className="header">
      <div className="logo" onClick={onHomeClick} style={{ cursor: "pointer" }}>
        Lönåsgården
      </div>
      <nav className="nav">
        <button className="menu-btn" onClick={onAboutClick}>
          Om oss
        </button>
        <button className="menu-btn" onClick={onHomeClick}>
          Meny
        </button>
        {isAdmin && (
          <button className="admin-btn" onClick={onAdminClick}>
            Admin
          </button>
        )}
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
function Background_img({}){
  return (
    <section className="hero-section">
      <img src={lägd} alt="Lönåsgården bakgrund" className="hero-image" />
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>Välkommen till Lönåsgården</h1>
          <p>Närproducerad mat med ursprung i Västerbotten</p>
        </div>
      </div>
    </section>
  );
}
  


function ProductList({ onAddToCart, token, onProductClick, productsToRender }) {
  const [search, setSearch] = useState("");
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

  const filteredProducts = productsToRender.filter((product) =>
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
          {sortOptions.map((opt) => [
            <option key={opt.value + "-asc"} value={opt.value + "-asc"}>
              {opt.label} (Stigande)
            </option>,
            <option key={opt.value + "-desc"} value={opt.value + "-desc"}>
              {opt.label} (Sjunkande)
            </option>,
          ])}
        </select>
      </div>

      <div className="products">
        {sortedProducts.map((product) => (
          <div key={product.id} className="product-card">
            {product.image_url ? (
               <img 
                 src={product.image_url} 
                 alt={product.name} 
                 className="product-list-image"
                 onClick={() => onProductClick(product)}
               />
            ) : (
               <div className="product-list-image-placeholder" onClick={() => onProductClick(product)}>
                 <span>Bild saknas</span>
               </div>
            )}

            <h3
              onClick={() => onProductClick(product)}
              style={{ cursor: "pointer", color: "#557a46" }}
            >
              {product.name}
            </h3>

            <div className="product-info">
              <p>I lager: {product.totalStock} st</p>
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
              {product.nextBatchDate && (
                <p className="next-batch-text" style={{fontSize: "0.85em", color: "#666", marginTop: "-5px"}}>
                  Nästa låda: {product.nextBatchDate}
                </p>
              )}
            </div>

            <span>{product.list_price} kr</span>

            <button 
              className="add-to-cart-btn"
              onClick={() => onAddToCart(product)}
              disabled={product.remainingToBuy <= 0}
            >
              {product.remainingToBuy <= 0 ? "Fullbokat i vagnen" : "Lägg i kundvagn"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductDetail({ product, onAddToCart, onBack, token }) {
  if (!product) return null;

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={onBack}>
        &larr; Tillbaka till menyn
      </button>

      <div className="product-detail-container">
        <div className="product-image-section">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="product-detail-image" 
            />
          ) : (
            <div className="placeholder-image">
              <span>Bild saknas</span>
            </div>
          )}
        </div>

        <div className="product-info-section">
          <h2>{product.name}</h2>
          <span className="detail-price">{product.list_price} kr</span>

          <div className="detail-specs">
            <p><strong>I lager: </strong>{product.totalStock} st</p>
            {product.category_id === 2 ? (
              <>
                <p><strong>Volym:</strong> {product.weight} L</p>
                <p><strong>Jämförpris:</strong> {(product.list_price / product.weight).toFixed(2)} kr/L</p>
              </>
            ) : (
              <>
                <p><strong>Vikt:</strong> {product.weight} kg</p>
                <p><strong>Jämförpris:</strong> {(product.list_price / product.weight).toFixed(2)} kr/kg</p>
                {product.category_id === 1 && (
                  <p><strong>Djurets Ålder:</strong> {product.animal_age} år</p>
                )}
              </>
            )}
    
            <p><strong>Packdatum:</strong> {product.packaging_date}</p>
              {product.nextBatchDate && (
                <p className="next-batch-text" style={{fontSize: "0.85em", color: "#666", marginTop: "-5px"}}>
                  Nästa låda: {product.nextBatchDate}
                </p>
              )}
            
          </div>

          <button 
            className="add-to-cart-btn"
            onClick={() => onAddToCart(product)}
            disabled={product.remainingToBuy <= 0}
          >
            {product.remainingToBuy <= 0 ? "Fullbokat i vagnen" : "Lägg i kundvagn"}
          </button>
        </div>
      </div>

      <div className="product-reviews-section">
        <h3>Recensioner för {product.name}</h3>
        <Comments productId={product.id} token={token} />
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("products");
  const [cart, setCart] = useState([]);
  const { token, removeToken, setToken } = useToken();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);

useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const getGroupedProducts = () => {
    if (!products) return [];
    const grouped = {};

    products.forEach(product => {
      const groupKey = product.name.trim().toLowerCase();
      const cartItem = cart?.find(c => (c.product_id || c.id) === product.id);
      const inCartQty = cartItem ? cartItem.quantity : 0;
      
      const physicalStock = product.stock || 0;
      const remainingInThisBatch = physicalStock - inCartQty;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          displayName: product.name,
          totalPhysicalStock: 0,
          totalRemainingToBuy: 0,
          batches: []
        };
      }
      grouped[groupKey].totalPhysicalStock += physicalStock;
      grouped[groupKey].totalRemainingToBuy += remainingInThisBatch;
      
      if (physicalStock > 0) {
        grouped[groupKey].batches.push({ ...product, remainingInThisBatch });
      }
    });

    return Object.values(grouped)
      .filter(group => group.totalPhysicalStock > 0) 
      .map(group => {
        const sortedBatches = group.batches.sort((a, b) => new Date(a.packaging_date) - new Date(b.packaging_date));
        const availableBatches = sortedBatches.filter(b => b.remainingInThisBatch > 0);
        
        const activeBatch = availableBatches.length > 0 ? availableBatches[0] : sortedBatches[0];
        const nextBatch = availableBatches.length > 1 ? availableBatches[1] : null;

        return {
          ...activeBatch,
          name: group.displayName,
          totalStock: group.totalPhysicalStock,
          remainingToBuy: group.totalRemainingToBuy,
          nextBatchDate: nextBatch ? nextBatch.packaging_date : null 
        };
      });
  };

  const productsToRender = getGroupedProducts();

  const liveDetailedProduct = currentProduct 
    ? productsToRender.find(p => p.name === currentProduct.name) 
    : null;


  useEffect(() => {
    if (!token) { setIsAdmin(false); return; }
    axios.get((`${import.meta.env.VITE_SERVER_URL}/api/profile`), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setIsAdmin(res.data.Admin === true || res.data.Admin === 1))
      .catch(() => setIsAdmin(false));
  }, [token]);

  // Load cart - from database if logged in, from localStorage if not
  useEffect(() => {
    if (!token || token === "undefined" || token === null) {
      // Load from localStorage for anonymous users
      const localCart = localStorage.getItem("guestCart");
      if (localCart) {
        try {
          setCart(JSON.parse(localCart));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
      return;
    }
    axios.get((`${import.meta.env.VITE_SERVER_URL}/api/cart`), {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setCart(res.data.items || []))
    .catch(() => setCart([]));
  }, [token]);

  useEffect(() => {
    if (!token || token === "undefined" || token === null) {
      localStorage.setItem("guestCart", JSON.stringify(cart));
    }
  }, [cart, token]);

  const syncLocalCartToDatabase = async (newToken) => {
    const localCart = localStorage.getItem("guestCart");
    if (!localCart) return;
    
    try {
      const items = JSON.parse(localCart);
      if (items.length === 0) return;

      for (const item of items) {
        await axios.post((`${import.meta.env.VITE_SERVER_URL}/api/cart/add`), {
          product_id: item.product_id || item.id,
          quantity: item.quantity || 1
        }, {
          headers: { Authorization: `Bearer ${newToken}` }
        });
      }

      localStorage.removeItem("guestCart");

      const res = await axios.get((`${import.meta.env.VITE_SERVER_URL}/api/cart`), {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Failed to sync cart:", err);
    }
  };

  const Logout = () => {
    axios({
      method: "POST",
      url: `${import.meta.env.VITE_SERVER_URL}/api/logout`,
    })
      .then(() => {
        removeToken();
        setPage("products");
      })
      .catch((err) => console.error("Logout failed", err));
  };

  const handleAddToCart = (product) => {
    if (!token || token === "undefined" || token === null) {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => (item.product_id || item.id) === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            (item.product_id || item.id) === product.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          );
        } else {
          return [...prevCart, {
            product_id: product.id,
            id: product.id,
            name: product.name,
            list_price: product.list_price,
            quantity: 1
          }];
        }
      });
      return;
    }

    axios.post((`${import.meta.env.VITE_SERVER_URL}/api/cart/add`), {
      product_id: product.id,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setCart(res.data.items || []));
  };

  const handleDecreaseQuantity = (id) => {
    const item = cart.find((item) => item.product_id === id || item.id === id);
    if (!item) return;
    const newQty = (item.quantity || 1) - 1;

    if (!token || token === "undefined" || token === null) {
      if (newQty <= 0) {
        setCart(prevCart => prevCart.filter(item => (item.product_id || item.id) !== id));
      } else {
        setCart(prevCart => prevCart.map(item =>
          (item.product_id || item.id) === id
            ? { ...item, quantity: newQty }
            : item
        ));
      }
      return;
    }

    if (newQty <= 0) {
      axios.post((`${import.meta.env.VITE_SERVER_URL}/api/cart/remove`), {
        product_id: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCart(res.data.items || []));
    } else {
      axios.post((`${import.meta.env.VITE_SERVER_URL}/api/cart/update`), {
        product_id: id,
        quantity: newQty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCart(res.data.items || []));
    }
  };

  const handleIncreaseQuantity = (id) => {
    const itemInCart = cart.find((item) => item.product_id === id || item.id === id);
    if (!itemInCart) return;

    const rawProduct = products.find(p => p.id === id);
    if (!rawProduct) return;

    const physicalStock = rawProduct.stock || 0;

    if ((itemInCart.quantity || 1) < physicalStock) {
      const newQty = (itemInCart.quantity || 1) + 1;

      if (!token || token === "undefined" || token === null) {
        setCart(prevCart => prevCart.map(item =>
          (item.product_id || item.id) === id
            ? { ...item, quantity: newQty }
            : item
        ));
        return;
      }

      axios.post((`${import.meta.env.VITE_SERVER_URL}/api/cart/update`), {
        product_id: id,
        quantity: newQty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCart(res.data.items || []));

    } else {
      const groupedProduct = productsToRender.find(p => p.name === rawProduct.name);
      
      if (groupedProduct && groupedProduct.remainingToBuy > 0) {
        handleAddToCart(groupedProduct);
      } else {
        alert(`Det finns tyvärr inga fler ${rawProduct.name} i lager just nu.`);
      }
    }
  };
  const handleCheckout = ({ pickup_date, payment_method }) => {
    setCheckoutLoading(true);
    setCheckoutError("");
    setCheckoutSuccess("");
    axios.post((`${import.meta.env.VITE_SERVER_URL}/api/cart/checkout`), {
      pickup_date,
      payment_method
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setCheckoutSuccess(res.data.order_id);
        setCart([]);
      })
      .catch(err => {
        setCheckoutError(err.response?.data?.msg || "Något gick fel");
      })
      .finally(() => setCheckoutLoading(false));
  };

  return (
    <div className="App">
      
      <div className="page-container">
        <Header
          onCartClick={() => setPage("cart")}
          onHomeClick={() => setPage("products")}
          onProfileClick={() => setPage("profile")}
          onLoginClick={() => setPage("login")} 
          onAdminClick={() => setPage("admin")}
          onAboutClick={() => setPage("about")}
          logMeOut={Logout}
          token={token}
          isAdmin={isAdmin}
        />

        
        {page === "products" && <Background_img />}
        <main>
          {page === "products" && (
            <ProductList
             onAddToCart={handleAddToCart}
             token={token}
             onProductClick={(product) => {
               setCurrentProduct(product);
               setPage("productDetail");
             }}
             productsToRender={productsToRender}
             cart={cart}
             />
          )}

        {page === "productDetail" && (
            <ProductDetail 
              product={liveDetailedProduct}
              onAddToCart={handleAddToCart}
              onBack={() => setPage("products")}
              token={token}
            />
          )}

          {page === "cart" && (
            <>
              <Cart
                cartItems={cart}
                onBack={() => setPage("products")}
                onDecrease={handleDecreaseQuantity}
                onIncrease={handleIncreaseQuantity}
              />
              {cart.length > 0 && (
                <button className="checkout-btn" onClick={() => setPage("checkout")}>Till kassan</button>
              )}
            </>
          )}

          {page === "checkout" && (
            <Checkout
              cartItems={cart}
              onBack={() => setPage("cart")}
              onOrder={handleCheckout}
              loading={checkoutLoading}
              error={checkoutError}
              success={checkoutSuccess}
            />
          )}

          {page === "admin" && (
            <AdminProducts token={token} />
          )}

          {page === "login" && (
            <Login 
              setToken={async (newToken) => {
                setToken(newToken);
                await syncLocalCartToDatabase(newToken);
                setPage("products"); 
              }}
              onRegisterClick={() => setPage("register")}
            />
          )}

          {page === "register" && (
            <Register onBackToLogin={() => setPage("login")} />
          )}

          {page === "profile" && (
            <Profile token={token} setToken={setToken} />
          )}
          {page === "about" && (
            <About
             
              token={token}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;