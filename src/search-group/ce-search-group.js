'use strict';

import { ReliableOnLoad } from "../lib/realiable-onload.js";

/**
 * Custom event class for SearchGroup search action.
 * This will be fired for both local and remote searches but
 * providing different properties populated.
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
export class SearchGroupSearchEvent extends Event
{
    /**
     * Array of criterias by input name.
     * This are populated only on local search.
     * @type {string[]}
     */
    criterias;
    /**
     * The count number assigned to the search.
     * Useful to detect the last search in case of
     * multiple searching triggered while typing.
     * @type {int}
     */
    count;
    /**
     * Parsed JSON response from server.
     * This is populated only on remote search.
     * @type {Object}
     */
    results;

    constructor()
    {
        super('search');
        this.criterias = undefined;
        this.count = 0;
        this.results = undefined;
    }
}

/**
 * Custom event class for SearchGroup start search event.
 * There is no event for search-end because the "search" event
 * marks the end of the search itself.
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
export class SearchGroupBeginSearchEvent extends Event
{
    /**
     * The count number assigned to search that is starting.
     * Useful for detecting the last search in case of multiple
     * searching triggered while typing.
     * @type {int}
     */
    count;

    constructor()
    {
        super('beginsearch');
        this.count = 0;
    }
}

/**
 * This custom-element watches more input fields (most of all
 * line input fields) detecting value changes. Then it gets
 * all the values and provides them to a search function, that
 * could be local or remote.
 * 
 * NOTE: remote searches must always respond in JSON format.
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
export default class SearchGroup extends HTMLElement
{
    static TAG = 'search-group';

    /**
     * Array of actualy input tags to watch.
     * @type {HTMLInputElement[]}
     */
    watchingInputs;
    /**
     * Callback to invoke on search.
     * @type {Function|null}
     */
    localCallback;
    /**
     * The optional remote URL to query.
     * @type {string|null}
     */
    remoteUrl;
    /**
     * Data format for sending to remote search.
     * By default it is "application/x-www-form-urlencoded".
     * @type {"form"|"json"}
     */
    rType;
    /**
     * Delay before search-call (both local and remote), in
     * milliseconds. 0 means "call on every input event".
     * @type {int}
     */
    delayAmount;
    /**
     * Object of additional key/value pairs to send with every remote search.
     * @type {Object}
     */
    additionalArgs;
    /**
     * Object of additional headers to send with every remote search.
     * @type {Object}
     */
    additionalHeaders;
    /**
     * Reusable search-event instance.
     * @type {SearchGroupSearchEvent}
     */
    searchEvent;
    /**
     * Reusable begin-search-event instance.
     * @type {SearchGroupBeginSearchEvent}
     */
    beginSearchEvent;
    /**
     * Bound method for delay check.
     * @type {Function}
     */
    #boundOnChange;
    /**
     * Handler of timeout used for delay check.
     * @type {int}
     */
    #delayTimeout;
    /**
     * Last search count.
     * @type {int}
     */
    #lastSearchCount;

    constructor(...args)
    {
        super(...args);

        this.watchingInputs = undefined;
        this.localCallback = undefined;
        this.remoteUrl = undefined;
        this.rType = undefined;
        this.delayAmount = undefined;
        this.additionalArgs = {};
        this.additionalHeaders = {};
        this.searchEvent = new SearchGroupSearchEvent();
        this.beginSearchEvent = new SearchGroupBeginSearchEvent();
        this.#boundOnChange = this.#onDelayedInputChange.bind(this);
        this.#delayTimeout = 0;
        this.#lastSearchCount = 0;

        // load template
        const tpl = /* HTML */`
            <slot></slot>
        `;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = tpl;
    }

    connectedCallback()
    {
        this.style.display = 'none';
        this.style.overflow = 'hidden';

        this.#readDOM();
        new ReliableOnLoad(this.#onWindowLoad.bind(this));
    }

    #readDOM()
    {
        this.watchingInputs = [];
        this.remoteUrl = this.getAttribute('remote') ?? null;
        this.rType = this.getAttribute('rtype') ?? "form";
        this.delayAmount = this.getAttribute('delay') ?? (this.remoteUrl ? 150 : 0);
    }

    /**
     * Called through ReliableOnLoad instance.
     */
    #onWindowLoad()
    {
        this.updateHooks();
    }

    /**
     * Hooks watch on requested inputs.
     * Could be called over and over again.
     */
    updateHooks()
    {
        this.#unhookAll();

        /** @type {SearchGroupTarget[]} targets */
        const targets = this.querySelectorAll(SearchGroupTarget.TAG);
        for(const target of targets)
        {
            const inputs = document.querySelectorAll(target.selector);
            for(const input of inputs)
            {
                // skip disabled inputs
                if( input.disabled )
                    continue;

                this.watchingInputs.push(input);
                input.addEventListener('input', this.#onInputChange.bind(this));
            }
        }
    }

    /**
     * Removes every listener on inputs.
     */
    #unhookAll()
    {
        for(const input of this.watchingInputs)
            input.removeEventListener('input', this.#onInputChange.bind(this));
        this.watchingInputs = [];
    }

    /**
     * @param {Event} event The input event object.
     */
    #onInputChange(event)
    {
        // increment search counter
        ++this.#lastSearchCount;
        // clear any previous delay-timer
        if( this.#delayTimeout )
            clearTimeout(this.#delayTimeout);
        // emit start search event
        if( this.remoteUrl )
            this.beginSearchEvent.count = this.#lastSearchCount;
        this.dispatchEvent(this.beginSearchEvent);
        // start new delay timer
        this.#delayTimeout = setTimeout(this.#boundOnChange, this.delayAmount, event, this.#lastSearchCount);
    }

    /**
     * @param {Event} event The input event object that fired before the delay.
     * @param {int} searchCount The count index assigned to this search.
     */
    #onDelayedInputChange(event, searchCount)
    {
        this.#delayTimeout = 0;

        // collect values from all the watched inputs
        let args = [];
        for(const input of this.watchingInputs)
        {
            if( !input )
                continue;

            if( input.value.length )
            {
                args.push({
                    name: input.name,
                    value: input.value,
                    tag: input
                });
            }
        }

        if( this.remoteUrl )
        {
            // remote search
            let headers;
            let payload;

            // append additional arguments
            for(const argName in this.additionalArgs)
            {
                args.push({
                    name: argName,
                    value: this.additionalArgs[argName]
                });
            }
            // append additional headers
            headers = this.additionalHeaders;

            switch(this.rType)
            {
                case 'form':
                {
                    headers['Content-Type'] = "application/x-www-form-urlencoded";
                    const pack = new URLSearchParams();
                    for(const arg of args)
                        pack.append(arg.name, arg.value);
                    payload = pack.toString();
                    break;
                }

                case 'json':
                {
                    headers['Content-Type'] = "application/json";
                    const pack = {};
                    for(const arg of args)
                        pack[arg.name] = arg.value;
                    payload = JSON.stringify(pack);
                    break;
                }

                default:
                {
                    console.error("rType not supported "+this.rType);
                    return;
                }
            }
            
            fetch(this.remoteUrl, {
                method: 'POST',
                headers: headers,
                body: payload
            })
                .then(this.#onFetchSuccess.bind(this, searchCount))
                .catch(this.#onFetchFailed.bind(this))
            ;
        }
        else
        {
            // local search
            this.searchEvent.criterias = args;
            this.searchEvent.count = searchCount;
            this.dispatchEvent(this.searchEvent);
        }
    }

    /**
     * Response from server.
     * 
     * @param {int} searchCount The incremental count assigned to this search.
     * @param {Response} response The response from server.
     */
    async #onFetchSuccess(searchCount, response)
    {
        // accept and notify only the result relative to the last remote search
        if( searchCount == this.#lastSearchCount )
        {
            this.searchEvent.results = await response.json();
            this.searchEvent.count = searchCount;
            this.dispatchEvent(this.searchEvent);
        }
    }

    /**
     * Failed call to server.
     */
    #onFetchFailed(e)
    {
        console.error(e);
    }
}

export class SearchGroupTarget extends HTMLElement
{
    static TAG = 'search-group-target';

    /**
     * The query-selector to find the tag to watch.
     * @type {string}
     */
    selector;

    constructor(...args)
    {
        super(...args);

        this.selector = undefined;
    }

    connectedCallback()
    {
        this.style.display = 'none';

        this.selector = this.getAttribute('selector');
    }
}

customElements.define(SearchGroupTarget.TAG, SearchGroupTarget);
customElements.define(SearchGroup.TAG, SearchGroup);
