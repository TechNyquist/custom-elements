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
    $screens;
    /**
     * Current selected entry.
     * @type {NewsRollerEntry|null}
     */
    curEntry;
    /**
     * Array of all detected entry-pairs. For ease of use they are detected and
     * arranged in this handy array.
     * @type {NewsRollerEntry[]}
     */
    entries;
    /**
     * The observer of any change in the organization of roller entries.
     * @type {MutationObserver}
     */
    mutationObserver;

    constructor(...args)
    {
        super(...args);
        this.curEntry = null;
        this.entries = [];

        this.shadow = this.attachShadow({mode:'open'});
        const tpl = this.#buildTemplate(this.self.LEFT);
        this.shadow.innerHTML = tpl;

        this.$labels = this.shadow.querySelector('#labels_container');
        this.$screens = this.shadow.querySelector('#screens_container');

        this.mutationObserver = new MutationObserver(this.onMutation.bind(this));
    }

    connectedCallback()
    {
        this.detectEntries();
    }

    disconnectedCallback()
    {
        this.uninstallEntries();
    }

    /**
     * Detect all entries and arrange in internal "entries" pairs list.
     */
    detectEntries()
    {
        // let's find all the entries and diff them with existing one; no
        // need to destroy what wasn't edited
        this.uninstallEntries();

        /** @type {NewsRollerEntry[]} */
        let new_entries = [];

        /** @type {HTMLSlotElement} */
        const $labels_slot = this.shadow.querySelector('slot[name="label"]');
        /** @type {HTMLSlotElement} */
        const $screens_slot = this.shadow.querySelector('slot:not([name])');
        /** @type {HTMLElement[]} */
        const $labels = $labels_slot.assignedElements();
        /** @type {HTMLElement[]} */
        const $screens = $screens_slot.assignedElements();
        const max_count = Math.min($labels.length, $screens.length);
        for(let i = 0; i < max_count; ++i)
        {
            const $label = $labels[i];
            const $screen = $screens[i];
            const entry = new NewsRollerEntry($label, $screen);
            entry.install(this);
            new_entries.push(entry);
        }
        
        this.entries = new_entries;
        if( this.entries.length > 0 )
            this.setCurEntry(this.entries[0].entryID);

        this.mutationObserver.observe(this, {
            childList: true
        });
    }

    /**
     * Uninstall every entry detection. Useful before a new detection to
     * avoid double events.
     */
    uninstallEntries()
    {
        this.mutationObserver.disconnect();

        for(const entry of this.entries)
            entry.uninstall();
        this.entries = [];
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
            if( entry.is(entry_id) )
                return entry;
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
        console.log('clicked ' + entry.entryID);
        this.setCurEntry(entry.entryID);
    }

    // /**
    //  * Event fired when roller slots change.
    //  * @param {Event} ev The event fired by slot-change.
    //  */
    // onSlotChanged(ev)
    // {
    //     this.detectEntries();
    // }

    /**
     * Event fired when something changes inside the element.
     */
    onMutation(ev)
    {
        this.detectEntries();
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
}

/**
 * This tag is the only direct child permitted by "<news-roller>".
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
class NewsRollerEntry
{
    /**
     * Identification number inside the roller.
     * @type {int}
     */
    entryID;
    /**
     * The roller this entry belongs to.
     * @type {NewsRoller}
     */
    roller;
    /**
     * The label element.
     * @type {HTMLElement}
     */
    $label;
    /**
     * The main content element, associated to the entry's label.
     * @type {HTMLElement}
     */
    $screen;
     /**
     * This object is sort of a cache of binded functions. They are useful to
     * enable removing of event-listeners.
     * @type {object}
     */
     #bindings;

    /**
     * It's ok to leave null these values but remember to set them before
     * any use.
     * 
     * @param {HTMLElement} $label The label of the pair.
     * @param {HTMLElement} $screen The screen of the pair.
     */
    constructor($label, $screen)
    {
        this.entryID = 0;
        this.roller = null;
        this.$label = $label || null;
        this.$screen = $screen || null;
        this.#bindings = {};
    }

    /**
     * Test whether or not the given ID is of this entry.
     * 
     * @param {int} entry_id The ID to test.
     * @returns {boolean}
     */
    is(entry_id)
    {
        return this.entryID == entry_id;
    }

    /**
     * Install entry in given roller.
     * @param {NewsRoller} roller The roller this entry belongs to.
     */
    f;
    install(roller)
    {
        this.roller = roller;
        this.entryID = roller.self.masterID++;
        this.#bindings.labelClick = this.roller.onLabelClick.bind(this.roller, this);
        this.$label.addEventListener('click', this.#bindings.labelClick);
    }

    uninstall()
    {
        this.$label.removeEventListener('click', this.#bindings.labelClick);
        this.roller = null;
        this.entryID = -1;
    }

    /**
     * Do whatever it takes to make this entry selected for showtime.
     */
    select()
    {
        this.$label.classList.add('show');
        this.$screen.classList.add('show');
    }

    /**
     * Do whatever it takes to make this entry hide from the show.
     */
    unselect()
    {
        this.$label.classList.remove('show');
        this.$screen.classList.remove('show');
    }

    /**
     * Entry changed event.
     */
    EntryChangeEvent = class extends Event
    {
        
    };
}

customElements.define(NewsRoller.TAG, NewsRoller);
