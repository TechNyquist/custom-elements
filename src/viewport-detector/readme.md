# Viewport Detector
This CE ease detection of viewport change when styling responsive websites.
When viewport changes, a JS callback is fired in order to take appropriate actions and 
react to current viewport size.

### Example
Define your own set of watches, according to your needs.
```HTML
    <viewport-detector>
		<viewport-watch code="custom"	media="only screen and (min-width : 320px)"></viewport-watch>
		<viewport-watch code="mobile"	media="only screen and (min-width : 480px)"></viewport-watch>
		<viewport-watch code="tablet"	media="only screen and (min-width : 768px)"></viewport-watch>
		<viewport-watch code="desktop"	media="only screen and (min-width : 992px)"></viewport-watch>
		<viewport-watch code="wide"		media="only screen and (min-width : 1200px)"></viewport-watch>
	</viewport-detector>
```
Then subscribe "onload" to the tag and you are done. Execute your own logics in the callback.
```JS
    /** @type {ViewportDetector} $viewport */
    const $viewport = document.querySelector(ViewportDetector.TAG);
    $viewport.addViewportChangeListener(function(watch_code){
        // "watch_code" is the code currently active, those defined in the watch
        console.log(watch_code);
    });
```

Instead this example shows how to declare the code for every link tag in autodetection:
```HTML
    <html>
        <head>
            <link class="viewport" media="only screen and (min-width : 320px)" href="mobile.css" data-code="mobile" />
            <link class="viewport" media="only screen and (min-width : 480px)" href="tablet.css" data-code="tablet" />
            <link class="viewport" media="only screen and (min-width : 768px)" href="desktop.css" data-code="desktop" />
        </head>
        <body>
            <viewport-detector autodetect=".viewport"></viewport-detector>
        </body>
    </html>
```
And here an example of autodetection that selects all the "link" tags with media query and use their "href" filename as code, this is the most minimal setup you will see of this:
```HTML
    <html>
        <head>
            <link media="only screen and (min-width : 320px)" href="mobile.css" />
            <link media="only screen and (min-width : 480px)" href="tablet.css" />
            <link media="only screen and (min-width : 768px)" href="desktop.css" />
        </head>
        <body>
            <viewport-detector autodetect></viewport-detector>
        </body>
    </html>
```

### Media-queries autodetection
Often the watched viewports match the list of available style versions, pointed by the "link" tags
in the head. That is, you probably will have a style for various viewport sizes, and every viewport has
its own media query for activation.

The viewport-detector allows you to autodetect those tags and extract their media query, in order to avoid on repeating on each part whenever you decide to change a media query.

To autodetect the "link" tags (that is the default behaviour) you change set the **autodetect** attribute on the _viewport-detector_ and set as its value the **selector** to use for detecting the link tags. There can be many different link tags, but you might want to detect only few of them. Give them a unique identifier (maybe a class) and use it as selector.
If you omit the value and set the **autodetect** as a property of the tag, all the "link" tags will be selected.

Then set a **data-code** attribute on every selected link with the code to notify on that viewport change. The result is something like the following. If you omit the "data-code" in "link" tags, it will automatically use the name of the imported css file (stripping path from the "href" attribute") without the extension.
If no "data-code" was specified and no "href" is available, then a progressive index (from 1) is used.
