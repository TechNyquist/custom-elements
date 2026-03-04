/**
 * Simple class that can call a function on page load.
 * This is realiable because it will call the callback
 * when page loads or if the page has already loaded
 * either.
 * 
 * If you need to know if the callback was called right
 * away on constructor or on window.onload just query the
 * public flag "usedWindowEvent".
 * 
 * WARNING: in custom-elements this must be called in
 *  the "connectedCallback" method, not in constructor
 *  because it might deal with window object and in 
 *  constructor it might not be available yet.
 * 
 * USAGE:
 *  new RealiableOnLoad(this.#myMethod.bind(this));
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
export class ReliableOnLoad
{
    /**
     * Tells whether the callback was called or not.
     * @type {boolean}
     */
    wasCalled;
    /**
     * Tells whether the window.onload event was used
     * or not to detect page load. Otherwise the callback
     * was called right away.
     * This might be useful if you need to know it for
     * whatever reason.
     * @type {boolean}
     */
    usedWindowEvent;
    /**
     * The callback to call on load.
     * @type {Function}
     */
    #callback;
    /**
     * Internal use. The bound method for deferred callback.
     * @type {Function}
     */
    #boundMethod;

    constructor(callback)
    {
        this.wasCalled = false;
        this.usedWindowEvent = false;
        this.#callback = callback;
        this.#boundMethod = undefined;
        this.#process();
    }

    /**
     * The core code.
     * If the page is loaded it calls the function right away,
     * else it will register on page load (and unregister when
     * done) to wait page load to call it.
     */
    #process()
    {
        if( document.readyState === 'complete' )
        {
            // already loaded
            this.usedWindowEvent = false;
            this.#callback();
            this.wasCalled = true;
        }
        else
        {
            // wait for page load
            this.usedWindowEvent = true;
            this.#boundMethod = this.#windowOnLoad.bind(this);
            window.addEventListener('load', this.#boundMethod);
        }
    }

    #windowOnLoad(event)
    {
        window.removeEventListener('load', this.#boundMethod);
        this.#callback.call();
        this.wasCalled = true;
    }
}
