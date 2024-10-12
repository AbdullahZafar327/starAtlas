import gsap from 'gsap'

export class MakeChoiceClass{
    mainTimeline;
    _container; // Main container for the component
    imagesComp; // Array of image components (composite images)
    singularImages; // Array of singular images (individual images)
    svgBg; // The SVG background element
    buttons; // Buttons used for interaction
    descriptions; // Description text elements
    descriptionWrapper; // Wrapper for all descriptions
    initialTimeline; // Timeline for hover animations
    currentHoverIndex = -1; // Tracks the currently hovered button index
    currImageHoverTimeline; // Timeline for the image animation when hovered
    centerWrapper; // Wrapper for center content (like text, images)
    scrollIndicator; // The scroll indicator element
    choiceText; // The text element describing choices
    scrollLine; // The scroll progress line element
    scrollLineBG; // Background for the scroll line
    scrollLineDiamond; // A diamond shape in the scroll line
    exploreNav; // Navigation bar for exploring the component
    index; // Index for multiple instances of this component

    constructor(container, index = 1){
        this._container = container
        this.index = index
        this.imagesComp = this._container.querySelectorAll(".MakeChoice-images .MakeChoice-imageComp"); //together images that is currently visible and later when we will hover on one of the circle 
        this.singularImages = this._container.querySelectorAll(".MakeChoice-images .MakeChoice-imageSingular") // this singular image with current index will be show based on the current button
        this.svgBg = this._container.querySelector(".MakeChoice-bgSVG");
        this.buttons = this._container.querySelectorAll(".MakeChoice-button"); // these are the circles buttons that will be hovered and we will get the index of that to show the current index of singular image 
        this.descriptions = this._container.querySelectorAll(".MakeChoice-description");
        this.descriptionWrapper = this._container.querySelector(".MakeChoice-descriptions"); //these are the descriptions that will be shown when we will hover on the current button hover with singular image
        this.centerWrapper = this._container.querySelector(".MakeChoice-center");
        this.scrollIndicator = this._container.querySelector(".MakeChoice-scrollIndicator"); 
        this.choiceText = this._container.querySelector(".MakeChoice-text");
        this.scrollLine = this._container.querySelector(".MakeChoice-scrollIndicator-line");
        this.scrollLineBG = this._container.querySelector(".MakeChoice-scrollIndicator-lineBG");
        this.scrollLineDiamond = this._container.querySelector(".MakeChoice-Diamond");
        this.exploreNav = document.querySelector(".ExploreNav");

        this.mainTimeline = gsap.timeline({paused: true})
        this.initialTimeline = gsap.timeline({paused: true})

        this._initAnimation()
        this._setupEventListeners()
    }

