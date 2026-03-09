import { useState, useEffect } from "react"; 
import "/src/App.css";
import Annah from "../assets/Annah.jpg";
import Lars from "../assets/Lars.jpg";
import Kalv from "../assets/Kalv.jpg";
import Katt from "../assets/Katt.jpg";
import KoKalv from "../assets/Ko&Kalv.jpg";
import Lägd from "../assets/Lägd.jpg";
import Lönås from "../assets/Lönås.jpg";
import Norrsken from "../assets/Norrsken.jpg";
import Vinter from "../assets/Vinter.jpg";


function About() {
  const [slideIndex, setSlideIndex] = useState(1);
  const slides = [
     { id: 1, src: Katt, caption: "Bonnkatta" },
     { id: 2, src: Kalv, caption: "Kalv på utebete" },
     { id: 3, src: Vinter, caption: "Lönåsgårdens vinter vy" },
     { id: 4, src: Lönås, caption: "Välkommen till Lönås" },
     { id: 5, src: Norrsken, caption: "Norrsken i Lönås" },
     { id: 6, src: Lägd, caption: "Slå & Bala" },
     { id: 7, src: KoKalv, caption: "Ko & Kalv" },
    ];

  const nextSlide = () => {
    if (slideIndex !== slides.length) {
      setSlideIndex(slideIndex + 1);
    } else {
      setSlideIndex(1); 
    }
  };

  const prevSlide = () => {
    if (slideIndex !== 1) {
      setSlideIndex(slideIndex - 1);
    } else {
      setSlideIndex(slides.length);
    }
  };

  const farmLocation = { lat: 65.41998754893707, lng: 18.51282530239959 };

  useEffect(() => {
    const initMap = () => {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: farmLocation, 
        zoom: 12,
      });

      new window.google.maps.Marker({
          position: farmLocation,
          map: map,
          title: "Lönåsgården",
      });
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API}&callback=initMap`;
        script.async = true;
        script.defer = true;
        window.initMap = initMap; 
        document.body.appendChild(script);
      } else {
        window.initMap = initMap;
      }
    }
  }, []); 

  return (
  <div className="about-page-wrapper">
    <div className="about-intro">
      <h2>Om Lönåsgården</h2>
      <p>
        Lönåsgården, eller tidigare Stenbacka Gård. Är ett lantbruk med
        mjölkproduktionssyfte. Gården befinner sig i byn Lönås utanför Adak
        i Malå kommun, Västerbotten. Gården har 200 djur därav 115
        mjölkkor, 54 kvigor, 30 kalvar och 1 tjur. Företaget ägs och drivs
        av Lars Tjärnlund och Annah Stenberg Tjärnlund, samt ett fåtal
        anställda. Lars föräldrar driver i närheten campingen{" "}
        <a href="https://laggtrasket.se">Laggträsket</a>.
      </p>
    </div>

    <div className="about-main-content">
        <div className="image-aside-wrapper">
            <div className="slideshow-container">
                {slides.map((slide, index) => {
                const isActive = slideIndex === index + 1;
                return (
                    <div
                    key={slide.id}
                    className={`mySlides fade ${isActive ? "active-slide" : ""}`}
                    style={{ display: isActive ? "block" : "none" }}
                       >
                    <div className="numbertext">{index + 1} / {slides.length}</div>
                    <img src={slide.src} alt={slide.caption} />
                     <div className="text">{slide.caption}</div>
                     </div>
                 );
                    })}
                 <a className="prev" onClick={prevSlide}>&#10094;</a>
                   <a className="next" onClick={nextSlide}>&#10095;</a>
            </div>
             <div className="dots-container">
               {slides.map((_, index) => (
                 <span
                key={index}
                 className={`dot ${slideIndex === index + 1 ? "active" : ""}`}
                 onClick={() => setSlideIndex(index + 1)}
                 ></span>
             ))}
             </div>
         </div>
         <aside className="people-sidebar">
             <h3>Medarbetare</h3>
             <div className="person-card">
             <img src={Lars} alt="Lars Tjärnlund" />
             <h4>Lars Tjärnlund</h4>
             <p>Ägare</p>
             </div>
             <div className="person-card">
              <img src={Annah} alt="Annah Stenberg" />
             <h4>Annah Stenberg Tjärnlund</h4>
             <p>Delägare</p>
             </div>
         </aside>
        </div>
    <div className="container mt-3 mb-3">
      <div
        className="rounded"
        id="map"
        style={{ width: "100%", height: "550px", marginBottom: "50px"}}
      />
    </div>
  </div>
  );
}

export default About;