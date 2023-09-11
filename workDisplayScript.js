//--------------------------------------------------------------------------------------------------------------------------------|Work Displays Factory
const WorkDisplayFactory = {
    /**@type {WorkDisplay[]}*/ initialWorkDisplays: [],
    /**@type {WorkDisplay[]}*/ allWorkDisplays: [],
    /**@type {WorkDisplay[]}*/ openedFullPreviews: [],

    newWorkDisplay: function(data, isInitialWorkDisplay=false) {
        const _workDisplay = new WorkDisplay(data, isInitialWorkDisplay);
        if (isInitialWorkDisplay) { this.initialWorkDisplays.push(_workDisplay); }
        this.allWorkDisplays.push(_workDisplay);

        return _workDisplay;
    },



//----------------------------------------------------------------|Open Full Preview
    /** @param {WorkDisplay} workDisplay */
    openFullPreview: function(workDisplay) {
        if (workDisplay.fullPreviewDisplayed) { return; }
        // Insure two initial work displays cannot be open at the same time.
        if (this.openedFullPreviews.length != 0 && workDisplay.isInitialWorkDisplay) { return; }
        // Add to list of currently opened previews.
        this.addToOpenedFullPreviews(workDisplay);

        // Hide all but the top 2 open full previews.
        this.updateOpenedFullPreviewsVisibility();

        // Set 'projID' URL search param.
        if (typeof setProjIdSearchParam === 'function') { setProjIdSearchParam(workDisplay.id); }
        this.updateOpenedFullPreviewsInteractability();
        pauseAllVideoSlides();

        workDisplay.openFullPreview();
    },



//----------------------------------------------------------------|Close Full Preview
    /** @param {WorkDisplay} workDisplay */
    closeFullPreview: function(workDisplay) {
        if (!workDisplay.fullPreviewDisplayed) { return; }
        // Ensure this work display cannot be closed while a related work display is open.
        if (workDisplay.hasOpenRelatedWorks()) { return; }
        // Remove workDisplay from openedFullPreviews.
        this.removeFromOpenedFullPreviews(workDisplay);

        // Insure top 2 open full previews are visible.
        this.updateOpenedFullPreviewsVisibility();

        // Set 'projID' URL search param.
        const topFullPreview = this.getLastOpenedFullPreview();
        if (typeof setProjIdSearchParam === 'function') { setProjIdSearchParam(topFullPreview); }
        this.updateOpenedFullPreviewsInteractability();

        // If no work display full previews are displayed, remove main scroll lock and make work displays tab navigable.
        if (this.openedFullPreviews.length == 0) {
            setMainScrollLock(false);
            // setWorkDisplayTabIndexes(0);
            this.setTabIndexes(0);
        }

        workDisplay.closeFullPreview();
    },



//----------------------------------------------------------------|Opened Full Preview Functions
    updateOpenedFullPreviewsVisibility: function() {
        for (let i=0; i<this.openedFullPreviews.length; i++) {
            if (i == this.openedFullPreviews.length-1 || i == this.openedFullPreviews.length-2) {
                this.openedFullPreviews[i].setFullPreviewVisibility(true);
            } else {
                this.openedFullPreviews[i].setFullPreviewVisibility(false);
            }
        }
    },
    // -?-: Rename (to something shorter)?



    /** @param {WorkDisplay} workDisplay */
    addToOpenedFullPreviews: function(workDisplay) {
        if (this.openedFullPreviews.includes(workDisplay)) { return; }
        this.openedFullPreviews.push(workDisplay);
    },

    /** @param {WorkDisplay} workDisplay */
    removeFromOpenedFullPreviews: function(workDisplay) {
        if (!this.openedFullPreviews.includes(workDisplay)) { return; }
        this.openedFullPreviews.splice(this.openedFullPreviews.indexOf(workDisplay), 1);
    },



//----------------------------------------------------------------|Get Opened Full Preview Functions
    /** @param {integer} index */
    getOpenedFullPreview: function(index) {
        if (this.openedFullPreviews.length == 0) { return null; }
        if (index < 0) { index = this.openedFullPreviews.length + index; }
        if (index < 0 || index >= this.openedFullPreviews.length) { return null }
        return this.openedFullPreviews[index];
    },


    getLastOpenedFullPreview: function() {
        if (this.openedFullPreviews.length == 0) { return null; }
        return this.openedFullPreviews[this.openedFullPreviews.length-1];
    },

    getSecondLastOpenedFullPreview: function() {
        if (this.openedFullPreviews.length < 2) { return null; }
        return this.openedFullPreviews[this.openedFullPreviews.length-2];
    },


    getDisplayedFullPreviewIds: function() {
        const displayedIds = [];
        for (let i=0; i<this.openedFullPreviews.length; i++) {
            displayedIds.push(this.openedFullPreviews[i].id);
        }
        return displayedIds;
    },



//----------------------------------------------------------------|Misc. Get Functions
    /** @param {string} id - The id of a project within the documentation. */
    getInitialWorkDisplay: function(id) {
        // Loop through work displays until one with a matching id is found & opened.
        for (let i=0; i<this.initialWorkDisplays.length; i++) {
            const _workDisplay = this.initialWorkDisplays[i];
            if (_workDisplay.id == id) { return _workDisplay; }
        }
        // No initial work display with 'id' exists.
        return null;
    },



//----------------------------------------------------------------|Set Work Display Tab Indexes
    setTabIndexes: function(tabIndex, excludeRelatedWorks=true) {
        // Set work display tab indexes.
        const _workDisplays = excludeRelatedWorks ? this.initialWorkDisplays : this.allWorkDisplays;
        for (let i=0; i<_workDisplays.length; i++) {
            _workDisplays[i].element.setAttribute('tabindex', tabIndex);
        }

        // Set work category button tab indexes.
        const workCatBtns = document.getElementsByClassName('workCatBtn');
        for (let i=0; i<workCatBtns.length; i++) {
            workCatBtns[i].setAttribute('tabindex', tabIndex);
        }
    },



//----------------------------------------------------------------|Update Opened Full Previews Interactability
// Sets all but the last opened full preview to be inert.
    updateOpenedFullPreviewsInteractability: function() {
        if (isNullOrEmpty(this.openedFullPreviews)) { return; }
        // Set last opened full preview.
        // this.getLastOpenedFullPreview().fullPreview.setAttribute('tabindex', -1);
        this.getLastOpenedFullPreview().fullPreview.inert = false;

        // Set all other opened full previews (if there are any).
        if (isNullOrEmpty(this.openedFullPreviews)) { return; }
        for (let i=0; i<this.openedFullPreviews.length-1; i++) {
            // this.openedFullPreviews[i].fullPreview.setAttribute('tabindex', 0);
            this.openedFullPreviews[i].fullPreview.inert = true;
        }
    }
    // TODO: Test if this does or doesn't prevent tab navigation to children.
    // -?-: Set all full previews (not just the opened ones)?
    // -?-: Rename (to something shorter)?
};




//--------------------------------------------------------------------------------------------------------------------------------|Work Displays Class
class WorkDisplay {
    isInitialWorkDisplay = false;
    fullPreviewDisplayed = false;
    /**@type {Slide[]}*/ wfp_slides = [];
    /**@type {WorkDisplay[]}*/ relatedWorks = [];

    hasNoRelatedWorks = false;
    relatedWorksCreated = false;
    currentSlideIndex = 0;
    slideLocked = false;
    isVideo = false; isYTEmbed = false;
    /**@type {WorkDisplay}*/ parentWorkDisplay = null;

    constructor(data, isInitialWorkDisplay=false) {
        if (LOG_DEBUG_INFO && data == null) { console.error("WorkDisplay creation attempted with null data."); return; }
        this.isInitialWorkDisplay = isInitialWorkDisplay;

        // data = the project data associated with this work display.
        this.data = data;
        // Note: these ids may not be unique, as its simply the id of associated project data.
        this.id = data.id;
        this.#constructHtml();
    }



    // TODO: Consider which HTML Elements don't need to be object properties.
    #constructHtml() {
        //================================|Construct Work Display Elements
        this.container = createElement('div', '', "workDisplayContainer");
        this.element = createElement('button', '', "workDisplay");
        if (this.isInitialWorkDisplay) { this.element.id = this.id; }
        // Note: 'element' is made a button for tabindex / keyboard navigation.
        this.imgDiv = createElement('div', '', "workDisplay_img");
        this.titleDiv = createElement('div', '', "workDisplay_title textOutlineBlack0_1em", this.data.title);
        this.overlay = createElement('div', '', "workDisplay_overlay");
        this.wfp_descContainer = createElement('div', '', "workDisplay_descContainer", this.data.desc_brief);

