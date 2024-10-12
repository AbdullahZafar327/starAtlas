import * as THREE from 'three'
import { CustomMaterial } from './CustomMaterial';
import { CreateRings } from './createRings';
import eyeTexture from '/eye_texture.jpg'
import gsap from 'gsap';



export class EyeIntroPortal{
    _scene;
    _group = new THREE.Object3D()
    _container;
    rings = [];
    ringsGroup = new THREE.Group()
    pointCloud;
    pointCloudContainer = new THREE.Object3D();
    pointCloudBelt;
    eye;
    sun;
    _godsRayEffect;
    postEffects;
    _menu;
    _loadingManager;
    color = new THREE.Color(15384750).convertSRGBToLinear()
    texture;
    

    constructor(
        scene,
        postEffects,
        menu,
        loadingManager
    ){

        this.postEffects = postEffects;
        this._scene = scene;
        this._menu  = menu;
        this._loadingManager = loadingManager;
        this.texture = this._loadingManager._loadTexture(eyeTexture)

        this._introLight()
        this._initSun()
        this._initIntroGodsRayEffect()
        this._initPortalModel()
        this._initParticlesModel()
        this._initCreateRings()
        this._PrepareAndLoadGroup()

    }

    _introLight(){
        this.introLight = new THREE.PointLight(
            this.color
        )

        this.introLight.position.set(0.36,-2.454,0)
    }

