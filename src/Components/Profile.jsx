import React, { useState } from "react";

const UserProfile = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const username = user?.name || "Guest";
  const email = user?.email || "Not provided";
  const phone = user?.phone || "Not provided";
  const [profilePic, setProfilePic] = useState(user?.image ||"https://images.squarespace-cdn.com/content/v1/5936fbebcd0f68f67d5916ff/ba2c0779-5487-494a-b93b-f3bf288d40c6/person-placeholder-300x300.jpeg");
  const [previewPic, setPreviewPic] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewPic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (previewPic) {
      setLoading(true);
      try {
        const fileInput = document.getElementById("profile-pic-input");
        const file = fileInput.files[0];
  
        const formData = new FormData();
        formData.append("image", file);
  
        const token = sessionStorage.getItem("authToken");
  
        const url = "https://mezbaan-db.vercel.app/upload-profile-picture";
        const method = "POST";
  
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setProfilePic(data.imageUrl);
          setPreviewPic(null);
  

          sessionStorage.setItem(
            "user",
            JSON.stringify({ ...user, image: data.imageUrl })
          );
  
          alert("Profile picture updated successfully!");
        } else {
          alert("Failed to upload profile picture.");
          console.log(response);
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("An error occurred while uploading the picture.");
      } finally {
        setLoading(false);
      }
    }
  };
  

  return (
    <div className="profile-container">
    <div className="profile-card">
      <div className="profile-card-body">
        <div className="profile-image-section">
          <img
            src={profilePic}
            alt="Profile"
            className="profile-image"
          />
          <label htmlFor="profile-pic-input" className="profile-change-pic-btn">
            Change Picture
          </label>
          <input
            id="profile-pic-input"
            type="file"
            accept="image/*"
            className="profile-pic-input"
            onChange={handleImageChange}
          />
        </div>
        {previewPic && (
          <div className="profile-preview-section">
            <img
              src={previewPic}
              alt="Preview"
              className="profile-preview-image"
            />
            <button
              onClick={handleImageUpload}
              className="profile-save-pic-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Picture"}
            </button>
          </div>
        )}
        <h3 className="profile-username tclr">{username}</h3>
        <p className="profile-detail">
          <strong>Email:</strong> {email}
        </p>
        <p className="profile-detail">
          <strong>Phone:</strong> {phone}
        </p>
      </div>
    </div>
  </div>
  );
};

export default UserProfile;
