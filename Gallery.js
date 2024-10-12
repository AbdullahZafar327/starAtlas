import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable';
import { GlobalsLanding } from './compaitable';


gsap.registerPlugin(Draggable)

export class Gallery{
    items; // Array of gallery items
    container; // Main container for the gallery
    imageContainer; // Container for images
    imageContainerInner; // Inner container for scrolling images
    title; // Title element
    descriptionWrapper; // Wrapper for description
    description; // Description element
    closeButton; // Close button
    navButtons; // Navigation buttons
    jumpNavContainer; // Container for jump navigation
    visible = false; // Visibility state of the gallery
    draggable; // Draggable instance
    width = 0; // Width of the container
    animation; // Animation instance
    wrap; // Wrap function for snapping
    snapX; // Function for snapping X position
    progressWrap = gsap.utils.wrap(0, 1); // Utility for wrapping progress
    wrapWidth = 0; // Total width for scrolling
    proxy; // Proxy element for dragging
    slides = []; // Array of slide elements
    slideAnimation = gsap.to({}, {}); // GSAP animation instance
    slideDuration = 0.75; // Duration of slide animation
    currSnapIndex = 0; // Current index of the snap position
    currSnapX = 0; // Current snap position X
    totalSlides = 0; // Total number of slides
    jumpNavContainerAnchors = []; // Array for jump nav links

    constructor(){
         // Initialize elements
         this.container = document.getElementById("LandingGallery");
         this.imageContainer = this.container.querySelector(".LandingGallery-images");
         this.imageContainerInner = this.imageContainer.querySelector(".LandingGallery-imagesInner");
         this.title = this.container.querySelector(".LandingGallery-description h3");
         this.descriptionWrapper = this.container.querySelector(".LandingGallery-descriptionWrapper");
         this.description = this.container.querySelector(".LandingGallery-description p");
         this.closeButton = this.container.querySelector(".LandingGallery-close");
         this.navButtons = this.container.querySelectorAll(".LandingGallery-nav");
         this.jumpNavContainer = this.container.querySelector(".LandingGallery-jumpNav");

         this.closeButton.addEventListener("click",this._closeClickHandler)
         this.proxy = document.createElement("div")
         window.addEventListener("resize",this._handleResize)
         // Setup draggable functionality
         this.draggable = new Draggable(
            this.proxy,
            {
                trigger: GlobalsLanding.IS_ANDROID ? this.imageContainer : this.container,
                inertia:true,
                onPress: this._onPress,
                onRelease : this._onRelease,
                onDrag : this._updateProgress,
                onThrowUpdate: this._updateProgress,
                onThrowComplete:() => this._toggleCaption(true,true),
                snap: {
                    x : (position) =>{
                        this.currSnapX = this.snapX(position)
                        this.currSnapIndex  = this._getSnapIndex(this.currSnapX)
                        return this.currSnapX
                    }
                }
            })
       // Navigation buttons setup
       this.navButtons[0].addEventListener("click", (e) => {
        e.preventDefault();
        this._killDragThrow(e);
        this._animateSlides(1); // Next slide
         });
       this.navButtons[1].addEventListener("click", (e) => {
        e.preventDefault();
        this._killDragThrow(e);
        this._animateSlides(-1); // Previous slide
         });

    }

