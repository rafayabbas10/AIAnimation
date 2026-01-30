import React from "react";
import { Img, staticFile } from "remotion";

interface SimpleGlobeProps {
    rotation: number;
    scale: number;
    opacity: number;
    position?: [number, number, number];
}

export const SimpleGlobe: React.FC<SimpleGlobeProps> = ({
    rotation,
    scale,
    opacity,
    position = [0, 0, 0],
}) => {
    // Convert 3D position to 2D transformation
    const translateX = position[0] * 80; // Scale factor for positioning
    const translateY = -position[1] * 80; // Invert Y for screen coordinates

    return (
        <div
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale}) rotate(${rotation}rad)`,
                opacity: opacity,
                width: "400px",
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Img
                src={staticFile("assets/globe.png")}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                }}
            />
        </div>
    );
};
