"use strict";

/**
 * This custom-element is the button that takes the user to the
 * top of the page.
 * 
 * Handle "show" class animation on this tag to make appear and 
 * disappear fancy.
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
class ToTop extends HTMLElement
{
    static TAG = 'to-top';

    /**
     * The Y at which the button should appear, in pixels.
     * @type {int}
     */
    showThreshold;
    /**
     * The amount of pixels from top the scroll-to-top should stop.
     * @type {int}
     */
    goalTopOffset;
    /**
     * The HTML class to set when button show be shown. By default is
     * "show".
     * @type {string}
     */
    showClass;
    /**
     * The "behavior" parameter of the "window.scrollTo" function.
     * By default is "smooth".
     */
    scrollBehavior;

    constructor(...args)
    {
        super(...args);
    }

    connectedCallback()
    {
        this.style.display = 'block';
        this.style.overflow = 'hidden';

        this.showThreshold = this.getAttribute('threshold') ?? 150;
        this.goalTopOffset = this.getAttribute('goal') ?? 0;
        this.showClass = this.getAttribute('show-class') ?? 'show';
        this.scrollBehavior = this.getAttribute('behavior') ?? 'smooth';

        this.addEventListener('click', this.onClick);
        window.addEventListener('scroll', this.onPageScroll.bind(this), {passive: true});
    }

    disconnectedCallback()
    {
        this.removeEventListener('click', this.onClick);
        window.removeEventListener('scroll', this.onPageScroll.bind(this), {passive: true});
    }

    /**
     * Method that actually scrolls the view to the top.
     */
    goToTop()
    {
        window.scrollTo({
            top: this.goalTopOffset,
            left: 0,
            behavior: this.scrollBehavior
        });
    }

    /**
     * Check on every scroll step if the tag should appear or not,
     * toggling its "show" class.
     */
    handleAppearance()
    {
        this.classList.toggle(this.showClass, window.scrollY > this.showThreshold);
    }

    /**
     * Event.
     * Fired when tag is clicked.
     */
    onClick(ev)
    {
        this.goToTop();
    }

    /**
     * Event.
     * Fired when page scrolls.
     */
    onPageScroll(ev)
    {
        this.handleAppearance();
    }
}

customElements.define(ToTop.TAG, ToTop);
