/**
 * A simple function that detects path offset in module custom-elements
 * in order to import outside stuff using a relative path approach.
 * NOTE: this will work only for custom-elements imported as modules.
 * 
 * USAGE:
 *  // inside custom-element
 *  const root = detectRootOffset(this);
 * 
 * @param {string} base It's the URI of node.baseURI.
 * @param {string} module It's the URL of import.meta.url.
 * @returns {string} The path to prepend for relative extern referencing.
 */
export function detectPathOffset(base, module)
{
    const baseURL = new URL(base);
    const moduleURL = new URL(module);

    // if any of host, protocol and port are different we are talking about
    // completely different URLs, so the diff is module URL itself
    if(
        (baseURL.protocol != moduleURL.protocol) ||
        (baseURL.hostname != moduleURL.hostname) ||
        (baseURL.port != moduleURL.port)
    )
    {
        // this further code cuts the filename and avoids misinterpreting
        // slashes after the question-mark as URL's path separators
        const qmi = module.indexOf('?');
        return module.substring(0, module.lastIndexOf("/", qmi == -1 ? +Infinity : qmi)) + "/";
    }

    // examples:
    // mod = custom-elements/src/news-roller/js/custom/news-roller.js
    // bas = custom-elements/src/news-roller/inner/index.html

    // now let's calculate the diff between the paths
    const basePath = baseURL.pathname.substring(0, baseURL.pathname.lastIndexOf("/")).split('/');
    const modulePath = moduleURL.pathname.substring(0, moduleURL.pathname.lastIndexOf("/")).split('/');
    const n = Math.max(basePath.length, modulePath.length);
    let diff = [];
    for(let i=0; i<n; ++i)
    {
        if( i < basePath.length )
        {
            if( i < modulePath.length )
            {
                if(
                    (diff.length > 0) ||        // if something already found, take it
                    (basePath[i] != modulePath[i])
                )
                {
                    // here base and module URLs fork
                    diff.unshift('..');
                    diff.push(modulePath[i]);
                }
            }
            else
            {
                // module path exausted and base path continues, insert backstep
                diff.unshift('..');
            }
        }
        else
        {
            // base exausthed while module still has to give, append it
            diff.push(modulePath[i]);
        }
    }

    diff.unshift('.');
    return diff.join('/') + '/';
}
