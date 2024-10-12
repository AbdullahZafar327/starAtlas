import * as THREE from 'three'
export class CustomMaterial extends THREE.ShaderMaterial {
    // Static properties for textures (circle textures used in the shader)
    static texCircleSolid;
    static texCircleAlpha;

    

    // Constructor initializes DOF parameters and shader uniforms
    constructor(params = {}, gui = null, name = "") {
        // Default settings for the DOF effect
        let defaultSettings = {
            focusNear: 9.14,         // Near focus distance
            focusFar: 11.34,         // Far focus distance
            focusFadeOutLength: 1,   // Length of the focus fade
            maxBlur: 0.34,           // Maximum blur amount
            minBlur: 0.14,           // Minimum blur amount
            minOpacity: 0.02,        // Minimum opacity of the points
            maxOpacity: 0.8,         // Maximum opacity of the points
            useFocusCenter: false,   // Whether to use a fixed focus center
            focusCenter: 8,          // Focus center position
            focusLength: 4,          // Length of focus area
            radiusScaleFactor: 1,    // Scale factor for point size
        };

        // Override default settings with user-provided params
        Object.assign(defaultSettings, params);

        // Define uniforms used in the shaders (vertex and fragment)
        let uniforms = {
            viewport: { value: window.innerHeight / 1000 },
            PIXEL_RATIO: { value: window.devicePixelRatio },
            focusNear: { value: defaultSettings.focusNear },
            focusFar: { value: defaultSettings.focusFar },
            focusFadeOutLength: { value: defaultSettings.focusFadeOutLength },
            maxBlur: { value: defaultSettings.maxBlur },
            minBlur: { value: defaultSettings.minBlur },
            radiusScaleFactor: { value: defaultSettings.radiusScaleFactor },
            minOpacity: { value: defaultSettings.minOpacity },
            maxOpacity: { value: defaultSettings.maxOpacity },
            color: { value: new THREE.Color(0xffffff) }, // White color
            pointTexture: { value: CustomMaterial.texCircleSolid },
            pointTextureAlpha: { value: CustomMaterial.texCircleAlpha },
        };

        // Automatically update viewport size on window resize
        window.addEventListener("resize", () => {
            uniforms.viewport.value = window.innerHeight / 1000;
        });

        // Call the parent ShaderMaterial constructor with the custom shaders and uniforms
        super({
            uniforms: uniforms,
            vertexShader: CustomMaterial.getVertexShader(),   // Vertex shader logic
            fragmentShader: CustomMaterial.getFragmentShader(), // Fragment shader logic
            transparent: true,
            depthWrite: false,  // Don't write depth (for transparency)
        });


        // Store DOF parameters
        this.dofParams = defaultSettings;

        // Optional: If a GUI is provided, allow real-time editing of DOF settings
        if (gui) {
            this.setupGUI(gui, name);
        }

        // Update the focus settings based on parameters
        this.updateFocusCenter();
    }

    // Method to set up a GUI to adjust DOF settings in real time
    setupGUI(gui, name) {
        let folder = gui.addFolder("DOF Material " + name);

        folder.add(this.dofParams, "focusNear", 0.01, 200).onChange(value => {
            this.uniforms.focusNear.value = value;
        });
        folder.add(this.dofParams, "focusFar", 0.01, 200).onChange(value => {
            this.uniforms.focusFar.value = value;
        });
        folder.add(this.dofParams, "focusFadeOutLength", 0.01, 100).onChange(value => {
            this.uniforms.focusFadeOutLength.value = value;
        });
        folder.add(this.dofParams, "minBlur", 0.001, 2).onChange(value => {
            this.uniforms.minBlur.value = value;
        });
        folder.add(this.dofParams, "maxBlur", 0.1, 2).onChange(value => {
            this.uniforms.maxBlur.value = value;
        });
        folder.add(this.dofParams, "minOpacity", 0, 1).onChange(value => {
            this.uniforms.minOpacity.value = value;
        });
        folder.add(this.dofParams, "maxOpacity", 0, 1).onChange(value => {
            this.uniforms.maxOpacity.value = value;
        });
        folder.add(this.dofParams, "radiusScaleFactor", 0, 1000).onChange(value => {
            this.uniforms.radiusScaleFactor.value = value;
        });
        folder.add(this.dofParams, "useFocusCenter").onChange(value => {
            this.dofParams.useFocusCenter = value;
            this.updateFocusCenter();
        });
        folder.add(this.dofParams, "focusCenter", 0, 30).onChange(value => {
            this.focusCenter = value;
        });
        folder.add(this.dofParams, "focusLength", 0, 100).onChange(value => {
            this.focusLength = value;
        });
    }

