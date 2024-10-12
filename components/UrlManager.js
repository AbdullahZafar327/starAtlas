class URLManager {
    urlParameters = {}; // Changed urlParams to urlParameters for clarity
    originalUrlString = ""; // Changed originalUrl to originalUrlString for clarity
    parametersToClean = [ // Changed cleanUpParams to parametersToClean for clarity
        "utm_source", 
        "utm_id", 
        "utm_medium", 
        "utm_campaign", 
        "utm_term", 
        "utm_content", 
        "adset", 
        "adsetid", 
        "deep_link", 
        "referrer", 
        "affiliate_id"
    ];

    // Constructor for the URLManager class
    constructor() {}

    // This method saves URL parameters from the current URL
    saveParametersFromUrl() {
        let queryString = window.location.search.substring(1); // Changed t to queryString for clarity
        if (queryString.length) { // If there are parameters in the URL
            // Converts the query string into an object
            let parametersObject = Object.fromEntries(new URLSearchParams(queryString)); // Changed e to parametersObject for clarity
            this.urlParameters = parametersObject; // Saves the parameters into urlParameters
        }
        // Cleans the parameters from the URL by removing unnecessary ones
        return this.cleanParametersFromUrl(), 
               this.urlParameters; // Returns the saved URL parameters
    }

    // This method cleans the URL by removing unwanted parameters
    cleanParametersFromUrl() {
        let currentLocation = window.location; // Changed t to currentLocation for clarity
        let urlObject = new URL(currentLocation.toString()); // Changed e to urlObject for clarity
        
        // Iterates over the parameters to remove them from the URL
        return this.parametersToClean.forEach((param) => urlObject.searchParams.delete(param)), 
               // If the browser supports history.replaceState, update the URL without reloading
               history.replaceState && (this.originalUrlString = currentLocation.toString(), 
               history.replaceState({}, "", urlObject.toString())), 
               urlObject.toString(); // Returns the cleaned-up URL as a string
    }
}

// Creates a new instance of URLManager
const urlManagerInstance = new URLManager; // Changed i to urlManagerInstance for clarity


// How Does It Work?
// Initialization: When you create a UrlManager, it starts with an empty backpack, ready to fill with parameters.

// Save Parameters: When you visit a page, it checks the current URL for any parameters and saves them in its backpack.

// Clean Up: If you decide that some parameters are no longer needed, it can clean them out and keep your URL neat.

// Retrieve Information: Anytime you need to know what parameters are saved or want to see the original URL, you can ask the UrlManager, and it will provide you with that information.

// In Summary
// So, the UrlManager class is like a smart assistant for URLs. It helps keep track of important details about the pages you visit, cleans up any clutter, and ensures you have everything you need for your website. This way, whether you’re building a project or just exploring the web, you have a reliable tool by your side to manage your URLs effectively!
