import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Img,
    staticFile,
} from "remotion";
import React from "react";

export const Scene5Outro: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const text = "That's an Airbnb";
    const characters = text.split("");

    // Typography Entry (Frames 0-60)
    const renderCharacter = (char: string, index: number) => {
        const startFrame = index * 2; // Faster stagger

        const charEntry = spring({
            frame: frame - startFrame,
            fps,
            config: { damping: 12, stiffness: 150 },
        });

        const charY = interpolate(charEntry, [0, 1], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        const charOpacity = interpolate(charEntry, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        const charScale = interpolate(charEntry, [0, 1], [0.9, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        return (
            <span
                key={index}
                style={{
                    display: "inline-block",
                    transform: `translateY(${charY}px) scale(${charScale})`,
                    opacity: charOpacity,
                }}
            >
                {char === " " ? "\u00A0" : char}
            </span>
        );
    };

    // Logo Animation (Starts after text)
    const logoStartFrame = 40;
    const logoEntry = spring({
        frame: frame - logoStartFrame,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const logoScale = interpolate(logoEntry, [0, 1], [0.5, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const logoOpacity = interpolate(logoEntry, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const logoY = interpolate(logoEntry, [0, 1], [50, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Subtle pulse
    const pulse = 1 + Math.sin((frame / 30) * Math.PI) * 0.02;

    // Tagline Animation
    const taglineStartFrame = 80;
    const taglineOpacity = interpolate(frame, [taglineStartFrame, taglineStartFrame + 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Fade out at end
    const sceneDuration = 180; // 3 seconds (as set in index.tsx)
    const fadeOutStart = 150;
    const outroOpacity = interpolate(frame, [fadeOutStart, sceneDuration], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "white",
                opacity: outroOpacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F9F9F9 100%)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 30,
                    transform: "translateY(-40px)",
                }}
            >
                {/* Airbnb Logo Image */}
                <div
                    style={{
                        transform: `translateY(${logoY}px) scale(${logoScale * pulse})`,
                        opacity: logoOpacity,
                        marginBottom: 10,
                    }}
                >
                    <Img
                        src={staticFile("assets/logo.png")}
                        style={{
                            height: 140,
                            width: "auto",
                            filter: "drop-shadow(0 15px 30px rgba(255, 90, 95, 0.2))",
                        }}
                    />
                </div>

                {/* Text: "That's an Airbnb" */}
                <div
                    style={{
                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                        fontSize: 64,
                        fontWeight: "800",
                        color: "#222",
                        letterSpacing: "-0.04em",
                        textAlign: "center",
                    }}
                >
                    {characters.map((char, index) => renderCharacter(char, index))}
                </div>

                {/* Tagline */}
                <div
                    style={{
                        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                        fontSize: 22,
                        fontWeight: "500",
                        color: "#717171",
                        opacity: taglineOpacity,
                        marginTop: 10,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                    }}
                >
                    Belong anywhere
                </div>
            </div>

            {/* Bottom Accent Bar */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: 10,
                    background: "linear-gradient(90deg, #FF5A5F 0%, #FF7E82 100%)",
                    transform: `scaleX(${interpolate(frame, [0, 80], [0, 1], { extrapolateRight: "clamp" })})`,
                    transformOrigin: "left",
                }}
            />
        </AbsoluteFill>
    );
};