        this.container.dataset.id = this.data.id;
        this.element.title = this.data.title;

        // Add Click Event Listener
        // this.element.addEventListener('click', () => { this.openFullPreview(); });
        this.element.addEventListener('click', () => { WorkDisplayFactory.openFullPreview(this); });
        // Note: The anonymous function is to allow 'this' within 'openFullPreview' to
        // reference the WorkDisplay class, not the HTMLElement which called the function.

        // Assign imgDiv's background image.
        // if (this.data.img_thumbnail.type === 'youtubeVideo') { this.imgDiv.style.backgroundImage = "url("+'https://img.youtube.com/vi/'+this.data.url+'/default.jpg'+"')"; }
        // else { this.imgDiv.style.backgroundImage = "url('"+this.data.img_thumbnail.url+"')"; }
        this.imgDiv.style.backgroundImage = "url('"+this.data.img_thumbnail.url+"')";
        if (Object.hasOwn(this.data.img_thumbnail, 'imageRendering')) { this.imgDiv.style.imageRendering = this.data.img_thumbnail.imageRendering; }
        // TODO: Allow for videos / youtube embeds to be the first slide, using their thumbnail image for the imgDiv.

        this.overlay.appendChild(this.wfp_descContainer);
        this.imgDiv.appendChild(this.overlay);
        this.element.appendChild(this.imgDiv);
        this.element.appendChild(this.titleDiv);
        this.container.appendChild(this.element);


        //================================|Construct Full Preview Elements
        this.fullPreviewContainer = createElement('div', '', 'workFullPreviewContainer');
        this.fullPreview = createElement('div', '', 'workFullPreview');
        this.fullPreviewContainer.appendChild(this.fullPreview);

        //--------------------------------|Create full preview - close button
        this.wfp_closeBtn = createElement('button', '', 'wfp_closeBtn');
        this.wfp_closeBtn.title = 'Close Full Preview [Escape]';
        // Create close icon SVG element.
        const svgCloseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgCloseIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgCloseIcon.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
        svgCloseIcon.setAttribute('viewBox', '0 0 128 128');
        svgCloseIcon.innerHTML = `
            <path d="M 110, 18  18,110" class="outline" />
            <path d="M  18, 18 110,110" class="outline" />
            <path d="M 110, 18  18,110" />
            <path d="M  18, 18 110,110" />
        `;
        // Note: For some reason, the path elements wouldn't be visible if created with 'createElement'.
        this.wfp_closeBtn.appendChild(svgCloseIcon);
        // this.wfp_closeBtn.addEventListener('click', () => { this.closeFullPreview(); });
        this.wfp_closeBtn.addEventListener('click', () => { WorkDisplayFactory.closeFullPreview(this); });
        this.fullPreviewContainer.appendChild(this.wfp_closeBtn);

        //--------------------------------|Create full preview - header
        this.wfp_header = createElement('div', '', 'wfp_header');
        this.wfp_header_category = createElement('div', '', 'wfp_header_category');
        this.wfp_header_title = createElement('div', '', 'wfp_header_title');
        this.wfp_header.appendChild(this.wfp_header_category);
        this.wfp_header.appendChild(this.wfp_header_title);
        this.fullPreview.appendChild(this.wfp_header);

        //--------------------------------|Create full preview - body
        this.wfp_body = createElement('div', '', 'wfp_body');
        this.wfp_body_left = createElement('div', '', 'wfp_body_left');
        this.wfp_body_right = createElement('div', '', 'wfp_body_right');
        this.wfp_body.appendChild(this.wfp_body_right);
        this.wfp_body.appendChild(this.wfp_body_left);
        this.fullPreview.appendChild(this.wfp_body);
        // Note: wfp_body has flex-direction set to row-reverse & body_right is
        // appended first to allow the right side to be navigated to (with tab) first.


        //--------------------------------|Create full preview - body_left - slideshow
        this.#createSlideshow();

        //--------------------------------|Create full preview - body_left - description
        this.wfp_descContainer = createElement('div', '', 'wfp_descContainer');
        this.wfp_desc = createElement('div', '', 'wfp_desc');
        // Create description expand button, and add event listener to it.
        this.wfp_descExpandBtn = createElement('button', '', 'wfp_descExpandBtn', 'Show more');
        this.wfp_descExpandBtn.addEventListener('click', () => { this.toggleDescExpandState(); });

        this.wfp_descContainer.appendChild(this.wfp_desc);
        this.wfp_descContainer.appendChild(this.wfp_descExpandBtn);
        this.wfp_body_left.appendChild(this.wfp_descContainer);


        //--------------------------------|Create full preview - body_right - details
        const wfp_detailsContainer = createElement('div', '', 'wfp_detailsContainer');
        this.wfp_details = createElement('table', '', 'wfp_details');
        wfp_detailsContainer.appendChild(this.wfp_details);
        this.wfp_body_right.appendChild(wfp_detailsContainer);

        //--------------------------------|Create full preview - body_right - details - links
        this.wfp_details_linksContainer = createElement('tr', '', 'wfp_detailsChild');
        this.wfp_details_linksContainer.title = "Relevant Links:";
        this.wfp_details_links = createElement('td', '', 'wfp_detailContent');
        this.wfp_details_linksContainer.appendChild(createElement('td', '', 'wfp_detailLabel', "Links:"));
        this.wfp_details_linksContainer.appendChild(this.wfp_details_links);
        this.wfp_details.appendChild(this.wfp_details_linksContainer);

        //--------------------------------|Create full preview - body_right - details - tags
        this.wfp_details_tagsContainer = createElement('tr', '', 'wfp_detailsChild');
        this.wfp_details_tagsContainer.title = "Category Tags:";
        this.wfp_details_tagsContainer.appendChild(createElement('td', '', 'wfp_detailLabel', "Tags:"));
        this.wfp_details_tags = createElement('td', '', 'wfp_detailContent');
        this.wfp_details_tagsContainer.appendChild(this.wfp_details_tags);
        this.wfp_details.appendChild(this.wfp_details_tagsContainer);

        //--------------------------------|Create full preview - body_right - details - tools
        this.wfp_details_toolsContainer = createElement('tr', '', 'wfp_detailsChild');
        this.wfp_details_toolsContainer.title = "Development Tools:";
        this.wfp_details_toolsContainer.appendChild(createElement('td', '', 'wfp_detailLabel', "Dev Tools:"));
        this.wfp_details_tools = createElement('td', '', 'wfp_detailContent');
        this.wfp_details_toolsContainer.appendChild(this.wfp_details_tools);
        this.wfp_details.appendChild(this.wfp_details_toolsContainer);

        //--------------------------------|Create full preview - body_right - details - dates
        this.wfp_details_datesContainer = createElement('tr', '', 'wfp_detailsChild');
        this.wfp_details_datesLabel = createElement('td', '', 'wfp_detailLabel', "Dates:");
        this.wfp_details_datesContainer.appendChild(this.wfp_details_datesLabel);
        this.wfp_details_dates = createElement('td', '', 'wfp_detailContent');
        this.wfp_details_datesContainer.appendChild(this.wfp_details_dates);
        this.wfp_details.appendChild(this.wfp_details_datesContainer);


        this.wfp_relatedWorksContainer = createElement('div', '', 'wfp_relatedWorksContainer');
        this.fullPreview.appendChild(this.wfp_relatedWorksContainer);
        // this.wfp_body.appendChild(this.wfp_relatedWorksContainer);


        //--------------------------------|Create Credits Sections
        if (!isNullOrEmpty(this.data.credits)) {
            this.wfp_creditsSection = createElement('div', '', 'wfp_creditsSection');
            this.wfp_creditsContainer = createElement('div', '', 'wfp_creditsContainer');

            // const creditsHeaderContainer = createElement('div', '', 'wfp_creditsHeaderContainer');
            const creditsHeader = createElement('div', '', 'wfp_creditsHeader', "Credits / Resources:");
            // creditsHeaderContainer.appendChild(creditsHeader);
            // this.wfp_creditsContainer.appendChild(creditsHeaderContainer);
            this.wfp_creditsSection.appendChild(creditsHeader);

            this.wfp_creditsSection.appendChild(this.wfp_creditsContainer);
            this.fullPreview.appendChild(this.wfp_creditsSection);
        }


