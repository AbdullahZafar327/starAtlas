class Tracker {
    sessionId = null; // Stores the unique identifier for the session
    hasSentUrlParams = false; // Flag to check if URL parameters have been sent
    pageViewParams = { // Parameters related to the page view
        utm_source: "source",
        utm_medium: "medium",
        utm_campaign: "referral_campaign",
        utm_term: "term",
        utm_content: "content",
        adset: "adset",
        adsetId: "adsetid" // Changed to camelCase for consistency
    };
    initialParams = { // Initial parameters for the tracker
        utm_source: "channel",
        utm_medium: "medium",
        utm_campaign: "campaign",
        utm_term: "term",
        utm_content: "content",
        adset: "adset",
        deepLink: "deep_link", // Changed to camelCase for consistency
        referrer: "referral",
        affiliateId: "affiliate_id" // Changed to camelCase for consistency
    };

    // Initializes the tracker by checking the cookie and tracking the session event
    init() {
        this.checkSessionCookie();
        this.trackEvent("session");
    }

    // Checks if a tracking cookie exists and assigns its value to sessionId
    checkSessionCookie() {
        const cookieValue = n.getCookie("tracker");
        if (cookieValue !== null) {
            this.sessionId = cookieValue;
        }
    }

    // Initializes the session cookie if it does not exist
    initFirstVisitCookie() {
        if (n.getCookie("tracker") === null) {
            this.sessionId = Math.random().toString(36).substr(2, 15); // Generate a random session ID
            n.setCookie("tracker", this.sessionId, 30); // Set the cookie to expire in 30 days
            let eventDetails = { description: "Star Atlas Initializer" }; // Event details for tracking
            Object.assign(eventDetails, this.getUrlParameters(this.initialParams)); // Merge initial params with URL params
            this.trackEvent("init", eventDetails); // Track the initialization event
        }
    }

    // Tracks page view events, sends URL parameters if not already sent
    trackPageView() {
        let eventDetails = {
            event_type: "page_load",
            description: window.location.href // Current page URL
        };
        if (!this.hasSentUrlParams) {
            Object.assign(eventDetails, this.getUrlParameters(this.pageViewParams)); // Add URL parameters to event details
            this.hasSentUrlParams = true; // Set the flag to true to indicate parameters have been sent
        }
        this.trackEvent("adreferral", eventDetails); // Track the page load event
    }

    // Tracks click events with details about the clicked element and destination
    trackClick(element = "", action = "", destination = "") {
        const previousPath = i.Globals.TEMPLATE_MANAGER.getPreviousPath(); // Get the previous page path
        const baseUrl = `${window.location.protocol}//${window.location.host}`; // Get base URL
        const currentUrl = previousPath !== "initialLoad" ? `${baseUrl}/${previousPath}` : baseUrl; // Determine the current URL
        let finalDestination = destination === "" ? null : baseUrl + destination; // Determine the final destination URL
        if (typeof destination === "string") {
            if (destination.indexOf("#") === 0) {
                finalDestination = destination; // If it's a hash, use it directly
            }
            if (destination.indexOf("http") > -1) {
                finalDestination = destination; // If it's a full URL, use it directly
            }
        }
        this.trackEvent("click", {
            click_ts: new Date().toISOString(), // Timestamp of the click event
            cookie_id: this.sessionId, // Session ID
            element: element, // Element clicked
            action: action, // Action taken
            url: window.location.href, // Current page URL
            destination_url: finalDestination // Final destination URL
        });
        window.fb("track", "click", {
            element: element,
            action: action,
            url: currentUrl,
            destination_url: finalDestination
        }); // Track the event with Facebook
    }

    // Tracks engagement events
    trackEngagement(actionType = "", appId = "", value = "") {
        this.trackEvent("engagement", {
            event_ts: new Date().toISOString(), // Timestamp of the engagement event
            action_type: actionType, // Type of action taken
            app_id: appId, // Application ID
            char_value_1: value // Additional value related to engagement
        });
        window.fb("track", "engagement", {
            action_type: actionType // Track engagement with Facebook
        });
    }

    // Tracks social media interactions
    trackSocial(actionType = "", platform = "") {
        this.trackEvent("social", {
            event_ts: new Date().toISOString(), // Timestamp of the social event
            action_type: actionType, // Type of action taken
            platform: platform // Social media platform
        });
    }

    // General method for tracking events
    trackEvent(eventType = "", eventData = {}) {
        if (!("event_ts" in eventData)) {
            eventData.event_ts = new Date().toISOString(); // Add event timestamp if not present
        }
        if (!("cookie_id" in eventData) && this.sessionId) {
            eventData.cookie_id = this.sessionId; // Add session ID if present
        }
        if (window.SFLoad && window.sf && typeof window.sf.logEvent !== "undefined") {
            window.sf.logEvent(eventType, eventData); // Log the event if the SF library is available
        }
        return true; // Return true to indicate success
    }

    // Tracks Facebook conversion events
    trackFBConversion(contentId = "", appId = "") {
        window.fb("track", "Purchase", {
            content_ids: [contentId] // Track purchase event with content ID
        });
        window.fb("track", "engagement", {
            action_type: "buy_item_button", // Track engagement with buy button action
            app_id: contentId, // Application ID
            char_value_1: appId // Additional value related to the purchase
        });
    }

    // Retrieves URL parameters and maps them to the provided parameter object
    getUrlParameters(params = {}) {
        let urlParams = o.UrlManager.urlParams; // Get URL parameters
        let mappedParams = {}; // Object to store mapped parameters
        if (urlParams && Object.keys(urlParams).length) {
            Object.entries(params).forEach(([key, value]) => {
                if (key in urlParams) {
                    mappedParams[value] = urlParams[key]; // Map URL parameter to the provided parameter name
                }
            });
        }
        return mappedParams; // Return the mapped parameters
    }
}

