import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import googimg from "../assets/icons8-google-48.png";

const LogIn = ({ setSuccessfulLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("https://mezbaan-db.vercel.app/login", {
        email,
        password,
        roleId: 3, 
      });

      if (response.data?.token) {
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        


        setSuccessfulLogin(true);
        navigate("/displayall");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const socialEmail = result.user.email;

     
      const response = await axios.post("https://mezbaan-db.vercel.app/login", {
        email: socialEmail,
        password: "admin", 
        roleId: 3, 
      });

      if (response.data?.token) {
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        setSuccessfulLogin(true);
        navigate("/displayall");
      } else {
        setError("User not found. Please sign up first.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ls-main">
      <div className="ldiv">
        <div className="logo">

        </div>
      </div>
      <div className="rdiv">
      <div className="card" style={{ width: "30rem" }}>
        <div className="card-body">
          <h5 className="card-title text-center text-black fs-2">Welcome Back</h5>
          <h6 className="card-subtitle mb-3 text-center text-black mt-3 fs-20">
            Not registered yet? <Link className="createmsg" to="/signup">Create account.</Link>
          </h6>
          <form onSubmit={handleLogIn}>
            <div className="mb-3">
              <input
                type="text"
                className="inp form-control input-bg margins"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control input-bg margins"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                required
              />
              {showPassword ? (
                <FaEyeSlash className="icon-right" onClick={togglePasswordVisibility} />
              ) : (
                <FaEye className="icon-right" onClick={togglePasswordVisibility} />
              )}
            </div>
            {error && <div className="text-black">{error}</div>}
            {isLoading && (<div className="loader-div">
              <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            </div>)}
           <button
              className="form-control text-white btn-primary btn-css"
              type="submit"
              disabled={isLoading}
            >LogIn</button>
             
          </form>
          <hr className="hr-css" />
          <div className="signup-btns">
            <button className="google-sign-btn" onClick={handleGoogleLogin}>
              <img
                src={googimg}
                alt="Google Icon"
                style={{ width: "30px", marginRight: "8px" }}
              />
              Login with Google
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LogIn;
