// Remixed from Faruq Abdulsalam
// https://dev.to/nagatodev/how-to-add-login-authentication-to-a-flask-and-react-application-23i7

import { useState, useEffect } from 'react'
import axios from "axios";

const ORDER_STATUS = {
  1: "Mottagen",
  2: "Under behandling",
  3: "Redo för upphämtning",
  4: "Levererad",
  5: "Avbruten"
};

function Profile(props) {

  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '', email: '' });
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  
  useEffect(() => {
    if (!props.token || props.token === "undefined" || props.token === null) {
      console.warn("[DEBUG] Ingen giltig token, anropar ej API.");
      setProfileData(null);
      return;
    }
    axios({
      method: "GET",
      url: (`${import.meta.env.VITE_SERVER_URL}/api/profile`),
      headers: {
        Authorization: 'Bearer ' + props.token,
        Accept: 'application/json',
      }
    })
      .then((response) => {
        setProfileData(response.data);
        setEditForm({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone: response.data.phone || '',
          email: response.data.email || ''
        });
      })
      .catch((error) => {
        setProfileData(null);
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }, [props.token]);

  useEffect(() => {
    if (!props.token || props.token === "undefined" || props.token === null) {
      return;
    }
    setLoadingOrders(true);
    axios({
      method: "GET",
      url: (`${import.meta.env.VITE_SERVER_URL}/api/my-orders`),
      headers: {
        Authorization: 'Bearer ' + props.token,
        Accept: 'application/json',
      }
    })
      .then((response) => {
        setOrders(response.data);
        setLoadingOrders(false);
      })
      .catch((error) => {
        setOrders([]);
        setLoadingOrders(false);
        console.log("Kunde inte hämta ordrar:", error);
      });
  }, [props.token]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    setSaveError('');
    setSaveSuccess('');
    axios({
      method: "PUT",
      url: (`${import.meta.env.VITE_SERVER_URL}/api/profile`),
      headers: {
        Authorization: 'Bearer ' + props.token,
        'Content-Type': 'application/json',
      },
      data: editForm
    })
      .then((response) => {
        setProfileData({
          ...profileData,
          ...response.data.user
        });
        setSaveSuccess('Profilen har uppdaterats!');
        setIsEditing(false);
      })
      .catch((error) => {
        setSaveError(error.response?.data?.msg || 'Kunde inte spara ändringar');
      });
  };

  const handleCancelEdit = () => {
    setEditForm({
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      phone: profileData.phone || '',
      email: profileData.email || ''
    });
    setIsEditing(false);
    setSaveError('');
    setSaveSuccess('');
  };

  return (
    <div className="Profile">
      <h2>Profil</h2>
      <p style={{fontSize: 'small', color: '#888', display: 'none'}}>Token: {props.token ? props.token : <b>Ingen token</b>}</p>
      
      {saveSuccess && <p className="status-msg success">{saveSuccess}</p>}
      {saveError && <p className="status-msg error">{saveError}</p>}
      
      {profileData ? (
        <div className="profile-info">
          {isEditing ? (
            <div className="profile-edit-form">
              <label>
                Förnamn:
                <input 
                  name="first_name" 
                  value={editForm.first_name} 
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Efternamn:
                <input 
                  name="last_name" 
                  value={editForm.last_name} 
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Telefon:
                <input 
                  name="phone" 
                  value={editForm.phone} 
                  onChange={handleEditChange}
                />
              </label>
              <label>
                E-post:
                <input 
                  name="email" 
                  type="email"
                  value={editForm.email} 
                  onChange={handleEditChange}
                />
              </label>
              <div className="profile-edit-buttons">
                <button onClick={handleSaveProfile}>Spara</button>
                <button onClick={handleCancelEdit}>Avbryt</button>
              </div>
            </div>
          ) : (
            <>
              <p><strong>Namn:</strong> {profileData.first_name} {profileData.last_name}</p>
              <p><strong>Telefon:</strong> {profileData.phone}</p>
              <p><strong>Email:</strong> {profileData.email}</p>
              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                Redigera profil
              </button>
            </>
          )}
        </div>
      ) : (
        <p>Kunde inte hämta profildata.</p>
      )}

      <div className="profile-orders">
        <h3>Mina beställningar</h3>
        {loadingOrders ? (
          <p>Laddar ordrar...</p>
        ) : orders.length === 0 ? (
          <p className="no-orders-msg">Du har inga beställningar ännu.</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.order_id} className="order-card" onClick={() => setSelectedOrder(order)}>
                <div className="order-card-header">
                  <span className="order-card-id">Order #{order.order_id}</span>
                  <span className={`status-badge status-${order.order_status}`}>
                    {ORDER_STATUS[order.order_status]}
                  </span>
                </div>
                <div className="order-card-body">
                  <p><strong>Datum:</strong> {order.order_date}</p>
                  <p><strong>Hämtdatum:</strong> {order.pickup_date || "-"}</p>
                  <p><strong>Summa:</strong> {order.total?.toFixed(2)} kr</p>
                </div>
                <div className="order-card-footer">
                  <span>{order.items?.length || 0} produkt(er)</span>
                  <span className="view-details">Visa detaljer →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}

export default Profile;