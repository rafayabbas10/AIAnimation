import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";
import { staticFile } from "remotion";

interface RealisticEarthProps {
    rotation: number;
    scale: number;
    opacity: number;
    position?: [number, number, number];
}

export const RealisticEarth: React.FC<RealisticEarthProps> = ({
    rotation,
    scale,
    opacity,
    position = [0, 0, 0],
}) => {
    // Load the OBJ model
    const obj = useLoader(
        OBJLoader,
        staticFile("assets/models/earth/earth.obj")
    );

    // Load all texture maps
    const colorMap = useLoader(
        THREE.TextureLoader,
        staticFile("assets/models/earth/earth_color.jpg")
    );
    const bumpMap = useLoader(
        THREE.TextureLoader,
        staticFile("assets/models/earth/earth_bump.jpg")
    );
    const specMap = useLoader(
        THREE.TextureLoader,
        staticFile("assets/models/earth/earth_spec.png")
    );
    const nightMap = useLoader(
        THREE.TextureLoader,
        staticFile("assets/models/earth/earth_night.jpg")
    );
    const cloudsMap = useLoader(
        THREE.TextureLoader,
        staticFile("assets/models/earth/earth_clouds.png")
    );

    // Create material with all maps
    const earthMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            map: colorMap,
            bumpMap: bumpMap,
            bumpScale: 0.05,
            roughnessMap: specMap,
            roughness: 0.7,
            metalness: 0.1,
            emissiveMap: nightMap,
            emissive: new THREE.Color(0xffff88),
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: opacity,
        });
    }, [colorMap, bumpMap, specMap, nightMap, opacity]);

    // Cloud layer material
    const cloudMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            map: cloudsMap,
            transparent: true,
            opacity: opacity * 0.6,
            depthWrite: false,
        });
    }, [cloudsMap, opacity]);

    // Clone the loaded object and apply materials
    const earthMesh = useMemo(() => {
        const clonedObj = obj.clone();
        clonedObj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = earthMaterial;
            }
        });
        return clonedObj;
    }, [obj, earthMaterial]);

    return (
        <group position={position} scale={scale}>
            {/* Earth with textures */}
            <primitive object={earthMesh} rotation={[0.2, rotation, 0]} />

            {/* Cloud layer - slightly larger sphere */}
            <mesh rotation={[0.2, rotation * 1.05, 0]} scale={1.01}>
                <sphereGeometry args={[1, 64, 64]} />
                <primitive object={cloudMaterial} attach="material" />
            </mesh>

            {/* Atmosphere glow */}
            <mesh scale={1.03}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color="#60a5fa"
                    transparent
                    opacity={opacity * 0.1}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};
