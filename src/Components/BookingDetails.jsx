import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const BookingDetail = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { type } = state || {};
  const [bookingData, setBookingData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  let serviceID;

  useEffect(() => {
    if (id) {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        console.error("No token found, please login first.");
        return;
      }
      console.log(id);
      fetch(`https://mezbaan-db.vercel.app/bookings/${type}/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Unauthorized");
          }
          return response.json();
        })
        .then((data) => setBookingData(data))
        .catch((error) => console.error("Error fetching booking data:", error));
    }
  }, [id, type, refreshKey]);
  
  const handleEditBooking = () => {
    const routeMap = {
      cateringService: "/bookcatering",
      venue: "/bookvenue",
      decorationService: "/bookdecoration",
      photography: "/bookphotographer",
      otherService: "/bookother",
    };
    navigate(routeMap[type], { state: { bookingId: id, type } });
  };

  const handleDeleteBooking = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmation) return;

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      console.error("No token found, please login first.");
      return;
    }

    try {
      const response = await fetch(
        `https://mezbaan-db.vercel.app/bookings/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }
      alert("Booking deleted successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    }
  };

  const handleRateUs = () => {
    setShowRatingModal(true);
  };

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("No token found in session storage");
      setIsSubmitting(false);
      setShowRatingModal(false);
      return;
    }
    let ratingType;
    console.log(bookingData)
    switch (type) {
      case "venue":
        ratingType = "VENUE";
        serviceID = booking.venue.id
        break;
      case "photography":
        ratingType = "PHOTOGRAPHER";
        serviceID = bookingData?.photography?.id
        break;
      case "cateringService":
        ratingType = "CATERINGSERVICE";
        break;
      case "decorationService":
        ratingType = "DECORATIONSERVICE";
        break;
      case "otherService":
        ratingType = "OTHERSERVICE";
        break;
      default:
        alert("Invalid Service Type");
        return;
    }
    
    const requestBody = {
      bookingId: Number(id),
      serviceId: serviceID,
      serviceType: ratingType,
      rating: rating,
      comments: comments,
    };
    console.log("req = ", requestBody)
    try {
      const response = await fetch("https://mezbaan-db.vercel.app/ratings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert("Rating submitted successfully!");
        setShowRatingModal(false);
        setRating(0);
        setComments("");
        setRefreshKey((prevKey) => prevKey + 1);
      } else {
        const errorData = await response.json();
        alert(
          `Failed to submit rating: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      alert("Error submitting rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id)
    return <div className="text-center text-danger mt-4">Invalid ID</div>;
  if (!bookingData)
    return (
      <div className="bookings-spinner-container">
        <div className="bookings-spinner"></div>
      </div>
    );

  const { booking, customer } = bookingData;
  console.log(bookingData);
  const service =
    bookingData.cateringService ||
    bookingData.venue ||
    bookingData.decorationService ||
    bookingData.photography ||
    bookingData.otherService;
  const serviceSpecificData =
    bookingData.cateringBooking ||
    bookingData.venueBooking ||
    bookingData.decorationBooking ||
    bookingData.photographyBooking ||
    bookingData.otherBooking;
  const bookedMenuItems = bookingData.bookedMenuItems || [];
  const bookedPackages = bookingData.bookedPackages || [];
  const bookedAmenities = bookingData.bookedAmenities || [];
  const veueGuestcount = bookingData.booking.guestCount || [];
  const serviceCount = bookingData?.otherServiceBooking?.serviceCount || [];
  const groupedMenuItems = bookedMenuItems.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <div className="ven-div bg-check ofy">
    <div
      className="container-fluid p-5"
    >
      <div
        className="card shadow-lg border-0"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #FFC0CB",
          borderRadius: "15px",
        }}
      >
        <div
          className="card-header text-center"
          style={{ backgroundColor: "#FF6F61", color: "#fff" }}
        >
          <h2
            style={{
              fontWeight: "bold",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
            }}
          >
            {service.name}
          </h2>
        </div>
        <div className="card-body">
          <h5 className="card-title text-danger mb-4">Booking Information</h5>
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Booking ID:</strong> {booking.id}
            </div>
            <div className="col-md-6">
              <strong>Date:</strong> {new Date(booking.date).toDateString()}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Start Time:</strong> {booking.startTime}
            </div>
            <div className="col-md-6">
              <strong>End Time:</strong> {booking.endTime || "N/A"}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Customer name:</strong> {customer.name}
            </div>
            <div className="col-md-6">
              <strong>Customer contact:</strong> {customer.phone || "N/A"}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Bill:</strong> {booking.bill} PKR
            </div>
            {(type === "cateringService") && (
              <div className="col-md-6">
                <strong>Guest Count:</strong> {serviceSpecificData.guestCount}
              </div>
            )}

            {(type === "otherService") && (
              <div className="col-md-6">
                <strong>Service Count:</strong> {serviceCount}
              </div>
            )}
            {(type === "venue") && (
              <div className="col-md-6">
                <strong>Guest Count:</strong> {veueGuestcount}
              </div>
            )}
          </div>
          <div className="row mb-3">
            {type !== "venue" && (
            <div className="col-md-6">
              <strong>Address:</strong> {booking.address}
            </div>
            )}
            <div className="col-md-6">
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${
                  booking.status === "APPROVED"
                    ? "bg-success"
                    : booking.status === "CANCELLED"
                    ? "bg-danger"
                    : booking.status === "FULFILLED"
                    ? "bg-info"
                    : booking.status === "REQUESTED"
                    ? "bg-warning"
                    : booking.status === "REVIEWED"
                    ? "bg-primary"
                    : "bg-secondary"
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
          
          <hr style={{ borderTop: "3px solid #d10e31" }} />

          {(type === "cateringService") && (
            <>
              <h5 className="card-title text-danger mb-4">Packages</h5>
              {bookedPackages.length > 0 ? (
                bookedPackages.map((pkg) => (
                  <div className="row mb-3" key={pkg.id}>
                    <div className="col-md-4">
                      <strong>Package Name:</strong> {pkg.name}
                    </div>
                    <div className="col-md-4">
                      <strong>Price:</strong> {pkg.price} PKR
                    </div>
                  </div>
                ))
              ) : (
                <p>No Packages booked.</p>
              )}
              <hr style={{ borderTop: "3px solid #d10e31" }} />
            </>
          )}

          {type === "cateringService" && (
            <>
              <h5 className="card-title text-danger mb-4">Menu Items</h5>
              {bookedMenuItems && bookedMenuItems.length > 0 ? (
                Object.entries(groupedMenuItems).map(([type, items]) => (
                  <div key={type}>
                    <h6 className="text-info">{type}</h6>
                    {items.map((item) => (
                      <div className="row mb-2" key={item.id}>
                        <div className="col-md-4">
                          <strong>Dish Name:</strong> {item.name}
                        </div>
                        <div className="col-md-4">
                          <strong>Cost:</strong> {item.cost} PKR
                        </div>
                      </div>
                    ))}
                    <hr style={{ borderTop: "3px solid #d10e31" }} />
                  </div>
                ))
              ) : (
                <p>No menu items available.</p>
              )}
            </>
          )}

          {type === "decorationService" && (
            <>
              <h5 className="card-title text-danger mb-4">Amenities</h5>
              {bookedAmenities.length > 0 ? (
                bookedAmenities.map((amenity) => (
                  <div className="row mb-3" key={amenity.id}>
                    <div className="col-md-4">
                      <strong>Amenity:</strong> {amenity.amenity}
                    </div>
                    <div className="col-md-4">
                      <strong>Cost:</strong> {amenity.cost} PKR
                    </div>
                  </div>
                ))
              ) : (
                <p>No amenities booked.</p>
              )}
            </>
          )}

          <div className="d-flex justify-content-center w-100 align-items-center">
            <div className="col-md-6 d-flex justify-content-center w-100 align-items-center">
              {booking.status === "REQUESTED" && (
                <>
                  <button
                    className="btn btn-warning me-2"
                    onClick={handleEditBooking}
                  >
                    Edit Booking
                  </button>
                  </>
                  )}
                  
                  {(booking.status === "REQUESTED") && (
                  <>
                  <button
                    className="btn btn-danger me-2"
                    onClick={handleDeleteBooking}
                  >
                    Delete Booking
                  </button>
                  </>
              )}
              {booking.status === "FULFILLED" && (
                <button className="btn btn-success" onClick={handleRateUs}>
                  Rate Us
                </button>
              )}
            </div>
          </div>

          {showRatingModal && (
            <div
              className="modal fade show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog" role="document">
                <div
                  className="modal-content"
                  style={{
                    backgroundColor: "#FFE4C4",
                    border: "1px solid #FF6F61",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    className="modal-header"
                    style={{ backgroundColor: "#FF6F61", color: "#fff" }}
                  >
                    <h5 className="modal-title">Rate Your Experience</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowRatingModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="text-center mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            fontSize: "2rem",
                            cursor: "pointer",
                            color: star <= rating ? "#FFD700" : "#D3D3D3",
                          }}
                          onClick={() => handleStarClick(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="form-group">
                      <label htmlFor="comments" className="text-danger">
                        Comments
                      </label>
                      <textarea
                        id="comments"
                        className="form-control"
                        rows="3"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Share your experience..."
                        style={{
                          backgroundColor: "#fff",
                          border: "1px solid #FF6F61",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="modal-footer"
                    style={{ backgroundColor: "#FFE4C4" }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowRatingModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmitRating}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className="card-footer text-center"
          style={{ backgroundColor: "#FFC0CB" }}
        >
          <button
            className="btn btn-primary me-2"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default BookingDetail;
