import * as THREE from './node_modules/three/build/three.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(300, 300);
camera.aspect = 1; // square canvas
camera.updateProjectionMatrix(); // must update if aspect changes
document.getElementById('pillowBorder').appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff,5);
light.position.set(5, 5, 15);
scene.add(light);
scene.fog = new THREE.Fog(0xffffff, 14, 14); 
// Animation mixer
let mixer;

// Load model
const loader = new GLTFLoader();
let model;
loader.setPath(''); 

loader.load(
  '/model.glb',
  (gltf) => {
    model = gltf.scene;
    model.scale.set(0.36, 0.36, 0.36);
    model.position.z = -5;
    scene.add(model);

    
    console.log(gltf.animations);
    // ✅ Set up the animation mixer
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene);
    
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    
      console.log("Playing animations:", gltf.animations.map(a => a.name));
    } else {
      console.warn("No animations found in the GLB file.");
    }
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the model:', error);
  }
);

// Mouse handling
let mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Clock for animation
const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); // time since last frame

  // ✅ Update animation
  if (mixer) mixer.update(delta);

  if (model) {
    const maxRotation = 0.5;
    model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, mouse.x * maxRotation, 0.1);
    model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, -mouse.y * maxRotation, 0.1);
  }

  renderer.render(scene, camera);
}

animate();