        this.#setFullPreviewContent();
        this.container.appendChild(this.fullPreviewContainer);
    }



    #createSlideshow() {
        // Create base container elements.
        this.wfp_slideshowSection = createElement('div', '', 'wfp_slideshowSection');
        this.wfp_slideshowContainer = createElement('div', '', 'wfp_slideshowContainer alignItems');
        this.wfp_slideSelector = createElement('div', '', 'wfp_slideSelector');
        /**@type {HTMLElement}*/ this.wfp_slideSelector_dotsContainer = createElement('div', '', 'wfp_slideSelector_dotsContainer unselectable');

        // Create first slide containing the thumbnail image.
        const thumbnailSlide = new Slide(this.data.img_thumbnail, this, true);
        // Slide display style is set to 'none' when created, undo this to insure thumbnailSlide is visible.
        thumbnailSlide.container.style.display = null;
        // Set thumbnailSlide's selectorDot click event, and add the active class.
        thumbnailSlide.selectorDotContainer.addEventListener('click', () => { this.setCurrentSlide(0); });
        thumbnailSlide.selectorDotContainer.classList.add('active');

        // Initiate slides and selector dots arrays, with initial elements for the thumbnail image
        this.wfp_slideshowContainer.appendChild(thumbnailSlide.container);
        this.wfp_slides = [thumbnailSlide];
        this.wfp_slideSelector_dotsContainer.appendChild(thumbnailSlide.selectorDotContainer);
        this.wfp_slideDots = [thumbnailSlide.selectorDotContainer];


        // Create slides from this.data.slideshowSlides
        if (Object.hasOwn(this.data, "slideshowSlides")) {
            for (let i=0; i<this.data.slideshowSlides.length; i++) {
                // const _slide = new Slide(this.data.slideshowSlides[i], this);
                var _slide;
                if (this.data.slideshowSlides[i].type == 'youtubeVideo') { _slide = new YTEmbedSlide(this.data.slideshowSlides[i], this); }
                else if (this.data.slideshowSlides[i].type == 'video') { _slide = new VideoSlide(this.data.slideshowSlides[i], this); }
                else { _slide = new Slide(this.data.slideshowSlides[i], this); }

                // Add slide to imgContainer HTMLElement and slides array.
                this.wfp_slideshowContainer.appendChild(_slide.container);
                this.wfp_slides.push(_slide);

                // _slide.selectorDot.dataset.index = i+1;
                // Add event listener to selector dot, & add it to dots container HTMLElement & slide dots array.
                _slide.selectorDotContainer.addEventListener('click', () => { this.setCurrentSlide(i+1); });
                this.wfp_slideSelector_dotsContainer.appendChild(_slide.selectorDotContainer);
                this.wfp_slideDots.push(_slide.selectorDotContainer);
            }
        }


        // Prevent slide selector from existing when only one slide exists.
        if (this.wfp_slides.length <= 1) {
            this.wfp_slideSelector = null;
        } else {
            const slideSelector_arrowLeft = createElement('button', '', 'wfp_slideSelector_arrow-left alignItems unselectable', "&#10094;");
            const slideSelector_arrowRight = createElement('button', '', 'wfp_slideSelector_arrow-right alignItems unselectable', "&#10095;");

            slideSelector_arrowLeft.addEventListener('click', () => { this.incrementCurrentSlide(-1); });
            slideSelector_arrowRight.addEventListener('click', () => { this.incrementCurrentSlide(1); });

            this.wfp_slideSelector.appendChild(slideSelector_arrowLeft);
            this.wfp_slideSelector.appendChild(slideSelector_arrowRight);
            this.wfp_slideSelector.appendChild(this.wfp_slideSelector_dotsContainer);
        }


        this.wfp_slideshowSection.appendChild(this.wfp_slideshowContainer);
        if (this.wfp_slideSelector) { this.wfp_slideshowSection.appendChild(this.wfp_slideSelector); }
        this.wfp_body_left.appendChild(this.wfp_slideshowSection);
    }



    #setFullPreviewContent() {
        // Set Header/Title
        this.wfp_header_category.innerHTML = documentation.meta.categoryData[this.data.category].displayName;
        this.wfp_header_title.innerHTML = this.data.title;
        // Set description
        this.wfp_desc.innerHTML = this.data.desc_detailed;
        // Add resize observer to description container to update description expand button.
        new ResizeObserver(() => { this.updateDescOnResize(); }).observe(this.wfp_descContainer);


        //--------------------------------|Set details - links
        if (isNullOrEmpty(this.data.links)) {
            this.wfp_details_linksContainer.style.display = 'none';
        } else {
            for (let i=0; i<this.data.links.length; i++) {
                const linkData = this.data.links[i];
                const anchor = createElement('a', '', '', linkData.displayName);
                anchor.href = linkData.url;
                anchor.target = '_blank';
                // If link type is 'download', set the anchor's download attribute.
                if (linkData.type == 'download') { anchor.setAttribute('download',''); }
                // Else if link is a local image or video, set the anchor's download attribute.
                else if (linkData.type == 'image' || linkData.type == 'video') {
                    if (!Object.hasOwn(linkData, 'absoluteUrl') || linkData.absoluteUrl == false) { anchor.setAttribute('download',''); }
                }
                anchor.title = anchor.href;
                this.wfp_details_links.appendChild(anchor);
                if (i != this.data.links.length-1) { this.wfp_details_links.innerHTML += "<br>"; }
            }
        }

        //--------------------------------|Set details - tags
        if (isNullOrEmpty(this.data.tags)) {
            this.wfp_details_tagsContainer.style.display = 'none';
        } else {
            const tagData = documentation.meta.tagData;
            for (let i=0; i<this.data.tags.length; i++) {
                const tagId = this.data.tags[i];
                const _span = document.createElement('span');
                // Set span's innerHTML to displayName & title to desc (defined in the documentation json file).
                if (Object.hasOwn(tagData, tagId)) {
                    _span.innerHTML = tagData[tagId].displayName;
                    _span.title = tagData[tagId].desc;
                } else {
                    _span.innerHTML = tagId;
                    if (LOG_DEBUG_INFO) { console.warn("Loaded documentation doesn't contain meta.tagData["+tagId+"]"); }
                }
                this.wfp_details_tags.appendChild(_span);
                // Add comma & space between the tag names.
                if (i != this.data.tags.length-1) { this.wfp_details_tags.innerHTML += " "; }
            }
        }

        //--------------------------------|Set details - development tools
        if (isNullOrEmpty(this.data.devTools)) {
            this.wfp_details_toolsContainer.style.display = 'none';
        } else {
            const devToolData = documentation.meta.devToolData;
            for (let i=0; i<this.data.devTools.length; i++) {
                const devToolId = this.data.devTools[i];
                const _span = document.createElement('span');
                // Set span's innerHTML to displayName & title to desc (defined in the documentation json file).
                if (Object.hasOwn(devToolData, devToolId)) {
                    _span.innerHTML = devToolData[devToolId].displayName;
                    _span.title = devToolData[devToolId].desc;
                } else {
                    _span.innerHTML = devToolId;
                    if (LOG_DEBUG_INFO) { console.warn("Loaded documentation doesn't contain meta.devToolData["+devToolId+"]"); }
                }
                this.wfp_details_tools.appendChild(_span);
                // Add comma & space between the dev tool names.
                if (i != this.data.devTools.length-1) { this.wfp_details_tools.innerHTML += " "; }
            }
        }

        //--------------------------------|Set details - dates
        const date_devStart = Object.hasOwn(this.data, 'date_devStart') ? formatDate(this.data.date_devStart) : null;
        const date_devEnd = Object.hasOwn(this.data, 'date_devEnd') ? formatDate(this.data.date_devEnd) : null;
        if (!isNullOrEmpty(date_devEnd)) {
            if (!isNullOrEmpty(date_devStart)) { // Both date_devEnd & date_devStart are valid:
                this.wfp_details_dates.innerHTML = date_devStart + " - " + date_devEnd;
                this.wfp_details_datesLabel.innerHTML = "Dev Time:";
                this.wfp_details_datesContainer.title = "Development Start & End Dates:";
            } else { // Only date_devEnd is valid:
                this.wfp_details_dates.innerHTML = date_devEnd;
                this.wfp_details_datesLabel.innerHTML = "Dev End:";
                this.wfp_details_datesContainer.title = "Development End Date:";
            }
        } else if (!isNullOrEmpty(date_devStart)) { // Only date_devStart is valid:
            this.wfp_details_dates.innerHTML = date_devStart + " - ???";
            this.wfp_details_datesLabel.innerHTML = "Dev Time:";
            this.wfp_details_datesContainer.title = "Development Start & End Dates:";
        } else { // Neither date_devEnd nor date_devStart is valid:
            this.wfp_details_datesContainer.style.display = 'none';
        }


        //--------------------------------|Set credits section contents
        if (this.wfp_creditsSection) {
            /**@type {wfpCredit[]}*/ this.allCredits = [];
            for (let i=0; i<this.data.credits.length; i++) {
                const _container = createElement('div', '', 'wfp_credit');
                const _labelContainer = createElement('div', '', 'wfp_credit_labelContainer');
                const _label = createElement('a', '', 'wfp_credit_label', this.data.credits[i].displayName);
                if (!isNullOrEmpty(this.data.credits[i].url)) {
                    _label.href = this.data.credits[i].url;
                    _label.target = '_blank';
                    _label.title = _label.href;
                }
                _labelContainer.appendChild(_label);
                _container.appendChild(_labelContainer);
                // TODO: Have html elements created within wfpCredit class' constructor.

                var _desc = null;
                if (Object.hasOwn(this.data.credits[i], 'desc')) {
                    _desc = createElement('div', '', 'wfp_credit_desc', this.data.credits[i].desc);
                    _container.appendChild(_desc);
                }

                const creditObj = new wfpCredit(_container, _labelContainer, _desc);

                // Add click event listener to expand/shrink credit container.
                _container.addEventListener('click', (e) => {
                    // Prevent expanding/shrinking when link (_label) is clicked.
                    if (e.target == creditObj.labelContainer) { return; }
                    // Prevent expanding/shrinking when text is being selected.
                    if (window.getSelection().toString()) { return; }
                    this.updatedCredit = creditObj;
                    // Toggle the 'expanded' class on the container & update container's title.
                    creditObj.toggleExpandState();
                });
                this.wfp_creditsContainer.appendChild(_container);
                this.allCredits.push(creditObj);
            }

            // Add resize observer to credits container to update all credit elements.
            // Note: If resize is due to a credit expanding/shrinking, that credit will be updated twice.
            this.RO_creditsContainer = new ResizeObserver(() => { this.updateCreditsOnResize(); }).observe(this.wfp_creditsContainer);
        }
    }



    // TODO: Currently, when multiple work display full previews are open,
    // all of them are still tab navigable, despite not being visible.
    #createRelatedWorksSection() {
        // if (this.hasNoRelatedWorks || this.relatedWorksCreated) { return; }
        // if (this.hasNoRelatedWorks) {
        //     this.wfp_relatedWorksContainer.style.display = 'none';
        //     return;
        // }
        if (isNullOrEmpty(this.data.relatedWorks)) {
            this.hasNoRelatedWorks = true;
            this.wfp_relatedWorksContainer.style.display = 'none';
            return;
        }

        if (this.relatedWorksCreated) {
            this.wfp_relatedWorksContainer.appendChild(this.wfp_relatedWorks_labelContainer);
            this.wfp_relatedWorksContainer.appendChild(this.wfp_relatedWorks);
            this.wfp_relatedWorksContainer.appendChild(this.wfp_relatedWorks_overlayContainer);
            return;
        }

        this.relatedWorksCreated = true;
        // if (!Object.hasOwn(this.data, 'relatedWorks') || this.data.relatedWorks.length == 0) {
        // if (isNullOrEmpty(this.data.relatedWorks)) {
        //     this.hasNoRelatedWorks = true;
        //     this.wfp_relatedWorksContainer.style.display = 'none';
        //     return;
        // }


        //--------------------------------|Create HTML
        // this.wfp_relatedWorksContainer = createElement('div', '', 'wfp_relatedWorksContainer');
        // if (this.wfp_relatedWorksContainer == null) { this.wfp_relatedWorksContainer = createElement('div', '', 'wfp_relatedWorksContainer'); }
        this.wfp_relatedWorks = createElement('div', '', 'wfp_relatedWorks');

        this.wfp_relatedWorks_labelContainer = createElement('div', '', 'wfp_relatedWorksLabelContainer');
        this.wfp_relatedWorks_labelContainer.appendChild(createElement('p', '', 'wfp_relatedWorksLabel', "Related Works:"));
        this.wfp_relatedWorksContainer.appendChild(this.wfp_relatedWorks_labelContainer);
        this.wfp_relatedWorksContainer.appendChild(this.wfp_relatedWorks);
        // this.fullPreview.appendChild(this.wfp_relatedWorksContainer);

        //--------------------------------|Create Overlay
        this.wfp_relatedWorks_overlayContainer = createElement('div', '', 'wfp_relatedWorks_overlayContainer');
        const wfp_relatedWorks_overlay = createElement('div', '', 'wfp_relatedWorks_overlay');
        this.wfp_relatedWorks_overlayContainer.appendChild(wfp_relatedWorks_overlay);
        this.wfp_relatedWorksContainer.appendChild(this.wfp_relatedWorks_overlayContainer);

        //--------------------------------|Create Work Displays
        this.relatedWorks = [];
        for (let i=0; i<this.data.relatedWorks.length; i++) {
            const relatedId = this.data.relatedWorks[i];
            // Skip over ids that aren't in projectDataDict, and projects that aren't enabled.
            if (!Object.hasOwn(projectDataDict, relatedId) || !projectDataDict[relatedId].enabled) { continue; }

            const relatedWorkDisplay = new WorkDisplay(projectDataDict[relatedId], false);
            relatedWorkDisplay.parentWorkDisplay = this;
            this.wfp_relatedWorks.appendChild(relatedWorkDisplay.container);
            this.relatedWorks.push(relatedWorkDisplay)
        }
    }



    setCurrentSlide(n) {
        if (this.slideLocked || this.wfp_slides.length < 2) { return; }
        if (n == this.currentSlideIndex || n < 0 || n >= this.wfp_slides.length) { return; }
        this.slideLocked = true;

        // Loop through all slides & update their styling & class list.
        for (let i=0; i<this.wfp_slides.length; i++) {
            // Insure all video slides are
            // if (this.wfp_slides[i].data.type == 'video' || this.wfp_slides[i].data.type == 'youtubeVideo') { this.wfp_slides[i].pauseVideo(); }
            if (typeof this.wfp_slides[i].pauseVideo === 'function') { this.wfp_slides[i].pauseVideo(); }


            if (i == n) { // This slide is the new current slide.
                // Set z-index & opacity to default values & set display.
                applyStyles(this.wfp_slides[i].container, {zIndex: null, opacity: null, display: 'block'});
                // Update associated selector "dot".
                this.wfp_slides[i].selectorDotContainer.classList.add('active');
            }
            else if (i == this.currentSlideIndex) { // This slide is the previous current slide.
                // Set the previous slide to render on top and set opacity to 0% (which has a CSS transition).
                applyStyles(this.wfp_slides[i].container, {zIndex: 623, opacity: '0%'});
                // Once the transition has finished, set opacity back to 100%, set display to none, and set slideLocked to false.
                onTransitionEnd(this.wfp_slides[i].container, (e) => {
                    applyStyles(this.wfp_slides[i].container, {opacity: null, display: 'none'});
                    this.slideLocked = false;
                }, true);
                // Update associated selector "dot".
                this.wfp_slides[i].selectorDotContainer.classList.remove('active');
            }
            else { // This slide is neither the new nor the previous current slide.
                // Set display & z-index.
                applyStyles(this.wfp_slides[i].container, {zIndex: 620, display: 'none'});
                // Update associated selector "dot".
                this.wfp_slides[i].selectorDotContainer.classList.remove('active');
            }
        }

        // Update current slide index.
        this.currentSlideIndex = n;

        // Scroll to position of active selector dot.
        // this.wfp_slides[this.currentSlideIndex].selectorDotContainer.scrollIntoView({behavior:'smooth', block:'nearest', inline:'nearest'});
        // Note: 'scrollIntoView' affects all ancestors, thus a custom solution was made to scroll only the dots container.
        let dotPosL = this.wfp_slides[this.currentSlideIndex].selectorDotContainer.offsetLeft;
        let dotPosR = dotPosL + this.wfp_slides[this.currentSlideIndex].selectorDotContainer.clientWidth;
        let scrollPosL = this.wfp_slideSelector_dotsContainer.scrollLeft;
        let containerWidth = this.wfp_slideSelector_dotsContainer.offsetWidth;
        let scrollPosR = scrollPosL + containerWidth;

        // Scroll to active dot if its not already completely in view.
        if (dotPosL < scrollPosL || dotPosR > scrollPosR) {
            // Scroll the smallest distance necessary to have the dot completely in view.
            let scrollToPos = Math.abs(scrollPosL-dotPosL) < Math.abs(scrollPosR-dotPosR) ? dotPosL : dotPosR-containerWidth;
            this.wfp_slideSelector_dotsContainer.scrollTo({left: scrollToPos, behavior: 'smooth'});
        }
        // Note: This doesn't seem to account for margin or something, as scrolling from the
        // first 'dot' to the last one will not fully scroll to the end of the dots container.
    }

    incrementCurrentSlide(n) {
        if (this.slideLocked || this.wfp_slides.length < 2) { return; }
        var newIndex = this.currentSlideIndex + n;
        // Allow for wrap around if 'n' is greater than the slide array's length, or less than 0.
        if (newIndex >= this.wfp_slides.length) { newIndex = 0; }
        else if (newIndex < 0) { newIndex = this.wfp_slides.length - 1; }
        this.setCurrentSlide(newIndex);
    }



