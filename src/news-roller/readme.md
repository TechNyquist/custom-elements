# news-roller

NewsRoller is a big panel carousel.
It is a panel with side-labels, each label shows a central big picture with custom
text or overlay custom HTML.

> NOTE: must be imported as module or it won't work because paths might not be
>     resolved correctly.

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
