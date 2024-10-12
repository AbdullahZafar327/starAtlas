import gsap from "gsap";
import { Globals } from "../compaitable";


//this is the class for managing the burger Menu Animation and Analytics for user engagements
export class MenuHandler {
  menuContainer = document.querySelector(".MainMenu");  // Select the main menu container from the DOM
  openButton = document.querySelector(".HeaderModule .BurgerMenu-icon");  // Select the burger menu icon in the header
  openButtonWrapper = document.querySelector(".HeaderModule-logoNav");  // Select the logo wrapper in the header
  closeButton = this.menuContainer.querySelector(".MainMenu-CloseIcon");  // Select the close icon within the main menu container
  navigationLinks = this.menuContainer.querySelectorAll("nav a");  // Select all navigation links inside the main menu
  internalLinks = this.menuContainer.querySelectorAll("a");  // Select all internal links within the main menu (links that don't lead outside)
  fadeInElements = this.menuContainer.querySelectorAll(".Menu-FadeIn");  // Select all elements that need to fade in when the menu opens
  topBarButtons = document.querySelectorAll(".TopBarCtas a");  // Select buttons in the top bar for additional functionality (e.g., top bar CTAs)
  secondaryNavLinks = document.querySelectorAll(".MainMenu-secondaryLinks a");  // Select secondary navigation links within the main menu
  listingNavLinks = document.querySelectorAll(".MainMenu-listingLinks a");  // Select links specific to the listing section within the main menu
  socialMediaLinks = document.querySelectorAll(".MenuSocials a");  // Select all social media links in the menu
  headerLogo = document.querySelector(".HeaderLogo");  // Select the header logo to track clicks (for analytics)
  background = document.querySelector(".MainMenu-Background");  // Select the background elements of the main menu
  backgroundCircles = document.querySelector(".MainMenu-Background-circles")  // Select circles that are part of the background animation
  backgroundOverlay = document.querySelector(".MainMenu-Background-overlay");  // Select the overlay that darkens the background when the menu opens
  coverLayer = document.querySelector(".MainMenu-CoverLayer");// Select the cover layer that appears when the menu is open
  urlToIndexMapping = [];  // Create a URL to index mapping for each menu link
  activeMenuIndex = -1;// Keep track of which menu item is currently active
  activeHoverIndex = -1;  // Track hover state to ensure smooth transitions
  isMenuOpen = false;  // Check if the menu is open or closed
  maxScale = 12;  // Maximum scaling factor for background animations
  openAnimationDuration = 1;  // Duration for the menu opening animation (in seconds)
  openAnimationEase = "power4.out";  // Easing function for opening animation (makes animation smooth)
  closeAnimationEase = "power4.in";  // Easing function for closing animation
  static CLOSE_ANIMATION_DURATION = 1;  // Static constant for close animation duration
  rotatingAnimations = [];  // Store animation instances that rotate background elements
  hideMenuBackground = Globals.IS_SAFARI;  // Check if Safari browser is in use to handle specific styling or functionality
  allBackgroundElements = [   // Combine all background elements for grouped animation
    this.background,
    this.backgroundCircles,
    this.backgroundOverlay,
  ];
  scaleTogetherBackgrounds = [this.backgroundOverlay];  // Combine background overlays that scale together during animation
  newsletterForm;  // Store reference to newsletter form
  isFirstTimeOpen = true;  // Keep track if it's the first time the menu is opened (for specific first-time animations)
  documentLinks = document.querySelectorAll(".MainMenu-Documents");  // Select document-related links within the menu (e.g., PDF downloads)
  modalOverlay = document.querySelector("#MainMenu-Documents-Modal");  // Select the modal overlay for documents (appears when clicking a document link)
  modalContent = document.querySelector("#MainMenu-Documents-Modal .modal-content");// Select content inside the modal (title, description, etc.)
  isModalOpen = false;  // Track if a modal window is currently open