//----------------------------------------------------------------|Open Full Preview
    openFullPreview() {
        if (this.fullPreviewDisplayed) { return; }
        // Insure two initial work displays cannot be open at the same time.
        // if (openedFullPreviews.length != 0 && initialWorkDisplays.includes(this)) { return; }
        this.fullPreviewDisplayed = true;
        // Add self to openedFullPreviews.
        // openedFullPreviews.push(this);
        // setProjIdSearchParam(this.id);

        // // Hide all but the top 2 open full previews.
        // if (openedFullPreviews.length > 2) {
        //     for (let i=0; i<openedFullPreviews.length-2; i++) {
        //         openedFullPreviews[i].fullPreviewContainer.style.display = 'none';
        //     }
        // }

        // if (this.parentWorkDisplay instanceof WorkDisplay) { this.parentWorkDisplay.pauseVideoSlides(); }

        // Related works section generated when full preview is opened to prevent
        // recursive loop in the event two sets of data contain references to each other.
        // if (!this.relatedWorksCreated) { this.createRelatedWorksSection(); }
        this.#createRelatedWorksSection();

        const rect = this.element.getBoundingClientRect();
        const compStyle = window.getComputedStyle(this.element);
        // console.log(rect); console.log(compStyle);

        // Remove focus from the main container.
        this.container.blur();
        this.fullPreview.focus();


        main.appendChild(this.fullPreviewContainer);

        // Set the element's initial position (width, height, top, & left) within new absolute positioning.
        applyStyles(this.fullPreviewContainer, {
            width: compStyle.width,
            height: compStyle.height,
            top: (rect.y + main.scrollTop)+'px',
            left: rect.x+'px'
        });
        // Add transition class to set initial transitioning style changes.
        this.fullPreviewContainer.classList.add('transitioning');

        // Apply non-animatable css style changes.
        this.wfp_closeBtn.style.display = 'none';
        applyStyles(this.wfp_slideSelector, {pointerEvents: 'none', cursor: 'default'});

        // Add to class lists
        this.container.classList.add('fullPreview');
        // The 'active' sets container's position to absolute and display to block.
        this.fullPreviewContainer.classList.add('active');

        // Scroll to top of container.
        this.fullPreviewContainer.scrollTop = 0;

        // Scroll lock 'main' and disable tab navigability for work displays.
        setMainScrollLock(true);
        // setWorkDisplayTabIndexes(-1);
        WorkDisplayFactory.setTabIndexes(-1);


        // Expand 'fullPreview' to cover entire main section.
        applyStyles(this.fullPreviewContainer, {width: '100%', height: '100%', top: main.scrollTop+'px', left: 0});
        // Remove transition class to revert transitioning style changes.
        this.fullPreviewContainer.classList.remove('transitioning');

        // Hide scrollbar until transition has ended.
        this.setScrollLock(true);


        // Once the full preview container finishes transitioning:
        // Remove scroll lock & revert non-animatable css style changes.
        onTransitionEnd(this.fullPreviewContainer, () => {
            this.setScrollLock(false);
            this.wfp_closeBtn.style.display = null;
            applyStyles(this.wfp_slideSelector, {pointerEvents: null, cursor: null});
            // this.updateDescOnResize();
            // this.updateCreditsOnResize();
        }, false);
    }



