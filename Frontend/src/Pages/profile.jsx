// Remixed from Faruq Abdulsalam
// https://dev.to/nagatodev/how-to-add-login-authentication-to-a-flask-and-react-application-23i7

import { useState, useEffect } from 'react'
import axios from "axios";

function Profile(props) {

  const [profileData, setProfileData] = useState(null);
  useEffect(() => {
    if (!props.token || props.token === "undefined" || props.token === null) {
      console.warn("[DEBUG] Ingen giltig token, anropar ej API.");
      setProfileData(null);
      return;
    }
    axios({
      method: "GET",
      url: "http://95.155.245.165:5000/api/profile",
      headers: {
        Authorization: 'Bearer ' + props.token,
        Accept: 'application/json',
      }
    })
      .then((response) => {
        setProfileData(response.data);
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

  return (
    <div className="Profile">
      <h2>Profil</h2>
      <p style={{fontSize: 'small', color: '#888', display: 'none'}}>Token: {props.token ? props.token : <b>Ingen token</b>}</p>
      {profileData ? (
        <div>
          <p>Namn: {profileData.first_name} {profileData.last_name}</p>
          <p>Telefon: {profileData.phone}</p>
          <p>Email: {profileData.email}</p>
        </div>
      ) : (
        <p>Kunde inte hämta profildata.</p>
      )}
    </div>
  );
}

export default Profile;