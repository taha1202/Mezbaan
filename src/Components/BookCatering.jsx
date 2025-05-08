import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BookCatering = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bookingId = state?.bookingId;
  const type = state?.type;
  const isEditMode = !!bookingId && type === "cateringService";

  const [serviceData, setServiceData] = useState(null);
  const [bookedMenuItems, setBookedMenuItems] = useState([]);
  const [bookedPackages, setBookedPackages] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [date, setDate] = useState("");
  const [bill, setBill] = useState(0);
  const [guestCount, setGuestCount] = useState(1);
  const [address, setAddress] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const cateringServiceId = serviceData?.id;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setIsFetching(true);
      let cateringData;

      if (!isEditMode) {
        cateringData = state?.existingData;
        if (cateringData) {
          console.log("Book Mode - Service Data:", cateringData);
          setServiceData(cateringData);
        } else {
          alert("No catering data provided for booking");
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

      try {
        const bookingUrl = `https://mezbaan-db.vercel.app/bookings/cateringService/${bookingId}`;
        const bookingResponse = await fetch(bookingUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!bookingResponse.ok) {
          const errorData = await bookingResponse.json();
          alert(errorData.message || "Failed to fetch booking details");
          setIsFetching(false);
          return;
        }

        const bookingData = await bookingResponse.json();
        console.log("Booking Data:", bookingData);

        const booking = bookingData.booking;
        setBookedMenuItems(bookingData.bookedMenuItems || []);
        setBookedPackages(bookingData.bookedPackages || []);
        setDate(booking.date.split("T")[0]);
        setStartTime(booking.startTime);
        setAddress(booking.address || "");
        setGuestCount(bookingData.cateringBooking.guestCount);

        const serviceUrl = `https://mezbaan-db.vercel.app/cateringServices/${bookingData.cateringService.id}`;
        const serviceResponse = await fetch(serviceUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!serviceResponse.ok) {
          const errorData = await serviceResponse.json();
          alert(errorData.message || "Failed to fetch catering service details");
          setIsFetching(false);
          return;
        }

        cateringData = (await serviceResponse.json()).data;
        console.log("Catering Service Data:", cateringData);
        setServiceData(cateringData);

        const menuItemIds = bookingData.bookedMenuItems?.map((item) => item.id) || [];
        const packageId = bookingData.bookedPackages?.length > 0 ? bookingData.bookedPackages[0].id : null;

        setSelectedMenuItems(menuItemIds);
        setSelectedPackage(packageId);

        if (!packageId) {
          setBookedPackages([]);
        }

        console.log("After Fetch - Selected Menu Items:", menuItemIds);
        console.log("After Fetch - Selected Package:", packageId);
        console.log("After Fetch - Booked Menu Items:", bookingData.bookedMenuItems);
        console.log("After Fetch - Booked Packages:", bookingData.bookedPackages);

        if (packageId) {
          const packagePrice = Number(cateringData.packages?.find((pkg) => pkg.id === packageId)?.price) || 0;
          setBill(packagePrice * bookingData.cateringBooking.guestCount);
        } else {
          const totalMenuCost = cateringData.menuItems
            ?.filter((item) => menuItemIds.includes(item.id))
            .reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
          setBill(totalMenuCost * bookingData.cateringBooking.guestCount);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        alert("Error fetching details: " + err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, isEditMode, state]);

  useEffect(() => {
    if (!serviceData) return;
    updateBill(selectedMenuItems, selectedPackage);
  }, [selectedMenuItems, selectedPackage, guestCount, serviceData]);

  useEffect(() => {
    console.log("State Change - Selected Package:", selectedPackage);
    console.log("State Change - Selected Menu Items:", selectedMenuItems);
    console.log("State Change - Booked Packages:", bookedPackages);
    console.log("State Change - Booked Menu Items:", bookedMenuItems);
    console.log("State Change - Bill:", bill);
  }, [selectedPackage, selectedMenuItems, bookedPackages, bookedMenuItems, bill]);

  const handleMenuItemChange = (menuItemId, cost) => {
    if (selectedPackage) return;

    setSelectedMenuItems((prev) => {
      if (prev.includes(menuItemId)) {
        const updatedItems = prev.filter((id) => id !== menuItemId);
        setBookedMenuItems(updatedItems.map(id => serviceData.menuItems.find(item => item.id === id) || {}));
        return updatedItems;
      } else {
        const updatedItems = [...prev, menuItemId];
        setBookedMenuItems(updatedItems.map(id => serviceData.menuItems.find(item => item.id === id) || {}));
        return updatedItems;
      }
    });
  };

  const handlePackageChange = (packageId, packagePrice) => {
    if (selectedPackage === packageId) {
      setSelectedPackage(null);
      setSelectedMenuItems([]);
      setBookedPackages([]);
      setBookedMenuItems([]);
    } else {
      setSelectedPackage(packageId);
      setSelectedMenuItems([]);
      setBookedPackages(serviceData.packages.filter(pkg => pkg.id === packageId));
      setBookedMenuItems([]);
    }
  };

  const updateBill = (menuItemIds, packageId) => {
    if (packageId) {
      const packagePrice = Number(serviceData?.packages?.find((pkg) => pkg.id === packageId)?.price) || 0;
      const totalBill = packagePrice * guestCount;
      setBill(totalBill);
    } else {
      const totalMenuCost = serviceData?.menuItems
        ?.filter((item) => menuItemIds.includes(item.id))
        .reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
      const totalBill = totalMenuCost * guestCount;
      setBill(totalBill);
    }
  };

  const handleGuestCountChange = (newGuestCount) => {
    setGuestCount(newGuestCount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentDate = new Date().toISOString().split("T")[0];
    if (date < currentDate) {
      alert("Error: Booking date cannot be in the past.");
      return;
    }

    if (!bill || !guestCount) {
      alert("Bill and guest count must be greater than 0.");
      return;
    }

    if (!date || !startTime) {
      alert("Date and start time cannot be empty.");
      return;
    }

    if (!selectedPackage && selectedMenuItems.length === 0) {
      alert("Please select either a package or at least one menu item.");
      return;
    }

    setLoading(true);

    const requestBody = {
      ...(isEditMode ? {} : { cateringServiceId }),
      guestCount,
      packageIds: selectedPackage ? [selectedPackage] : [1],
      menuItemIds: selectedMenuItems ? selectedMenuItems : [1],
      date,
      startTime,
      address,
      bill,
    };
    console.log("Request Body:", requestBody);

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("No token found in session storage");
      setLoading(false);
      return;
    }

    const url = `https://mezbaan-db.vercel.app/bookings/cateringService${isEditMode ? `/${bookingId}` : ""}`;
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
            ? "Catering Service Updated Successfully"
            : "Catering Service Booked Successfully"
        );
        console.log(result);
        navigate("/bookings");
      } else {
        const errorData = await response.json();
        alert(
          `${
            isEditMode
              ? "Failed to update the catering service:"
              : "Failed to book the catering service:"
          } ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert(
        isEditMode
          ? "Error updating the catering service. Please try again."
          : "Error booking the catering service. Please try again."
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

  if (!serviceData) {
    console.log("Service Data is null");
    return null;
  }

  console.log("Rendering - Service Data:", serviceData);
  console.log("Rendering - Selected Menu Items:", selectedMenuItems);
  console.log("Rendering - Selected Package:", selectedPackage);
  console.log("Rendering - Booked Menu Items:", bookedMenuItems);
  console.log("Rendering - Booked Packages:", bookedPackages);
  console.log("Rendering - Bill:", bill);

  return (
    <div className="book-catering-container">
      <h2 className="book-catering-heading">
        {isEditMode ? "Edit Catering" : "Book Catering"}: {serviceData.name}
      </h2>
      <form onSubmit={handleSubmit} className="book-catering-form">
        <div className="book-catering-form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="book-catering-input"
            required
          />
        </div>

        <div className="book-catering-form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="book-catering-input"
            required
          />
        </div>

        <div className="book-catering-form-group">
          <label htmlFor="address">Delivery Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="book-catering-input"
            placeholder="Enter delivery address"
            required
          />
        </div>

        <div className="book-catering-form-group">
          <label>Guest Count: {guestCount}</label>
          <input
            type="range"
            min="1"
            max="3000"
            value={guestCount}
            onChange={(e) => handleGuestCountChange(Number(e.target.value))}
            className="book-catering-slider"
          />
        </div>

        <div className="book-catering-form-group">
          <label>Select Packages</label>
          <div className="book-catering-checkbox-group">
            {serviceData.packages?.length > 0 ? (
              serviceData.packages.map((pkg) => (
                <label key={pkg.id} className="book-catering-checkbox-option">
                  <input
                    type="checkbox"
                    value={pkg.id}
                    checked={selectedPackage === pkg.id}
                    onChange={() => handlePackageChange(pkg.id, pkg.price)}
                  />
                  <span>{pkg.name} - Rs {Number(pkg.price).toLocaleString()}</span>
                </label>
              ))
            ) : (
              <p>No packages available</p>
            )}
          </div>
        </div>

        <div className="book-catering-form-group">
          <label>Select Menu Items {selectedPackage && "(Disabled - Package Selected)"}</label>
          <div className="book-catering-checkbox-group">
            {serviceData.menuItems?.length > 0 ? (
              serviceData.menuItems.map((item) => (
                <label key={item.id} className="book-catering-checkbox-option">
                  <input
                    type="checkbox"
                    value={item.id}
                    checked={selectedMenuItems.includes(item.id)}
                    onChange={() => handleMenuItemChange(item.id, item.cost)}
                    disabled={!!selectedPackage}
                  />
                  <span>{item.name} ({item.type}) - Rs {Number(item.cost).toLocaleString()}</span>
                </label>
              ))
            ) : (
              <p>No menu items available</p>
            )}
          </div>
        </div>

        <div className="book-catering-form-group">
          <label>Total Bill: Rs {bill.toLocaleString()}</label>
        </div>

        <button
          type="submit"
          className="book-catering-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isEditMode ? "Update Catering" : "Book Catering"}
        </button>
      </form>
    </div>
  );
};

export default BookCatering;