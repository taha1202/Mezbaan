import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from './Components/Signup';
import Login from "./Components/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState, useEffect } from "react";
import DisplayAll from './Components/DisplayAll';
import VenueDetail from './Components/VenueDetail';
import DecorationDetail from './Components/DecorationDetail';
import PhotographyDetail from './Components/PhotographyDetail';
import CateringDetail from './Components/CateringDetail';
import OtherDetail from './Components/OtherServicesDetail';
import UserProfile from './Components/Profile';
import BookVenue from './Components/BookVenue';
import BookCatering from './Components/BookCatering';
import BookDecoration from './Components/BookDecoration';
import BookPhotography from './Components/BookPhotographer';
import BookOtherService from './Components/BookOtherServices';
import Bookings from './Components/Bookings';
import BookingDetail from './Components/BookingDetails';
function App() {
  const [successfulLogin, setSuccessfulLogin] = useState(null);

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    const user = sessionStorage.getItem("user");
  
    if (authToken && user) {
      setSuccessfulLogin(true);
    } else {
      setSuccessfulLogin(false);
    }
  }, []);

  if (successfulLogin === null) {
    return <div>Loading...</div>;
  }


  return (
    <GoogleOAuthProvider clientId="http://770959712309-n7dq9vhgijhdhbcbe9s29105ookc467p.apps.googleusercontent.com">
      <Router>
        {/* <BackgroundManager successfulLogin={successfulLogin} /> */}
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login setSuccessfulLogin={setSuccessfulLogin} />} />
          <Route path="/signup" element={<Signup />} />
          


          {/* Protected Routes */}
           {/* Protected Routes */}
           <Route
              path="/"
              element={
                successfulLogin ? <Navigate to="/displayall" /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/displayall"
              element={
                successfulLogin ? (
                  <DisplayAll
                  setSuccessfulLogin={setSuccessfulLogin}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/profile"
              element={
                successfulLogin ? <UserProfile setSuccessfulLogin={setSuccessfulLogin}/> : <Navigate to="/login" />
              }
            />

            <Route
              path="/venuedetail/:id"
              element={
                successfulLogin ? <VenueDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/decorationdetail/:id"
              element={
                successfulLogin ? <DecorationDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/photographydetail/:id"
              element={
                successfulLogin ? <PhotographyDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/cateringdetail/:id"
              element={
                successfulLogin ? <CateringDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/otherservicesdetail/:id"
              element={
                successfulLogin ? <OtherDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/bookvenue"
              element={
                successfulLogin ? <BookVenue /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/bookcatering"
              element={
                successfulLogin ? <BookCatering /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/bookdecoration"
              element={
                successfulLogin ? <BookDecoration /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/bookphotographer"
              element={
                successfulLogin ? <BookPhotography /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/bookother"
              element={
                successfulLogin ? <BookOtherService /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/bookings"
              element={
                successfulLogin ? <Bookings setSuccessfulLogin={setSuccessfulLogin}/> : <Navigate to="/login" />
              }
            />
            <Route
              path="/bookingdetails/:id"
              element={
                successfulLogin ? <BookingDetail setSuccessfulLogin={setSuccessfulLogin}/> : <Navigate to="/login" />
              }
            />
        </Routes>
      </Router>

    </GoogleOAuthProvider>
  );
}

export default App;
