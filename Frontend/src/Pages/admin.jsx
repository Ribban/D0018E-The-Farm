import { useEffect, useState } from "react";
import axios from "axios";

const ORDER_STATUS = {
  1: "Mottagen",
  2: "Under behandling",
  3: "Redo för upphämtning",
  4: "Levererad",
  5: "Avbruten"
};

const STATUS_SECTIONS = [
  { status: 1, title: "Nya ordrar", description: "Behöver behandlas" },
  { status: 2, title: "Under behandling", description: "Pågående" },
  { status: 3, title: "Redo för upphämtning", description: "Väntar på kund" },
  { status: 4, title: "Levererade", description: "Avslutade" },
  { status: 5, title: "Avbrutna", description: "Annullerade ordrar" }
];

function OrderTable({ orders, onStatusChange, onDelete, onViewDetails }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  if (orders.length === 0) {
    return <p className="no-orders">Inga ordrar</p>;
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortKey) return 0;
    
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';

    if (sortKey === 'order_id' || sortKey === 'total' || sortKey === 'order_status') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ label, sortKeyName }) => (
    <th onClick={() => handleSort(sortKeyName)} className="sortable-header">
      {label}
      {sortKey === sortKeyName && (
        <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
      )}
    </th>
  );
  
  return (
    <table>
      <thead>
        <tr>
          <SortHeader label="Order-ID" sortKeyName="order_id" />
          <SortHeader label="Kund" sortKeyName="customer_name" />
          <SortHeader label="Datum" sortKeyName="order_date" />
          <SortHeader label="Hämtdatum" sortKeyName="pickup_date" />
          <SortHeader label="Status" sortKeyName="order_status" />
          <SortHeader label="Summa" sortKeyName="total" />
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sortedOrders.map(order => (
          <tr key={order.order_id}>
            <td>{order.order_id}</td>
            <td>{order.customer_name}</td>
            <td>{order.order_date}</td>
            <td>{order.pickup_date || "-"}</td>
            <td>
              <select 
                value={order.order_status} 
                onChange={(e) => onStatusChange(order.order_id, e.target.value)}
                className="status-select"
              >
                {Object.entries(ORDER_STATUS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </td>
            <td>{order.total?.toFixed(2)} kr</td>
            <td>
              <button onClick={() => onViewDetails(order)}>Visa</button>
              <button onClick={() => onDelete(order.order_id)}>Ta bort</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AdminOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [collapsedSections, setCollapsedSections] = useState({ 4: true, 5: true });

  const fetchOrders = () => {
    axios.get(`${import.meta.env.VITE_SERVER_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]));
  };

  useEffect(() => { fetchOrders(); }, []);

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.order_status === status);
  };

  const toggleSection = (status) => {
    setCollapsedSections(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleStatusChange = (orderId, newStatus) => {
    setError(""); setSuccess("");
    axios.put(`${import.meta.env.VITE_SERVER_URL}/api/orders/${orderId}/status`, 
      { order_status: parseInt(newStatus) },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setSuccess("Orderstatus uppdaterad!");
        fetchOrders();
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder(prev => ({ ...prev, order_status: parseInt(newStatus) }));
        }
      })
      .catch(err => setError(err.response?.data?.msg || "Fel vid uppdatering"));
  };

  const handleDelete = (orderId) => {
    if (!window.confirm("Är du säker på att du vill ta bort denna order?")) return;
    setError(""); setSuccess("");
    axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setSuccess("Order borttagen!");
        fetchOrders();
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder(null);
        }
      })
      .catch(err => setError(err.response?.data?.msg || "Fel vid borttagning"));
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  return (
    <section className="admin-orders">
      <h2>Admin: Hantera ordrar</h2>
      {error && <p className="status-msg error">{error}</p>}
      {success && <p className="status-msg success">{success}</p>}
      
      <p className="order-count">Totalt {orders.length} ordrar</p>
      
      {STATUS_SECTIONS.map(({ status, title, description }) => {
        const sectionOrders = getOrdersByStatus(status);
        const isCollapsed = collapsedSections[status];
        
        return (
          <div key={status} className={`order-section status-section-${status}`}>
            <div className="order-section-header" onClick={() => toggleSection(status)}>
              <div className="order-section-title">
                <span className={`section-indicator status-${status}`}></span>
                <h3>{title}</h3>
                <span className="order-section-count">{sectionOrders.length}</span>
              </div>
              <span className="order-section-description">{description}</span>
              <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
            </div>
            
            {!isCollapsed && (
              <div className="order-section-content">
                <OrderTable 
                  orders={sectionOrders}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onViewDetails={viewOrderDetails}
                />
              </div>
            )}
          </div>
        );
      })}

      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Order #{selectedOrder.order_id}</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            
            <div className="order-modal-content">
              <div className="order-info-grid">
                <div className="order-info-item">
                  <label>Kund</label>
                  <span>{selectedOrder.customer_name}</span>
                </div>
                <div className="order-info-item">
                  <label>E-post</label>
                  <span>{selectedOrder.customer_email}</span>
                </div>
                <div className="order-info-item">
                  <label>Telefon</label>
                  <span>{selectedOrder.customer_phone || "-"}</span>
                </div>
                <div className="order-info-item">
                  <label>Orderdatum</label>
                  <span>{selectedOrder.order_date}</span>
                </div>
                <div className="order-info-item">
                  <label>Hämtdatum</label>
                  <span>{selectedOrder.pickup_date || "-"}</span>
                </div>
                <div className="order-info-item">
                  <label>Status</label>
                  <span className={`status-badge status-${selectedOrder.order_status}`}>
                    {ORDER_STATUS[selectedOrder.order_status]}
                  </span>
                </div>
              </div>
              
              <h4>Produkter</h4>
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>Antal</th>
                    <th>Pris/st</th>
                    <th>Summa</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.list_price?.toFixed(2)} kr</td>
                      <td>{item.item_total?.toFixed(2)} kr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="order-total">
                <strong>Totalt:</strong> {selectedOrder.total?.toFixed(2)} kr
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AdminProducts({ token }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", weight: "", packaging_date: "", list_price: "", animal_age: "", category_id: "", image_url: "" });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = () => {
    axios.get((`${import.meta.env.VITE_SERVER_URL}/api/products`))
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError(""); setSuccess("");
    const req = editId
      ? axios.put(`${import.meta.env.VITE_SERVER_URL}/api/products/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } })
      : axios.post((`${import.meta.env.VITE_SERVER_URL}/api/products`), form, { headers: { Authorization: `Bearer ${token}` } });
    req.then(() => {
      setSuccess(editId ? "Uppdaterad!" : "Skapad!");
      setForm({ 
        name: "",
        weight: "",
        packaging_date: "",
        list_price: "",
        animal_age: "",
        category_id: "",
        image_url: "",
        stock: ""
      });
      setEditId(null);
      fetchProducts();
    }).catch(err => setError(err.response?.data?.msg || "Fel vid sparande"));
  };

  const handleEdit = p => {
    setEditId(p.id);
    setForm({
      name: p.name,
      weight: p.weight,
      packaging_date: p.packaging_date,
      list_price: p.list_price,
      animal_age: p.animal_age,
      category_id: p.category_id,
      image_url: p.image_url || "",
      stock: p.stock
    });
  };

  const handleDelete = id => {
    if (!window.confirm("Ta bort produkten?")) return;
    axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { setSuccess("Borttagen!"); fetchProducts(); })
      .catch(err => setError(err.response?.data?.msg || "Fel vid borttagning"));
  };

  return (
    <section className="admin-products">
      <h2>Admin: Hantera produkter</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Namn" value={form.name} onChange={handleChange} required />
        <input name="weight" placeholder="Vikt/Volym" value={form.weight} onChange={handleChange} required />
        <input name="packaging_date" placeholder="Packdatum (YYYY-MM-DD)" value={form.packaging_date} onChange={handleChange} required />
        <input name="list_price" placeholder="Pris" value={form.list_price} onChange={handleChange} required />
        <input name="animal_age" placeholder="Ålder (valfritt)" value={form.animal_age} onChange={handleChange} />
        <input name="stock" placeholder="Antal i lager" value={form.stock} onChange={handleChange} />
        <input name="category_id" placeholder="Kategori-ID" value={form.category_id} onChange={handleChange} required />
        <input name="image_url" placeholder="Bild-URL eller (t.ex. /images/biff.jpg)" value={form.image_url} onChange={handleChange} />
        <button type="submit">{editId ? "Uppdatera" : "Skapa"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: "", weight: "", packaging_date: "", list_price: "", animal_age: "", category_id: "", image_url: "" }); }}>Avbryt</button>}
      </form>
      {error && <p className="status-msg error">{error}</p>}
      {success && <p className="status-msg success">{success}</p>}  
      <table>
        <thead>
          <tr><th>Namn</th><th>Vikt/Volym</th><th>Pris</th><th>Packdatum</th><th>Ålder</th><th>Kategori</th><th>Antal i lager</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.weight}</td>
              <td>{p.list_price}</td>
              <td>{p.packaging_date}</td>
              <td>{p.animal_age}</td>
              <td>{p.category_id}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Redigera</button>
                <button onClick={() => handleDelete(p.id)}>Ta bort</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function AdminUsers({ token }) {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = () => {
    axios.get(`${import.meta.env.VITE_SERVER_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleAdmin = (user) => {
    setError(""); setSuccess("");
    axios.put(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.User_id}`, 
      { Admin: !user.Admin },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setSuccess(`${user.first_name} ${user.last_name} är nu ${!user.Admin ? 'admin' : 'vanlig användare'}`);
        fetchUsers();
      })
      .catch(err => setError(err.response?.data?.msg || "Fel vid uppdatering"));
  };

  const handleDelete = (user) => {
    if (!window.confirm(`Är du säker på att du vill ta bort ${user.first_name} ${user.last_name}?`)) return;
    setError(""); setSuccess("");
    axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.User_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setSuccess("Användare borttagen!");
        fetchUsers();
      })
      .catch(err => setError(err.response?.data?.msg || "Fel vid borttagning"));
  };

  const handleEditSave = () => {
    if (!editUser) return;
    setError(""); setSuccess("");
    axios.put(`${import.meta.env.VITE_SERVER_URL}/api/users/${editUser.User_id}`, editUser, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setSuccess("Användare uppdaterad!");
        setEditUser(null);
        fetchUsers();
      })
      .catch(err => setError(err.response?.data?.msg || "Fel vid uppdatering"));
  };

  return (
    <section className="admin-users">
      <h2>Admin: Hantera användare</h2>
      {error && <p className="status-msg error">{error}</p>}
      {success && <p className="status-msg success">{success}</p>}
      
      <p className="user-count">Totalt {users.length} användare</p>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Namn</th>
            <th>E-post</th>
            <th>Telefon</th>
            <th>Admin</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.User_id}>
              <td>{user.User_id}</td>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.email}</td>
              <td>{user.phone || "-"}</td>
              <td>
                <span className={`admin-badge ${user.Admin ? 'is-admin' : ''}`}>
                  {user.Admin ? 'Ja' : 'Nej'}
                </span>
              </td>
              <td>
                <button onClick={() => setEditUser({...user})}>Redigera</button>
                <button onClick={() => handleToggleAdmin(user)}>
                  {user.Admin ? 'Ta bort admin' : 'Gör admin'}
                </button>
                <button onClick={() => handleDelete(user)}>Ta bort</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUser && (
        <div className="order-modal-overlay" onClick={() => setEditUser(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Redigera användare</h3>
              <button className="close-btn" onClick={() => setEditUser(null)}>×</button>
            </div>
            <div className="order-modal-content">
              <div className="user-edit-form">
                <label>
                  Förnamn:
                  <input 
                    value={editUser.first_name || ''} 
                    onChange={e => setEditUser({...editUser, first_name: e.target.value})}
                  />
                </label>
                <label>
                  Efternamn:
                  <input 
                    value={editUser.last_name || ''} 
                    onChange={e => setEditUser({...editUser, last_name: e.target.value})}
                  />
                </label>
                <label>
                  E-post:
                  <input 
                    value={editUser.email || ''} 
                    onChange={e => setEditUser({...editUser, email: e.target.value})}
                  />
                </label>
                <label>
                  Telefon:
                  <input 
                    value={editUser.phone || ''} 
                    onChange={e => setEditUser({...editUser, phone: e.target.value})}
                  />
                </label>
                <label className="admin-checkbox">
                  <input 
                    type="checkbox"
                    checked={editUser.Admin || false}
                    onChange={e => setEditUser({...editUser, Admin: e.target.checked})}
                  />
                  Admin
                </label>
                <div className="modal-buttons">
                  <button onClick={handleEditSave}>Spara</button>
                  <button onClick={() => setEditUser(null)}>Avbryt</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Admin({ token }) {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="admin-panel">
      <h1>Adminpanel</h1>
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab("products")}
          className={activeTab === "products" ? "active" : ""}
        >
          Produkter
        </button>
        <button 
          onClick={() => setActiveTab("orders")}
          className={activeTab === "orders" ? "active" : ""}
        >
          Ordrar
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={activeTab === "users" ? "active" : ""}
        >
          Användare
        </button>
      </div>
      
      {activeTab === "products" && <AdminProducts token={token} />}
      {activeTab === "orders" && <AdminOrders token={token} />}
      {activeTab === "users" && <AdminUsers token={token} />}
    </div>
  );
}

export default Admin;