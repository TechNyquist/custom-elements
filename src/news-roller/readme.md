# news-roller

NewsRoller is a big panel carousel.
It is a panel with side-labels, each label shows a central big picture with custom
text or overlay custom HTML.

> NOTE: must be imported as module or it won't work because paths might not be
>     resolved correctly.

## Example
````html
    <news-roller id="news1">
        <div slot="label">Titolo 1</div>
        <img slot="screen" src="../../resources/pic1.jpg" alt="Pic 1" />
        
        <div slot="label">Titolo 2</div>
        <img slot="screen" src="../../resources/pic2.jpg" alt="Pic 2" />
        
        <div slot="label">Titolo 3</div>
        <news-roller slot="screen">
            <div slot="label">Inner 1</div>
            <img slot="screen" src="../../resources/pic7.jpg" alt="Pic 7" />

            <div slot="label">Inner 2</div>
            <img slot="screen" src="../../resources/pic3.jpg" alt="Pic 3" />
        </news-roller>
        
        <div slot="label">Titolo 4</div>
        <img slot="screen" src="../../resources/pic4.jpg" alt="Pic 4" />
    </news-roller>
````

As you can see there is a root `<news-roller>` that lists its entries as children.

"Labels" are the clickable fields. "Screens" are the contents of the bigger part.

You can use whatever HTML content you like as both. Just remember that you need to
put `slot="label"` on the **root** label entries and `slot="screen"` on the **root**
screen entries.

Association between labels and screens is ordinal: so the first label opens first
screen, the second label opens the second screen and so on. No matter the order you
write your nested HTML, they'll be sorted and arranged by the custom-element itself.


## Attributes
There are several attributes that could be used to customize the experience with the
element.

### side
It allows you to choose on what side of the element you want to arrange the labels.
Possible values are:
 - left
 - top
 - right
 - bottom

By default they are placed on the left side.

## Methods
List of methods available from this tag instances:

### setCurEntry(int entry_id)
Set current visible entry by its ID.

On connection, every entry-pair is assigned with a progressive entryID. You can
inspect that "entryID" from the single instances.

## Dependencies
These are the external files that are required in order to have the component behave
correctly.

 - <pre>lib/path-utils.js</pre>

## Animations and known limits
As of Q3/2025 Chrome is suffering of a bug for which keyframes declared inside the 
shadowDOM on slotted elements is not available from outside the custom-element.
This means that I cannot provide a default animation that you can override. By default
you'll see a instant on/off.

To provide your animation you can apply one for appearing and one for disappearing.
Disappearing is default, while appearing happens when "screen tags" gain a "show" class.
Example follows:

<pre>
    /* "appear" animation */
    @keyframes Appear
    {
        from {
            filter: opacity(0%);
            transform: scale(0.8);
        }

        to {
            filter: opacity(100%);
            transform: scale(1);
        }
    }

    /* disappear animation */
    @keyframes Disappear
    {
        from {
            filter: opacity(100%);
            transform: scale(1);
        }

        to {
            filter: opacity(0%);
            transform: scale(0.8);
        }
    }

    /* apply not-shown entry style */
    news-roller img
    {
        animation: DefaultDisappear 500ms;
        animation-timing-function: ease-out;
        animation-fill-mode: both;
    }

    /* apply shown entry style */
    news-roller img.show
    {
        animation-name: DefaultAppear;
    }

</pre>

The "transform" is the workaround to override the way the custom-elements hides elements
by default, that is shrinking them to scale 0.
If you provide an animation then you need to handle the "transform" to avoid the disappear
animation to don't be shown.
