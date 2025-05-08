import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ImageSlider from "./ImageSlider";
import { useNavigate } from "react-router-dom";

const VenueDetail = () => {
  const { id } = useParams();
  const [venueData, setVenueData] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const navigate = useNavigate();
  const containerStyle = {
    width: "800px",
    height: "400px",
    margin: "0 auto",
  };

  useEffect(() => {
    if (id) {
      fetch(`https://mezbaan-db.vercel.app/venues/${id}`)
        .then((response) => response.json())
        .then((data) => setVenueData(data))
        .catch((error) => console.error("Error fetching venue data:", error));

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
              const venueBookings = data.bookings.filter(
                (booking) =>
                  booking.type === "venue" &&
                  booking.serviceId.toString() === id
              );
              if (venueBookings.length > 0) {
                const latestBooking = venueBookings.sort(
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
    navigate("/bookvenue", { state: { existingData: venueData.data } });
  };

  const handleEditBooking = () => {
    navigate("/bookvenue", {
      state: { bookingId: bookingStatus.bookingId, type: "venue" },
    });
  };

  if (!id)
    return <div className="text-center text-danger mt-4">Invalid ID</div>;
  if (!venueData)
    return (
      <div className="bookings-spinner-container">
        <div className="bookings-spinner"></div>
      </div>
    );

  const {
    name,
    description,
    priceNight,
    priceDay,
    address,
    capacity,
    venueType,
    managerName,
    managerNumber,
    ratings,
  } = venueData.data;

  const { otherImages } = venueData.data;

  return (
    <div className="ven-div bg-check ofy">
      <div className="container-fluid p-5">
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
          Venue Details
        </h1>

        <div className="mb-4 text-center">
          {(bookingStatus?.status === "FULFILLED" ||
            bookingStatus?.status === "REVIEWED" ||
            bookingStatus?.status === "CANCELLED") && (
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
            backgroundColor: "#FAF3E0",
            border: "1px solid #FFC107",
            borderRadius: "15px",
          }}
        >
          <div className="row">
            <div className="col-md-6">
              <h3 className="text-danger">{name || "No Name Provided"}</h3>
              <p>
                <strong>Description:</strong> {description || "No Description"}
              </p>
              <p>
                <strong>Type:</strong> {venueType || "Not Specified"}
              </p>
              <p>
                <strong>Address:</strong> {address || "No Address Provided"}
              </p>
              <p>
                <strong>Manager:</strong> {managerName || "Not Provided"} (
                {managerNumber || "No Contact"})
              </p>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-4">
            <div
              className="p-3 text-center"
              style={{
                backgroundColor: "#FFB6C1",
                textShadow:
                  "-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black",
                color: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <h5>Price (Day)</h5>
              <p>${priceDay || "N/A"}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="p-3 text-center"
              style={{
                backgroundColor: "#87CEEB",
                textShadow:
                  "-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black",
                color: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <h5>Price (Night)</h5>
              <p>${priceNight || "N/A"}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="p-3 text-center"
              style={{
                backgroundColor: "#FFA07A",
                color: "#fff",
                textShadow:
                  "-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <h5>Capacity</h5>
              <p>{capacity || "N/A"} guests</p>
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

export default VenueDetail;
