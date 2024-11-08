/**
 * Simply a CANVAS element that emulates wavey sound lines.
 * 
 * USAGE:
 *  <wobbling-line>
 *      <wobbling-segment p="0.3" l="0.2" a="0.3" f="2" d="0.0"></wobbling-segment>
 *  </wobbling-line>
 * 
 * ATTRIBUTES:
 *  tick = milliseconds for every update. Lower tick means higher FPS.
 *  onPhase = name of the (global) function to call on every phase of any segment.
 * 
 * @author Niki Romagnoli <niki.r@technyquist.com>
 */
class WobblingLine extends HTMLElement
{
    self = WobblingLine;

    /**
     * Attribute name to set per-tick ms amount.
     * @type {string}
     */
    static ATTR_TICK    = 'tick';

    /**
     * Event names.
     */
    static ON_PHASE = 'onphase';

    /**
     * The common name of the tag.
     * @type {string}
     */
    static TAG = "wobbling-line";

    /**
     * The CANVAS tag we are operating on.
     * @type {HTMLCanvasElement}
     */
    $canvas;
    /**
     * The 2D rendering context access point.
     * @type {CanvasRenderingContext2D}
     */
    context;
    /**
     * Temporizing timer handler.
     * @type {int}
     */
    timerHandler;
    /**
     * Previous tick time.
     * @type {int}
     */
    prevTick;
    /**
     * Array of segments.
     * @type {WobblingSegment[]}
     */
    segments;
    /**
     * Array of events listeners.
     * @type {Function[][]}
     */
    listeners;
    /**
     * Amount of milliseconds elapsed between each tick.
     * Lower tick means higher framerate.
     * @type {int}
     */
    tickSize;

    constructor(...args)
    {
        super(...args);

        this.prevTick = 0;
        this.timerHandler = undefined;
        this.$canvas = undefined;
        this.context = undefined;
        this.segments = [];
        this.tickSize = 30;

        this.listeners = {};
        this.listeners[this.self.ON_PHASE] = [];

        const tpl = `
    <canvas></canvas>
    <slot></slot>
`;

        this.style.display = 'block';

        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = tpl;
        this.$canvas = this.shadowRoot.querySelector('canvas');
        this.context = this.$canvas.getContext('2d');

        this.$canvas.style.width = '100%';
        this.$canvas.style.height = '100%';
    }

    /**
     * On DOM connection event.
     */
    connectedCallback()
    {
        this.detectSegments();
        this.tickSize = parseInt(this.getAttribute(this.self.ATTR_TICK) ?? this.tickSize);
        this.prevTick = 0;
        this.timerHandler = setInterval(this.ontick, this.tickSize, this);
        console.debug("wobbling tick", this.tickSize);

        const funcname = this.getAttribute(this.self.ON_PHASE);
        if( funcname )
        {
            const func = window[funcname];
            this.addEventListener(this.self.ON_PHASE, func);
        }
    }

    /**
     * On DOM disconnection event.
     */
    disconnectedCallback()
    {
        clearInterval(this.timerHandler);
        this.timerHandler = undefined;
        this.listeners = {};
    }

    /**
     * Add event listener.
     * 
     * @param {string} event_name Name of the event. Use a const ON_* of the class.
     * @param {Function} func The function callback to call with the event.
     */
    addEventListener(event_name, func)
    {
        this.listeners[event_name].push(func);
    }

    /**
     * On timer tick event.
     * 
     * @param {int} prevTick The previous tick amount.
     * @param {int} curTick The current tick amount.
     */
    tick(prevTick, curTick)
    {
        this.context.clearRect(0, 0, this.$canvas.width, this.$canvas.height);

        for(const segment of this.segments)
            segment.draw(prevTick, curTick);
    }

    /**
     * Handles the timer event and calls "tick" providing useful parsed parameters.
     * Don't use this method. Work on "tick" instead.
     * 
     * @param {this} self Relayed reference to this instance.
     */
    ontick(self)
    {
        const curTick = self.prevTick + self.tickSize;
        self.tick(self.prevTick, curTick);
        self.prevTick = curTick;
    }

    /**
     * Remote and recreate internal array of segments.
     */
    detectSegments()
    {
        this.segments = Array.from(this.querySelectorAll(WobblingSegment.TAG));
        this.segments.forEach((segment) => {
            segment.setHost(this);
        });
    }
}

