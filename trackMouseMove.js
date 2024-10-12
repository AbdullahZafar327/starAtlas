import gsap from 'gsap'
import { GlobalsLanding } from './compaitable';



export class MouseMoveTracker {
    // States and Variables
    pos = {
        prevX: 0, // Previous x position
        prevY: 0, // Previous y position
        x: 0, // Current x position
        y: 0, // Current y position
        xNormalizedFromCenter: 0, // Normalized x position relative to center
        yNormalizedFromCenter: 0, // Normalized y position relative to center
        distanceFromCenter: 0, // Distance from center
        xEased: 0, // Eased x position
        yEased: 0  // Eased y position
    };

    activeEaseString = "none"; // Default easing function
    fromCenterMoveEase = gsap.parseEase(this.activeEaseString); // Convert string to GSAP easing function

    AppContainer = document.getElementById("App"); // Reference to the app container

    dim = {
        width: window.innerWidth, // Window width
        height: window.innerHeight, // Window height
        halfWidth: window.innerWidth / 2, // Half of the window width
        halfHeight: window.innerHeight / 2 // Half of the window height
    };

    speed = {
        x: 10, // Speed factor for x movement
        y: 10, // Speed factor for y movement
        ease: 0.01 // Easing factor for smooth movement
    };

    mouse = {
        x: 0, // x position of the mouse
        y: 0, // y position of the mouse
        originX: 0, // Original x position of the mouse
        originY: 0, // Original y position of the mouse
        eventX: 0, // x position from the mouse event
        eventY: 0, // y position from the mouse event
        xNormalizedFromCenter: 0, // Normalized x position relative to center
        yNormalizedFromCenter: 0, // Normalized y position relative to center
        distanceFromCenter: 0, // Distance from center
        xNormalizedFromCenterMapFunction: gsap.utils.mapRange(-this.dim.halfWidth, this.dim.halfWidth, -1, 1),
        yNormalizedFromCenterMapFunction: gsap.utils.mapRange(-this.dim.halfHeight, this.dim.halfHeight, -1, 1),
        xEased: 0, // Eased x position of the mouse
        yEased: 0 // Eased y position of the mouse
    };

    edgePixelSlowdown = 100; // Slowdown factor at edges of the viewport
    edgeMoveOffset = 200; // Offset for edge movement calculations
    mapEdge = gsap.utils.normalize(0, this.edgePixelSlowdown); // Function to normalize edge values
    clampNormal = gsap.utils.clamp(0, 1); // Function to clamp values between 0 and 1
    clampMoveNormal = gsap.utils.clamp(-1, 1); // Function to clamp values between -1 and 1

    // Constructor initializes the class instance
    constructor() {
        this._enable();
        // Toggle 'freeze' state on 'm' key press
        window.addEventListener("keyup", (event) => {
            if (event.key === "m") {
                this.freeze = !this.freeze;
            }
        });
    }

    // Method to enable mouse tracking
    _enable() {
        if (!GlobalsLanding.IS_TOUCH_DEVICE) { // Check if the device is not a touch device
            this.isEnabled = true; // Enable mouse tracking
            window.addEventListener("mousemove", this._mouseMove); // Add event listener for mouse movement
        }
    }

    // Method to handle mouse movement events
    _mouseMove = (event) => {
        if (this.freeze) return; // Skip processing if tracking is frozen

        // Update mouse position
        this.mouse.eventX = event.clientX;
        this.mouse.eventY = event.clientY;
        this.mouse.originX = event.x;
        this.mouse.originY = event.y;
        this.mouse.x = event.x - this.dim.halfWidth;
        this.mouse.y = event.y - this.dim.halfHeight;

        // Normalize and ease mouse position
        this.mouse.xNormalizedFromCenter = this.clampMoveNormal(
            this.mouse.xNormalizedFromCenterMapFunction(this.mouse.x)
        );
        this.mouse.yNormalizedFromCenter = this.clampMoveNormal(
            this.mouse.yNormalizedFromCenterMapFunction(this.mouse.y)
        );

        this.mouse.xEased = this.fromCenterMoveEase(Math.abs(this.mouse.xNormalizedFromCenter)) * (this.mouse.xNormalizedFromCenter > 0 ? 1 : -1);
        this.mouse.yEased = this.fromCenterMoveEase(Math.abs(this.mouse.yNormalizedFromCenter)) * (this.mouse.yNormalizedFromCenter > 0 ? 1 : -1);

        // Calculate distance from center
        this.mouse.distanceFromCenter = Math.max(
            Math.abs(this.mouse.xEased),
            Math.abs(this.mouse.yEased)
        );
    };

    // Method to update eased values and positions
    _raf() {
        this.pos.xEased += (this.mouse.xEased - this.pos.xEased) * this.speed.ease;
        this.pos.yEased += (this.mouse.yEased - this.pos.yEased) * this.speed.ease;
        this.pos.distanceFromCenter += (this.mouse.distanceFromCenter - this.pos.distanceFromCenter) * this.speed.ease;

        this.pos.prevX = this.pos.x;
        this.pos.prevY = this.pos.y;
        this.pos.x -= this.pos.xEased * this.speed.x;
        this.pos.y -= this.pos.yEased * this.speed.y;
    }

    // Method to handle window resize events
    _resize = () => {
        this.dim.width = window.innerWidth;
        this.dim.height = window.innerHeight;
        this.dim.halfWidth = this.dim.width / 2;
        this.dim.halfHeight = this.dim.height / 2;
        this.edgeMoveOffset = 0.1 * Math.min(this.dim.width, this.dim.height);

        // Update map functions based on new dimensions
        this.mouse.xNormalizedFromCenterMapFunction = gsap.utils.mapRange(
            -this.dim.halfWidth + this.edgeMoveOffset,
            this.dim.halfWidth - this.edgeMoveOffset,
            -1,
            1
        );
        this.mouse.yNormalizedFromCenterMapFunction = gsap.utils.mapRange(
            -this.dim.halfHeight + this.edgeMoveOffset,
            this.dim.halfHeight - this.edgeMoveOffset,
            -1,
            1
        );
    }
}
