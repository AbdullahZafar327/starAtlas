import gsap from 'gsap';

 export class MouseIntroHandler {
  constructor(mouseTracker, targetElement, speed = 0.2, hitArea) {
    this.MouseMoveTracker = mouseTracker; // Tracks mouse movements
    this.target = targetElement; // The target element to move
    this.speed = speed; // How fast the element follows the mouse
    this.hitArea = hitArea; // The area where the mouse movement is tracked

    // Initial positions for both the mouse and the target
    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Initialize bounds and add event listeners
    this.onWindowResize();
    gsap.ticker.add(this.animate); // Start updating animation
    window.addEventListener('resize', this.onWindowResize); // Update bounds on resize
  }

  // Method to update the position of the target element on each frame
  animate = () => {
    const updateX = gsap.quickSetter(this.target, 'x', 'px'); // Fast setter for X position
    const updateY = gsap.quickSetter(this.target, 'y', 'px'); // Fast setter for Y position
    const smoothing = 1 - Math.pow(1 - this.speed, gsap.ticker.deltaRatio()); // Smoothing factor

    // Check if mouse is inside the hit area
    if (this.isMouseInBounds()) {
      // If inside, update the target position to follow the mouse
      this.mouse.x = this.MouseMoveTracker.mouse.x;
      this.mouse.y = this.MouseMoveTracker.mouse.y;

      // Kill any reset animation if the mouse is inside bounds
      if (this.resetTween) {
        this.resetTween.kill();
        this.resetTween = null;
      }
    } else if (!this.resetTween) {
      // If mouse is outside bounds, reset the target position to the center
      this.resetTween = gsap.to(this.mouse, { x: 0, y: 0, duration: 0.4 });
    }

    // Smoothly move the target position toward the mouse position
    this.pos.x += (this.mouse.x - this.pos.x) * smoothing;
    this.pos.y += (this.mouse.y - this.pos.y) * smoothing;

    // Update the DOM element's position
    updateX(this.pos.x);
    updateY(this.pos.y);
  };

  // Check if the mouse is inside the hit area
  isMouseInBounds = () => {
    const mouseX = this.MouseMoveTracker.mouse.originX;
    const mouseY = this.MouseMoveTracker.mouse.originY;
    return (
      mouseX >= this.bounds.left &&
      mouseX <= this.bounds.right &&
      mouseY >= this.bounds.top &&
      mouseY <= this.bounds.bottom
    );
  };

  // Update the hit area bounds when the window resizes
  onWindowResize = () => {
    this.bounds = this.hitArea.getBoundingClientRect(); // Get the hit area dimensions
  };

  // Enable the mouse follower (make the target visible)
  enable = () => {
    gsap.to(this.target, { opacity: 1, duration: 1 }); // Fade in the target
  };

  // Disable the mouse follower (fade out the target and stop updates)
  disable = () => {
    gsap.killTweensOf(this.target, 'opacity'); // Stop any ongoing opacity animations
    gsap.to(this.target, { opacity: 0, duration: 0.15 }); // Fade out the target
    gsap.ticker.remove(this.animate); // Stop updating the position
    window.removeEventListener('resize', this.onWindowResize); // Remove resize listener
  };
}

