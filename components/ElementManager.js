export class ElementManager{
    element = null; // Store the element passed to the constructor
    template = null; // Store the template passed to the constructor
    killed = false; // Flag to indicate if the instance is "killed"
    animatedIn = false; // Flag to check if the instance is animated in
    triggers = []; // Array to hold trigger elements
    components = []; // Array to hold component elements

    constructor(element,template){
        this.element = element
        this.template = template
        
    }

    killed = () =>{
        this.killed = true
    }
}