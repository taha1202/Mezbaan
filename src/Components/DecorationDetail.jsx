import { useEffect, useState } from "react";
import ImageSlider from "./ImageSlider";
import { useNavigate, useParams } from "react-router-dom";

const DecorationDetail = () => {
  const { id } = useParams();
  const [decorationData, setDecorationData] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const navigate = useNavigate();
  const containerStyle = {
    width: "800px",
    height: "400px",
    margin: "0 auto",
  };

  useEffect(() => {
    if (id) {
      fetch(`https://mezbaan-db.vercel.app/decorationServices/${id}`)
        .then((response) => response.json())
        .then((data) => setDecorationData(data))
        .catch((error) =>
          console.error("Error fetching decoration data:", error)
        );

      const token = sessionStorage.getItem("authToken");
      if (token) {
        fetch(`https://mezbaan-db.vercel.app/appUser/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.bookings?.length > 0) {
              const decorationBookings = data.bookings.filter(
                (booking) =>
                  booking.type === "decorationService" &&
                  booking.serviceId.toString() === id
              );
              if (decorationBookings.length > 0) {
                const latestBooking = decorationBookings.sort(
                  (a, b) => new Date(b.date) - new Date(a.date)
                )[0];
                setBookingStatus({
                  status: latestBooking.status,
                  bookingId: latestBooking.bookingId,
                });
              }
            }
          })
          .catch((error) =>
            console.error("Error fetching booking status:", error)
          );
      }
    }
  }, [id]);

  const handleBooking = () => {
    navigate("/bookdecoration", {
      state: { existingData: decorationData.data },
    });
  };

  const handleEditBooking = () => {
    navigate("/bookdecoration", {
      state: { bookingId: bookingStatus.bookingId, type: "decorationService" },
    });
  };

  if (!id)
    return <div className="text-center text-danger mt-4">Invalid ID</div>;
  if (!decorationData)
    return (
      <div className="bookings-spinner-container">
        <div className="bookings-spinner"></div>
      </div>
    );

  const {
    name,
    managerName,
    managerNumber,
    amenities,
    otherImages,
    description,
    ratings,
  } = decorationData.data;

  return (
    <div className="ven-div bg-check ofy">
      <div
      className="container-fluid p-5"
    >
      {otherImages.length > 0 && (
        <div style={containerStyle}>
          <ImageSlider slides={otherImages}></ImageSlider>
        </div>
      )}

      <h1
        className="text-center mb-4"
        style={{
          fontWeight: "bold",
          color: "#FFFFFF",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
        }}
      >
        Decoration Details
      </h1>

      <div className="mb-4 text-center">
        {(bookingStatus?.status === "FULFILLED" || bookingStatus?.status === "REVIEWED" || bookingStatus?.status === "CANCELLED") && (
          <button onClick={handleBooking} className="btn btn-warning me-2">
            Book Service
          </button>
        )}
        {bookingStatus?.status === "REQUESTED" && (
          <button onClick={handleEditBooking} className="btn btn-warning me-2">
            Edit Booking
          </button>
        )}
        {bookingStatus?.status === "APPROVED" && (
            <div className="alert alert-info text-center" role="alert">
              {"Booking Approved!"}
            </div>
        )}
        {!bookingStatus && (
          <button onClick={handleBooking} className="btn btn-warning">
            Book Service
          </button>
        )}
      </div>

      <div
        className="card shadow-lg p-4 mb-4"
        style={{
          backgroundColor: "#fff3e0",
          border: "1px solid #ffcc80",
          borderRadius: "15px",
        }}
      >
        <div className="row">
          <div className="col-md-6">
            <h3 className="text-warning">{name || "No Name Provided"}</h3>
            <p>
              <strong>Description:</strong> {description || "No Description"}
            </p>
            <p>
              <strong>Manager:</strong> {managerName || "Not Assigned"}
            </p>
            <p>
              <strong>Contact:</strong> {managerNumber || "Not Available"}
            </p>
          </div>
        </div>
      </div>

      <div
        className="amenity-card shadow-lg p-4 mb-4"
        style={{
          backgroundColor: "#e3f2fd",
          border: "1px solid #90caf9",
          borderRadius: "15px",
        }}
      >
        <h2 className="text-primary tclr">Amenities</h2>
        {amenities?.length > 0 ? (
          <ul className="list-group">
            {amenities.map((amenity, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
                style={{
                  backgroundColor: "#e8f5e9",
                  borderRadius: "10px",
                  transition: "background-color 0.3s ease, transform 0.2s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#B76E79";
                  e.target.style.transform = "scale(1.02)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#e8f5e9";
                  e.target.style.transform = "scale(1)";
                }}
              >
                {amenity.amenity} - {amenity.cost || "Not Priced"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No amenities available.</p>
        )}
      </div>

      {ratings?.length > 0 && (
        <div
          className="card shadow-lg p-4 mb-4"
          style={{
            backgroundColor: "#f3e5f5",
            border: "1px solid #ce93d8",
            borderRadius: "15px",
          }}
        >
          <h2 className="text-purple text-center mb-3">Customer Reviews</h2>
          <div className="row d-flex justify-content-space-around align-items-center">
            {ratings.map((review, index) => (
              <div
                key={index}
                className="col-md-4 col-sm-6 mb-3"
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  className="p-2"
                  style={{
                    backgroundColor: "#fce4ec",
                    border: "1px solid #f48fb1",
                    borderRadius: "10px",
                    boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)",
                    maxWidth: "300px",
                    width: "100%",
                  }}
                >
                  <h5 className="text-center mb-1">{review.name}</h5>
                  <p className="text-center mb-2">
                    <strong>Rating:</strong> ⭐ {review.rating}
                  </p>
                  <p
                    className="text-center"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6a1b9a",
                    }}
                  >
                    {review.comments}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default DecorationDetail;