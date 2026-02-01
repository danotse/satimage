import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const TerrainViewer = ({
    imageSrc,
    maskSrc,
    showMask,
    maskOpacity = 0.5
}) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const controlsRef = useRef(null);
    const frameIdRef = useRef(null);

    // We keep references to the meshes to update them without full re-renders
    const planeMeshRef = useRef(null);
    const overlayMeshRef = useRef(null);

    // --- EFFECT 1: INITIALIZE SCENE (Runs once per mount) ---
    useEffect(() => {
        if (!mountRef.current) return;

        // Cleanup
        if (rendererRef.current) {
            rendererRef.current.dispose();
            mountRef.current.innerHTML = '';
        }

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);
        scene.fog = new THREE.FogExp2(0x050505, 0.02);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 12, 12);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);

        rendererRef.current = renderer;
        sceneRef.current = scene;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 2;
        controls.maxDistance = 50;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(10, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        scene.add(sunLight);

        // Animation Loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize Handler
        const handleResize = () => {
            if (!mountRef.current) return;
            const newWidth = mountRef.current.clientWidth;
            const newHeight = mountRef.current.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
            if (rendererRef.current) rendererRef.current.dispose();
            if (mountRef.current) mountRef.current.innerHTML = '';
            controls.dispose();
            scene.clear();
        };
    }, []);

    // --- EFFECT 2: LOAD TERRAIN & OVERLAY (Runs when imageSrc changes) ---
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene || !imageSrc) return;

        // Cleanup old meshes
        if (planeMeshRef.current) {
            scene.remove(planeMeshRef.current);
            planeMeshRef.current.geometry.dispose();
            planeMeshRef.current.material.dispose();
            planeMeshRef.current = null;
        }
        if (overlayMeshRef.current) {
            scene.remove(overlayMeshRef.current);
            overlayMeshRef.current.material.dispose(); // Geometry is shared or recreated
            overlayMeshRef.current = null;
        }

        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(imageSrc, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const imageAspect = texture.image.width / texture.image.height;
            const planeWidth = 15 * imageAspect;
            const planeHeight = 15;

            // Geometry (Shared high-res)
            const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 256, 256);

            // 1. BASE TERRAIN MATERIAL
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                displacementMap: texture, // Terrain shape
                displacementScale: 1.5,
                roughness: 0.8,
                metalness: 0.1,
                side: THREE.DoubleSide,
            });

            const plane = new THREE.Mesh(geometry, material);
            plane.rotation.x = -Math.PI / 2;
            plane.receiveShadow = true;
            plane.castShadow = true;

            scene.add(plane);
            planeMeshRef.current = plane;

            // 2. OVERLAY MESH
            // We create a second mesh with the SAME geometry and transformation.
            // This ensures the overlay "bends" exactly with the terrain.
            const overlayMaterial = new THREE.MeshStandardMaterial({
                color: 0x00ff00, // Bright green for irrigation
                transparent: true,
                opacity: 0, // Initially hidden until mask loads
                displacementMap: texture, // CRITICAL: Must use same displacement as base
                displacementScale: 1.5,
                side: THREE.DoubleSide,
                roughness: 1.0,
                metalness: 0.0,
                polygonOffset: true, // PREVENT Z-FIGHTING
                polygonOffsetFactor: -1, // Push towards camera slightly
                polygonOffsetUnits: -1
            });

            const overlayPlane = new THREE.Mesh(geometry, overlayMaterial);
            overlayPlane.rotation.x = -Math.PI / 2;
            // No shadow casting for the overlay

            scene.add(overlayPlane);
            overlayMeshRef.current = overlayPlane;

            // Center controls
            if (controlsRef.current) controlsRef.current.target.set(0, 0, 0);
        });

    }, [imageSrc]); // Only re-run if base image changes

    // --- EFFECT 3: HANDLE MASK & UI UPDATES (Runs when mask/UI props change) ---
    useEffect(() => {
        const overlayMesh = overlayMeshRef.current;
        if (!overlayMesh) return;

        // 1. Update Visibility & Opacity
        overlayMesh.visible = showMask;
        overlayMesh.material.opacity = showMask ? maskOpacity : 0;
        overlayMesh.material.needsUpdate = true;

        // 2. Load Mask Texture if provided and changed
        if (maskSrc && showMask) {
            new THREE.TextureLoader().load(maskSrc, (maskTexture) => {
                // Use the mask as the Alpha Map
                // White = Opaque, Black = Transparent
                // We want: White (irrigated) -> Visible Green.

                maskTexture.colorSpace = THREE.SRGBColorSpace;

                overlayMesh.material.alphaMap = maskTexture;
                overlayMesh.material.map = null; // Pure color overlay

                // If the mask is black/white, we need to ensure alpha works correctly.
                // Usually B/W masks are loaded as Red channel. 
                // StandardMaterial alphaMap reads the green channel.
                // But for a simple PNG, if it's Grayscale, it should work.

                overlayMesh.material.needsUpdate = true;
            });
        }
    }, [maskSrc, showMask, maskOpacity]);


    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#050505',
                cursor: 'grab'
            }}
            onMouseDown={(e) => e.target.style.cursor = 'grabbing'}
            onMouseUp={(e) => e.target.style.cursor = 'grab'}
        />
    );
};

export default TerrainViewer;