    _setGalleryItems(newItems) {
        // Check if the new items are different from the current ones
        if (this.items !== newItems) {
      
          //set:Update the items with the new set
          this.items = newItems;
      
          //Empty: Remove all existing slides (clear the gallery)
          this.slides.forEach((slide) => this.imageContainerInner.removeChild(slide));
      
          //Empty: Remove all navigation anchors
          this.jumpNavContainerAnchors.forEach((anchor) =>
            this.jumpNavContainer.removeChild(anchor)
          );
      
          // Clear the jump navigation array
          this.jumpNavContainerAnchors = [];
      
          //Now Fill: Map over the new items and create slides and anchors for each one
          this.slides = this.items.map((item, index) => {
            
            // Create an image element for each item
            const img = document.createElement("img");
      
            // Once the image loads, add a 'loaded' class to it
            img.onload = () => {
              img.classList.add("loaded");
            };
      
            // Set the sizes attribute for responsive images
            img.sizes = "100vw";
      
            // Determine the image format (either webp or jpg)
            const format = Globals.WEBP_SUPPORTED ? "webp" : "jpg";
      
            // Set the image srcset (different image sizes for responsive loading)
            img.srcset = `
              ${item.url}?w=2000&h=2000&q=80&fm=${format} 1000w,
              ${item.url}?w=4000&h=2880&q=80&fm=${format} 4000w
            `;
      
            // Position the image horizontally based on its index
            gsap.set(img, { xPercent: 100 * index });
      
            // Add the image to the container
            this.imageContainerInner.appendChild(img);
      
            // Create a navigation anchor element for this slide
            const anchor = document.createElement("a");
            anchor.href = "#slide-" + index; // Set the anchor href to point to the corresponding slide
            anchor.slideIndex = index; // Assign the slide index to the anchor
            
            // Add the 'active' class to the first anchor
            if (index === 0) {
              anchor.classList.add("active");
            }
      
            // Add click event listener to each anchor
            anchor.addEventListener("click", this._jumpAnchorClickHandler);
      
            // Store the anchor in the jumpNavContainerAnchors array
            this.jumpNavContainerAnchors.push(anchor);
      
            // Add the anchor to the navigation container
            this.jumpNavContainer.appendChild(anchor);
      
            // Return the created image element (for further manipulation if needed)
            return img;
          });
      
          // Reset the snap index and position
          this.currSnapIndex = 0;
          this.currSnapX = 0;
      
          // Set the total number of slides based on the new items
          this.totalSlides = this.items.length;
      
          // If there are items, update the title and description for the first slide
          if (this.totalSlides > 0) {
            this.title.textContent = this.items[0].title;
            this.description.textContent = this.items[0].description;
          }
      
          // Wrap the slide positions within a certain range to allow for looping behavior
          this.wrap = gsap.utils.wrap(-100, 100 * (this.totalSlides - 1));
      
          // Reset the proxy element's x position to 0
          gsap.set(this.proxy, { x: 0 });
      
          // If there is more than one slide, enable dragging and set up infinite looping animation
          if (this.totalSlides > 1) {
            this.draggable.enable(); // Enable dragging
      
            // Set up the main animation for moving between slides (looped animation)
            this.animation = gsap.to(this.slides, {
              xPercent: "+=" + 100 * this.slides.length, // Moves by 100% per slide
              duration: 1, // Duration of the animation
              ease: "none", // No easing (linear movement)
              paused: true, // Initially paused
              repeat: -1, // Infinite repeat (for looping)
              modifiers: {
                xPercent: this.wrap, // Apply wrapping behavior for looping
              },
            });
      
            // Remove 'single' class from the container if there are multiple slides
            this.container.classList.remove("single");
          } else {
            // If there's only one slide, disable dragging and set an empty animation
            this.container.classList.add("single");
            this.animation = gsap.to({}, {}); // Empty animation
            this.draggable.disable(); // Disable dragging
          }
      
          // Update the size of elements after setting the new items
          this._updateSize();
      
          // Update the draggable after resizing
          this._updateDraggable();
      
          // Update the progress of the animation
          this._updateProgress();
        }
      }

      _jumpAnchorClickHandler = (event) =>{
         event.preventDefault()
         const { currentIndex } = event.currentTarget
         this._killDragThrow(event)
         const currentPosition = gsap.getProperty(this.proxy,"x")
         this.slideAnimation.kill()

         // Calculate how many slides need to be moved, based on the current and target slide indices
         const skippedSlides = this._getSnapIndex(currentPosition,false) - currentIndex
         // Calculate the new x position for the proxy (the snap position)
         const newPosition = this.snapX(currentPosition + skippedSlides * this.width )
         // Set the current snap index to the newly calculated snap index
         this.currSnapIndex = this._getSnapIndex(newPosition)
         // Start a new animation to move the proxy to the calculated snap position
         this.slideAnimation = gsap.to(
            this.proxy,
            {
                x : newPosition,
                ease:"power3.inOut",
                duration: this.slideDuration,
                onUpdate : () => this._updateProgress
            }
         )

         return false // Return false to prevent any further action
      }

    _closeClickHandler(e){
         e.preventDefault()
         
         if(this.visible){
            this._hide()
         }

         return false
    }

   // Function to handle resizing of the gallery (called when the window resizes)
   _handleResize = () => {
    // If there are items in the gallery (this.items exists), proceed
    if (this.items) {
      
      // If there is an active draggable tween (animation), ensure its progress is set to 100%
      if (this.draggable.tween) {
        this.draggable.tween.progress(1); // Complete the draggable animation (ensures the current animation ends)
      }
  
      // Trigger the animation for slides with a 0 delay (instantly refreshes or resets the slides)
      this._animateSlides(0);
  
      // If a slide animation is in progress, set its progress to 100% to ensure it completes
      this.slideAnimation.progress(1);
    }
  
    // Update the container's width by checking the current width of the container element
    this.width = this.container.clientWidth;
  
    // Set up snapping behavior based on the new width (makes sure slides snap into place as you drag or resize)
    this.snapX = gsap.utils.snap(this.width);
  
    // Call the function that updates the size-related properties of the gallery
    this._updateSize();
  };
  