    // Update focus parameters based on whether the focus center is being used
    updateFocusCenter() {
        if (this.dofParams.useFocusCenter) {
            this.uniforms.focusNear.value = this.dofParams.focusCenter - this.dofParams.focusLength / 2;
            this.uniforms.focusFar.value = this.dofParams.focusCenter + this.dofParams.focusLength / 2;
        } else {
            this.uniforms.focusNear.value = this.dofParams.focusNear;
            this.uniforms.focusFar.value = this.dofParams.focusFar;
        }
    }

    // Accessor methods for focusCenter and focusLength
    get focusCenter() {
        return this.dofParams.focusCenter;
    }

    set focusCenter(value) {
        this.dofParams.focusCenter = value;
        this.updateFocusCenter();
    }

    get focusLength() {
        return this.dofParams.focusLength;
    }

    set focusLength(value) {
        this.dofParams.focusLength = value;
        this.updateFocusCenter();
    }

    // Vertex shader code (determines how each vertex is positioned and sized)
    static getVertexShader() {
        return `
            attribute float size;
            attribute vec3 customColor;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float focusNear;
            uniform float focusFar;
            uniform float maxBlur;
            uniform float minBlur;
            uniform float maxOpacity;
            uniform float minOpacity;
            uniform float focusFadeOutLength;
            uniform float radiusScaleFactor;
            uniform float PIXEL_RATIO;
            uniform float viewport;

            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                float sizeCalc = 1.0;

                // Calculate the size of the point based on the distance from the camera
                if (-mvPosition.z < focusNear) {
                    sizeCalc = smoothstep(focusNear - focusFadeOutLength, focusNear, -mvPosition.z);
                }
                if (-mvPosition.z > focusFar) {
                    sizeCalc = smoothstep(focusFar + focusFadeOutLength, focusFar, -mvPosition.z);
                }

                // Calculate point size and transparency
                sizeCalc = 1.0 - sizeCalc;
                vAlpha = clamp((1.0 - sizeCalc) * maxOpacity, minOpacity, maxOpacity);

                if (vAlpha < 0.0001) {
                    gl_PointSize = 0.0;
                    gl_Position.z = 0.0;
                } else {
                    gl_PointSize = (viewport * (size * PIXEL_RATIO * minBlur + (size * PIXEL_RATIO * maxBlur * sizeCalc))) * radiusScaleFactor;
                    gl_Position = projectionMatrix * mvPosition;
                    vColor = customColor;
                }
            }
        `;
    }

    // Fragment shader code (determines the color and transparency of each pixel)
    static getFragmentShader() {
        return `
            uniform vec3 color;
            uniform sampler2D pointTexture;
            uniform sampler2D pointTextureAlpha;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec4 tColor = texture2D(pointTexture, gl_PointCoord);
                vec4 tColorAlpha = texture2D(pointTextureAlpha, gl_PointCoord);

                // Premultiplied alpha blending for smooth transitions
                tColor.rgb = tColor.rgb + tColor.rgb * (1.0 - tColor.a);
                tColorAlpha.rgb = tColorAlpha.rgb + tColorAlpha.rgb * (1.0 - tColorAlpha.a);

                // Output the final color
                gl_FragColor = vec4(vColor, mix(tColorAlpha.a, tColor.a, vAlpha) * vAlpha);
            }
        `;
    }
}
