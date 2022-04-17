import '/src/css/style.css'
import * as THREE from 'three'
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/dracoloader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'



//Bouton Sound
self.soundEnabled = localStorage.getItem('soundEnabled') != "0";
const buttonSoundSelector = document.querySelector('.loading-screen__sound');
const displaySoundState = () => {
  if (self.soundEnabled) {
    buttonSoundSelector.classList.remove('loading-screen__sound--disabled');
  } else {
    buttonSoundSelector.classList.add('loading-screen__sound--disabled');
  }
}
displaySoundState();

buttonSoundSelector.onclick = () => {
  self.soundEnabled = !self.soundEnabled;
  localStorage.setItem('soundEnabled', self.soundEnabled ? "1" : "0");
  displaySoundState();
};

document.querySelector(".loading-screen__button").onclick = () => {
  self.loder;
  document.body.classList.add("started");
  setTimeout(() => {
    //self.video.muted = !self.soundEnabled;
    //self.video.play();
 }, 4200);
};
const loadingScreenTitleLoader = document.querySelector(".loading-screen__title--loader");
self.loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
      console.log('loaded');
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        const progressRatio = itemsLoaded / itemsTotal * 100;
        console.log(itemsLoaded, itemsTotal, progressRatio)
        loadingScreenTitleLoader.style.width = `${progressRatio}%`;
    }
);

console.log('resources loaded');

setTimeout(() => {
  document.body.classList.add("loaded");
}, 1000);



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()



// Load 
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const loader = new GLTFLoader(self.loadingManager);
loader.setDRACOLoader(dracoLoader);
loader.load("/model/scene.glb", function(gltf) {


  
  gltf.scene.traverse((child) =>
  {
    const point = points[child.name];
    if (point) {
      point.position = new THREE.Vector3(
        child.position.x + point.offset.x, 
        child.position.y + point.offset.y, 
        child.position.z + point.offset.z
      );
    }
    if(child instanceof THREE.Mesh)
    {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  })

console.log(points)
scene.add(gltf.scene);
animate();
})





// Scene
const fov = 30;
const aspect = canvas.clientWidth / canvas.clientHeight;
const near = 1;
const far = 1000;

//label
const raycaster = new THREE.Raycaster();
const points = {   
  'Activities' : {
    offset: new THREE.Vector3(-0.6, -0.33, -0.2),
    element: document.querySelector('.point--activities'),
    details: document.querySelector('.screen--activities'),
    visible: false,
  },
  'Certificate' : {
    offset: new THREE.Vector3(0, -0.3, 0.2),
    element: document.querySelector('.point--certificate'),
    details: document.querySelector('.screen--certificate'),
    visible: false,
  },
  'Contact' : {
    offset: new THREE.Vector3(0, 5, 0),
    element: document.querySelector('.point--contact'),
    details: document.querySelector('.screen--contact'),
    visible: false,
  },
  'CV' : {
    offset: new THREE.Vector3(0, -0.1, 0),
    element: document.querySelector('.point--cv'),
    details: document.querySelector('.screen--cv'),
    visible: false,
  },
  'Screen' : {
    offset: new THREE.Vector3(0, 0, 0.3),
    element: document.querySelector('.point--tvscreen'),
    details: document.querySelector('.screen--tvscreen'),
    visible: false,
  }
 };

 



// Camera
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(0, 0, -7);
scene.add(camera);



// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.render(scene, camera)
renderer.setPixelRatio((window.devicePixelRatio=2));  



//Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  //raycaster.setFromCamera(  camera);
}


// resize
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(sizes.width, sizes.height)

  
})


// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = true;
controls.enableZoom = true;
controls.maxDistance = 3;
controls.minDistance = 0;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;















