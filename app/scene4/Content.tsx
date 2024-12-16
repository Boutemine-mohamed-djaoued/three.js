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
  const [text, setText] = useState("");
  const [font, setFont] = useState<any>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const textMeshRef = useRef<THREE.Mesh | null>(null); // Ref to store the current text mesh
  let renderer: any = null;

  let animation = false;
  let key = -1;
  useEffect(() => {
    if (!mountRef.current) return;

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const newScene = new THREE.Scene(); // Create the scene
    setScene(newScene); // Set the scene state

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
          newScene.add(keys[i]);
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
      lines = 0;
      keyPos = 0;
      for (let i = 0; i < 26; i++) {
        if (i == 10 || i == 19) {
          lines++;
          keyPos = 0;
        }
        const textGeometry = new TextGeometry(qwerty[i], {
          font: loadedFont,
          size: 1,
          depth: 0.2,
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        letters[i] = new THREE.Mesh(textGeometry, textMaterial);
        letters[i].position.set(1.2 + keyPos * 5 - 24 + linesOffset[lines], 2, 0.5 + lines * 5 - 4);
        letters[i].rotation.x = -1.2;
        letters[i].castShadow = true;
        newScene.add(letters[i]); // Add to the scene
        keyPos++;
      }
    });

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const orbit = new OrbitControls(camera, renderer.domElement);

    camera.position.set(0, 30, 20);
    orbit.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    newScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    newScene.add(directionalLight);
    directionalLight.position.y = 5;
    directionalLight.castShadow = true;

    const planGerometry = new THREE.PlaneGeometry(55, 20);
    const planMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plan = new THREE.Mesh(planGerometry, planMaterial);
    plan.position.set(0, 0, 0);
    newScene.add(plan);
    plan.receiveShadow = true;
    plan.rotation.x = -0.5 * Math.PI;
    // const axesHelper = new THREE.AxesHelper(10);
    // newScene.add(axesHelper);

    let direction = 1;
    let amount = 0.05;
    let reachedDown = false;
    const animate = () => {
      requestAnimationFrame(animate);
      if (animation && key != -1) {
        keys[key].position.y -= direction * amount;
        if (Math.abs(keys[key].position.y) < 0.001) {
          keys[key].position.y = 0;
        }
        console.log({ direction, key, animation, reachedDown, pos: keys[key].position.y });
        console.log(keys[key].position.y < -1);
        console.log(keys[key].position.y >= -0.01);
        if (keys[key].position.y < -1 && !reachedDown) {
          direction = -1;
          reachedDown = true;
        }
        if (keys[key].position.y >= -0.01 && reachedDown) {
          direction = 1;
          keys[key].position.y = 0;
          key = -1;
          animation = false;
          reachedDown = false;
        }
      }
      renderer.render(newScene, camera);
    };
    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  document.addEventListener("keydown", (e) => {
    if (qwerty.includes(e.key.toUpperCase())) {
      const newText = text + e.key.toUpperCase();
      animation = true;
      key = qwerty.indexOf(e.key.toUpperCase());
      setText(newText);
    }
  });

  useEffect(() => {
    if (!font || !scene) return; // Ensure both font and scene are loaded

    // Remove the previous text mesh if it exists
    if (textMeshRef.current) {
      scene.remove(textMeshRef.current);
      textMeshRef.current.geometry.dispose(); // Clean up resources
      // textMeshRef.current.material.dispose();
    }

    const textGeometry2 = new TextGeometry(text, {
      font: font,
      size: 1,
      depth: 0.2,
    });
    const textMaterial2 = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry2, textMaterial2);
    textMesh.position.set(0, 10, -15);
    textMesh.scale.set(2, 2, 2);
    textMesh.castShadow = true;

    // Add the new text mesh to the scene and update the ref
    scene.add(textMesh);
    textMeshRef.current = textMesh; // Store the current text mesh in the ref
  }, [font, text, scene]);

  return <div ref={mountRef} />;
};

export default Content;