/**
 * This class abstracts the segment of the line that draws a curve.
 * Many of this will render a wavey line.
 */
class WobblingSegment extends HTMLElement
{
    static TAG = 'wobbling-segment';

    /**
     * Unique ID generator.
     * @type {int}
     */
    static masterID = 1;

    /**
     * Segment-ID of this instance inside the element.
     * @type {int}
     */
    sid;
    /**
     * The float factor 0.0 - 1.0 that pivots the segment along the line.
     * @type {float}
     */
    p;
    /**
     * The length of the segment, expressed as a factor, a float number
     * between 0.0 and 1.0, where 0.0 is no-length and 1.0 is full-length.
     * @type {float}
     */
    l;
    /**
     * The max amplitude of the oscillation. It if a float number factor
     * from 0.0 to 1.0, where 0.0 is no oscillation and 1.0 is touching
     * the bounds of the WobblingLine container (that is, all the space
     * available).
     * @type {float}
     */
    a;
    /**
     * The frequency is the amount of complete oscillations to performe 
     * in a second. Must be positive and greater than 0.
     * @type {float}
     */
    f;
    /**
     * The virtual delay to apply in milliseconds to the real time.
     * @type {int}
     */
    d;
    /**
     * Reference to the owner WobblingLine instance.
     * @type {WobblingLine}
     */
    host = undefined;
    /**
     * Canvas 2D rendering context.
     * @type {CanvasRenderingContext2D}
     */
    context;
    /**
     * Reference to live-updated computed style of host tag.
     * @type {CSSStyleDeclaration}
     */
    hostStyle;

    constructor(...args)
    {
        super(...args);

        this.sid = WobblingSegment.masterID++;

        this.p = parseFloat(this.getAttribute('p') || 0.5);
        this.l = parseFloat(this.getAttribute('l') || 0.5);
        this.a = parseFloat(this.getAttribute('a') || 0.5);
        this.f = parseFloat(this.getAttribute('f') || 1.0);
        this.d = parseFloat(this.getAttribute('d') || 0.0);
        
        this.host = undefined;
        this.context = undefined;
        this.hostStyle = undefined;
    }

    /**
     * Set the owner WobblingLine instance.
     * 
     * @param {WobblingLine} host
     */
    setHost(host)
    {
        this.host = host;
        this.context = this.host.$canvas.getContext('2d');
        this.hostStyle = window.getComputedStyle(this.host);
    }

    /**
     * Update the path according to the elapsed time.
     * 
     * @param {int} prevTick Previous tick amount.
     * @param {int} curTick Current tick amount.
     */
    draw(prevTick, curTick)
    {
        // let's find out the amplitude-factor (between 0.0 and 1.0)
        const T_ms = (1 / this.f) * 1000;
        const time = curTick - this.d;
        const angle = ((time % T_ms) * 360) / T_ms;
        const amplitude_factor = this.a * Math.sin(this.deg2rad(angle));

        // let's convert the factor in percent proportional factor
        const amplitude = 100 - ((amplitude_factor * 100) + 50);
        const y = 50;
        const peak = 100 * this.p;
        const half = (100 * this.l) / 2;

        // converting to absolute
        const abs_amplitude = (amplitude / 100) * this.host.$canvas.height;
        const abs_y = (y / 100) * this.host.$canvas.height;
        const abs_peak = (peak / 100) * this.host.$canvas.width;
        const abs_half = (half / 100) * this.host.$canvas.width;

        this.context.beginPath();
        this.context.strokeStyle = window.getComputedStyle(this).stroke;
        this.context.moveTo(abs_peak - abs_half, abs_y);
        this.context.quadraticCurveTo(abs_peak, abs_amplitude, abs_peak + abs_half, abs_y);
        this.context.stroke();

        // dispatch phase event
        const prev_time = prevTick - this.d;
        const prev_angle = ((prev_time % T_ms) * 360) / T_ms;
        for(const listener of this.host.listeners[this.host.self.ON_PHASE])
            listener.call(listener, this, prev_angle, angle);

    }

    /**
     * Convert angle expression from degrees to radians.
     * 
     * @param {float} angle Angle in degrees.
     * @returns {float} Same angle expressed in radians.
     */
    deg2rad(angle)
    {
        return (angle * Math.PI) / 180.0;
    }
}

// define the custom-element tag
customElements.define(WobblingSegment.TAG, WobblingSegment);
customElements.define(WobblingLine.TAG, WobblingLine);
