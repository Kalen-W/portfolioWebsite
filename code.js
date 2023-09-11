//--------------------------------------------------------------------------------------------------------------------------------|Global Variables
const main = document.getElementById('main');
const footer = document.getElementById('footer');

const LOG_DEBUG_INFO = true;
const LOG_EVENTS = true;

if (LOG_DEBUG_INFO && main == null) { console.error("No element with id 'main' exists."); }
if (LOG_DEBUG_INFO && footer == null) { console.error("No element with id 'footer' exists."); }




//--------------------------------------------------------------------------------------------------------------------------------|Load Json Then Function
/**
 * Loads json file at inputted path, then passes response into inputted function reference.
 * @param {string} filePath - File path to json file.
 * @param {function} fnc - Function reference that the loaded json data will be passed into.
 */
function loadJson_thenFnc(filePath, fnc) {
    fetch(filePath)
    .then(response => response.json())
    .then((data) => {
        // console.log(data);
        fnc(data);
    })
    .catch(error => {
        console.error(error);
    });
}




//--------------------------------------------------------------------------------------------------------------------------------|Misc. HTML Element Functions
/**
 * @param {HTMLElement} element
 */
function removeParentElement(element) {
    if (element.parentElement != document.body) { element.parentElement?.remove(); }
}


function removeElementById(idName) {
    if (isNullOrEmpty(idName)) { return; }
    var element = document.getElementById(idName);
    if (element == null) { return; }
    element.remove();
}




function setMainScrollLock(state) {
    if (main == null || state == main.classList.contains('scrollLockedY')) { return; }

    const preLockWidth = main.clientWidth;
    main.classList.toggle('scrollLockedY', state);

    // HACK: This adds to the right-padding of main to prevent things from moving when overflow is set to hidden.
    // Preferably, the work display full preview probably just shouldn't be a child of main.
    // const scrollbarWidth = Number(getCssVar('--scrollbarWidth', true));
    const main_paddingRight = Number(main.style.paddingRight.replace('px',''));
    if (state) {
        const scrollbarWidth = main.clientWidth - preLockWidth;
        main.style.paddingRight = (main_paddingRight + scrollbarWidth) + 'px';
    }
    else {
        const scrollbarWidth = preLockWidth - main.clientWidth;
        main.style.paddingRight = (main_paddingRight - scrollbarWidth) + 'px';
    }

    if (LOG_DEBUG_INFO) { console.log("Main scroll lock set to: " + state); }
}




var navbarVisibility = true;
function setNavbarVisibility(state) {
    if (state == navbarVisibility) { return; }
    navbarVisibility = state;
    document.body.classList.toggle('hideNavbar', !state);
}

function toggleNavbarVisibility() { setNavbarVisibility(!navbarVisibility); }




//--------------------------------------------------------------------------------------------------------------------------------|Parallax Scroll Effect
const main_backgroundContainer = document.getElementById('main_backgroundContainer');
const main_background = document.getElementById('main_background');

if (main_background != null && main_backgroundContainer != null) {
    main.addEventListener('scroll', (e) => {
        // if (e.target != main) { return; }

        const mainScrollNorm = main.scrollTop / (main.scrollHeight - main.clientHeight);
        // const bgScrollTop = Math.floor(main_background.clientHeight - window.innerHeight) * -mainScrollNorm;
        const bgScrollTop = (main_backgroundContainer.scrollHeight - main_backgroundContainer.clientHeight) * mainScrollNorm;
        // console.log(mainScrollNorm); console.log(bgScrollTop);

        main_backgroundContainer.scrollTop = bgScrollTop;
        // main_backgroundContainer.scrollTo({top: bgScrollTop, behavior: 'smooth'});
        // main_background.style.top = bgScrollTop + 'px';
    });
}
// TODO: Parallax scroll effect seems laggy / jittery, especially near the top of the page.




//--------------------------------------------------------------------------------------------------------------------------------|Window Resize Event Listener
window.addEventListener('resize', (e) => {
    if (LOG_EVENTS) { console.log("[Event] Window Resized"); }
    updateFooterPos();
});

// Detects resizing of main, and updates footer position.
new ResizeObserver(updateFooterPos).observe(main);



// HACK: This feels like a rather hacky solution to insure the footer is at the bottom of main.
// But, I can't get the CSS to behave how I want, so this should work.
function updateFooterPos() {
    footer.style.position = (main.scrollHeight > main.clientHeight) ? 'relative' : 'absolute';
}
