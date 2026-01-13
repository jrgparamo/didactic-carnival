// import * as THREE from 'three';

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xdddddd, 0.2); // Transparent background

document.body.appendChild( renderer.domElement );
//const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

camera.position.z = 50;

// Set the scene background color
// scene.background = new THREE.Color(0xdddddd);

// Add some lighting for GLTF models
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(5, 10, 7.5);
// directionalLight.position.set(1, 60, 1);
scene.add(directionalLight);

// Variable to store the model for scroll animation
let shoeModel = null;
let scrollY = 0;
let maxScrollY = 0;

// Function to update max scroll height
function updateMaxScroll() {
  maxScrollY = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  ) - window.innerHeight;
  console.log('Max scroll height:', maxScrollY);
}

// Add scroll event listener
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// Update max scroll on load and resize
window.addEventListener('load', updateMaxScroll);
window.addEventListener('resize', updateMaxScroll);
// Initial calculation
updateMaxScroll();

loader.load('new_balance_997/scene.gltf', function(gltf) {
  console.log('GLTF loaded successfully:', gltf);
  renderer.setAnimationLoop( animate );

  // Get the model and store it globally
  shoeModel = gltf.scene;

  // Check model size and position
  const box = new THREE.Box3().setFromObject(shoeModel);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  console.log('Model size:', size);
  console.log('Model center:', center);

  // Center the model
  shoeModel.position.x = 0;
  shoeModel.position.y = -10;
  shoeModel.position.z = 0;

  // Scale if too small or too large
  const maxSize = Math.max(size.x, size.y, size.z);
  if (maxSize < 0.1) {
      shoeModel.scale.setScalar(10); // Scale up if too small
      console.log('Model scaled up by 10x');
  } else if (maxSize > 10) {
      shoeModel.scale.setScalar(0.1); // Scale down if too large
      console.log('Model scaled down by 10x');
  }

  scene.add(shoeModel);

  function animate() {
    // Rotate model based on scroll position
    if (shoeModel && maxScrollY > 0) {
      // Calculate normalized scroll position (0 to 1)
      const scrollProgress = Math.min(scrollY / maxScrollY, 1);
      window.console.log('Scroll Progress:', scrollProgress);

      // Full rotation (2π radians = 360 degrees) when scrolled to bottom
      shoeModel.rotation.y = scrollProgress * Math.PI * 1.5;

      // Optional: Add some X rotation for more dynamic effect
      shoeModel.rotation.x = scrollProgress * Math.PI * 2;
      // shoeModel.rotation.z = scrollProgress * Math.PI * 2 * 0.3;

    }

    renderer.render( scene, camera, );
  }
}, function(progress) {
    console.log('Loading progress:', progress);
}, function(error) {
    console.error('Error loading GLTF:', error);
});


