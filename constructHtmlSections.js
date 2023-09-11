// constructHtmlSections is called within the HTML files by body's onload property.
function constructHtmlSections() {
    constructNavbarHtml();
    constructFooterHtml();
    constructTestFillerHtml();


    if (typeof loadDocOfWorks === 'function') {
        loadDocOfWorks(); // Also creates work categories & displays.
        // 'hideLoadingOverlay' called at the end of 'createWorkDisplays'.
    }
    else { hideLoadingOverlay(); }
}

// Note: Constructing elements this was causes a noticeable flash when loading the page.
// However, that may be a worthy trade-off for insuring these sections are the same across all pages.
// -?-: Rather than generating the HTML client-side when the page is loaded,
// would it be better to simply use functions to generate the HTML, and edit the files directly?




function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('main_loadingOverlay');
    if (loadingOverlay != null) { loadingOverlay.style.display = 'none'; }

    if (footer != null) {
        updateFooterPos();
        footer.style.display = 'flex';
    }
};




//--------------------------------------------------------------------------------------------------------------------------------|Construct Navbar
function constructNavbarHtml() {
    const navbar = document.getElementById("navbar");
    if (navbar == null) { return; }
    // if (document.getElementById("navbar_header") != null && document.getElementById("navbar_body") != null) { return; }
    navbar.innerHTML = '';
    navbar.classList.add('unselectable');

    navbar.innerHTML = `
        <a id="navbar_header" tabindex="-1"><div id="navbar_headerDiv">
            <span class="unselectable" translate="no">Kalen</span>
            <span class="unselectable" translate="no">Weinheimer</span>
        </div></a>
        <hr class="navbar_hr">
        <div id="navbar_body">
            <a class="navbar_child unselectable" id="navbar_child_home"      href="./index.html"    >Home      </a>
            <a class="navbar_child unselectable" id="navbar_child_myWork"    href="./myWork.html"   >My Work   </a>
            <a class="navbar_child unselectable" id="navbar_child_aboutMe"   href="./aboutMe.html"  >About Me  </a>
            <a class="navbar_child unselectable" id="navbar_child_contactMe" href="./contactMe.html">Contact Me</a>
        </div>
    `;
    // -?-: Use an image for the navbar header?


    // Add 'currentPageLink' class & remove the href of the navbar child linking to the current page.
    // First checks if site is loaded with no file specified, which links to the index.
    const pageUrl = document.baseURI.split('?')[0];
    if (pageUrl == window.location.origin || pageUrl == window.location.origin+'/') {
        const homeLink = document.getElementById('navbar_child_home');
        homeLink.classList.add('currentPageLink');
        homeLink.removeAttribute('href');
    } else {
        // const navbarChildren = document.getElementsByClassName('navbar_child');
        const navbarChildren = document.getElementById('navbar_body').children;
        for (let i=0; i<navbarChildren.length; i++) {
            if (pageUrl != navbarChildren[i].href) { continue; }
            navbarChildren[i].classList.add('currentPageLink');
            // navbarChildren[i].classList.add('disabled');
            navbarChildren[i].removeAttribute('href');
            break;
        }
    }

    // // Create Navbar Header
    // const navbar_header = createElement('a', 'navbar_header');
    // // navbar_header.href = '#top';
    // navbar_header.tabindex = -1;

    // const navbar_headerDiv = createElement('div', 'navbar_headerDiv');
    // const topSpan = createElement('span', '', 'unselectable', "Kalen");
    // const bottomSpan = createElement('span', '', 'unselectable', "Weinheimer");
    // topSpan.translate = false;
    // bottomSpan.translate = false;
    // navbar_headerDiv.appendChild(topSpan);
    // navbar_headerDiv.appendChild(bottomSpan);
    // navbar_header.appendChild(navbar_headerDiv);

    // // Create Navbar Horizontal Rule
    // const navbar_hr = createElement('hr', '', 'navbar_hr');
    // // Create Navbar Body
    // const navbar_body = createElement('div', 'navbar_body');

    // // Create Navbar Children
    // navbar_body.appendChild(createNavbarChild('./index.html', 'navbar_child_home', "Home"));
    // navbar_body.appendChild(createNavbarChild('./myWork.html', 'navbar_child_myWork', "My Work"));
    // navbar_body.appendChild(createNavbarChild('./aboutMe.html', 'navbar_child_aboutMe', "About Me"));
    // navbar_body.appendChild(createNavbarChild('./contactMe.html', 'navbar_child_contactMe', "Contact Me"));

    // // Add Created Elements As Children
    // navbar.appendChild(navbar_header);
    // navbar.appendChild(navbar_hr);
    // navbar.appendChild(navbar_body);
}



/**
 * @param {string} link
 * @param {string} innerHTML
 */
function createNavbarChild(link, id, innerHTML) {
    const anchor = createElement('a', id, 'navbar_child unselectable', innerHTML);
    anchor.href = link;
    return anchor;
}




//--------------------------------------------------------------------------------------------------------------------------------|Construct Footer
function constructFooterHtml() {
    const footer = document.getElementById('footer');
    if (footer == null) { return; }
    footer.innerHTML = '';

    // const footerContents = createElement('p', '', '', "Copyright &#169; 2023 Kalen J. Weinheimer. All rights reserved.");
    const footerContents = createElement('p', '', '', "This website and all its content, unless otherwise explicitly stated, is copyright of Kalen J. Weinheimer. <br> &#169; Kalen J. Weinheimer 2023. All rights reserved.");
    footer.appendChild(footerContents);

    if (document.documentElement.classList.contains('index')) {
        const logoNotice = createElement('p', '', '', "Notice: The LinkedIn & GitHub logos used above are trademarks of their respective companies.");
        logoNotice.style.textAlign = 'right';
        footer.appendChild(logoNotice);
    }
}




//--------------------------------------------------------------------------------------------------------------------------------|Construct Test Filler
function constructTestFillerHtml() {
    const testFillers = document.getElementsByClassName('testFiller');
    if (isNullOrEmpty(testFillers)) { return; }

    for (let i=0; i<testFillers.length; i++) {
        const testFiller = testFillers[i];

        for (let j=0; j<6; j++) {
            const divP = document.createElement('p');
            divP.innerHTML = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Praesentium exercitationem accusantium, deserunt, sapiente voluptates eveniet cumque suscipit quo animi consectetur harum corporis soluta ullam, culpa temporibus. Dolores fugit placeat consectetur.";
            divP.style.margin = '0 10%';
            testFiller.appendChild(document.createElement('div').appendChild(divP));
        }

        const codeDiv = document.createElement('div');
        codeDiv.style.margin = '4em 10%';
        codeDiv.innerHTML = `
    <pre><code>.test {
    test1
        test2
            test3
                test4
            test5
        test6
    test7
}</code></pre>`;
        testFiller.appendChild(codeDiv);

        const testLinesDiv = document.createElement('div');
        testLinesDiv.style.margin = '1em 10%';
        for (let i=0; i<24; i++) { testLinesDiv.innerHTML += "test text<br><br>"; }
        testFiller.appendChild(testLinesDiv);
    }
}
