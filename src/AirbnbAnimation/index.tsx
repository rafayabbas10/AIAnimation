import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Scene1PhotoSpread } from "./Scene1PhotoSpread";
import { Scene2GlobalSearch } from "./Scene2GlobalSearch";
import { Scene3UICarousel } from "./Scene3UICarousel";
import { Scene4IsometricReveal } from "./Scene4IsometricReveal";
import { Scene5Outro } from "./Scene5Outro";

export const AirbnbAnimation: React.FC = () => {
    const { fps } = useVideoConfig();

    // Scene durations (in seconds converted to frames)
    const scene1Duration = 3 * fps; // 0-3s
    const scene2Duration = 3 * fps; // 3-6s
    const scene3Duration = 75; // 360-435
    const scene4Duration = 2 * fps; // 435-555
    const scene5Duration = 3 * fps; // 555-735

    return (
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
            {/* Scene 1: Photo Spread Introduction (0-3s) */}
            <Sequence from={0} durationInFrames={scene1Duration}>
                <Scene1PhotoSpread />
            </Sequence>

            {/* Scene 2: Global Search (3-6s) */}
            <Sequence from={scene1Duration} durationInFrames={scene2Duration}>
                <Scene2GlobalSearch />
            </Sequence>

            {/* Scene 3: UI Carousel (6-9s) */}
            <Sequence
                from={scene1Duration + scene2Duration}
                durationInFrames={scene3Duration}
            >
                <Scene3UICarousel />
            </Sequence>

            {/* Scene 4: Isometric 3D Reveal (9-11s) */}
            <Sequence
                from={scene1Duration + scene2Duration + scene3Duration}
                durationInFrames={scene4Duration}
            >
                <Scene4IsometricReveal />
            </Sequence>

            {/* Scene 5: Outro (11-12s) */}
            <Sequence
                from={
                    scene1Duration + scene2Duration + scene3Duration + scene4Duration
                }
                durationInFrames={scene5Duration}
            >
                <Scene5Outro />
            </Sequence>
        </AbsoluteFill>
    );
};
