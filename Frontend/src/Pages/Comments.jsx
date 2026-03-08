import { useState, useEffect } from "react";
import axios from "axios";

function StarRating({ grade, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || grade) ? "filled" : ""}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function Comments({ productId, productName, token }) {
  const [comments, setComments] = useState([]);
  const [editText, setEditText] = useState("");
  const [editGrade, setEditGrade] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get(`${import.meta.env.VITE_SERVER_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => setCurrentUserId(res.data.User_id))
        .catch(() => setCurrentUserId(null));
    } else {
      setCurrentUserId(null);
    }
  }, [token]);

  useEffect(() => {
    if (!productName) return;
    
    setLoading(true);
    axios.get(`${import.meta.env.VITE_SERVER_URL}/api/products/name/${productName}/comments`)
      .then((res) => {
        setComments(res.data);
        setError("");
      })
      .catch((err) => {
        setError("Kunde inte hämta kommentarer");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [productName]); 

  const myComment = currentUserId 
    ? comments.find(c => Number(c.user_id) === Number(currentUserId))
    : null;

  const averageGrade = () => {
    const graded = comments.filter((c) => c.grade);
    if (graded.length === 0) return null;
    const sum = graded.reduce((acc, c) => acc + c.grade, 0);
    return (sum / graded.length).toFixed(1);
  };

  const startEditing = () => {
    if (myComment) {
      setEditText(myComment.text);
      setEditGrade(myComment.grade || 0);
    } else {
      setEditText("");
      setEditGrade(0);
    }
    setIsEditing(true);
    setShowMenu(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditText("");
    setEditGrade(0);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editText.trim()) {
      setError("Kommentaren kan inte vara tom");
      return;
    }
    
    axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/products/${productId}/comments`,
      { text: editText, grade: editGrade > 0 ? editGrade : null },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        return axios.get(`${import.meta.env.VITE_SERVER_URL}/api/products/name/${productName}/comments`);
      })
      .then((res) => {
        setComments(res.data);
        setIsEditing(false);
        setEditText("");
        setEditGrade(0);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.msg || "Kunde inte spara kommentar");
      });
  };

  const handleDelete = () => {
    if (!window.confirm("Vill du verkligen ta bort din recension?")) return;
    if (!myComment) return;
    
    axios.delete(
      `${import.meta.env.VITE_SERVER_URL}/api/comments/${myComment.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        return axios.get(`${import.meta.env.VITE_SERVER_URL}/api/products/name/${productName}/comments`);
      })
      .then((res) => {
        setComments(res.data);
        setShowMenu(false);
      })
      .catch((err) => {
        setError(err.response?.data?.msg || "Kunde inte ta bort kommentar");
      });
  };
  
  const avg = averageGrade();
  
  if (loading) return <div className="comments-loading">Laddar kommentarer...</div>;
  
  return (
    <div className="comments-section">
      <h3>Recensioner</h3>
      
      {avg && (
        <div className="average-rating">
          <span>Snittbetyg: {avg}</span>
          <StarRating grade={Math.round(avg)} readOnly />
          <span className="review-count">({comments.filter(c => c.grade).length} st)</span>
        </div>
      )}
      
      {error && <p className="comments-error">{error}</p>}
      {token && currentUserId && !myComment && !isEditing && (
        <form className="new-comment-form" onSubmit={handleSave}>
          <h4>Skriv en recension</h4>
          <div className="grade-input">
            <label>Betyg:</label>
            <StarRating grade={editGrade} onChange={setEditGrade} />
          </div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Skriv en kommentar..."
            rows={3}
          />
          <button type="submit">Skicka</button>
        </form>
      )}
      
      {!token && (
        <p className="login-prompt">Logga in för att skriva en recension.</p>
      )}
      
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">Inga recensioner ännu.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              {isEditing && Number(comment.user_id) === Number(currentUserId) ? (
                <form className="edit-comment-form" onSubmit={handleSave}>
                  <div className="grade-input">
                    <label>Betyg:</label>
                    <StarRating grade={editGrade} onChange={setEditGrade} />
                  </div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Skriv en kommentar..."
                    rows={3}
                  />
                  <div className="form-buttons">
                    <button type="submit">Spara</button>
                    <button type="button" className="cancel-btn" onClick={cancelEditing}>Avbryt</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="comment-header">
                    <span className="comment-user">{comment.user_name}</span>
                    {Number(comment.user_id) === Number(currentUserId) && (
                      <div className="comment-menu-wrapper">
                        <button 
                          className="comment-menu-btn" 
                          onClick={() => setShowMenu(!showMenu)}
                        >
                          ⋮
                        </button>
                        {showMenu && (
                          <div className="comment-menu">
                            <button onClick={startEditing}>Redigera</button>
                            <button onClick={handleDelete}>Ta bort</button>
                          </div>
                        )}
                      </div>
                    )}
                    <span className="comment-date">{new Date(comment.created_at).toLocaleDateString("sv-SE")}</span>
                    {comment.grade && <StarRating grade={comment.grade} readOnly />}
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Comments;