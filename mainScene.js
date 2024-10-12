import * as THREE from 'three';
import gsap from 'gsap'; 
import { ScrollTrigger, ScrollToPlugin } from 'gsap/all';
import { GUI } from 'lil-gui'; 
import { AssetManager } from './loadingManager';
import {  MouseMoveTracker } from './trackMouseMove';
import { CameraController } from './cameraController';
import { Globals, GlobalsLanding } from './compaitable';
import { createPostProcessingEffects } from './postProcessing';
import { GotoChapter } from './GotoChapter';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';
import { Cloud } from './Cloud';
import { CustomMaterial } from './CustomMaterial';
import { Chapter1 } from './chapter1';
import { MouseIntroHandler } from './MouseIntroHandler';
import { EyeIntroPortal } from './EyePortal';
import { ExploreButton } from './exploreButton';
import { Gallery } from './Gallery';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats.js'

class Ft {
// 1. Variables/Properties (State)
  _camera;                       // Main camera
  _scene;                        // Main scene
  _renderer;                     // WebGL renderer
  _clock;                        // Clock for animations
  _controls;
  stats;
  _mainGroup = new THREE.Group(); // Group to hold objects in the scene
  widthHalf;                     // Half of the canvas width
  heightHalf;                    // Half of the canvas height
  width;                         // Canvas width
  height;                        // Canvas height
  windowWidth;                   // Window width
  windowHeight;                  // Window height
  postEffects;                   // Post-processing effects
  cameraWrapper;                 // Wrapper for the camera
  cameraLookAtPoint = new THREE.Object3D(); // Object for the camera to look at
  _cameraLookAtVector = new THREE.Vector3(); // Vector to store camera's look-at point
  eye;                           // Eye model (handled in a separate class)
  landingEnterHitArea;           // The clickable area for landing
  spotLight;                     // SpotLight for lighting the scene
  dirLight;                      // Directional light for scene lighting
  ambientValue = 0;              // Ambient light value
  currentMasterScrollProgress = 0; // Current scroll progress
  landingSkipped = false;        // Flag for whether the landing is skipped
  chapterPOITitles = Array.from(document.querySelectorAll(".ChapterPOIs > div")); // Titles for chapters
  mouseMoveAmount = 0.2;         // How much the camera moves with the mouse
  mousePanAmount = 5;            // How much the camera pans
  activeExploreAnchor = null;    // Active anchor for exploration
  chapters = [];                 // List of chapters
  loadManager;                   // Handles loading assets
  introDollyZoom;                // Dolly zoom effect for intro animation
  renderEffects = true;          // Whether post-processing is enabled
  requestAnimationFrameID = null; // Store the animation loop ID
  scrollHeight = 0;              // Scroll height of the scene
  scrollTriggerReady = false;    // Whether the scroll trigger is ready
  scrollTrigger = null;          // GSAP ScrollTrigger for animations
  clusterCloud;
  exploreNav;
  gallery = new Gallery()
  exploreButton = new ExploreButton(this.gallery,this)
  chapterPositions = [];
  currentExploreChapter;
  USE_SCROLL_TIMER = CSS.supports("contain", "content");
  diamondMouseEnter;
  clickMouseEnter;
  SKIP_INTRO = new URLSearchParams(window.location.search).get(
    "skipIntro"
  );
  SKIP_LOAD_ANIMATION = new URLSearchParams(window.location.search).get(
    "skipLoadAni"
  );
  debugCamera;
  debugHelpers = [];
  DEBUG_MODE = true

  AppContainer = document.getElementById("App");
  ViewContainer = document.getElementById("ViewContainer");
  ScrollSpacer = document.getElementById("ScrollSpacer");

  isPortalInitialized = false

  dirLight;
  spotLight
  // ambientAudio = new Ct(); // `Ct` is audio controller class


// 2. Constructor
  constructor(container) {
    // Check if WebGL is available
    if (WebGL.isWebGL2Available()) {
      GlobalsLanding.DEBUG && (this.menu = new GUI())
      GlobalsLanding.MainScene = this
      this._initVariables(container);
      this._initThreeJS(); // Initialize Three.js components
      this._initializeGSAPAnimations()
      this._initChapters();
      this._animate()
      this._initEventListeners(); // Add visibility change listener
    } else {
      const errorMessage = WebGL.getWebGL2ErrorMessage();
      document.getElementById('TemplateLayer').children[0].appendChild(errorMessage);
    }
  }

