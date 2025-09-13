import React, { useState, useEffect } from "react";

const EyeTracking = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });
  const eyeRef = React.useRef<HTMLDivElement>(null); // Ref for the eye element

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (eyeRef.current) {
      const eyeRect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;

      const deltaX = mousePosition.x - eyeCenterX;
      const deltaY = mousePosition.y - eyeCenterY;

      const angle = Math.atan2(deltaY, deltaX);
      const maxPupilOffset = 15; // Adjust for desired pupil movement range

      const pupilX = Math.cos(angle) * maxPupilOffset;
      const pupilY = Math.sin(angle) * maxPupilOffset;

      setPupilPosition({ x: pupilX, y: pupilY });
    }
  }, [mousePosition]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      className="gap-2"
    >
      <div
        ref={eyeRef}
        style={{
          width: "160px",
          height: "200px",
          borderRadius: "50%",
          backgroundColor: "white",
          border: "2px solid black",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            position: "absolute",
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
          }}
          className="bg-primary "
        />
      </div>
      <div
        ref={eyeRef}
        style={{
          width: "160px",
          height: "200px",
          borderRadius: "50%",
          backgroundColor: "white",
          border: "2px solid black",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            position: "absolute",
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
          }}
          className="bg-primary "
        />
      </div>
    </div>
  );
};

export default EyeTracking;
