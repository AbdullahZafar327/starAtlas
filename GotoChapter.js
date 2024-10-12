import gsap from 'gsap'

export class GotoChapter{
    _container = document.querySelector(".ExploreNav")
     links = Array.from(this._container.querySelectorAll("a"));
    lines = Array.from(this._container.querySelectorAll(".ExploreNav-line"));
    linesInner = Array.from(this._container.querySelectorAll(".ExploreNav-lineInner"));
    linesProgress = Array.from(this._container.querySelectorAll(".ExploreNav-lineProgress"));
    diamonds = Array.from(this._container.querySelectorAll(".ExploreNav-diamond"));
    innerDiamonds = Array.from(this._container.querySelectorAll(".innerDiamond"));
    outerDiamonds = Array.from(this._container.querySelectorAll(".outerDiamond"));
    highlightDiamonds = Array.from(this._container.querySelectorAll(".highlightDiamond"));
    highlightDiamondOuters = Array.from(this._container.querySelectorAll(".highlightDiamondOuter"));
    diamondLabels = Array.from(this._container.querySelectorAll(".ExploreNav-diamond span"));

    timeline;
    chapterLengths;
    linksTimeline = gsap.timeline({paused:true})
    expandTime = 0.01;  // Speed of animations
    ease = "sine.inOut";  // Smoothing function for animations
    dummyTime = 0;  // Placeholder for timeline animation
    dummyTime2 = 0;

    constructor(gotoChapterCallBack){
        this._gotoChapter = gotoChapterCallBack
    }

    _setupTimeline(LengthOfChapters){
        this.chaptersLength = LengthOfChapters

        this.timeline = gsap.timeline({paused:true})
        this.timeline.to(this,{dummyTime: 1 , duration : 1} , 0)

        this.linksTimeline.to(this,{dummyTime2 : 1,duration:1 } , 0)
       
       let currentTime = 0;
       const easeFunction = this.ease;


       LengthOfChapters.forEach((length,index) => {
        let chapterTimeline = gsap.timeline({paused:true})
          

           // Animating diamond labels, highlight diamonds, inner and outer diamonds
        chapterTimeline.to(this.diamondLabels[index], { opacity: 1, duration: this.expandTime, ease: easeFunction }, 0);
        chapterTimeline.to(this.highlightDiamonds[index], { opacity: 1, duration: this.expandTime, ease: easeFunction }, 0);
        chapterTimeline.to(this.innerDiamonds[index], { opacity: 0, scale: 0.2, duration: this.expandTime, ease: easeFunction }, 0);
        chapterTimeline.to(this.outerDiamonds[index], { opacity: 0, duration: this.expandTime, ease: easeFunction }, 0);
        chapterTimeline.fromTo(this.highlightDiamondOuters[index], { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 0.2, duration: this.expandTime, ease: easeFunction }, 0);
        
        // Animating the lines' progress
        chapterTimeline.to(this.linesInner[index], { yPercent: 0, duration: this.expandTime, ease: easeFunction }, 0);
        chapterTimeline.to(this.linesProgress[index], { scaleY: 1, duration: 1 - this.expandTime, ease: "none" }, 0);

        // Reverse animations as the chapter ends
        chapterTimeline.to(this.linesInner[index], { yPercent: -50, duration: this.expandTime, ease: easeFunction }, 1 - this.expandTime);
        chapterTimeline.to(this.linesProgress[index], { scaleY: 0.535, opacity: 0, duration: this.expandTime, ease: easeFunction }, 1 - this.expandTime);
        chapterTimeline.to(this.diamondLabels[index], { opacity: 0, duration: this.expandTime, ease: easeFunction }, 1 - this.expandTime);
        chapterTimeline.to(this.highlightDiamonds[index], { opacity: 0, duration: this.expandTime, ease: easeFunction }, 1 - this.expandTime);
        chapterTimeline.to(this.innerDiamonds[index], { opacity: 1, scale: 1, duration: this.expandTime, ease: easeFunction }, 1 - this.expandTime);
        chapterTimeline.to(this.outerDiamonds[index], { opacity: 1, duration: this.expandTime, ease: easeFunction }, 1 - this.expandTime);
        chapterTimeline.to(this.highlightDiamondOuters[index], { scale: 0.8, opacity: 0, duration: this.expandTime, ease: easeFunction }, 1 - this.expandTime);

        this.timeline.to(chapterTimeline,{progress:1,duration:length , ease:"none"},currentTime)
        this.currentTime += length

       });

       this.links.forEach((link, index) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            this._gotoChapter(index);
            return false;
        });
    });

    // Handle window resize events
    window.addEventListener("resize", this.onResize);
  

    _onResize = () =>{
        window.innerWidth >= 768 && window.innerHeight >= 768
        ? this.buildLinksDisplaceTimeline(false)
        : this.buildLinksDisplaceTimeline(true);
    }

    _buildLinksDisplaceTimeLine = (isMobile  = false) =>{
        let currentTime = 0;
        let previousProgress = this.linksTimeline.progress();
        
        this.linksTimeline.pause(0).render(0).clear();
        
        // Adjust displacement of links based on screen size
        this.chapterLengths.forEach((length, index) => {
            let chapterTimeline = l.gsap.timeline({ paused: true });
            const linksToMove = this.links.slice(index + 1, this.lines.length + 1);
            
            // Animating displacement of links on mobile or desktop
            chapterTimeline.to(linksToMove, { y: isMobile ? 26 : 60, duration: this.expandTime, ease: this.ease }, 0);
            chapterTimeline.to(linksToMove, { y: 0, duration: this.expandTime, ease: this.ease }, 1 - this.expandTime);
            
            this.linksTimeline.to(chapterTimeline, { progress: 1, ease: "none", duration: length }, currentTime);
            currentTime += length;
        });
    
        this.linksTimeline.progress(previousProgress);
    }


    }
}