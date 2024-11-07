import ViewportDetector from "./viewport-detector.ce.js";

window.addEventListener('load', function()
{
    /** @type {ViewportDetector} $viewport */
    const $viewport = document.querySelector(ViewportDetector.TAG);
    const $output = document.getElementById('output');
    $viewport.addViewportChangeListener(function(watch_code){
        $output.innerHTML = watch_code;
    });
});
