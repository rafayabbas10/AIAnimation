import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
} from "remotion";
import React from "react";

interface CategoryCard {
    name: string;
    emoji: string;
}

const categories: CategoryCard[] = [
    { name: "Pools", emoji: "🏊" },
    { name: "Islands", emoji: "🏝️" },
    { name: "Boats", emoji: "⛵" },
    { name: "Caves", emoji: "🕳️" },
    { name: "Desert", emoji: "🏜️" },
    { name: "Ski", emoji: "⛷️" },
    { name: "Camping", emoji: "⛺" },
    { name: "Cabins", emoji: "🏕️" },
    { name: "Mansions", emoji: "🏰" },
    { name: "Beachfront", emoji: "🏖️" },
    { name: "Treehouses", emoji: "🌲" },
    { name: "Castles", emoji: "🏰" },
    { name: "Pools", emoji: "🏊" },
    { name: "Islands", emoji: "🏝️" },
    { name: "Boats", emoji: "⛵" },
    { name: "Arctic", emoji: "❄️" },
    { name: "Tropical", emoji: "🍍" },
    { name: "Vineyards", emoji: "🍇" },
    { name: "Countryside", emoji: "🐄" },
    { name: "Luxe", emoji: "💎" },
    { name: "Surfing", emoji: "🏄" },
    { name: "Golfing", emoji: "⛳" },
    { name: "A-frames", emoji: "🏘️" },
    { name: "Cycladic", emoji: "🏛️" },
    { name: "Earth homes", emoji: "🌍" },
];

export const Scene3UICarousel: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const phoneScale = 2.5;
    const phoneYOffset = 180;

    // Background gradient animation for dynamic white light movement
    const bgLightX = Math.sin((frame / 60) * Math.PI * 0.5) * 30;
    const bgLightY = Math.cos((frame / 60) * Math.PI * 0.3) * 20;

    // Scene entry fade (0-20)
    const entryFade = interpolate(frame, [0, 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Scene exit fade (last 20 frames)
    const exitFade = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const sceneOpacity = entryFade * exitFade;

    // Render carousel cards
    const renderCard = (card: CategoryCard, index: number) => {
        const cardSpacing = 400;
        const basePosition = index * cardSpacing;

        // Scrolling motion for the entire scene duration
        // We calculate total travel based on number of cards to make it consistent
        const totalTravel = categories.length * cardSpacing * 0.2; // Slower scroll for 75 frames
        const scrollProgress = interpolate(frame, [0, durationInFrames], [0, totalTravel], {
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            extrapolateRight: "clamp",
        });

        const x = scrollProgress + basePosition - 800;

        const centerX = width / 2;
        const distanceFromCenter = (x - centerX) / (width * 0.4);

        const yOffset = Math.abs(distanceFromCenter) * 100 + 250;

        const cardScale = interpolate(Math.abs(distanceFromCenter), [0, 1.2], [1.5, 0.8], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        const edgeFade = interpolate(Math.abs(distanceFromCenter), [1.2, 1.8], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        const blurAmount = interpolate(Math.abs(distanceFromCenter), [0, 1], [0, 4]);
        const isInFocus = Math.abs(distanceFromCenter) < 0.3;

        if (edgeFade <= 0.01) return null;

        return (
            <div
                key={index}
                style={{
                    position: "absolute",
                    left: x,
                    top: height / 2 + yOffset,
                    transform: `translate(-50%, -50%) scale(${cardScale})`,
                    opacity: edgeFade,
                    transformStyle: "preserve-3d",
                    zIndex: 2000 + Math.round((1 - Math.abs(distanceFromCenter)) * 100),
                    filter: isInFocus ? "none" : `blur(${blurAmount}px)`,
                }}
            >
                <div
                    style={{
                        width: 260,
                        height: 320,
                        backgroundColor: "white",
                        borderRadius: 24,
                        boxShadow: isInFocus
                            ? "0 30px 80px rgba(0,0,0,0.3)"
                            : "0 10px 30px rgba(0,0,0,0.1)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 20,
                        border: "1px solid #EBEBEB",
                    }}
                >
                    <div style={{ fontSize: 90 }}>{card.emoji}</div>
                    <div
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 26,
                            fontWeight: "700",
                            color: "#222",
                        }}
                    >
                        {card.name}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AbsoluteFill
            style={{
                background: `radial-gradient(circle at ${50 + bgLightX}% ${50 + bgLightY}%, #FFFFFF 0%, #F7F7F7 60%, #E8E8E8 100%)`,
                perspective: 1500,
                opacity: sceneOpacity,
            }}
        >
            {/* iPhone Mockup */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) translateY(${phoneYOffset}px) scale(${phoneScale})`,
                    zIndex: 1000,
                }}
            >
                <div
                    style={{
                        width: 280,
                        height: 560,
                        background: "rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(25px)",
                        borderRadius: 44,
                        padding: 12,
                        boxShadow: "0 40px 100px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            background: "rgba(255, 255, 255, 0.5)",
                            borderRadius: 34,
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                height: 44,
                                background: "rgba(247, 247, 247, 0.8)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "sans-serif",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#1d1d1f",
                            }}
                        >
                            9:41
                        </div>

                        <div
                            style={{
                                margin: "12px 16px",
                                padding: "10px 16px",
                                background: "white",
                                borderRadius: 24,
                                fontFamily: "sans-serif",
                                fontSize: 14,
                                color: "#717171",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            }}
                        >
                            🔍 Where to?
                        </div>

                        <div style={{ padding: "0 16px" }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#222", marginBottom: 4 }}>Explore</div>
                            <div style={{ fontSize: 14, color: "#717171" }}>Find amazing home stay</div>
                        </div>

                        <div
                            style={{
                                position: "absolute",
                                bottom: 25,
                                left: "50%",
                                transform: "translateX(-50%)",
                                fontSize: 24,
                                color: "#FF5A5F",
                                fontWeight: 800,
                                fontFamily: "sans-serif",
                            }}
                        >
                            airbnb
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ transformStyle: "preserve-3d", position: "relative", zIndex: 3000 }}>
                {categories.map((card, index) => renderCard(card, index))}
            </div>
        </AbsoluteFill>
    );
};
