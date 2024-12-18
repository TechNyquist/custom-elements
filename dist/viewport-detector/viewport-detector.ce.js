'use strict';export default class ViewportDetector extends HTMLElement{self=ViewportDetector;static TAG='viewport-detector';watchCode;listeners;watches;constructor(...args){super(...args);this.watchCode=undefined;this.listeners=[];this.watches=[];const tpl=`<style data-role="main">:host{display:block;position:absolute;left:0px;top:0px}</style><slot></slot>`;this.attachShadow({mode:"open"});this.shadowRoot.innerHTML=tpl}connectedCallback(){this.detectWatchMedias();this.enableMobileDetection()}disconnectedCallback(){const styles=this.querySelectorAll('style[data-role="watch"]');for(const style of styles)this.shadowRoot.removeChild(style)}detectWatchMedias(){this.watches=this.querySelectorAll(ViewportWatch.TAG);let style='';let index=1;for(const watch of this.watches){watch.left=index++;style+=`
                @media ${watch.media}{:host{left:${watch.left}px}}`}const $style=document.createElement('style');$style.setAttribute('data-role','watch');$style.innerHTML=style;this.shadowRoot.appendChild($style)}enableMobileDetection(){const observer=new ResizeObserver(this.onIsMobileChange.bind(this));const observee=document.body;observer.observe(observee);this.onIsMobileChange()}onIsMobileChange(){for(const watch of this.watches){if(this.offsetLeft==watch.left){this.watchCode=watch.code;break}}this.dispatchViewportChange()}isMobile(){return this.watchCode==this.MOBILE}addViewportChangeListener(f){this.listeners.push(f)}dispatchViewportChange(){for(const listener of this.listeners)listener.call(listener,this.watchCode)}}export class ViewportWatch extends HTMLElement{static TAG='viewport-watch';media;code;left;constructor(...args){super(...args);this.media=undefined;this.code=undefined;this.left=undefined}connectedCallback(){this.media=this.getAttribute('media')??'all';this.code=this.getAttribute('code')??'change'}}customElements.define(ViewportWatch.TAG,ViewportWatch);customElements.define(ViewportDetector.TAG,ViewportDetector);