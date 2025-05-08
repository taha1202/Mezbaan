import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BookVenue = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bookingId = state?.bookingId;
  const type = state?.type;
  const isEditMode = !!bookingId && type === "venue";

  const [serviceData, setServiceData] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState("");
  const [bill, setBill] = useState(0);
  const [guestCount, setGuestCount] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const venueID = serviceData?.id;
  const maxCapacity = serviceData?.capacity || 1000;
  const priceDay = Number(serviceData?.priceDay) || 50000;
  const priceNight = Number(serviceData?.priceNight) || 75000;

  const convertTo24HourFormat = (time) => {
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
    hours = parseInt(hours, 10);
    if (period.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setIsFetching(true);
      if (!isEditMode) {
        const venueData = state?.existingData;
        if (venueData) {
          setServiceData(venueData);
        } else {
          alert("No venue data provided for booking");
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

      const url = `https://mezbaan-db.vercel.app/bookings/venue/${bookingId}`;
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
          setServiceData(data.venue);
          setDate(booking.date.split("T")[0]);
          setStartTime(convertTo24HourFormat(booking.startTime));
          setEndTime(convertTo24HourFormat(booking.endTime));
          setGuestCount(booking.guestCount);
          setBill(Number(booking.bill));
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

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(":");
    let hoursNum = parseInt(hours, 10);
    const period = hoursNum >= 12 ? "pm" : "am";
    hoursNum = hoursNum % 12 || 12;
    return `${hoursNum.toString().padStart(2, "0")}:${minutes} ${period}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentDate = new Date().toISOString().split("T")[0];
    if (date < currentDate) {
      alert("Error: Booking date cannot be in the past.");
      return;
    }

    if (!bill || !guestCount) {
      alert("Prices and guest capacities must be greater than 0.");
      return;
    }

    if (!date || !startTime || !endTime) {
      alert("Date and timings cannot be empty.");
      return;
    }

    if (Number(guestCount) > Number(maxCapacity)) {
      alert("Guest count should not exceed maximum capacity.");
      return;
    }

    setLoading(true);

    const formattedStartTime = convertTo12HourFormat(startTime);
    const formattedEndTime = convertTo12HourFormat(endTime);

    const requestBody = {
      ...(isEditMode ? {} : { venueId: venueID }),
      date,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      guestCount,
      bill,
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("No token found in session storage");
      setLoading(false);
      return;
    }

    const url = `https://mezbaan-db.vercel.app/bookings/venue${isEditMode ? `/${bookingId}` : ""}`;
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
        alert(isEditMode ? "Venue Updated Successfully" : "Venue Booked Successfully");
        navigate("/bookings");
      } else {
        const errorData = await response.json();
        alert(
          `${
            isEditMode ? "Failed to update the venue:" : "Failed to book the venue:"
          } ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      alert(
        isEditMode
          ? "Error updating the venue. Please try again."
          : "Error booking the venue. Please try again."
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
    <div className="book-venue-container">
      <h2 className="book-venue-heading">
        {isEditMode ? "Edit Venue" : "Book Venue"}: {serviceData.name}
      </h2>
      <form onSubmit={handleSubmit} className="book-venue-form">
        <div className="book-venue-form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="book-venue-input"
            required
          />
        </div>

        <div className="book-venue-form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="book-venue-input"
            required
          />
        </div>

        <div className="book-venue-form-group">
          <label htmlFor="endTime">End Time</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="book-venue-input"
            required
          />
        </div>

        <div className="book-venue-form-group">
          <label>Guest Count: {guestCount}</label>
          <input
            type="range"
            min="1"
            max={maxCapacity}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="book-venue-slider"
          />
          <small>Max Capacity: {maxCapacity}</small>
        </div>

        <div className="book-venue-form-group">
          <label>Select Price (Bill)</label>
          <div className="book-venue-radio-group">
            <label className="book-venue-checkbox-option">
              <input
                type="checkbox"
                name="bill"
                value={priceDay}
                checked={bill === priceDay}
                onChange={(e) => setBill(Number(e.target.value))}
              />
              <span>Day Price: Rs {priceDay.toLocaleString()}</span>
            </label>
            <label className="book-venue-checkbox-option">
              <input
                type="checkbox"
                name="bill"
                value={priceNight}
                checked={bill === priceNight}
                onChange={(e) => setBill(Number(e.target.value))}
              />
              <span>Night Price: Rs {priceNight.toLocaleString()}</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="book-venue-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isEditMode ? "Update Venue" : "Book Venue"}
        </button>
      </form>
    </div>
  );
};

export default BookVenue;