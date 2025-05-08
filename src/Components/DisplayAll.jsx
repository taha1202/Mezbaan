import { useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";
import axios from 'axios';
import Header from "./Header";


const DisplayAll = ({setSuccessfulLogin}) => {
  const categories = [
    { name: "All Categories", icon: "🌐" }, 
    { name: "Catering", icon: "🍽️" },
    { name: "Decoration", icon: "🎈" },
    { name: "Other", icon: "🛠️" },
    { name: "Venue", icon: "🏛️" },
    { name: "Photographer", icon: "📸" },
  ];

  const [Services, setServices] = useState({
    cateringServices: [],
    decorationServices: [],
    venues: [],
    photographers: [],
    otherServices: [],
  });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] =useState("All Categories"); 
  const [loading, setLoading] = useState(true); 
  const servicesPerPage = 10;

  const standardizeServices = () => {
    const standardized = [];

    Services.venues.forEach((venue) => {
      standardized.push({
        id: venue.id, 
        category: "Venue",
        name: venue.name,
        price: venue.priceDay ? `Rs ${venue.priceDay}` : "N/A",
        image: venue.coverImages?.[0] || "https://via.placeholder.com/150",
        description: venue.address || "No address available",
        rating: venue.averageRating || 0,
      });
    });

    Services.photographers.forEach((photographer) => {
      standardized.push({
        id: photographer.id, 
        category: "Photographer",
        name: photographer.name,
        price: photographer.cost ? `Rs ${photographer.cost}` : "N/A",
        image: photographer.coverImages?.[0] || "https://via.placeholder.com/150",
        description: photographer.description || "No description available",
        rating: photographer.averageRating || 0,
      });
    });

    Services.cateringServices.forEach((catering) => {
      standardized.push({
        id: catering.id, 
        category: "Catering",
        name: catering.name,
        price: catering.packages?.[0]?.price ? `Rs ${catering.packages[0].price}` : "N/A",
        image: catering.coverImages?.[0] || "https://via.placeholder.com/150",
        description: catering.address || "No address available",
        rating: catering.averageRating || 0,
      });
    });

    Services.decorationServices.forEach((decoration) => {
      const totalCost = decoration.amenities?.reduce((sum, amenity) => sum + (amenity.cost || 0), 0) || 0;
      standardized.push({
        id: decoration.id, 
        category: "Decoration",
        name: decoration.name,
        price: totalCost ? `Rs ${totalCost}` : "N/A",
        image: decoration.coverImages?.[0] || "https://via.placeholder.com/150",
        description: decoration.description || "No description available",
        rating: decoration.averageRating || 0,
      });
    });

    Services.otherServices.forEach((other) => {
      standardized.push({
        id: other.id,
        category: "Other",
        name: other.name,
        price: other.cost ? `Rs ${other.cost}` : "N/A",
        image: other.coverImages?.[0] || "https://via.placeholder.com/150",
        description: other.description || "No description available",
        rating: other.averageRating || 0,
      });
    });

    return standardized;
  };

  const allServices = standardizeServices();
  
  const filteredServices = selectedCategory === "All Categories"
    ? allServices
    : allServices.filter(service => service.category === selectedCategory);

  const totalServicesLength = filteredServices.length;
  const totalPages = Math.ceil(totalServicesLength / servicesPerPage);

  const displayedServices = filteredServices.slice(
    currentPage * servicesPerPage,
    (currentPage + 1) * servicesPerPage
  );

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true); 
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        console.error("No token found in session storage");
        setLoading(false);
        return;
      }

      try {
        const [
          cateringResponse,
          decorationResponse,
          venueResponse,
          photographerResponse,
          otherServicesResponse,
        ] = await Promise.all([
          axios.get(`https://mezbaan-db.vercel.app/cateringServices`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://mezbaan-db.vercel.app/decorationServices`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://mezbaan-db.vercel.app/venues`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://mezbaan-db.vercel.app/photography`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://mezbaan-db.vercel.app/otherServices`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const combinedServices = {
          cateringServices: cateringResponse?.data?.data || [],
          decorationServices: decorationResponse?.data?.data || [],
          venues: venueResponse?.data?.data || [],
          photographers: photographerResponse?.data?.data || [],
          otherServices: otherServicesResponse?.data?.data || [],
        };

        console.log("Combined Services:", combinedServices);
        setServices(combinedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchServices();
  }, []);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentPage(0); 
  };

  const HandleServiceDisplay = (id, category) =>{
    console.log(id, category);
    switch (category) {
      case "Venue":
        navigate(`/venuedetail/${id}`)
        break;
      case "Photographer":
        navigate(`/photographydetail/${id}`)
        break;
      case "Catering":
        navigate(`/cateringdetail/${id}`)
        break;
      case "Decoration":
        navigate(`/decorationdetail/${id}`)
        break;
      case "Other":
        navigate(`/otherservicesdetail/${id}`)
        break;
      default:
        throw new Error("Invalid category");
    };

  }
  return (
    <>
    <div className="header-div">
    <Header setSuccessfulLogin={setSuccessfulLogin}></Header>
    </div>
    <div className="display-all-container">
      <h2 className="display-all-heading">All Categories</h2>
      <div className="display-all-categories">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`display-all-category-item mx-3 ${selectedCategory === category.name ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className="display-all-category-icon">{category.icon}</div>
            <span className="display-all-category-name">{category.name}</span>
          </div>
        ))}
      </div>

      <div className="display-all-services-section">
        <h2 className="display-all-services-heading">
          {selectedCategory === "All Categories" ? "Services" : selectedCategory} (Total: {totalServicesLength})
        </h2>
        {loading ? (
          <div className="display-all-spinner-container">
            <div className="display-all-spinner"></div>
          </div>
        ) : (
          <div className="display-all-services-container">
            <button
              onClick={handlePrev}
              className="display-all-pagination-button"
              disabled={currentPage === 0}
            >
              &lt;
            </button>
            <div className="display-all-services-list">
              {displayedServices.map((service, index) => (
                <div key={index} className="display-all-service-card" 
                onClick={() => {HandleServiceDisplay(service.id, service.category)}}>
                  <img
                    src={service.image}
                    alt={service.name}
                    className="display-all-service-image"
                  />
                  <div className="display-all-service-details">
                    <p className="display-all-service-price">{service.price}</p>
                    <p className="display-all-service-name">{service.name}</p>
                    <p className="display-all-service-description">{service.description}</p>
                    <p className="display-all-service-rating">Rating: {service.rating}/5</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="display-all-pagination-button"
              disabled={currentPage === totalPages - 1}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default DisplayAll;