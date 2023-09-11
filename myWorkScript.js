//--------------------------------------------------------------------------------------------------------------------------------|Global Variables
// var documentation;
// var projectDataDict = {};
// var projectDataOrder = [];
// // /**@type {WorkDisplay[]}*/ var initialWorkDisplays = [];
// // /**@type {WorkDisplay[]}*/ var openedFullPreviews = [];

// // var workDisplaysCreated = false;
// var youTubePlayerAPIReady = false;
// const ytApiFailDuration = 8192; // Milliseconds until YouTube API is assumed to have failed to load.

const baseDocumentTitle = document.title;




//--------------------------------------------------------------------------------------------------------------------------------|Work Category Container Class
/**@type {WorkCategoryContainer[]}*/ const workCatContainers = [];

class WorkCategoryContainer {
    constructor(btnEle) {
        this.btn = btnEle;
        this.container = document.getElementById(this.btn.dataset.linkedElement);
        if (!this.container) {
            this.container = this.btn.nextElementSibling;
            if (!this.container) { return; }
        }

        // Update default active state based on next element's display value.
        const activeState = this.btn.classList.toggle('active', !this.container.classList.contains('collapsed'));
        this.updateBtnTitle(activeState);

        // Makes the button change the visibility of the collapsable element.
        this.btn.addEventListener('click', () => { this.onBtnClick(); });
    }

    onBtnClick() {
        const activeState = this.btn.classList.toggle('active');
        this.container.classList.toggle('collapsed', !activeState);
        this.updateBtnTitle(activeState);
    }

    updateBtnTitle(state) {
        this.btn.title = state ? 'Click to collapse section.' : 'Click to expand section.'
    }
}




//--------------------------------------------------------------------------------------------------------------------------------|Load Doc. & Create projectDataDict
// function loadDocOfWorks() {
//     loadJson_thenFnc("./assets/jsonFiles/documentationOfWorks.json", setProjectData);
// }



// /** @param {object} data - Loaded json file object. */
// function setProjectData(data) {
//     documentation = data;
//     if (documentation == null) {
//         if (LOG_DEBUG_INFO) { console.error("Error loading documentation json file."); }
//         return;
//     }
//     if (LOG_DEBUG_INFO) { console.log("documentation:", documentation); }

//     // Create project data dictionary.
//     // Loops through $schema, meta, gameProjects, models, art, webDesign, & miscWorks.
//     for (const [key, value] of Object.entries(data)) {
//         // Ignore $schema (& anything else that starts with '$') & meta.
//         if (key[0] == '$' || key == 'meta') { continue; }

//         // Loops through the contents (projectDatas) of gameProjects, models, art, animation, webDesign, & miscWorks.
//         for (let i=0; i<value.length; i++) {
//             const projData = value[i];
//             if (!projData.enabled) { continue; } // Skip any projectDatas that have enabled set to false.

//             if (Object.hasOwn(projectDataDict, projData.id)) {
//                 if (LOG_DEBUG_INFO) { console.error("Multiple objects within the loaded documentation are assigned the id: \""+projData.id+"\"."); }
//                 continue;
//             }

//             projectDataDict[projData.id] = projData;

//             const _priority = Object.hasOwn(projData, 'priority') ? projData.priority : 0;
//             projectDataOrder.push({id: projData.id, title: projData.title, priority: _priority});
//         }
//     }

//     // Sort projectDataOrder by alphabetical order of titles.
//     projectDataOrder.sort((a, b) => a.title.localeCompare(b.title));
//     // Sort projectDataOrder by greatest to smallest priority. (Should keep the alphabetical ordering?)
//     projectDataOrder.sort((a, b) => b.priority - a.priority);
//     if (LOG_DEBUG_INFO) { console.log("projectDataOrder:", projectDataOrder); }


//     // Debug testing to insure all ids within each projectData's relatedWorks array are valid.
//     if (LOG_DEBUG_INFO) {
//         for (const [id, data] of Object.entries(projectDataDict)) {
//             const relatedWorkIds = data.relatedWorks;
//             for (let i=0; i<relatedWorkIds.length; i++) {
//                 if (Object.hasOwn(projectDataDict, relatedWorkIds[i])) { continue; }
//                 console.error('Project "'+id+'" has invalid related works ID "'+relatedWorkIds[i]+'".');
//             }
//         }
//     }


//     // Create work displays once YouTube API has loaded.
//     var firstApiCheckTime = window.performance.now(); // Time passed since 'ifApiReady_CreateDisplays' was initially called.

//     const ifApiReady_CreateDisplays = () => {
//         if (youTubePlayerAPIReady) { createWorkDisplays(data); }
//         else if (window.performance.now() - firstApiCheckTime > ytApiFailDuration) { createWorkDisplays(data); }
//         else { setTimeout(ifApiReady_CreateDisplays, 16); }
//         // Note: The use of a setTimeout here doesn't seem ideal.
//     };
//     ifApiReady_CreateDisplays();
// }




//--------------------------------------------------------------------------------------------------------------------------------|Create Work Displays
/**
 * @param {object} data - Loaded json file object.
 */
