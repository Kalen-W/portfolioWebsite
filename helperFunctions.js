//--------------------------------------------------------------------------------------------------------------------------------|HTMLElement Functions
/**
 * Shorthand function for creating an element and setting common attributes.
 * @param {string} tagName - The tag type of the created element.
 * @param {string} idName - Sets the element's id content attribute.
 * @param {string} className - Sets the element's class content attribute.
 * @param {string} innerHTML - Sets the element's inner HTML.
 * @returns {HTMLElement}
 */
function createElement(tagName, idName="", className="", innerHTML="") {
    const element = document.createElement(tagName);
    // if (element == null) { return element; }

    if (!isNullOrEmpty(idName)) { element.id = idName; }
    if (!isNullOrEmpty(className)) { element.className = className; }
    element.innerHTML = innerHTML;

    return element;
}



/**
 * Shorthand function for applying multiple styles to an element.
 * @param {HTMLElement} element
 * @param {object} styleObj
 */
function applyStyles(element, styleObj) {
    if (element == null || !isHTMLElement(element) || !isObject(styleObj)) { return; }
    // console.log("================");

    // Loop through styleObject entries/properties.
    for (const [key, value] of Object.entries(styleObj)) {
        // Test if style (key) is valid (contained within element.style).
        // Style validity testing removed, because on Firefox it always results in false for some reason.
        // if (!Object.hasOwn(element.style, key)) {
        //     console.warn("[ApplyStyles] Input \""+key+"\" is not a valid style.");
        //     continue;
        // }
        element.style[key] = value;
        // let dashed = key.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        // element.style.setProperty(dashed, value);
    }
}




/**
 * Returns first child of element with input class, or null if no children contain the class.
 * @param {HTMLElement} element
 * @param {string} className
 * @param {string} tagName - Optionally constrain results to this tag type.
 * @returns {HTMLElement|null}
 */
function getChildOfClass(element, className, tagName="") {
    const children = element.children;
    if (children.length == 0) { return null; }

    // Convert tagName to uppercase, and set checkTag value.
    var checkTag = false;
    if (!isNullOrEmpty(tagName)) {
        tagName = tagName.toUpperCase();
        checkTag = true;
    }

    // Loop through children.
    for (let i=0; i<children.length; i++) {
        if (checkTag && children[i].tagName != tagName) { continue; }
        if (children[i].classList.contains(className)) { return children[i]; }
    }
    return null;
}




/**
 * @param {string} varName - Name of the variable being retrieved.
 * @param {boolean} [removeValueSuffix=false] - Currently only removes 'px' from the end of retrieved variable value.
 */
function getCssVar(varName, removeValueSuffix=false) {
    var propValue = getComputedStyle(document.body).getPropertyValue(varName);
    if (propValue == null) { return null; }

    if (removeValueSuffix) {
        if (propValue.endsWith('px')) { propValue = propValue.replace('px', ''); }
    }
    return propValue;
}
// -?-: Change 'removeValueSuffix' to 'removeNonNumbers', and instead loop through the string and remove any characters where 'isNaN' returns true?




/**
 * @param {HTMLElement} element
 * @param {function} func
 * @param {boolean} callOnCancel - determines if func is called if the transition is canceled.
 */
function onTransitionEnd(element, func, callOnCancel=false) {
    var fnc = (e) => {
        e.stopPropagation();
        if (e.target != element) { return; }
        func(e);
        element.removeEventListener('transitionend', fnc);
        element.removeEventListener('transitioncancel', cancelFnc);
    };
    element.addEventListener('transitionend', fnc);
    // element.addEventListener('transitionend', fnc, {capture: true, once: true});

    if (!callOnCancel) { return; }

    var cancelFnc = (e) => {
        e.stopPropagation();
        if (e.target != element) { return; }
        func(e);
        element.removeEventListener('transitionend', fnc);
        element.removeEventListener('transitioncancel', cancelFnc);
    }
    element.addEventListener('transitioncancel', cancelFnc);
}


/**
 * @param {HTMLElement} element
 * @param {object} styleObj
 */
function applyStylesOnTransitionEnd(element, styleObj) {
    var fnc = () => {
        applyStyles(element, styleObj);
        element.removeEventListener('transitionend', fnc);
        element.removeEventListener('transitioncancel', cancelFnc);
    };
    element.addEventListener('transitionend', fnc);

    var cancelFnc = () => {
        element.removeEventListener('transitionend', fnc);
        element.removeEventListener('transitioncancel', cancelFnc);
    }
    element.addEventListener('transitioncancel', cancelFnc);
}




//--------------------------------------------------------------------------------------------------------------------------------|Date Formatting
// For use with date_devStart & date_devEnd from documentation json.
/** @param {string} string */
function isValidDate(string) { return !isNullOrEmpty(string) && string !== "YYYY-MM-DD"; }



/** @param {string} input */
function formatDate(input) {
    if (!isValidDate(input)) { return null; }
    // Date exceptions
    if (input.toLowerCase() == 'present') { return 'Present'; }

    // Remove dashes from input
    var date = input.replaceAll('-', '');

    // Separate date info & insure they are numbers.
    var yearIn  = Number(date.slice(0, 4));
    var monthIn = Number(date.slice(4, 6));
    var dayIn   = Number(date.slice(6, 8));

    // Create (& return) output.
    var output = '';
    var monthOut = numToMonthShort(monthIn);
    if (monthOut != null) { output = monthOut + ' '; }
    if (!isNaN(dayIn) && dayIn != 0) { output += dayIn + ', '; }
    if (!isNaN(yearIn) && yearIn != 0) { output += yearIn; }

    if (LOG_DEBUG_INFO) {
        if (isNaN(yearIn) || yearIn == 0) { console.warn("[formatDate] Invalid year is given. input = "+input); }
        if ((!isNaN(dayIn) && dayIn != 0) && monthOut == null) { console.warn("[formatDate] Valid day is given with invalid month. input = "+input); }
    }

    return isNullOrEmpty(output) ? null : output;
}


function numToMonthShort(num) {
    num = Number(num);
    if (isNaN(num) || num < 1 || num > 12) { return null; }

    switch (num) {
        case  1: return 'Jan';
        case  2: return 'Feb';
        case  3: return 'Mar';
        case  4: return 'Apr';
        case  5: return 'May';
        case  6: return 'Jun';
        case  7: return 'Jul';
        case  8: return 'Aug';
        case  9: return 'Sep';
        case 10: return 'Oct';
        case 11: return 'Nov';
        case 12: return 'Dec';
        default: return null;
    }
}




//--------------------------------------------------------------------------------------------------------------------------------|Type Validators
/** Returns true if input is a string. */
function isString(input) { return typeof input === 'string'; }

/** Returns true if input is an object, but not an array. */
function isObject(input) { return (input!=null && typeof input==='object' && !Array.isArray(input)); }

/** Returns true if input is an HTMLElement. */
function isHTMLElement(input) { return input instanceof HTMLElement; }

/** Returns true if input is an Element. */
function isElement(input) { return input instanceof Element || input instanceof Document; }

/** Returns true if input is a function. */
function isFunction(input) { return typeof input === 'function'; }

/** Returns true if input string is the name of a valid function. */
function isFunctionName(string) { return typeof window[string] === 'function'; }



/** Returns true if input is null, empty array, or empty string. */
function isNullOrEmpty(input) {
    if (input == null || typeof input == undefined) { return true; }
    if (Array.isArray(input) && input.length == 0) { return true; }
    if (isString(input) && input === "") { return true; }
    return false;
}
