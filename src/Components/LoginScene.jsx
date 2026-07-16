"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PALETTE = [0x7c5cff, 0x00e5ff, 0xff5cad, 0x5cffb0, 0xffd15c];

export default function LoginScene() {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        let width = mount.clientWidth;
        let height = mount.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0, 13);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        // ---- Lights: three colored point lights create the moving glow ----
        scene.add(new THREE.AmbientLight(0x30304a, 1.1));

        const light1 = new THREE.PointLight(0x7c5cff, 60, 40, 2);
        light1.position.set(6, 4, 6);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x00e5ff, 45, 40, 2);
        light2.position.set(-7, -3, 5);
        scene.add(light2);

        const light3 = new THREE.PointLight(0xff5cad, 40, 35, 2);
        light3.position.set(0, 6, -3);
        scene.add(light3);

        // ---- Floating geometric shapes ----
        const geometries = [
            new THREE.IcosahedronGeometry(1.35, 0),
            new THREE.TorusGeometry(1, 0.32, 32, 100),
            new THREE.OctahedronGeometry(1.05, 0),
            new THREE.TorusKnotGeometry(0.75, 0.22, 120, 16),
            new THREE.IcosahedronGeometry(0.65, 1),
            new THREE.DodecahedronGeometry(0.9, 0),
        ];

        const shapes = [];
        const shapeCount = 7;
        for (let i = 0; i < shapeCount; i++) {
            const geo = geometries[i % geometries.length];
            const mat = new THREE.MeshStandardMaterial({
                color: PALETTE[i % PALETTE.length],
                metalness: 0.75,
                roughness: 0.18,
                transparent: true,
                opacity: 0.88,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 9,
                (Math.random() - 0.5) * 6 - 2
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            mesh.userData.axis = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
            mesh.userData.spin = 0.15 + Math.random() * 0.35;
            mesh.userData.floatOffset = Math.random() * Math.PI * 2;
            mesh.userData.floatSpeed = 0.3 + Math.random() * 0.4;
            scene.add(mesh);
            shapes.push(mesh);
        }

        // ---- Starfield ----
        const starCount = 500;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 45;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 45;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.045,
            transparent: true,
            opacity: 0.55,
            sizeAttenuation: true,
        });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // ---- Mouse parallax ----
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", handleMouseMove);

        const clock = new THREE.Clock();
        let frameId;

        const animate = () => {
            const t = clock.getElapsedTime();

            if (!prefersReducedMotion) {
                shapes.forEach((mesh) => {
                    mesh.rotateOnAxis(mesh.userData.axis, 0.006 * mesh.userData.spin);
                    mesh.position.y +=
                        Math.sin(t * mesh.userData.floatSpeed + mesh.userData.floatOffset) *
                        0.0018;
                });

                light1.position.x = 6 + Math.sin(t * 0.4) * 2;
                light1.position.y = 4 + Math.cos(t * 0.3) * 2;
                light2.position.x = -7 + Math.cos(t * 0.35) * 2;
                light3.position.z = -3 + Math.sin(t * 0.25) * 2;

                stars.rotation.y = t * 0.008;

                camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.02;
                camera.position.y += (-mouseY * 1.4 - camera.position.y) * 0.02;
                camera.lookAt(0, 0, 0);
            }

            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            width = mount.clientWidth;
            height = mount.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            geometries.forEach((g) => g.dispose());
            shapes.forEach((m) => m.material.dispose());
            starGeo.dispose();
            starMat.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className="login-scene" aria-hidden="true" />;
}
