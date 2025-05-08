import { useEffect, useState } from "react";
import { FaInstagram, FaFacebook, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import ImageSlider from "./ImageSlider";
import { useNavigate, useParams } from "react-router-dom";

const PhotographyDetail = () => {
  const { id } = useParams();
  const [PhotographyData, setPhotographyData] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const navigate = useNavigate();
  const containerStyle = {
    width: "800px",
    height: "400px",
    margin: "0 auto",
  };

  useEffect(() => {
    if (id) {
      fetch(`https://mezbaan-db.vercel.app/photography/${id}`)
        .then((response) => response.json())
        .then((data) => setPhotographyData(data))
        .catch((error) =>
          console.error("Error fetching photographer data:", error)
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
              const photographyBookings = data.bookings.filter(
                (booking) =>
                  booking.type === "photography" &&
                  booking.serviceId.toString() === id
              );
              if (photographyBookings.length > 0) {
                const latestBooking = photographyBookings.sort(
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
    navigate("/bookphotographer", { state: { existingData: PhotographyData.data } });
  };

  const handleEditBooking = () => {
    navigate("/bookphotographer", {
      state: { bookingId: bookingStatus.bookingId, type: "photography" },
    });
  };

  if (!id) return <p>Invalid ID</p>;
  if (!PhotographyData) return (
    <div className="bookings-spinner-container">
      <div className="bookings-spinner"></div>
    </div>
  );

  const {
    name,
    description,
    cost,
    instaLink,
    facebookLink,
    email,
    contactNumber,
    ratings,
  } = PhotographyData.data;
  const { otherImages } = PhotographyData.data;

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
          textShadow: "1px 1px 5px rgba(0, 0, 0, 0.3)",
        }}
      >
        Photographer Details
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
          backgroundColor: "#FFF",
          border: "1px solid #FF5733",
          borderRadius: "15px",
        }}
      >
        <div className="row">
          <div className="col-md-6">
            <h3 className="text-primary">{name || "No Name Provided"}</h3>
            <p>
              <strong>Description:</strong> {description || "No Description"}
            </p>
            <p>
              <strong>Cost per Hour:</strong>{" "}
              <span className="text-success">{cost || "Not Provided"}</span>
            </p>
            <p>
              <FaPhoneAlt className="text-secondary" />{" "}
              <strong>Contact:</strong> {contactNumber || "No Contact"}
            </p>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-4">
          <div
            className="card shadow-sm p-3 text-center"
            style={{
              borderRadius: "10px",
              backgroundColor: "#FFDED5",
              color: "#E4405F",
            }}
          >
            <FaInstagram size={40} />
            <p className="mt-2">
              <strong>Instagram</strong>
            </p>
            <a
              href={instaLink.startsWith('http') ? instaLink : `https://${instaLink}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#E4405F" }}
            >
              {instaLink || "Not Provided"}
            </a>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card shadow-sm p-3 text-center"
            style={{
              borderRadius: "10px",
              backgroundColor: "#FFDED5",
              color: "#1877F2",
            }}
          >
            <FaFacebook size={40} />
            <p className="mt-2">
              <strong>Facebook</strong>
            </p>
            <a
              href={facebookLink.startsWith('https') ? facebookLink : `https://${facebookLink}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#1877F2" }}
            >
              {facebookLink || "Not Provided"}
            </a>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card shadow-sm p-3 text-center"
            style={{
              borderRadius: "10px",
              backgroundColor: "#FFDED5",
              color: "#EA4335",
            }}
          >
            <FaEnvelope size={40} />
            <p className="mt-2">
              <strong>Email</strong>
            </p>
            <a
              href={`mailto:${email}`}
              style={{ textDecoration: "none", color: "#EA4335" }}
            >
              {email || "Not Provided"}
            </a>
          </div>
        </div>
      </div>

      {ratings?.length > 0 && (
        <div
          className="card shadow-lg p-4 mb-4 mt-5"
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

export default PhotographyDetail;