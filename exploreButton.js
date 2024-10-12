import * as THREE from 'three'
import gsap from 'gsap'

export class ExploreButton{
    position = new THREE.Vector3()
    container = document.querySelector(".ExploreButton")

    setX = gsap.quickSetter(this.container,"x","px")
    setY = gsap.quickSetter(this.container,"y","px")

    frustum = new THREE.Frustum()
    matrix = new THREE.Matrix4()
    sphere = new THREE.Sphere(this.position,6)
    _gallery;
    _main;

    


    

    constructor(gallery,main){
         this._gallery = gallery
         this._main = main;

         console.log(this._main)

         gsap.set(
            this.container,
            {
                opacity:0,
                force3D : true,
                visibility:"visible"
            }
         )

        this.container.addEventListener("click",this._clickHandler)
    }

    _updateScreenPosition(
//Arguments
       CurrentExploreAnchor,
       camera,
       width,
       height
    ){
           // Update the transformation matrix
           this.matrix.copy(camera.projectionMatrix);
           this.matrix.multiply(camera.matrixWorldInverse);
           this.frustum.setFromProjectionMatrix(this.matrix);
           // Set position from world matrix
           this.position.setFromMatrixPosition(CurrentExploreAnchor.matrixWorld);
   
           // Check if the sphere intersects with the frustum
           if (this.frustum.intersectsSphere(this.sphere)) {
               this.position.project(camera);
               // Adjust the position for screen coordinates
               this.position.x = this.position.x * width + width;
               this.position.y = -this.position.y * height + height;
               this.position.z = 0; // 2D projection, z-axis not needed
   
               // Set x and y positions using GSAP
               this.setX(this.position.x);
               this.setY(this.position.y);
           } else {
               // Move the button off-screen if not visible
               this.setX(-1e3);
               this.setY(-1e3);
           }
    }

    _clickHandler = (event) =>{
       event.preventDefault()
       // If the gallery is not visible, show it with images from the current chapter
       if(!this._gallery.visible){
        this._gallery._setGalleryItems(this._main.currentExploreChapter.galleryImages)
        this._gallery._show()
       }

       return false
    }
}