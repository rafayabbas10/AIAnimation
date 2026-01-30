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

interface UITag {
    text: string;
    icon: string;
    orbitRadius: number;
    orbitSpeed: number;
    yOffset: number;
}

const uiTags: UITag[] = [
    { text: "$299/night", icon: "💰", orbitRadius: 450, orbitSpeed: 1.5, yOffset: 80 },
    { text: "Lake Tahoe", icon: "📍", orbitRadius: 500, orbitSpeed: 1.3, yOffset: -50 },
    { text: "4.9 ⭐", icon: "", orbitRadius: 420, orbitSpeed: 1.7, yOffset: 40 },
    { text: "WiFi • Kitchen", icon: "🏠", orbitRadius: 520, orbitSpeed: 1.4, yOffset: -80 },
];

export const Scene4IsometricReveal: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Card-to-3D Transformation (Frames 0-40)
    const transformProgress = interpolate(frame, [0, 40], [0, 1], {
        easing: Easing.out(Easing.exp),
        extrapolateRight: "clamp",
    });

    // UI Tags Entry (Frames 15-75, staggered) - BIGGER PINS with smooth animation
    const renderUITag = (tag: UITag, index: number) => {
        // Earlier entry: start at frame 15 with 15 frame stagger between each tag
        const entryFrame = 15 + index * 15;

        // Softer spring for smoother, more polished feel
        const tagEntry = spring({
            frame: frame - entryFrame,
            fps,
            config: {
                damping: 18,
                stiffness: 60,
                mass: 1.2,
            },
        });

        const tagScale = interpolate(tagEntry, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        // Speed ramp orbital motion: slows down around frame 154, speeds up towards end
        // Instead of multiplying by speed, we use accumulated progress (integral of speed curve)
        // This ensures the orbit always moves forward, just at varying rates

        // Map frame to accumulated orbital progress (0 to 1 represents full travel)
        // The derivative of this curve represents speed - slower sections = flatter curve
        const accumulatedProgress = interpolate(
            frame,
            [0, 100, 140, 154, 170, 200, 240],
            [0, 0.35, 0.45, 0.48, 0.52, 0.7, 1.0], // Flat section around 154 = slow movement
            {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
            }
        );

        const baseOrbitSpeed = tag.orbitSpeed * Math.PI * 2;

        // Angular offset for each tag - distribute evenly around the orbit
        // 4 tags = 90° (π/2) apart from each other
        const angularOffset = (index / uiTags.length) * Math.PI * 2;

        // Calculate orbit angle: use accumulated progress for speed ramp effect
        // Add angular offset so each tag starts at a different position
        const orbitAngle =
            frame >= entryFrame
                ? accumulatedProgress * baseOrbitSpeed * 0.5 + angularOffset
                : angularOffset; // Start at offset position even before animation

        const tagX = width / 2 + Math.cos(orbitAngle) * tag.orbitRadius;
        const tagY = height / 2 + Math.sin(orbitAngle) * tag.orbitRadius * 0.5 + tag.yOffset;

        // Subtle pulse
        const pulse = 1 + Math.sin((frame / 30) * Math.PI) * 0.08;

        return (
            <div
                key={index}
                style={{
                    position: "absolute",
                    left: tagX,
                    top: tagY,
                    transform: `translate(-50%, -220%) scale(${tagScale * pulse})`,
                    zIndex: 100,
                }}
            >
                {/* Pin connector line */}
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "100%",
                        width: 3,
                        height: 60,
                        background: "linear-gradient(to bottom, #FF5A5F, transparent)",
                        transform: "translateX(-50%)",
                        opacity: tagScale,
                    }}
                />
                {/* Pin dot */}
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "calc(100% + 55px)",
                        width: 16,
                        height: 16,
                        backgroundColor: "#FF5A5F",
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        boxShadow: "0 0 0 4px rgba(255, 90, 95, 0.3), 0 0 0 8px rgba(255, 90, 95, 0.1)",
                        opacity: tagScale,
                    }}
                />
                <div
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        backdropFilter: "blur(10px)",
                        padding: "16px 28px",
                        borderRadius: 24,
                        boxShadow: "0 8px 30px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,90,95,0.3)",
                        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                        fontSize: 20,
                        fontWeight: "700",
                        color: "#1d1d1f",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        border: "2px solid rgba(255,90,95,0.2)",
                    }}
                >
                    {tag.icon && <span style={{ fontSize: 24 }}>{tag.icon}</span>}
                    {tag.text}
                </div>
            </div>
        );
    };

    // Floating house animation - very slow and subtle movement
    const floatY = Math.sin((frame / 120) * Math.PI * 2) * 5;
    const floatRotate = Math.sin((frame / 180) * Math.PI * 2) * 0.5;
    const floatScale = 1 + Math.sin((frame / 150) * Math.PI * 2) * 0.008;

    // Dynamic shadow that responds to floating - subtle
    const shadowBlur = 35 + Math.sin((frame / 120) * Math.PI * 2) * 5;
    const shadowY = 25 + Math.sin((frame / 120) * Math.PI * 2) * 3;
    const shadowOpacity = 0.2 - Math.sin((frame / 120) * Math.PI * 2) * 0.02;

    // Transition to Scene 5 - 3D Camera Zoom effect
    const transitionStart = 200;
    const transitionProgress =
        frame >= transitionStart
            ? interpolate(frame, [transitionStart, transitionStart + 40], [0, 1], {
                easing: Easing.inOut(Easing.cubic),
                extrapolateRight: "clamp",
            })
            : 0;

    // 3D camera zoom - scale up and slight perspective shift
    const cameraZoom = interpolate(transitionProgress, [0, 1], [1, 3], {
        extrapolateRight: "clamp",
    });

    const cameraY = interpolate(transitionProgress, [0, 1], [0, -200], {
        extrapolateRight: "clamp",
    });

    const sceneFade = interpolate(transitionProgress, [0.6, 1], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #F7F7F7 0%, #FFFFFF 100%)",
            }}
        >
            <div
                style={{
                    opacity: sceneFade,
                    transform: `scale(${cameraZoom}) translateY(${cameraY}px)`,
                    transformOrigin: "center center",
                }}
            >
                {/* House Image - centered */}
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -5%) scale(${transformProgress})`,
                        width: 1000,
                        height: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* The House Image with subtle floating animation */}
                    <Img
                        src={staticFile("assets/house.png")}
                        style={{
                            width: "85%",
                            height: "auto",
                            zIndex: 10,
                            filter: `drop-shadow(0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))`,
                            transform: `translateY(${floatY}px) rotate(${floatRotate}deg) scale(${floatScale})`,
                        }}
                    />
                </div>

                {/* UI Tags Overlay */}
                <AbsoluteFill>
                    {uiTags.map((tag, index) => renderUITag(tag, index))}
                </AbsoluteFill>
            </div>

            {/* 3D Wipe transition overlay - smooth white fade */}
            <AbsoluteFill
                style={{
                    background: `radial-gradient(circle at center, transparent ${(1 - transitionProgress) * 100}%, white ${(1 - transitionProgress) * 100 + 20}%)`,
                    opacity: transitionProgress > 0 ? 1 : 0,
                    pointerEvents: "none",
                }}
            />

            {/* Final white fade for clean transition */}
            <AbsoluteFill
                style={{
                    backgroundColor: "white",
                    opacity: interpolate(transitionProgress, [0.7, 1], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};
