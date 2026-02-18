import '/src/App.css';
import { useEffect, useState } from "react";

function Header() {
  return (
    <header className="header">
      <div className="logo">Lönåsgården</div>
      <nav
        className="nav"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '1em',
          overflowX: 'auto',
          width: '100%',
          minWidth: 0,
        }}
      >
        <button className="menu-btn">Meny</button>
        <button className="profile-btn">Profil</button>
        <button className="cart-btn">Kundvagn</button>
      </nav>
    </header>
  );
}

function ProductList() {
    const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const sortOptions = [
    { value: 'price', label: 'Pris' },
    { value: 'unitPrice', label: 'Jämförpris' },
    { value: 'animalAge', label: 'Djurets ålder' },
    { value: 'packagingDate', label: 'Packdatum' },
  ];

  const getUnitPrice = (product) => {
    if (!product.weight || !product.list_price) return 0;
    return product.list_price / product.weight;
  };

  const filteredProducts = products.filter(product =>
    product.name && product.name.toLowerCase().includes(search.toLowerCase())
  );
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue, bValue;
    switch (sortKey) {
      case 'price':
        aValue = a.list_price;
        bValue = b.list_price;
        break;
      case 'unitPrice':
        aValue = getUnitPrice(a);
        bValue = getUnitPrice(b);
        break;
      case 'animalAge':
        aValue = a.animal_age || 0;
        bValue = b.animal_age || 0;
        break;
      case 'packagingDate':
        aValue = new Date(a.packaging_date);
        bValue = new Date(b.packaging_date);
        break;
      case 'weight':
        aValue = a.weight;
        bValue = b.weight;
        break;
      default:
        return 0;
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    fetch("http://95.155.245.165:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section
      className="product-list"
      style={{
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        boxSizing: 'border-box',
        minHeight: '600px',
      }}
    >
      <h2>Produkter</h2>
      <div className="sort-controls" style={{
        marginBottom: '1em',
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '1em',
        alignItems: 'center',
        justifyContent: 'center',
        overflowX: 'auto',
        width: '100%',
        minWidth: 0,
      }}>
        <label htmlFor="search-products">Sök: </label>
        <input
          id="search-products"
          type="text"
          placeholder="Sök produkt..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.3em 0.7em', borderRadius: '4px', border: '1px solid #888', minWidth: '160px' }}
        />
        <label style={{ marginLeft: '1em' }}>Sortera efter: </label>
        <select
          value={sortKey + '-' + sortOrder}
          onChange={e => {
            const [key, order] = e.target.value.split('-');
            setSortKey(key);
            setSortOrder(order);
          }}
        >
          <option value="">Ingen</option>
          {sortOptions.map(opt => [
            <option key={opt.value + '-asc'} value={opt.value + '-asc'}>
              {opt.label} (Stigande)
            </option>,
            <option key={opt.value + '-desc'} value={opt.value + '-desc'}>
              {opt.label} (Sänkande)
            </option>
          ])}
        </select>
      </div>
      <div
        className="products"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          margin: '0 auto',
          justifyItems: 'center',
        }}
      >
        {sortedProducts.map(product => (
          <div
            key={product.id}
            className="product-card"
            style={{
              width: '110%',
              maxWidth: '110%',
              minWidth: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifySelf: 'center',
              boxSizing: 'border-box',
            }}
          >
            <h3>{product.name}</h3>
            {product.category_id === 2 ? (
              <>
                <p>Volym: {product.weight} L</p>
                <p>Jämförpris: {(product.list_price / product.weight).toFixed(2)} kr/L</p>
              </>
            ) : (
              <>
                <p>Vikt: {product.weight} kg</p>
                <p>Jämförpris: {(product.list_price / product.weight).toFixed(2)} kr/kg</p>
                {product.category_id === 1 && (
                  <p>Djurets Ålder: {product.animal_age} år</p>
                )}
              </>
            )}
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