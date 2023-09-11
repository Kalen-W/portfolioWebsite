//--------------------------------------------------------------------------------------------------------------------------------|Global Variables
// var documentation;
// var projectDataDict = {};
// var projectDataOrder = [];

// var youTubePlayerAPIReady = false;
// const ytApiFailDuration = 8192; // Milliseconds until YouTube API is assumed to have failed to load.




//--------------------------------------------------------------------------------------------------------------------------------|Load Doc. & Create projectDataDict
// function loadDocOfWorks() {
//     loadJson_thenFnc("./assets/jsonFiles/documentationOfWorks.json", setProjectData_index);
// }



// /** @param {object} data - Loaded json file object. */
// function setProjectData_index(data) {
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
    const featuredWorksElem = document.getElementById('featuredWorks');
    if (featuredWorksElem == null) {
        if (LOG_DEBUG_INFO) { console.error("No HTMLElement with id 'featuredWorks' found."); }
        onDisplaysCreated();
        return;
    }
    if (!Object.hasOwn(documentation.meta, 'featuredWorkIds')) {
        if (LOG_DEBUG_INFO) { console.warn("documentation.meta doesn't contain 'featuredWorkIds'."); }
        onDisplaysCreated();
        return;
    }

    for (let i=0; i<projectDataOrder.length; i++) {
        // if (!featuredWorkIds.includes(projectDataOrder[i].id)) { continue; }
        if (!documentation.meta.featuredWorkIds.includes(projectDataOrder[i].id)) { continue; }
        const data = projectDataDict[projectDataOrder[i].id];

        // const _workDisplay = new WorkDisplay(data, true);
        const _workDisplay = WorkDisplayFactory.newWorkDisplay(data, true);
        featuredWorksElem.appendChild(_workDisplay.container);
        // initialWorkDisplays.push(_workDisplay);
    }

    onDisplaysCreated();
}




//--------------------------------------------------------------------------------------------------------------------------------|On Process Finished Functions
function onYouTubePlayerAPIReady() {
    youTubePlayerAPIReady = true;
    if (LOG_DEBUG_INFO) { console.log("Youtube Player API Ready"); }
}


function onDisplaysCreated() {
    hideLoadingOverlay();
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