// Create an instance of the Tracker class
const trackerInstance = new Tracker();





// What is the URLManager Class?
// The URLManager class is like a smart helper that deals with the web address (URL) of a website. When you visit a website, it often has a bunch of extra information attached to the address, like clues about where you came from or what you’re looking for. This class helps to manage that information!

// Key Features of the URLManager Class
// URL Parameters: When you visit a website, sometimes the URL has extra information called parameters. For example, if you clicked a link that says "Buy Shoes," the URL might look like this:
// https://example.com/store?utm_source=newsletter&utm_campaign=summer_sale
// Here, utm_source and utm_campaign are parameters. The URLManager helps capture and keep track of these parameters.

// Cleaning Up the URL: Not all URL parameters are necessary all the time. The URLManager knows which ones to remove to make the URL cleaner. For example, if you have information that you don’t need anymore (like tracking codes from a campaign), the class can take those out. This makes the URL simpler and easier to read.

// Saving Parameters: When the URLManager saves parameters from the URL, it extracts this information and stores it in a way that the rest of your application can easily use. Think of it as taking a snapshot of the URL when you arrive and saving that data for later.

// Why Is It Used?
// Understanding User Behavior: By keeping track of URL parameters, developers can understand how users found their website (like from a newsletter or a social media post) and what campaigns are effective. This data is crucial for improving marketing strategies.

// Cleaner URLs: Users prefer clean and simple URLs. A cleaner URL can improve the user experience and make it easier for people to share links. The URLManager helps achieve that by cleaning up unnecessary parameters.

// History Management: The class uses history.replaceState to update the URL in the browser without reloading the page. This means that even if you clean the URL, the user won’t notice any interruption in their experience.

// Is It Necessary?
// For Developers: It’s not strictly necessary to have a URLManager in every project, but it can be very beneficial. If your website relies on URL parameters (for tracking campaigns, user sessions, etc.), having a dedicated class to manage these can save you time and keep your code organized.

// For Users: From a user perspective, a cleaner URL is always better. It’s easier to read, share, and remember. So, while users might not directly notice the URLManager, they will appreciate the benefits it brings.

// Should You Use It?
// If You Need Tracking: If your application or website uses marketing tracking or requires information from the URL to function properly, then implementing something like the URLManager is a good idea.

// For Simplicity: If you want to keep your URLs clean and manageable, using this class can help ensure that only the necessary information is visible.

// In summary, the URLManager class is a helpful tool for developers to manage URL parameters effectively. It enhances user experience by keeping URLs clean and enables better tracking of how users arrive at the website. If you plan to work with tracking or want cleaner URLs, using a URLManager could be a smart move!
