import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BookPhotography = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bookingId = state?.bookingId;
  const type = state?.type;
  const isEditMode = !!bookingId && type === "photography";

  const [serviceData, setServiceData] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [eventType, setEventType] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const photographyId = serviceData?.id;
  const bill = Number(serviceData?.cost) || 0;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setIsFetching(true);
      if (!isEditMode) {
        const photographyData = state?.existingData;
        if (photographyData) {
          setServiceData(photographyData);
        } else {
          alert("No photography data provided for booking");
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

      const url = `https://mezbaan-db.vercel.app/bookings/photography/${bookingId}`;
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
          setServiceData(data.photography);
          setDate(booking.date.split("T")[0]);
          setStartTime(booking.startTime);
          setEndTime(booking.endTime);
          setAddress(booking.address || "");
          setEventType(booking.eventType);
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

    if (!eventType) {
      alert("Please select an event type.");
      return;
    }

    setLoading(true);

    const requestBody = {
      ...(isEditMode ? {} : { photographyId }),
      date,
      startTime,
      endTime,
      address,
      bill,
      eventType,
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("No token found in session storage");
      setLoading(false);
      return;
    }

    const url = `https://mezbaan-db.vercel.app/bookings/photography${isEditMode ? `/${bookingId}` : ""}`;
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
            ? "Photography Service Updated Successfully"
            : "Photography Service Booked Successfully"
        );
        navigate("/bookings");
      } else {
        const errorData = await response.json();
        alert(
          `${
            isEditMode
              ? "Failed to update the photography service:"
              : "Failed to book the photography service:"
          } ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      alert(
        isEditMode
          ? "Error updating the photography service. Please try again."
          : "Error booking the photography service. Please try again."
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
    <div className="book-photography-container">
      <h2 className="book-photography-heading">
        {isEditMode ? "Edit Photography" : "Book Photography"}: {serviceData.name}
      </h2>
      <form onSubmit={handleSubmit} className="book-photography-form">
        <div className="book-photography-form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="book-photography-input"
            required
          />
        </div>

        <div className="book-photography-form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="book-photography-input"
            required
          />
        </div>

        <div className="book-photography-form-group">
          <label htmlFor="endTime">End Time</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="book-photography-input"
            required
          />
        </div>

        <div className="book-photography-form-group">
          <label htmlFor="address">Event Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="book-photography-input"
            placeholder="Enter event address"
            required
          />
        </div>

        <div className="book-photography-form-group">
          <label htmlFor="eventType">Event Type</label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="book-photography-input"
            required
          >
            <option value="">Select Event Type</option>
            <option value="Wedding">Wedding</option>
            <option value="Birthday">Birthday</option>
            <option value="Corporate">Corporate</option>
            <option value="Engagement">Engagement</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="book-photography-form-group">
          <label>Total Bill: Rs {bill.toLocaleString()}</label>
        </div>

        <button
          type="submit"
          className="book-photography-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isEditMode ? "Update Photography" : "Book Photography"}
        </button>
      </form>
    </div>
  );
};

export default BookPhotography;