  // Initialize variables
  _initVariables(container) {
    this.container = container; // The container for the 3D scene
    this._clock = new THREE.Clock(); // Track time for animations
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // this.ambientAudio = new AudioHandler(); // Manage ambient audio
    this.loadManager = new AssetManager(this._onAssetsLoaded.bind(this)); // Load assets like textures and models
    this.MouseMoveTracker = new MouseMoveTracker();
    this.exploreNav = new GotoChapter(this._gotoChapter())
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); // Initialize GSAP plugins
 
  }

  // Initialize Three.js components (camera, scene, renderer)
  _initThreeJS() {
    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initEnableDebug()
    this._initLoading()
    this._initClickToEnter()
    this._initPostProcessing();
    this._init3DObjects()
    this._initLights();

  }

  _initScene() {
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(15854305); // Set background color
    this._mainGroup.name = "3DMain_Group"
    this._scene.add(this._mainGroup); // Add the main group to the scene
  }
  _initCamera() {
    this._camera = new THREE.PerspectiveCamera(65, this.width / this.height, 1, 200);
    this.cameraWrapper = new THREE.Object3D();
    this.cameraWrapper.name = "Camera-Wrapper"
    this.cameraWrapper.add(this._camera); // Add camera to wrapper (to animate the camera)
    this._scene.add(this.cameraWrapper);
    this._scene.add(this.cameraLookAtPoint)
    this.cameraLookAtPoint.name = 'Camera-LookAt-Point'
    this.introDollyZoom = new CameraController(this._camera,this.cameraLookAtPoint)
  }

  _initRenderer() {
    this._renderer = new THREE.WebGLRenderer({
      antialias: !this.renderEffects,
      stencil: !this.renderEffects,
      depth: !this.renderEffects,
      powerPreference: 'high-performance',
    });
    this._renderer.setPixelRatio(GlobalsLanding.RENDERER_PIXEL_RATIO);
    this._renderer.setSize(this.width, this.height);
    this.container.appendChild(this._renderer.domElement); // Append renderer to DOM
    GlobalsLanding.RENDERER_HEIGHT = this.height
  }

  _initEnableDebug(){
    GlobalsLanding.DEBUG && this._setupDebug()
  }

  _initPostProcessing() {
    this.postEffects = new createPostProcessingEffects(
        this._scene,
        this._camera,
        this._renderer,
        this.menu,
        this._clock,
        this.renderEffects
    );
  }

  _initLights() {
    this.dirLight = new THREE.DirectionalLight(16777215, 0.49);
    this.dirLight.position.set(0, 1, -10);
    this._scene.add(this.dirLight);
    this.dirLight.name = "Directional-Light"

    this.spotLight = new THREE.SpotLight(16777215, 1, 1);
    this.spotLight.intensity = 1.853
    this.spotLight.penumbra = 0
    this.spotLight.angle = 1.571;
    this.spotLight.decay = -178
    this.spotLight.power = 5.58
    this.spotLight.position.set(2.27, 2.24, -305);
    this._scene.add(this.spotLight);
    this.spotLight.name = "Spot-Light"
  }

  _init3DObjects(){
    this.clusterCloud = new Cloud(
      this.loadManager,
      this._mainGroup,
      2,
      this.menu
    )
  }

  _initLoading() {
    CustomMaterial.texCircleSolid = this.loadManager._loadTexture("/textures/circle_solid_32x32_premultiplied.png" )
    CustomMaterial.texCircleAlpha = this.loadManager._loadTexture("/textures/circle_alpha_32x32_premultiplied.png")

    CustomMaterial.texCircleSolid.premultiplyAlpha = GlobalsLanding.PREMULTIPLY_ALPHA
    CustomMaterial.texCircleAlpha.premultiplyAlpha = GlobalsLanding.PREMULTIPLY_ALPHA
  }

  _initClickToEnter(){
     this.landingEnterHitArea = document.querySelector(".LandingEnter-hitArea");

     this.landingEnterHitArea.addEventListener("click", (event) => {
      if(this.isPortalInitialized) this._enterLanding();
    },false);
     

     this.diamondMouseEnter = new MouseIntroHandler(
         this.MouseMoveTracker,
         document.querySelector(".LandingEnter-largeDiamond"),
         0.15,
         this.landingEnterHitArea
     )

      this.clickMouseEnter = new MouseIntroHandler(
          this.MouseMoveTracker,
          document.querySelector(".LandingEnter"),
          0.3,
          this.landingEnterHitArea
      )

  

     
  }

  _enterLanding(){
    console.log("button clicked and entered")
         // If ROTATING_BANNERS exists, destroy it; otherwise, fade out the start screen trailer
        if (window.ROTATING_BANNERS) {
          window.ROTATING_BANNERS.selfDestroy();
        } else {
          gsap.to("#StickyOverlay", { autoAlpha: 0, duration: 0.4 });
        }

        // Disable landing entry click area and set its display to none
        this.landingEnterHitArea.removeEventListener("click", this._enterLanding,false);
        this.landingEnterHitArea.style.display = "none";
        this.landingSkipped = true;

        // Disable mouse interactions
        this.clickMouseEnter.disable();
        this.diamondMouseEnter.disable();

        gsap.to(".LandingMenuIntroWrapper",{autoAlpha: 0, duration:0.4})
        const firstChapter = this.chapters[0]


        const timeline = gsap.timeline({paused:true, onComplete : this._enableScroll})
        
        if (this.eye && typeof this.eye._getScrollInAnimation === 'function') {
            timeline.add(this.eye._getScrollInAnimation());
        } else {
            console.error("EyeIntroPortal instance or method not available.");
        }
   
       

        if(this.USE_SCROLL_TIMER){

          timeline.to(".ScrollTimer",{ opacity : 1,
             duration : 2
          },3)

        }


        timeline.to(this.introDollyZoom,{
          duration:2,
          ease:"power3.inOut",
          onUpdate:()=> this.introDollyZoom._update(15,-25)
        },3).to(
          this.cameraWrapper.position,{
               z:8,
               ease:"power4.inOut",
               duration:4,
          },3
        ).to(this._camera,
          {
            zoom: 1,
            ease:"power3.inOut",
            duration:2
          },3
        ).to(this, { 
          mousePanAmount : 2,
          mouseMoveAmount:2 , 
          ease : "power3.inOut",
          duration:2
        }).to(
          ".ScrollHelpIndicator",{
            opacity:1,
            duration:1,
          },6
        ).from(
          firstChapter.ringsMaterial.uniforms.maxOpacity,{
            value : 0 ,
            duration : 2
          },3
        )

        timeline.play();
          if (this.SKIP_INTRO) {
            timeline.timeScale(10);
          }
  }


  _enableScroll(){
    if(this.ScrollSpacer){
      this.ScrollSpacer.style.display = "block"
      this.ScrollSpacer.height = (100 * this.scrollHeight) + "%"
  
      this.ScrollSpacer.style.display = "none"
      this.ScrollSpacer.offsetHeight;
      this.ScrollSpacer.style.display = "block"
  
      this.scrollTrigger.refresh()
      this.scrollTriggerReady = true
    }
  }



  _initializeGSAPAnimations() {
    // Check for sticky behavior
    if (GlobalsLanding.USE_STICKY && !GlobalsLanding.IS_SAFARI) {
      this.AppContainer.style.zIndex = "-1";
    } else {
      document.documentElement.classList.add("non-sticky");
    }

    // Set ScrollTrigger defaults or handle non-sticky behavior
    if (GlobalsLanding.USE_STICKY) {
      ScrollTrigger.defaults({
        scroller: this.AppContainer,
        trigger: this.ScrollSpacer,
      });
    }

    // Set initial properties for elements
    gsap.set(".ChapterPOIs", { autoAlpha: 0 });
    gsap.set(".BottomBar-right", { autoAlpha: 0 });
    gsap.set(this.chapterPOITitles, { opacity: 0, force3D: true });

    // Scroll timer logic
    if (!this.USE_SCROLL_TIMER) {
      document.querySelector(".ScrollTimer")?.remove();
    }

    // Animate ambient value
    gsap.to(this, {
      ambientValue: 1,
      duration: 4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }

  _gotoChapter(chapterNum){
       if(chapterNum < this.chapters.length){ //check if the chapter Num is within the chapter range
           this.currentChapter = chapterNum === 0 ? 0 : this.chapterPositions[chapterNum] * this.height + 0.8 * this.height;

       } else{
           this.currentChapter = this.scrollHeight * this.height;
       }


       if(GlobalsLanding.USE_STICKY){
        gsap.to(this.AppContainer,{scrollTo: { y : this.currentChapter} , duration  :1})
       }else{
        gsap.to(window,{scrollTo: { y : this.currentChapter} , duration  :1})
       }

  }

  // Event listeners for window resizing and visibility changes
  _initEventListeners() {
    window.addEventListener('resize', () => this._onWindowResize());
    // document.addEventListener('visibilitychange', () => {
    //   if (document.hidden) {
    //     this._clock.stop();
    //     this.ambientAudio.stop();
    //   } else {
    //     this._clock.start();
    //     this.ambientAudio.resume();
    //   }
    // });
  }

  // Called when all assets are loaded
  _onAssetsLoaded() {
    console.log("all assets are loaded successfully")
    this._startScene();
  }

  // Called when the window is resized
  _onWindowResize = (forceUpdate = false) => {
    // Store the current width and height of the window for later comparison
    const previousWidth = this.width;
    const previousHeight = this.height;
  
    // Update the current window dimensions
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  
    // Get the new dimensions of the view container (which holds the scene)
    this.width = this.ViewContainer.clientWidth;
    this.height = this.ViewContainer.clientHeight;
  
    // Update the global renderer height variable
    GlobalsLanding.RENDERER_HEIGHT = this.height;
  
    // Check if the window size has changed or if a forced update is required
    if (previousWidth !== this.width || previousHeight !== this.height || forceUpdate === true) {
      // Update the camera's aspect ratio based on the new width and height
      this._camera.aspect = this.width / this.height;
  
      // Adjust the camera zoom based on the aspect ratio, but only if the landing has not been skipped and the aspect ratio is wide enough
      if (!this.landingSkipped && this._camera.aspect >= 1.9) {
        this._camera.zoom = this._camera.aspect - 1.9 + 1 + 0.15; // Adjust zoom for wide aspect ratios
      } else {
        this._camera.zoom = 1; // Default zoom
      }
  
      // Update the camera's projection matrix to apply the new zoom and aspect ratio
      this._camera.updateProjectionMatrix();
  
      // Store half the width and height for future calculations (e.g., centering)
      this.widthHalf = this.width / 2;
      this.heightHalf = this.height / 2;
  
      // Update the renderer size to match the new window dimensions
      this._renderer.setSize(this.width, this.height);
  
      // Update the post-processing effect composer size
      this.postEffects._composer.setSize(this.width, this.height);
  
      // Update any mouse-related tracking for the new window size
      this.MouseMoveTracker._resize();
  
      // Check if the scroll trigger has been initialized and is ready to use
      if (this.scrollTriggerReady) {
        // Save the current scroll progress (between 0 and 1)
        const scrollProgress = this.scrollTrigger.progress;
  
        // Use a small delay (1ms) before recalculating scroll behavior to ensure the UI updates properly
        setTimeout(() => {
          // Recalculate the maximum scroll distance and reset the scroll position
          this.scrollTrigger.scroll(
            scrollProgress * ScrollTrigger.maxScroll(this.scrollTrigger.scroller)
          );
  
          // Update the scroll animation to match the new window size
          this.scrollTrigger.getTween().progress(1); // Ensure the tween progress is updated
          ScrollTrigger.update(); // Update all scroll triggers
          this.scrollTrigger.refresh(); // Refresh to account for size changes
          ScrollTrigger.update(); // Second update after refresh
  
          // Ensure the scroll position is reset correctly based on the updated window size
          this.scrollTrigger.scroll(
            scrollProgress * ScrollTrigger.maxScroll(this.scrollTrigger.scroller)
          );
  
          // Force the scroll animation progress to 100% (end state)
          this.scrollTrigger.getTween().progress(1);
        }, 1); // Small timeout to let the browser settle before recalculating
      }
    }
  };

  

  // Start the main 3D scene and add initial objects
  _startScene() {
    this._camera.position.z = -305
    this._camera.fov = 65
    this._onWindowResize(true)
    this.chapters.forEach((chapter)=> {
      chapter._loadDone()
      console.log(chapter)
    })
    this.activeExploreAnchor = this.chapters[0].exploreAnchor

    GlobalsLanding.DEBUG && this._setupDebugControls()

    this._initSceneObjects(); // Add objects to the scene
    this._playLoadDoneIntroAnimation()
  }

  // Add objects to the scene
  _initSceneObjects() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    this._mainGroup.add(sphere); // Add a red sphere to the scene
  }

  // Initialize chapters (interactive scenes or sections)
  _initChapters() {
    const chaptersData = document.querySelectorAll(".ChapterIntro")
    const chapterNavLinks = document.body.querySelectorAll(".ExploreNav a")

    let chapter1 = new Chapter1(
      this.menu,
      this._camera,
      this.cameraWrapper,
      this._mainGroup,
      this.cameraLookAtPoint,
      this.exploreButton,
      chaptersData[0],
      this.chapterPOITitles.splice(0,2),
      1,
      this,
      chapterNavLinks[0]
    )

    this.chapters.push(chapter1)
    this.loadManager._setChapters(this.chapters)
    this._initIntroPortal()
    this.loadManager._startLoading()
  }

  _initIntroPortal(){
    this.eye = new EyeIntroPortal(
      this._scene,
      this.postEffects,
      this.menu,
      this.loadManager
    )

    this.isPortalInitialized = true
  }

  _playLoadDoneIntroAnimation(){
         this._setupScrollTimeline()
         // Forcefully set the chapter 0's intro animation to its final state
          this.chapters[0].chapterIntroClass.timeline.progress(1);

          // Create a new GSAP timeline (paused by default) with easing and delay
          let introTimeline = gsap.timeline({
              paused: true,       // Starts paused so we can control when to play
              ease: "power4.inOut", // Smooth easing for animations
              delay: 0,            // No delay before starting the animation
              onComplete: () => {  // Callback when the intro animation completes
                  // Remove the loading screen element after the animation
                  document.getElementById("Loading").remove()
                   

                  // If the user has set SKIP_INTRO, proceed to the next phase quickly
                  if (this.SKIP_INTRO) {
                      setTimeout(this._enterLanding, 100);
                  }
              }
          });

          // Add the intro animation for the "eye" element starting at time 0
          introTimeline.add(this.eye._getIntroAnimation(), 0);

          // Animate the camera's zoom to increase by 2 over 3 seconds
          introTimeline.from(
              this._camera,
              {
                  zoom: this._camera.zoom + 2,  // Increase zoom level
                  duration: 3,                  // Over 3 seconds
                  ease: "power3.inOut"          // Smooth easing for the zoom animation
              },
              0 // Start at time 0
          );

          // Move the camera's position along the z-axis from -300 to -305 over 4 seconds
          introTimeline.fromTo(
              this._camera.position,
              { z: -300 },         // Starting position
              { z: -305, duration: 4 }, // End position, taking 4 seconds
              0 // Start at time 0
          );

          // At the 3-second mark, enable interaction with the diamond and click events
          introTimeline.call(
              () => {
                  this.diamondMouseEnter.enable();  // Enable mouse enter interactions for diamond
                  this.clickMouseEnter.enable();    // Enable mouse enter interactions for clicking
              },
              null, // No parameters needed for the callback
              3     // Trigger this call at 3 seconds into the timeline
          );

          // Set the landing hit area to visible at the 4-second mark]
          introTimeline.set(this.landingEnterHitArea, { visibility: "visible" }, 4);

          // If the user wants to skip the load animation or intro, speed up the timeline 10x
          if (this.SKIP_LOAD_ANIMATION || this.SKIP_INTRO) {
              introTimeline.timeScale(10);  // Play the timeline 10 times faster
          }

          // At 1.3 seconds, add a callback to switch the page theme to dark mode
          introTimeline.add(() => {
              document.documentElement.classList.add("darkMenu");  // Add dark mode class to the page
          }, 1.3);

          // Add the 'loaded' class to the body once the intro timeline is defined
          document.body.classList.add("loaded");

          // Finally, play the intro timeline animation
          introTimeline.play();
  }


  _setupScrollTimeline(){
       console.log(this._scene.children)
     console.log("triggered")
     const scrubDuration  = GlobalsLanding.SCRUB_DURATION

     this.chapters.forEach((chapter) => this.scrollHeight += chapter.SCROLL_LENGTH)

     if(this.USE_SCROLL_TIMER){
        const timeElement = document.querySelector(".ScrollTimer-time")

        let timerData = { time : parseFloat(timeElement.textContent)}

        gsap.to(
          timerData,
          {
            scrollTrigger :{
              scrub : scrubDuration ,
              start: "0%",
              end: "1000%"
            },
            time: "+=1001",
            duration:1,
            ease:"none",
            onUpdate:() =>{
              timeElement.textContent = timerData.time.toFixed(3)
            }
          }
        )
     }


     const timeline = gsap.timeline(
      {
        scrollTrigger : {
          scrub: scrubDuration,
          start:"0%",
          end: "100%"
        }
      }
     )

    
     timeline.to(
      this,
      {
        currentMasterScrollProgress : 1,
        duration:1,
        ease:"none"
      },0
     )

     this.scrollTrigger = timeline.scrollTrigger

    let chapterStartTime = 0
    let chapterRatios = []
    let totalChapterScroll = 0

    this.chapters.forEach((chapter,index)=>{
      const chapterTimeline = chapter._setupScrollTimeline()

      const chapterScrollRatio = chapter.SCROLL_LENGTH / this.scrollHeight

      this.chapterPositions.push(totalChapterScroll)
      totalChapterScroll += chapter.SCROLL_LENGTH

      chapterRatios.push(chapterScrollRatio)

      timeline.to(
        chapterTimeline,
        {
          progress : 1,
          duration: chapterScrollRatio,
          ease:"none"
        },
        chapterStartTime - chapter.CHAPTER_OFFSET
      )

      chapterStartTime += chapterStartTime
    })

    console.log(this.exploreNav)


  }

  _animate = () =>{
    this.requestAnimationFrameID = requestAnimationFrame(this._animate.bind(this))

    if(GlobalsLanding.DEBUG){
      // this.stats.being()
    }

    this.MouseMoveTracker._raf()

    if (GlobalsLanding.VIDEO_OPEN && Globals.MENU_OPEN) {
      //TODO
      // Update the camera position based on mouse movement, using smoothed values
      
    }

    this.cameraLookAtPoint.position.x = this.mousePanAmount * ( -1 * this.MouseMoveTracker.pos.xEased)
    this.cameraLookAtPoint.position.y = this.mousePanAmount * ( -1 * this.MouseMoveTracker.pos.yEased)

    this.cameraLookAtPoint.getWorldPosition(this._cameraLookAtVector)

    this._camera.lookAt(this._cameraLookAtVector)

    this._camera.updateProjectionMatrix()
    this._camera.updateMatrixWorld()

    if(this.activeExploreAnchor){
      this.exploreButton._updateScreenPosition(
           this.activeExploreAnchor,
           this._camera,
           this.widthHalf,
           this.heightHalf
      )
    }

    this._renderScene();
  }

  // Animate function (called on every frame)
  // animate() {
  //   requestAnimationFrame(() => this.animate());
  //   this._updateScene(); // Update scene and camera based on input
  //   this._renderScene(); // Render the scene
  // }

  // Render the scene using Three.js or post-processing effects
  _renderScene() {
    if(this.DEBUG_MODE){
      this._controls.update()
      this.debugHelpers.forEach((helper) => helper.update())
      this._renderer.render(this._scene,this.debugCamera)
    }
    
    if(this.postEffects.isEnabled){
      this.postEffects.render()
    }else{
      this._renderer.render(this._scene, this._camera);
    }

    GlobalsLanding.DEBUG && this.stats.end()
  }

  _setupDebugControls(){
          // Initialize a flag to keep track of whether the debug camera helper is added
        let debugCameraEnabled = true;

        // Listen for keyup events on the window
        window.addEventListener("keyup", (event) => {
          
          // Toggle "hide-debug" class when 'h' key is pressed
          if (event.key === "h") {
            document.body.classList.toggle("hide-debug");
          }
          
          // Toggle camera debug mode when 'd' key is pressed
          if (event.key === "d") {
            
            // If debugCameraEnabled is true, add camera helper and point for debug mode
            if (debugCameraEnabled) {
              debugCameraEnabled = false;  // Disable further adding of camera helper

              // Create a CameraHelper for the main camera
              const cameraHelper = new THREE.CameraHelper(this._camera);

              // Add the camera helper to the scene and debug helpers array
              this.debugHelpers.push(cameraHelper);
              this._scene.add(cameraHelper);

              // Set the debug camera position to match the main camera's position
              this.debugCamera.position.copy(this._camera.position);

              // Add a point to look at, represented by a small red sphere
              const lookAtPoint = new THREE.Mesh(
                new THREE.SphereGeometry(1),  // Sphere with radius of 1
                new THREE.MeshBasicMaterial({ color: 0xff0000 })  // Red color material
              );
              this.cameraLookAtPoint.add(lookAtPoint);  // Add the sphere to the lookAtPoint
            }

            // Toggle the debug mode state
            this.DEBUG_MODE = !this.DEBUG_MODE;

            // If DEBUG_MODE is true, add the "camera-debug" class to the body, otherwise remove it
            if (this.DEBUG_MODE) {
              document.body.classList.add("camera-debug");
            } else {
              document.body.classList.remove("camera-debug");
            }

            // Enable or disable camera controls based on debug mode
            this._controls.enabled = this.DEBUG_MODE;
          }
      });  
   }

   _setupDebug() {
    // Add an FPS (Frames Per Second) counter to the document body
    document.body.classList.add("show-fps");
  
    // Create a new PerspectiveCamera for debugging, with a 45-degree field of view, 
    // aspect ratio based on width/height, and view distance between 1 unit and 8000 units
    this.debugCamera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 8000);
  
    // Add a control slider in the menu to adjust the Field of View (FOV) of the main camera (_camera)
    this.menu.add(this._camera, "fov")
      .min(0)                // Minimum FOV value
      .max(179.99)           // Maximum FOV value (almost 180 degrees)
      .step(0.1)             // Step size for fine control
      .onChange((value) => {  // On FOV change
        this._camera.fov = value;              // Set the new FOV
        this._camera.updateProjectionMatrix(); // Update the camera's projection matrix after change
      });
  
    // Add another control slider to adjust the 'far' clipping plane distance of the main camera
    this.menu.add(this._camera, "far")
      .min(0)               // Minimum distance (can see objects very close)
      .max(200)             // Maximum distance (can see objects far away)
      .step(0.1)            // Step size for fine control
      .onChange((value) => { // On 'far' plane distance change
        this._camera.far = value;              // Set the new distance for far clipping plane
        this._camera.updateProjectionMatrix(); // Update the projection matrix after change
      });
  
    // Set the initial position of the debug camera (300 units along the z-axis)
    this.debugCamera.position.z = 300;
  
    // Initialize OrbitControls for the debug camera, allowing you to move the camera around
    // _renderer.domElement specifies the DOM element to listen for input events
    this._controls = new OrbitControls(this.debugCamera, this._renderer.domElement);
    
    // Set the target (point where the camera looks at) to the center of the scene (0, 0, 0)
    this._controls.target.set(0, 0, 0);
  
    // Set the speed at which zoom happens in OrbitControls (smaller value means slower zoom)
    this._controls.zoomSpeed = 0.1;
  
    // Enable or disable controls based on the current debug mode (DEBUG_MODE)
    this._controls.enabled = this.DEBUG_MODE;
  
    // Initialize performance stats (usually an FPS counter) and add it to the document body
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  
    // Close the menu (perhaps for cleaner UI after setting up debug mode)
    this.menu.close();
  
    // Make the THREE.js library and the scene globally accessible via the browser console
    window.THREE = THREE;
    window.scene = this._scene;
  }

  kill = () =>{
    cancelAnimationFrame(this.requestAnimationFrameID)
  }
  
}


const container = document.getElementById('ViewContainer');
new Ft(container);


