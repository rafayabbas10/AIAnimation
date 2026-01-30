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

interface PolaroidCard {
    image: string;
    location: string;
    xOffset: number;
    yOffset: number;
    zOffset: number;
    rotation: number;
    scale: number;
}

const photos: PolaroidCard[] = [
    { image: "bali.png", location: "Bali", xOffset: -550, yOffset: -280, zOffset: -100, rotation: -12, scale: 1.0 },
    { image: "egypt.png", location: "Egypt", xOffset: -280, yOffset: -120, zOffset: 50, rotation: -6, scale: 1.05 },
    { image: "paris.png", location: "Paris", xOffset: 0, yOffset: -250, zOffset: 100, rotation: 0, scale: 1.15 },
    { image: "tokyo.png", location: "Tokyo", xOffset: 280, yOffset: -120, zOffset: 50, rotation: 6, scale: 1.05 },
    { image: "nyc.png", location: "NYC", xOffset: 550, yOffset: -280, zOffset: -100, rotation: 12, scale: 1.0 },
];

export const Scene1PhotoSpread: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // === MEMOJI ANIMATION ===
    const memojiEntry = spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 100 },
    });

    const memojiY = interpolate(memojiEntry, [0, 1], [400, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Memoji entry scale (animates in from 0.6 to 1)
    const memojiEntryScale = interpolate(memojiEntry, [0, 1], [0.6, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Memoji shrink effect when cards start animating in (camera pull-back effect)
    const memojiShrinkStart = 35; // When first card starts animating
    const memojiShrinkEnd = 65;   // When all cards are in place
    const memojiShrinkProgress = interpolate(frame, [memojiShrinkStart, memojiShrinkEnd], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
    });
    const memojiShrinkScale = interpolate(memojiShrinkProgress, [0, 1], [1, 0.65]);

    // Combine entry scale with shrink scale
    const memojiScale = memojiEntryScale * memojiShrinkScale;

    const memojiOpacity = interpolate(frame, [0, 25], [0, 1], {
        extrapolateRight: "clamp",
    });

    const bobOffset =
        frame > 50 ? Math.sin(((frame - 50) / fps) * Math.PI * 1.3) * 10 : 0;

    // === GLOBE ANIMATION (Starts earlier now) ===
    const globeStartFrame = 120; // Starts earlier so it appears behind cards
    const globeEntry = spring({
        frame: frame - globeStartFrame,
        fps,
        config: { damping: 20, stiffness: 100 },
    });

    const globeScale = interpolate(globeEntry, [0, 1], [0.8, 1.2], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const globeOpacity = interpolate(frame, [globeStartFrame, globeStartFrame + 30], [0, 1], {
        extrapolateRight: "clamp",
    });

    const globeY = interpolate(globeEntry, [0, 1], [-4, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const globeRotation = (frame * 0.005) % (Math.PI * 2);

    // === POLAROID CARDS ANIMATION ===
    const renderPolaroid = (card: PolaroidCard, index: number) => {
        const startFrame = 35 + index * 6;

        const cardEntry = spring({
            frame: frame - startFrame,
            fps,
            config: { damping: 15, stiffness: 90 },
        });

        const cardScale = interpolate(cardEntry, [0, 1], [0, card.scale], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        const cardZ = interpolate(cardEntry, [0, 1], [-800, card.zOffset], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.exp),
        });

        const cardOpacity = interpolate(cardEntry, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

        const expandProgress = interpolate(cardEntry, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.exp),
        });

        const currentX = card.xOffset * expandProgress;
        const currentY = card.yOffset * expandProgress;

        const floatY =
            frame > startFrame + 50
                ? Math.sin(((frame - startFrame) / fps + index * 0.4) * Math.PI) * 8
                : 0;

        const floatRotation =
            frame > startFrame + 50
                ? Math.sin(((frame - startFrame) / fps + index * 0.6) * Math.PI * 0.7) * 2
                : 0;

        // === TRANSITION OUT (Frames 150-180) ===
        const transitionStart = 150;
        let transitionX = 0;
        let transitionY = 0;
        let transitionScale = 1;
        let transitionRotate = 0;
        let transitionOpacity = 1;

        if (frame >= transitionStart) {
            const transProgress = (frame - transitionStart) / 20;

            // Fly out away from center
            const flyOutDist = interpolate(transProgress, [0, 1], [0, 1000], { easing: Easing.in(Easing.exp) });
            const angle = Math.atan2(currentY, currentX);
            transitionX = Math.cos(angle) * flyOutDist;
            transitionY = Math.sin(angle) * flyOutDist;

            // Rotate randomly while flying out
            transitionRotate = interpolate(transProgress, [0, 1], [0, (index % 2 === 0 ? 90 : -90)]);

            // Fade out
            transitionOpacity = interpolate(transProgress, [0, 0.5], [1, 0]);
        }

        const finalX = currentX + transitionX;
        const finalY = currentY + floatY + transitionY;

        return (
            <div
                key={index}
                style={{
                    position: "absolute",
                    left: width / 2,
                    top: height / 2,
                    transform: `
            translate(-50%, -50%)
            translate3d(${finalX}px, ${finalY}px, ${cardZ}px)
            rotateY(${card.rotation + floatRotation + transitionRotate}deg)
            scale(${cardScale * transitionScale})
          `,
                    opacity: cardOpacity * transitionOpacity,
                    transformStyle: "preserve-3d",
                    zIndex: 200, // Cards above globe
                }}
            >
                <div
                    style={{
                        width: 240,
                        height: 280,
                        background: "rgba(255, 255, 255, 0.65)", // Glassmorphism base
                        backdropFilter: "blur(24px)", // Stronger blur
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid rgba(255, 255, 255, 0.5)", // Subtler border
                        padding: 16,
                        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2) inset", // Cleaner shadow
                        borderRadius: 16, // Softer corners
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Img
                        src={staticFile(`assets/${card.image}`)}
                        style={{
                            width: 208,
                            height: 208,
                            objectFit: "cover",
                            borderRadius: 12, // Matches outer radius
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // Subtle inner shadow
                        }}
                    />
                    <div
                        style={{
                            marginTop: 14,
                            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                            fontSize: 18,
                            textAlign: "center",
                            fontWeight: "600",
                            color: "#1a1a1a",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        {card.location}
                    </div>
                </div>
            </div>
        );
    };

    // === TEXT ANIMATION ===
    const textOpacity = interpolate(frame, [65, 85], [0, 1], {
        extrapolateRight: "clamp",
    });

    const textY = interpolate(frame, [65, 85], [25, 0], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.exp),
    });

    // Fade out text earlier than cards
    const textTransitionOpacity =
        frame >= 140 ? interpolate(frame, [140, 155], [1, 0]) : 1;

    // === CAMERA DOLLY OUT (Frames 150-180) ===
    const transitionStart = 150;
    const cameraScale =
        frame >= transitionStart
            ? interpolate(frame, [transitionStart, transitionStart + 30], [1, 0.8], {
                easing: Easing.out(Easing.exp),
            })
            : 1;

    // Memoji transitions out
    const memojiTransitionOpacity =
        frame >= 135 // Start fading slightly earlier
            ? interpolate(frame, [135, 150], [1, 0])
            : 1;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#F5F5F7",
                perspective: 1500,
                overflow: "hidden",
            }}
        >
            {/* Main scene container with camera dolly */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    transform: `scale(${cameraScale})`,
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Globe Layer - Appear Behind Cards */}
                {globeOpacity > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            zIndex: 10, // Behind cards (z=200)
                            opacity: globeOpacity,
                            transform: "scale(1.25)", // Make it larger in background
                        }}
                    >
                        <SimpleGlobe
                            rotation={globeRotation}
                            scale={globeScale}
                            opacity={1} // Handled by parent div
                            position={[0, globeY, 0]}
                        />
                    </div>
                )}

                {/* Polaroid Cards Layer */}
                <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", zIndex: 200 }}>
                    {photos.map((card, index) => renderPolaroid(card, index))}
                </div>

                {/* Memoji Character */}
                <div
                    style={{
                        position: "absolute",
                        left: width / 2,
                        top: height / 2 + 60,
                        transform: `
              translate(-50%, -50%)
              translateY(${memojiY + bobOffset}px)
              scale(${memojiScale})
            `,
                        opacity: memojiOpacity * memojiTransitionOpacity,
                        zIndex: 300, // In front of cards
                    }}
                >
                    <Img
                        src={staticFile("assets/memoji.png")}
                        style={{
                            width: 480,
                            height: 480,
                            filter: "drop-shadow(0 15px 40px rgba(0,0,0,0.2))",
                        }}
                    />
                </div>

                {/* Text */}
                <div
                    style={{
                        position: "absolute",
                        left: width / 2,
                        top: height / 2 + 300,
                        transform: `translate(-50%, -50%) translateY(${textY}px)`,
                        opacity: textOpacity * textTransitionOpacity,
                        zIndex: 301,
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                            fontSize: 38,
                            fontWeight: "700",
                            color: "#1d1d1f",
                            letterSpacing: "-0.03em",
                            textAlign: "center",
                        }}
                    >
                        Travelling today
                    </div>
                    <div
                        style={{
                            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                            fontSize: 38,
                            fontWeight: "300",
                            color: "#86868b",
                            letterSpacing: "-0.03em",
                            textAlign: "center",
                            marginTop: -8,
                        }}
                    >
                        is. hard.
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
