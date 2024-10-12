import { Globals, GlobalsLanding } from "../compaitable";
import videojs from 'video.js'
import 'videojs-resolution-switcher';
import 'videojs-http-source-selector';

export class VideoPlayer{
    videoPlayerInstance;
    parentInstance;

    videoElement
    videoWrapper;
    videoLayerElement

    playButtonElement;
    closeButtonElement;
    subtitlesButton;

    closeButtonRect;
    mousePosition;

    controlBarElements
    volumeBarElements;

    trailerLinks;

    shouldUseHls  = Globals.IS_SAFARI
    isControlBarHovered  = false
    isFirstSourceChange = true; 
   


    constructor(element,parent = null){
        this.videoWrapper = element.querySelector(".videoWrapper")
        this.videoElement = this.videoWrapper.querySelector(".videoWrapper video")
        this.trailerLinks = element.querySelectorAll(".watchTrailer")
        this.playButtonElement = this.videoWrapper.querySelector(".playButton")
        this.videoLayerElement = this.videoWrapper.querySelector(".VideoLayer")
        this.closeButtonElement = this.videoWrapper.querySelector(".closeLayerButton")
        this.mousePosition = {x: 0, y:0}

        if(parent){
            this.parentInstance = parent
        }

        if(Globals.IS_TOUCH_DEVICE){
            gsap.set(this.playButtonElement,{
                display:"none"
            })
        }

        this.getBoundingClient()
        this.initPlayer()
    }

    initPlayer(){
        // step1: get the source for video
        const sourceElements = Array.from(this.videoElement.querySelectorAll("source")).map((source)=>({
            src: source.dataset.src,
            type: source.type,
            res: source.getAttribute("res"),
            label : source.getAttribute("label")
        }))

        //get track elements if there are
        const trackElements = Array.from(this.videoElement.querySelectorAll("track"))
        const subtitleTracks = trackElements.map((track,index)=>({
            kind: track.kind,
            label: track.label,
            id:"mp4_source" + index,
            srclang : track.srclang,
            src: track.src
        }))
        
        if(this.shouldUseHls){
            for (let index = 0; index < trackElements.length; index++) {
               this.trackElements[index].remove()
            }
        }

        const videoOptions = {
            sources: sourceElements,
            html5: {
                nativeControlsForTouch:true
            },
            plugins: {
                videoJsResolutionSwitcher: {
                    default: this.shouldUseHls ? "high" : 876,
                    dynamicLabel: true
                },
                httpSourceSelector: {
                    default: "high"
                }
            },
            textTrackSettings: false, // Disable text track settings menu
            captions: true,
            autoplay: false,
            controlBar: {
                playToggle: false,
                captionsButton: false,
                chaptersButton: false,
                subtitlesButton: false,
                remainingTimeDisplay: false,
                currentTimeDisplay: false, // Use currentTimeDisplay instead of currentTime
                progressControl: {
                    seekBar: true
                },
                seekToLive: false,
                pictureInPictureToggle: false, // Corrected case here
                liveDisplay: false,
                durationDisplay: false,
                timeDivider: false,
                playbackRateMenuButton: false,
                customControlSpacer: false,
                descriptionsButton: false,
                audioTrackButton: false
            },
            errorDisplay: true // Show error screen if video fails
        };
        

        this.videoPlayerInstance = videojs(
            this.videoElement,
            videoOptions,
            ()=>{
                 this.videoPlayerInstance.addClass("video-trailer")
                 this.subtitlesButton = this.videoWrapper.querySelector(".vjs-subs-caps-button .vjs-control-text")
                 this.subtitlesButton.innerText = "CC"

                 var remoteTextTracks = this.videoPlayerInstance.remoteTextTracks();
                 const isUsingHls = this.shouldUseHls

                 this.videoPlayerInstance.addEventListener("resolutionchange",()=>{
                    let currentSource = this.videoPlayerInstance.src()

                    if(this.videoPlayerInstance.paused()&& this.playButtonElement.classlist.remove("is-playing")){
                       if(currentSource.indexOf(".m3u8") >= 0){
                        isUsingHls = true

                        for (let index = remoteTextTracks.length - 1 ; index >= 0; index--) {
                            if(remoteTextTracks[index].id.indexOf("mp4_source") >=0 || remoteTextTracks[index].src){
                                this.videoPlayerInstance.removeRemoteTextTrack(remoteTextTracks[index])
                            }
                            
                        }
                       }
                    }else{
                        if(isUsingHls){
                             // Add remote text tracks if switching away from HLS
                             subtitleTracks.forEach(function(track){
                                    this.videoPlayerInstance.addRemoteTextTrack(track)
                             }.bind(this))
                             isUsingHls = false
                        }
                    }

                    if(!this.isFirstSourceChange){
                        try {
                            this.videoPlayerInstance.play();
                        } catch (error) {
                            console.log("Cannot auto-resume playback");
                        }
                    }

                    this.isFirstSourceChange = false;
                 })

                 const titleComponent = this.videoPlayerInstance.controlBar.addChild("Component",{},0)
                 titleComponent.addClass("video-title")
                 titleComponent.el_.innerText = this.videoWrapper.dataset.videoTitle
                 
                 const volumePanel = this.videoPlayerInstance.controlBar.getCh8ild("VolumePanel").addChild("Component",{},0)
                 volumePanel.addClass("volumeBars");

                 this.volumeBarElements = []

                new Array(4).fill(0).forEach(()=>{
                    const bar = volumePanel.addChild("Component",{},0)
                    bar.addClass("bar")
                    this.volumeBarElements.push(bar.el_)
                })

                this.videoPlayerInstance.controlBar.getChild("FullscreenToggle").addChild("ClickableComponent",{},0).addClass("fullscreen-icon")
                this.controlBarElements = this.videoWrapper.querySelector(".vjs-control-bar")
                this.trailerLinks.forEach((link)=> link.addEventListener("click", this.onWatchTrailerClick))

                if(window.location.hash === "#trailer"){
                    this.onThumbnailClick()
                }

                 this.videoPlayerInstance.videoJsResolutionSwitcher()
                 this.videoPlayerInstance.httpSourceSelector();
            }
        )
    }


