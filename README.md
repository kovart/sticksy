<h1 align="left">Sticksy.js 📌</h1>  

[![npm](https://badge.fury.io/js/sticksy.svg)](https://www.npmjs.com/package/sticksy)
[![gzip size](https://badgen.net/badgesize/gzip/https://unpkg.com/sticksy@latest/dist/sticksy.min.js)](https://cdn.jsdelivr.net/npm/sticksy/dist/sticksy.min.js)
[![install size](https://packagephobia.now.sh/badge?p=sticksy)](https://packagephobia.now.sh/result?p=sticksy)
[![issues](https://badgen.net/github/open-issues/kovart/sticksy)](https://github.com/kovart/sticksy/issues)
[![snyk](https://snyk.io/test/npm/sticksy/badge.svg)](https://snyk.io/test/npm/sticksy)
[![license](https://badgen.net/npm/license/lodash)](https://opensource.org/licenses/MIT)

Sticksy is a zero-dependency library for making cool things like fixed widgets.
It makes an element and its lower siblings sticky.

> Sticksy **is not** a `position: sticky` polyfill. Sticksy **_affects_** on the sibling elements.

<br/>
<p align="center">
  <img alt="Fixed widgets in sidebar" src="https://github.com/kovart/sticksy/raw/assets/demo.gif?raw=true"></img>
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
$ yarn add sticksy
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

#### Same selector for multiple items 
```js
var stickyElements = Sticksy.initializeAll('.is-sticky')
```

------

More examples in [`example folder`](https://github.com/kovart/sticksy/tree/master/examples) and [`this section`](#examples).

## API
The API is as simple as possible.

### Constructor options
```js
var instance = new Sticksy(target[, options]);
```
Example:
```js
var stickyEl = new Sticksy('.block.is-sticky', {
    topSpacing: 60, // Specify this when you have a fixed top panel
    listen: true, // Listen for the DOM changes in the container
});
```

#### target: string | Element
Specify a target sticky element. This option can take a string query or the element itself. <br> 
`Required`

#### options: ContructorOptions
Sticksy comes with options to configure how it works. All options below are optional. \
`Optional`

##### topSpacing: number
Additional top spacing of the element when it becomes fixed (sticky). Use this option when you have a fixed top panel. \
`Optional` `Default: 0`

##### listen: boolean
This option determines should we recalculate all cached dimensions of the viewport, container and sticky elements on any DOM **changes in the container element**. 

`Optional` `Default: false` 

> Unfortunately, we cannot react to changes in the style attribute in sticky elements. The library uses the style attribute to make elements sticky and if we react all the time the attribute changes it will cause a performance leak.


### Public methods
#### refresh(): void
Force recalculation of elements state and update position of sticky elements according to the new state.
```js
stickyEl.refresh();
```
#### hardRefresh(): void
The same as `refresh()`, but force recalculation of **all cached dimensions** of the viewport, container and sticky elements.
```js
stickyEl.hardRefresh();
```

### Events

#### onStateChanged
Called when the state of sticky elements has changed. There are three states of sticky elements: static, fixed and stuck. 
```js
stickyEl.onStateChanged = function(state){
  // your handler here
}
```
---
### Static methods

#### refreshAll(): void
Calls `refresh()` method for all instances.
```js
Sticksy.refreshAll();
```
#### hardRefreshAll(): void
Calls `hardRefresh()` method for all instances.
```js
Sticksy.hardRefreshAll();
```

### Helper methods
#### initializeAll(target[, options][, ignoreNothingFound])
Find and initialize all instances with the same options.

Example:
```js
var stickyEl = Sticksy.initializeAll('.is-sticky', { listen: true }, true)
```

##### target: string | Element | Element[] | jQuery
Specify target sticky elements. \
`Required`

##### options: ContructorOptions
Options for the target elements. See [`Contructor options`](#constructor-options). \
`Optional`

##### ignoreNothingFound: boolean
Should the method throw an error if no elements found. \
`Optional` `Default: false`

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
