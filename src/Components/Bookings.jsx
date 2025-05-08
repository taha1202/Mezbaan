import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const Bookings = ({ setSuccessfulLogin }) => {
  const [bookingsData, setBookingsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState({});
  const [deleting, setDeleting] = useState(new Set());
  const navigate = useNavigate();
  const bookingsPerPage = 4;
  
  useEffect(() => {
    const fetchBookings = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setError("No token found in session storage");
        setLoading(false);
        return;
      }

      const url = "https://mezbaan-db.vercel.app/appUser/bookings";

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const categorizedBookings = data.bookings.reduce((acc, booking) => {
            const type = booking.type;
            if (!acc[type]) {
              acc[type] = [];
            }
            acc[type].push(booking);
            return acc;
          }, {});
          setBookingsData(categorizedBookings);

          const initialPages = Object.keys(categorizedBookings).reduce(
            (acc, type) => {
              acc[type] = 1;
              return acc;
            },
            {}
          );
          setPages(initialPages);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch bookings");
        }
      } catch (err) {
        setError("Error fetching bookings: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleNextPage = (type) => {
    setPages((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const handlePrevPage = (type) => {
    setPages((prev) => ({
      ...prev,
      [type]: prev[type] - 1,
    }));
  };

  const onDeleteClick = async (bookingId, type,status) => {
    if (status === "REQUESTED"){
    setDeleting((prev) => new Set(prev).add(bookingId));

    let url;
    console.log(type);
    switch (type) {
      case "venue":
        url = `https://mezbaan-db.vercel.app/bookings/venue/${bookingId}`;
        break;
      case "photography":
        url = `https://mezbaan-db.vercel.app/bookings/photography/${bookingId}`;
        break;
      case "cateringService":
        url = `https://mezbaan-db.vercel.app/bookings/cateringService/${bookingId}`;
        break;
      case "decorationService":
        url = `https://mezbaan-db.vercel.app/bookings/decorationService/${bookingId}`;
        break;
      case "otherService":
        url = `https://mezbaan-db.vercel.app/bookings/otherService/${bookingId}`;
        break;
      default:
        throw new Error("Invalid category");
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("Error: No authentication token found. Please log in again.");
      setDeleting((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
      return;
    }

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setBookingsData((prevData) => {
          const updatedCategoryBookings = prevData[type].filter(
            (booking) => booking.bookingId !== bookingId
          );
          const updatedData = { ...prevData, [type]: updatedCategoryBookings };

          if (updatedCategoryBookings.length === 0) {
            delete updatedData[type];
          }

          setPages((prevPages) => {
            const currentPage = prevPages[type] || 1;
            const totalItems = prevData[type]?.length - 1;
            const totalPages = Math.ceil(totalItems / bookingsPerPage);

            if (totalItems > 0 && currentPage > totalPages) {
              return { ...prevPages, [type]: currentPage - 1 };
            }

            return prevPages;
          });

          return updatedData;
        });

        alert("Booking deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(
          `Failed to delete booking: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Error deleting booking. Please try again.");
    } finally {
      setDeleting((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  }
  else{
    alert("Only Reviewed or Requested Bookings can be deleted");
  }
  };

  const onCardClick = (bookingId, status, type) => {

    navigate(`/bookingdetails/${bookingId}`,{ state: { status, type } });

  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-approved";
      case "REQUESTED":
        return "status-requested";
      case "CANCELLED":
        return "status-cancelled";
      case "FULFILLED":
        return "status-fulfilled";
      case "REVIEWED":
        return "status-reviewed";
      default:
        return "";
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="header-div">
        <Header setSuccessfulLogin={setSuccessfulLogin}></Header>
      </div>
      {loading ? (
        <div className="bookings-spinner-container">
          <div className="bookings-spinner"></div>
        </div>
      ) : Object.keys(bookingsData).length === 0 ? (
        <div className="bookings-container">
          <h1 className="bookings-heading">No Bookings Found</h1>
        </div>
      ) : (
        <div className="bookings-container">
          <h1 className="bookings-heading">My Bookings</h1>
          {Object.entries(bookingsData).map(([type, bookings]) => {
            const totalPages = Math.ceil(bookings.length / bookingsPerPage);
            const currentPage = pages[type] || 1;
            const startIndex = (currentPage - 1) * bookingsPerPage;
            const paginatedBookings = bookings.slice(
              startIndex,
              startIndex + bookingsPerPage
            );

            return (
              <div key={type} className="bookings-category">
                <h2 className="bookings-category-heading">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="bookings-grid">
                  {paginatedBookings.map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="booking-card-wrapper"
                    >
                      <div
                        className={`booking-card ${getStatusClass(
                          booking.status
                        )}`}
                        onClick={() =>
                          onCardClick(booking.bookingId, booking.status, type)
                        }
                      >
                        <img
                          src={booking.cover}
                          alt={booking.serviceName}
                          className="booking-card-image"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/150")
                          }
                        />
                        <div className="booking-card-content">
                          <h3 className="booking-card-title">
                            {booking.serviceName}
                          </h3>
                          <p className="booking-card-detail">
                            <strong>Date:</strong> {formatDate(booking.date)}
                          </p>
                          <p className="booking-card-detail">
                            <strong>Type:</strong>{" "}
                            {booking.type.charAt(0).toUpperCase() +
                              booking.type.slice(1)}
                          </p>
                          <p className="booking-card-detail">
                            <strong>Bill:</strong> Rs{" "}
                            {Number(booking.bill).toLocaleString()}
                          </p>
                          <p className="booking-card-detail">
                            <strong>Status:</strong>{" "}
                            <span
                              className={`booking-status ${getStatusClass(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        className="booking-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(booking.bookingId, type,booking.status);
                        }}
                        disabled={deleting.has(booking.bookingId)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {bookings.length > bookingsPerPage && (
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePrevPage(type)}
                      disabled={currentPage === 1}
                      style={{
                        display: currentPage === 1 ? "none" : "inline-block",
                      }}
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="pagination-btn"
                      onClick={() => handleNextPage(type)}
                      disabled={currentPage === totalPages}
                      style={{
                        display:
                          currentPage === totalPages ? "none" : "inline-block",
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Bookings;
