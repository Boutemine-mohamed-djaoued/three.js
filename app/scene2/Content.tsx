"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

const Content = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const orbit = new OrbitControls(camera, renderer.domElement);

    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const material = new THREE.MeshStandardMaterial({ color: 0x00fff0 });
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);
    shape.position.y = 1.5;
    shape.castShadow = true;

    camera.position.set(0, 3, 10);

    orbit.update();

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    scene.add(directionalLight);
    directionalLight.position.y = 5;
    directionalLight.castShadow = true;

    const mouseP = new THREE.Vector2();
    window.addEventListener("mousemove", (e) => {
      mouseP.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseP.y = (e.clientX / window.innerHeight) * 2 - 1;
    });
    const rayCaster = new THREE.Raycaster();

    let num = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      rayCaster.setFromCamera(mouseP, camera);
      const intersects = rayCaster.intersectObjects(scene.children);
      for (let intersect of intersects) {
        if (intersect.object.id == shape.id) {
          console.log("hovering" + num);
          num++;
        }
      }
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} />;
};

export default Content;
