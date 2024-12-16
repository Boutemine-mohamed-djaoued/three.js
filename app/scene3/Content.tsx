"use client";

import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const Content = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const qwerty = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"];
  const linesOffset = [0, 2, 5];
  const [text, setText] = useState("Enter...");
  const [font, setFont] = useState<any>(null);
  const textMeshRef = useRef(null);
  useEffect(() => {
    console.log(text);
  }, [text]);
  useEffect(() => {
    if (!mountRef.current) return;

    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    let keys = new Array(26);
    let lines = 0;
    let keyPos = 0;
    const model = new URL("./key1.glb", import.meta.url);
    const assetsLoader = new GLTFLoader();
    assetsLoader.load(
      model.href,
      (gltf: any) => {
        for (let i = 0; i < 26; i++) {
          if (i == 10 || i == 19) {
            lines++;
            keyPos = 0;
          }
          keys[i] = gltf.scene.clone();
          keys[i].position.set(keyPos * 5 - 24 + linesOffset[lines], 0, lines * 5 - 4);
          keys[i].scale.set(0.2, 0.2, 0.2);
          keys[i].traverse((node: any) => {
            if (node.isMesh) {
              node.castShadow = true;
            }
          });
          scene.add(keys[i]);
          keyPos++;
        }
      },
      undefined,
      (err) => {
        console.log(err);
      }
    );

    const fontLoader = new FontLoader();
    let letters = new Array(26);

    fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (loadedFont) => {
      setFont(loadedFont);
    });

    fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
      lines = 0;
      keyPos = 0;
      for (let i = 0; i < 26; i++) {
        if (i == 10 || i == 19) {
          lines++;
          keyPos = 0;
        }
        const textGeometry = new TextGeometry(qwerty[i], {
          font: font,
          size: 1,
          height: 0.2,
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        letters[i] = new THREE.Mesh(textGeometry, textMaterial);
        letters[i].position.set(1.2 + keyPos * 5 - 24 + linesOffset[lines], 2, 0.5 + lines * 5 - 4);
        letters[i].rotation.x = -1.2;
        letters[i].castShadow = true;
        scene.add(letters[i]);
        keyPos++;
      }
      const textGeometry2 = new TextGeometry(text, {
        font: font,
        size: 1,
        height: 0.2,
      });
      const textMaterial2 = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const textMesh = new THREE.Mesh(textGeometry2, textMaterial2);
      textMesh.position.set(0, 10, -15);
      textMesh.scale.set(2, 2, 2);
      textMesh.castShadow = true;
      scene.add(textMesh);
    });

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const orbit = new OrbitControls(camera, renderer.domElement);

    // const geometry = new THREE.BoxGeometry(3, 3, 3);
    // const material = new THREE.MeshStandardMaterial({ color: 0x00fff0 });
    // const shape = new THREE.Mesh(geometry, material);
    // scene.add(shape);
    // shape.position.y = 1.5;
    // shape.castShadow = true;

    camera.position.set(0, 30, 20);

    orbit.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    ambientLight.castShadow = true;
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);
    directionalLight.position.y = 5;
    directionalLight.castShadow = true;

    const planGerometry = new THREE.PlaneGeometry(55, 20);
    const planMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plan = new THREE.Mesh(planGerometry, planMaterial);
    plan.position.set(0, 0, 0);
    scene.add(plan);
    plan.receiveShadow = true;
    plan.rotation.x = -0.5 * Math.PI;
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    document.addEventListener("keydown", (e) => {
      console.log(e.key);
      if (qwerty.includes(e.key.toUpperCase())) {
        const newText = text + e.key.toUpperCase();
        setText(newText);
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
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