  // Function to update the size of elements and adjust positions after resizing
  _updateSize = () => {
    // Get the current position (x) of the proxy element relative to the total width of the wrapped slides
    // If no value exists, use 0 as a fallback
    var currentPosition = gsap.getProperty(this.proxy, "x") / this.wrapWidth || 0;
  
    // Calculate the total width of all the slides combined (each slide has a width, so multiply by totalSlides)
    this.wrapWidth = this.width * this.totalSlides;
  
    // Update the x position of the proxy element based on the new total width of the slides
    // This ensures that the proxy's position is adjusted relative to the new wrap width
    gsap.set(this.proxy, { x: currentPosition * this.wrapWidth });
  };

   //   Updates the draggable instance after changes in slides or layout.
  _updateDraggable = () =>{
    // Stop (kill) any active slide animation
    this.slideAnimation.kill();
    
    // Update the draggable object to adjust its behavior after changes
    this.draggable.update();
    
    // Update the progress of the main animation (we will look at this in the next function)
    this._updateProgress();      
    }

  _animateSlides(direction){
    let currentX = gsap.getProperty(this.proxy, "x"); // Get the current X position of the proxy
    if (this.slideAnimation.isActive()) {
        currentX = this.slideAnimation.vars.x; // If an animation is running, get the target X position
    }
    this.slideAnimation.kill(); // Kill any running slide animations
    const nextPosition = this.snapX(currentX + this.width * direction); // Calculate the new position to snap to
    this.currSnapIndex = this._getSnapIndex(nextPosition); // Get the new slide index
    this.slideAnimation = gsap.to(this.proxy, { // Animate to the new position
        x: nextPosition,
        duration: this.slideDuration, // Slide duration
        onUpdate: this._updateProgress, // Update progress during the slide
    });
   }

    // Get current slide index based on X position
    _getSnapIndex(positionX , updateNav  = true){

        // Remove the "active" class from the current navigation dot (if updateNav is true)
        if (updateNav) {
            this.jumpNavContainerAnchors[this.currSnapIndex].classList.remove("active");
        }
        // Calculate the new index based on the X position (position in the gallery)
        let index = Math.round((1 - this.progressWrap(positionX / this.wrapWidth)) * this.totalSlides);
        index = index === this.totalSlides ? 0 : index; // If index is equal to the total number of slides, set it to 0
        if (updateNav) {
            this.jumpNavContainerAnchors[index].classList.add("active"); // Mark the new slide as active
        }
        return index; // Return the new index

    }

    // Updates the main animation's progress based on the proxy's position.
    _updateProgress = () =>{
        this.animation.progress(
            this.progressWrap(
                gsap.getProperty(this.proxy,"x") / this.wrapWidth
            )
        )
    }

    
    // Toggle caption visibility
    _toggleCaption(show = false , immediate = false){
        if(show){
            gsap.to(
                this.descriptionWrapper,
                {
                    opacity:1,
                    duration:0.2,
                    delay: immediate ? 0 : this.slideDuration,
                    onStart: () =>{
                        this.title.textContent = this.items[this.currSnapIndex].title
                        this.description.textContent = this.items[this.currSnapIndex].description
                    }
                }
            )
        }else{
            gsap.killTweensOf(this.descriptionWrapper)
            gsap.to(
                this.descriptionWrapper,
               {
                opacity : 0,
                duration : 0.2
               }
            )
        }
    }


    // Function that gets triggered when we press down to start dragging
    _onPress = () => {
        this._toggleCaption(false); // Hide the caption when we start dragging
        this._updateDraggable(); // Update draggable properties
    };

    // Function that gets triggered when we release after dragging
    _onRelease = () => {
        if (!this.draggable.isThrowing || (this.draggable.tween && this.draggable.tween.progress() !== 1)) {
            this._toggleCaption(true); // Show the caption again after dragging
        }
    };

    // Ends any drag action and finalizes the animation state.
    _killDragThrow(event){
        this.draggable.endDrag(event)
        if(this.draggable.tween){
            this.draggable.tween.progress(1)
        }

    }




    _show(){
        this.visible = true
        gsap.to(this.container,{
            autoAlpha : 1,
            duration : 0.5
        })
    }

    _hide(){
        this.visible = false
        gsap.to(this.container,{
            autoAlpha : 0,
            duration : 0.5
        })
    }


      
}