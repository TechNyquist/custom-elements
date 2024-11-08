This CE ease detection of viewport change when styling responsive websites.
When viewport changes, a JS callback is fired in order to take appropriate actions.

USAGE:
    <viewport-detector>
		<viewport-watch code="custom"	media="only screen and (min-width : 320px)"></viewport-watch>
		<viewport-watch code="mobile"	media="only screen and (min-width : 480px)"></viewport-watch>
		<viewport-watch code="tablet"	media="only screen and (min-width : 768px)"></viewport-watch>
		<viewport-watch code="desktop"	media="only screen and (min-width : 992px)"></viewport-watch>
		<viewport-watch code="wide"		media="only screen and (min-width : 1200px)"></viewport-watch>
	</viewport-detector>

Define your own set of watches, according to your needs.
Then subscribe "onload" to the tag and you are done:

    /** @type {ViewportDetector} $viewport */
    const $viewport = document.querySelector(ViewportDetector.TAG);
    $viewport.addViewportChangeListener(function(watch_code){
        // "watch_code" is the code currently active, those defined in the watch
        console.log(watch_code);
    });
