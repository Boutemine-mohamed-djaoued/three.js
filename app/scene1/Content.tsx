"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import stars from "../stars.jpg";
// name space
import * as THREE from "three";
import * as dat from "dat-gui";

const Content = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // alocate space to animate 3d stuff
    const renderer = new THREE.WebGLRenderer();
    // add shadow
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Set up the scene
    const scene = new THREE.Scene();

    // Set up the camera
    // there are two types of cameras
    // ortographic which takes 6 values : 4 borders , near and far limits ,used for 2d
    // percpective which takes 4 values : angel , aspect ratio , near  and far limits
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // add ability to change view
    const orbit = new OrbitControls(camera, renderer.domElement);

    // load the image as texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(stars.src, (texture) => {
      scene.background = texture;
    });
    // Add a simple shape
    // skeleton
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    // cover
    const material = new THREE.MeshStandardMaterial({ color: 0x00fff0 });
    // fusion
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);
    shape.position.y = 1.5;
    // shadow cast
    shape.castShadow = true;

    //add plan
    const planGerometry = new THREE.PlaneGeometry(10, 10);
    const planMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const plan = new THREE.Mesh(planGerometry, planMaterial);
    plan.position.set(0, -2, 0);
    scene.add(plan);
    // shadow recption
    plan.receiveShadow = true;

    // moving the camera far from the scene to actualy be able to see it
    camera.position.set(0, 3, 10);

    //orbit need to be updated every time the position of the camera changes
    orbit.update();

    //add light
    // ambient
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    scene.add(directionalLight);
    directionalLight.position.y = 5;
    directionalLight.castShadow = true;
    //spot light
    // const spotLight = new THREE.SpotLight(0xffffff);
    // scene.add(spotLight);
    // spotLight.position.y = 5;
    // spotLight.castShadow = true ;

    // add fog
    scene.fog = new THREE.Fog(0xffffff, 0, 50);

    // add gui
    const gui = new dat.GUI();
    const options = {
      x: -1.8,
      y: 0,
      z: 0,
    };
    gui.add(options, "x", -5, 5);
    gui.add(options, "y", -5, 5);
    gui.add(options, "z", -5, 5);

    // responseveness
    window.addEventListener("resize",()=>{
      camera.aspect = window.innerWidth / window.innerHeight ;
      // need to be called after changing aspect
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
    })

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      plan.rotation.set(options.x, options.y, options.z);
      shape.rotation.z += 0.015;
      shape.rotation.y += 0.015;
      // link the scene and the camera to the renderer
      renderer.render(scene, camera);
    };
    animate();

    // Clean up on component unmount
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} />;
};

export default Content;
