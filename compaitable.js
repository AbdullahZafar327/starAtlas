import { Signal } from "./EventSignals";

//TODO FIND OUT WHAT IS I,TEST IS?

export class Globals {
    // Static properties
    static browserDetect = (() => {
        // Modern browser detection using userAgentData if available
        if (navigator.userAgentData) {
            return { name: navigator.userAgentData.brands.map(brand => brand.name).join(', ') };
        } else {
            return { name: navigator.userAgent };
        }
    })();
    
    static SITE_WRAPPER = document.getElementById("SiteWrapper");
    static TEMPLATE_LAYER = document.getElementById("TemplateLayer");
    static TEMPLATE_MANAGER = null; // Initialize as needed
    static BODY = document.body;

    static IS_SAFARI = /safari/i.test(navigator.userAgent) && !/chrome|android/i.test(navigator.userAgent);
    static WEBP_SUPPORTED = false;
    static WEBP_SUPPORT_CHECKED = false;
    static SIGNAL_WEBP_SUPPORT_CHECKED = new Signal(); // Assuming Signal is defined elsewhere
    static IS_TOUCH_DEVICE = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
    static IS_IE = /MSIE|Trident/.test(navigator.userAgent); // IE detection
    static IS_WINDOWS = /win/i.test(navigator.userAgent);
    static IS_LINUX = /linux/i.test(navigator.userAgent);
    static IS_FIREFOX = typeof InstallTrigger !== 'undefined';
    static IS_EDGE = /Edg\/|Edge\//.test(navigator.userAgent);
    static MENU_OPEN = false;
    static grecaptcha = window.grecaptcha || null; // Assuming grecaptcha is available globally, fallback to null if not present

    // Static methods
    static someStaticMethod() {
        console.log('This is a static method.');
    }
}


export class GlobalsLanding {
    // Static properties
    static DEBUG = true;
    static browserDetect = (() => {
        // Modern browser detection using userAgentData if available
        if (navigator.userAgentData) {
            return { name: navigator.userAgentData.brands.map(brand => brand.name).join(', ') };
        } else {
            return { name: navigator.userAgent };
        }
    })();
    static SITE_WRAPPER = document.getElementById("App");
    static IS_TOUCH_DEVICE = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
    static SCRUB_DURATION = GlobalsLanding.IS_TOUCH_DEVICE ? 0.1 : 1;
    static IS_IE = /MSIE|Trident/.test(navigator.userAgent); // Adjust for IE detection
    static IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    static RENDERER_PIXEL_RATIO = Math.min(window.devicePixelRatio, GlobalsLanding.IS_IOS ? 2 : 1);
    static RENDERER_HEIGHT = 0; // Set dynamically if needed
    static CHAPTER_DISTANCE = 201.0252686870402;
    static SHOW_MARKERS = false;
    static MainScene = null; // Initialize as needed
    static AmbientAudio = null; // Initialize as needed
    static DOCUMENT_TOUCH = window.DocumentTouch;
    static IS_MOBILE = /Mobi|Android/i.test(navigator.userAgent);
    static IS_ANDROID = /Android/i.test(navigator.userAgent);
    static IS_SAFARI = /safari/i.test(navigator.userAgent) && !/chrome|android/i.test(navigator.userAgent);
    static PREMULTIPLY_ALPHA = false;
    static USE_STICKY = true;
    static VIDEO_OPEN = false;

    // Static methods
    static someStaticMethod() {
        console.log('This is a static method.');
    }
}
