import React, { useRef, useState } from "react";
import "./CurtainEffect.css";

const CurtainEffect = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <div 
      className="curtain-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`curtain left ${isOpen ? "open" : ""}`}></div>
      <div className={`curtain right ${isOpen ? "open" : ""}`}></div>
      <div className="stage-content">{children}</div>
    </div>
  );
};

export default CurtainEffect;
