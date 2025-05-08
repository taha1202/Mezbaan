import { useState } from "react";

const ImageSlider = ({ slides }) => {
    const [currIndex, setCurrIndex] = useState(0);

    const slideStyle = {
        width: "100%",
        height: "100%",
        borderRadius: "10px",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundImage: `url(${slides[currIndex]})`
    };

    const slideStyles = {
        height: "100%",
        position: "relative"
    };

    const arrowBaseStyle = {
        position: "absolute",
        top: "50%",
        transform: "translate(0, -50%)",
        fontSize: "45px",
        color: "#fff",
        zIndex: 1,
        cursor: "pointer",
        userSelect: "none",
        padding: "2px",
        borderRadius: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    };

    const leftArrow = {
        ...arrowBaseStyle,
        left: "10px",
    };

    const rightArrow = {
        ...arrowBaseStyle,
        right: "10px",
    };

    const handlePrevClick = () => {
        setCurrIndex((currIndex - 1 + slides.length) % slides.length);
    };

    const handleNextClick = () => {
        setCurrIndex((currIndex + 1) % slides.length);
    };

    return (
        <div style={slideStyles}>
            <div onClick={handlePrevClick} style={leftArrow}>←</div>
            <div onClick={handleNextClick} style={rightArrow}>→</div>
            <div style={slideStyle}></div>
        </div>
    );
};

export default ImageSlider;