//----------------------------------------------------------------|Close Full Preview
    // TODO: Current slide can change while full preview is opening/closing,
    // & full preview can be closed while slide is transitioning.
    closeFullPreview() {
        // Ensure this function won't run if this work display isn't open.
        if (!this.fullPreviewDisplayed) { return; }
        // Ensure this work display cannot be closed while a related work display is open.
        if (this.hasOpenRelatedWorks()) { return; }
        this.fullPreviewDisplayed = false;
        // // Remove self from openedFullPreviews.
        // openedFullPreviews.splice(openedFullPreviews.indexOf(this), 1);

        // // Insure top 2 open full previews are visible.
        // if (openedFullPreviews.length >= 1) {
        //     openedFullPreviews[openedFullPreviews.length-1].fullPreviewContainer.style.display = null;
        // }
        // if (openedFullPreviews.length >= 2) {
        //     openedFullPreviews[openedFullPreviews.length-2].fullPreviewContainer.style.display = null;
        // }

        // setProjIdSearchParam(getLastOpenedFullPreview());

        // // If no work display full previews are displayed, remove main scroll lock and make work displays tab navigable.
        // if (openedFullPreviews.length == 0) {
        //     setMainScrollLock(false);
        //     setWorkDisplayTabIndexes(0);
        // }

        // Switch to first slide in slideshow. (This should also pause any video thats playing.)
        // TODO: Allow for the current slide to be forcefully set in case a slide transition is in progress when the full preview is closed.
        // this.slideLocked = false;
        this.setCurrentSlide(0);
        // Insure no video slides are playing.
        this.stopVideoSlides();

        // Should insure there isn't any unnecessary HTML Elements left if opening several nested work displays.
        // TODO: Simplify this process of insuring related works are created.
        // if (!initialWorkDisplays.includes(this) && this.relatedWorksCreated) {
        // if (!this.hasNoRelatedWorks && !this.isInitialWorkDisplay && this.relatedWorksCreated) {
        if (!isNullOrEmpty(this.relatedWorks) && !this.isInitialWorkDisplay && this.relatedWorksCreated) {
            if (LOG_DEBUG_INFO) { console.log("!hasNoRelatedWorks && !isInitialWorkDisplay && relatedWorksCreated", this); }
            // this.relatedWorksCreated = false;
            // this.wfp_relatedWorksContainer.remove();
            // this.wfp_relatedWorksContainer = null;
            this.wfp_relatedWorks_labelContainer.remove();
            this.wfp_relatedWorks.remove();
            this.wfp_relatedWorks_overlayContainer.remove();
            if (LOG_DEBUG_INFO) { console.log(this.wfp_relatedWorks); }
        }


        const rect = this.container.getBoundingClientRect();
        const compStyle = window.getComputedStyle(this.container);

        // Scroll to top of container.
        this.fullPreviewContainer.scrollTo({top: 0, behavior: 'instant'});
        // !!!: Setting overflow to hidden or clip seems to prevent smooth scrolling, so for now scrolling is instant.

        // Set full preview container to transition back to original location.
        applyStyles(this.fullPreviewContainer, {
            width: compStyle.width,
            height: compStyle.height,
            top: (rect.y + main.scrollTop)+'px',
            left: rect.x+'px'
        });
        this.fullPreviewContainer.classList.add('transitioning');

        // Disable scrolling
        // this.setScrollLock(true, false);

        // Set element width & height, replicating the hover/focus effect.
        applyStyles(this.element, {width: '100%', height: '100%'});

        // Animate other elements
        this.wfp_closeBtn.style.display = 'none';
        applyStyles(this.wfp_slideSelector, {pointerEvents: 'none', cursor: 'default'});


        // Hide full preview once transition has ended.
        onTransitionEnd(this.fullPreviewContainer, (e) => {
            // Remove from class lists
            this.container.classList.remove('fullPreview');
            this.fullPreviewContainer.classList.remove('active');
            this.fullPreviewContainer.classList.remove('transitioning');

            // Enable scrolling
            // this.setScrollLock(false);

            // Reset element width & height.
            setTimeout(() => { applyStyles(this.element, {width: null, height: null}); }, 8);
            // Revert full preview container styling.
            applyStyles(this.fullPreviewContainer, { width: null, height: null, top: null, left: null });
            // Return full preview container to being a child of the main container.
            this.container.appendChild(this.fullPreviewContainer);
        }, false);
    }