function createWorkDisplays(data) {
    const workCategoriesContainer = document.getElementById('workCategoriesContainer');
    if (workCategoriesContainer == null) { return; }

    // Add work category collapsable section functionality.
    const workCatBtns = document.getElementsByClassName("workCatBtn");
    for (let i=0; i<workCatBtns.length; i++) {
        const workCatContainer = new WorkCategoryContainer(workCatBtns[i]);
        if (!workCatContainer) { continue; }
        workCatContainers.push(workCatContainer);
    }


    const workCats = {
        game:       document.getElementById('workCat_games'),
        gameDesign: document.getElementById('workCat_gameDesign'),
        model:      document.getElementById('workCat_models'),
        art:        document.getElementById('workCat_art'),
        animation:  document.getElementById('workCat_animation'),
        webDesign:  document.getElementById('workCat_webDesign'),
        misc:       document.getElementById('workCat_misc')
    };


    for (let i=0; i<projectDataOrder.length; i++) {
        const data = projectDataDict[projectDataOrder[i].id];
        // Get parent element based on data.category, continuing if category is invalid or parent element doesn't exist.
        if (!Object.hasOwn(workCats, data.category)) { continue; }
        var parent = workCats[data.category];
        if (parent == null) { continue; }

        // const _workDisplay = new WorkDisplay(data, true);
        const _workDisplay = WorkDisplayFactory.newWorkDisplay(data, true);
        parent.appendChild(_workDisplay.container);
        // initialWorkDisplays.push(_workDisplay);
    }

    onDisplaysCreated();
}




//--------------------------------------------------------------------------------------------------------------------------------|On Process Finished Functions
// Called by the imported YouTube player API.
function onYouTubePlayerAPIReady() {
    youTubePlayerAPIReady = true;
    if (LOG_DEBUG_INFO) { console.log("Youtube Player API Ready"); }
}


function onDisplaysCreated() {
    processSearchParams();
    hideLoadingOverlay();
}




//--------------------------------------------------------------------------------------------------------------------------------|Process Search Params
// If search param "projID" is set, & it's value is a valid project id, open the associated work display full preview.
function processSearchParams() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop)
    }); // Get URL search parameters.

    // Get project id, returning if needed.
    // if (!params.projID) { return; }
    if (isNullOrEmpty(params.projID)) { return; }
    const projID = params.projID;
    if (!(projID in projectDataDict)) { return; }

    // Open initial work display with matching id (if one exists).
    const matchingWorkDisplay = WorkDisplayFactory.getInitialWorkDisplay(projID);
    if (matchingWorkDisplay != null) { WorkDisplayFactory.openFullPreview(matchingWorkDisplay); }
}


function setProjIdSearchParam(projID=null) {
    if (projID != null && !isString(projID)) { return; }
    // Get & process initial search parameter value.
    var initParamsStr = window.location.search;
    if (initParamsStr[0] == '?') { initParamsStr = initParamsStr.slice(1); }
    var splitParams = !isNullOrEmpty(initParamsStr) ? initParamsStr.split('&') : [];

    // Dictionary with param names as keys & param values as values.
    const paramsObj = {};

    // Loop through splitParams to create paramsObj
    for (let i=0; i<splitParams.length; i++) {
        const paramAndValue = splitParams[i].split('=');
        paramsObj[paramAndValue[0]] = paramAndValue[1];
    }

    if (projID != null) { paramsObj.projID = projID; }
    else if ('projID' in paramsObj) { delete paramsObj.projID; }

    // Create updatedParamsStr by looping through paramsObj.
    let newParamsStr = '';
    for (const [param, value] of Object.entries(paramsObj)) {
        // If newParamsStr hasn't been added to, add initial question mark, otherwise add an ampersand.
        if (newParamsStr.length == 0) { newParamsStr = '?'; }
        else { newParamsStr += '&'; }
        // Add search param to newParamsStr.
        newParamsStr += param + '=' + value;
    }


    // Create new page url, stateObj, & title.
    var newUrl = window.location.origin + window.location.pathname + newParamsStr;
    const stateObj = {'path': newUrl};
    var newTitle = baseDocumentTitle;

    if (projID != null) {
        stateObj.projID = projID;
        if (projID in projectDataDict) { newTitle += ' | ' + projectDataDict[projID].title; }
        else { newTitle += ' | ' + projID; }
    }

    window.history.replaceState(stateObj, newTitle, newUrl);
    // window.history.pushState(stateObj, newTitle, newUrl);
    document.title = newTitle;
}




//--------------------------------------------------------------------------------------------------------------------------------|Misc. HTML Element Functions
// function setWorkDisplayTabIndexes(tabIndex, excludeRelatedWorks=true) {
//     // Set work display tab indexes.
//     const _workDisplays = excludeRelatedWorks ? WorkDisplayFactory.initialWorkDisplays : WorkDisplayFactory.allWorkDisplays;
//     for (let i=0; i<_workDisplays.length; i++) {
//         _workDisplays[i].element.setAttribute('tabindex', tabIndex);
//     }

//     // Set work category button tab indexes.
//     const workCatBtns = document.getElementsByClassName('workCatBtn');
//     for (let i=0; i<workCatBtns.length; i++) {
//         workCatBtns[i].setAttribute('tabindex', tabIndex);
//     }
// }




//--------------------------------------------------------------------------------------------------------------------------------|Event Listeners
// document.addEventListener('keyup', (e) => {
//     if (e.key == 'Escape') {
//         const topFullPreview = WorkDisplayFactory.getLastOpenedFullPreview();
//         // if (topFullPreview != null) { topFullPreview.closeFullPreview(); }
//         if (topFullPreview != null) { WorkDisplayFactory.closeFullPreview(topFullPreview); }
//     }
// });


// document.addEventListener('keydown', (e) => {
//     // Allow slides to be changed with arrow keys.
//     const topFullPreview = WorkDisplayFactory.getLastOpenedFullPreview();
//     if (topFullPreview != null) {
//         if (e.key == 'ArrowLeft') {
//             e.preventDefault();
//             topFullPreview.incrementCurrentSlide(-1);
//         } else if (e.key == 'ArrowRight') {
//             e.preventDefault();
//             topFullPreview.incrementCurrentSlide(1);
//         }
//     }
// });
