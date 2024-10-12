import { ModuleManager } from "./moduleManager";

export class TemplateManager{
     DomElement;
     templateManager
     modules = [];
     rotatingElements = null
     rotatingBanners = null 


    constructor(DomElement , templateManager){
        this.DomElement = DomElement
        this.templateManager = templateManager
        
    }

    // step:1 build all modules (self contained pieces of functionality) for the current template 
    buildModules(){
        const moduleElements = this.DomElement.querySelectorAll("[data-module]")
        LinkParser.getInstance().parseNodeList(this.DomElement.querySelectorAll("a:not(.noparse)")) //Select all <a> elements that do not have the class noparse.
        moduleElements.forEach(moduleElement => {
            let moduleName = moduleElement.getAttribute("data-module")
            let newModuleInstance = ModuleManager.create(moduleName,moduleElement,this)

            if(newModuleInstance){
                this.modules.push(newModuleInstance)
            }

        });
    }

    // This class, named Template, is designed to handle the lifecycle of a webpage or part of a webpage, particularly in cases where modules or components need to be dynamically loaded, animated, or displayed on the screen. It manages the process of showing and hiding content (referred to as templates), initializing functionality for that content (modules), and potentially displaying rotating banner elements within the template. The class ensures smooth transitions between different sections of the page, handling the addition and removal of elements in the DOM, while also making sure that each section is resized and cleaned up properly when needed.
}


class LinkParser{
    static instance;
    static templateManager;

    constructor(templateManager){
        LinkParser.templateManager = templateManager
    }

     // Method to get or create an instance of LinkParser
    static getInstance(templateManager){
        if(!LinkParser.instance){
            if(!templateManager){
                 console.error("First linkParser.getInstance() must receive templateManager")
                 return null
            }
            LinkParser.instance = new LinkParser(templateManager)
        }
     return LinkParser.instance
    }

    // Method to parse a single link and attach a click event listener
    parse(link,callBack){
        if(callBack){
            link._callback = callBack
        }

        link.addEventListener("click",this.onClick().bind(this))
    }

    // Method to parse a list of links
    parseNodeList(listOfLinks){
         for (let i = 0; i < listOfLinks.length; i++) {
              const link =  listOfLinks[i]
              this.parse(link)
         }
    }

     // Method to remove the click event listener from a single link
     kill(link){
        link.removeEventListener("click",this.onClick().bind(this))
        if(link._callback){
            link._callback = null
        }

     }

     onClick(event){
         if(event.ctrlKey || event.shiftKey || event.metaKey || (event.button && event.button === 1)){
            return //do nothing
         }

         event.preventDefault()

         const url = event.currentTarget.href || event.target.parentNode.href || "";
         let isInternalLink = this.checkInternalLink(url)
     }

    // Method to check if a link is internal
     checkInternalLink(url){
        let isInternalLink = false

        if(url.indexOf(window.location.origin) === 0){
            isInternalLink = truye
        }
     }

}