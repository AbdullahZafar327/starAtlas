
import * as THREE from 'three'

// This class helps manage and animate the camera's view and position in a 3D scene.
export class CameraController {
    // Properties to keep track of the camera's state and transition progress
    camera;  // The camera we are controlling
    totalProgress = 0;  // How far along the transition is (from 0 to 1)
    initialized = false;  // Whether the class has been set up
    progress = { startFOV: 15, endFOV: 110, focusZ: -200, endZ: -110 };  // Settings for FOV and position
    currentFOV = -1;  // Current field of view of the camera
    initDepth = 0;  // Initial depth value used for calculations
    _cameraLookAtObject;  // The object the camera should look at
    _cameraLookAtPoint = new THREE.Vector3();  // A point in space for camera focus

    // Constructor to set up the camera and the object to look at
    constructor(camera, lookAtObject) {
        this.camera = camera;  // Store the camera
        this._cameraLookAtObject = lookAtObject;  // Store the object to look at
    }

    // Initialize the camera's position and calculations
    _init() {
        // Set the camera's initial position based on focusZ
        this.camera.position.z = this.progress.focusZ;
        
        // Calculate the initial depth based on the starting FOV
        this.initDepth = 2 * Math.tan(((this.progress.startFOV / 2) * Math.PI) / 180);
    }

    // Update the camera's FOV and position based on the progress
    _update(endFOV, transitionDistance, currentProgress, totalProgress) {
        // Initialize if not done already
        if (!this.initialized) {
            this.initialized = true;  // Mark as initialized
            
            // Set up progress values for transition
            this.progress = {
                startFOV: this.camera.fov,  // Starting FOV (default or provided)
                endFOV: endFOV,  // Ending FOV (provided)
                focusZ: this.camera.position.z,  // Current Z position
                endZ: this.camera.position.z + transitionDistance  // Ending Z position
            };
            
            // Call init to set up initial values
            this._init();
        }

        // Calculate the current FOV based on progress
        this.currentFOV = this.progress.startFOV + 
            (this.progress.endFOV - this.progress.startFOV) * (currentProgress || this.totalProgress);
        
        // Calculate the new camera position based on the current FOV
        let screenDepth = 2 * Math.tan(((this.currentFOV / 2) * Math.PI) / 180);
        this.camera.position.z = this.progress.endZ +
            ((this.progress.focusZ - this.progress.endZ) * this.initDepth) / screenDepth;
        
        // Update the camera's FOV
        this.camera.fov = this.currentFOV;
    }

    // Get the current FOV and Z position based on a given progress value
    _getValues(progress) {
        // Calculate the current FOV based on progress
        this.currentFOV = this.progress.startFOV + 
            (this.progress.endFOV - this.progress.startFOV) * progress;
        
        // Calculate the depth of the camera based on the current FOV
        let screenDepth = 2 * Math.tan(((this.currentFOV / 2) * Math.PI) / 180);
        return {
            fov: this.currentFOV,  // Return the current FOV
            z: this.progress.endZ + 
                ((this.progress.focusZ - this.progress.endZ) * this.initDepth) / screenDepth  // Return the Z position
        };
    }

    // Convert a field of view (FOV) value to a Z position
    _convertFovToZ(fov) {
        return 1 / (2 * this.camera.aspect * Math.tan((fov / 2) * (Math.PI / 180)));
    }

    // Convert a Z position to a field of view (FOV) value
    _convertZToFov(z) {
        return 2 * Math.atan2(1, 2 * this.camera.aspect * z) * (180 / Math.PI);
    }
}
