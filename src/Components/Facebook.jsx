import React, { Component } from "react";
import FacebookLogin from "react-facebook-login";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

export default class Facebook extends Component {
  state = {
    isLoggedIn: false,
    userID: "",
    name: "",
    email: "",
    picture: "",
  };

  responseFacebook = async (response) => {
    if (response.status !== "unknown") {
      const { name, email, userID } = response;

      this.setState({
        isLoggedIn: true,
        userID: response.userID,
        name: response.name,
        email: response.email,
        picture: response.picture.data.url,
      });

      const formData = {
        name,
        email,
        password: "admin", // Default password for Facebook users
        phone: "-", // Default phone
        roleId: "3", // Default role ID
      };

      try {
        if (this.props.mode === "signup") {
          // Signup logic
          const res = await axios.post("https://mezbaan-db.vercel.app/register", formData);
          if (res.status === 201) {
            console.log("Registration successful with Facebook!");
            alert("Signed up successfully! Please log in to continue.");
          } else if (res.status === 400) { // Assuming 409 for 'User already exists'
            console.log("User already exists.");
            alert("User already exists. Please log in.");
          } else {
            console.log(`Unexpected response status: ${res.status}`);
            alert("An unexpected error occurred. Please try again.");
          }
        } else if (this.props.mode === "login") {
          this.props.setIsLoading(true);
          // Login logic
          const loginRes = await axios.post("https://mezbaan-db.vercel.app/login", {
            email,
            password: "admin", // Default password
            roleId: 3,
          });

          if (loginRes.data?.token) {
            sessionStorage.setItem("authToken", loginRes.data.token);
            sessionStorage.setItem("user", JSON.stringify(loginRes.data.user));
            console.log("Login successful with Facebook!");
            this.props.setSuccessfulLogin(true);
          } else {
            console.error("Facebook login failed.");
            alert("Login failed. Please try again.");
          }
        }
      } catch (err) {
        console.error("Error during Facebook login/registration:", err);
        console.log(err);
        alert(err.response.data.error);
      }
    }
  };

  render() {
    return (
      <FacebookLogin
        appId="1197612217962210" // Replace with your App ID
        autoLoad={false}
        fields="name,email,picture"
        cssClass="my-facebook-button-class"
        callback={this.responseFacebook}
      />
    );
  }
}