    bindEvents = () =>{
        this.videoPlayerInstance.on("play",this.onPlay)
        this.videoPlayerInstance.on("pause",this.onPause)
        this.videoPlayerInstance.on("useractive",this.onUserActive)
        this.videoPlayerInstance.on("userinactive",this.onUserInActive)
        this.videoPlayerInstance.on("volumechange",this.onVolumeChange)
        this.closeButtonElement.addEventListener("click",this.onCloseButtonClick,false)
        this.controlBarElements.addEventListener("mouseenter",this.menuMouseOver,false)
        this.controlBarElements.addEventListener("mouseleave",this.onMenuLeave,false)
        if(!Globals.IS_TOUCH_DEVICE){
            window.addEventListener("mousemove",this.mouseMove,false)
        }
    }

    menuMouseOver = () =>{
        this.isControlBarHovered = true
    }
    onMenuLeave = () =>{
        this.isControlBarHovered = false,false
    }

    onVolumeChange = () =>{
        if(this.videoPlayerInstance.muted){
            this.resetVolume()
        }else{
            this.randomizeVolumeBar()
        }
    }

    randomizeVolumeBar = () =>{
        this.volumeBarElements.forEach((bar)=>{
            this.animate(bar)
        })
    }

    resetVolume = () =>{
        this.volumeBarElements.forEach((bar)=>{
            gsap.killTweensOf(bar)
        })

        gsap.to(this.volumeBarElements,{
            scaleX:1,
            duration:.3,
            force3D: true
        })
    }

    animate = (bar) =>{
         gsap.to(bar,{
            scaleY: gsap.utils.random(1,4),
            duration : gsap.utils.random(.1,.3),
            repeat:1,
            ease:"sine.inOut",
            yoyo:true,
            onComplete:() =>{
                this.animate(bar)
            }
         })
    }

