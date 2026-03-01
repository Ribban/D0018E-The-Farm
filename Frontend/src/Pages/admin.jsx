import { useEffect, useState } from "react";
import axios from "axios";

function AdminProducts({ token }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", weight: "", packaging_date: "", list_price: "", animal_age: "", category_id: "" });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = () => {
    axios.get("http://95.155.245.165:5000/api/products")
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
      ? axios.put(`http://95.155.245.165:5000/api/products/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } })
      : axios.post("http://95.155.245.165:5000/api/products", form, { headers: { Authorization: `Bearer ${token}` } });
    req.then(() => {
      setSuccess(editId ? "Uppdaterad!" : "Skapad!");
      setForm({ name: "", weight: "", packaging_date: "", list_price: "", animal_age: "", category_id: "" });
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
      category_id: p.category_id
    });
  };

  const handleDelete = id => {
    if (!window.confirm("Ta bort produkten?")) return;
    axios.delete(`http://95.155.245.165:5000/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { setSuccess("Borttagen!"); fetchProducts(); })
      .catch(err => setError(err.response?.data?.msg || "Fel vid borttagning"));
  };

  return (
    <section className="admin-products">
      <h2>Admin: Hantera produkter</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Namn" value={form.name} onChange={handleChange} required />
        <input name="weight" placeholder="Vikt/Volym" value={form.weight} onChange={handleChange} required />
        <input name="packaging_date" placeholder="Packdatum (YYYYMMDD)" value={form.packaging_date} onChange={handleChange} required />
        <input name="list_price" placeholder="Pris" value={form.list_price} onChange={handleChange} required />
        <input name="animal_age" placeholder="Ålder (valfritt)" value={form.animal_age} onChange={handleChange} />
        <input name="category_id" placeholder="Kategori-ID" value={form.category_id} onChange={handleChange} required />
        <button type="submit">{editId ? "Uppdatera" : "Skapa"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: "", weight: "", packaging_date: "", list_price: "", animal_age: "", category_id: "" }); }}>Avbryt</button>}
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      {success && <p style={{color:'green'}}>{success}</p>}
      <table style={{marginTop:20}}>
        <thead>
          <tr><th>Namn</th><th>Vikt/Volym</th><th>Pris</th><th>Packdatum</th><th>Ålder</th><th>Kategori</th><th></th></tr>
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
              <td>
                <button onClick={() => handleEdit(p)}>Redigera</button>
                <button onClick={() => handleDelete(p.id)} style={{color:'red'}}>Ta bort</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default AdminProducts;
