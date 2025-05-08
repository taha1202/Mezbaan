import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { auth, provider } from "./config";
import { signInWithPopup } from 'firebase/auth';
import googimg from "../assets/icons8-google-48.png";
import axios from 'axios';

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [number, setNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email.";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(password)) {
      newErrors.password =
        "Password must include uppercase, lowercase letters and be at least 6 characters.";
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(displayName)) {
      newErrors.displayName = "Display name should only be alphanumeric.";
    }
    if (!/^03\d{9}$/.test(number)) {
      newErrors.number = "Phone number should be a valid Pakistani number starting with 03 and 11 digits long.";
    }    
    return newErrors;
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const data = await signInWithPopup(auth, provider);
      const googleEmail = data.user.email;
      const googleName = data.user.displayName;

      const formData = {
        email: googleEmail,
        roleId: '3', // Default role ID for signup
        password: 'admin', // Default password
        phone: '-',
        name: googleName,
      };

      const response = await axios.post('https://mezbaan-db.vercel.app/register', formData);

      if (response.status === 201) {
        alert("Registration successful! Redirecting to login...");
        navigate('/'); 
      } else if (response.status === 400) {
        alert("Google account already exists. Please log in.");
        navigate('/'); 
      }
    } catch (error) {
      console.error("Google signup error:", error);
      alert("An error occurred during Google signup.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    console.log(displayName, email)
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const formData = {
        name: displayName,
        email,
        password,
        phone: number,
        roleId: '3', // Default role ID for signup
      };
      
      const response = await axios.post('https://mezbaan-db.vercel.app/register', formData);
      console.log(response)
      if (response.status === 201) {
        alert("Registration successful! Redirecting to login...");
        navigate('/');
      }
      
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        // Fallback for other types of errors (e.g., network issues)
        alert("An error occurred during signup. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ls-main">
      <div className='ldiv'>
        <div className='logo'></div>
      </div>
      <div className='rdiv'>
      <div className="card" style={{ width: "30rem" }}>
        <div className="card-body">
          <h5 className="card-title text-center fs-2">Create an account</h5>
          <h6 className="card-subtitle mb-3 text-center fs-20">
            Already have an account? <Link className='createmsg' to="/">Log in</Link>
          </h6>
          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control input-bg margins"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              {errors.displayName && <div className="">{errors.displayName}</div>}
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control input-bg margins"
                placeholder="Phone Number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
              {errors.number && <div className="">{errors.number}</div>}
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control input-bg margins"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <div className="">{errors.email}</div>}
            </div>
            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control input-bg margins"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {showPassword ? (
                <FaEyeSlash className="icon-right" onClick={togglePasswordVisibility} />
              ) : (
                <FaEye className="icon-right" onClick={togglePasswordVisibility} />
              )}
            </div>
              {errors.password && <div className="">{errors.password}</div>}
            {!loading ? (<button
              className="form-control text-white btn-primary btn-css"
              type="submit"
              disabled={loading}
            >Create account</button>): (<div className="loader-div">
              <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            </div>)}
          </form>
          <hr className="hr-css" />
          <div className="signup-btns">
            <button className="google-sign-btn" onClick={handleGoogleSignup}>
              <img src={googimg} alt="Google Icon" style={{ width: '30px', marginRight: '8px' }} /> Sign in with Google
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SignUp;