//----------------------------------------------------------------|Misc. Functions
    /**
     * Indicates if any work displays within the related works section have their full preview open.
     *  @returns {boolean}
     */
    hasOpenRelatedWorks() {
        if (!this.relatedWorksCreated || isNullOrEmpty(this.relatedWorks)) { return false; }

        for (let i=0; i<this.relatedWorks.length; i++) {
            if (this.relatedWorks[i].fullPreviewDisplayed) { return true; }
        }
        return false;
    }


    // 'closeFullPreview' no longer uses 'setScrollLock', as the
    // CSS class 'transitioning' now just sets overflow to hidden.
    // This also doesn't necessarily need to be used in 'openFullPreview',
    // as full previews being scrollable while opening doesn't cause any issues.
    // Except that if a full preview is closed during the opening transition
    // and has been scrolled, the contents aren't correctly aligned.
    /**
     * Sets lock state for full preview scrolling.
     * @param {boolean} state - Value which scroll lock is set to.
     * @param {boolean} [addPadding=true] - Determines if padding should be added to compensate for the removed scrollbar.
     */
    setScrollLock(state, addPadding=true) {
        // if (state) {
        //     this.fullPreviewContainer.addEventListener('scroll', event_preventDefault);
        //     this.fullPreviewContainer.addEventListener('touchmove', event_preventDefault);
        //     this.fullPreviewContainer.addEventListener('mousewheel', event_preventDefault);
        // } else {
        //     this.fullPreviewContainer.removeEventListener('scroll', event_preventDefault);
        //     this.fullPreviewContainer.removeEventListener('touchmove', event_preventDefault);
        //     this.fullPreviewContainer.removeEventListener('mousewheel', event_preventDefault);
        // }

        if (this.fullPreviewContainer == null || state == this.fullPreviewContainer.classList.contains('scrollLockedY')) { return; }

        if (!addPadding) { this.fullPreviewContainer.classList.toggle('scrollLockedY', state); }

        const preLockChangeWidth = this.fullPreviewContainer.clientWidth;
        this.fullPreviewContainer.classList.toggle('scrollLockedY', state);

        if (state) {
            const widthDiff = this.fullPreviewContainer.clientWidth - preLockChangeWidth;
            this.fullPreviewContainer.style.paddingRight = widthDiff + 'px';
        } else {
            this.fullPreviewContainer.style.paddingRight = null;
        }
        // Note: This method of setting padding-right to widthDifference will not work
        // if style.padding/style.paddingRight is changed anywhere else with JavaScript.
    }


    /** @param {Boolean} state */
    setFullPreviewVisibility(state) {
        if (state) { this.fullPreviewContainer.style.display = null; }
        else { this.fullPreviewContainer.style.display = 'none'; }
    }



//----------------------------------------------------------------|Description Updating
    toggleDescExpandState() {
        const expandState = this.wfp_descContainer.classList.toggle('expanded');
        this.wfp_descExpandBtn.innerHTML = expandState ? 'Show less' : 'Show more';
    }

    descShouldBeExpandable() {
        // if (!this.wfp_descContainer || !this.fullPreviewDisplayed) { return false; }

        var maxHeight = window.getComputedStyle(this.wfp_descContainer).maxHeight.replace('px', '');
        // Insure true is returned if max-height is set to 'none' via the 'expanded' class.
        if (maxHeight === 'none') { return true; }

        maxHeight = parseFloat(maxHeight);
        if (isNaN(maxHeight)) { return false; } // -?-

        return this.wfp_descContainer.offsetHeight >= maxHeight;
    }


    updateDescOnResize() {
        // Prevent update if desc container doesn't exist, or full preview isn't displayed.
        if (!this.wfp_descContainer || !this.fullPreviewDisplayed) { return; }

        if (this.descShouldBeExpandable()) {
            this.wfp_descExpandBtn.style.display = null;
            this.wfp_descContainer.classList.remove('notExpandable');

            const expandState = this.wfp_descContainer.classList.contains('expanded');
            this.wfp_descExpandBtn.innerHTML = expandState ? 'Show less' : 'Show more';
        } else {
            this.wfp_descExpandBtn.style.display = 'none';
            this.wfp_descContainer.classList.add('notExpandable');
        }
    }



//----------------------------------------------------------------|Credits Updating
    updatedCredit = null;

    updateCreditsOnResize() {
        // Prevent update if credits container doesn't exist, or full preview isn't displayed.
        if (!this.wfp_creditsContainer || !this.fullPreviewDisplayed) { return; }

        for (let i=0; i<this.allCredits.length; i++) {
            // This should prevent a credit which caused the resizing from being updated twice.
            // Although, nothing particularly happens even if a credit is updated twice.
            // TODO: Insure skipping over the previously updated credit works as intended.
            if (this.updatedCredit && this.allCredits[i] == this.updatedCredit) { continue; }
            this.allCredits[i].update();
        }

        this.updatedCredit = null;
    }



//----------------------------------------------------------------|Slide Functions
    pauseVideoSlides() {
        if (isNullOrEmpty(this.wfp_slides)) { return; }
        for (let i=0; i<this.wfp_slides.length; i++) {
            // if (this.wfp_slides[i] instanceof YTEmbedSlide || this.wfp_slides[i].isVideo) { this.wfp_slides[i].pauseVideo(); }
            if (typeof this.wfp_slides[i].pauseVideo === 'function') { this.wfp_slides[i].pauseVideo(); }
        }
    }


    stopVideoSlides() {
        if (isNullOrEmpty(this.wfp_slides)) { return; }
        for (let i=0; i<this.wfp_slides.length; i++) {
            // if (this.wfp_slides[i] instanceof YTEmbedSlide || this.wfp_slides[i].isVideo) { this.wfp_slides[i].stopVideo(); }
            if (typeof this.wfp_slides[i].stopVideo === 'function') { this.wfp_slides[i].stopVideo(); }
        }
    }
}




//--------------------------------------------------------------------------------------------------------------------------------|(Slideshow) Slide Class
class Slide {
    /**@type {HTMLElement}*/ container = null;
    /**@type {HTMLElement}*/ element = null;
    /**@type {HTMLElement}*/ selectorDotContainer = null;
    /**@type {HTMLElement}*/ selectorDot = null;
    /**@type {WorkDisplay}*/ workDisplay = null;
    /**@type {YT.Player}  */ ytPlayer = null;
    ytPlayerState;
    ytPlayerReady = false;

    constructor(data, workDisplayParent, isThumbnailSlide=false) {
        this.data = data;
        this.workDisplay = workDisplayParent;
        this.isThumbnailSlide = isThumbnailSlide;
        this.createHtml();

        // if (this.isVideo || this.isYTEmbed) { newVideoSlide(this); }
    }


    createHtml() {
        // Create image selector dot.
        this.selectorDotContainer = createElement('div', '', 'wfp_slideSelector_dotContainer');
        this.selectorDot = createElement('img', '', 'wfp_slideSelector_dot');
        this.selectorDotContainer.appendChild(this.selectorDot);
        // Set selector dot title to data's description.
        if (Object.hasOwn(this.data, 'desc')) { this.selectorDot.title = this.data.desc; }

        // Set selector dot's thumbnail image.
        const thumbnailData = this.getThumbnailSubData();
        if (thumbnailData != null) {
            this.selectorDot.src = thumbnailData.url;
            // Set image rendering if img_thumbnail has "imageRendering" set.
            if (Object.hasOwn(thumbnailData, 'imageRendering')) { this.selectorDot.style.imageRendering = thumbnailData.imageRendering; }
            // -?-: I can't decide if allowing pixelated image rendering looks good at smaller sizes.
        } else if (this.data.type == 'image') {
            this.selectorDot.src = this.data.url;
            // Set image rendering if img_thumbnail has "imageRendering" set.
            if (Object.hasOwn(this.data, 'imageRendering')) { this.selectorDot.style.imageRendering = this.data.imageRendering; }
        }


        // Create Slide & Set Contents
        this.container = createElement('a', '', 'wfp_slideContainer');
        if (this.data.type == 'image') {
            this.element = createElement('img', '', 'wfp_slide');
            if (this.isThumbnailSlide) { this.element.classList.add('thumbnail'); }
            this.element.src = this.data.url;
            if (Object.hasOwn(this.data, 'desc')) { this.element.alt = this.data.desc; }

            // Add click event listener to open the image in a new tab.
            // this.container.addEventListener('click', (e) => { window.open(this.data.url, '_blank'); });
            // Set container's href & target to open the image in a new tab when clicked.
            this.container.href = this.data.url;
            this.container.target = '_blank';
            // this.container.title = "Click to open image in new tab.";
            if (Object.hasOwn(this.data, 'desc')) { this.element.title = this.data.desc; }

            // Set image rendering if this.data has "imageRendering" set.
            if (Object.hasOwn(this.data, 'imageRendering')) { this.element.style.imageRendering = this.data.imageRendering; }
        }

        // Indicates this.data has an invalid type value.
        if (this.element == null) {
            if (LOG_DEBUG_INFO) { console.error(`Slide with url "${this.data.url}" has invalid type "${this.data.type}"`); }
            return;
        }

        this.container.appendChild(this.element);
        // Set container's display to 'none' so that the slide is initially hidden.
        this.container.style.display = 'none';
    }


