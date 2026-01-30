import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Easing,
    Img,
    staticFile,
} from "remotion";
import React from "react";
import { SimpleGlobe } from "./components/SimpleGlobe";



export const Scene2GlobalSearch: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // === GLOBE CONTINUES FROM SCENE 1 (Already at position) ===
    // Globe starts already risen up, continues smooth rotation
    const globeY = 0;
    const globeOpacity = 1;

    // Globe scale animation - starts at 1.2 (from Scene 1 end camera scale 0.8 * globe scale 1.5), gets bigger in the middle
    // Scene 1 ends with cameraScale 0.8 and globe at scale 1.5, so effective globe size is 1.2
    const globeScaleStart = 1.2; // Matches Scene 1 end effective scale
    const globeScalePeak = 2.0;  // Peak scale in the middle
    const globeScaleProgress = interpolate(frame, [0, 90, 180], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
    });
    const globeScale = interpolate(globeScaleProgress, [0, 1], [globeScaleStart, globeScalePeak]);

    // Continuous rotation - continues from Scene 1 (starts at 0.9 rad)
    const globeRotation = (0.9 + frame * 0.005) % (Math.PI * 2);

    // === MAGNIFYING GLASS ORBIT (Frames 20-180) ===
    const glassStartFrame = 20;
    const glassEntry = spring({
        frame: frame - glassStartFrame,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const glassEntryScale = interpolate(glassEntry, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Orbit 3 times around globe
    const orbitAngle = ((frame - glassStartFrame) / 180) * Math.PI * 6;
    const orbitRadius = 3.6;
    const glassX = Math.cos(orbitAngle) * orbitRadius;
    const glassY = Math.sin(orbitAngle) * orbitRadius * 0.5;
    
    // Size change along circular path - pulses as it orbits
    const orbitProgress = ((frame - glassStartFrame) / 180) % 1;
    const pathScaleVariation = Math.sin(orbitProgress * Math.PI * 6) * 0.3 + 1; // Varies between 0.7 and 1.3
    const glassScale = glassEntryScale * pathScaleVariation;

    // === ICONS POP-UPS (Frames 30-120) ===
    // Better distributed around the globe with glassmorphism style
    const icons = [
        { frame: 30, lat: 0.9, lon: -0.8, color: "#FF5A5F", image: "bali.png", name: "Bali" },
        { frame: 40, lat: 0.4, lon: 0.2, color: "#FF5A5F", image: "paris.png", name: "Paris" },
        { frame: 50, lat: -0.2, lon: 2.2, color: "#00A699", image: "tokyo.png", name: "Tokyo" },
        { frame: 60, lat: 0.7, lon: -2.0, color: "#FC642D", image: "nyc.png", name: "New York" },
        { frame: 70, lat: 0.3, lon: 2.8, color: "#FF5A5F", image: "egypt.png", name: "Egypt" },
        { frame: 80, lat: -0.6, lon: -0.3, color: "#00A699", image: "bali.png", name: "Bali" },
        { frame: 90, lat: -0.4, lon: 1.5, color: "#FC642D", image: "paris.png", name: "Paris" },
        { frame: 100, lat: 0.1, lon: -2.8, color: "#FF5A5F", image: "tokyo.png", name: "Tokyo" },
    ];



    // === PHONE TRANSITION FROM BELOW (Frames 150-210) ===
    const phoneTransitionStart = 150;
    const phoneTransitionEnd = 210;
    
    // Phone comes up from below - much bigger, top half covers frame
    const phoneEntryProgress = interpolate(frame, [phoneTransitionStart, phoneTransitionEnd - 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
    });
    
    const phoneY = interpolate(phoneEntryProgress, [0, 1], [800, 180]); // Comes from below, stops higher up
    const phoneScale = interpolate(phoneEntryProgress, [0, 1], [1.5, 2.5]); // Final scale 2.5 to match Scene 3
    const phoneOpacity = interpolate(frame, [phoneTransitionStart, phoneTransitionStart + 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // === TRANSITION TO SCENE 3 (Frames 170-210) ===
    const transitionStart = 170;

    // Magnifying glass rushes toward camera
    const glassRushScale =
        frame >= transitionStart
            ? interpolate(frame, [transitionStart, transitionStart + 20], [1, 8], {
                easing: Easing.in(Easing.exp),
            })
            : 1;

    // White portal expansion
    const portalExpand =
        frame >= transitionStart + 10
            ? interpolate(
                frame,
                [transitionStart + 10, transitionStart + 20],
                [0, 1],
                { extrapolateRight: "clamp" }
            )
            : 0;

    // Content fade
    const contentFade =
        frame >= transitionStart
            ? interpolate(frame, [transitionStart, transitionStart + 20], [1, 0], {
                extrapolateRight: "clamp",
            })
            : 1;

    return (
        <AbsoluteFill style={{ backgroundColor: "#F5F5F7" }}>
            {/* Same background as Scene 1 */}
            <div style={{ opacity: contentFade }}>
                {/* Globe - now using PNG instead of 3D model */}
                <SimpleGlobe
                    rotation={globeRotation}
                    scale={globeScale}
                    opacity={globeOpacity}
                    position={[0, globeY, 0]}
                />

                {/* UI Cards on globe */}
                {icons.map((icon, index) => {
                    const iconEntry = spring({
                        frame: frame - icon.frame,
                        fps,
                        config: { damping: 10, stiffness: 120 },
                    });

                    const iconScale = interpolate(iconEntry, [0, 1], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });

                    // Bob animation
                    const bob =
                        frame > icon.frame
                            ? Math.sin(((frame - icon.frame) / fps + index * 0.3) * Math.PI * 2) * 10
                            : 0;

                    // Convert 3D position to 2D screen position
                    const radius = 260; // Matches visually with scaled globe
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const x = centerX + Math.cos(icon.lat) * Math.cos(icon.lon) * radius;
                    const y = centerY - Math.sin(icon.lat) * radius + bob;

                    return (
                        <div
                            key={index}
                            style={{
                                position: "absolute",
                                left: x,
                                top: y,
                                transform: `translate(-50%, -50%) scale(${iconScale})`,
                                width: "140px",
                                height: "90px",
                                opacity: iconScale > 0 ? 1 : 0,
                                zIndex: 100 + index, // Ensure layering
                            }}
                        >
                            {/* Card Container - Glassmorphism Style */}
                            <div style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "16px",
                                overflow: "hidden",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3) inset",
                                background: "rgba(255, 255, 255, 0.75)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                border: "1px solid rgba(255, 255, 255, 0.5)",
                                display: "flex",
                                flexDirection: "column",
                            }}>
                                {/* Top Image Section */}
                                <div style={{ height: "60%", width: "100%", padding: "8px 8px 4px 8px", boxSizing: "border-box" }}>
                                    <Img
                                        src={staticFile(`assets/${icon.image}`)}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                                    />
                                </div>
                                {/* Bottom Color Section with Name */}
                                <div style={{
                                    height: "40%",
                                    background: `linear-gradient(135deg, ${icon.color}dd, ${icon.color}aa)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingBottom: "2px",
                                    margin: "0 8px 8px 8px",
                                    width: "calc(100% - 16px)",
                                    borderRadius: "10px",
                                    boxSizing: "border-box",
                                }}>
                                    <span style={{
                                        color: "white",
                                        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                                        fontWeight: "600",
                                        fontSize: "13px",
                                        letterSpacing: "-0.01em",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                    }}>
                                        {icon.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Magnifying Glass - Larger and Transparent */}
                {frame >= glassStartFrame && (
                    <div
                        style={{
                            position: "absolute",
                            left: width / 2 + glassX * 80,
                            top: height / 2 - glassY * 80,
                            transform: `translate(-50%, -50%) scale(${glassScale * glassRushScale})`,
                            width: "200px", // Increased size
                            height: "200px",
                            opacity: contentFade,
                            zIndex: 200, // On top of cards
                        }}
                    >
                        <svg
                            viewBox="0 0 120 120"
                            style={{ width: "100%", height: "100%", filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.3))" }}
                        >
                            {/* Magnifying glass lens - Black color */}
                            <circle
                                cx="45"
                                cy="45"
                                r="35"
                                fill="rgba(0, 0, 0, 0.1)" // Dark transparent fill
                                stroke="rgba(0, 0, 0, 0.85)" // Black rim
                                strokeWidth="6"
                            />
                            {/* Ring Highlight */}
                            <circle
                                cx="45"
                                cy="45"
                                r="35"
                                fill="none"
                                stroke="rgba(0, 0, 0, 0.3)"
                                strokeWidth="2"
                                style={{ mixBlendMode: "multiply" }}
                            />
                            {/* Handle */}
                            <line
                                x1="72"
                                y1="72"
                                x2="105"
                                y2="105"
                                stroke="rgba(0, 0, 0, 0.85)" // Black handle
                                strokeWidth="10"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                )}

                {/* iPhone Mockup - Glassmorphism style coming up from below */}
                {frame >= phoneTransitionStart && (
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: `translate(-50%, -50%) translateY(${phoneY}px) scale(${phoneScale})`,
                            opacity: phoneOpacity,
                            zIndex: 500, // On top of globe
                        }}
                    >
                        {/* Phone Frame - Glassmorphism */}
                        <div
                            style={{
                                width: 280,
                                height: 560,
                                background: "rgba(255, 255, 255, 0.25)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                borderRadius: 40,
                                padding: 12,
                                boxShadow: "0 25px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.4) inset",
                                border: "1px solid rgba(255, 255, 255, 0.5)",
                            }}
                        >
                            {/* Inner Phone Frame */}
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    background: "rgba(255, 255, 255, 0.4)",
                                    borderRadius: 32,
                                    overflow: "hidden",
                                    position: "relative",
                                    boxShadow: "0 0 0 1px rgba(255,255,255,0.3) inset",
                                }}
                            >
                                {/* Status Bar */}
                                <div
                                    style={{
                                        height: 44,
                                        background: "rgba(247, 247, 247, 0.6)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "#1d1d1f",
                                    }}
                                >
                                    9:41
                                </div>

                                {/* Search Bar */}
                                <div
                                    style={{
                                        margin: "10px 15px",
                                        padding: "10px 15px",
                                        background: "rgba(255, 255, 255, 0.7)",
                                        borderRadius: 20,
                                        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                                        fontSize: 14,
                                        color: "#767676",
                                        backdropFilter: "blur(10px)",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                    }}
                                >
                                    🔍 Where to?
                                </div>

                                {/* Content Area */}
                                <div
                                    style={{
                                        padding: "10px 15px",
                                        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: "#1d1d1f",
                                            marginBottom: 10,
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        Explore Airbnb
                                    </div>
                                    <div style={{ fontSize: 14, color: "#86868b" }}>
                                        Find amazing places
                                    </div>
                                </div>

                                {/* Airbnb logo */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 20,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        fontSize: 24,
                                        color: "#FF5A5F",
                                        fontWeight: 700,
                                        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                                    }}
                                >
                                    airbnb
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Transition Overlay - Dark fade instead of white portal */}
            <AbsoluteFill
                style={{
                    background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${(1 - portalExpand) * 100}%, rgba(0,0,0,0.1) ${(1 - portalExpand) * 100 + 20}%)`,
                    pointerEvents: "none",
                    opacity: portalExpand > 0 ? 1 : 0,
                }}
            />
        </AbsoluteFill>
    );
};