    _initSun(){
        const sunGeometry = new THREE.SphereGeometry(1.5,32,32)
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent : true,
            fog : false
        })
        this.sun = new THREE.Mesh(sunGeometry,sunMaterial)
        this.sun.position.copy(this.introLight.position)
        this.sun.updateMatrix()
        this.sun.frustumCulled = false
        this.sun.matrixAutoUpdate = false
        this.sun.name = "sun"

        this._group.add(this.sun)
    }

    _initIntroGodsRayEffect(){
       this._godsRayEffect =  this.postEffects._setupGodsRayEffect(
        this.sun,
        this.introLight
       )
    }

    _initPortalModel(){
            this._loadingManager._loadGLTF(
                "/blackhole.glb",
                this._createPortalGeometry.bind(this),
            )
    
    }

    _createPortalGeometry(gltf){ 
        this.texture.center.x = 0.5
        this.texture.center.y = 0.5
        this.texture.repeat.set({
            x : 4,
            y: 4
        })

        gsap.to(
            this.texture,{
                rotation : 2 * -Math.PI ,
                ease:"none",
                repeat: -1,
                duration:200
            }
        )


        this.eye = gltf.scene.children[0]
        const eyeColor = new THREE.Color(7899597)
        this.eye.material = new THREE.MeshStandardMaterial(
            {
                metalness : 0.12,
                roughness : 0.55,
                color : eyeColor,
                transparent: true,
                opacity: 0.97,
                map: this.texture,
                flatShading: false
            }
        )
        this.eye.name = "eye"

        this._group.add(this.eye)

    }

    _initParticlesModel(){
        this._loadingManager._addLoadItem(
               {
                path: "/particles/bunny.drc",
                name:"eye_particles",
                format : "drc",
                doneCallback: (geometry, path, name) => this._createCloudGeometry(geometry, path, name)
               }
        )
    }

    _createCloudGeometry(geometry,filePath,identifierName){
        const cloudMaterial = new CustomMaterial(
            {
            useFocusCenter: !0,
              focusLength: 12.58,
              focusCenter: 15.023,
              focusFadeOutLength: 6,
              minOpacity: 0,
              maxOpacity: 0.534,
              maxBlur: 0.15,
              minBlur: 0.05,
              radiusScaleFactor: 0.006,
            },
            this._menu,
            identifierName
        )

        this.pointCloudBelt = new THREE.Mesh(geometry,cloudMaterial)
        this.pointCloudBelt.renderOrder = 1
        this.pointCloudBelt.name = identifierName
        this.pointCloudBelt.scale.set(
            {
                x: 0.0001 , y :0.001 , z : 0.001
            }
        )

        

        this._group.add(this.pointCloudBelt)
        

        gsap.to(
            this.pointCloudBelt.rotation,{
                y : 2 * -Math.PI,
                repeat:-1,
                yoyo: false,
                ease:"none",
                duration:200
            }
        )

        

    }

    _initCreateRings(){
        const ringsColor = new THREE.Color(16777215)
        const ringSettings = {
            minBlur: 0.05,
            maxBlur: 0.1,
            minOpacity: 1,
            focusFadeOutLength: 7.77,
            focusFar: 13.11,
            focusNear: 8.7,
            maxOpacity: 1,
        }

        const ring1 = new CreateRings(
                             this.ringsGroup, //where it will be added
                             2.93,             //radius of the ring
                             Math.round(117.2), //Number of points in the ring
                             0,                //start Angle to create circle
                             2 * Math.PI,      // 180 * 2  = 360 to <- Ending ANGLE
                             this._menu,       //gui settings
                             "eye ring",       //type of ring
                             ringsColor,      //color of the rings
                             null,            //customMaterial for the ring, Default null
                             ringSettings,     //shader settings
                             "PortalRing-01"
                            )
                            ring1.points.position.y = 0

        const ring2 = new CreateRings(
                             this.ringsGroup, //where it will be added
                             4.1,             //radius of the ring
                             Math.round(164), //Number of points in the ring
                             0,               //start Angle to create circle
                             2* Math.PI,      // 180 * 2  = 360 to <- Ending ANGLE
                             this._menu,
                             "eye ring",      //type of ring
                             ringsColor,      //color of the rings
                             null,            //customMaterial for the ring, Default null
                             ringSettings,     //shader settings
                             "PortalRing-02"
                            )
                            
                            ring2.points.position.y = 0.65

        const ring3 = new CreateRings(
                             this.ringsGroup, //where it will be added
                             5.4,             //radius of the ring
                             Math.round(224), //Number of points in the ring
                             0,               //start Angle to create circle
                             2* Math.PI,      // 180 * 2  = 360 to <- Ending ANGLE
                             this._menu,
                             "eye ring",      //type of ring
                             ringsColor,      //color of the rings
                             null,            //customMaterial for the ring, Default null
                             ringSettings,     //shader settings
                             "PortalRing-03"
                            )
                            ring3.points.position.y = 0.8
        const ring4 = new CreateRings(
                             this.ringsGroup, //where it will be added
                             7,             //radius of the ring
                             Math.round(280), //Number of points in the ring
                             0,               //start Angle to create circle
                             2* Math.PI,      // 180 * 2  = 360 to <- Ending ANGLE
                             this._menu,
                             "eye ring",      //type of ring
                             ringsColor,      //color of the rings
                             null,            //customMaterial for the ring, Default null
                             ringSettings,     //shader settings
                             "PortalRing-04"
                            )
                            ring4.points.position.y = 0.85
        
        //four rings for each chapter, this method will be called for each chapter once 
        this.rings.push(ring1, ring2, ring3, ring4);

        this.rings.forEach((ring,index)=>{
            ring.points.rotation.x = 0.5 * -Math.PI
            gsap.to(
                ring.points.rotation,
                {
                    z: Math.PI,
                    duration: 50 + 10 * index,
                    repeat: -1,
                    ease:"none"
                }
            )
        })
        
        this.ringsGroup.name = "Portal-Rings"
        this._group.add(this.ringsGroup)



    }


    _PrepareAndLoadGroup(){
        this._group.rotation.set(
            {
                x: -0.961,
                y:-0.08,
                z:0.2
            }
        )
        this._group.position.set(
            {
                x: -0.11,
                y:  0.83,
                z:  -298
            }
        )
        this.pointCloudContainer.name = "Point-Cloud-Container"
        this._group.add(this.pointCloudContainer)
        this._group.name = "Intro-PortalGroup"
        this._scene.add(this._group)
    }

    // this will be called outside of this class 
    _getIntroAnimation( customDuration = 6){
        const PortalTimeline = gsap.timeline()
        return (
            PortalTimeline.fromTo(
                this.sun.position,
                {
                    x:-0.5,
                    y:-0.72
                },
                {
                    x: this.sun.position.x,
                    y: this.sun.position.y,
                    duration: customDuration,
                    onUpdate: () => this.sun.updateMatrix()
                },
                0 //no delay , immediately
            ),
            PortalTimeline.from(
                this._godsRayEffect.godRaysMaterial.uniforms.weight,
                {
                    value : 1,
                    duration: 1,
                    ease:"power3.inOut"
                },
                0 //no delay immediately
            ),
            PortalTimeline.from(
                this._godsRayEffect.godRaysMaterial.uniforms.exposure,
                {
                    value : 1,
                    duration: 1,
                    ease:"power3.inOut"
                },
                0 //no delay immediately
            ),
            PortalTimeline.from(
                this._godsRayEffect.godRaysMaterial.uniforms.decay,
                {
                    value : 1,
                    duration: 1,
                    ease:"power3.inOut"
                },
                0 //no delay immediately
            ),

            //pass this as well for further manipulations
            PortalTimeline
            
        )
    }
     // this will be called outside of this class , it will animate based on the scroll of the user
     _getScrollInAnimation(customDuration = 4){
        const scrollInTimeline = gsap.timeline({paused: true})

        scrollInTimeline.to(
            this._group.position,
            {
                x:0,
                y:0,
                duration: customDuration,
                ease:"sine.inOut"
            },
            0 //no Delay , immediately
        )
        scrollInTimeline.to(
            this._group.position,
            {
                z: "-=5.5 ",
                duration: 1.2 * customDuration,
                ease:"power4.inOut"
            },
            0 //no Delay , immediately
        )
        scrollInTimeline.to(
            this._group.rotation,
            {
                x: 0.5 * -Math.PI,
                y:0,
                duration: customDuration,
                ease:"sine.inOut"
            },
            0 //no Delay , immediately
        )
        scrollInTimeline.to(
            this._group.rotation,
            {
                y: 1,
                duration: 1.2 * customDuration,
                ease:"sine.inOut"
            },
            0 //no Delay , immediately
        )

        scrollInTimeline.to(
            this.texture.repeat,
            {
                x : 7.5,
                y: 7.5,
                duration: 1.2 * customDuration,
                ease:"power4.inOut"
            },0
        )

        scrollInTimeline.to(
            this.pointCloudContainer.rotation,
            {
                x: -0.5 ,
                duration: customDuration,
                ease: "sine.out"
            },0
        )

        const timelineIntroScroll = gsap.timeline({delay : 0.5})


        return (
            timelineIntroScroll.to(
                this.pointCloudBelt.material.uniforms.maxOpacity,
                {
                    value : 0,
                    duration: 0.05 * customDuration,
                    ease: "sine.out"
                },0.2 * customDuration
            ),
            timelineIntroScroll.to(
                this._godsRayEffect.godRaysMaterial.uniforms.weight,
                {
                    value  :1,
                    duration :1,
                    ease:"sine.out"
                }, 0.2 * customDuration
            ),
            timelineIntroScroll.to(
                this._godsRayEffect.godRaysMaterial.uniforms.exposure,
                {
                    value  :1,
                    duration :1,
                    ease:"sine.out"
                }, 0.2 * customDuration
            ),
            timelineIntroScroll.to(
                this._godsRayEffect.godRaysMaterial.uniforms.decay,
                {
                    value  :1,
                    duration :1,
                    ease:"sine.out"
                }, 0.2 * customDuration
            ),
            timelineIntroScroll.to(
                this.eye.material,
                {
                    opacity: 0,
                    duration : 0.2 * customDuration,
                    ease:"power3.inOut"
                }, 0.25 * customDuration
            ),
            timelineIntroScroll.to(
                this.sun.material,
                {
                    opacity: 0,
                    duration : 0.4 * customDuration,
                    ease:"power3.inOut"
                },0.25 * customDuration
            ),
            timelineIntroScroll.to(
                this._group.position,
                {
                    z : "+=90",
                    duration : 0.6 * customDuration,
                    ease:"power4.inOut"
                },0.25 * customDuration
            ),
            timelineIntroScroll.set(this.eye, {visible : false }, 0.45 *  customDuration),
            timelineIntroScroll.set(this.ringsGroup, {
                visible : false
            }, 0.25 * customDuration)
            
              //At the End send both timelines
            [scrollInTimeline, timelineIntroScroll]

        )

    }


}