    getThumbnailSubData() {
        if (!Object.hasOwn(this.data, 'subResourceData')) { return null; }
        if (Object.hasOwn(this.data.subResourceData, 'img_thumbnail')) { return this.data.subResourceData.img_thumbnail; }
        if (Object.hasOwn(this.data.subResourceData, 'thumbnail')) { return this.data.subResourceData.thumbnail; }
        return null;
    }
}
// TODO: Only have YouTube players become ready once a wfp is opened.




//--------------------------------------------------------------------------------------------------------------------------------|(Slideshow) YTEmbedSlide Class
class YTEmbedSlide extends Slide {
    // /**@type {YT.Player}*/ ytPlayer = null;
    // ytPlayerState;
    // ytPlayerReady = false;
    //  -?-: For some reason, declaring ytPlayer here causes it to not be set within createHtml.

    constructor(data, workDisplayParent, isThumbnailSlide=false) {
        super(data, workDisplayParent, isThumbnailSlide);
        newVideoSlide(this);
    }


    createHtml() {
        // Create image selector dot.
        this.selectorDotContainer = createElement('div', '', 'wfp_slideSelector_dotContainer');
        this.selectorDot = createElement('img', '', 'wfp_slideSelector_dot');
        this.selectorDotContainer.appendChild(this.selectorDot);
        // Set selector dot title to data's description.
        if (Object.hasOwn(this.data, 'desc')) { this.selectorDot.title = this.data.desc; }

        // Set selector dot's thumbnail image.
        const thumbnailData = this.getThumbnailSubData();
        if (thumbnailData != null) {
            this.selectorDot.src = thumbnailData.url;
            // Set image rendering if img_thumbnail has "imageRendering" set.
            if (Object.hasOwn(thumbnailData, 'imageRendering')) { this.selectorDot.style.imageRendering = thumbnailData.imageRendering; }
            // -?-: I can't decide if allowing pixelated image rendering looks good at smaller sizes.
        } else {
            this.selectorDot.src = 'https://img.youtube.com/vi/'+this.data.url+'/default.jpg';
        }

        // Create video icon.
        const vidIconContainer = createElement('div', '', 'wfp_slideSelector_dot_vidIconContainer alignItems');
        const vidIconInnerContainer = createElement('div', '', 'wfp_slideSelector_dot_vidIconInnerContainer');
        vidIconInnerContainer.appendChild(createElement('div', '', 'wfp_slideSelector_dot_vidIcon'));
        vidIconContainer.appendChild(vidIconInnerContainer);
        this.selectorDotContainer.appendChild(vidIconContainer);


        // Create container & iframe elements, & set iframe attributes.
        this.container = createElement('a', '', 'wfp_slideContainer');
        this.element = createElement('iframe', '', 'wfp_slide');

        // this.element.src = 'https://www.youtube.com/embed/'+this.data.url+'?rel=0&playsinline=1&enablejsapi=1';
        // this.element.src = '//www.youtube.com/embed/'+this.data.url+'?autoplay=false&rel=0&wmode=opaque&showinfo=false&enablejsapi=1';
        this.element.src = '//www.youtube-nocookie.com/embed/'+this.data.url+'?autoplay=false&rel=0&wmode=opaque&showinfo=false&enablejsapi=1';

        this.element.allowFullscreen = true;
        if (Object.hasOwn(this.data, 'desc')) { this.element.title = this.data.desc; }

        // Use YouTube API to create embedded player object.
        if (youTubePlayerAPIReady) {
            this.ytPlayer = new YT.Player(this.element, {
                videoId: this.data.url,
                events: {
                    'onReady': (e) => { this.#onPlayerReady(e); },
                    'onStateChange': (e) => { this.#onPlayerStateChange(e); }
                }
            });
        }

        if (LOG_DEBUG_INFO && this.ytPlayer == null) { console.log("YouTube Player failed to be created.", this); }

        this.container.appendChild(this.element);
        // Set container's display to 'none' so that the slide is initially hidden.
        this.container.style.display = 'none';
    }


//----------------------------------------------------------------|Video Functions
    isVideo = false; isYTEmbed = true;

    #onPlayerReady(e) {
        this.ytPlayerReady = true;
        if (LOG_DEBUG_INFO) { console.log("Youtube Player Ready:", this, e); }
        // Note: e.target == this.ytPlayer
    }

    #onPlayerStateChange(e) {
        /* YT.PlayerState:
            UNSTARTED = -1
            ENDED     =  0
            PLAYING   =  1
            PAUSED    =  2
            BUFFERING =  3
            CUED      =  5
        */
        if (LOG_DEBUG_INFO) { console.log("Youtube Player:", this ,"State Change:", e); }
        this.ytPlayerState = e.data;
    } // -?-: onPlayerStateChange doesn't seem to be called at any point.


    playVideo() {
        try {
            if (this.ytPlayerReady) { this.ytPlayer.playVideo(); }
        } catch (error) {
            console.error(error, this.ytPlayer);
        }
    }

    pauseVideo() {
        try {
            if (this.ytPlayerReady) { this.ytPlayer.pauseVideo(); }
        } catch (error) {
            console.error(error, this.ytPlayer);
        }
    }

    stopVideo() {
        try {
            if (this.ytPlayerReady) { this.ytPlayer.stopVideo(); }
        } catch (error) {
            console.error(error, this.ytPlayer);
        }
    }

    setCurrentTime(seconds) {
        try {
            if (this.ytPlayerReady) { this.ytPlayer.seekTo(seconds, false); }
        } catch (error) {
            console.error(error, this.ytPlayer);
        }
    }
}




//--------------------------------------------------------------------------------------------------------------------------------|(Slideshow) VideoSlide Class
class VideoSlide extends Slide {
    videoCanPlay = false;

    constructor(data, workDisplayParent, isThumbnailSlide=false) {
        super(data, workDisplayParent, isThumbnailSlide);
        newVideoSlide(this);
    }


    createHtml() {
        // Create image selector dot.
        this.selectorDotContainer = createElement('div', '', 'wfp_slideSelector_dotContainer');
        this.selectorDot = createElement('img', '', 'wfp_slideSelector_dot');
        this.selectorDotContainer.appendChild(this.selectorDot);
        // Set selector dot title to data's description.
        if (Object.hasOwn(this.data, 'desc')) { this.selectorDot.title = this.data.desc; }

        // Set selector dot's thumbnail image.
        const thumbnailData = this.getThumbnailSubData();
        if (thumbnailData != null) {
            this.selectorDot.src = thumbnailData.url;
            // Set image rendering if img_thumbnail has "imageRendering" set.
            if (Object.hasOwn(thumbnailData, 'imageRendering')) { this.selectorDot.style.imageRendering = this.thumbnailData.imageRendering; }
        }
        // Note: Local video files will need a thumbnail set within their subResourceData.

        // Create video icon.
        const vidIconContainer = createElement('div', '', 'wfp_slideSelector_dot_vidIconContainer alignItems');
        const vidIconInnerContainer = createElement('div', '', 'wfp_slideSelector_dot_vidIconInnerContainer');
        vidIconInnerContainer.appendChild(createElement('div', '', 'wfp_slideSelector_dot_vidIcon'));
        vidIconContainer.appendChild(vidIconInnerContainer);
        this.selectorDotContainer.appendChild(vidIconContainer);


        // Create container & video elements, & set video attributes.
        this.container = createElement('a', '', 'wfp_slideContainer');
        this.element = createElement('video', '', 'wfp_slide');
        this.element.src = this.data.url;
        this.element.preload = 'metadata';
        this.element.controls = true;
        if (thumbnailData != null) { this.element.poster = thumbnailData.url; }
        if (Object.hasOwn(this.data, 'desc')) {
            this.element.innerHTML = this.data.desc;
            this.element.title = this.data.desc;
        }

        // Create fallback text & link incase the video cannot load.
        const fallbackText = createElement('p');
        fallbackText.innerText = 'Your browser does not support HTML video.';
        const fallbackLink = createElement('a');
        fallbackLink.innerText = 'Here is a link to the video instead.';
        fallbackLink.href = this.data.url;
        fallbackLink.target = '_blank';
        fallbackText.appendChild(fallbackLink);
        this.element.appendChild(fallbackText);

        this.container.appendChild(this.element);
        // Set container's display to 'none' so that the slide is initially hidden.
        this.container.style.display = 'none';

        // Create event listener for setting videoCanPlay.
        this.element.oncanplay = (e) => {
            if (LOG_DEBUG_INFO) { console.log('Video Can Play:', e); }
            this.videoCanPlay = true;
        };
    }


//----------------------------------------------------------------|Video Functions
    isVideo = true; isYTEmbed = false;