  constructor(context) {
    // Initialize the newsletter form instance
    // this.newsletterForm = new Newsletter(
    //   this.menuContainer.querySelector(".Newsletter")
    // );

    this.openButton.addEventListener("click", this.openMenu);    // Add click event listener to the burger icon to open the menu
    this.closeButton.addEventListener("click", this.closeMenu); // Add click event listener to the close icon to close the menu

   
    this.navigationLinks.forEach((link, index) => { // Loop through all navigation links and map each link's URL to its index
      // Map the href (URL) of the link to its index
      this.urlToIndexMapping[link.getAttribute("href")] = index; // { /service : 0, /About: 1 , /Home: 2 }

      // Add a click event listener to each link to track the click for analytics
      // link.addEventListener("click", () => {
      //   i.tracking.trackClick(
      //     "menu_item_overlay",
      //     "go_to_page",
      //     link.getAttribute("href")
      //   );
      // });
    });


    this.internalLinks.forEach((link) => {    // Assign a custom callback function for closing the menu to all internal links
      link._callback = this.closeMenu;
    });

    // Track clicks on the header logo (for analytics)
    if (this.headerLogo) {
      const htmlElement = document.querySelector("html");

      this.headerLogo.addEventListener("click", (event) => {
        // Only track clicks when the page is not the homepage
        if (
          htmlElement &&
          !htmlElement.classList.contains("HomeTemplatePage")
        ) {
          // i.tracking.trackClick(
          //   "header_logo",
          //   "click",
          //   this.headerLogo.getAttribute("href")
          // );
        }
      });
    }


    gsap.set(this.coverLayer, { autoAlpha: 0 });    // Set initial opacity of the cover layer to zero (hidden)
    this.handleHashChange({ fullUrl: window.location.pathname });    // Handle hash changes in the URL and adjust the menu accordingly
    context.MainMenu = this;    // Attach the MenuManager instance to the context object (to be used globally)
    context.signalHashChange.add(this.handleHashChange);    // Listen for hash changes to dynamically adjust the menu


    this.topBarButtons.forEach((button) => {    // Add click event listeners to top bar buttons to track clicks for analytics
      button.addEventListener("click", (event) => {
        const target = event.target;
        const action = target
          .querySelector(".title")
          .innerHTML.split("•")[0]
          .toLowerCase()
          .replace(" ", "_");
        //TODO i.tracking.trackClick("top_right", action, target.getAttribute("href"));
      });
    });

    // Add click event listeners to secondary navigation links for tracking
    this.secondaryNavLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = event.target;
        const action = target
          .querySelector(".title")
          .innerHTML.split("•")[0]
          .toLowerCase()
          .replace(" ", "_");
        //TODO i.tracking.trackClick(`${action}link`, `${action}open`, target.getAttribute("href"));
        // i.tracking.trackEngagement(`${action}open`);
      });
    });

    // Track clicks on listing navigation links
    this.listingNavLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const anchor = event.target.closest("a");
        if (anchor) {
          const title = anchor.dataset.title.toLowerCase().replace(" ", "_");
          //TODO   i.tracking.trackClick("menu_listing_links", title, anchor.getAttribute("href"));
        }
      });
    });

    // Track clicks on social media links
    this.socialMediaLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const social = event.target.dataset.social;
        let action = "social_link";
        if (social) action += `_${social}`;
        //TODO i.tracking.trackSocial(action, social);
      });
    });

    // Add click event listeners to document links and display modal when clicked
    this.documentLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const data = event.target.dataset;
        this.isModalOpen = true;

        // Animate modal opening
        gsap.to(this.modalOverlay, {
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          duration: 0.5,
          autoAlpha: 1,
        });

        // Set modal content based on the clicked document
        this.setModalContent(data);
      });
    });

    // Add click event listener to modal overlay to close it when clicking outside content
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener("click", (event) => {
        if (event.target.id === "MainMenu-Documents-Modal") this.closeMenuModal();
      });
    }
  }

  _closeMenuOrModelOnExit = (e) => {
    if (e.keyCode === 27) {
      // Close the modal if it's open, otherwise close the menu
      this.isModalOpen
        ? this.closeMenuModal()
        : this.isMenuOpen && this.closeMenu();
    }
  };

  closeMenuModal = () => {
    if (this.isModalOpen) {
      gsap.to(this.modalOverlay, {
        duration: 0.5,
        autoAlpha: 0,
        width: 0,
        height: 0,
        top: "50%",
        left: "50%",
        display: "none",
        clearProps: "all",
        onComplete: () => {
          this.isModalOpen = false;
          this.setModalContent();
        },
      });
    }
  };

  openMenu = (event = null) => {
    if (event) {
      event.preventDefault();
    }

    if (!this.isMenuOpen) {
      this.isMenuOpen = true;

      this.rotatingAnimations.forEach((animation) => animation.resume());
      gsap.set(this.menuContainer, {
        autoAlpha: 1,
      });

      gsap.killTweensOf(this.menuContainer);
      gsap.killTweensOf(this.openButtonWrapper);
      gsap.killTweensOf(this.closeButton);
      gsap.killTweensOf(this.coverLayer);

      gsap.set(this.menuContainer, {
        pointerEvents: "",
      });

      gsap.to(this.openButtonWrapper, {
        opacity: 0,
        duration: 0.5,
      });

      gsap.to(this.closeButton, {
        autoAlpha: 1,
        duration: 0.5,
        delay: 0.5,
        onComplete: () => {
          Globals.MENU_OPEN = true;
        },
      });

      gsap.set(this.coverLayer, {
        autoAlpha: 1,
      });

      document.documentElement.classList.add("menu-open");

      document.addEventListener("keydown", this._closeMenuOrModelOnExit, false);
      //TODO TRACKING....
    }

    closeMenu = (event = null) => {
      if (event) {
        event.preventDefault();
      }

      if (this.isMenuOpen) {
        this.isMenuOpen = false;
        Globals.MENU_OPEN = false;

        gsap.killTweensOf(this.menuContainer);
        gsap.killTweensOf(this.openButtonWrapper);
        gsap.killTweensOf(this.closeButton);
        gsap.killTweensOf(this.coverLayer);

        gsap.set(this.menuContainer, {
          pointerEvents: "none",
        });

        gsap.to(this.openButtonWrapper, {
          opacity: 1,
          duration: 0.5,
          duration: 1,
        });

        gsap.to(this.closeButton, {
          opacity: 0,
          duration: 0.2,
        });

        gsap.set(this.menuContainer, {
          autoAlpha: 0,
          delay: this.CLOSE_ANIMATION_DURATION,
          onComplete: () => {
            this.rotatingAnimations.forEach((animation) => animation.pause());
          },
        });

        if (Globals.TEMPLATE_MANAGER.dontHideCoverLayer !== false) {
          gsap.set(this.coverLayer, { autoAlpha: 0 });
        }

        document.documentElement.classList.remove("menu-open");
        document.removeEventListener(
          "keydown",
          this._closeMenuOrModelOnExit,
          false
        );
      }
    };
  };

  _hashChangeHandler = (currentLocation) => {
    const urlSegment = "/" + currentLocation.fullUrl.split("/")[1];
    let menuIndex = this.urlToIndexMapping[urlSegment];

    if (this.activeMenuIndex !== menuIndex) {
      if (menuIndex !== undefined && menuIndex !== this.activeHoverIndex) {
        this.setActiveMenuIndex(menuIndex);
      }

      if (menuIndex !== undefined && this.activeMenuIndex !== -1) {
        this.setActiveMenuIndex(this.activeMenuIndex);
      }
    }
  };

  setActiveMenuIndex(newIndex) {
    if (this.activeMenuIndex !== -1) {
      this.navigationLinks[this.activeMenuIndex].classList.remove(
        "currentPage"
      );
    }

    if (newIndex !== -1) {
      this.navigationLinks[newIndex].classList.add("currentPage");
    }

    this.activeMenuIndex = newIndex;
  }

  setModalContent = (dataset = {}) =>{
    const modalTitle = this.modalContent.querySelector(".title");
    const modalDescription = this.modalContent.querySelector(".description");
    const modalDocuments = this.modalContent.querySelector(".modal-documents");
    const downloadIcon = document.querySelector(".download-svg-icon");
    const parsedData = {};

    // Reset modal content
    modalTitle.innerHTML = "";
    modalDescription.innerHTML = "";
    modalDocuments.innerHTML = "";

    try {
      Object.keys[dataset].forEach((key) => {
        parsedData[key] = JSON.parse(dataset[key]);
      });
    } catch (error) {
      console.error("Failed to parse data", error);
    }

    // Set modal title and description
    if (parsedData.title) modalTitle.innerHTML = parsedData.title;
    if (parsedData.description)
      modalDescription.innerHTML = parsedData.description;

    if (parsedData.documents) {
      parsedData.documents.forEach((document) => {
        const docContent = document.split("|");
        const anchor = document.createElement("a");
        const span = document.createElement("span");

        span.innerText = docContent[0];
        anchor.href = docContent[1];

        anchor.dataset.title = parsedData.title | "";
        anchor.innerHTML = downloadIcon.innerHTML;
        anchor.appendChild(span);
        modalDocuments.appendChild(anchor);

        anchor.addEventListener("click");
      });
    }
  }
}





// The restaurant setup features a designated menu area where all food items are displayed. Customers ring a bell (the burger icon) to call for the menu, and a staff member (the close icon) helps them close it once they've made a choice. When a customer rings the bell, the staff unveils the menu, triggering an animation where the menu smoothly slides down and the restaurant background fades to set the mood. Customers navigate through various sections of the menu, such as appetizers and desserts, with the option to track interest through clicks. 

// If they switch sections, the menu closes and reopens automatically, mimicking the action of flipping through a physical menu. Social media links within the menu encourage online engagement. For special offers, a modal appears when customers show interest in specific items, and clicking outside this modal closes it, similar to staff assistance. Once customers make their choice, they signal the staff using the close button or the Escape key, causing the menu to fade away and the background to return to normal. Throughout this process, customer interactions are tracked for analytics, helping the restaurant adjust its menu based on popular dishes, ensuring a seamless and engaging dining experience.