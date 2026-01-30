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

    // UI Tags Entry (Frames 50-80, staggered) - BIGGER PINS
    const renderUITag = (tag: UITag, index: number) => {
        const entryFrame = 50 + index * 10;
        const tagEntry = spring({
            frame: frame - entryFrame,
            fps,
            config: { damping: 12, stiffness: 100 },
        });

        const tagScale = interpolate(tagEntry, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        // Orbital motion
        const orbitAngle =
            frame >= entryFrame
                ? ((frame - entryFrame) / 60) * tag.orbitSpeed * Math.PI * 2
                : 0;

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
                    transform: `translate(-50%, -50%) scale(${tagScale * pulse})`,
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

    // Transition to Scene 5 (Frames 150-180)
    const liquidStart = 150;
    const liquidExplosion =
        frame >= liquidStart
            ? interpolate(frame, [liquidStart, liquidStart + 20], [0, 1], {
                easing: Easing.out(Easing.exp),
            })
            : 0;

    const sceneFade =
        frame >= liquidStart + 10
            ? interpolate(frame, [liquidStart + 10, liquidStart + 30], [1, 0])
            : 1;

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #F7F7F7 0%, #FFFFFF 100%)",
            }}
        >
            <div style={{ opacity: sceneFade }}>
                {/* Realistic House Asset on Island */}
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%) scale(${transformProgress})`,
                        width: 700,
                        height: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* The "Island" Base */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 150,
                            width: 600,
                            height: 250,
                            background: "radial-gradient(ellipse at center, #8EB859 0%, #6E9E44 70%, transparent 100%)",
                            borderRadius: "50%",
                            transform: "rotateX(60deg)",
                            boxShadow: "0 40px 100px rgba(0,0,0,0.15)",
                            opacity: transformProgress,
                        }}
                    />

                    {/* The House Image */}
                    <Img
                        src={staticFile("assets/house.png")}
                        style={{
                            width: "85%",
                            height: "auto",
                            zIndex: 10,
                            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.2))",
                            transform: "translateY(-40px)",
                        }}
                    />
                </div>

                {/* UI Tags Overlay */}
                <AbsoluteFill>
                    {uiTags.map((tag, index) => renderUITag(tag, index))}
                </AbsoluteFill>
            </div>

            {/* Liquid Explosion Effect */}
            {liquidExplosion > 0 && (
                <AbsoluteFill style={{ pointerEvents: "none" }}>
                    {[...Array(8)].map((_, i) => {
                        const angle = (i / 8) * Math.PI * 2;
                        const distance = liquidExplosion * 400;
                        const x = width / 2 + Math.cos(angle) * distance;
                        const y = height / 2 + Math.sin(angle) * distance;
                        const rotation = angle * (180 / Math.PI) + liquidExplosion * 360;

                        return (
                            <div
                                key={i}
                                style={{
                                    position: "absolute",
                                    left: x,
                                    top: y,
                                    transform: `translate(-50%, -50%) scale(${liquidExplosion * 2}) rotate(${rotation}deg)`,
                                    width: 100,
                                    height: 100,
                                    backgroundColor: "#FF5A5F",
                                    borderRadius: "50% 40% 60% 50%",
                                    opacity: 1 - liquidExplosion * 0.5,
                                }}
                            />
                        );
                    })}
                </AbsoluteFill>
            )}

            {/* White fade */}
            <AbsoluteFill
                style={{
                    backgroundColor: "white",
                    opacity: liquidExplosion > 0.7 ? (liquidExplosion - 0.7) / 0.3 : 0,
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};
