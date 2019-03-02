<h1 align="left">Sticksy.js 📌</h1>

<p align="left">
  <a href="https://www.npmjs.com/package/sticksy">
    <img alt="npm version" src="https://badge.fury.io/js/sticksy.svg" />
  </a>
  <a href="https://unpkg.com/sticksy@latest/dist/sticksy.min.js">
    <img alt="unpkg" src="https://img.shields.io/badge/unpkg-link-blue.svg">
  </a>
</p>

Sticksy is a library for making cool things like fixed widgets.
It makes an element and its lower siblings sticky.

> Sticksy **is not** a `position: sticky` polyfill. Sticksy **_affects_** on the sibling elements.

<br/>
<p align="center">
  <img alt="Fixed widgets in sidebar" src="../assets/demo.gif?raw=true"></img>
</p>

## When do you need Sticksy? 
> **The basic use-case of the library is to make fixed widgets in sidebar.**

The library is especially useful for ads or other items that visitors want to interact with.
Sticky blocks are perceived much better by your visitors than unfixed widgets and therefore they have a significantly higher click-through rate. 

But also you can use it for some design features.

## Why Sticksy is awesome?
   * Setup in one line
   * Super performance
   * Ready for DOM changes
   * Zero dependencies
   * Small size ~1.6Kb (minified gzip)
   
## Examples
  - [Basic usage](https://codepen.io/kovart/pen/VReGjN)
  - [Usage with JQuery or Zepto](https://codepen.io/kovart/pen/OqMrvR)
  - [Same selector for multiple items](https://codepen.io/kovart/pen/eXJxQY)
 
## Installation
You can install Sticksy from NPM, Yarn or just simply download it from this page.

Import an entire module if you use Webpack, Rollup or other module bundlers:  
```js
import 'sticksy';
```

### NPM
```sh 
$ npm install sticksy --save
```
### Yarn
```sh
$ yarn install sticksy
```

### Github
<a href="https://github.com/kovart/sticksy/releases">Download the latest release</a> and add `<script src="your-path/sticksy.min.js"></script>` to your page.
  
## Usage
HTML structure should look like this:
```html
<!-- Container -->
<aside class="sidebar"> 
    <div class="widget"></div>
    <!-- Sticky element -->
    <div class="widget is-sticky"></div> 
</aside>
```
*The container shouldn't be absolute positioned, because we use absolute position to stuck elements to the bottom.*

Then you should initialize an instance with a **new** keyword:
```js
var stickyElement = new Sticksy('.widget.is-sticky');
```
That's all. 😎

------

#### Via JQuery/Zepto:
```js
var stickyElement = $('.widget.is-sticky').sticksy();
```

------

### Same selector for multiple items 
```js
var stickyElements = Sticksy.initializeAll('.is-sticky')
```

------

More examples in [`example folder`](https://github.com/kovart/sticksy/examples) and [`this section`](https://github.com/kovart/sticksy#examples).

## API
The API is simple.

#### Constructor options
```js
var stickyEl = new Sticksy(selector /* or element */, {
    topSpacing: 60, // Specify this when you have a fixed top panel | default: 0
    listen: true, // Listen for the DOM changes in the container | default: false
});
```
#### Public methods
```js
// Used when you need to update the state of elements
stickyEl.refresh();
// Used when you need to recalculate all
stickyEl.hardRefresh();
```
#### Events
```js
stickyEl.onStateChanged = function(state){
  // your handler here
}
```
---
#### Static methods
```js
// Calls refresh() method for all instances 
Sticksy.refreshAll();
// Calls hardRefresh() method for all instances
Sticksy.hardRefreshAll();
```

#### Helper methods
```js
Sticksy.initializeAll(selector, options, ignoreNothingFound);
```

## Performance
Performance is ultra high. ⚡

The library uses the simplest function to calculate the elements state:
```js
Constructor.prototype._calcState = function (windowOffset) {
    if (windowOffset < this._limits.top) {
        return STATES.Static
    } else if (windowOffset >= this._limits.bottom) {
        return STATES.Stuck
    }
    return STATES.Fixed
}
```
The function doesn't have any сomplicated calculations, just compares two variables.\
And if the calculated state is the same as previous the library does nothing.

Cool, right? 🙂
  
## Browser Compability
Sticksy works in all modern browsers including Internet Explorer 11.\
If you need to support IE10 or below you should install [`Mutation Observer Polyfill`](https://github.com/megawac/MutationObserver.js).

Please, open an issue if you have any browser compatibility problems.

## License (MIT)
```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```
Sticksy.js is released under the MIT license.\
Copyright (c) 2019-present Artem Kovalchuk