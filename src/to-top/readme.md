# To Top
This CE manages the appearence and operativity of a to-top button that
allows the user to come back to the top of the page.

### Customize animation
No animation and not appear/disappear is handled right away, just because when it's
time for the button to appear it sets a "show" class and removes it when it should
hide.

So you just need to set to desired "width" and "height" when shown, for example:
```HTML
<to-top>
    Back to top!
</to-top>
```

```CSS
to-top.show
{
    width: 150px;
    height: 150px;
    transitions: width 500ms, height 500ms;
}
```

### Available attributes
These options are available as attributes to customize element's behavior:

<table>
    <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>threshold</code></td>
        <td>int (px)</td>
        <td>The amount of pixels from the top that the button should appear.</td>
    </tr>
    <tr>
        <td><code>goal</code></td>
        <td>int (px)</td>
        <td>The amount of offset-pixels from top the scroll-to-top should stop.</td>
    </tr>
    <tr>
        <td><code>show-class</code></td>
        <td>string</td>
        <td>By default is "show" (when omitted). This is the HTML-class to set on the tag
            to show it.</td>
    </tr>
    <tr>
        <td><code>behavior</code></td>
        <td>string</td>
        <td>By default is "smooth" (when omitted). This is the "behavior" parameter to pass
            to the `window.scrollTo` function.</td>
    </tr>
</table>
