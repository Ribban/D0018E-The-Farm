import { useState } from 'react';
import axios from 'axios';

function Register({ onBackToLogin }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    axios({
      method: 'POST',
      url: 'http://95.155.245.165:5000/api/register',
      data: form
    })
      .then((res) => {
        setMessage('Registrering lyckades! Du kan nu logga in.');
        setForm({ first_name: '', last_name: '', phone: '', email: '', password: '' });
      })
      .catch((err) => {
        setMessage('Registrering misslyckades. Försök igen.');
      });
  }

  return (
    <div>
      <h1>Registrera användare</h1>
      <form onSubmit={handleSubmit}>
        <input name="first_name" placeholder="Förnamn" value={form.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="Efternamn" value={form.last_name} onChange={handleChange} required />
        <input name="phone" placeholder="Telefon" value={form.phone} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Lösenord" value={form.password} onChange={handleChange} required />
        <button type="submit">Registrera</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={onBackToLogin} style={{ marginTop: '1em' }}>Tillbaka till login</button>
    </div>
  );
}

export default Register;