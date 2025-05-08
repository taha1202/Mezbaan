import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BookOtherService = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bookingId = state?.bookingId;
  const type = state?.type;
  const isEditMode = !!bookingId && type === "otherService";

  const [serviceData, setServiceData] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [serviceCount, setServiceCount] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const otherServiceId = serviceData?.id;
  const bill = Number(serviceData?.cost || 0) * serviceCount;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setIsFetching(true);
      if (!isEditMode) {
        const otherData = state?.existingData;
        if (otherData) {
          setServiceData(otherData);
        } else {
          alert("No other service data provided for booking");
        }
        setIsFetching(false);
        return;
      }

      const token = sessionStorage.getItem("authToken");
      if (!token) {
        alert("No token found in session storage");
        setIsFetching(false);
        return;
      }

      const url = `https://mezbaan-db.vercel.app/bookings/otherService/${bookingId}`;
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const booking = data.booking;
          setServiceData(data.otherService);
          setDate(booking.date.split("T")[0]);
          setStartTime(booking.startTime);
          setEndTime(booking.endTime);
          setAddress(booking.address || "");
          setServiceCount(booking.serviceCount || 1);
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Failed to fetch booking details");
        }
      } catch (err) {
        alert("Error fetching booking details: " + err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, isEditMode, state]);

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    const durationMs = end - start;
    return durationMs / (1000 * 60 * 60);
  };

  const handleServiceCountChange = (newCount) => {
    setServiceCount(Math.max(1, newCount));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentDate = new Date().toISOString().split("T")[0];
    if (date < currentDate) {
      alert("Error: Booking date cannot be in the past.");
      return;
    }

    if (!date || !startTime || !endTime) {
      alert("Date and times cannot be empty.");
      return;
    }

    const duration = calculateDuration();
    if (duration > (serviceData?.duration || 0)) {
      alert(
        `Error: Booking duration (${duration.toFixed(1)} hours) exceeds the service duration limit (${
          serviceData?.duration
        } hours).`
      );
      return;
    }

    setLoading(true);

    const requestBody = {
      ...(isEditMode ? {} : { otherServiceId }),
      date,
      startTime,
      endTime,
      address,
      bill,
      serviceCount,
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("No token found in session storage");
      setLoading(false);
      return;
    }

    const url = `https://mezbaan-db.vercel.app/bookings/otherService${isEditMode ? `/${bookingId}` : ""}`;
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
            ? "Other Service Updated Successfully"
            : "Other Service Booked Successfully"
        );
        navigate("/bookings");
      } else {
        const errorData = await response.json();
        alert(
          `${
            isEditMode
              ? "Failed to update the other service:"
              : "Failed to book the other service:"
          } ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      alert(
        isEditMode
          ? "Error updating the other service. Please try again."
          : "Error booking the other service. Please try again."
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

  if (!serviceData) return null;

  return (
    <div className="book-other-service-container">
      <h2 className="book-other-service-heading">
        {isEditMode ? "Edit Service" : "Book Service"}: {serviceData.name}
      </h2>
      <form onSubmit={handleSubmit} className="book-other-service-form">
        <div className="book-other-service-form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="book-other-service-input"
            required
          />
        </div>

        <div className="book-other-service-form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="book-other-service-input"
            required
          />
        </div>

        <div className="book-other-service-form-group">
          <label htmlFor="endTime">End Time</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="book-other-service-input"
            required
          />
          <small>Duration Limit: {serviceData.duration} hour(s)</small>
        </div>

        <div className="book-other-service-form-group">
          <label htmlFor="address">Event Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="book-other-service-input"
            placeholder="Enter event address"
            required
          />
        </div>

        <div className="book-other-service-form-group">
          <label>Service Count: {serviceCount}</label>
          <div className="book-other-service-count-stepper">
            <button
              type="button"
              className="book-other-service-count-btn"
              onClick={() => handleServiceCountChange(serviceCount - 1)}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={serviceCount}
              onChange={(e) => handleServiceCountChange(Number(e.target.value))}
              className="book-other-service-count-input"
            />
            <button
              type="button"
              className="book-other-service-count-btn"
              onClick={() => handleServiceCountChange(serviceCount + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="book-other-service-form-group">
          <label>Total Bill: Rs {bill.toLocaleString()}</label>
        </div>

        <button
          type="submit"
          className="book-other-service-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isEditMode ? "Update Service" : "Book Service"}
        </button>
      </form>
    </div>
  );
};

export default BookOtherService;