import './styles.css';
import * as THREE from 'three';
import { animate, inView } from 'motion'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const sneakerTag = document.querySelector('section.sneaker');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000, 0) // Transparent background

// Set the scene background color
// scene.background = new THREE.Color(0xdddddd);

sneakerTag.appendChild( renderer.domElement );
// const controls = new OrbitControls( camera, renderer.domElement );
const gltfLoader = new GLTFLoader();

camera.position.z = 60;
camera.position.x = -10;
camera.position.y = 0;

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

// Set starting rotation to show left side of the model
const startingRotationY = Math.PI / 2; // 90 degrees to show right side
const startingRotationX = 0;

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

// const loaderBG = new THREE.TextureLoader();
// loaderBG.load('/images/BBCBG.png', function(texture) {
//   scene.background = texture;
// });
animate('header', { x: -900, opacity: 0 })
// animate('section.content', { opacity: 0 })
animate('header',
  {
    x: [-900, 0],
    opacity: [0, 1],
  },
  { duration: 1, delay: 1 },
)

// inView('section.content', (info) => {
//   animate(info.target, { opacity: 1 }, { duration: 1, delay: 1 })
// })

function animateModel() {
  // Rotate model based on scroll position
  if (shoeModel && maxScrollY > 0) {
    // Calculate normalized scroll position (0 to 1)
    const scrollProgress = Math.min(scrollY / maxScrollY, 1);
    window.console.log('Scroll Progress:', scrollProgress);

    // Rotate from right side (π/2) to left side (-π/2)
    // Total rotation needed: -π/2 - π/2 = -π
    shoeModel.rotation.y = startingRotationY + (scrollProgress * (-Math.PI));

    // Keep X rotation minimal to avoid showing top/bottom of shoe
    shoeModel.rotation.x = startingRotationX + (scrollProgress * Math.PI * 2);
    // shoeModel.rotation.z = scrollProgress * Math.PI * 2 * 0.3;
    
    // Move model down the page as user scrolls
    // Start at y: -10, end at y: -40 (bottom of viewport)
    shoeModel.position.y = -10 + (scrollProgress * -30);
    shoeModel.position.x = -10 + (scrollProgress * 30);
  }

  renderer.render( scene, camera, );
}
// Load Model
gltfLoader.load('new_balance_997/scene.gltf', function(gltf) {
  console.log('GLTF loaded successfully:', gltf);


  renderer.setAnimationLoop( animateModel );

  // Get the model and store it globally
  shoeModel = gltf.scene;

  // Check model size and position
  const box = new THREE.Box3().setFromObject(shoeModel);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  console.log('Model size:', size);
  console.log('Model center:', center);

  // Center the model
  shoeModel.position.x = 10;
  shoeModel.position.y = 0 - 10;
  shoeModel.position.z = 0;

  // Set initial rotation to show left side
  shoeModel.rotation.y = startingRotationY;
  shoeModel.rotation.x = startingRotationX;

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
}, function(progress) {
    console.log('Loading progress:', progress);
}, function(error) {
    console.error('Error loading GLTF:', error);
});