    playVideo() {
        try {
            if (this.videoCanPlay) { this.element.play(); }
        } catch (error) {
            console.error(error, this);
        }
    }

    pauseVideo() {
        try {
            this.element.pause();
        } catch (error) {
            console.error(error, this);
        }
    }

    stopVideo() {
        try {
            this.element.pause();
            this.setCurrentTime(0);
        } catch (error) {
            console.error(error, this);
        }
    }

    setCurrentTime(seconds) {
        try {
            this.element.currentTime = seconds;
        } catch (error) {
            console.error(error, this);
        }
    }
}




//--------------------------------------------------------------------------------------------------------------------------------|Slideshow / Slide Functions
// TODO: Find a better solution for pausing videos when a related work's full preview is opened.
/**@type {Slide[]}*/ var videoSlides = [];

/** @param {Slide} _slide */
function newVideoSlide(_slide) {
    // Insure there are no null values in videoSlides.
    for (let i=0; i<videoSlides.length; i++) {
        if (isNullOrEmpty(videoSlides[i])) { videoSlides.splice(i, 1); }
    }

    // Add video/ytEmbed slide to videoSlides.
    // if (!(_slide instanceof YTEmbedSlide) && !(_slide instanceof VideoSlide)) { return; }
    if (!_slide.isYTEmbed && !_slide.isVideo) { return; }
    if (isNullOrEmpty(_slide) || videoSlides.includes(_slide)) { return; }
    videoSlides.push(_slide);
}


function pauseAllVideoSlides() {
    for (let i=0; i<videoSlides.length; i++) {
        videoSlides[i].pauseVideo();
    }
}
// -?-: Move newVideoSlide & pauseAllVideoSlides functionality into WorkDisplayFactory?
// Or create a slide factory object?




//--------------------------------------------------------------------------------------------------------------------------------|(Work Display Full Preview) Credit Class
class wfpCredit {
    constructor(container, labelContainer, desc) {
        /**@type {HTMLElement}*/ this.container = container;
        /**@type {HTMLElement}*/ this.labelContainer = labelContainer;
        /**@type {HTMLElement|null}*/ this.desc = desc;
    }


    hasOverflowText() {
        if (this.container.classList.contains('expanded')) {
            // const labelLineHeight = this.label.computedStyleMap().get('line-height').value;
            const labelLineHeight = window.getComputedStyle(this.labelContainer).lineHeight.replace('px', '');
            // console.log('Credit Label: offsetHeight/lineHeight = '+(this.labelContainer.offsetHeight/labelLineHeight));
            if (this.labelContainer.offsetHeight / labelLineHeight > 1.2) { return true; }

            if (this.desc) {
                // const descLineHeight = this.desc.computedStyleMap().get('line-height').value;
                const descLineHeight = window.getComputedStyle(this.desc).lineHeight.replace('px', '');
                // console.log('Credit Desc: clientHeight/lineHeight = ' + (this.desc.clientHeight/descLineHeight));
                if (this.desc.clientHeight / descLineHeight > 1.2) { return true; }
            }

            return false;
        }

        if (this.labelContainer && this.labelContainer.scrollWidth > this.labelContainer.clientWidth) { return true; }
        if (this.desc && this.desc.scrollWidth > this.desc.clientWidth) { return true; }
        return false;
    }


    toggleExpandState() {
        // Toggle the 'expanded' class on the container.
        this.container.classList.toggle('expanded');
        // Update container's title.
        this.update();
    }


    update() {
        if (this.hasOverflowText()) {
            // Update container's title based on it's expanded state.
            const expandState = this.container.classList.contains('expanded');
            this.container.title = expandState ? 'Click to show less.' : 'Click to show more.';
        } else {
            // Insure container doesn't have the 'expanded' class, & remove it's title.
            this.container.classList.remove('expanded');
            this.container.title = '';
        }
    }
}




//--------------------------------------------------------------------------------------------------------------------------------|Load Doc. & Create projectDataDict
var documentation;
var projectDataDict = {};
var projectDataOrder = [];

var youTubePlayerAPIReady = false;
const ytApiFailDuration = 4096; // Milliseconds until YouTube API is assumed to have failed to load.


function loadDocOfWorks() {
    loadJson_thenFnc("./assets/jsonFiles/documentationOfWorks.json", setProjectData_index);
}



/** @param {object} data - Loaded json file object. */
function setProjectData_index(data) {
    documentation = data;
    if (documentation == null) {
        if (LOG_DEBUG_INFO) { console.error("Error loading documentation json file."); }
        return;
    }
    if (LOG_DEBUG_INFO) { console.log("documentation:", documentation); }

    // Check if 'createWorkDisplays' function exists before continuing.
    // 'createWorkDisplays' should be defined on a page specific basis, such as within 'indexScript.js' & 'myWorkScript.js'.
    if (typeof createWorkDisplays !== 'function') {
        if (LOG_DEBUG_INFO) { console.error("Function 'createWorkDisplays' doesn't exist."); }
        return;
    }

    // Create project data dictionary.
    // Loops through $schema, meta, gameProjects, models, art, webDesign, & miscWorks.
    for (const [key, value] of Object.entries(data)) {
        // Ignore $schema (& anything else that starts with '$') & meta.
        if (key[0] == '$' || key == 'meta') { continue; }

        // Loops through the contents (projectDatas) of gameProjects, models, art, animation, webDesign, & miscWorks.
        for (let i=0; i<value.length; i++) {
            const projData = value[i];
            if (!projData.enabled) { continue; } // Skip any projectDatas that have enabled set to false.

            if (Object.hasOwn(projectDataDict, projData.id)) {
                if (LOG_DEBUG_INFO) { console.error("Multiple objects within the loaded documentation are assigned the id: \""+projData.id+"\"."); }
                continue;
            }

            projectDataDict[projData.id] = projData;

            const _priority = Object.hasOwn(projData, 'priority') ? projData.priority : 0;
            projectDataOrder.push({id: projData.id, title: projData.title, priority: _priority});
        }
    }

    // Sort projectDataOrder by alphabetical order of titles.
    projectDataOrder.sort((a, b) => a.title.localeCompare(b.title));
    // Sort projectDataOrder by greatest to smallest priority. (Should keep the alphabetical ordering?)
    projectDataOrder.sort((a, b) => b.priority - a.priority);
    if (LOG_DEBUG_INFO) { console.log("projectDataOrder:", projectDataOrder); }


    // Debug testing to insure all ids within each projectData's relatedWorks array are valid.
    if (LOG_DEBUG_INFO) {
        for (const [id, data] of Object.entries(projectDataDict)) {
            const relatedWorkIds = data.relatedWorks;
            for (let i=0; i<relatedWorkIds.length; i++) {
                if (Object.hasOwn(projectDataDict, relatedWorkIds[i])) { continue; }
                console.error('Project "'+id+'" has invalid related works ID "'+relatedWorkIds[i]+'".');
            }
        }
    }


    // Create work displays once YouTube API has loaded.
    var firstApiCheckTime = window.performance.now(); // Time passed since 'ifApiReady_CreateDisplays' was initially called.

    const ifApiReady_CreateDisplays = () => {
        if (youTubePlayerAPIReady) { createWorkDisplays(data); }
        else if (window.performance.now() - firstApiCheckTime > ytApiFailDuration) { createWorkDisplays(data); }
        else { setTimeout(ifApiReady_CreateDisplays, 16); }
        // Note: The use of a setTimeout here doesn't seem ideal.
    };
    ifApiReady_CreateDisplays();
    // TODO: Check what happens if YouTube API fails to load.
}




//--------------------------------------------------------------------------------------------------------------------------------|Event Listeners
document.addEventListener('keyup', (e) => {
    if (e.key == 'Escape') {
        const topFullPreview = WorkDisplayFactory.getLastOpenedFullPreview();
        // if (topFullPreview != null) { topFullPreview.closeFullPreview(); }
        if (topFullPreview != null) { WorkDisplayFactory.closeFullPreview(topFullPreview); }
    }
});


document.addEventListener('keydown', (e) => {
    // Allow slides to be changed with arrow keys.
    const topFullPreview = WorkDisplayFactory.getLastOpenedFullPreview();
    if (topFullPreview != null) {
        if (e.key == 'ArrowLeft') {
            e.preventDefault();
            topFullPreview.incrementCurrentSlide(-1);
        } else if (e.key == 'ArrowRight') {
            e.preventDefault();
            topFullPreview.incrementCurrentSlide(1);
        }
    }
});
