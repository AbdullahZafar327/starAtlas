import { GlobalsLanding } from "./compaitable";
import * as THREE from 'three'
import { CustomMaterial } from "./CustomMaterial";
import { TextSplitIntroAnimation } from "./textSplitIntroAnimation";
import { POIAnimationUpward } from "./PointOfInterest";
import gsap from 'gsap'

export class ChapterHandler{
    _menu; // Reference to the menu (e.g., for interactions or debugging)
    sortPoints = []; // Holds points in the scene that need to be sorted
    chapterWrapper = new THREE.Object3D(); // 3D Object for the entire chapter
    exploreAnchor = new THREE.Object3D(); // Anchor point for exploring this chapter
    _camera; // The camera used in the 3D scene
    _mainGroup; // The main 3D group containing all objects
    _cameraLookAtPoint; // The point where the camera is looking
    ringsMaterial; // Material for rings displayed in the scene
    rings = []; // Array of rings used in this chapter
    _exploreButton; // Button used to explore the chapter image gallery
    chapterIntroClass; // Controls animations for the chapter's introduction
    chapterPOITitle; // Titles for Points of Interest (POIs) in the chapter
    currentChapterScrollProgress = 0; // Tracks the progress of scrolling through this chapter
    chapterPOIsAnimation; // Points of Interest (POIs) in the chapter
    scrollTimeline; // Timeline controlling chapter's scroll animations
    _cameraWrapper; // Wrapper around the camera (to manipulate camera movements)
    duration = 1; // Duration for scroll animations
    scrollProgress = 0; // Progress of scrolling through the chapter
    SCROLL_LENGTH = 10; // The length of the scroll for the chapter
    CHAPTER_DISTANCE = GlobalsLanding.CHAPTER_DISTANCE; // Distance between chapters
    CHAPTER_OFFSET = 0; // Offset for the chapter's position
    main; // Main class or controller for the whole experience
    index; // Index of this chapter in the array of chapters
    galleryImages = []; // Images for the gallery in this chapter

    constructor(menu, camera, cameraWrapper, mainGroup, cameraLookAtPoint, exploreButton,chapterIntroMain, chapterPOITitle, index, thisInstance ,navLink){

        const exploreTitles = navLink.dataset.exploreTitles.split("|||");
        const exploreDescriptions = navLink.dataset.exploreDescriptions.split("|||");
        const exploreImages = navLink.dataset.exploreImages.split("|||");

        this.galleryImages = exploreImages.map((url,index)=>
            ({
            url,
            title: exploreTitles[index],
            description:exploreDescriptions[index]
        }))

        this.index = index;
        this._camera = camera
        this._menu = menu
        this._mainGroup = mainGroup
        this._cameraWrapper = cameraWrapper
        this._cameraLookAtPoint  = cameraLookAtPoint
        this._exploreButton = exploreButton
        this.chapterPOITitle = chapterPOITitle
        this.main = thisInstance

        this.chapterWrapper.name = "chapter" + index
        this.chapterWrapper.position.z = (index  - 1) * this.CHAPTER_DISTANCE
        this._mainGroup.add(this.chapterWrapper)

        this.ringsMaterial = new CustomMaterial(
            {
            focusNear: 0.01,
            focusFar: 113,
            focusFadeOutLength: 7,
            minBlur: 0.08,
            minOpacity: 0,
            maxOpacity: 0.55,
            maxBlur: 0.1,
        }, this._menu, "rings")
        
        //chapter intro text Animation
        this.chapterIntroClass = new TextSplitIntroAnimation(chapterIntroMain)
        this.chapterIntroClass.timeline.progress(1)

         // Create Points of Interest (POIs)
        this.chapterPOIsAnimation = this.chapterPOITitle.map((title) => new POIAnimationUpward(title));

        this.scrollTimeline  = gsap.timeline({paused: true})
        this.scrollTimeline.to(this,{
            currentChapterScrollProgress : 1,
            duration:this.duration,
            ease:'none'
        },0)

    }
    _loadDone(){
        this._sortPointsData()
    }
//sorting is being done for creating the correct order of renderer based on the depth of each object, 
    _sortPointsData(){
        if(this.sortPoints.length > 0){
            this.sortPoints.forEach((point)=>{
                (function(object,camera){
                    const matrix = new THREE.Matrix4();
                    const vector = new THREE.Vector3();
                    
                    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                    matrix.multiply(object.matrix)
    
                    const geometry = object.geometry;
                    let index = geometry.getIndex()
                    const positionArray = geometry.getAttribute("position").array 
                    const count = positionArray.length / 3 
    
    
    
                    if(index === null) {
                        const indexArray = new Float32Array(count)
                        for (let i = 0; i < count; i++) {
                            index = new THREE.BufferAttribute(indexArray,1)
                            geometry.setIndex(index)
                             
                        }
                    }
    
    
                    let depthArray = []
                    for (let i = 0; i < count; i++) {
                        vector.fromArray(positionArray,3 * i).applyMatrix4(matrix)
                        depthArray.push([vector.z,i])
                        
                    }
    
                    depthArray.sort((a,b) => a[0] - b[0])
                    const indexArray = index.array
                    for (let i = 0; i < count; i++) {
                       indexArray[i] = depthArray[i][1]
                    
                    }
                    geometry.index.needsUpdate = true
                })(point,this._camera)
                point.geometry = point.geometry.toNonIndexed()
            })

        }else{
           console.error("no points to sort")
        }
       
    }

    _raf(){
       this._sortPointsData()
    }

    _setActiveExploreItem(){
        if(this.main.currentExploreChapter !== this){
            this.exploreAnchor.name = `Explore Anchor- chapter ${this.index}`
            this.main.currentExploreChapter = this
            this.main.activeExploreAnchor = this.exploreAnchor;
        }
    }
}