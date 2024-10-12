import * as THREE from 'three'
import gsap from 'gsap'
import { CameraController } from './cameraController';
import { CustomMaterial } from './CustomMaterial';
import { ChapterHandler } from './chapterHandler';
import { CreateRings } from './createRings';
import { MakeChoiceClass } from './makeChoice';
import CustomEase from 'gsap/CustomEase';

// t = menu
// e = camera
// i = cameraWrapper

// o = mainGroup
// s = cameraLookAtPoint
// a = exploreButton
// n = currentChapter
// r = chapterPOITitles
// l = index
// h = instance
// p = navLink

export class Chapter1 extends ChapterHandler{
    SCROLL_LENGTH = 11;
    dollyZoom;
    dollyZoom1;
    dollyZoom2;
    dollyZoom3;
    dollyZoom4;
    dollyZoom5;
    makeChoice;
    planetShipsOrbit;
    planetShipsOrbitContainer = new THREE.Object3D();
    ship;
    shipContainer = new THREE.Object3D();
    shipContainer2 = new THREE.Object3D();
    planets;
    ship2;


    constructor(menu,camera,cameraWrapper,mainGroup,cameraLookAtPoint,exploreButton,currentChapter,chapterPOITitle,index,thisInstance,navLink){
         super(menu,camera,cameraWrapper,mainGroup,cameraLookAtPoint,exploreButton,currentChapter,chapterPOITitle,index,thisInstance,navLink)

   
         this._initDollyZooms()
         this.makeChoice = new MakeChoiceClass(
            document.querySelectorAll(".MakeChoice")[0]
         )

         gsap.registerPlugin(CustomEase)
    }

    _initDollyZooms(){
        this.dollyZoom  = new CameraController(this._camera,this._cameraLookAtPoint)
        this.dollyZoom1 = new CameraController(this._camera,this._cameraLookAtPoint)
        this.dollyZoom2 = new CameraController(this._camera,this._cameraLookAtPoint)
        this.dollyZoom3 = new CameraController(this._camera,this._cameraLookAtPoint)
        this.dollyZoom4 = new CameraController(this._camera,this._cameraLookAtPoint)
        this.dollyZoom5 = new CameraController(this._camera,this._cameraLookAtPoint)
    }

    _getLoadItems(){
        return [
            ["/particles/mPlanets/bunny.drc", "planet_ships_orbit","drc"],
            ["/particles/pearce/bunny.drc", "ship","drc"],
            ["/particles/ship/bunny.drc", "planets","drc"],
          ];
    }

    _loadedItem(geometry,filePath,identifierName){
        let pointMaterial , pointCloud;

        if(identifierName === "planet_ships_orbit"){
            pointMaterial = new CustomMaterial(
                {
                    focusNear : 10,
                    focusFar: 16,
                    focusFadeOutLength : 9,
                    minBlur: 0.2,
                    maxBlur : 0.9,
                    minOpacity : 0.,
                    maxOpacity:0.126
                },
                this._menu,
                identifierName
            )

            pointCloud = new THREE.Points(geometry,pointMaterial)
            this.sortPoints.push(pointCloud)
            pointCloud.scale.set(
                -0.0005,
                0.005,
                0.0005
            )
            pointCloud.position.set(
                -5.57, 0, -80
            )
            pointCloud.visible = false
            pointCloud.name = identifierName;
            this.planetShipsOrbit = pointCloud
            this.planetShipsOrbitContainer.add(this.planetShipsOrbit)
            this.planetShipsOrbitContainer.name = "Planet-ships-Orbit-Container"
            this.chapterWrapper.add(this.planetShipsOrbitContainer) //Warning: this might be different from the usual code and hence needed to be removed later

            pointCloud = this.planetShipsOrbitContainer
            pointCloud.name = identifierName;
        }else if(identifierName === 'ship'){
            pointMaterial = new CustomMaterial(
                {
                    focusNear : 5.1,
                    focusFar: 29,
                    focusFadeOutLength : 2.6,
                    minBlur: 0.08,
                    maxBlur : 0.3,
                    minOpacity : 0.,
                    maxOpacity:0.192,
                    radiusScaleFactor: 100
                },
                this._menu,
                identifierName
            )
            pointCloud = new THREE.Points(geometry,pointMaterial)
            this.ship2 = pointCloud

            this.sortPoints.push(this.ship2,pointCloud)

            pointCloud.scale.set(-1,1,1)
            this.ship2.scale.set(-1,1,1)

            pointCloud.position.set(0, 0, -25.96)
            pointCloud.rotation.set(-0.16, 0, 0)
            pointCloud.visible = false

            this.ship  = pointCloud
            this.shipContainer.add(this.ship)
            this.shipContainer2.position.set(0, -2.81, 0)
            this.shipContainer2.add(this.ship2)

            this.chapterWrapper.add(this.shipContainer)
            pointCloud = this.shipContainer
            pointCloud.name = identifierName;


        }else if(identifierName === 'planets'){
            pointMaterial = new CustomMaterial(
                {
                    minOpacity: 0,
                    minBlur: 0.04,
                    maxOpacity: 0.5,
                    maxBlur: 0.21,
                    focusNear: 3,
                    focusFar: 150,
                    focusFadeOutLength: 3.76,
                    radiusScaleFactor: 100,
                },
                this._menu,
                identifierName
            )
            pointCloud = new THREE.Points(geometry,pointMaterial)
            this.sortPoints.push(pointCloud)

            this.planets = pointCloud

            pointCloud.scale.set(-1, 1, 1);
            pointCloud.position.set(0, 0, 80);

            this.exploreAnchor.position.set(-11.87, 8.7, 18.9);
            pointCloud.add(this.exploreAnchor);
            pointCloud.visible = false;

            pointCloud.name = identifierName;
            this.chapterWrapper.add(pointCloud);
        }
    }

