"use strict";

import SearchGroup, { SearchGroupBeginSearchEvent, SearchGroupSearchEvent } from "./ce-search-group.js";

/** @type {SearchGroup} local_sg */
const local_sg = document.querySelector('search-group#local');
local_sg.addEventListener('search', onLocalSearch);
/** @type {SearchGroup} remote_sg */
const remote_sg = document.querySelector('search-group#remote');
remote_sg.addEventListener('search', onRemoteSearch);
remote_sg.addEventListener('beginsearch', onBeginRemoteSearch);
remote_sg.additionalArgs.ciao = 'mamma';
remote_sg.additionalHeaders['X-Provaci'] = 'sine oh!';

let loaderSearch = 0;

const $localOutput = document.querySelector('#local-output');
const $remoteOutput = document.querySelector('#remote-output');
const $list = document.querySelector('#list');

function onLocalSearch(ev)
{
    let $output = $localOutput;
    $output.innerHTML = '';
    // local search
    let $matches = [];
    for(const $entry of $list.children)
    {
        let getIt = true;

        for(const crit of ev.criterias)
        {
            // empty criteria means select it anyway
            if( crit.value.length == 0 )
                break;

            const fieldText = $entry.querySelector('.'+crit.name).textContent;
            if( !fieldText.toLowerCase().includes(crit.value.toLowerCase()) )
            {
                getIt = false;
                break;
            }
        }

        if( getIt )
            $matches.push($entry);
    }

    if( $matches.length )
    {
        for(const $match of $matches)
        {
            const $result = $match.cloneNode(true);
            $output.appendChild($result);
        }
    }
    else
        $output.innerHTML = '<h3>- No results -</h3>'; 
}

/**
 * @param {SearchGroupSearchEvent} ev Remote search result event.
 */
function onRemoteSearch(ev)
{
    // this count check is redundant, you don't need this because it's handled
    // by the custom-element automatically; it is here just for reference
    if(ev.count == loaderSearch )
    {
        // hide loader (you could safely call this everytime as the CE will
        // filter calls to this function on your behalf)
        $remoteOutput.classList.remove('loading');
    }

    let $output = $remoteOutput;
    $output.innerHTML = '';
    if( ev.results.length )
    {
        // write results
        for(const result of ev.results)
        {
            const $result = document.createElement('div');
            for(const field in result)
            {
                const $field = document.createElement('div');
                $field.classList.add(field);
                $field.textContent = result[field];
                $result.appendChild($field);
            }
            $output.appendChild($result);
        }
    }
    else
    {
        // no results
        $output.innerHTML = '<h3>- No results -</h3>';
    }
}

/**
 * @param {SearchGroupBeginSearchEvent} ev
 */
function onBeginRemoteSearch(ev)
{
    // you don't need to remember/use this count for this
    loaderSearch = ev.count;
    // show loader
    $remoteOutput.classList.add('loading');
}
