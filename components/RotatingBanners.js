import gsap from "gsap";
import { Globals } from "../compaitable";
import { VideoPlayer } from "./VideoPlayer";

export class RotatingBanner{
    wrapper;
    bannerContainer;
    isSmallScreen;
    video = false;
    videos;
    videoPlayer;
    rotatingItems = []
    images = [];
    isVideoPlaying = false;
    isRotateLoaded = false

    lastScroll = 0;
    elementHeight = 0;
    rotatingIndex = 0;
    scrollDelta = 5;

    interval = 5000;
    rotatingTimer = false;
    greCaptcha



    constructor(wrapperElement){
        this.wrapper = wrapperElement;
        this.bannerContainer = wrapperElement.querySelector(".Rotating-Banners")
        this.greCaptcha = Globals.grecaptcha

        window.ROTATING_BANNER = this

        if(window.innerWidth < 768) this.isSmallScreen = true
        

        this.init()

        if(this.isSmallScreen) this.handleScroll()
    }

    handleEvent(event){
        switch (event.type) {
            case "scroll" : 
                 this.handleScroll(event) 
            break;
            case "resize" :
                 this.handleResize(event)
        }
    }


    init(){
        this.videos = this.wrapper.querySelectorAll("video")

         if(this.videos.length){
            this.loadVideoPlayer()
         }

         if(this.bannerContainer) this.initRotatingBanners()


         
    }

    async initRotatingBanners(){
        const rotatingItems = this.bannerContainer.querySelectorAll(".RotatingBanner")

        if(rotatingItems.length){
           document.body.classList.add("has-rotating-banner")

           for (let i = 0; i < rotatingItems.length; i++) {
              const image = rotatingItems[i].querySelector("img")
              if(image && image.src) await this.loadImage(img)
           }

           this.rotateBanner(this.rotatingIndex)

           gsap.to(
            this.wrapper,{
                opacity : 1,
                display :"block",
                duration:2,
                onComplete :() =>{
                this.elementHeight = this.wrapper.offsetHeight
                if(this.isSmallScreen) window.addEventListener("scroll",this.handleScroll.bind(this),false)
                }
            })

            this.bannerContainer.addEventListener("mouseenter",this.stopRotating,false)
            this.bannerContainer.addEventListener("mouseleave",this.startRotating,false)
        }

        this.isRotateLoaded = true
    }

    loadImage(img){
          return new Promise((resolve)=>{
            if(img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve()
          })
    }

    async loadVideoPlayer(){

        return Promise.all([
           
        ]).then(()=>{
            this.videoPlayer = new VideoPlayer(this.wrapper,this)
        })

    }

    handleScroll(){
        const body  = document.body;
        const scrollTop = document.documentElement.scrollTop
        

        if(Math.abs(this.lastScroll - scrollTop) <= this.scrollDelta){
            if(scrollTop > this.elementHeight && scrollTop > this.lastScroll){
                //down scrolling
                body.classList.remove("scroll-up")
                body.classList.add("scroll-down")
                this.startRotating()
            }else{
                body.classList.add("scroll-up")
                body.classList.remove("scroll-down")
                this.startRotating()
            }
        }

        this.lastScroll = scrollTop

    }

    startRotating(){
        if(this.isVideoPlaying || this.rotatingTimer || this.focusOnNewLetter) return
        if(this.rotatingItems.length <= 1) return
        

        this.rotatingTimer = setInterval(() => {
             this.rotateBanner(this.rotatingIndex)
        }, this.interval);

    }

    stopRotating(){
       if(this.rotatingTimer){
        clearInterval(this.rotatingTimer)
        this.rotatingTimer = false
       }
    }

    rotateBanner(currentIndex){
       const totalItems = this.rotatingItems.length;
       this.rotatingIndex = (currentIndex - 1) % totalItems
       this.rotatingItems.forEach((item,index)=>{
        item.classList.remove("active")
         if(index === this.rotatingIndex){
            item.classList.add("active")
         }
       })
    }

    onResize = () =>{
      if(window.innerWidth < 768){
                if(!this.isSmallScreen){
                    window.addEventListener("scroll",this.handleScroll,false)
                }

                this.isSmallScreen = true
      }else{
                if(this.isSmallScreen){
                    window.removeEventListener("scroll",this.handleScroll,false)
                }
                this.isSmallScreen = false
        }
      
     this.isRotateLoaded ? this.startRotating() : this.initRotatingBanners()
     if(this.videoPlayer) this.videoPlayer.resize()

    }

    onPlay(){
        if(!this.isVideoPlaying){
            this.isVideoPlaying = true
        }

        this.stopRotating()

    }

    onPause(){
        this.isVideoPlaying = false

    }

    onClose(){
       this.isVideoPlaying = false
       this.bannerContainer && this.startRotating()
    }

    selfDestroy = () =>{
        const currentContext = this;
        this.stopRotating()
        document.body.classList.remove("has-rotating-banner")

        window.removeEventListener("resize",this.onResize,false)
        window.removeEventListener("scroll",this.handleScroll,false)

        gsap.to(this.bannerContainer,
            {
               autoAlpha : 0,
               duration: .4,
               onComplete:()=>{
                currentContext.wrapper.remove()
               }

            }
        )
    }
}


