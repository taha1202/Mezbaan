import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BookDecoration = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bookingId = state?.bookingId;
  const type = state?.type;
  const isEditMode = !!bookingId && type === "decorationService";

  const [serviceData, setServiceData] = useState(null);
  const [bookedAmenities, setBookedAmenities] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState("");
  const [bill, setBill] = useState(0);
  const [address, setAddress] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenityCounts, setAmenityCounts] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  const decorationServiceId = serviceData?.id;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setIsFetching(true);
      setError(null);

      if (!isEditMode) {
        const decorationData = state?.existingData;
        if (decorationData) {
          console.log("Booking Mode - Service Data:", decorationData);
          setServiceData(decorationData);
        } else {
          setError("No decoration data provided for booking");
        }
        setIsFetching(false);
        return;
      }

      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setError("No token found in session storage");
        setIsFetching(false);
        return;
      }

      try {
        console.log("Fetching booking details for bookingId:", bookingId);
        const bookingUrl = `https://mezbaan-db.vercel.app/bookings/decorationService/${bookingId}`;
        const bookingResponse = await fetch(bookingUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!bookingResponse.ok) {
          const errorData = await bookingResponse.json();
          throw new Error(errorData.message || "Failed to fetch booking details");
        }

        const bookingData = await bookingResponse.json();
        console.log("Booking Data:", bookingData);

        const booking = bookingData.booking;
        console.log("Booking:", booking);

        const bookedAmenitiesData = bookingData.bookedAmenities || [];
        console.log("Booked Amenities:", bookedAmenitiesData);
        setBookedAmenities(bookedAmenitiesData);

        setDate(booking.date.split("T")[0]);
        setStartTime(booking.startTime);
        setEndTime(booking.endTime);
        setAddress(booking.address || "");
        setBill(Number(booking.bill));

        const serviceId = bookingData.decorationBooking.decorationServiceId;
        console.log("Fetching service details for serviceId:", serviceId);
        const serviceUrl = `https://mezbaan-db.vercel.app/decorationServices/${serviceId}`;
        const serviceResponse = await fetch(serviceUrl);

        if (!serviceResponse.ok) {
          const errorData = await serviceResponse.json();
          throw new Error(errorData.message || "Failed to fetch decoration service details");
        }

        const serviceDataResponse = await serviceResponse.json();
        console.log("Service Data Response:", serviceDataResponse);
        const serviceData = serviceDataResponse.data;
        console.log("Service Data:", serviceData);
        setServiceData(serviceData);

        if (!serviceData?.amenities) {
          console.warn("No amenities found in service data");
        } else {
          console.log("All Amenities:", serviceData.amenities);
        }

        const initialSelectedAmenities = bookedAmenitiesData.map(
          (amenity) => amenity.decorationAmenityId
        );
        const initialAmenityCounts = bookedAmenitiesData.reduce((acc, amenity) => {
          acc[amenity.decorationAmenityId] = amenity.count;
          return acc;
        }, {});
        console.log("Initial Selected Amenities:", initialSelectedAmenities);
        console.log("Initial Amenity Counts:", initialAmenityCounts);
        setSelectedAmenities(initialSelectedAmenities);
        setAmenityCounts(initialAmenityCounts);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Error fetching details: " + err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, isEditMode, state]);

  const handleAmenityChange = (amenityId) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(amenityId)) {
        const updatedAmenities = prev.filter((id) => id !== amenityId);
        setAmenityCounts((prevCounts) => {
          const newCounts = { ...prevCounts };
          delete newCounts[amenityId];
          updateBill(updatedAmenities, newCounts);
          return newCounts;
        });
        return updatedAmenities;
      } else {
        const updatedAmenities = [...prev, amenityId];
        setAmenityCounts((prevCounts) => {
          const newCounts = { ...prevCounts, [amenityId]: 1 };
          updateBill(updatedAmenities, newCounts);
          return newCounts;
        });
        return updatedAmenities;
      }
    });
  };

  const handleCountChange = (amenityId, count) => {
    setAmenityCounts((prevCounts) => {
      const newCounts = { ...prevCounts, [amenityId]: count };
      updateBill(selectedAmenities, newCounts);
      return newCounts;
    });
  };

  const updateBill = (amenityIds, counts) => {
    const totalBill = serviceData?.amenities
      ?.filter((amenity) => amenityIds.includes(amenity.id))
      .reduce((sum, amenity) => {
        const count = counts[amenity.id] || 0;
        return sum + (amenity.cost || 0) * count;
      }, 0) || 0;
    console.log("Updated Bill:", totalBill, "with amenityIds:", amenityIds, "and counts:", counts);
    setBill(totalBill);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentDate = new Date().toISOString().split("T")[0];
    if (date < currentDate) {
      alert("Error: Booking date cannot be in the past.");
      return;
    }

    if (!bill) {
      alert("Bill must be greater than 0.");
      return;
    }

    if (!date || !startTime || !endTime) {
      alert("Date and times cannot be empty.");
      return;
    }

    if (selectedAmenities.length === 0) {
      alert("Please select at least one amenity.");
      return;
    }

    setLoading(true);

    const amenitiesPayload = selectedAmenities.map((amenityId) => ({
      decorationAmenityId: amenityId,
      count: amenityCounts[amenityId] || 1,
    }));

    const requestBody = {
      ...(isEditMode ? {} : { decorationServiceId }),
      date,
      startTime,
      endTime,
      address,
      bill,
      amenities: amenitiesPayload,
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("No token found in session storage");
      setLoading(false);
      return;
    }

    const url = `https://mezbaan-db.vercel.app/bookings/decorationService${isEditMode ? `/${bookingId}` : ""}`;
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          isEditMode
            ? "Decoration Service Updated Successfully"
            : "Decoration Service Booked Successfully"
        );
        navigate("/bookings");
      } else {
        const errorData = await response.json();
        alert(
          `${
            isEditMode
              ? "Failed to update the decoration service:"
              : "Failed to book the decoration service:"
          } ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      alert(
        isEditMode
          ? "Error updating the decoration service. Please try again."
          : "Error booking the decoration service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="bookings-spinner-container">
        <div className="bookings-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger mt-4">{error}</div>;
  }

  if (!serviceData) return null;

  return (
    <div className="book-decoration-container">
      <h2 className="book-decoration-heading">
        {isEditMode ? "Edit Decoration" : "Book Decoration"}: {serviceData.name}
      </h2>
      <form onSubmit={handleSubmit} className="book-decoration-form">
        <div className="book-decoration-form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="book-decoration-input"
            required
          />
        </div>

        <div className="book-decoration-form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="book-decoration-input"
            required
          />
        </div>

        <div className="book-decoration-form-group">
          <label htmlFor="endTime">End Time</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="book-decoration-input"
            required
          />
        </div>

        <div className="book-decoration-form-group">
          <label htmlFor="address">Event Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="book-decoration-input"
            placeholder="Enter event address"
            required
          />
        </div>

        <div className="book-decoration-form-group">
          <label>Select Amenities</label>
          {serviceData.amenities?.length > 0 ? (
            <div className="book-decoration-checkbox-group">
              {serviceData.amenities.map((amenity) => (
                <div key={amenity.id} className="book-decoration-amenity-item">
                  <label className="book-decoration-checkbox-option">
                    <input
                      type="checkbox"
                      value={amenity.id}
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => handleAmenityChange(amenity.id)}
                    />
                    <span>
                      {amenity.amenity} - Rs {amenity.cost.toLocaleString()}
                    </span>
                  </label>
                  {selectedAmenities.includes(amenity.id) && (
                    <div className="book-decoration-count-stepper">
                      <button
                        type="button"
                        className="book-decoration-count-btn"
                        onClick={() =>
                          handleCountChange(
                            amenity.id,
                            Math.max(1, (amenityCounts[amenity.id] || 1) - 1)
                          )
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={amenityCounts[amenity.id] || 1}
                        onChange={(e) =>
                          handleCountChange(amenity.id, Math.max(1, Number(e.target.value)))
                        }
                        className="book-decoration-count-input"
                      />
                      <button
                        type="button"
                        className="book-decoration-count-btn"
                        onClick={() =>
                          handleCountChange(amenity.id, (amenityCounts[amenity.id] || 1) + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No amenities available for this service.</p>
          )}
        </div>

        <div className="book-decoration-form-group">
          <label>Total Bill: Rs {bill.toLocaleString()}</label>
        </div>

        <button
          type="submit"
          className="book-decoration-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isEditMode ? "Update Decoration" : "Book Decoration"}
        </button>
      </form>
    </div>
  );
};

export default BookDecoration;