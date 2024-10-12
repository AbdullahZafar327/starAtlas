import gsap from "gsap";
import SplitText from "gsap-trial/SplitText";

export class TextSplitIntroAnimation {
    // Define the timeline and pause it for manual triggering on scroll
    timeline = gsap.timeline({ paused: true });
    Chars1; // To store the SplitText instance for the first heading
    Chars2; // To store the SplitText instance for the second heading

    constructor(chapterIntroDiv) {
        // Initialize the text split
        this._chapterIntroDiv = chapterIntroDiv;
        gsap.registerPlugin(SplitText);
        this._initInitialState();  // Initialize the split texts
        this._initFirstHeading();  // Initialize animation for the first heading
        this._initSecondHeading(); // Initialize animation for the second heading
        this._initAnimationEnd();  // End the animation
    }

    // Initial state setup for the animations
    _initInitialState() {
        // Get the heading elements from the chapterIntroDiv
        const heading1 = this._chapterIntroDiv.querySelector("h1");
        const heading2 = this._chapterIntroDiv.querySelectorAll("h1")[1];

        // Split the texts into characters
        this.Chars1 = new SplitText(heading1, { type: "chars", charsClass: "blurCharacter" });
        this.Chars2 = new SplitText(heading2, { type: "chars" });


        // Wrapping each character in a <span> for better control over the animation
        this.Chars1.chars.forEach((char) => {
            char.innerHTML = `<span> + ${char.innerText} + </span>`;
        });
        
        this.Chars2.chars.forEach((char) => {
            char.innerHTML = `<span> + ${char.innerText} + </span>`;
        });


        // Set the initial states for the characters
        gsap.set(this.Chars1.chars, { opacity: 0, force3D: true });
        gsap.set(this.Chars2.chars, { opacity: 1, force3D: true });
        gsap.set(this._chapterIntroDiv, { visibility: "hidden" });

        // Bind the animation timeline to make the div visible at the start of the animation
        this.timeline.set(this._chapterIntroDiv, { visibility: "visible" }, 0);
        this.timeline.to(this._chapterIntroDiv.querySelector(".ChapterIntro-lead"), { opacity: 0, force3D: true }, 0);
        this.timeline.to(this._chapterIntroDiv.querySelector(".ChapterIntro-number"), { opacity: 0, force3D: true }, 0);
    }

    // Animate the first heading (appearing and disappearing)
    _initFirstHeading() {
        this.timeline.to(this.Chars1.chars, {
            opacity: 1,
            duration: 0.5,
            stagger: {
                each: 0.1,
                from: "edges",
                ease: "power2.inOut",
            },
            force3D: true
        }, 0);

        this.timeline.to(this.Chars1.chars, {
            opacity: 0,
            duration: 0.5,
            stagger: {
                each: 0.1,
                from: "edges",
                ease: "power2.inOut",
            },
            force3D: true
        }, 0.5);

        this.timeline.fromTo(this.Chars1.chars,
            { x: 30, force3D: true },
            {
                x: 0,
                duration: 0.5,
                ease: "quad.inOut",
                force3D: true,
                stagger: {
                    from: "edges",
                    each: 0.1,
                    ease: "power2.inOut"
                }
            }, 0
        );
    }

    // Animate the second heading
    _initSecondHeading() {
        this.timeline.to(this.Chars2.chars, {
            opacity: 1,
            duration: 0.5,
            stagger: {
                each: 0.1,
                from: "edges",
                ease: "power2.inOut",
            },
            force3D: true
        }, 0.5);

        this.timeline.to(this.Chars2.chars, {
            opacity: 0,
            duration: 0.5,
            stagger: {
                each: 0.1,
                from: "edges",
                ease: "power2.inOut",
            },
            force3D: true
        }, 0);
    }

    // End the animation and hide the element
    _initAnimationEnd() {
        this.timeline.set(this._chapterIntroDiv, { visibility: "hidden" });
    }
}
