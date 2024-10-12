import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  NoiseEffect,
  GodRaysEffect,
  EffectPass,
  BlendFunction,
  KernelSize,
} from "postprocessing";

export class createPostProcessingEffects {
  _composer;
  _scene;
  _camera;
  _menu;
  _renderer;
  isEnabled = false;
  smaaPass;
  smaaEffect;
  godRaysEffect;
  godsRayPass;
  noiseEffect;
  standardPass;
  isGodsRayEnabled = true;
  clock;

  get godsRayEnabled() {
    this.isGodsRayEnabled;
  }

  set godsRayEnabled(enable) {
    this.isGodsRayEnabled = enable;

    if (enable) {
      this._composer.removePass(this.standardPass);
      this._composer.addPass(this.godsRayPass);
      this.standardPass.enabled = false;
      this.godsRayPass.enabled = true;
    } else {
      this.standardPass.enabled = true;
      this.godsRayPass.enabled = false;
      this._composer.removePass(this.godsRayPass);
      this._composer.addPass(this.standardPass);
    }
  }

  constructor(scene, camera, renderer, menu, clock, isEnabled = false) {
    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
    this._menu = menu;
    this.isEnabled = isEnabled;
    this.clock = clock;
    this._initPostEffects();
  }

  _initPostEffects() {
    this._composer = new EffectComposer(this._renderer);
    let renderPass = new RenderPass(this._scene, this._camera);
    renderPass.renderToScreen = false;

    this._composer.addPass(renderPass);

    this._initNoiseEffect();
  }

  _initNoiseEffect() {
    this.noiseEffect = new NoiseEffect({
      blendFunction: BlendFunction.HARD_LIGHT,
      opacity:0.3292
    });

    const noiseSettings = {
      enabled: this.isEnabled,
      noiseOpacity: 0.3292,
      blendMode: this.noiseEffect.blendMode.blendFunction,
    };

    if (this._menu) {
      this.setupNoiseGui(noiseSettings);
    }

    this.noiseEffect.blendMode.opacity.value = noiseSettings.noiseOpacity;
  }

  setupNoiseGui(settings) {
    const folder = this._menu.addFolder("Visual Effects");

    folder.add(settings, "enabled").onChange((value) => {
      this.isEnabled = value;
    });
    folder.add(settings, "blendMode", BlendFunction).onChange((value) => {
      this.noiseEffect.blendMode.setBlendFunction(Number(value));
    });
    folder
      .add(settings, "noiseOpacity")
      .min(0)
      .max(1)
      .step(0.0001)
      .onChange((value) => {
        this.noiseEffect.blendMode.opacity.value = value;
      });
  }

  _setupGodsRayEffect(godRayLight, introLight) {
    const lightColor = new THREE.Color()
    this.godRaysEffect = new GodRaysEffect(this._camera, godRayLight, {
      height: 480,
      kernelSize: KernelSize.SMALL,
      density: 0.8,
      decay: 0.9,
      weight: 0.7,
      exposure: 0.9,
      samples: 35,
      clampMax: 1,
    });

    this.godsRayPass = new EffectPass(
      this._camera,
      this.godRaysEffect,
      this.noiseEffect
    );
    this.standardPass = new EffectPass(this._camera, this.noiseEffect);

    this._composer.addPass(this.godsRayPass);

    const godRaysSettings = {
      resolution: this.godRaysEffect.height,
      blurriness: this.godRaysEffect.blurPass.kernelSize,
      density: this.godRaysEffect.godRaysMaterial.uniforms.density.value,
      decay: this.godRaysEffect.godRaysMaterial.uniforms.decay.value,
      weight: this.godRaysEffect.godRaysMaterial.uniforms.weight.value,
      exposure: this.godRaysEffect.godRaysMaterial.uniforms.exposure.value,
      clampMax: this.godRaysEffect.godRaysMaterial.uniforms.clampMax.value,
      samples: this.godRaysEffect.samples,
      color: lightColor.copyLinearToSRGB(godRayLight.material.color).getHex(),
      opacity: this.godRaysEffect.blendMode.opacity.value,
      blendMode: this.godRaysEffect.blendMode.blendFunction,
    };

    // Add GUI controls if a menu is provided
    if (this._menu) {
      this.setupGodRaysGUI(godRaysSettings, godRayLight, introLight);
    }

    return this.godRaysEffect;
  }

  setupGodRaysGUI(settings, godRayLight, introLight) {
    const folder = this._menu.addFolder("God Rays");


    folder
      .add(settings, "resolution", [240, 360, 480, 720, 1080])
      .onChange((value) => {
        this.godRaysEffect.resolution.height = Number(value);
      });
    folder.add(this.godsRayPass, "dithering");
    folder
      .add(settings, "blurriness")
      .min(KernelSize.VERY_SMALL)
      .max(KernelSize.HUGE + 1)
      .step(1)
      .onChange((value) => {
        this.godRaysEffect.blur = value > 0;
        this.godRaysEffect.blurPass.kernelSize = value - 1;
      });
    folder
      .add(settings, "density")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange((value) => {
        this.godRaysEffect.godRaysMaterial.uniforms.density.value = value;
      });
    folder
      .add(settings, "decay")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange((value) => {
        this.godRaysEffect.godRaysMaterial.uniforms.decay.value = value;
      });
    folder
      .add(settings, "weight")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange((value) => {
        this.godRaysEffect.godRaysMaterial.uniforms.weight.value = value;
      });
    folder
      .add(settings, "exposure")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange((value) => {
        this.godRaysEffect.godRaysMaterial.uniforms.exposure.value = value;
      });
    folder
      .add(settings, "clampMax")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange((value) => {
        this.godRaysEffect.godRaysMaterial.uniforms.clampMax.value = value;
      });
    folder.add(this.godRaysEffect, "samples").min(15).max(200).step(1);
    folder.addColor(settings, "color").onChange((color) => {
      godRayLight.material.color.setHex(color).convertSRGBToLinear();
      introLight.color.setHex(color).convertSRGBToLinear();
    });
    folder
      .add(settings, "opacity")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange((value) => {
        this.godRaysEffect.blendMode.opacity.value = value;
      });
    folder.add(settings, "blendMode", BlendFunction).onChange((value) => {
      this.godRaysEffect.blendMode.setBlendFunction(Number(value));
    });
    folder
      .add(godRayLight.position, "x")
      .min(-10)
      .max(10)
      .step(0.001)
      .onChange((x) => {
        godRayLight.position.x = x;
        godRayLight.updateMatrix();
      });
    folder
      .add(godRayLight.position, "y")
      .min(-10)
      .max(10)
      .step(0.001)
      .onChange((y) => {
        godRayLight.position.y = y;
        godRayLight.updateMatrix();
      });
    folder
      .add(godRayLight.position, "z")
      .min(-10)
      .max(10)
      .step(0.001)
      .onChange((z) => {
        godRayLight.position.z = z;
        godRayLight.updateMatrix();
      });
  }

  // Render the scene with the effects
  render() {
    this._composer.render(this.clock.getDelta());
  }
}
