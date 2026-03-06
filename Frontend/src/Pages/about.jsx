import { useState } from "react";
import "/src/App.css";
import cow1 from "../assets/cow1.jpg";
import cow2 from "../assets/cow2.jpg";
import cow3 from "../assets/cow3.jpg";
import person1 from "../assets/person1.jpg";
import person2 from "../assets/person2.jpg";

function About() {
  const [slideIndex, setSlideIndex] = useState(1);
  const slides = [
     { id: 1, src: cow1, caption: "Våra kor på bete" },
     { id: 2, src: cow2, caption: "Morgonmjölkning" },
     { id: 3, src: cow3, caption: "Lönåsgårdens vyer" },
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
             <img src={person2} alt="Lars Tjärnlund" />
             <h4>Lars Tjärnlund</h4>
             <p>Ägare</p>
             </div>
             <div className="person-card">
              <img src={person1} alt="Annah Stenberg" />
             <h4>Annah Stenberg</h4>
             <p>Delägare</p>
             </div>
         </aside>
         
        </div>
    </div>
  
);
}

export default About;