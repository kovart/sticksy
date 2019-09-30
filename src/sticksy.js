/**
 * Sticksy.js
 * A library for making cool things like fixed widgets.
 * Dependency-free. ES5 code.
 * -
 * @version 0.1.2
 * @url https://github.com/kovart/sticksy
 * @author Artem Kovalchuk <kovart.dev@gmail.com>
 * @license The MIT License (MIT)
 */

window.Sticksy = (function () {
    "use strict"

    var STATES = {
        Static: 'static',
        Fixed: 'fixed',
        Stuck: 'stuck',
    }

    // All instances of Sticksy
    var instances = []

    /**
     * Constructor function for Sticksy
     * @param {(string|Element)} target Sticky element or query
     * @param {Object=} options Options object
     * @param {boolean=} options.listen Listen for DOM changes in container
     * @param {number=} options.topSpacing Top indent when element has 'fixed' state
     * @constructor
     */
    function Constructor(target, options) {
        if (!target) throw new Error("You have to specify the target element")
        if (typeof target !== 'string' && !(target instanceof Element))
            throw new Error('Expected a string or element, but got: ' + Object.prototype.toString.call(target))
        var targetEl = Utils.findElement(target)
        if (!targetEl) throw new Error("Cannot find target element: " + target)
        var containerEl = targetEl.parentNode
        if (!containerEl) throw new Error("Cannot find container of target element: " + target)

        options = options || {}

        this._props = {
            containerEl: containerEl,
            targetEl: targetEl,
            topSpacing: options.topSpacing || 0,
            listen: options.listen || false, // listen for the DOM changes in container
        }

        /**
         * Called when state of sticky element has changed
         * @type {Function|null} Callback
         */
        this.onStateChanged = null
        /**
         * DOM Element reference of sticky element
         * @type {Element} nodeRef
         */
        this.nodeRef = targetEl

        instances.push(this)
        this._initialize(this._props)
    }

    Constructor.prototype._initialize = function () {
        var that = this

        this.state = STATES.Static

        this._stickyNodes = []
        // Since sticky nodes may have a fixed position,
        // the library injects cloned (dummy) nodes to avoid problems with a DOM flow
        this._dummyNodes = []
        // The main idea of the library is that a sticky element makes lower elements sticky also
        // So we add lower siblings as they are sticky also
        var sibling = this._props.targetEl
        while (sibling) {
            var clone = sibling.cloneNode(true)
            clone.style.visibility = 'hidden'
            clone.className += ' sticksy-dummy-node'
            clone.removeAttribute('id')
            this._props.targetEl.parentNode.insertBefore(clone, this._props.targetEl)

            this._stickyNodes.push(sibling)
            this._dummyNodes.push(clone)
            sibling = sibling.nextElementSibling
        }

        // Used when we calc the state of elements
        this._stickyNodesHeight = 0

        // Positions of the scroll when the elements are fixed (sticky)
        this._limits = {
            top: 0,
            bottom: 0
        }

        // MutationObserver state
        this._isListening = false

        // The library uses 'position: absolute' to stuck sticky nodes to the bottom of the container
        this._props.containerEl.style.position = 'relative'
        // Flexbox doesn't collapse margin of items
        this._shouldCollapseMargins = getComputedStyle(this._props.containerEl).display.indexOf('flex') === -1

        // Listen for DOM changes in the container
        if (this._props.listen) {
            this._mutationObserver = new MutationObserver(function (mutations) {
                that.hardRefresh()
            })

            this._startListen()
        }
        this.hardRefresh()
    }

    Constructor.prototype._startListen = function(){
        if(!this._props.listen || this._isListening) return
        this._mutationObserver.observe(this._props.containerEl, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
        })
        this._isListening = true
    }

    Constructor.prototype._stopListen = function(){
        if(!this._props.listen || !this._isListening) return
        this._mutationObserver.disconnect()
        this._isListening = false
    }

    Constructor.prototype._calcState = function (windowOffset) {
        if (windowOffset < this._limits.top) {
            return STATES.Static
        } else if (windowOffset >= this._limits.bottom) {
            return STATES.Stuck
        }
        return STATES.Fixed
    }

    Constructor.prototype._updateStickyNodesHeight = function () {
        this._stickyNodesHeight = Utils.getComputedBox(this._stickyNodes[this._stickyNodes.length - 1]).bottomWithMargin
            - Utils.getComputedBox(this._stickyNodes[0]).topWithMargin
    }

    Constructor.prototype._updateLimits = function () {
        var containerEl = this._props.containerEl,
            stickyNodes = this._stickyNodes

        var containerBox = Utils.getComputedBox(containerEl),
            topNodeBox = Utils.getComputedBox(stickyNodes[0])

        this._limits = {
            top: topNodeBox.topWithMargin - this._props.topSpacing,
            bottom: containerBox.bottom - containerBox.paddingBottom - this._props.topSpacing - this._stickyNodesHeight
        }
    }

    Constructor.prototype._applyState = function(state){
        // We enable dummy nodes at the end
        // to avoid 'scrolling down effect' in Chrome
        if (state === STATES.Static) {
            this._resetElements(this._stickyNodes)
            this._disableElements(this._dummyNodes)
        } else {
            this._fixElementsSize(this._stickyNodes)
            if (state === STATES.Fixed) {
                this._fixElements(this._stickyNodes)
            } else {
                this._stuckElements(this._stickyNodes)
            }
            this._enableElements(this._dummyNodes)
        }
    }

    /**
     * Recalculate the position
     * @public
     */
    Constructor.prototype.refresh = function () {
        var state = this._calcState(window.pageYOffset, this._limits)
        if (state === this.state) return

        this._stopListen()
        this._applyState(state)
        this.state = state
        this._startListen()

        if (typeof this.onStateChanged === 'function') {
            this.onStateChanged(state)
        }
    }

    /**
     * Reset, recalculate and then update the position
     * @public
     */
    Constructor.prototype.hardRefresh = function () {
        this._stopListen()
        var oldState = this.state
        // reset state for recalculation
        this.state = STATES.Static
        this._applyState(this.state)
        this._fixElementsSize(this._stickyNodes)
        this._updateStickyNodesHeight()
        this._updateLimits()
        this.state = this._calcState(window.pageYOffset, this._limits)
        this._applyState(this.state)
        this._startListen()

        if (typeof this.onStateChanged === 'function' && oldState !== this.state) {
            this.onStateChanged(this.state)
        }
    }

    /**
     * Disable 'sticky' effect
     * @public
     */
    Constructor.prototype.disable = function(){
        this.state = STATES.Static
        this._applyState(this.state)
        instances.splice(instances.indexOf(this), 1)
    }

    /**
     * Enable 'sticky' effect
     * @public
     */
    Constructor.prototype.enable = function(){
        instances.push(this)
        this.hardRefresh()
    }

    /* --------------------------
     *  Operations with elements
     * -------------------------- */

    Constructor.prototype._fixElements = function (elements) {
        var previousMarginBottom = 0 // for margins collapse
        var offset = this._props.topSpacing
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i]
            var box = Utils.getComputedBox(el)
            var extraMarginTop = this._shouldCollapseMargins ?
                Math.max(0, previousMarginBottom - box.marginTop) : previousMarginBottom
            el.style.position = 'fixed'
            el.style.top = offset + extraMarginTop + 'px'
            el.style.bottom = ''
            offset += box.height + box.marginTop + extraMarginTop
            previousMarginBottom = box.marginBottom
        }
    }

    Constructor.prototype._stuckElements = function (elements) {
        var previousMarginTop = 0 // for margins collapse
        // we add offset because the container padding doesn't affect on absolute position
        var offset = Utils.getComputedBox(this._props.containerEl).paddingBottom
        for (var i = elements.length - 1; i >= 0; i--) {
            var el = elements[i]
            var box = Utils.getComputedBox(el)
            var extraMarginBottom = this._shouldCollapseMargins ?
                Math.max(0, previousMarginTop - box.marginBottom) : previousMarginTop
            el.style.position = 'absolute'
            el.style.top = 'auto'
            el.style.bottom = offset + extraMarginBottom + 'px'
            offset += box.height + box.marginBottom + extraMarginBottom
            previousMarginTop = box.marginTop
        }
    }

    Constructor.prototype._resetElements = function (elements) {
        elements.forEach(function (el) {
            el.style.position = ''
            el.style.top = ''
            el.style.bottom = ''
            el.style.height = ''
            el.style.width = ''
        })
    }

    Constructor.prototype._disableElements = function (elements) {
        elements.forEach(function (el) {
            el.style.display = 'none'
        })
    }

    Constructor.prototype._enableElements = function (elements) {
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = getComputedStyle(this._stickyNodes[i]).display
        }
    }

    Constructor.prototype._fixElementsSize = function () {
        for (var i = 0; i < this._stickyNodes.length; i++) {
            var stickyNode = this._stickyNodes[i]
            var style = getComputedStyle(stickyNode)
            stickyNode.style.width = style.width
            stickyNode.style.height = style.height
        }
    }

    /* ------------------------
     *  Static methods
     * ------------------------ */

    Constructor.refreshAll = function () {
        for (var i = 0; i < instances.length; i++) {
            instances[i].refresh()
        }
    }

    Constructor.hardRefreshAll = function () {
        for (var i = 0; i < instances.length; i++) {
            instances[i].hardRefresh()
        }
    }

    Constructor.disableAll = function(){
        var copy = instances.slice()
        for (var i = 0; i < copy.length; i++) {
            instances[i].disable()
        }
    }

    // Should we add enableAll method?

    /**
     * Initialize all sticky elements
     * @param {string|Element|Element[]|jQuery} target - Query string, DOM elements or JQuery object
     * @param {{topSpacing: number=, listen: boolean=}=} options - Constructor options
     * @param {boolean=} ignoreNothingFound - Don't throw an error if there are no elements that satisfying selector.
     * @returns {(Constructor)[]}
     */
    Constructor.initializeAll = function (target, options, ignoreNothingFound) {
        if (typeof target === 'undefined') throw new Error("'target' parameter is undefined")

        var elements = []
        if (target instanceof Element) {
            elements = [target]
        } else if (typeof target.length !== 'undefined' && target.length > 0 && target[0] instanceof Element) {
            // check if JQuery object and fetch native DOM elements
            elements = typeof target.get === 'function' ? target.get() : target
        } else if (typeof target === 'string') {
            elements = document.querySelectorAll(target) || []
        }

        // There may be situations when we have several sticky elements in one parent
        // To resolve this situation we take only the first element
        var parents = []
        var stickyElements = []
        elements.forEach(function (el) {
            if (parents.indexOf(el.parentNode) !== -1) return
            parents.push(el.parentNode)
            stickyElements.push(el)
        })

        if (!ignoreNothingFound && !stickyElements.length) throw new Error('There are no elements to initialize')
        return stickyElements.map(function (el) {
            return new Constructor(el, options)
        })
    }

    /* ------------------------
     *  Refresh events
     * ------------------------ */

    window.addEventListener('scroll', Constructor.refreshAll)
    window.addEventListener('resize', Constructor.hardRefreshAll)

    /* ------------------------
     *  Helpers
     * ------------------------ */

    var Utils = {
        parseNumber: function (val) {
            return parseFloat(val) || 0
        },
        findElement: function (el, root) {
            if (!root) root = document
            return ('string' === typeof el) ? root.querySelector(el) :
                (el instanceof Element) ? el : undefined
        },
        getComputedBox: function (elem) {
            var box = elem.getBoundingClientRect()
            var style = getComputedStyle(elem)

            // Should I add borders width?
            return {
                height: box.height,
                width: box.width,
                top: window.pageYOffset + box.top,
                bottom: window.pageYOffset + box.bottom,
                marginTop: Utils.parseNumber(style.marginTop),
                marginBottom: Utils.parseNumber(style.marginBottom),
                paddingTop: Utils.parseNumber(style.paddingTop),
                paddingBottom: Utils.parseNumber(style.paddingBottom),
                topWithMargin: window.pageYOffset + box.top - Utils.parseNumber(style.marginTop),
                bottomWithMargin: window.pageYOffset + box.bottom + Utils.parseNumber(style.marginBottom),
            }
        },
    }

    return Constructor
}());

// Jquery Injection
var jQueryPlugin = window.$ || window.jQuery || window.Zepto
if (jQueryPlugin) {
    jQueryPlugin.fn.sticksy = function sticksyPlugin(opts) {
        return Sticksy.initializeAll(this, opts)
    }
}
