import '/src/css/style.css'
import * as THREE from 'three'
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/dracoloader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


import gsap from 'gsap'


import Stats from 'stats.js'
import * as dat from 'dat.gui'


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
console.log(points);

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
  
  'Contact' : {
    offset: new THREE.Vector3(0, -0.1, 0),
    element: document.querySelector('.point--contact'),
    details: document.querySelector('.screen--contact'),
    visible: false,
  }
  
}
 



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
const defaultControlsPosition = new THREE.Vector3(0, 0, 0);

const controls = new OrbitControls(camera, canvas);
controls.target.set(defaultControlsPosition.x, defaultControlsPosition.y, defaultControlsPosition.z);

controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = true;
controls.enableZoom = true;
controls.maxDistance = 3;
controls.minDistance = 0;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;

controls.keys = {
  LEFT: 0, //left arrow
  UP: 0, // up arrow
  RIGHT: 0, // right arrow
  BOTTOM: 0 // down arrow
}

document.body.classList.add('camera-moving');
gsap.to(camera.position, {
  duration: 4,
  x: 0,
  y: 0,
  z: -7,
  delay: 2.4,
  onUpdate: () => {
    controls.target.set(defaultControlsPosition.x, defaultControlsPosition.y, defaultControlsPosition.z);
  },
  onComplete: () => {
    document.body.classList.remove('camera-moving');
  },
});




// Debug
if (window.location.hash == "#dev") {
  const gui = new dat.GUI()
  this.gui = gui;

  const stats = new Stats()
  this.stats = stats;
  stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom)
  stats.dom.style.right = '0';
  stats.dom.style.left = '';
  stats.dom.style.bottom = '0';
  stats.dom.style.top = '';
}

/*
    ** User Click
    */

    const camToSave = {};
    let currentPoint;
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('mousemove', (event) =>
    {
        mouseMove(event.clientX, event.clientY)
    });

    renderer.domElement.addEventListener('touchstart', (event) =>
    {
      mouseMove(event.touches[0].clientX, event.touches[0].clientY);
    });

    const mouseMove = (x, y) => {
      mouse.x = x / sizes.width * 2 - 1;
      mouse.y = - (y / sizes.height) * 2 + 1;
    }

    for(const key in points)
    {
      const point = points[key];
      point.element.addEventListener('pointerdown', (event) => {
        currentPoint = point;
        camToSave.position = camera.position.clone();
        camToSave.quaternion = camera.quaternion.clone();
        let triggeredVisibilityDetails = false;
      document.body.classList.add('camera-moving');
        let tween = gsap.to(controls.target, {
          duration: 1.2,
          x: point.position.x,
          y: point.position.y,
          z: point.position.z,
          delay: 0,
          onUpdate: () => {
            if (!triggeredVisibilityDetails && tween.progress() > 0.5) {
              triggeredVisibilityDetails = true;
              document.body.classList.add("details")
              point.details.classList.add("visible");
            }
          },
          onComplete: () => {
            document.body.classList.remove('camera-moving');
          }
        });
      });
    }
    
    const closeDetailsPanel = () => {
      camToSave.resetPosition = true;
      document.body.classList.remove("details");
      currentPoint.details.classList.remove("visible");
      currentPoint = null;
      document.body.classList.add('camera-moving');
      gsap.to(controls.target, {
        duration: 1.2,
        x: defaultControlsPosition.x,
        y: defaultControlsPosition.y,
        z: defaultControlsPosition.z,
        delay: 0,
        onComplete: () => {
          document.body.classList.remove('camera-moving');
        }
      });
      gsap.to(camera.position, {
        duration: 1.2,
        x: camToSave.position.x,
        y: camToSave.position.y,
        z: camToSave.position.z,
        delay: 0,
        onUpdate: function() {
        }
      });
    };

    document.querySelectorAll('.screen__close').forEach(closeButton => {
      closeButton.addEventListener('pointerdown', closeDetailsPanel);
    });

    let isHoveringComputerScreen = false;

    renderer.domElement.addEventListener('pointerdown', () => {
      if (isHoveringComputerScreen && self.video.paused) {
          self.video.play(); 
      }
    });

    const setVisibilityForPoint = (point, visible) => {
      if (visible && !point.visible) {
        point.element.classList.add('visible');
      }
      if (!visible && point.visible) {
        point.element.classList.remove('visible');
      }
      point.visible = visible;
    }
/**
     * Animate
     */
 const clock = new THREE.Clock();
 let previousTime = 0;
 const tick = () => {
   if (this.stats) {
     this.begin();
   }
   const elapsedTime = clock.getElapsedTime();
   const deltaTime = elapsedTime - previousTime;
   previousTime = elapsedTime;

   controls.update();

   // Go through each point
   for(const key in points)
   {
     const point = points[key];
     const screenPosition = point.position.clone();
     screenPosition.project(camera);

     const translateX = screenPosition.x * sizes.width * 0.5;
     const translateY = - screenPosition.y * sizes.height * 0.5;
     point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
     
     // Check if point is visible before raycasting
     let frustum = new THREE.Frustum();
     frustum.setFromProjectionMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
     if (!frustum.containsPoint(point.position)) {
       setVisibilityForPoint(point, false);
       continue ;
     }

     raycaster.setFromCamera(screenPosition, camera);
     const intersects = raycaster.intersectObjects(scene.children, true);
     if(intersects.length === 0)
     {
       setVisibilityForPoint(point, true);
     }
     else
     {
       const intersectionDistance = intersects[0].distance;
       const pointDistance = point.position.distanceTo(camera.position);
       if(intersectionDistance < pointDistance)
       {
         setVisibilityForPoint(point, false);
       }
       else
       {
         setVisibilityForPoint(point, true);
       }
     }

     raycaster.setFromCamera(mouse, camera);
     const intersectsComputer = raycaster.intersectObjects([self.computerObject]);
     if (intersectsComputer.length) {
       isHoveringComputerScreen = true;
     } else {
       isHoveringComputerScreen = false;
     }
   }

   // Render
   effectComposer.render();

   if (this.stats) {
    this.stats.end();
   }
   // Call tick again on the next frame
   window.requestAnimationFrame(tick);
 }

 tick();
 console.log(renderer.info);