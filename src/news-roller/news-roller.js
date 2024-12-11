import { detectPathOffset } from "../lib/path-utils.js";

/**
 * Big carousel of labels that cycle and show big picture.
 * NOTE: must be imported as "module".
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
class NewsRoller extends HTMLElement
{
    static TAG = 'news-roller';
    self = NewsRoller;
    pathOffset = detectPathOffset(this.baseURI, import.meta.url);
    /**
     * Shadow-root.
     * @type {HTMLElement}
     */
    shadow = null;

    // labels position
    static LEFT = 'left';
    static RIGHT = 'right';
    static TOP = 'top';
    static BOTTOM = 'bottom';

    /**
     * The master entry-ID counter, used as generator for all the IDs
     * to assign. It is global, that is entries are identified uniquely
     * in the page.
     * @type {int}
     */
    static masterID = 1;
    /**
     * The labels container tag.
     * @type {HTMLElement}
     */
    $labels;
    /**
     * The big screen for screen tag.
     * @type {HTMLElement}
     */
    $screen;
    /**
     * Current selected entry.
     * @type {NewsRollerEntry|null}
     */
    curEntry;
    /**
     * Array of all detected entries.
     * @type {NewsRollerEntry[]}
     */
    entries;

    constructor(...args)
    {
        super(...args);
        this.curEntry = null;
        this.entries = null;
    }

    connectedCallback()
    {
        this.shadow = this.attachShadow({mode:'open'});
        const tpl = this.#buildTemplate(this.self.LEFT);
        this.shadow.innerHTML = tpl;
        
        this.$labels = this.shadow.querySelector('#labels_container');
        this.$screen = this.shadow.querySelector('#screen_container');

        this.installEntries();
        this.addEventListener('slotchange', this.onSlotChanged.bind(this));
    }

    /**
     * First entries detection and installation.
     */
    installEntries()
    {
        /** @type {NewsRollerEntry[]} */
        this.entries = this.#detectAllEntries();
        
        let first_entry = null;
        for(const entry of this.entries)
        {
            entry.install(this);

            if( first_entry == null )
                first_entry = entry;
        }

        if( first_entry )
            this.setCurEntry(first_entry.entryID);
    }
    
    static get observedAttributes() {
        return [
        ];
    }
    attributeChangedCallback(name, oldValue, newValue)
    {
        switch(name)
        {
            default:
                break;
        }
    }

    /**
     * Show the given entry.
     * 
     * @param {int} entry_id The ID of the entry to show.
     */
    setCurEntry(entry_id)
    {
        if( this.curEntry && (this.curEntry.entryID == entry_id) )
            return;

        if( this.curEntry )
        {
            // hide previous entry
            this.curEntry.unselect();
        }
        const sel_entry = this.findEntry(entry_id);
        if( sel_entry )
        {
            // select the new entry
            sel_entry.select();
        }
        this.curEntry = sel_entry;
    }

    /**
     * Find and return the entry instance of given ID.
     * 
     * @param {int} entry_id The entryID of the entry to find.
     * @returns {NewsRollerEntry|null} The instance, or null if not found.
     */
    findEntry(entry_id)
    {
        for(const entry of this.entries)
        {
            if( entry.entryID == entry_id )
                return entry;
        }
        return null;
    }

    /**
     * Event triggered when clicking on a label.
     * 
     * @param {NewsRollerEntry} entry The entry that was recalled. Its label was clicked.
     * @param {Event} ev The click event.
     */
    onLabelClick(entry, ev)
    {
        this.setCurEntry(entry.entryID);
    }

    /**
     * Event fired when roller slots change.
     * @param {Event} ev The event fired by slot-change.
     */
    onSlotChanged(ev)
    {
        // TODO it's not so easy this one... gonna need to handle double events and so on
        //this.installEntries();
    }

    /**
     * Build and return template HTML according to desired
     * side for the labels.
     * 
     * @param {string} side One of the constants of the class for
     *      the side position.
     * @returns {string} HTML string.
     */
    #buildTemplate(side)
    {
        this.setAttribute('side', side);

        return `
            <link rel="stylesheet" type="text/css" href="${this.pathOffset}news-roller.css" />
            <div id="labels_container">
                <slot name="label"></slot>
            </div>
            <div id="screens_container">
                <slot></slot>
            </div>
        `;
    }

    /**
     * Detect all the entries provided by the invoking page and return them.
     * Be careful not to edit them at all, just reading.
     * 
     * @returns {NewsRollerEntry[]}
     */
    #detectAllEntries()
    {
        return this.querySelectorAll(':scope > news-roller-entry');
    }
}

/**
 * This tag is the only direct child permitted by "<news-roller>".
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
class NewsRollerEntry extends HTMLElement
{
    static TAG = 'news-roller-entry';
    /**
     * Shadow-root.
     * @type {HTMLElement}
     */
    shadow;

    /**
     * Identification number inside the roller.
     * @type {int}
     */
    entryID;
    /**
     * Array of tags slotted as title.
     * @type {HTMLElement[]}
     */
    label_tags;
    /**
     * Array of tags slotted as screen.
     * @type {HTMLElement[]}
     */
    screen_tags;

    constructor(...args)
    {
        super(...args);
        this.entryID = 0;

        const tpl = `
            <slot name="label"></slot>
            <slot></slot>
        `;
        this.shadow = this.attachShadow({mode:"open"});
        this.shadow.innerHTML = tpl;
    }

    connectedCallback()
    {
        this.label_tags = this.shadow.querySelector('slot[name="label"]').assignedElements();
        for(const $label of this.label_tags)
            $label.classList.add('label');
        this.screen_tags = this.shadow.querySelector('slot:not([name])').assignedElements();
        for(const $screen of this.screen_tags)
            $screen.classList.add('screen');
    }

    /**
     * Install entry in given roller.
     * @param {NewsRoller} roller The roller this entry belongs to.
     */
    install(roller)
    {
        this.entryID = roller.self.masterID++;
        this.setAttribute('entry-id', this.entryID);
        for(const $label of this.label_tags)
            $label.addEventListener('click', roller.onLabelClick.bind(roller, this));
    }

    uninstall(roller)
    {
        // TODO important on unconnect to avoid double events and so on
    }

    /**
     * Do whatever it takes to make this entry selected for showtime.
     */
    select()
    {
        for(const $label of this.label_tags)
            $label.classList.add('show');
        for(const $screen of this.screen_tags)
            $screen.classList.add('show');
    }

    /**
     * Do whatever it takes to make this entry hide from the show.
     */
    unselect()
    {
        for(const $label of this.label_tags)
            $label.classList.remove('show');
        for(const $screen of this.screen_tags)
            $screen.classList.remove('show');
    }

    /**
     * Entry changed event.
     */
    EntryChangeEvent = class extends Event
    {
        
    };
}

customElements.define(NewsRollerEntry.TAG, NewsRollerEntry);
customElements.define(NewsRoller.TAG, NewsRoller);