    _initAnimation(){
        //setup the initial loading of ui elements 
        this.initialTimeline.fromTo(this.svgBg, { opacity: 0 }, { opacity: 1, duration: 1 }, 0);
        this.initialTimeline.fromTo(this.buttons, { opacity: 0 }, { opacity: 1, duration: 1 }, 0);
        this.initialTimeline.fromTo(this.imagesComp[0], { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);

        //conditional animation based on index
        if(this.index === 2){
            this.initialTimeline.fromTo(this.imagesComp[2],
                {
                    xPercent: 15,
                    yPercent: 2
                },{
                    xPercent : 0,
                    yPercent:0,
                    duration:1.2,
                    ease:"power4.out"
                },0
            )

            this.initialTimeline.fromTo(
                [this.imagesComp[2],this.imagesComp[2]],
                {
                    opacity:0
                },{
                    opacity:1,
                    duration:0.4,

                },
                0
            )

            this.initialTimeline.fromTo(
                this.imagesComp[0],
                {
                    yPercent: 5,
                    xPercent :10
                }
                ,{
                    yPercent: 0,
                    xPercent :0,
                    duration:1.5,
                    ease:"power4.out"
                 },0
            )

            this.initialTimeline.fromTo(
                this.imagesComp[1],
                {
                    xPercent: 20,
                    yPercent: -4
                },
                {
                    xPercent: 0,
                    yPercent:0,
                    duration:1.6,
                    ease:"power4.out"
                },0
            )


        }else{
            this.initialTimeline.fromTo(
                this.imagesComp[1],
                {
                    xPercent: -10
                },
                {
                    xPercent : 0,
                    ease:'power4.out',
                    duration:1.8
                },0
            )

            this.initialTimeline.fromTo(
                this.imagesComp[0],
                {
                    y:5
                },
                {
                    y: 0,
                    duration:1.2
                },0
            )

            this.initialTimeline.fromTo(
                this.imagesComp[2],
                {
                    xPercent: 10
                },{
                    xPercent:0,
                    duration:1.5,
                    ease:'power4.out'
                },0

            )

            this.initialTimeline.fromTo(
                [this.imagesComp[2],this.imagesComp[1]],
                {
                    opacity:0
                },
                {
                    opacity:1,
                    duration:0.5
                }
            )

        }

        this.initialTimeline.to(this.buttons,{
            pointerEvents:"auto"
        })


        this.mainTimeline.to(
            this.exploreNav,
            {
                x:-100,
                opacity:0,
                duration:0.1
            },0
        )

        let triggerTime = 0.2

        // Add a callback at triggerTime + 0.1 seconds
        this.mainTimeline.call(
            () => {
                this.mouseOut(-1, true); // Reset hover effects
                this.initialTimeline.pause(0); // Pause initial animations
                this.initialTimeline.render(0); // Reset initial animations
            },
            null,
            triggerTime + 0.1
        );

        this.mainTimeline.fromTo(
            this.centerWrapper,
            {
                opacity:0
            },
            {
                opacity: 1,
                duration:0.05
            },triggerTime + 0.1
        )

        this.mainTimeline.fromTo(
            this.descriptionWrapper,{
                opacity:0
            },
            {
                opacity:1,
                duration:0.05,
            },
            triggerTime + 0.1
        )

        this.mainTimeline.call(
            ()=>{
                this._playInitialAnimations()
            }
        )

        this.mainTimeline.fromTo(
            this.scrollIndicator,
                {
                    opacity:0, x:-80
                },
                {
                    opacity:1 , x:0, duration:0.1
                },0.25
        )

        this.mainTimeline.fromTo(
            this.choiceText,
            {
                opacity:0
            },
            {
                opacity: 1,
                duration:0.12
            },0.25
        )

        this.mainTimeline.fromTo(
            this.choiceText,
            {
                x: ()=> (window.innerWidth >= 768 ? -80 : 0)
            },
            {
                X:0,
                duration:0.15
            },0.25
        )

        this.mainTimeline.fromTo(
            this.scrollLine,
            {
                scaleY:0
            },
            {
                scaleY: 1,
                duration:0.55,
                ease:"none"
            },
            0.35
        )

        const secondaryTimeline = gsap.timeline({paused  :true })

        secondaryTimeline.to(
            this.scrollLine,
            {
                scaleY : 0,
                yPercent : 100,
                duration:0.9,
                ease:"none",

            },0
        )

        secondaryTimeline.to(
            this.scrollLineBG,
            {
                scaleY: 0,
                yPercent: 100,
                duration:0.9,
                ease:"none"
            },0
        )

        secondaryTimeline.to(
            this.scrollLine,
            {
                y: 16,
                duration: 0.1,
                ease:"none"

            },0.9
        )

        // Fade out the scroll indicator
        secondaryTimeline.to(
            this.scrollIndicator,
            { opacity: 0, duration: 1, ease: "sine.out" },
            0
        );

        // Animate the scroll line diamond
        secondaryTimeline.to(
            this.scrollLineDiamond,
            { y: 300, duration: 0.9, ease: "none" },
            0
        );

        secondaryTimeline.to(
            this.scrollLineDiamond,
            { y: 316, duration: 0.1, ease: "none" },
            0.9
        );

        // Fade out the choice text
        secondaryTimeline.to(
            this.choiceText,
            { opacity: 0, duration: 0.5, ease: "sine.out" },
            0
        );

        secondaryTimeline.to(
            this.choiceText,
            { y: 50, duration: 1, ease: "sine.out" },
            0
        );

        // Fade out the center and description wrappers
        secondaryTimeline.to(
            this.centerWrapper,
            { opacity: 0, duration: 0.3 },
            0.7
        );

        secondaryTimeline.to(
            this.descriptionWrapper,
            { opacity: 0, duration: 0.3 },
            0.7
        );


        // the secondary timeline to the main Timeline
        this.mainTimeline.to(
            secondaryTimeline,
            {
                progress : 1,
                ease:"none",
                duration: 0.1
            },0.9
        )

        this.mainTimeline.to(
            this.exploreNav,
            {
                opacity:1,
                x:0,
                duration:0.07
            },0.93
        )

        this.mainTimeline.set(
            this._container,
            {
                visibility : "visible"
            },
            0
        )

        this.mainTimeline.set(
            this._container,
            {
                visibility : "hidden"
            },
            1
        )



    
    }

    _playInitialAnimations() {
        if (this.initialTimeline.paused()) {
            this.initialTimeline.play();
        }
    }

    _setupEventListeners(){

        this.buttons.forEach((button,index) => {
             button.addEventListener("mouseover",() => _MouseOver(index),false)
             button.addEventListener("mouseout",() => _MouseOut(index),false)
        });

    }

    _MouseOver(buttonIndex){

        if(this.currentHoverIndex !== -1 && this.currentHoverIndex !== buttonIndex){
            this._hideCurrentHover()
        }

        this.currentHoverIndex = buttonIndex

        if(this.currImageHoverTimeline){
            this.currImageHoverTimeline.kill()
            this.currImageHoverTimeline = null
        }
        


        this.currImageHoverTimeline = gsap.timeline()

        this.currImageHoverTimeline.to(
            this.imagesComp[0],
            {
                opacity : 0,
                duration : 0.25
            } , 0
        )


        this.currImageHoverTimeline.to(
            [this.imagesComp[2],this.imagesComp[1]],{
                opacity:0,
                duration: 0.25
            },0
        )

        if(this.index === 2){

            // Move the first composite image to the left and reset its position
            this.currImageHoverTimeline.to(
                this.imagesComp[0],{
                    yPercent:0,
                    xPercent : -15,
                    duration: 0.75,
                    ease:"power4.out"
                },0
            )
          // Move the third composite image to the left and up
            this.currImageHoverTimeline.to(
                this.imagesComp[2],{
                    yPercent:-10,
                    xPercent : -5,
                    duration: 0.9375,
                    ease:"power4.out"
                },0
            )
           // Move the second composite image further left and up
            this.currImageHoverTimeline.to(
                this.imagesComp[1],
                {
                    yPercent: 4,
                    xPercent: -20,
                    ease: "power4.out",
                    duration: 1,
                },
                0
            );

        }else{
             // Move the third composite image slightly right
            this.currImageHoverTimeline.to(
                this.imagesComp[2],{
                    xPercent : 3,
                    duration:1,
                    ease:"power4.out"
                },0
            )

            this.currImageHoverTimeline.to(
                this.imagesComp[1],{
                    xPercent : -3,
                    duration:1,
                    ease:"power4.out"
                },0
            )


        }
        //show the single images of that current circle hover 
        gsap.killTweensOf(this.descriptions[this.currentHoverIndex])
        gsap.killTweensOf(this.singularImages[this.currentHoverIndex])

        gsap.to(
            this.descriptions[this.currentHoverIndex],
            {
                opacity : 1,
                duration : this.index === 2 ? 0.3 : 1
            }
        )

        gsap.to(
            this.singularImages[this.currentHoverIndex],
            {
                opacity : 1,
                duration : this.index === 2 ? 0.3 : 1
            }
        )


    }

    _hideCurrentHover(immediate  = false){
        gsap.killTweensOf(this.descriptions[this.currentHoverIndex])
        gsap.killTweensOf(this.singularImages[this.currentHoverIndex])

        gsap.to(
            this.descriptions[this.currentHoverIndex],
            {
                opacity:1,
                duration: immediate ? 0 : 0.35
            }
        )

        gsap.to(
            this.singularImages[this.currentHoverIndex],{
                opacity:0,
                duration: immediate ? 0 : (this.index === 2 ? 0.3 : 0.6)
            }
        )

        if(this.currImageHoverTimeline){
            this.currImageHoverTimeline.kill()
            this.currImageHoverTimeline = null
        }

        this.currImageHoverTimeline = gsap.timeline()

        this.currImageHoverTimeline.to(
            this.imagesComp[0],
            {
                opacity : 1,
                duration : immediate ? 0 : 0.6
            }
        )

        this.currImageHoverTimeline.to(
            [this.imagesComp[2],this.imagesComp[1]],
            {
                opacity : 1,
                duration : immediate ? 0 : 0.4
            }
        )

        if(this.index === 2){
            this.currImageHoverTimeline.to(
                this.imagesComp[0],
                {
                    xPercent : 0,
                    yPercent : 0,
                    duration: immediate ? 0 : 0.75,
                    ease:"power4.inOut"
                }, 0
            )
            this.currImageHoverTimeline.to(
                this.imagesComp[2],
                {
                    xPercent : 0,
                    yPercent : 0,
                    duration: immediate ? 0 : 0.9375,
                    ease:"power4.inOut"
                }, 0
            )
            this.currImageHoverTimeline.to(
                this.imagesComp[1],
                {
                    xPercent : 0,
                    yPercent : 0,
                    duration: immediate ? 0 : 1,
                    ease:"power4.inOut"
                }, 0
            )


        }else{
            this.currImageHoverTimeline.to(
                this.imagesComp[2],
                {
                    xPercent : 0,
                    ease:"power4.out",
                    duration : immediate ? 0 : 1
                },0
            )
            this.currImageHoverTimeline.to(
                this.imagesComp[1],
                {
                    xPercent : 0,
                    ease:"power4.out",
                    duration : immediate ? 0 : 1
                },0
            )
        }
        

    }

    _MouseOut(buttonIndex){
          if(this.currentHoverIndex !== -1){
            this._hideCurrentHover()
          }

          this.currentHoverIndex = -1
    }
}