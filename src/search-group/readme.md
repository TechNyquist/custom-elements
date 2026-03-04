# Search Group
This CE listens to one or more inputs and triggers searches using
their values. It can also trigger remote searches with ease.

# Usage
Place the tag and as children add one target tag for every input
to watch.

```HTML
<search-group on-search="window.searchFunction" remote="/funcs/search.php">
    <search-group-target selector=".name-input" />
    <search-group-target selector=".age-input" />
</search-group>
```

`<search-group>` is the tag container tag and every occurence defines
a new group of fields to watch.

`<search-group-target>` defines every field to watch in a group. There might
be more of this in every group.

Then the called search function will receive a instance of `GroupSearchEvent`
that features a public property called `criterias` with informations about requested
search criterias (details).

Empty inputs are excluded. That is if you make a search-group of 3 inputs
and all of them are non-empty you will receive 3 entries. If one of them is empty
you will receive 2, and so on.


# Attributes
Following attributes customize how the tag behaves:

## For `<search-group>`
- **remote** use this to provide the URL to call with criterias.
- **rtype** determines the type of encapsulation to use for sending the parameters to the server. It could be set to one of the followings:
  - *form*  - "application/x-www-form-urlencoded" (default)
  - *json*  - "application/json"
- **delay** the amount of milliseconds to wait before calling the remote search. By default
it amounts to 150ms. Local search is always instantaneous, triggered on every input event.

You must listen to its `search` event in order to call your function to perform the actual search. You will receive an instance of `SearchGroupEvent` as argument. More details below.

## For `<search-group-target>`
- **selector** query selector used to fetch the input to watch.

There is no "name" attribute because the name will be detected from the name of
the input field every target watches to.


# Handling remote search
To make remote search you must set the `remote` attribute on `<search-group>` tag, specifying
as argument the URL to call.

When search inputs are changed an AJAX POST call will be sent to the given URL. Parameters are
sent according to `rtype` attribute. By default they are sent as `application/x-www-form-urlencoded`,
and in server-side applications will receive POST parameters with input name as name and its value
as value. For example in a PHP application you could do something like `$crit=$_POST['fruit'];` if
"fruit" was the name of a input field.

Then the function listening to the `search` event will receive the JSON response from the server. The response could be retrieved from the provided `SearchGroupEvent` instance.

> [!IMPORTANT]
> Server responding to this element must always respond in JSON format.

## Additional headers or parameters

It is possible to add parameters or headers to the reqest sent to server. Two public
properties can be used for this:
- **additionalArgs**: it's an object. Add named properties and their value to be sent along
with the request as payload. Example:
```JS
tag.additionalArgs['sessionID'] = 1000;
```
- **additionalHeaders**: it's an object. Add named properties and their value, where the name is the name of the header (the part till del colon) and the value is the content of
the header (the part following the colon). Example:
```JS
tag.additionalHeaders['X-sessionID'] = '1000';
```
> [!IMPORTANT]
> It is important to note the "Content-Type" header cannot be overridden as it is set 
> according to the value of the **rtype** attribute, also used to format payload accordingly.


# Events
List of events that you can subscribe to with _addEventListener()_ on the main tag:
- "**search**" in case of local-search this is fired when something is typed in any of the
watched input fields, with populated "criterias". In case of remote-search this is fired when
server replies the result of the search, and only property "results" is populated.
- "**beginsearch**" whenever a new search starts. Might be useful for showing loaders. The
"count" property would tell you the namber of the search that is starting, but don't use it
to detect the last "search" event to hide the loader because the custom-element will handle
this on your behalf automatically, then your "search" callback will be called with latest
server resultset automatically.

## The SearchGroupEvent instance
It is the instance provided as argument to callbacks registered to the `search` event of the tag.

It exposes two public properties: **criterias** and **response**.

The **criterias** struct is populated for **local searches** and provides the value of each valid search input. With that you can perform your local search in your JS function. Example:

```JS
[
  {
    "name": "<name-of-the-input>",
    "value": "<value-of-the-input>",
    "tag": <reference-to-input-tag>
  },
  .
  .
  .
]
```

The **results** struct is populated for **remote searches** and provides the parsed JSON response
from the server. That could be any kind of struct, but for example sake you could receive something
like this:

```JS
[
  {
    "fruit":"banana",
    "age":"22",
    "city":"Firenze"
  },
  {
    "fruit":"banana",
    "age":"31",
    "city":"Roma"
  },
]
```

# The remote input delay

In order to reduce the load server-side, the remote search is not triggered on every input
on the search field. The ajax call starts when there is no input for _delay_ milliseconds.
Every input resets this delay.

You can control the amount of delay changing the `delay` attribute of `<search-group>` tag.
Set 0 to make immediate on each input (this may cause much load server-side).

