import gsap from "gsap"

export class POIAnimationUpward{
    timeline = gsap.timeline({paused:true})
    constructor(title){
        this._title = title
        this._initAnimation()
    }

    _initAnimation(){
        this.timeline.fromTo(
            this._title,{
             y:80
            },
            {y: 0 , duration : 0.3 , ease: "power3.out"},
            0
        )
        this.timeline.to(
            this._title,
            {opacity: 1 , duration : 0.2 , ease: "sin.out"},
            0
        )
        this.timeline.to(
            this._title,
            {opacity: 0 , duration : 0.2 , ease: "sin.out"},
            0.8
        )
    }
}