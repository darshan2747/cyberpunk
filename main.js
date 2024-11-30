// Import styles and Three.js
import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';

// 1. Create a Scene
const scene = new THREE.Scene();

// 2. Set up the Camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;



// Load HDRI environment map
new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    });

// 3. Load GLTF Model
const loader = new GLTFLoader();
let model;

loader.load(
    './DamagedHelmet.gltf',
    function (gltf) {
        model = gltf.scene;
        scene.add(model);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error occurred loading the model:', error);
    }
);
window.addEventListener("mousemove", (e) =>{
    if(model){
        const rotationX = (e.clientX / window.innerWidth - .5)* (Math.PI * .2);
        const rotationY = (e.clientY / window.innerHeight - .5)* (Math.PI * .2);
        gsap.to(model.rotation, {
            y: rotationX,
            x: rotationY,
            duration: 0.9,
            ease: "power2.out"
        });

    }
})
// 4. Create the Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Set up post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add RGB Shift effect
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0020 ;
composer.addPass(rgbShiftPass);


window.addEventListener("mousemove", (e) => {
    console.log(e.clientX/window.innerWidth, e.clientY/window.innerHeight);
});         
window.addEventListener("resize", () =>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
    composer.setSize(window.innerWidth,window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    
    composer.render();
}

animate();
