'use strict';

/**
 * This class is able to place a tactical tag on the DOM that
 * lets him detect when viewport changes.
 * With this you can acknowledge whether viewport is mobile or not,
 * also detect a change occurs between one to another.
 * 
 * USAGE, bonus example:
 *      <viewport-detector>
 *          <viewport-watch code="custom"	media="only screen and (min-width : 320px)"></viewport-watch>
 *          <viewport-watch code="mobile"	media="only screen and (min-width : 480px)"></viewport-watch>
 *          <viewport-watch code="tablet"	media="only screen and (min-width : 768px)"></viewport-watch>
 *          <viewport-watch code="desktop"	media="only screen and (min-width : 992px)"></viewport-watch>
 *          <viewport-watch code="wide"		media="only screen and (min-width : 1200px)"></viewport-watch>
 *      </viewport-detector>
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
export default class ViewportDetector extends HTMLElement
{
    self = ViewportDetector;
    static TAG = 'viewport-detector';

    /**
     * Whether viewport is mobile or not.
     * @type {bool} isMobile
     */
    watchCode;
    /**
     * Array of callback functions to call as listeners.
     * @type {Function[]}
     */
    listeners;
    /**
     * list of detected watches.
     * @type {ViewportWatch[]}
     */
    watches;

    constructor(...args)
    {
        super(...args);

        this.watchCode = undefined;
        this.listeners = [];
        this.watches = [];

        // style must be defined here and not as tag's attributes, for style-priority concerns
        const tpl = `
            <style data-role="main">
                :host
                {
                    display: block;
                    position: absolute;
                    left: 0px;
                    top: 0px;
                }
            </style>

            <slot></slot>
        `;

        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = tpl;

        // update on page load
        window.addEventListener('load', () => this.enableMobileDetection());
    }

    connectedCallback()
    {
        this.detectWatchMedias();
    }

    disconnectedCallback()
    {
        const styles = this.querySelectorAll('style[data-role="watch"]');
        for(const style of styles)
            this.shadowRoot.removeChild(style);
    }

    /**
     * Detect children "watches" and write embedded style checkpoints
     * accordingly.
     */
    detectWatchMedias()
    {
        this.watches = this.querySelectorAll(ViewportWatch.TAG);

        let style = '';
        let index = 1;
        for(const watch of this.watches)
        {
            watch.left = index++;

            style +=
            `
                @media ${watch.media} {
                    :host {
                        left: ${watch.left}px;
                    }
                }
            `;
        }

        const $style = document.createElement('style');
        $style.setAttribute('data-role', 'watch');
        $style.innerHTML = style;
        this.shadowRoot.appendChild($style);
    }

    /**
     * Osserva il tag "ismobile" per capire se stiamo in ambiente mobile, o se ci passiamo.
     */
    enableMobileDetection()
    {
        const observer = new ResizeObserver(this.onIsMobileChange.bind(this));
        const observee = document.body;
        observer.observe(observee);
        this.onIsMobileChange();
    }

    /**
     * Update value of the mobile flag according to test result.
     */
    onIsMobileChange()
    {
        for(const watch of this.watches)
        {
            if( this.offsetLeft <= watch.left )
            {
                this.watchCode = watch.code;
                break;
            }
        }

        this.dispatchViewportChange();
    }

    /**
     * Test whether window is currently in mobile status or not.
     * 
     * @returns {bool}
     */
    isMobile()
    {
        return this.watchCode == this.MOBILE;
    }

    /**
     * Add a callback to invoke when viewport change is detected.
     * 
     * @param {Function} f Function to call on change detected. Signature:
     *  (
     *      @param {bool} is_mobile Whether viewport is mobile or not.
     *  )
     */
    addViewportChangeListener(f)
    {
        this.listeners.push(f);
    }

    /**
     * Call every listener.
     */
    dispatchViewportChange()
    {
        for(const listener of this.listeners)
            listener.call(listener, this.watchCode);
    }
}

/**
 * This class-tag defines the "stop-points" of viewport-check.
 * Children of ViewportDetector that define the media to be notified about
 * in case of window-size change.
 */
export class ViewportWatch extends HTMLElement
{
    static TAG = 'viewport-watch';

    /**
     * The media query to watch.
     * @type {string}
     */
    media;
    /**
     * The code to give back to the listener.
     * @type {string}
     */
    code;
    /**
     * Assigned left amount: used for further identification.
     * @type {int}
     */
    left;

    constructor(...args)
    {
        super(...args);

        this.media = undefined;
        this.code = undefined;
        this.left = undefined;
    }

    connectedCallback()
    {
        this.media = this.getAttribute('media') ?? 'all';
        this.code = this.getAttribute('code') ?? 'change';
    }
}

customElements.define(ViewportWatch.TAG, ViewportWatch);
customElements.define(ViewportDetector.TAG, ViewportDetector);