    _setupScrollTimeline = () =>{
         const time = this.duration;

         this.scrollTimeline.to(this.chapterIntroClass.timeline,{
            progress: 1,
            duration:0.05 * time,
            ease:"none"
         },0)

         const zoomTimeline = gsap.timeline({paused:true})
         this.scrollTimeline.to(this,{
            scrollProgress : 1,
            duration:this.duration,
            ease:"none"
         },0)

         zoomTimeline.to({dummy:0},{dummy:1,duration:100},0)

         zoomTimeline.to(this.ringsMaterial.uniforms.focusFar, {
            value: 0.01,
            ease: "sine.out",
            duration: 2
        }, 0);
    
        zoomTimeline.to(this.ringsMaterial.uniforms.focusFadeOutLength, {
            value: 24,
            ease: "sine.out",
            duration: 2
        }, 0);
    
        // Cloud material animations (focus far adjustments)
        zoomTimeline.to(this.main.clusterCloud.material.uniforms.focusFar, {
            value: 51,
            ease: "sine.out",
            duration: 4
        }, 0);

        zoomTimeline.to(this.dollyZoom, {
            totalProgress: 1,
            duration: 7,
            ease: "sine.out",
            onUpdate: () => this.dollyZoom.update(110, 100, 15) // Update with specific values
        }, 0);
    
        zoomTimeline.to(this.dollyZoom1, {
            totalProgress: 1,
            duration: 12,
            ease: "power1.inOut",
            onUpdate: () => this.dollyZoom1.update(55, 3, 110)
        }, 10);
    
        zoomTimeline.to(this.dollyZoom2, {
            totalProgress: 1,
            duration: 6,
            ease: "sine.inOut",
            onUpdate: () => this.dollyZoom2.update(110, 20, 55)
        }, 30);
    
        zoomTimeline.to(this.dollyZoom3, {
            totalProgress: 1,
            duration: 12,
            ease: "power1.inOut",
            onUpdate: () => this.dollyZoom3.update(55, 3, 110)
        }, 40);
    
        zoomTimeline.to(this.dollyZoom4, {
            totalProgress: 1,
            duration: 6,
            ease: "sine.inOut",
            onUpdate: () => this.dollyZoom4.update(110, 20, 55)
        }, 70);
    
        zoomTimeline.to(this.dollyZoom5, {
            totalProgress: 1,
            duration: 10,
            ease: "sine.inOut",
            onUpdate: () => this.dollyZoom5.update(55, 8, 110)
        }, 80);

        this.scrollTimeline.to(zoomTimeline,{
            progress:1,
            duration:0.9 * time,
            ease:"none"
        },0)

        this.scrollTimeline.to(this.chapterPOIsAnimation[0].timeline,{
            progress : 1,
            duration: 0.25 * time,
            ease:"none"
        },0.08)

        this.scrollTimeline.to(this.chapterPOIsAnimation[1].timeline,{
            progress : 1,
            duration: 0.25 * time,
            ease:"none"
        },0.4)

        this.scrollTimeline.to(".ScrollHelpIndicator",{
            opacity:0,
            yPercent:100,
            ease:"none",
            duration:0.02 * time
        },0)

        this.scrollTimeline.set(this.planetShipsOrbit,{visible: true},0)
        this.scrollTimeline.to(this.planetShipsOrbit.material.uniforms.maxBlur,{
            value : 0.21,
            duration:0.16
        },0.2)

        this.scrollTimeline.fromTo(
            this.planetShipsOrbit.material.uniforms.maxOpacity,{
                value: 0.027
            },{
                value: 0.3,
                duration: 0.16
            },
            0.1
        )

        this.scrollTimeline.fromTo(
            this.planetShipsOrbit.rotation,
            {
              x: -0.15,
              y: -0.45
            },{
                x:0.15,
                y:0.45,
                duration:0.45
            },
            0.05
        )

        this.scrollTimeline.to(this.planetShipsOrbit.position,{
            y:-5.19,
            duration:0.45
        },0.05)

        this.scrollTimeline.to(this.planetShipsOrbit,{
            visible:false
        },0.3)

        this.scrollTimeline.set(this.ship,{visible:true},0.3)
        this.scrollTimeline.fromTo(this.ship.rotation,{
          z:-2
        },{
            z: 0 ,
            duration:0.4 * time,
            ease:"power1.inOut"
        },0.3)
        this.scrollTimeline.to(this.ship.rotation,{
            x: 0,
            duration:0.4 * time,
            ease:"power2.inOut"
        },0.3)

        this.scrollTimeline.fromTo(this.ship.rotation,{
          y: -0.37
        },{
            y: 0 ,
            duration:0.4 * time,
            ease:"power2.inOut"
        },0.3)

        this.scrollTimeline.fromTo(
            this.ship.position,
            {
                z: -5
            },{
                z: -30,
                duration: 0.5 * time,
                ease: "power1.out"
            },0.35
        )
        this.scrollTimeline.fromTo(
            this.ship.position,
            {
                y: -5
            },{
                y: 0,
                duration: 0.5 * time,
                ease: "power3.out"
            },0.35
        )

        this.scrollTimeline.set(this.ship,{visible:false},0.5)


        this.scrollTimeline.fromTo(this.shipContainer2.position,{
            z:-30
        },{
            z:-26,
            duration:0.4 * time,
            ease:"power1.out"
        },0.3)
        this.scrollTimeline.fromTo(
            this.ship2.position,{
                z:30
            },{
                z:-60,
                duration:0.4 * time,
                ease:"power1.out"
            },0.3
        )

        this.scrollTimeline.fromTo(
            this.ship2.rotation,{
                z:1.07
            },{
                z:0,
                duration:0.4 * time,
                ease:"power3.out"
            },0.3
        )

        this.scrollTimeline.set(this.ship2,{visible:false},0.5)


        this.scrollTimeline.fromTo(
            this.ship.material.uniforms.minBlur,{
                value: 0.02
            },{
                value: 0.08 ,
                duration: 0.2 * time,
                ease:"none"
            },0.3
        )

        this.scrollTimeline.from(
            this.ship.material.uniforms.maxOpacity,{
                value:0,
                duration:0.04 * time,
                ease:"none"
            },0.3
        )
        this.scrollTimeline.to(this.planetShipsOrbit,{ visible: false} , 0.6)

        this.scrollTimeline.set(this.planets,{visible: true} ,  0.6)
        this.scrollTimeline.fromTo(
            this.planets.material.uniforms.maxOpacity,{
                value: 0
            },{
                value:0.137,
                duration:0.05 * time,
                ease:"none"
            },0.65
        )

        this.scrollTimeline.to(
            this.planets.material.uniforms.maxOpacity,{
                value:0.537,
                duration:0.05 * time,
                ease:"none"
            },0.7
        )

        this.scrollTimeline.to(
            this.planets.material.uniforms.radiusScaleFactor,{
                value: 50,
                ease:"none",
                duration:0.3 * time
            },0.65
        )

        this.scrollTimeline.fromTo(
            this.planets.material.uniforms.minBlur,{
                value : 0.001
            },{
                value:0.045,
                duration:0.25 * time,
                ease:"none"
            },0.65
        )

        this.scrollTimeline.to(
            this.planets.rotation,{
               y:0.71,
               ease:"power1.out",
               duration:0.35 * time
            } , 0.65
        )

        this.scrollTimeline.to(
            this.planets.position,{
                z: 10,
                ease:"none",
                duration:0.3 * time
            },0.65
        )

        this.scrollTimeline.to(
            this.planets.position,{
                y: 2,
                ease:"power1.out",
                duration:0.3 * time
            },0.65
        )

        this.scrollTimeline.to(
            this.planets.material.uniforms.focusNear,{
                value: 20,
                ease:"none",
                duration:0.15 * time
            },0.65
        )

        this.scrollTimeline.to(
            this.planets.material.uniforms.focusFadeOutLength,{
                value: 3,
                duration:0.15 * time,
                ease:"none"
            },0.65
        )

        this.scrollTimeline.to(
            this.planets.material.uniforms.maxOpacity,{
                value:0,
                duration:0.1 * time,
                ease:"none"
            },0.8
        )

        this.scrollTimeline.set(this.planets,{
            visible: false
        },0.9)


        const exploreTimeline = gsap.timeline({
            paused: true,
            onUpdate: this._setActiveExploreItem()
        })


        exploreTimeline.set(
            this._exploreButton.container,{
                pointerEvents:"none",
                duration:0
            },0.19
        )
        
        exploreTimeline.set(
            this._exploreButton.container,{
                pointerEvents:"auto",
                duration:0
            },0.2
        )

        exploreTimeline.fromTo(
            this._exploreButton.container,{
                opacity:0
            },
            {
                opacity:1,
                ease:"sine.out",
                duration:0.2
            },0.2
        )

        exploreTimeline.fromTo(
            this._exploreButton.container,{
                opacity:1
            },
            {
                opacity:0,
                ease:"sine.out",
                duration:0.2
            },0.8
        )

        exploreTimeline.set(
            this._exploreButton.container,{
                pointerEvents:"none",
                duration:0
            },1
        )

        this.scrollTimeline.to(exploreTimeline,{
            progress:1,
            duration:0.25 * time,
            ease:"none"
        },0.65)

        const customEase = CustomEase.create(
             "custom",
            "M0,0 C0.632,0.674 0.656,0.708 0.786,0.854 0.852,0.928 0.918,1 1,1 "
        )

        return (
            this.scrollTimeline.to(
                this._cameraWrapper.position,{
                    z:130,
                    ease:customEase,
                    duration:this.duration
                },0
            ),
            this.scrollTimeline.to(
                this._cameraLookAtPoint.position,{
                    z:150,
                    ease:customEase,
                    duration:this.duration
                },0
            ),
            this.scrollTimeline.to(
                this.makeChoice.mainTimeline,{
                    progress:1,
                    duration: 0.3 * this.duration,
                    ease:"none"
                },
                0.7
            ),
            this.scrollTimeline.set(this.chapterWrapper, { visible: true }, 0.999),
            this.scrollTimeline.set(this.chapterWrapper, { visible: false }, 1),
            this.scrollTimeline
    
        
        )
    }

    _loadDone(){
        super._loadDone()
        this._createRings()
    }

    _createRings(){
       for (let i = 0; i < 14; i++) {
       const ring = new CreateRings(
        this.chapterWrapper,
        10,
        100,
        0,
        2 * Math.PI,
        this.menu,
        "ring",
        new THREE.Color(0x524802),
        null,
        this.ringsMaterial,
        `chapter-ring${i}`
       )
       this.rings.push(ring)
       ring.points.position.z = 10 - 10 * i

       gsap.to(ring.points.rotation,{
        z:Math.PI, 
        duration: 50 - 10 * i,
        repeat:-1,
        ease:"none"
       })
       }
    }
}