    onPlay = () =>{
        this.playButtonElement.classlist.add("is-playing")

        if(!this.videoPlayerInstance.muted){
            this.randomizeVolumeBar()
        }

        if(this.parentInstance && this.parentInstance.onPlay){
            this.parentInstance.onPlay()
        }

        //todo tracking
    }

    onPause = () =>{
        this.playButtonElement.classlist.remove("is-playing")
        this.volumeBarElements.forEach(bar => {
            gsap.killTweensOf(bar)
        });

        if(this.parentInstance && this.parentInstance.onPause){
            this.parentInstance.onPause()
        }
        
    }

    onCloseButtonClick = () =>{
        history.replaceState(null,null," ")

        if(this.videoPlayerInstance){
            this.videoPlayerInstance.pause()
        }

        this.unBindEvents()

        if(GlobalsLanding.AmbientAudio){
            GlobalsLanding.AmbientAudio.resume()
        }

        GlobalsLanding.VIDEO_OPEN  = false

        gsap.to(this.videoWrapper,{
            autoAlpha:0,
            pointerEvents:" "
        })

        if(this.parentInstance && this.parentInstance.onClose){
            this.parentInstance.onClose()
        }

        //TODO Tracing and Analytics
    }

    onWatchTrailerClick = (event = null)=> {
        if(event){
            event.preventDefault()
        }
        
        this.bindEvents()

        if(GlobalsLanding.AmbientAudio){
            GlobalsLanding.AmbientAudio.stop()
        }

        gsap.to(
            this.videoWrapper,
            {
                autoAlpha :1,
                pointerEvents:"auto",
                onComplete:() =>{
                    GlobalsLanding.VIDEO_OPEN = true
                }
            }
        )

        if(this.videoPlayerInstance){
            this.videoPlayerInstance.play()
        }else{
            console.error("Error playing video....")
        }
    }

    onUserActive = () =>{
        this.DOMPlayButton_.classList.remove("user-inactive")
    }

    onUserInActive = () =>{
        this.DOMPlayButton_.classList.add("user-inactive")
    }

    kill = () =>{
        if(this.videoPlayerInstance){
            this.videoPlayerInstance.dispose()
        }

        this.trailerLinks.forEach((link) => link.removeEventListener("click",this.onWatchTrailerClick))
        this.unBindEvents()
    }

    mouseMove = (e) =>{
        this.mousePosition.x = e.clientX
        this.mousePosition.y = e.clientY

        gsap.to(
            this.playButtonElement,
            {
                duration:.2,
                ease:"none",
                x: this.mousePosition.x,
                y: this.mousePosition.y
            }
        )

        const playerBoundingBox = this.videoPlayerInstance.controlBar.el().getBoundingClientRect()

        if(this.isControlBarHovered || this.mousePosition.y > playerBoundingBox.top - 100 || this.mousePosition.x > this.closeButtonRect.x - 100 && this.mousePosition.y < this.closeButtonRect.y + 100){
            this.onUserInActive()
        }else{
            this.onUserActive()
        }
    }

    unBindEvents = () =>{
        this.videoPlayerInstance.off("play",this.onPlay)
        this.videoPlayerInstance.off("pause",this.onPause)
        this.videoPlayerInstance.off("useractive",this.onUserActive)
        this.videoPlayerInstance.off("userinactive",this.onUserInActive)
        this.videoPlayerInstance.off("volumechange",this.onVolumeChange)
        this.closeButtonElement.removeEventListener("click",this.onCloseButtonClick,false)
        this.controlBarElements.removeEventListener("mouseenter",this.menuMouseOver,false)
        this.controlBarElements.removeEventListener("mouseleave",this.onMenuLeave,false)
        if(!Globals.IS_TOUCH_DEVICE){
            window.removeEventListener("mousemove",this.mouseMove,false)
        }
    }

    handleResize = () =>{
        this.closeButtonRect = this.closeButtonElement.getBoundingClientRect()
    }
}