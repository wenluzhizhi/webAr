/* Zepto v1.2.0 - zepto event ajax form ie - zeptojs.com/license */
(function(global, factory) {
  if (typeof define === 'function' && define.amd)
    define(function() { return factory(global) })
  else
    factory(global)
}(this, function(window) {
  var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.matches || element.webkitMatchesSelector ||
                          element.mozMatchesSelector || element.oMatchesSelector ||
                          element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }

  function likeArray(obj) {
    var length = !!obj && 'length' in obj && obj.length,
      type = $.type(obj)

    return 'function' != type && !isWindow(obj) && (
      'array' == type || length === 0 ||
        (typeof length == 'number' && length > 0 && (length - 1) in obj)
    )
  }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overridden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overridden in plugins.
  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overridden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overridden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overridden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
      slice.call(
        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.isNumeric = function(val) {
    var num = Number(val), type = typeof val
    return val != null && type != 'boolean' &&
      (type != 'string' || val.length) &&
      !isNaN(num) && isFinite(num) || false
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }
  $.noop = function() {}

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function(){
      var i, value, args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = zepto.isZ(value) ? value.toArray() : value
      }
      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var nodes = [], collection = typeof selector == 'object' && $(selector)
      this.each(function(_, node){
        while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
          node = node !== context && !isDocument(node) && node.parentNode
        if (node && nodes.indexOf(node) < 0) nodes.push(node)
      })
      return $(nodes)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this.pluck('textContent').join("") : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    removeProp: function(name){
      name = propMap[name] || name
      return this.each(function(){ delete this[name] })
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      if (0 in arguments) {
        if (value == null) value = ""
        return this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
      } else {
        return this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
      }
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
        return {top: 0, left: 0}
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0]
        if (typeof property == 'string') {
          if (!element) return
          return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
        } else if (isArray(property)) {
          if (!element) return
          var props = {}
          var computedStyle = getComputedStyle(element, '')
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            var arr = []
            argType = type(arg)
            if (argType == "array") {
              arg.forEach(function(el) {
                if (el.nodeType !== undefined) return arr.push(el)
                else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
                arr = arr.concat(zepto.fragment(el))
              })
              return arr
            }
            return argType == "object" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src){
              var target = el.ownerDocument ? el.ownerDocument.defaultView : window
              target['eval'].call(target, el.innerHTML)
            }
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      event.timeStamp || (event.timeStamp = Date.now())

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (callback === undefined || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = +new Date(),
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  function ajaxDataFilter(data, type, settings) {
    if (settings.dataFilter == empty) return data
    var context = settings.context
    return settings.dataFilter.call(context, data, type)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
    //Used to handle the raw response data of XMLHttpRequest.
    //This is a pre-filtering function to sanitize the response.
    //The sanitized response should be returned
    dataFilter: empty
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor, hashIndex
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))

          if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
            result = xhr.response
          else {
            result = xhr.responseText

            try {
              // http://perfectionkills.com/global-eval-what-are-the-options/
              // sanitize response accordingly if data filter callback provided
              result = ajaxDataFilter(result, dataType, settings)
              if (dataType == 'script')    (1,eval)(result)
              else if (dataType == 'xml')  result = xhr.responseXML
              else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
            } catch (e) { error = e }

            if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
          }

          ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function(){
  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle
    window.getComputedStyle = function(element, pseudoElement){
      try {
        return nativeGetComputedStyle(element, pseudoElement)
      } catch(e) {
        return null
      }
    }
  }
})()
  return Zepto
}))
;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');

function fixStatsType(stat) {
  return {
    inboundrtp: 'inbound-rtp',
    outboundrtp: 'outbound-rtp',
    candidatepair: 'candidate-pair',
    localcandidate: 'local-candidate',
    remotecandidate: 'remote-candidate'
  }[stat.type] || stat.type;
}

function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : dtlsRole || 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    var trackId = transceiver.rtpSender._initialTrackId ||
        transceiver.rtpSender.track.id;
    transceiver.rtpSender._initialTrackId = trackId;
    // spec.
    var msid = 'msid:' + (stream ? stream.id : '-') + ' ' +
        trackId + '\r\n';
    sdp += 'a=' + msid;
    // for Chrome. Legacy should no longer be required.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;

    // RTX
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
}

// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
function filterIceServers(iceServers, edgeVersion) {
  var hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter(function(server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url;
      if (server.url && !server.urls) {
        console.warn('RTCIceServer.url is deprecated! Use urls instead.');
      }
      var isString = typeof urls === 'string';
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter(function(url) {
        var validTurn = url.indexOf('turn:') === 0 &&
            url.indexOf('transport=udp') !== -1 &&
            url.indexOf('turn:[') === -1 &&
            !hasTurn;

        if (validTurn) {
          hasTurn = true;
          return true;
        }
        return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
            url.indexOf('?transport=udp') === -1;
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
}

// Determines the intersection of local and remote capabilities.
function getCommonCapabilities(localCapabilities, remoteCapabilities) {
  var commonCapabilities = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: []
  };

  var findCodecByPayloadType = function(pt, codecs) {
    pt = parseInt(pt, 10);
    for (var i = 0; i < codecs.length; i++) {
      if (codecs[i].payloadType === pt ||
          codecs[i].preferredPayloadType === pt) {
        return codecs[i];
      }
    }
  };

  var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
    var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
    var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
    return lCodec && rCodec &&
        lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
  };

  localCapabilities.codecs.forEach(function(lCodec) {
    for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
      var rCodec = remoteCapabilities.codecs[i];
      if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
          lCodec.clockRate === rCodec.clockRate) {
        if (lCodec.name.toLowerCase() === 'rtx' &&
            lCodec.parameters && rCodec.parameters.apt) {
          // for RTX we need to find the local rtx that has a apt
          // which points to the same local codec as the remote one.
          if (!rtxCapabilityMatches(lCodec, rCodec,
              localCapabilities.codecs, remoteCapabilities.codecs)) {
            continue;
          }
        }
        rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
        // number of channels is the highest common number of channels
        rCodec.numChannels = Math.min(lCodec.numChannels,
            rCodec.numChannels);
        // push rCodec so we reply with offerer payload type
        commonCapabilities.codecs.push(rCodec);

        // determine common feedback mechanisms
        rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
          for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
            if (lCodec.rtcpFeedback[j].type === fb.type &&
                lCodec.rtcpFeedback[j].parameter === fb.parameter) {
              return true;
            }
          }
          return false;
        });
        // FIXME: also need to determine .parameters
        //  see https://github.com/openpeer/ortc/issues/569
        break;
      }
    }
  });

  localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
    for (var i = 0; i < remoteCapabilities.headerExtensions.length;
         i++) {
      var rHeaderExtension = remoteCapabilities.headerExtensions[i];
      if (lHeaderExtension.uri === rHeaderExtension.uri) {
        commonCapabilities.headerExtensions.push(rHeaderExtension);
        break;
      }
    }
  });

  // FIXME: fecMechanisms
  return commonCapabilities;
}

// is action=setLocalDescription with type allowed in signalingState
function isActionAllowedInSignalingState(action, type, signalingState) {
  return {
    offer: {
      setLocalDescription: ['stable', 'have-local-offer'],
      setRemoteDescription: ['stable', 'have-remote-offer']
    },
    answer: {
      setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
      setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
    }
  }[type][action].indexOf(signalingState) !== -1;
}

function maybeAddCandidate(iceTransport, candidate) {
  // Edge's internal representation adds some fields therefore
  // not all fieldѕ are taken into account.
  var alreadyAdded = iceTransport.getRemoteCandidates()
      .find(function(remoteCandidate) {
        return candidate.foundation === remoteCandidate.foundation &&
            candidate.ip === remoteCandidate.ip &&
            candidate.port === remoteCandidate.port &&
            candidate.priority === remoteCandidate.priority &&
            candidate.protocol === remoteCandidate.protocol &&
            candidate.type === remoteCandidate.type;
      });
  if (!alreadyAdded) {
    iceTransport.addRemoteCandidate(candidate);
  }
  return !alreadyAdded;
}


function makeError(name, description) {
  var e = new Error(description);
  e.name = name;
  // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
  e.code = {
    NotSupportedError: 9,
    InvalidStateError: 11,
    InvalidAccessError: 15,
    TypeError: undefined,
    OperationError: undefined
  }[name];
  return e;
}

module.exports = function(window, edgeVersion) {
  // https://w3c.github.io/mediacapture-main/#mediastream
  // Helper function to add the track to the stream and
  // dispatch the event ourselves.
  function addTrackToStreamAndFireEvent(track, stream) {
    stream.addTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack',
        {track: track}));
  }

  function removeTrackFromStreamAndFireEvent(track, stream) {
    stream.removeTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack',
        {track: track}));
  }

  function fireAddTrack(pc, track, receiver, streams) {
    var trackEvent = new Event('track');
    trackEvent.track = track;
    trackEvent.receiver = receiver;
    trackEvent.transceiver = {receiver: receiver};
    trackEvent.streams = streams;
    window.setTimeout(function() {
      pc._dispatchEvent('track', trackEvent);
    });
  }

  var RTCPeerConnection = function(config) {
    var pc = this;

    var _eventTarget = document.createDocumentFragment();
    ['addEventListener', 'removeEventListener', 'dispatchEvent']
        .forEach(function(method) {
          pc[method] = _eventTarget[method].bind(_eventTarget);
        });

    this.canTrickleIceCandidates = null;

    this.needNegotiation = false;

    this.localStreams = [];
    this.remoteStreams = [];

    this.localDescription = null;
    this.remoteDescription = null;

    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.connectionState = 'new';
    this.iceGatheringState = 'new';

    config = JSON.parse(JSON.stringify(config || {}));

    this.usingBundle = config.bundlePolicy === 'max-bundle';
    if (config.rtcpMuxPolicy === 'negotiate') {
      throw(makeError('NotSupportedError',
          'rtcpMuxPolicy \'negotiate\' is not supported'));
    } else if (!config.rtcpMuxPolicy) {
      config.rtcpMuxPolicy = 'require';
    }

    switch (config.iceTransportPolicy) {
      case 'all':
      case 'relay':
        break;
      default:
        config.iceTransportPolicy = 'all';
        break;
    }

    switch (config.bundlePolicy) {
      case 'balanced':
      case 'max-compat':
      case 'max-bundle':
        break;
      default:
        config.bundlePolicy = 'balanced';
        break;
    }

    config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

    this._iceGatherers = [];
    if (config.iceCandidatePoolSize) {
      for (var i = config.iceCandidatePoolSize; i > 0; i--) {
        this._iceGatherers.push(new window.RTCIceGatherer({
          iceServers: config.iceServers,
          gatherPolicy: config.iceTransportPolicy
        }));
      }
    } else {
      config.iceCandidatePoolSize = 0;
    }

    this._config = config;

    // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
    // everything that is needed to describe a SDP m-line.
    this.transceivers = [];

    this._sdpSessionId = SDPUtils.generateSessionId();
    this._sdpSessionVersion = 0;

    this._dtlsRole = undefined; // role for a=setup to use in answers.

    this._isClosed = false;
  };

  // set up event handlers on prototype
  RTCPeerConnection.prototype.onicecandidate = null;
  RTCPeerConnection.prototype.onaddstream = null;
  RTCPeerConnection.prototype.ontrack = null;
  RTCPeerConnection.prototype.onremovestream = null;
  RTCPeerConnection.prototype.onsignalingstatechange = null;
  RTCPeerConnection.prototype.oniceconnectionstatechange = null;
  RTCPeerConnection.prototype.onconnectionstatechange = null;
  RTCPeerConnection.prototype.onicegatheringstatechange = null;
  RTCPeerConnection.prototype.onnegotiationneeded = null;
  RTCPeerConnection.prototype.ondatachannel = null;

  RTCPeerConnection.prototype._dispatchEvent = function(name, event) {
    if (this._isClosed) {
      return;
    }
    this.dispatchEvent(event);
    if (typeof this['on' + name] === 'function') {
      this['on' + name](event);
    }
  };

  RTCPeerConnection.prototype._emitGatheringStateChange = function() {
    var event = new Event('icegatheringstatechange');
    this._dispatchEvent('icegatheringstatechange', event);
  };

  RTCPeerConnection.prototype.getConfiguration = function() {
    return this._config;
  };

  RTCPeerConnection.prototype.getLocalStreams = function() {
    return this.localStreams;
  };

  RTCPeerConnection.prototype.getRemoteStreams = function() {
    return this.remoteStreams;
  };

  // internal helper to create a transceiver object.
  // (which is not yet the same as the WebRTC 1.0 transceiver)
  RTCPeerConnection.prototype._createTransceiver = function(kind, doNotAdd) {
    var hasBundleTransport = this.transceivers.length > 0;
    var transceiver = {
      track: null,
      iceGatherer: null,
      iceTransport: null,
      dtlsTransport: null,
      localCapabilities: null,
      remoteCapabilities: null,
      rtpSender: null,
      rtpReceiver: null,
      kind: kind,
      mid: null,
      sendEncodingParameters: null,
      recvEncodingParameters: null,
      stream: null,
      associatedRemoteMediaStreams: [],
      wantReceive: true
    };
    if (this.usingBundle && hasBundleTransport) {
      transceiver.iceTransport = this.transceivers[0].iceTransport;
      transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
    } else {
      var transports = this._createIceAndDtlsTransports();
      transceiver.iceTransport = transports.iceTransport;
      transceiver.dtlsTransport = transports.dtlsTransport;
    }
    if (!doNotAdd) {
      this.transceivers.push(transceiver);
    }
    return transceiver;
  };

  RTCPeerConnection.prototype.addTrack = function(track, stream) {
    if (this._isClosed) {
      throw makeError('InvalidStateError',
          'Attempted to call addTrack on a closed peerconnection.');
    }

    var alreadyExists = this.transceivers.find(function(s) {
      return s.track === track;
    });

    if (alreadyExists) {
      throw makeError('InvalidAccessError', 'Track already exists.');
    }

    var transceiver;
    for (var i = 0; i < this.transceivers.length; i++) {
      if (!this.transceivers[i].track &&
          this.transceivers[i].kind === track.kind) {
        transceiver = this.transceivers[i];
      }
    }
    if (!transceiver) {
      transceiver = this._createTransceiver(track.kind);
    }

    this._maybeFireNegotiationNeeded();

    if (this.localStreams.indexOf(stream) === -1) {
      this.localStreams.push(stream);
    }

    transceiver.track = track;
    transceiver.stream = stream;
    transceiver.rtpSender = new window.RTCRtpSender(track,
        transceiver.dtlsTransport);
    return transceiver.rtpSender;
  };

  RTCPeerConnection.prototype.addStream = function(stream) {
    var pc = this;
    if (edgeVersion >= 15025) {
      stream.getTracks().forEach(function(track) {
        pc.addTrack(track, stream);
      });
    } else {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      // Fixed in 15025 (or earlier)
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      clonedStream.getTracks().forEach(function(track) {
        pc.addTrack(track, clonedStream);
      });
    }
  };

  RTCPeerConnection.prototype.removeTrack = function(sender) {
    if (this._isClosed) {
      throw makeError('InvalidStateError',
          'Attempted to call removeTrack on a closed peerconnection.');
    }

    if (!(sender instanceof window.RTCRtpSender)) {
      throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' +
          'does not implement interface RTCRtpSender.');
    }

    var transceiver = this.transceivers.find(function(t) {
      return t.rtpSender === sender;
    });

    if (!transceiver) {
      throw makeError('InvalidAccessError',
          'Sender was not created by this connection.');
    }
    var stream = transceiver.stream;

    transceiver.rtpSender.stop();
    transceiver.rtpSender = null;
    transceiver.track = null;
    transceiver.stream = null;

    // remove the stream from the set of local streams
    var localStreams = this.transceivers.map(function(t) {
      return t.stream;
    });
    if (localStreams.indexOf(stream) === -1 &&
        this.localStreams.indexOf(stream) > -1) {
      this.localStreams.splice(this.localStreams.indexOf(stream), 1);
    }

    this._maybeFireNegotiationNeeded();
  };

  RTCPeerConnection.prototype.removeStream = function(stream) {
    var pc = this;
    stream.getTracks().forEach(function(track) {
      var sender = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (sender) {
        pc.removeTrack(sender);
      }
    });
  };

  RTCPeerConnection.prototype.getSenders = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpSender;
    })
    .map(function(transceiver) {
      return transceiver.rtpSender;
    });
  };

  RTCPeerConnection.prototype.getReceivers = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpReceiver;
    })
    .map(function(transceiver) {
      return transceiver.rtpReceiver;
    });
  };


  RTCPeerConnection.prototype._createIceGatherer = function(sdpMLineIndex,
      usingBundle) {
    var pc = this;
    if (usingBundle && sdpMLineIndex > 0) {
      return this.transceivers[0].iceGatherer;
    } else if (this._iceGatherers.length) {
      return this._iceGatherers.shift();
    }
    var iceGatherer = new window.RTCIceGatherer({
      iceServers: this._config.iceServers,
      gatherPolicy: this._config.iceTransportPolicy
    });
    Object.defineProperty(iceGatherer, 'state',
        {value: 'new', writable: true}
    );

    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
    this.transceivers[sdpMLineIndex].bufferCandidates = function(event) {
      var end = !event.candidate || Object.keys(event.candidate).length === 0;
      // polyfill since RTCIceGatherer.state is not implemented in
      // Edge 10547 yet.
      iceGatherer.state = end ? 'completed' : 'gathering';
      if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
        pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
      }
    };
    iceGatherer.addEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    return iceGatherer;
  };

  // start gathering from an RTCIceGatherer.
  RTCPeerConnection.prototype._gather = function(mid, sdpMLineIndex) {
    var pc = this;
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer.onlocalcandidate) {
      return;
    }
    var bufferedCandidateEvents =
      this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
    iceGatherer.removeEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    iceGatherer.onlocalcandidate = function(evt) {
      if (pc.usingBundle && sdpMLineIndex > 0) {
        // if we know that we use bundle we can drop candidates with
        // ѕdpMLineIndex > 0. If we don't do this then our state gets
        // confused since we dispose the extra ice gatherer.
        return;
      }
      var event = new Event('icecandidate');
      event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

      var cand = evt.candidate;
      // Edge emits an empty object for RTCIceCandidateComplete‥
      var end = !cand || Object.keys(cand).length === 0;
      if (end) {
        // polyfill since RTCIceGatherer.state is not implemented in
        // Edge 10547 yet.
        if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
          iceGatherer.state = 'completed';
        }
      } else {
        if (iceGatherer.state === 'new') {
          iceGatherer.state = 'gathering';
        }
        // RTCIceCandidate doesn't have a component, needs to be added
        cand.component = 1;
        // also the usernameFragment. TODO: update SDP to take both variants.
        cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

        var serializedCandidate = SDPUtils.writeCandidate(cand);
        event.candidate = Object.assign(event.candidate,
            SDPUtils.parseCandidate(serializedCandidate));

        event.candidate.candidate = serializedCandidate;
        event.candidate.toJSON = function() {
          return {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment
          };
        };
      }

      // update local description.
      var sections = SDPUtils.getMediaSections(pc.localDescription.sdp);
      if (!end) {
        sections[event.candidate.sdpMLineIndex] +=
            'a=' + event.candidate.candidate + '\r\n';
      } else {
        sections[event.candidate.sdpMLineIndex] +=
            'a=end-of-candidates\r\n';
      }
      pc.localDescription.sdp =
          SDPUtils.getDescription(pc.localDescription.sdp) +
          sections.join('');
      var complete = pc.transceivers.every(function(transceiver) {
        return transceiver.iceGatherer &&
            transceiver.iceGatherer.state === 'completed';
      });

      if (pc.iceGatheringState !== 'gathering') {
        pc.iceGatheringState = 'gathering';
        pc._emitGatheringStateChange();
      }

      // Emit candidate. Also emit null candidate when all gatherers are
      // complete.
      if (!end) {
        pc._dispatchEvent('icecandidate', event);
      }
      if (complete) {
        pc._dispatchEvent('icecandidate', new Event('icecandidate'));
        pc.iceGatheringState = 'complete';
        pc._emitGatheringStateChange();
      }
    };

    // emit already gathered candidates.
    window.setTimeout(function() {
      bufferedCandidateEvents.forEach(function(e) {
        iceGatherer.onlocalcandidate(e);
      });
    }, 0);
  };

  // Create ICE transport and DTLS transport.
  RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
    var pc = this;
    var iceTransport = new window.RTCIceTransport(null);
    iceTransport.onicestatechange = function() {
      pc._updateIceConnectionState();
      pc._updateConnectionState();
    };

    var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
    dtlsTransport.ondtlsstatechange = function() {
      pc._updateConnectionState();
    };
    dtlsTransport.onerror = function() {
      // onerror does not set state to failed by itself.
      Object.defineProperty(dtlsTransport, 'state',
          {value: 'failed', writable: true});
      pc._updateConnectionState();
    };

    return {
      iceTransport: iceTransport,
      dtlsTransport: dtlsTransport
    };
  };

  // Destroy ICE gatherer, ICE transport and DTLS transport.
  // Without triggering the callbacks.
  RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
      sdpMLineIndex) {
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer) {
      delete iceGatherer.onlocalcandidate;
      delete this.transceivers[sdpMLineIndex].iceGatherer;
    }
    var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
    if (iceTransport) {
      delete iceTransport.onicestatechange;
      delete this.transceivers[sdpMLineIndex].iceTransport;
    }
    var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
    if (dtlsTransport) {
      delete dtlsTransport.ondtlsstatechange;
      delete dtlsTransport.onerror;
      delete this.transceivers[sdpMLineIndex].dtlsTransport;
    }
  };

  // Start the RTP Sender and Receiver for a transceiver.
  RTCPeerConnection.prototype._transceive = function(transceiver,
      send, recv) {
    var params = getCommonCapabilities(transceiver.localCapabilities,
        transceiver.remoteCapabilities);
    if (send && transceiver.rtpSender) {
      params.encodings = transceiver.sendEncodingParameters;
      params.rtcp = {
        cname: SDPUtils.localCName,
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.recvEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
      }
      transceiver.rtpSender.send(params);
    }
    if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
      // remove RTX field in Edge 14942
      if (transceiver.kind === 'video'
          && transceiver.recvEncodingParameters
          && edgeVersion < 15019) {
        transceiver.recvEncodingParameters.forEach(function(p) {
          delete p.rtx;
        });
      }
      if (transceiver.recvEncodingParameters.length) {
        params.encodings = transceiver.recvEncodingParameters;
      } else {
        params.encodings = [{}];
      }
      params.rtcp = {
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.rtcpParameters.cname) {
        params.rtcp.cname = transceiver.rtcpParameters.cname;
      }
      if (transceiver.sendEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
      }
      transceiver.rtpReceiver.receive(params);
    }
  };

  RTCPeerConnection.prototype.setLocalDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!isActionAllowedInSignalingState('setLocalDescription',
        description.type, pc.signalingState) || pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set local ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var sections;
    var sessionpart;
    if (description.type === 'offer') {
      // VERY limited support for SDP munging. Limited to:
      // * changing the order of codecs
      sections = SDPUtils.splitSections(description.sdp);
      sessionpart = sections.shift();
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var caps = SDPUtils.parseRtpParameters(mediaSection);
        pc.transceivers[sdpMLineIndex].localCapabilities = caps;
      });

      pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
        pc._gather(transceiver.mid, sdpMLineIndex);
      });
    } else if (description.type === 'answer') {
      sections = SDPUtils.splitSections(pc.remoteDescription.sdp);
      sessionpart = sections.shift();
      var isIceLite = SDPUtils.matchPrefix(sessionpart,
          'a=ice-lite').length > 0;
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var transceiver = pc.transceivers[sdpMLineIndex];
        var iceGatherer = transceiver.iceGatherer;
        var iceTransport = transceiver.iceTransport;
        var dtlsTransport = transceiver.dtlsTransport;
        var localCapabilities = transceiver.localCapabilities;
        var remoteCapabilities = transceiver.remoteCapabilities;

        // treat bundle-only as not-rejected.
        var rejected = SDPUtils.isRejected(mediaSection) &&
            SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

        if (!rejected && !transceiver.rejected) {
          var remoteIceParameters = SDPUtils.getIceParameters(
              mediaSection, sessionpart);
          var remoteDtlsParameters = SDPUtils.getDtlsParameters(
              mediaSection, sessionpart);
          if (isIceLite) {
            remoteDtlsParameters.role = 'server';
          }

          if (!pc.usingBundle || sdpMLineIndex === 0) {
            pc._gather(transceiver.mid, sdpMLineIndex);
            if (iceTransport.state === 'new') {
              iceTransport.start(iceGatherer, remoteIceParameters,
                  isIceLite ? 'controlling' : 'controlled');
            }
            if (dtlsTransport.state === 'new') {
              dtlsTransport.start(remoteDtlsParameters);
            }
          }

          // Calculate intersection of capabilities.
          var params = getCommonCapabilities(localCapabilities,
              remoteCapabilities);

          // Start the RTCRtpSender. The RTCRtpReceiver for this
          // transceiver has already been started in setRemoteDescription.
          pc._transceive(transceiver,
              params.codecs.length > 0,
              false);
        }
      });
    }

    pc.localDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-local-offer');
    } else {
      pc._updateSignalingState('stable');
    }

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.setRemoteDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!isActionAllowedInSignalingState('setRemoteDescription',
        description.type, pc.signalingState) || pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set remote ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var streams = {};
    pc.remoteStreams.forEach(function(stream) {
      streams[stream.id] = stream;
    });
    var receiverList = [];
    var sections = SDPUtils.splitSections(description.sdp);
    var sessionpart = sections.shift();
    var isIceLite = SDPUtils.matchPrefix(sessionpart,
        'a=ice-lite').length > 0;
    var usingBundle = SDPUtils.matchPrefix(sessionpart,
        'a=group:BUNDLE ').length > 0;
    pc.usingBundle = usingBundle;
    var iceOptions = SDPUtils.matchPrefix(sessionpart,
        'a=ice-options:')[0];
    if (iceOptions) {
      pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
          .indexOf('trickle') >= 0;
    } else {
      pc.canTrickleIceCandidates = false;
    }

    sections.forEach(function(mediaSection, sdpMLineIndex) {
      var lines = SDPUtils.splitLines(mediaSection);
      var kind = SDPUtils.getKind(mediaSection);
      // treat bundle-only as not-rejected.
      var rejected = SDPUtils.isRejected(mediaSection) &&
          SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
      var protocol = lines[0].substr(2).split(' ')[2];

      var direction = SDPUtils.getDirection(mediaSection, sessionpart);
      var remoteMsid = SDPUtils.parseMsid(mediaSection);

      var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

      // Reject datachannels which are not implemented yet.
      if ((kind === 'application' && protocol === 'DTLS/SCTP') || rejected) {
        // TODO: this is dangerous in the case where a non-rejected m-line
        //     becomes rejected.
        pc.transceivers[sdpMLineIndex] = {
          mid: mid,
          kind: kind,
          rejected: true
        };
        return;
      }

      if (!rejected && pc.transceivers[sdpMLineIndex] &&
          pc.transceivers[sdpMLineIndex].rejected) {
        // recycle a rejected transceiver.
        pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
      }

      var transceiver;
      var iceGatherer;
      var iceTransport;
      var dtlsTransport;
      var rtpReceiver;
      var sendEncodingParameters;
      var recvEncodingParameters;
      var localCapabilities;

      var track;
      // FIXME: ensure the mediaSection has rtcp-mux set.
      var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
      var remoteIceParameters;
      var remoteDtlsParameters;
      if (!rejected) {
        remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters.role = 'client';
      }
      recvEncodingParameters =
          SDPUtils.parseRtpEncodingParameters(mediaSection);

      var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

      var isComplete = SDPUtils.matchPrefix(mediaSection,
          'a=end-of-candidates', sessionpart).length > 0;
      var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
          .map(function(cand) {
            return SDPUtils.parseCandidate(cand);
          })
          .filter(function(cand) {
            return cand.component === 1;
          });

      // Check if we can use BUNDLE and dispose transports.
      if ((description.type === 'offer' || description.type === 'answer') &&
          !rejected && usingBundle && sdpMLineIndex > 0 &&
          pc.transceivers[sdpMLineIndex]) {
        pc._disposeIceAndDtlsTransports(sdpMLineIndex);
        pc.transceivers[sdpMLineIndex].iceGatherer =
            pc.transceivers[0].iceGatherer;
        pc.transceivers[sdpMLineIndex].iceTransport =
            pc.transceivers[0].iceTransport;
        pc.transceivers[sdpMLineIndex].dtlsTransport =
            pc.transceivers[0].dtlsTransport;
        if (pc.transceivers[sdpMLineIndex].rtpSender) {
          pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
        if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
          pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
      }
      if (description.type === 'offer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex] ||
            pc._createTransceiver(kind);
        transceiver.mid = mid;

        if (!transceiver.iceGatherer) {
          transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
              usingBundle);
        }

        if (cands.length && transceiver.iceTransport.state === 'new') {
          if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
            transceiver.iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        if (edgeVersion < 15019) {
          localCapabilities.codecs = localCapabilities.codecs.filter(
              function(codec) {
                return codec.name !== 'rtx';
              });
        }

        sendEncodingParameters = transceiver.sendEncodingParameters || [{
          ssrc: (2 * sdpMLineIndex + 2) * 1001
        }];

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        var isNewTrack = false;
        if (direction === 'sendrecv' || direction === 'sendonly') {
          isNewTrack = !transceiver.rtpReceiver;
          rtpReceiver = transceiver.rtpReceiver ||
              new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

          if (isNewTrack) {
            var stream;
            track = rtpReceiver.track;
            // FIXME: does not work with Plan B.
            if (remoteMsid && remoteMsid.stream === '-') {
              // no-op. a stream id of '-' means: no associated stream.
            } else if (remoteMsid) {
              if (!streams[remoteMsid.stream]) {
                streams[remoteMsid.stream] = new window.MediaStream();
                Object.defineProperty(streams[remoteMsid.stream], 'id', {
                  get: function() {
                    return remoteMsid.stream;
                  }
                });
              }
              Object.defineProperty(track, 'id', {
                get: function() {
                  return remoteMsid.track;
                }
              });
              stream = streams[remoteMsid.stream];
            } else {
              if (!streams.default) {
                streams.default = new window.MediaStream();
              }
              stream = streams.default;
            }
            if (stream) {
              addTrackToStreamAndFireEvent(track, stream);
              transceiver.associatedRemoteMediaStreams.push(stream);
            }
            receiverList.push([track, rtpReceiver, stream]);
          }
        } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
          transceiver.associatedRemoteMediaStreams.forEach(function(s) {
            var nativeTrack = s.getTracks().find(function(t) {
              return t.id === transceiver.rtpReceiver.track.id;
            });
            if (nativeTrack) {
              removeTrackFromStreamAndFireEvent(nativeTrack, s);
            }
          });
          transceiver.associatedRemoteMediaStreams = [];
        }

        transceiver.localCapabilities = localCapabilities;
        transceiver.remoteCapabilities = remoteCapabilities;
        transceiver.rtpReceiver = rtpReceiver;
        transceiver.rtcpParameters = rtcpParameters;
        transceiver.sendEncodingParameters = sendEncodingParameters;
        transceiver.recvEncodingParameters = recvEncodingParameters;

        // Start the RTCRtpReceiver now. The RTPSender is started in
        // setLocalDescription.
        pc._transceive(pc.transceivers[sdpMLineIndex],
            false,
            isNewTrack);
      } else if (description.type === 'answer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex];
        iceGatherer = transceiver.iceGatherer;
        iceTransport = transceiver.iceTransport;
        dtlsTransport = transceiver.dtlsTransport;
        rtpReceiver = transceiver.rtpReceiver;
        sendEncodingParameters = transceiver.sendEncodingParameters;
        localCapabilities = transceiver.localCapabilities;

        pc.transceivers[sdpMLineIndex].recvEncodingParameters =
            recvEncodingParameters;
        pc.transceivers[sdpMLineIndex].remoteCapabilities =
            remoteCapabilities;
        pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

        if (cands.length && iceTransport.state === 'new') {
          if ((isIceLite || isComplete) &&
              (!usingBundle || sdpMLineIndex === 0)) {
            iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        if (!usingBundle || sdpMLineIndex === 0) {
          if (iceTransport.state === 'new') {
            iceTransport.start(iceGatherer, remoteIceParameters,
                'controlling');
          }
          if (dtlsTransport.state === 'new') {
            dtlsTransport.start(remoteDtlsParameters);
          }
        }

        pc._transceive(transceiver,
            direction === 'sendrecv' || direction === 'recvonly',
            direction === 'sendrecv' || direction === 'sendonly');

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        if (rtpReceiver &&
            (direction === 'sendrecv' || direction === 'sendonly')) {
          track = rtpReceiver.track;
          if (remoteMsid) {
            if (!streams[remoteMsid.stream]) {
              streams[remoteMsid.stream] = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
            receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
          } else {
            if (!streams.default) {
              streams.default = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams.default);
            receiverList.push([track, rtpReceiver, streams.default]);
          }
        } else {
          // FIXME: actually the receiver should be created later.
          delete transceiver.rtpReceiver;
        }
      }
    });

    if (pc._dtlsRole === undefined) {
      pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
    }

    pc.remoteDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-remote-offer');
    } else {
      pc._updateSignalingState('stable');
    }
    Object.keys(streams).forEach(function(sid) {
      var stream = streams[sid];
      if (stream.getTracks().length) {
        if (pc.remoteStreams.indexOf(stream) === -1) {
          pc.remoteStreams.push(stream);
          var event = new Event('addstream');
          event.stream = stream;
          window.setTimeout(function() {
            pc._dispatchEvent('addstream', event);
          });
        }

        receiverList.forEach(function(item) {
          var track = item[0];
          var receiver = item[1];
          if (stream.id !== item[2].id) {
            return;
          }
          fireAddTrack(pc, track, receiver, [stream]);
        });
      }
    });
    receiverList.forEach(function(item) {
      if (item[2]) {
        return;
      }
      fireAddTrack(pc, item[0], item[1], []);
    });

    // check whether addIceCandidate({}) was called within four seconds after
    // setRemoteDescription.
    window.setTimeout(function() {
      if (!(pc && pc.transceivers)) {
        return;
      }
      pc.transceivers.forEach(function(transceiver) {
        if (transceiver.iceTransport &&
            transceiver.iceTransport.state === 'new' &&
            transceiver.iceTransport.getRemoteCandidates().length > 0) {
          console.warn('Timeout for addRemoteCandidate. Consider sending ' +
              'an end-of-candidates notification');
          transceiver.iceTransport.addRemoteCandidate({});
        }
      });
    }, 4000);

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.close = function() {
    this.transceivers.forEach(function(transceiver) {
      /* not yet
      if (transceiver.iceGatherer) {
        transceiver.iceGatherer.close();
      }
      */
      if (transceiver.iceTransport) {
        transceiver.iceTransport.stop();
      }
      if (transceiver.dtlsTransport) {
        transceiver.dtlsTransport.stop();
      }
      if (transceiver.rtpSender) {
        transceiver.rtpSender.stop();
      }
      if (transceiver.rtpReceiver) {
        transceiver.rtpReceiver.stop();
      }
    });
    // FIXME: clean up tracks, local streams, remote streams, etc
    this._isClosed = true;
    this._updateSignalingState('closed');
  };

  // Update the signaling state.
  RTCPeerConnection.prototype._updateSignalingState = function(newState) {
    this.signalingState = newState;
    var event = new Event('signalingstatechange');
    this._dispatchEvent('signalingstatechange', event);
  };

  // Determine whether to fire the negotiationneeded event.
  RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
    var pc = this;
    if (this.signalingState !== 'stable' || this.needNegotiation === true) {
      return;
    }
    this.needNegotiation = true;
    window.setTimeout(function() {
      if (pc.needNegotiation) {
        pc.needNegotiation = false;
        var event = new Event('negotiationneeded');
        pc._dispatchEvent('negotiationneeded', event);
      }
    }, 0);
  };

  // Update the ice connection state.
  RTCPeerConnection.prototype._updateIceConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      checking: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      states[transceiver.iceTransport.state]++;
    });

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.checking > 0) {
      newState = 'checking';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    } else if (states.completed > 0) {
      newState = 'completed';
    }

    if (newState !== this.iceConnectionState) {
      this.iceConnectionState = newState;
      var event = new Event('iceconnectionstatechange');
      this._dispatchEvent('iceconnectionstatechange', event);
    }
  };

  // Update the connection state.
  RTCPeerConnection.prototype._updateConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      connecting: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      states[transceiver.iceTransport.state]++;
      states[transceiver.dtlsTransport.state]++;
    });
    // ICETransport.completed and connected are the same for this purpose.
    states.connected += states.completed;

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.connecting > 0) {
      newState = 'connecting';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    }

    if (newState !== this.connectionState) {
      this.connectionState = newState;
      var event = new Event('connectionstatechange');
      this._dispatchEvent('connectionstatechange', event);
    }
  };

  RTCPeerConnection.prototype.createOffer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createOffer after close'));
    }

    var numAudioTracks = pc.transceivers.filter(function(t) {
      return t.kind === 'audio';
    }).length;
    var numVideoTracks = pc.transceivers.filter(function(t) {
      return t.kind === 'video';
    }).length;

    // Determine number of audio and video tracks we need to send/recv.
    var offerOptions = arguments[0];
    if (offerOptions) {
      // Reject Chrome legacy constraints.
      if (offerOptions.mandatory || offerOptions.optional) {
        throw new TypeError(
            'Legacy mandatory/optional constraints not supported.');
      }
      if (offerOptions.offerToReceiveAudio !== undefined) {
        if (offerOptions.offerToReceiveAudio === true) {
          numAudioTracks = 1;
        } else if (offerOptions.offerToReceiveAudio === false) {
          numAudioTracks = 0;
        } else {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
      }
      if (offerOptions.offerToReceiveVideo !== undefined) {
        if (offerOptions.offerToReceiveVideo === true) {
          numVideoTracks = 1;
        } else if (offerOptions.offerToReceiveVideo === false) {
          numVideoTracks = 0;
        } else {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
    }

    pc.transceivers.forEach(function(transceiver) {
      if (transceiver.kind === 'audio') {
        numAudioTracks--;
        if (numAudioTracks < 0) {
          transceiver.wantReceive = false;
        }
      } else if (transceiver.kind === 'video') {
        numVideoTracks--;
        if (numVideoTracks < 0) {
          transceiver.wantReceive = false;
        }
      }
    });

    // Create M-lines for recvonly streams.
    while (numAudioTracks > 0 || numVideoTracks > 0) {
      if (numAudioTracks > 0) {
        pc._createTransceiver('audio');
        numAudioTracks--;
      }
      if (numVideoTracks > 0) {
        pc._createTransceiver('video');
        numVideoTracks--;
      }
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      // For each track, create an ice gatherer, ice transport,
      // dtls transport, potentially rtpsender and rtpreceiver.
      var track = transceiver.track;
      var kind = transceiver.kind;
      var mid = transceiver.mid || SDPUtils.generateIdentifier();
      transceiver.mid = mid;

      if (!transceiver.iceGatherer) {
        transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
            pc.usingBundle);
      }

      var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
      // filter RTX until additional stuff needed for RTX is implemented
      // in adapter.js
      if (edgeVersion < 15019) {
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
      }
      localCapabilities.codecs.forEach(function(codec) {
        // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
        // by adding level-asymmetry-allowed=1
        if (codec.name === 'H264' &&
            codec.parameters['level-asymmetry-allowed'] === undefined) {
          codec.parameters['level-asymmetry-allowed'] = '1';
        }

        // for subsequent offers, we might have to re-use the payload
        // type of the last offer.
        if (transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.codecs) {
          transceiver.remoteCapabilities.codecs.forEach(function(remoteCodec) {
            if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() &&
                codec.clockRate === remoteCodec.clockRate) {
              codec.preferredPayloadType = remoteCodec.payloadType;
            }
          });
        }
      });
      localCapabilities.headerExtensions.forEach(function(hdrExt) {
        var remoteExtensions = transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.headerExtensions || [];
        remoteExtensions.forEach(function(rHdrExt) {
          if (hdrExt.uri === rHdrExt.uri) {
            hdrExt.id = rHdrExt.id;
          }
        });
      });

      // generate an ssrc now, to be used later in rtpSender.send
      var sendEncodingParameters = transceiver.sendEncodingParameters || [{
        ssrc: (2 * sdpMLineIndex + 1) * 1001
      }];
      if (track) {
        // add RTX
        if (edgeVersion >= 15019 && kind === 'video' &&
            !sendEncodingParameters[0].rtx) {
          sendEncodingParameters[0].rtx = {
            ssrc: sendEncodingParameters[0].ssrc + 1
          };
        }
      }

      if (transceiver.wantReceive) {
        transceiver.rtpReceiver = new window.RTCRtpReceiver(
            transceiver.dtlsTransport, kind);
      }

      transceiver.localCapabilities = localCapabilities;
      transceiver.sendEncodingParameters = sendEncodingParameters;
    });

    // always offer BUNDLE and dispose on return if not supported.
    if (pc._config.bundlePolicy !== 'max-compat') {
      sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      sdp += writeMediaSection(transceiver, transceiver.localCapabilities,
          'offer', transceiver.stream, pc._dtlsRole);
      sdp += 'a=rtcp-rsize\r\n';

      if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' &&
          (sdpMLineIndex === 0 || !pc.usingBundle)) {
        transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
          cand.component = 1;
          sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
        });

        if (transceiver.iceGatherer.state === 'completed') {
          sdp += 'a=end-of-candidates\r\n';
        }
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'offer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.createAnswer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer after close'));
    }

    if (!(pc.signalingState === 'have-remote-offer' ||
        pc.signalingState === 'have-local-pranswer')) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer in signalingState ' + pc.signalingState));
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    if (pc.usingBundle) {
      sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    var mediaSectionsInOffer = SDPUtils.getMediaSections(
        pc.remoteDescription.sdp).length;
    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
        return;
      }
      if (transceiver.rejected) {
        if (transceiver.kind === 'application') {
          sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
        } else if (transceiver.kind === 'audio') {
          sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' +
              'a=rtpmap:0 PCMU/8000\r\n';
        } else if (transceiver.kind === 'video') {
          sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' +
              'a=rtpmap:120 VP8/90000\r\n';
        }
        sdp += 'c=IN IP4 0.0.0.0\r\n' +
            'a=inactive\r\n' +
            'a=mid:' + transceiver.mid + '\r\n';
        return;
      }

      // FIXME: look at direction.
      if (transceiver.stream) {
        var localTrack;
        if (transceiver.kind === 'audio') {
          localTrack = transceiver.stream.getAudioTracks()[0];
        } else if (transceiver.kind === 'video') {
          localTrack = transceiver.stream.getVideoTracks()[0];
        }
        if (localTrack) {
          // add RTX
          if (edgeVersion >= 15019 && transceiver.kind === 'video' &&
              !transceiver.sendEncodingParameters[0].rtx) {
            transceiver.sendEncodingParameters[0].rtx = {
              ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
            };
          }
        }
      }

      // Calculate intersection of capabilities.
      var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

      var hasRtx = commonCapabilities.codecs.filter(function(c) {
        return c.name.toLowerCase() === 'rtx';
      }).length;
      if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
        delete transceiver.sendEncodingParameters[0].rtx;
      }

      sdp += writeMediaSection(transceiver, commonCapabilities,
          'answer', transceiver.stream, pc._dtlsRole);
      if (transceiver.rtcpParameters &&
          transceiver.rtcpParameters.reducedSize) {
        sdp += 'a=rtcp-rsize\r\n';
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'answer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
    var pc = this;
    var sections;
    if (candidate && !(candidate.sdpMLineIndex !== undefined ||
        candidate.sdpMid)) {
      return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
    }

    // TODO: needs to go into ops queue.
    return new Promise(function(resolve, reject) {
      if (!pc.remoteDescription) {
        return reject(makeError('InvalidStateError',
            'Can not add ICE candidate without a remote description'));
      } else if (!candidate || candidate.candidate === '') {
        for (var j = 0; j < pc.transceivers.length; j++) {
          if (pc.transceivers[j].rejected) {
            continue;
          }
          pc.transceivers[j].iceTransport.addRemoteCandidate({});
          sections = SDPUtils.getMediaSections(pc.remoteDescription.sdp);
          sections[j] += 'a=end-of-candidates\r\n';
          pc.remoteDescription.sdp =
              SDPUtils.getDescription(pc.remoteDescription.sdp) +
              sections.join('');
          if (pc.usingBundle) {
            break;
          }
        }
      } else {
        var sdpMLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < pc.transceivers.length; i++) {
            if (pc.transceivers[i].mid === candidate.sdpMid) {
              sdpMLineIndex = i;
              break;
            }
          }
        }
        var transceiver = pc.transceivers[sdpMLineIndex];
        if (transceiver) {
          if (transceiver.rejected) {
            return resolve();
          }
          var cand = Object.keys(candidate.candidate).length > 0 ?
              SDPUtils.parseCandidate(candidate.candidate) : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
            return resolve();
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component && cand.component !== 1) {
            return resolve();
          }
          // when using bundle, avoid adding candidates to the wrong
          // ice transport. And avoid adding candidates added in the SDP.
          if (sdpMLineIndex === 0 || (sdpMLineIndex > 0 &&
              transceiver.iceTransport !== pc.transceivers[0].iceTransport)) {
            if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
              return reject(makeError('OperationError',
                  'Can not add ICE candidate'));
            }
          }

          // update the remoteDescription.
          var candidateString = candidate.candidate.trim();
          if (candidateString.indexOf('a=') === 0) {
            candidateString = candidateString.substr(2);
          }
          sections = SDPUtils.getMediaSections(pc.remoteDescription.sdp);
          sections[sdpMLineIndex] += 'a=' +
              (cand.type ? candidateString : 'end-of-candidates')
              + '\r\n';
          pc.remoteDescription.sdp =
              SDPUtils.getDescription(pc.remoteDescription.sdp) +
              sections.join('');
        } else {
          return reject(makeError('OperationError',
              'Can not add ICE candidate'));
        }
      }
      resolve();
    });
  };

  RTCPeerConnection.prototype.getStats = function(selector) {
    if (selector && selector instanceof window.MediaStreamTrack) {
      var senderOrReceiver = null;
      this.transceivers.forEach(function(transceiver) {
        if (transceiver.rtpSender &&
            transceiver.rtpSender.track === selector) {
          senderOrReceiver = transceiver.rtpSender;
        } else if (transceiver.rtpReceiver &&
            transceiver.rtpReceiver.track === selector) {
          senderOrReceiver = transceiver.rtpReceiver;
        }
      });
      if (!senderOrReceiver) {
        throw makeError('InvalidAccessError', 'Invalid selector.');
      }
      return senderOrReceiver.getStats();
    }

    var promises = [];
    this.transceivers.forEach(function(transceiver) {
      ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
          'dtlsTransport'].forEach(function(method) {
            if (transceiver[method]) {
              promises.push(transceiver[method].getStats());
            }
          });
    });
    return Promise.all(promises).then(function(allStats) {
      var results = new Map();
      allStats.forEach(function(stats) {
        stats.forEach(function(stat) {
          results.set(stat.id, stat);
        });
      });
      return results;
    });
  };

  // fix low-level stat names and return Map instead of object.
  var ortcObjects = ['RTCRtpSender', 'RTCRtpReceiver', 'RTCIceGatherer',
    'RTCIceTransport', 'RTCDtlsTransport'];
  ortcObjects.forEach(function(ortcObjectName) {
    var obj = window[ortcObjectName];
    if (obj && obj.prototype && obj.prototype.getStats) {
      var nativeGetstats = obj.prototype.getStats;
      obj.prototype.getStats = function() {
        return nativeGetstats.apply(this)
        .then(function(nativeStats) {
          var mapStats = new Map();
          Object.keys(nativeStats).forEach(function(id) {
            nativeStats[id].type = fixStatsType(nativeStats[id]);
            mapStats.set(id, nativeStats[id]);
          });
          return mapStats;
        });
      };
    }
  });

  // legacy callback shims. Should be moved to adapter.js some days.
  var methods = ['createOffer', 'createAnswer'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[0] === 'function' ||
          typeof args[1] === 'function') { // legacy
        return nativeMethod.apply(this, [arguments[2]])
        .then(function(description) {
          if (typeof args[0] === 'function') {
            args[0].apply(null, [description]);
          }
        }, function(error) {
          if (typeof args[1] === 'function') {
            args[1].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function' ||
          typeof args[2] === 'function') { // legacy
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        }, function(error) {
          if (typeof args[2] === 'function') {
            args[2].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  // getStats is special. It doesn't have a spec legacy method yet we support
  // getStats(something, cb) without error callbacks.
  ['getStats'].forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function') {
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  return RTCPeerConnection;
};

},{"sdp":2}],2:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// returns the session description.
SDPUtils.getDescription = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  return sections && sections[0];
};

// returns the individual media sections.
SDPUtils.getMediaSections = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  sections.shift();
  return sections;
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parseInt(parts[1], 10),
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      case 'ufrag':
        candidate.ufrag = parts[i + 1]; // for backward compability.
        candidate.usernameFragment = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress); // was: relAddr
    sdp.push('rport');
    sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  if (candidate.usernameFragment || candidate.ufrag) {
    sdp.push('ufrag');
    sdp.push(candidate.usernameFragment || candidate.ufrag);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
}

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
          ? '/' + headerExtension.direction
          : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      params.push(param + '=' + codec.parameters[param]);
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
}

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  caps.headerExtensions.forEach(function(extension) {
    sdp += SDPUtils.writeExtmap(extension);
  });
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.split(' ');
    parts.shift();
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
        rtx: {
          ssrc: secondarySsrc
        }
      };
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      // use formula from JSEP to convert b=AS to TIAS value.
      bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
          - (50 * 40 * 8);
    } else {
      bandwidth = undefined;
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  var cname;
  // Gets the first SSRC. Note that with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
      .map(function(line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function(obj) {
        return obj.attribute === 'cname';
      })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'msid';
  });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

// Generate a session ID for SDP.
// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
// recommends using a cryptographically random +ve 64-bit value
// but right now this should be acceptable and within the right range
SDPUtils.generateSessionId = function() {
  return Math.random().toString().substr(2, 21);
};

// Write boilder plate for start of SDP
// sessId argument is optional - if not supplied it will
// be generated randomly
// sessVersion is optional and defaults to 2
SDPUtils.writeSessionBoilerplate = function(sessId, sessVer) {
  var sessionId;
  var version = sessVer !== undefined ? sessVer : 2;
  if (sessId) {
    sessionId = sessId;
  } else {
    sessionId = SDPUtils.generateSessionId();
  }
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

SDPUtils.parseMLine = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var parts = lines[0].substr(2).split(' ');
  return {
    kind: parts[0],
    port: parseInt(parts[1], 10),
    protocol: parts[2],
    fmt: parts.slice(3).join(' ')
  };
};

SDPUtils.parseOLine = function(mediaSection) {
  var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
  var parts = line.substr(2).split(' ');
  return {
    username: parts[0],
    sessionId: parts[1],
    sessionVersion: parseInt(parts[2], 10),
    netType: parts[3],
    addressType: parts[4],
    address: parts[5],
  };
}

// Expose public methods.
if (typeof module === 'object') {
  module.exports = SDPUtils;
}

},{}],3:[function(require,module,exports){
(function (global){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var adapterFactory = require('./adapter_factory.js');
module.exports = adapterFactory({window: global.window});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./adapter_factory.js":4}],4:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var utils = require('./utils');
// Shimming starts here.
module.exports = function(dependencies, opts) {
  var window = dependencies && dependencies.window;

  var options = {
    shimChrome: true,
    shimFirefox: true,
    shimEdge: true,
    shimSafari: true,
  };

  for (var key in opts) {
    if (hasOwnProperty.call(opts, key)) {
      options[key] = opts[key];
    }
  }

  // Utils.
  var logging = utils.log;
  var browserDetails = utils.detectBrowser(window);

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;
  var commonShim = require('./common_shim') || null;

  // Export to the adapter global object visible in the browser.
  var adapter = {
    browserDetails: browserDetails,
    commonShim: commonShim,
    extractVersion: utils.extractVersion,
    disableLog: utils.disableLog,
    disableWarnings: utils.disableWarnings
  };

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection ||
          !options.shimChrome) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;
      commonShim.shimCreateObjectURL(window);

      chromeShim.shimGetUserMedia(window);
      chromeShim.shimMediaStream(window);
      chromeShim.shimSourceObject(window);
      chromeShim.shimPeerConnection(window);
      chromeShim.shimOnTrack(window);
      chromeShim.shimAddTrackRemoveTrack(window);
      chromeShim.shimGetSendersWithDtmf(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection ||
          !options.shimFirefox) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;
      commonShim.shimCreateObjectURL(window);

      firefoxShim.shimGetUserMedia(window);
      firefoxShim.shimSourceObject(window);
      firefoxShim.shimPeerConnection(window);
      firefoxShim.shimOnTrack(window);
      firefoxShim.shimRemoveStream(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
        logging('MS edge shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = edgeShim;
      commonShim.shimCreateObjectURL(window);

      edgeShim.shimGetUserMedia(window);
      edgeShim.shimPeerConnection(window);
      edgeShim.shimReplaceTrack(window);

      // the edge shim implements the full RTCIceCandidate object.

      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'safari':
      if (!safariShim || !options.shimSafari) {
        logging('Safari shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;
      commonShim.shimCreateObjectURL(window);

      safariShim.shimRTCIceServerUrls(window);
      safariShim.shimCallbacksAPI(window);
      safariShim.shimLocalStreamsAPI(window);
      safariShim.shimRemoteStreamsAPI(window);
      safariShim.shimTrackEventTransceiver(window);
      safariShim.shimGetUserMedia(window);
      safariShim.shimCreateOfferLegacy(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    default:
      logging('Unsupported browser!');
      break;
  }

  return adapter;
};

},{"./chrome/chrome_shim":5,"./common_shim":7,"./edge/edge_shim":8,"./firefox/firefox_shim":10,"./safari/safari_shim":12,"./utils":13}],5:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimMediaStream: function(window) {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
          }
          this.addEventListener('track', this._ontrack = f);
        }
      });
      var origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function() {
        var pc = this;
        if (!pc._ontrackpoly) {
          pc._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === te.track.id;
                });
              } else {
                receiver = {track: te.track};
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === track.id;
                });
              } else {
                receiver = {track: track};
              }
              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
          };
          pc.addEventListener('addstream', pc._ontrackpoly);
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    } else if (!('RTCRtpTransceiver' in window)) {
      utils.wrapPeerConnectionEvent(window, 'track', function(e) {
        if (!e.transceiver) {
          e.transceiver = {receiver: e.receiver};
        }
        return e;
      });
    }
  },

  shimGetSendersWithDtmf: function(window) {
    // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
    if (typeof window === 'object' && window.RTCPeerConnection &&
        !('getSenders' in window.RTCPeerConnection.prototype) &&
        'createDTMFSender' in window.RTCPeerConnection.prototype) {
      var shimSenderWithDtmf = function(pc, track) {
        return {
          track: track,
          get dtmf() {
            if (this._dtmf === undefined) {
              if (track.kind === 'audio') {
                this._dtmf = pc.createDTMFSender(track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          },
          _pc: pc
        };
      };

      // augment addTrack when getSenders is not available.
      if (!window.RTCPeerConnection.prototype.getSenders) {
        window.RTCPeerConnection.prototype.getSenders = function() {
          this._senders = this._senders || [];
          return this._senders.slice(); // return a copy of the internal state.
        };
        var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
          var pc = this;
          var sender = origAddTrack.apply(pc, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(pc, track);
            pc._senders.push(sender);
          }
          return sender;
        };

        var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
        window.RTCPeerConnection.prototype.removeTrack = function(sender) {
          var pc = this;
          origRemoveTrack.apply(pc, arguments);
          var idx = pc._senders.indexOf(sender);
          if (idx !== -1) {
            pc._senders.splice(idx, 1);
          }
        };
      }
      var origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origAddStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          pc._senders.push(shimSenderWithDtmf(pc, track));
        });
      };

      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origRemoveStream.apply(pc, [stream]);

        stream.getTracks().forEach(function(track) {
          var sender = pc._senders.find(function(s) {
            return s.track === track;
          });
          if (sender) {
            pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
          }
        });
      };
    } else if (typeof window === 'object' && window.RTCPeerConnection &&
               'getSenders' in window.RTCPeerConnection.prototype &&
               'createDTMFSender' in window.RTCPeerConnection.prototype &&
               window.RTCRtpSender &&
               !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };

      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
  },

  shimSourceObject: function(window) {
    var URL = window && window.URL;

    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return undefined;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimAddTrackRemoveTrackWithNative: function(window) {
    // shim addTrack/removeTrack with native variants in order to make
    // the interactions with legacy getLocalStreams behave as in other browsers.
    // Keeps a mapping stream.id => [stream, rtpsenders...]
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map(function(streamId) {
        return pc._shimmedLocalStreams[streamId][0];
      });
    };

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      var sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      var existingSenders = pc.getSenders();
      origAddStream.apply(this, arguments);
      var newSenders = pc.getSenders().filter(function(newSender) {
        return existingSenders.indexOf(newSender) === -1;
      });
      this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

    var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(function(streamId) {
          var idx = pc._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            pc._shimmedLocalStreams[streamId].splice(idx, 1);
          }
          if (pc._shimmedLocalStreams[streamId].length === 1) {
            delete pc._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
  },

  shimAddTrackRemoveTrack: function(window) {
    var browserDetails = utils.detectBrowser(window);
    // shim addTrack and removeTrack.
    if (window.RTCPeerConnection.prototype.addTrack &&
        browserDetails.version >= 65) {
      return this.shimAddTrackRemoveTrackWithNative(window);
    }

    // also shim pc.getLocalStreams when addTrack is shimmed
    // to return the original streams.
    var origGetLocalStreams = window.RTCPeerConnection.prototype
        .getLocalStreams;
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      var nativeStreams = origGetLocalStreams.apply(this);
      pc._reverseStreams = pc._reverseStreams || {};
      return nativeStreams.map(function(stream) {
        return pc._reverseStreams[stream.id];
      });
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      // Add identity mapping for consistency with addTrack.
      // Unless this is being used with a stream from addTrack.
      if (!pc._reverseStreams[stream.id]) {
        var newStream = new window.MediaStream(stream.getTracks());
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }
      origAddStream.apply(pc, [stream]);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      origRemoveStream.apply(pc, [(pc._streams[stream.id] || stream)]);
      delete pc._reverseStreams[(pc._streams[stream.id] ?
          pc._streams[stream.id].id : stream.id)];
      delete pc._streams[stream.id];
    };

    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      var streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 ||
          !streams[0].getTracks().find(function(t) {
            return t === track;
          })) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException(
          'The adapter.js addTrack polyfill only supports a single ' +
          ' stream which is associated with the specified track.',
          'NotSupportedError');
      }

      var alreadyExists = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }

      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};
      var oldStream = pc._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(function() {
          pc.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        var newStream = new window.MediaStream([track]);
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        pc.addStream(newStream);
      }
      return pc.getSenders().find(function(s) {
        return s.track === track;
      });
    };

    // replace the internal stream id with the external one and
    // vice versa.
    function replaceInternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
            externalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    function replaceExternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
            internalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = window.RTCPeerConnection.prototype[method];
      window.RTCPeerConnection.prototype[method] = function() {
        var pc = this;
        var args = arguments;
        var isLegacyCall = arguments.length &&
            typeof arguments[0] === 'function';
        if (isLegacyCall) {
          return nativeMethod.apply(pc, [
            function(description) {
              var desc = replaceInternalStreamId(pc, description);
              args[0].apply(null, [desc]);
            },
            function(err) {
              if (args[1]) {
                args[1].apply(null, err);
              }
            }, arguments[2]
          ]);
        }
        return nativeMethod.apply(pc, arguments)
        .then(function(description) {
          return replaceInternalStreamId(pc, description);
        });
      };
    });

    var origSetLocalDescription =
        window.RTCPeerConnection.prototype.setLocalDescription;
    window.RTCPeerConnection.prototype.setLocalDescription = function() {
      var pc = this;
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(pc, arguments);
      }
      arguments[0] = replaceExternalStreamId(pc, arguments[0]);
      return origSetLocalDescription.apply(pc, arguments);
    };

    // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

    var origLocalDescription = Object.getOwnPropertyDescriptor(
        window.RTCPeerConnection.prototype, 'localDescription');
    Object.defineProperty(window.RTCPeerConnection.prototype,
        'localDescription', {
          get: function() {
            var pc = this;
            var description = origLocalDescription.get.apply(this);
            if (description.type === '') {
              return description;
            }
            return replaceInternalStreamId(pc, description);
          }
        });

    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
            'does not implement interface RTCRtpSender.', 'TypeError');
      }
      var isLocal = sender._pc === pc;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.',
            'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      pc._streams = pc._streams || {};
      var stream;
      Object.keys(pc._streams).forEach(function(streamid) {
        var hasTrack = pc._streams[streamid].getTracks().find(function(track) {
          return sender.track === track;
        });
        if (hasTrack) {
          stream = pc._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          pc.removeStream(pc._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
        }
        pc.dispatchEvent(new Event('negotiationneeded'));
      }
    };
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        // Translate iceTransportPolicy to iceTransports,
        // see https://code.google.com/p/webrtc/issues/detail?id=4869
        // this was fixed in M56 along with unprefixing RTCPeerConnection.
        logging('PeerConnection');
        if (pcConfig && pcConfig.iceTransportPolicy) {
          pcConfig.iceTransports = pcConfig.iceTransportPolicy;
        }

        return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.webkitRTCPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      if (window.webkitRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.webkitRTCPeerConnection.generateCertificate;
          }
        });
      }
    } else {
      // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
      var OrigPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (pcConfig && pcConfig.iceServers) {
          var newIceServers = [];
          for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (!server.hasOwnProperty('urls') &&
                server.hasOwnProperty('url')) {
              utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
              server = JSON.parse(JSON.stringify(server));
              server.urls = server.url;
              newIceServers.push(server);
            } else {
              newIceServers.push(pcConfig.iceServers[i]);
            }
          }
          pcConfig.iceServers = newIceServers;
        }
        return new OrigPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }

    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(selector,
        successCallback, errorCallback) {
      var pc = this;
      var args = arguments;

      // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.
      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      }

      // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.
      if (origGetStats.length === 0 && (arguments.length === 0 ||
          typeof arguments[0] !== 'function')) {
        return origGetStats.apply(this, []);
      }

      var fixChromeStats_ = function(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function(report) {
          var standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[report.type] || report.type
          };
          report.names().forEach(function(name) {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });

        return standardReport;
      };

      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        return new Map(Object.keys(stats).map(function(key) {
          return [key, stats[key]];
        }));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function(response) {
          args[1](makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_,
          arguments[0]]);
      }

      // promise-support
      return new Promise(function(resolve, reject) {
        origGetStats.apply(pc, [
          function(response) {
            resolve(makeMapStats(fixChromeStats_(response)));
          }, reject]);
      }).then(successCallback, errorCallback);
    };

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var pc = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(pc, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // promise support for createOffer and createAnswer. Available (without
    // bugs) since M52: crbug/619289
    if (browserDetails.version < 52) {
      ['createOffer', 'createAnswer'].forEach(function(method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        window.RTCPeerConnection.prototype[method] = function() {
          var pc = this;
          if (arguments.length < 1 || (arguments.length === 1 &&
              typeof arguments[0] === 'object')) {
            var opts = arguments.length === 1 ? arguments[0] : undefined;
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(pc, [resolve, reject, opts]);
            });
          }
          return nativeMethod.apply(this, arguments);
        };
      });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }
};

},{"../utils.js":13,"./getusermedia":6}],6:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;

  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      var remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      var getSupportedFacingModeLies = browserDetails.version < 66;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        var matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var dev = devices.find(function(d) {
              return matches.some(function(match) {
                return d.label.toLowerCase().indexOf(match) !== -1;
              });
            });
            if (!dev && devices.length && matches.indexOf('back') !== -1) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        PermissionDismissedError: 'NotAllowedError',
        InvalidStateError: 'NotAllowedError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotAllowedError',
        MediaDeviceKillSwitchOn: 'NotAllowedError',
        TabCaptureError: 'AbortError',
        ScreenCaptureError: 'AbortError',
        DeviceCaptureError: 'AbortError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return window.MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                kind: kinds[device.kind],
                deviceId: device.id,
                groupId: ''};
            }));
          });
        });
      },
      getSupportedConstraints: function() {
        return {
          deviceId: true, echoCancellation: true, facingMode: true,
          frameRate: true, height: true, width: true
        };
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":13}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var utils = require('./utils');

module.exports = {
  shimRTCIceCandidate: function(window) {
    // foundation is arbitrarily chosen as an indicator for full support for
    // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
    if (!window.RTCIceCandidate || (window.RTCIceCandidate && 'foundation' in
        window.RTCIceCandidate.prototype)) {
      return;
    }

    var NativeRTCIceCandidate = window.RTCIceCandidate;
    window.RTCIceCandidate = function(args) {
      // Remove the a= which shouldn't be part of the candidate string.
      if (typeof args === 'object' && args.candidate &&
          args.candidate.indexOf('a=') === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }

      if (args.candidate && args.candidate.length) {
        // Augment the native candidate with the parsed fields.
        var nativeCandidate = new NativeRTCIceCandidate(args);
        var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
        var augmentedCandidate = Object.assign(nativeCandidate,
            parsedCandidate);

        // Add a serializer that does not serialize the extra attributes.
        augmentedCandidate.toJSON = function() {
          return {
            candidate: augmentedCandidate.candidate,
            sdpMid: augmentedCandidate.sdpMid,
            sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
            usernameFragment: augmentedCandidate.usernameFragment,
          };
        };
        return augmentedCandidate;
      }
      return new NativeRTCIceCandidate(args);
    };
    window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

    // Hook up the augmented candidate in onicecandidate and
    // addEventListener('icecandidate', ...)
    utils.wrapPeerConnectionEvent(window, 'icecandidate', function(e) {
      if (e.candidate) {
        Object.defineProperty(e, 'candidate', {
          value: new window.RTCIceCandidate(e.candidate),
          writable: 'false'
        });
      }
      return e;
    });
  },

  // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

  shimCreateObjectURL: function(window) {
    var URL = window && window.URL;

    if (!(typeof window === 'object' && window.HTMLMediaElement &&
          'srcObject' in window.HTMLMediaElement.prototype &&
        URL.createObjectURL && URL.revokeObjectURL)) {
      // Only shim CreateObjectURL using srcObject if srcObject exists.
      return undefined;
    }

    var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
    var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    var streams = new Map(), newId = 0;

    URL.createObjectURL = function(stream) {
      if ('getTracks' in stream) {
        var url = 'polyblob:' + (++newId);
        streams.set(url, stream);
        utils.deprecated('URL.createObjectURL(stream)',
            'elem.srcObject = stream');
        return url;
      }
      return nativeCreateObjectURL(stream);
    };
    URL.revokeObjectURL = function(url) {
      nativeRevokeObjectURL(url);
      streams.delete(url);
    };

    var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                                              'src');
    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
      get: function() {
        return dsc.get.apply(this);
      },
      set: function(url) {
        this.srcObject = streams.get(url) || null;
        return dsc.set.apply(this, [url]);
      }
    });

    var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
    window.HTMLMediaElement.prototype.setAttribute = function() {
      if (arguments.length === 2 &&
          ('' + arguments[0]).toLowerCase() === 'src') {
        this.srcObject = streams.get(arguments[1]) || null;
      }
      return nativeSetAttribute.apply(this, arguments);
    };
  },

  shimMaxMessageSize: function(window) {
    if (window.RTCSctpTransport || !window.RTCPeerConnection) {
      return;
    }
    var browserDetails = utils.detectBrowser(window);

    if (!('sctp' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
        get: function() {
          return typeof this._sctp === 'undefined' ? null : this._sctp;
        }
      });
    }

    var sctpInDescription = function(description) {
      var sections = SDPUtils.splitSections(description.sdp);
      sections.shift();
      return sections.some(function(mediaSection) {
        var mLine = SDPUtils.parseMLine(mediaSection);
        return mLine && mLine.kind === 'application'
            && mLine.protocol.indexOf('SCTP') !== -1;
      });
    };

    var getRemoteFirefoxVersion = function(description) {
      // TODO: Is there a better solution for detecting Firefox?
      var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (match === null || match.length < 2) {
        return -1;
      }
      var version = parseInt(match[1], 10);
      // Test for NaN (yes, this is ugly)
      return version !== version ? -1 : version;
    };

    var getCanSendMaxMessageSize = function(remoteIsFirefox) {
      // Every implementation we know can send at least 64 KiB.
      // Note: Although Chrome is technically able to send up to 256 KiB, the
      //       data does not reach the other peer reliably.
      //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
      var canSendMaxMessageSize = 65536;
      if (browserDetails.browser === 'firefox') {
        if (browserDetails.version < 57) {
          if (remoteIsFirefox === -1) {
            // FF < 57 will send in 16 KiB chunks using the deprecated PPID
            // fragmentation.
            canSendMaxMessageSize = 16384;
          } else {
            // However, other FF (and RAWRTC) can reassemble PPID-fragmented
            // messages. Thus, supporting ~2 GiB when sending.
            canSendMaxMessageSize = 2147483637;
          }
        } else {
          // Currently, all FF >= 57 will reset the remote maximum message size
          // to the default value when a data channel is created at a later
          // stage. :(
          // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
          canSendMaxMessageSize =
            browserDetails.version === 57 ? 65535 : 65536;
        }
      }
      return canSendMaxMessageSize;
    };

    var getMaxMessageSize = function(description, remoteIsFirefox) {
      // Note: 65536 bytes is the default value from the SDP spec. Also,
      //       every implementation we know supports receiving 65536 bytes.
      var maxMessageSize = 65536;

      // FF 57 has a slightly incorrect default remote max message size, so
      // we need to adjust it here to avoid a failure when sending.
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
      if (browserDetails.browser === 'firefox'
           && browserDetails.version === 57) {
        maxMessageSize = 65535;
      }

      var match = SDPUtils.matchPrefix(description.sdp, 'a=max-message-size:');
      if (match.length > 0) {
        maxMessageSize = parseInt(match[0].substr(19), 10);
      } else if (browserDetails.browser === 'firefox' &&
                  remoteIsFirefox !== -1) {
        // If the maximum message size is not present in the remote SDP and
        // both local and remote are Firefox, the remote peer can receive
        // ~2 GiB.
        maxMessageSize = 2147483637;
      }
      return maxMessageSize;
    };

    var origSetRemoteDescription =
        window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription = function() {
      var pc = this;
      pc._sctp = null;

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        var isFirefox = getRemoteFirefoxVersion(arguments[0]);

        // Get the maximum message size the local peer is capable of sending
        var canSendMMS = getCanSendMaxMessageSize(isFirefox);

        // Get the maximum message size of the remote peer.
        var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

        // Determine final maximum message size
        var maxMessageSize;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }

        // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.
        var sctp = {};
        Object.defineProperty(sctp, 'maxMessageSize', {
          get: function() {
            return maxMessageSize;
          }
        });
        pc._sctp = sctp;
      }

      return origSetRemoteDescription.apply(pc, arguments);
    };
  },

  shimSendThrowTypeError: function(window) {
    if (!(window.RTCPeerConnection &&
        'createDataChannel' in window.RTCPeerConnection.prototype)) {
      return;
    }

    // Note: Although Firefox >= 57 has a native implementation, the maximum
    //       message size can be reset for all data channels at a later stage.
    //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

    var origCreateDataChannel =
      window.RTCPeerConnection.prototype.createDataChannel;
    window.RTCPeerConnection.prototype.createDataChannel = function() {
      var pc = this;
      var dataChannel = origCreateDataChannel.apply(pc, arguments);
      var origDataChannelSend = dataChannel.send;

      // Patch 'send' method
      dataChannel.send = function() {
        var dc = this;
        var data = arguments[0];
        var length = data.length || data.size || data.byteLength;
        if (length > pc.sctp.maxMessageSize) {
          throw new DOMException('Message too large (can send a maximum of ' +
            pc.sctp.maxMessageSize + ' bytes)', 'TypeError');
        }
        return origDataChannelSend.apply(dc, arguments);
      };

      return dataChannel;
    };
  }
};

},{"./utils":13,"sdp":2}],8:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var shimRTCPeerConnection = require('rtcpeerconnection-shim');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (window.RTCIceGatherer) {
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed. Workaround for a bug in
      // addStream, see below. No longer required in 15025+
      if (browserDetails.version < 15025) {
        var origMSTEnabled = Object.getOwnPropertyDescriptor(
            window.MediaStreamTrack.prototype, 'enabled');
        Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
          set: function(value) {
            origMSTEnabled.set.call(this, value);
            var ev = new Event('enabled');
            ev.enabled = value;
            this.dispatchEvent(ev);
          }
        });
      }
    }

    // ORTC defines the DTMF sender a bit different.
    // https://github.com/w3c/ortc/issues/714
    if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = new window.RTCDtmfSender(this);
            } else if (this.track.kind === 'video') {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
    // Edge currently only implements the RTCDtmfSender, not the
    // RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
    if (window.RTCDtmfSender && !window.RTCDTMFSender) {
      window.RTCDTMFSender = window.RTCDtmfSender;
    }

    window.RTCPeerConnection =
        shimRTCPeerConnection(window, browserDetails.version);
  },
  shimReplaceTrack: function(window) {
    // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
    if (window.RTCRtpSender &&
        !('replaceTrack' in window.RTCRtpSender.prototype)) {
      window.RTCRtpSender.prototype.replaceTrack =
          window.RTCRtpSender.prototype.setTrack;
    }
  }
};

},{"../utils":13,"./getusermedia":9,"rtcpeerconnection-shim":1}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function(window) {
  var navigator = window && window.navigator;

  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};

},{}],10:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.transceiver = {receiver: event.receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
    if (typeof window === 'object' && window.RTCTrackEvent &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimSourceObject: function(window) {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (window.mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = window.mozRTCSessionDescription;
      window.RTCIceCandidate = window.mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(
      selector,
      onSucc,
      onErr
    ) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          if (browserDetails.version < 48) {
            stats = makeMapStats(stats);
          }
          if (browserDetails.version < 53 && !onSucc) {
            // Shim only promise getStats with spec-hyphens in type names
            // Leave callback version alone; misc old uses of forEach before Map
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== 'TypeError') {
                throw e;
              }
              // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        })
        .then(onSucc, onErr);
    };
  },

  shimRemoveStream: function(window) {
    if (!window.RTCPeerConnection ||
        'removeStream' in window.RTCPeerConnection.prototype) {
      return;
    }
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      utils.deprecated('removeStream', 'removeTrack');
      this.getSenders().forEach(function(sender) {
        if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
          pc.removeTrack(sender);
        }
      });
    };
  }
};

},{"../utils":13,"./getusermedia":11}],11:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;
  var MediaStreamTrack = window && window.MediaStreamTrack;

  var shimError_ = function(e) {
    return {
      name: {
        InternalError: 'NotReadableError',
        NotSupportedError: 'TypeError',
        PermissionDeniedError: 'NotAllowedError',
        SecurityError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    var remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        var obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    utils.deprecated('navigator.getUserMedia',
        'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":13}],12:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var utils = require('../utils');

module.exports = {
  shimLocalStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getLocalStreams = function() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getStreamById = function(id) {
        var result = null;
        if (this._localStreams) {
          this._localStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        if (this._remoteStreams) {
          this._remoteStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        return result;
      };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (this._localStreams.indexOf(stream) === -1) {
          this._localStreams.push(stream);
        }
        var pc = this;
        stream.getTracks().forEach(function(track) {
          _addTrack.call(pc, track, stream);
        });
      };

      window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
        if (stream) {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (this._localStreams.indexOf(stream) === -1) {
            this._localStreams.push(stream);
          }
        }
        return _addTrack.call(this, track, stream);
      };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        var index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        var pc = this;
        var tracks = stream.getTracks();
        this.getSenders().forEach(function(sender) {
          if (tracks.indexOf(sender.track) !== -1) {
            pc.removeTrack(sender);
          }
        });
      };
    }
  },
  shimRemoteStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getRemoteStreams = function() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
        get: function() {
          return this._onaddstream;
        },
        set: function(f) {
          var pc = this;
          if (this._onaddstream) {
            this.removeEventListener('addstream', this._onaddstream);
            this.removeEventListener('track', this._onaddstreampoly);
          }
          this.addEventListener('addstream', this._onaddstream = f);
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            e.streams.forEach(function(stream) {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
              }
              if (pc._remoteStreams.indexOf(stream) >= 0) {
                return;
              }
              pc._remoteStreams.push(stream);
              var event = new Event('addstream');
              event.stream = stream;
              pc.dispatchEvent(event);
            });
          });
        }
      });
    }
  },
  shimCallbacksAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var createOffer = prototype.createOffer;
    var createAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
  },
  shimGetUserMedia: function(window) {
    var navigator = window && window.navigator;

    if (!navigator.getUserMedia) {
      if (navigator.webkitGetUserMedia) {
        navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
      } else if (navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia = function(constraints, cb, errcb) {
          navigator.mediaDevices.getUserMedia(constraints)
          .then(cb, errcb);
        }.bind(navigator);
      }
    }
  },
  shimRTCIceServerUrls: function(window) {
    // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
    var OrigPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        var newIceServers = [];
        for (var i = 0; i < pcConfig.iceServers.length; i++) {
          var server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty('urls') &&
              server.hasOwnProperty('url')) {
            utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
    window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
    // wrap static methods. Currently just generateCertificate.
    if ('generateCertificate' in window.RTCPeerConnection) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }
  },
  shimTrackEventTransceiver: function(window) {
    // Add event.transceiver member over deprecated event.receiver
    if (typeof window === 'object' && window.RTCPeerConnection &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
        // defined for some reason even when window.RTCTransceiver is not.
        !window.RTCTransceiver) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimCreateOfferLegacy: function(window) {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function(offerOptions) {
      var pc = this;
      if (offerOptions) {
        if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
        }
        var audioTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'audio';
        });
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('sendonly');
            } else {
              audioTransceiver.direction = 'sendonly';
            }
          } else if (audioTransceiver.direction === 'recvonly') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('inactive');
            } else {
              audioTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveAudio === true &&
            !audioTransceiver) {
          pc.addTransceiver('audio');
        }


        if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
        }
        var videoTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'video';
        });
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            videoTransceiver.setDirection('sendonly');
          } else if (videoTransceiver.direction === 'recvonly') {
            videoTransceiver.setDirection('inactive');
          }
        } else if (offerOptions.offerToReceiveVideo === true &&
            !videoTransceiver) {
          pc.addTransceiver('video');
        }
      }
      return origCreateOffer.apply(pc, arguments);
    };
  }
};

},{"../utils":13}],13:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;
var deprecationWarnings_ = true;

/**
 * Extract browser version out of the provided user agent string.
 *
 * @param {!string} uastring userAgent string.
 * @param {!string} expr Regular expression used as match criteria.
 * @param {!number} pos position in the version string to be returned.
 * @return {!number} browser version.
 */
function extractVersion(uastring, expr, pos) {
  var match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object.
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  var proto = window.RTCPeerConnection.prototype;
  var nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    var wrappedCallback = function(e) {
      cb(wrapper(e));
    };
    this._eventMap = this._eventMap || {};
    this._eventMap[cb] = wrappedCallback;
    return nativeAddEventListener.apply(this, [nativeEventName,
      wrappedCallback]);
  };

  var nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap
        || !this._eventMap[cb]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    var unwrappedCb = this._eventMap[cb];
    delete this._eventMap[cb];
    return nativeRemoveEventListener.apply(this, [nativeEventName,
      unwrappedCb]);
  };

  Object.defineProperty(proto, 'on' + eventNameToWrap, {
    get: function() {
      return this['_on' + eventNameToWrap];
    },
    set: function(cb) {
      if (this['_on' + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap]);
        delete this['_on' + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap] = cb);
      }
    }
  });
}

// Utility methods.
module.exports = {
  extractVersion: extractVersion,
  wrapPeerConnectionEvent: wrapPeerConnectionEvent,
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  /**
   * Disable or enable deprecation warnings
   * @param {!boolean} bool set to true to disable warnings.
   */
  disableWarnings: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    deprecationWarnings_ = !bool;
    return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Shows a deprecation warning suggesting the modern and spec-compatible API.
   */
  deprecated: function(oldMethod, newMethod) {
    if (!deprecationWarnings_) {
      return;
    }
    console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
        ' instead.');
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function(window) {
    var navigator = window && window.navigator;

    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    if (navigator.mozGetUserMedia) { // Firefox.
      result.browser = 'firefox';
      result.version = extractVersion(navigator.userAgent,
          /Firefox\/(\d+)\./, 1);
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera.
      // Version matches Chrome/WebRTC version.
      result.browser = 'chrome';
      result.version = extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/(\d+)\./, 2);
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
      result.browser = 'edge';
      result.version = extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
    } else if (window.RTCPeerConnection &&
        navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) { // Safari.
      result.browser = 'safari';
      result.version = extractVersion(navigator.userAgent,
          /AppleWebKit\/(\d+)\./, 1);
    } else { // Default fallthrough: not supported.
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }
};

},{}]},{},[3])(3)
});

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _webar = require('./webar');

var _webar2 = _interopRequireDefault(_webar);

var _vconsole = require('./vconsole.min');

var _vconsole2 = _interopRequireDefault(_vconsole);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _vconsole2.default();

var ua = navigator.userAgent.toLowerCase(),
    isAndroid = /android/i.test(ua),
    isIphone = /(iPhone|iPad|iPod|iOS)/i.test(ua),
    isWeChat = /MicroMessenger/i.test(ua);

var webAR = new _webar2.default(1000, '/recognize.php');
var openCamera = $("#openCamera");
var video = $('#video')[0];
var deviceId = void 0; //指定调用设备ID

console.log(ua);
console.log('isWebcart', isAndroid);

if (isIphone && isWeChat) {}

// 列出视频设备
webAR.listCamera().then(function (videoDevice) {
    console.log(videoDevice);
    //测了一些手机，android后置摄像头应该是数组的最后一个，苹果是第一个
    if (isAndroid) {
        console.log('android');
        deviceId = videoDevice[videoDevice.length - 1].deviceId;
    } else if (isIphone) {
        deviceId = videoDevice[0].deviceId;
    }
}).catch(function (err) {
    console.log(err);
    alert('该设备不支持打开摄像头');
});

openCamera.on('click', function () {
    webAR.openCamera(video, deviceId).then(function (msg) {
        // 打开摄像头成功
        // 将视频铺满全屏(简单处理)
        window.setTimeout(function () {
            var videoWidth = video.offsetWidth;
            var videoHeight = video.offsetHeight;

            if (window.innerWidth < window.innerHeight) {
                // 竖屏
                if (videoHeight < window.innerHeight) {
                    video.setAttribute('height', window.innerHeight.toString() + 'px');
                }
            } else {
                // 横屏
                if (videoWidth < window.innerWidth) {
                    video.setAttribute('width', window.innerWidth.toString() + 'px');
                }
            }
        }, 500);
        openCamera.hide();
    }).catch(function (err) {
        alert('打开视频设备失败');
    });
});

},{"./vconsole.min":2,"./webar":3}],2:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * vConsole v3.2.0 (https://github.com/Tencent/vConsole)
 * 
 * Tencent is pleased to support the open source community by making vConsole available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
!function (e, t) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? exports.VConsole = t() : e.VConsole = t();
}(undefined, function () {
  return function (e) {
    function t(n) {
      if (o[n]) return o[n].exports;var i = o[n] = { exports: {}, id: n, loaded: !1 };return e[n].call(i.exports, i, i.exports, t), i.loaded = !0, i.exports;
    }var o = {};return t.m = e, t.c = o, t.p = "", t(0);
  }([function (e, t, o) {
    "use strict";
    function n(e) {
      return e && e.__esModule ? e : { "default": e };
    }Object.defineProperty(t, "__esModule", { value: !0 }), o(1);var i = o(2),
        a = n(i),
        r = o(18),
        l = n(r);a["default"].VConsolePlugin = l["default"], t["default"] = a["default"], e.exports = t["default"];
  }, function (e, t) {
    "use strict";
    if ("undefined" == typeof Symbol) {
      window.Symbol = function () {};var o = "__symbol_iterator_key";window.Symbol.iterator = o, Array.prototype[o] = function () {
        var e = this,
            t = 0;return { next: function next() {
            return { done: e.length === t, value: e.length === t ? void 0 : e[t++] };
          } };
      };
    }
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var o in e) {
        Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
      }return t["default"] = e, t;
    }function i(e) {
      return e && e.__esModule ? e : { "default": e };
    }function a(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }Object.defineProperty(t, "__esModule", { value: !0 });var r = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }(),
        l = o(3),
        c = i(l),
        s = o(4),
        d = n(s),
        u = o(5),
        v = i(u);o(7);var f = o(11),
        p = i(f),
        h = o(12),
        g = i(h),
        b = o(13),
        m = i(b),
        y = o(14),
        _ = i(y),
        w = o(15),
        x = i(w),
        k = o(16),
        C = i(k),
        T = o(24),
        O = i(T),
        E = o(26),
        S = i(E),
        L = o(30),
        j = i(L),
        N = o(37),
        P = i(N),
        M = "#__vconsole",
        A = function () {
      function e(t) {
        if (a(this, e), v["default"].one(M)) return void console.debug("vConsole is already exists.");var o = this;if (this.version = c["default"].version, this.$dom = null, this.isInited = !1, this.option = { defaultPlugins: ["system", "network", "element", "storage"] }, this.activedTab = "", this.tabList = [], this.pluginList = {}, this.switchPos = { x: 10, y: 10, startX: 0, startY: 0, endX: 0, endY: 0 }, this.tool = d, this.$ = v["default"], d.isObject(t)) for (var n in t) {
          this.option[n] = t[n];
        }this._addBuiltInPlugins();var i = function i() {
          o.isInited || (o._render(), o._mockTap(), o._bindEvent(), o._autoRun());
        };void 0 !== document ? "complete" == document.readyState ? i() : v["default"].bind(window, "load", i) : !function () {
          var e = void 0,
              t = function o() {
            document && "complete" == document.readyState ? (e && clearTimeout(e), i()) : e = setTimeout(o, 1);
          };e = setTimeout(t, 1);
        }();
      }return r(e, [{ key: "_addBuiltInPlugins", value: function value() {
          this.addPlugin(new C["default"]("default", "Log"));var e = this.option.defaultPlugins,
              t = { system: { proto: O["default"], name: "System" }, network: { proto: S["default"], name: "Network" }, element: { proto: j["default"], name: "Element" }, storage: { proto: P["default"], name: "Storage" } };if (e && d.isArray(e)) for (var o = 0; o < e.length; o++) {
            var n = t[e[o]];n ? this.addPlugin(new n.proto(e[o], n.name)) : console.debug("Unrecognized default plugin ID:", e[o]);
          }
        } }, { key: "_render", value: function value() {
          if (!v["default"].one(M)) {
            var e = document.createElement("div");e.innerHTML = p["default"], document.documentElement.insertAdjacentElement("beforeend", e.children[0]);
          }this.$dom = v["default"].one(M);var t = v["default"].one(".vc-switch", this.$dom),
              o = 1 * d.getStorage("switch_x"),
              n = 1 * d.getStorage("switch_y");(o || n) && (o + t.offsetWidth > document.documentElement.offsetWidth && (o = document.documentElement.offsetWidth - t.offsetWidth), n + t.offsetHeight > document.documentElement.offsetHeight && (n = document.documentElement.offsetHeight - t.offsetHeight), 0 > o && (o = 0), 0 > n && (n = 0), this.switchPos.x = o, this.switchPos.y = n, v["default"].one(".vc-switch").style.right = o + "px", v["default"].one(".vc-switch").style.bottom = n + "px");var i = window.devicePixelRatio || 1,
              a = document.querySelector('[name="viewport"]');if (a && a.content) {
            var r = a.content.match(/initial\-scale\=\d+(\.\d+)?/),
                l = r ? parseFloat(r[0].split("=")[1]) : 1;1 > l && (this.$dom.style.fontSize = 13 * i + "px");
          }v["default"].one(".vc-mask", this.$dom).style.display = "none";
        } }, { key: "_mockTap", value: function value() {
          var e = 700,
              t = 10,
              o = void 0,
              n = void 0,
              i = void 0,
              a = !1,
              r = null;this.$dom.addEventListener("touchstart", function (e) {
            if (void 0 === o) {
              var t = e.targetTouches[0];n = t.pageX, i = t.pageY, o = e.timeStamp, r = e.target.nodeType === Node.TEXT_NODE ? e.target.parentNode : e.target;
            }
          }, !1), this.$dom.addEventListener("touchmove", function (e) {
            var o = e.changedTouches[0];(Math.abs(o.pageX - n) > t || Math.abs(o.pageY - i) > t) && (a = !0);
          }), this.$dom.addEventListener("touchend", function (t) {
            if (a === !1 && t.timeStamp - o < e && null != r) {
              var n = r.tagName.toLowerCase(),
                  i = !1;switch (n) {case "textarea":
                  i = !0;break;case "input":
                  switch (r.type) {case "button":case "checkbox":case "file":case "image":case "radio":case "submit":
                      i = !1;break;default:
                      i = !r.disabled && !r.readOnly;}}i ? r.focus() : t.preventDefault();var l = t.changedTouches[0],
                  c = document.createEvent("MouseEvents");c.initMouseEvent("click", !0, !0, window, 1, l.screenX, l.screenY, l.clientX, l.clientY, !1, !1, !1, !1, 0, null), c.forwardedTouchEvent = !0, c.initEvent("click", !0, !0), r.dispatchEvent(c);
            }o = void 0, a = !1, r = null;
          }, !1);
        } }, { key: "_bindEvent", value: function value() {
          var e = this,
              t = v["default"].one(".vc-switch", e.$dom);v["default"].bind(t, "touchstart", function (t) {
            e.switchPos.startX = t.touches[0].pageX, e.switchPos.startY = t.touches[0].pageY;
          }), v["default"].bind(t, "touchend", function (t) {
            e.switchPos.x = e.switchPos.endX, e.switchPos.y = e.switchPos.endY, e.switchPos.startX = 0, e.switchPos.startY = 0, e.switchPos.endX = 0, e.switchPos.endY = 0, d.setStorage("switch_x", e.switchPos.x), d.setStorage("switch_y", e.switchPos.y);
          }), v["default"].bind(t, "touchmove", function (o) {
            if (o.touches.length > 0) {
              var n = o.touches[0].pageX - e.switchPos.startX,
                  i = o.touches[0].pageY - e.switchPos.startY,
                  a = e.switchPos.x - n,
                  r = e.switchPos.y - i;a + t.offsetWidth > document.documentElement.offsetWidth && (a = document.documentElement.offsetWidth - t.offsetWidth), r + t.offsetHeight > document.documentElement.offsetHeight && (r = document.documentElement.offsetHeight - t.offsetHeight), 0 > a && (a = 0), 0 > r && (r = 0), t.style.right = a + "px", t.style.bottom = r + "px", e.switchPos.endX = a, e.switchPos.endY = r, o.preventDefault();
            }
          }), v["default"].bind(v["default"].one(".vc-switch", e.$dom), "click", function () {
            e.show();
          }), v["default"].bind(v["default"].one(".vc-hide", e.$dom), "click", function () {
            e.hide();
          }), v["default"].bind(v["default"].one(".vc-mask", e.$dom), "click", function (t) {
            return t.target != v["default"].one(".vc-mask") ? !1 : void e.hide();
          }), v["default"].delegate(v["default"].one(".vc-tabbar", e.$dom), "click", ".vc-tab", function (t) {
            var o = this.dataset.tab;o != e.activedTab && e.showTab(o);
          }), v["default"].bind(v["default"].one(".vc-panel", e.$dom), "transitionend webkitTransitionEnd oTransitionEnd otransitionend", function (t) {
            return t.target != v["default"].one(".vc-panel") ? !1 : void (v["default"].hasClass(e.$dom, "vc-toggle") || (t.target.style.display = "none"));
          });var o = v["default"].one(".vc-content", e.$dom),
              n = !1;v["default"].bind(o, "touchstart", function (e) {
            var t = o.scrollTop,
                i = o.scrollHeight,
                a = t + o.offsetHeight;0 === t ? (o.scrollTop = 1, 0 === o.scrollTop && (v["default"].hasClass(e.target, "vc-cmd-input") || (n = !0))) : a === i && (o.scrollTop = t - 1, o.scrollTop === t && (v["default"].hasClass(e.target, "vc-cmd-input") || (n = !0)));
          }), v["default"].bind(o, "touchmove", function (e) {
            n && e.preventDefault();
          }), v["default"].bind(o, "touchend", function (e) {
            n = !1;
          });
        } }, { key: "_autoRun", value: function value() {
          this.isInited = !0;for (var e in this.pluginList) {
            this._initPlugin(this.pluginList[e]);
          }this.tabList.length > 0 && this.showTab(this.tabList[0]), this.triggerEvent("ready");
        } }, { key: "triggerEvent", value: function value(e, t) {
          e = "on" + e.charAt(0).toUpperCase() + e.slice(1), d.isFunction(this.option[e]) && this.option[e].apply(this, t);
        } }, { key: "_initPlugin", value: function value(e) {
          var t = this;e.vConsole = this, e.trigger("init"), e.trigger("renderTab", function (o) {
            t.tabList.push(e.id);var n = v["default"].render(g["default"], { id: e.id, name: e.name });v["default"].one(".vc-tabbar", t.$dom).insertAdjacentElement("beforeend", n);var i = v["default"].render(m["default"], { id: e.id });o && (d.isString(o) ? i.innerHTML += o : d.isFunction(o.appendTo) ? o.appendTo(i) : d.isElement(o) && i.insertAdjacentElement("beforeend", o)), v["default"].one(".vc-content", t.$dom).insertAdjacentElement("beforeend", i);
          }), e.trigger("addTopBar", function (o) {
            if (o) for (var n = v["default"].one(".vc-topbar", t.$dom), i = function i(t) {
              var i = o[t],
                  a = v["default"].render(_["default"], { name: i.name || "Undefined", className: i.className || "", pluginID: e.id });if (i.data) for (var r in i.data) {
                a.dataset[r] = i.data[r];
              }d.isFunction(i.onClick) && v["default"].bind(a, "click", function (t) {
                var o = i.onClick.call(a);o === !1 || (v["default"].removeClass(v["default"].all(".vc-topbar-" + e.id), "vc-actived"), v["default"].addClass(a, "vc-actived"));
              }), n.insertAdjacentElement("beforeend", a);
            }, a = 0; a < o.length; a++) {
              i(a);
            }
          }), e.trigger("addTool", function (o) {
            if (o) for (var n = v["default"].one(".vc-tool-last", t.$dom), i = function i(t) {
              var i = o[t],
                  a = v["default"].render(x["default"], { name: i.name || "Undefined", pluginID: e.id });1 == i.global && v["default"].addClass(a, "vc-global-tool"), d.isFunction(i.onClick) && v["default"].bind(a, "click", function (e) {
                i.onClick.call(a);
              }), n.parentNode.insertBefore(a, n);
            }, a = 0; a < o.length; a++) {
              i(a);
            }
          }), e.isReady = !0, e.trigger("ready");
        } }, { key: "_triggerPluginsEvent", value: function value(e) {
          for (var t in this.pluginList) {
            this.pluginList[t].isReady && this.pluginList[t].trigger(e);
          }
        } }, { key: "_triggerPluginEvent", value: function value(e, t) {
          var o = this.pluginList[e];o && o.isReady && o.trigger(t);
        } }, { key: "addPlugin", value: function value(e) {
          return void 0 !== this.pluginList[e.id] ? (console.debug("Plugin " + e.id + " has already been added."), !1) : (this.pluginList[e.id] = e, this.isInited && (this._initPlugin(e), 1 == this.tabList.length && this.showTab(this.tabList[0])), !0);
        } }, { key: "removePlugin", value: function value(e) {
          e = (e + "").toLowerCase();var t = this.pluginList[e];if (void 0 === t) return console.debug("Plugin " + e + " does not exist."), !1;if (t.trigger("remove"), this.isInited) {
            var o = v["default"].one("#__vc_tab_" + e);o && o.parentNode.removeChild(o);for (var n = v["default"].all(".vc-topbar-" + e, this.$dom), i = 0; i < n.length; i++) {
              n[i].parentNode.removeChild(n[i]);
            }var a = v["default"].one("#__vc_log_" + e);a && a.parentNode.removeChild(a);for (var r = v["default"].all(".vc-tool-" + e, this.$dom), l = 0; l < r.length; l++) {
              r[l].parentNode.removeChild(r[l]);
            }
          }var c = this.tabList.indexOf(e);c > -1 && this.tabList.splice(c, 1);try {
            delete this.pluginList[e];
          } catch (s) {
            this.pluginList[e] = void 0;
          }return this.activedTab == e && this.tabList.length > 0 && this.showTab(this.tabList[0]), !0;
        } }, { key: "show", value: function value() {
          if (this.isInited) {
            var e = this,
                t = v["default"].one(".vc-panel", this.$dom);t.style.display = "block", setTimeout(function () {
              v["default"].addClass(e.$dom, "vc-toggle"), e._triggerPluginsEvent("showConsole");var t = v["default"].one(".vc-mask", e.$dom);t.style.display = "block";
            }, 10);
          }
        } }, { key: "hide", value: function value() {
          if (this.isInited) {
            v["default"].removeClass(this.$dom, "vc-toggle"), this._triggerPluginsEvent("hideConsole");var e = v["default"].one(".vc-mask", this.$dom),
                t = v["default"].one(".vc-panel", this.$dom);v["default"].bind(e, "transitionend", function (o) {
              e.style.display = "none", t.style.display = "none";
            });
          }
        } }, { key: "showSwitch", value: function value() {
          if (this.isInited) {
            var e = v["default"].one(".vc-switch", this.$dom);e.style.display = "block";
          }
        } }, { key: "hideSwitch", value: function value() {
          if (this.isInited) {
            var e = v["default"].one(".vc-switch", this.$dom);e.style.display = "none";
          }
        } }, { key: "showTab", value: function value(e) {
          if (this.isInited) {
            var t = v["default"].one("#__vc_log_" + e);v["default"].removeClass(v["default"].all(".vc-tab", this.$dom), "vc-actived"), v["default"].addClass(v["default"].one("#__vc_tab_" + e), "vc-actived"), v["default"].removeClass(v["default"].all(".vc-logbox", this.$dom), "vc-actived"), v["default"].addClass(t, "vc-actived");var o = v["default"].all(".vc-topbar-" + e, this.$dom);v["default"].removeClass(v["default"].all(".vc-toptab", this.$dom), "vc-toggle"), v["default"].addClass(o, "vc-toggle"), o.length > 0 ? v["default"].addClass(v["default"].one(".vc-content", this.$dom), "vc-has-topbar") : v["default"].removeClass(v["default"].one(".vc-content", this.$dom), "vc-has-topbar"), v["default"].removeClass(v["default"].all(".vc-tool", this.$dom), "vc-toggle"), v["default"].addClass(v["default"].all(".vc-tool-" + e, this.$dom), "vc-toggle"), this.activedTab && this._triggerPluginEvent(this.activedTab, "hide"), this.activedTab = e, this._triggerPluginEvent(this.activedTab, "show");
          }
        } }, { key: "setOption", value: function value(e, t) {
          if (d.isString(e)) this.option[e] = t, this._triggerPluginsEvent("updateOption");else if (d.isObject(e)) {
            for (var o in e) {
              this.option[o] = e[o];
            }this._triggerPluginsEvent("updateOption");
          } else console.debug("The first parameter of vConsole.setOption() must be a string or an object.");
        } }, { key: "destroy", value: function value() {
          if (this.isInited) {
            for (var e = Object.keys(this.pluginList), t = e.length - 1; t >= 0; t--) {
              this.removePlugin(e[t]);
            }this.$dom.parentNode.removeChild(this.$dom);
          }
        } }]), e;
    }();t["default"] = A, e.exports = t["default"];
  }, function (e, t) {
    e.exports = { name: "vconsole", version: "3.2.0", description: "A lightweight, extendable front-end developer tool for mobile web page.", homepage: "https://github.com/Tencent/vConsole", main: "dist/vconsole.min.js", scripts: { test: "mocha", dist: "webpack" }, keywords: ["console", "debug", "mobile"], repository: { type: "git", url: "git+https://github.com/Tencent/vConsole.git" }, dependencies: {}, devDependencies: { "babel-core": "^6.7.7", "babel-loader": "^6.2.4", "babel-plugin-add-module-exports": "^0.1.4", "babel-preset-es2015": "^6.6.0", "babel-preset-stage-3": "^6.5.0", chai: "^3.5.0", "css-loader": "^0.23.1", "extract-text-webpack-plugin": "^1.0.1", "html-loader": "^0.4.3", jsdom: "^9.2.1", "json-loader": "^0.5.4", less: "^2.5.3", "less-loader": "^2.2.3", mocha: "^2.5.3", "style-loader": "^0.13.1", webpack: "~1.12.11" }, author: "Tencent", license: "MIT" };
  }, function (e, t) {
    "use strict";
    function o(e) {
      var t = e > 0 ? new Date(e) : new Date(),
          o = t.getDate() < 10 ? "0" + t.getDate() : t.getDate(),
          n = t.getMonth() < 9 ? "0" + (t.getMonth() + 1) : t.getMonth() + 1,
          i = t.getFullYear(),
          a = t.getHours() < 10 ? "0" + t.getHours() : t.getHours(),
          r = t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes(),
          l = t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds(),
          c = t.getMilliseconds() < 10 ? "0" + t.getMilliseconds() : t.getMilliseconds();return 100 > c && (c = "0" + c), { time: +t, year: i, month: n, day: o, hour: a, minute: r, second: l, millisecond: c };
    }function n(e) {
      return "[object Number]" == Object.prototype.toString.call(e);
    }function i(e) {
      return "[object String]" == Object.prototype.toString.call(e);
    }function a(e) {
      return "[object Array]" == Object.prototype.toString.call(e);
    }function r(e) {
      return "[object Boolean]" == Object.prototype.toString.call(e);
    }function l(e) {
      return "[object Undefined]" == Object.prototype.toString.call(e);
    }function c(e) {
      return "[object Null]" == Object.prototype.toString.call(e);
    }function s(e) {
      return "[object Symbol]" == Object.prototype.toString.call(e);
    }function d(e) {
      return !("[object Object]" != Object.prototype.toString.call(e) && (n(e) || i(e) || r(e) || a(e) || c(e) || u(e) || l(e) || s(e)));
    }function u(e) {
      return "[object Function]" == Object.prototype.toString.call(e);
    }function v(e) {
      return "object" === ("undefined" == typeof HTMLElement ? "undefined" : w(HTMLElement)) ? e instanceof HTMLElement : e && "object" === ("undefined" == typeof e ? "undefined" : w(e)) && null !== e && 1 === e.nodeType && "string" == typeof e.nodeName;
    }function f(e) {
      var t = Object.prototype.toString.call(e);return "[object global]" == t || "[object Window]" == t || "[object DOMWindow]" == t;
    }function p(e) {
      var t = Object.prototype.hasOwnProperty;if (!e || "object" !== ("undefined" == typeof e ? "undefined" : w(e)) || e.nodeType || f(e)) return !1;try {
        if (e.constructor && !t.call(e, "constructor") && !t.call(e.constructor.prototype, "isPrototypeOf")) return !1;
      } catch (o) {
        return !1;
      }var n = void 0;for (n in e) {}return void 0 === n || t.call(e, n);
    }function h(e) {
      return document.createElement("a").appendChild(document.createTextNode(e)).parentNode.innerHTML;
    }function g(e) {
      var t = arguments.length <= 1 || void 0 === arguments[1] ? "	" : arguments[1],
          o = arguments.length <= 2 || void 0 === arguments[2] ? "CIRCULAR_DEPENDECY_OBJECT" : arguments[2],
          n = [],
          i = JSON.stringify(e, function (e, t) {
        if ("object" === ("undefined" == typeof t ? "undefined" : w(t)) && null !== t) {
          if (~n.indexOf(t)) return o;n.push(t);
        }return t;
      }, t);return n = null, i;
    }function b(e) {
      if (!d(e) && !a(e)) return [];var t = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"],
          o = [];for (var n in e) {
        t.indexOf(n) < 0 && o.push(n);
      }return o = o.sort();
    }function m(e) {
      return Object.prototype.toString.call(e).replace("[object ", "").replace("]", "");
    }function y(e, t) {
      window.localStorage && (e = "vConsole_" + e, localStorage.setItem(e, t));
    }function _(e) {
      return window.localStorage ? (e = "vConsole_" + e, localStorage.getItem(e)) : void 0;
    }Object.defineProperty(t, "__esModule", { value: !0 });var w = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
      return typeof e === "undefined" ? "undefined" : _typeof(e);
    } : function (e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol ? "symbol" : typeof e === "undefined" ? "undefined" : _typeof(e);
    };t.getDate = o, t.isNumber = n, t.isString = i, t.isArray = a, t.isBoolean = r, t.isUndefined = l, t.isNull = c, t.isSymbol = s, t.isObject = d, t.isFunction = u, t.isElement = v, t.isWindow = f, t.isPlainObject = p, t.htmlEncode = h, t.JSONStringify = g, t.getObjAllKeys = b, t.getObjName = m, t.setStorage = y, t.getStorage = _;
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      return e && e.__esModule ? e : { "default": e };
    }Object.defineProperty(t, "__esModule", { value: !0 });var i = o(4),
        a = o(6),
        r = n(a),
        l = {};l.one = function (e, t) {
      return t ? t.querySelector(e) : document.querySelector(e);
    }, l.all = function (e, t) {
      var o = void 0,
          n = [];return o = t ? t.querySelectorAll(e) : document.querySelectorAll(e), o && o.length > 0 && (n = Array.prototype.slice.call(o)), n;
    }, l.addClass = function (e, t) {
      if (e) {
        (0, i.isArray)(e) || (e = [e]);for (var o = 0; o < e.length; o++) {
          var n = e[o].className || "",
              a = n.split(" ");a.indexOf(t) > -1 || (a.push(t), e[o].className = a.join(" "));
        }
      }
    }, l.removeClass = function (e, t) {
      if (e) {
        (0, i.isArray)(e) || (e = [e]);for (var o = 0; o < e.length; o++) {
          for (var n = e[o].className.split(" "), a = 0; a < n.length; a++) {
            n[a] == t && (n[a] = "");
          }e[o].className = n.join(" ").trim();
        }
      }
    }, l.hasClass = function (e, t) {
      if (!e) return !1;for (var o = e.className.split(" "), n = 0; n < o.length; n++) {
        if (o[n] == t) return !0;
      }return !1;
    }, l.bind = function (e, t, o, n) {
      if (e) {
        void 0 === n && (n = !1), (0, i.isArray)(e) || (e = [e]);for (var a = 0; a < e.length; a++) {
          e[a].addEventListener(t, o, n);
        }
      }
    }, l.delegate = function (e, t, o, n) {
      e && e.addEventListener(t, function (t) {
        var i = l.all(o, e);if (i) e: for (var a = 0; a < i.length; a++) {
          for (var r = t.target; r;) {
            if (r == i[a]) {
              n.call(r, t);break e;
            }if (r = r.parentNode, r == e) break;
          }
        }
      }, !1);
    }, l.render = r["default"], t["default"] = l, e.exports = t["default"];
  }, function (e, t) {
    "use strict";
    function o(e, t, o) {
      var n = /\{\{([^\}]+)\}\}/g,
          i = "",
          a = "",
          r = 0,
          l = [],
          c = function c(e, t) {
        "" !== e && (i += t ? e.match(/^ ?else/g) ? "} " + e + " {\n" : e.match(/\/(if|for|switch)/g) ? "}\n" : e.match(/^ ?if|for|switch/g) ? e + " {\n" : e.match(/^ ?(break|continue) ?$/g) ? e + ";\n" : e.match(/^ ?(case|default)/g) ? e + ":\n" : "arr.push(" + e + ");\n" : 'arr.push("' + e.replace(/"/g, '\\"') + '");\n');
      };for (window.__mito_data = t, window.__mito_code = "", window.__mito_result = "", e = e.replace(/(\{\{ ?switch(.+?)\}\})[\r\n\t ]+\{\{/g, "$1{{"), e = e.replace(/^[\r\n]/, "").replace(/\n/g, "\\\n").replace(/\r/g, "\\\r"), a = "(function(){\n", i = "var arr = [];\n"; l = n.exec(e);) {
        c(e.slice(r, l.index), !1), c(l[1], !0), r = l.index + l[0].length;
      }c(e.substr(r, e.length - r), !1), i += '__mito_result = arr.join("");', i = "with (__mito_data) {\n" + i + "\n}", a += i, a += "})();";var s = document.getElementsByTagName("script"),
          d = "";s.length > 0 && (d = s[0].getAttribute("nonce") || "");var u = document.createElement("SCRIPT");u.innerHTML = a, u.setAttribute("nonce", d), document.documentElement.appendChild(u);var v = __mito_result;if (document.documentElement.removeChild(u), !o) {
        var f = document.createElement("DIV");f.innerHTML = v, v = f.children[0];
      }return v;
    }Object.defineProperty(t, "__esModule", { value: !0 }), t["default"] = o, e.exports = t["default"];
  }, function (e, t, o) {
    var n = o(8);"string" == typeof n && (n = [[e.id, n, ""]]);o(10)(n, {});n.locals && (e.exports = n.locals);
  }, function (e, t, o) {
    t = e.exports = o(9)(), t.push([e.id, '#__vconsole{color:#000;font-size:13px;font-family:Helvetica Neue,Helvetica,Arial,sans-serif}#__vconsole .vc-max-height{max-height:19.23076923em}#__vconsole .vc-max-height-line{max-height:3.38461538em}#__vconsole .vc-min-height{min-height:3.07692308em}#__vconsole dd,#__vconsole dl,#__vconsole pre{margin:0}#__vconsole .vc-switch{display:block;position:fixed;right:.76923077em;bottom:.76923077em;color:#fff;background-color:#04be02;line-height:1;font-size:1.07692308em;padding:.61538462em 1.23076923em;z-index:10000;border-radius:.30769231em;box-shadow:0 0 .61538462em rgba(0,0,0,.4)}#__vconsole .vc-mask{top:0;background:transparent;z-index:10001;transition:background .3s;-webkit-tap-highlight-color:transparent;overflow-y:scroll}#__vconsole .vc-mask,#__vconsole .vc-panel{display:none;position:fixed;left:0;right:0;bottom:0}#__vconsole .vc-panel{min-height:85%;z-index:10002;background-color:#efeff4;-webkit-transition:-webkit-transform .3s;transition:-webkit-transform .3s;transition:transform .3s;transition:transform .3s,-webkit-transform .3s;-webkit-transform:translateY(100%);transform:translateY(100%)}#__vconsole .vc-tabbar{border-bottom:1px solid #d9d9d9;overflow-x:auto;height:3em;width:auto;white-space:nowrap}#__vconsole .vc-tabbar .vc-tab{display:inline-block;line-height:3em;padding:0 1.15384615em;border-right:1px solid #d9d9d9;text-decoration:none;color:#000;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}#__vconsole .vc-tabbar .vc-tab:active{background-color:rgba(0,0,0,.15)}#__vconsole .vc-tabbar .vc-tab.vc-actived{background-color:#fff}#__vconsole .vc-content{background-color:#fff;overflow-x:hidden;overflow-y:auto;position:absolute;top:3.07692308em;left:0;right:0;bottom:3.07692308em;-webkit-overflow-scrolling:touch}#__vconsole .vc-content.vc-has-topbar{top:5.46153846em}#__vconsole .vc-topbar{background-color:#fbf9fe;display:flex;display:-webkit-box;flex-direction:row;flex-wrap:wrap;-webkit-box-direction:row;-webkit-flex-wrap:wrap;width:100%}#__vconsole .vc-topbar .vc-toptab{display:none;flex:1;-webkit-box-flex:1;line-height:2.30769231em;padding:0 1.15384615em;border-bottom:1px solid #d9d9d9;text-decoration:none;text-align:center;color:#000;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}#__vconsole .vc-topbar .vc-toptab.vc-toggle{display:block}#__vconsole .vc-topbar .vc-toptab:active{background-color:rgba(0,0,0,.15)}#__vconsole .vc-topbar .vc-toptab.vc-actived{border-bottom:1px solid #3e82f7}#__vconsole .vc-logbox{display:none;position:relative;min-height:100%}#__vconsole .vc-logbox i{font-style:normal}#__vconsole .vc-logbox .vc-log{padding-bottom:3em;-webkit-tap-highlight-color:transparent}#__vconsole .vc-logbox .vc-log:empty:before{content:"Empty";color:#999;position:absolute;top:45%;left:0;right:0;bottom:0;font-size:1.15384615em;text-align:center}#__vconsole .vc-logbox .vc-item{margin:0;padding:.46153846em .61538462em;overflow:hidden;line-height:1.3;border-bottom:1px solid #eee;word-break:break-word}#__vconsole .vc-logbox .vc-item-info{color:#6a5acd}#__vconsole .vc-logbox .vc-item-debug{color:#daa520}#__vconsole .vc-logbox .vc-item-warn{color:orange;border-color:#ffb930;background-color:#fffacd}#__vconsole .vc-logbox .vc-item-error{color:#dc143c;border-color:#f4a0ab;background-color:#ffe4e1}#__vconsole .vc-logbox .vc-log.vc-log-partly .vc-item{display:none}#__vconsole .vc-logbox .vc-log.vc-log-partly-error .vc-item-error,#__vconsole .vc-logbox .vc-log.vc-log-partly-info .vc-item-info,#__vconsole .vc-logbox .vc-log.vc-log-partly-log .vc-item-log,#__vconsole .vc-logbox .vc-log.vc-log-partly-warn .vc-item-warn{display:block}#__vconsole .vc-logbox .vc-item .vc-item-content{margin-right:4.61538462em;display:block}#__vconsole .vc-logbox .vc-item .vc-item-meta{color:#888;float:right;width:4.61538462em;text-align:right}#__vconsole .vc-logbox .vc-item.vc-item-nometa .vc-item-content{margin-right:0}#__vconsole .vc-logbox .vc-item.vc-item-nometa .vc-item-meta{display:none}#__vconsole .vc-logbox .vc-item .vc-item-code{display:block;white-space:pre-wrap;overflow:auto;position:relative}#__vconsole .vc-logbox .vc-item .vc-item-code.vc-item-code-input,#__vconsole .vc-logbox .vc-item .vc-item-code.vc-item-code-output{padding-left:.92307692em}#__vconsole .vc-logbox .vc-item .vc-item-code.vc-item-code-input:before,#__vconsole .vc-logbox .vc-item .vc-item-code.vc-item-code-output:before{content:"\\203A";position:absolute;top:-.23076923em;left:0;font-size:1.23076923em;color:#6a5acd}#__vconsole .vc-logbox .vc-item .vc-item-code.vc-item-code-output:before{content:"\\2039"}#__vconsole .vc-logbox .vc-item .vc-fold{display:block;overflow:auto;-webkit-overflow-scrolling:touch}#__vconsole .vc-logbox .vc-item .vc-fold .vc-fold-outer{display:block;font-style:italic;padding-left:.76923077em;position:relative}#__vconsole .vc-logbox .vc-item .vc-fold .vc-fold-outer:active{background-color:#e6e6e6}#__vconsole .vc-logbox .vc-item .vc-fold .vc-fold-outer:before{content:"";position:absolute;top:.30769231em;left:.15384615em;width:0;height:0;border:.30769231em solid transparent;border-left-color:#000}#__vconsole .vc-logbox .vc-item .vc-fold .vc-fold-outer.vc-toggle:before{top:.46153846em;left:0;border-top-color:#000;border-left-color:transparent}#__vconsole .vc-logbox .vc-item .vc-fold .vc-fold-inner{display:none;margin-left:.76923077em}#__vconsole .vc-logbox .vc-item .vc-fold .vc-fold-inner.vc-toggle{display:block}#__vconsole .vc-logbox .vc-item .vc-fold .vc-fold-inner .vc-code-key{margin-left:.76923077em}#__vconsole .vc-logbox .vc-item .vc-fold .vc-fold-outer .vc-code-key{margin-left:0}#__vconsole .vc-logbox .vc-code-key{color:#905}#__vconsole .vc-logbox .vc-code-private-key{color:#d391b5}#__vconsole .vc-logbox .vc-code-function{color:#905;font-style:italic}#__vconsole .vc-logbox .vc-code-boolean,#__vconsole .vc-logbox .vc-code-number{color:#0086b3}#__vconsole .vc-logbox .vc-code-string{color:#183691}#__vconsole .vc-logbox .vc-code-null,#__vconsole .vc-logbox .vc-code-undefined{color:#666}#__vconsole .vc-logbox .vc-cmd{position:absolute;height:3.07692308em;left:0;right:0;bottom:0;border-top:1px solid #d9d9d9;display:block!important}#__vconsole .vc-logbox .vc-cmd .vc-cmd-input-wrap{display:block;height:2.15384615em;margin-right:3.07692308em;padding:.46153846em .61538462em}#__vconsole .vc-logbox .vc-cmd .vc-cmd-input{width:100%;border:none;resize:none;outline:none;padding:0;font-size:.92307692em}#__vconsole .vc-logbox .vc-cmd .vc-cmd-input::-webkit-input-placeholder{line-height:2.15384615em}#__vconsole .vc-logbox .vc-cmd .vc-cmd-btn{position:absolute;top:0;right:0;bottom:0;width:3.07692308em;border:none;background-color:#efeff4;outline:none;-webkit-touch-callout:none;font-size:1em}#__vconsole .vc-logbox .vc-cmd .vc-cmd-btn:active{background-color:rgba(0,0,0,.15)}#__vconsole .vc-logbox .vc-group .vc-group-preview{-webkit-touch-callout:none}#__vconsole .vc-logbox .vc-group .vc-group-preview:active{background-color:#e6e6e6}#__vconsole .vc-logbox .vc-group .vc-group-detail{display:none;padding:0 0 .76923077em 1.53846154em;border-bottom:1px solid #eee}#__vconsole .vc-logbox .vc-group.vc-actived .vc-group-detail{display:block;background-color:#fbf9fe}#__vconsole .vc-logbox .vc-group.vc-actived .vc-table-row{background-color:#fff}#__vconsole .vc-logbox .vc-group.vc-actived .vc-group-preview{background-color:#fbf9fe}#__vconsole .vc-logbox .vc-table .vc-table-row{display:flex;display:-webkit-flex;flex-direction:row;flex-wrap:wrap;-webkit-box-direction:row;-webkit-flex-wrap:wrap;overflow:hidden;border-bottom:1px solid #eee}#__vconsole .vc-logbox .vc-table .vc-table-row.vc-left-border{border-left:1px solid #eee}#__vconsole .vc-logbox .vc-table .vc-table-col{flex:1;-webkit-box-flex:1;padding:.23076923em .30769231em;border-left:1px solid #eee;overflow:auto;white-space:pre-wrap;word-break:break-word;-webkit-overflow-scrolling:touch}#__vconsole .vc-logbox .vc-table .vc-table-col:first-child{border:none}#__vconsole .vc-logbox .vc-table .vc-small .vc-table-col{padding:0 .30769231em;font-size:.92307692em}#__vconsole .vc-logbox .vc-table .vc-table-col-2{flex:2;-webkit-box-flex:2}#__vconsole .vc-logbox .vc-table .vc-table-col-3{flex:3;-webkit-box-flex:3}#__vconsole .vc-logbox .vc-table .vc-table-col-4{flex:4;-webkit-box-flex:4}#__vconsole .vc-logbox .vc-table .vc-table-col-5{flex:5;-webkit-box-flex:5}#__vconsole .vc-logbox .vc-table .vc-table-col-6{flex:6;-webkit-box-flex:6}#__vconsole .vc-logbox .vc-table .vc-table-row-error{border-color:#f4a0ab;background-color:#ffe4e1}#__vconsole .vc-logbox .vc-table .vc-table-row-error .vc-table-col{color:#dc143c;border-color:#f4a0ab}#__vconsole .vc-logbox .vc-table .vc-table-col-title{font-weight:700}#__vconsole .vc-logbox.vc-actived{display:block}#__vconsole .vc-toolbar{border-top:1px solid #d9d9d9;line-height:3em;position:absolute;left:0;right:0;bottom:0;display:flex;display:-webkit-box;flex-direction:row;-webkit-box-direction:row}#__vconsole .vc-toolbar .vc-tool{display:none;text-decoration:none;color:#000;width:50%;flex:1;-webkit-box-flex:1;text-align:center;position:relative;-webkit-touch-callout:none}#__vconsole .vc-toolbar .vc-tool.vc-global-tool,#__vconsole .vc-toolbar .vc-tool.vc-toggle{display:block}#__vconsole .vc-toolbar .vc-tool:active{background-color:rgba(0,0,0,.15)}#__vconsole .vc-toolbar .vc-tool:after{content:" ";position:absolute;top:.53846154em;bottom:.53846154em;right:0;border-left:1px solid #d9d9d9}#__vconsole .vc-toolbar .vc-tool-last:after{border:none}#__vconsole.vc-toggle .vc-switch{display:none}#__vconsole.vc-toggle .vc-mask{background:rgba(0,0,0,.6);display:block}#__vconsole.vc-toggle .vc-panel{-webkit-transform:translate(0);transform:translate(0)}', ""]);
  }, function (e, t) {
    "use strict";
    e.exports = function () {
      var e = [];return e.toString = function () {
        for (var e = [], t = 0; t < this.length; t++) {
          var o = this[t];o[2] ? e.push("@media " + o[2] + "{" + o[1] + "}") : e.push(o[1]);
        }return e.join("");
      }, e.i = function (t, o) {
        "string" == typeof t && (t = [[null, t, ""]]);for (var n = {}, i = 0; i < this.length; i++) {
          var a = this[i][0];"number" == typeof a && (n[a] = !0);
        }for (i = 0; i < t.length; i++) {
          var r = t[i];"number" == typeof r[0] && n[r[0]] || (o && !r[2] ? r[2] = o : o && (r[2] = "(" + r[2] + ") and (" + o + ")"), e.push(r));
        }
      }, e;
    };
  }, function (e, t, o) {
    function n(e, t) {
      for (var o = 0; o < e.length; o++) {
        var n = e[o],
            i = f[n.id];if (i) {
          i.refs++;for (var a = 0; a < i.parts.length; a++) {
            i.parts[a](n.parts[a]);
          }for (; a < n.parts.length; a++) {
            i.parts.push(s(n.parts[a], t));
          }
        } else {
          for (var r = [], a = 0; a < n.parts.length; a++) {
            r.push(s(n.parts[a], t));
          }f[n.id] = { id: n.id, refs: 1, parts: r };
        }
      }
    }function i(e) {
      for (var t = [], o = {}, n = 0; n < e.length; n++) {
        var i = e[n],
            a = i[0],
            r = i[1],
            l = i[2],
            c = i[3],
            s = { css: r, media: l, sourceMap: c };o[a] ? o[a].parts.push(s) : t.push(o[a] = { id: a, parts: [s] });
      }return t;
    }function a(e, t) {
      var o = g(),
          n = y[y.length - 1];if ("top" === e.insertAt) n ? n.nextSibling ? o.insertBefore(t, n.nextSibling) : o.appendChild(t) : o.insertBefore(t, o.firstChild), y.push(t);else {
        if ("bottom" !== e.insertAt) throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");o.appendChild(t);
      }
    }function r(e) {
      e.parentNode.removeChild(e);var t = y.indexOf(e);t >= 0 && y.splice(t, 1);
    }function l(e) {
      var t = document.createElement("style");return t.type = "text/css", a(e, t), t;
    }function c(e) {
      var t = document.createElement("link");return t.rel = "stylesheet", a(e, t), t;
    }function s(e, t) {
      var o, n, i;if (t.singleton) {
        var a = m++;o = b || (b = l(t)), n = d.bind(null, o, a, !1), i = d.bind(null, o, a, !0);
      } else e.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (o = c(t), n = v.bind(null, o), i = function i() {
        r(o), o.href && URL.revokeObjectURL(o.href);
      }) : (o = l(t), n = u.bind(null, o), i = function i() {
        r(o);
      });return n(e), function (t) {
        if (t) {
          if (t.css === e.css && t.media === e.media && t.sourceMap === e.sourceMap) return;n(e = t);
        } else i();
      };
    }function d(e, t, o, n) {
      var i = o ? "" : n.css;if (e.styleSheet) e.styleSheet.cssText = _(t, i);else {
        var a = document.createTextNode(i),
            r = e.childNodes;r[t] && e.removeChild(r[t]), r.length ? e.insertBefore(a, r[t]) : e.appendChild(a);
      }
    }function u(e, t) {
      var o = t.css,
          n = t.media;if (n && e.setAttribute("media", n), e.styleSheet) e.styleSheet.cssText = o;else {
        for (; e.firstChild;) {
          e.removeChild(e.firstChild);
        }e.appendChild(document.createTextNode(o));
      }
    }function v(e, t) {
      var o = t.css,
          n = t.sourceMap;n && (o += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(n)))) + " */");var i = new Blob([o], { type: "text/css"
      }),
          a = e.href;e.href = URL.createObjectURL(i), a && URL.revokeObjectURL(a);
    }var f = {},
        p = function p(e) {
      var t;return function () {
        return "undefined" == typeof t && (t = e.apply(this, arguments)), t;
      };
    },
        h = p(function () {
      return (/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())
      );
    }),
        g = p(function () {
      return document.head || document.getElementsByTagName("head")[0];
    }),
        b = null,
        m = 0,
        y = [];e.exports = function (e, t) {
      t = t || {}, "undefined" == typeof t.singleton && (t.singleton = h()), "undefined" == typeof t.insertAt && (t.insertAt = "bottom");var o = i(e);return n(o, t), function (e) {
        for (var a = [], r = 0; r < o.length; r++) {
          var l = o[r],
              c = f[l.id];c.refs--, a.push(c);
        }if (e) {
          var s = i(e);n(s, t);
        }for (var r = 0; r < a.length; r++) {
          var c = a[r];if (0 === c.refs) {
            for (var d = 0; d < c.parts.length; d++) {
              c.parts[d]();
            }delete f[c.id];
          }
        }
      };
    };var _ = function () {
      var e = [];return function (t, o) {
        return e[t] = o, e.filter(Boolean).join("\n");
      };
    }();
  }, function (e, t) {
    e.exports = '<div id="__vconsole" class="">\n  <div class="vc-switch">vConsole</div>\n  <div class="vc-mask">\n  </div>\n  <div class="vc-panel">\n    <div class="vc-tabbar">\n    </div>\n    <div class="vc-topbar">\n    </div>\n    <div class="vc-content">\n    </div>\n    <div class="vc-toolbar">\n      <a class="vc-tool vc-global-tool vc-tool-last vc-hide">Hide</a>\n    </div>\n  </div>\n</div>';
  }, function (e, t) {
    e.exports = '<a class="vc-tab" data-tab="{{id}}" id="__vc_tab_{{id}}">{{name}}</a>';
  }, function (e, t) {
    e.exports = '<div class="vc-logbox" id="__vc_log_{{id}}">\n  \n</div>';
  }, function (e, t) {
    e.exports = '<a class="vc-toptab vc-topbar-{{pluginID}}{{if (className)}} {{className}}{{/if}}">{{name}}</a>';
  }, function (e, t) {
    e.exports = '<a class="vc-tool vc-tool-{{pluginID}}">{{name}}</a>';
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var o in e) {
        Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
      }return t["default"] = e, t;
    }function i(e) {
      return e && e.__esModule ? e : { "default": e };
    }function a(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function r(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) && "function" != typeof t ? e : t;
    }function l(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + (typeof t === "undefined" ? "undefined" : _typeof(t)));e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
    }Object.defineProperty(t, "__esModule", { value: !0 });var c = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }(),
        s = function w(e, t, o) {
      null === e && (e = Function.prototype);var n = Object.getOwnPropertyDescriptor(e, t);if (void 0 === n) {
        var i = Object.getPrototypeOf(e);return null === i ? void 0 : w(i, t, o);
      }if ("value" in n) return n.value;var a = n.get;if (void 0 !== a) return a.call(o);
    },
        d = o(5),
        u = i(d),
        v = o(4),
        f = n(v),
        p = o(17),
        h = i(p),
        g = o(22),
        b = i(g),
        m = o(23),
        y = i(m),
        _ = function (e) {
      function t() {
        var e;a(this, t);for (var o = arguments.length, n = Array(o), i = 0; o > i; i++) {
          n[i] = arguments[i];
        }var l = r(this, (e = Object.getPrototypeOf(t)).call.apply(e, [this].concat(n)));return l.tplTabbox = b["default"], l.windowOnError = null, l;
      }return l(t, e), c(t, [{ key: "onReady", value: function value() {
          var e = this;s(Object.getPrototypeOf(t.prototype), "onReady", this).call(this), u["default"].bind(u["default"].one(".vc-cmd", this.$tabbox), "submit", function (t) {
            t.preventDefault();var o = u["default"].one(".vc-cmd-input", t.target),
                n = o.value;o.value = "", "" !== n && e.evalCommand(n);
          });var o = "";o += "if (!!window) {", o += "window.__vConsole_cmd_result = undefined;", o += "window.__vConsole_cmd_error = false;", o += "}";var n = document.getElementsByTagName("script"),
              i = "";n.length > 0 && (i = n[0].getAttribute("nonce") || "");var a = document.createElement("SCRIPT");a.innerHTML = o, a.setAttribute("nonce", i), document.documentElement.appendChild(a), document.documentElement.removeChild(a);
        } }, { key: "mockConsole", value: function value() {
          s(Object.getPrototypeOf(t.prototype), "mockConsole", this).call(this);var e = this;f.isFunction(window.onerror) && (this.windowOnError = window.onerror), window.onerror = function (t, o, n, i, a) {
            var r = t;o && (r += "\n" + o.replace(location.origin, "")), (n || i) && (r += ":" + n + ":" + i);var l = !!a && !!a.stack,
                c = l && a.stack.toString() || "";e.printLog({ logType: "error", logs: [r, c], noOrigin: !0 }), f.isFunction(e.windowOnError) && e.windowOnError.call(window, t, o, n, i, a);
          };
        } }, { key: "evalCommand", value: function value(e) {
          this.printLog({ logType: "log", content: u["default"].render(y["default"], { content: e, type: "input" }), noMeta: !0, style: "" });var t = "";t += "try {\n", t += "window.__vConsole_cmd_result = (function() {\n", t += "return " + e + ";\n", t += "})();\n", t += "window.__vConsole_cmd_error = false;\n", t += "} catch (e) {\n", t += "window.__vConsole_cmd_result = e.message;\n", t += "window.__vConsole_cmd_error = true;\n", t += "}";var o = document.getElementsByTagName("script"),
              n = "";o.length > 0 && (n = o[0].getAttribute("nonce") || "");var i = document.createElement("SCRIPT");i.innerHTML = t, i.setAttribute("nonce", n), document.documentElement.appendChild(i);var a = window.__vConsole_cmd_result,
              r = window.__vConsole_cmd_error;if (document.documentElement.removeChild(i), 0 == r) {
            var l = void 0;f.isArray(a) || f.isObject(a) ? l = this.getFoldedLine(a) : (f.isNull(a) ? a = "null" : f.isUndefined(a) ? a = "undefined" : f.isFunction(a) ? a = "function()" : f.isString(a) && (a = '"' + a + '"'), l = u["default"].render(y["default"], { content: a, type: "output" })), this.printLog({ logType: "log", content: l, noMeta: !0, style: "" });
          } else this.printLog({ logType: "error", logs: [a], noMeta: !0, style: "" });
        } }]), t;
    }(h["default"]);t["default"] = _, e.exports = t["default"];
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      return e && e.__esModule ? e : { "default": e };
    }function i(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var o in e) {
        Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
      }return t["default"] = e, t;
    }function a(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function r(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) && "function" != typeof t ? e : t;
    }function l(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + (typeof t === "undefined" ? "undefined" : _typeof(t)));e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
    }Object.defineProperty(t, "__esModule", { value: !0 });var c = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
      return typeof e === "undefined" ? "undefined" : _typeof(e);
    } : function (e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol ? "symbol" : typeof e === "undefined" ? "undefined" : _typeof(e);
    },
        s = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }(),
        d = o(4),
        u = i(d),
        v = o(5),
        f = n(v),
        p = o(18),
        h = n(p),
        g = o(19),
        b = n(g),
        m = o(20),
        y = n(m),
        _ = o(21),
        w = n(_),
        x = 1e3,
        k = function (e) {
      function t() {
        var e;a(this, t);for (var o = arguments.length, n = Array(o), i = 0; o > i; i++) {
          n[i] = arguments[i];
        }var l = r(this, (e = Object.getPrototypeOf(t)).call.apply(e, [this].concat(n)));return l.tplTabbox = "", l.allowUnformattedLog = !0, l.isReady = !1, l.isShow = !1, l.$tabbox = null, l.console = {}, l.logList = [], l.isInBottom = !0, l.maxLogNumber = x, l.logNumber = 0, l.mockConsole(), l;
      }return l(t, e), s(t, [{ key: "onInit", value: function value() {
          this.$tabbox = f["default"].render(this.tplTabbox, {}), this.updateMaxLogNumber();
        } }, { key: "onRenderTab", value: function value(e) {
          e(this.$tabbox);
        } }, { key: "onAddTopBar", value: function value(e) {
          for (var t = this, o = ["All", "Log", "Info", "Warn", "Error"], n = [], i = 0; i < o.length; i++) {
            n.push({ name: o[i], data: { type: o[i].toLowerCase() }, className: "", onClick: function onClick() {
                return f["default"].hasClass(this, "vc-actived") ? !1 : void t.showLogType(this.dataset.type || "all");
              } });
          }n[0].className = "vc-actived", e(n);
        } }, { key: "onAddTool", value: function value(e) {
          var t = this,
              o = [{ name: "Clear", global: !1, onClick: function onClick() {
              t.clearLog(), t.vConsole.triggerEvent("clearLog");
            } }];e(o);
        } }, { key: "onReady", value: function value() {
          var e = this;e.isReady = !0;var t = f["default"].all(".vc-subtab", e.$tabbox);f["default"].bind(t, "click", function (o) {
            if (o.preventDefault(), f["default"].hasClass(this, "vc-actived")) return !1;f["default"].removeClass(t, "vc-actived"), f["default"].addClass(this, "vc-actived");var n = this.dataset.type,
                i = f["default"].one(".vc-log", e.$tabbox);f["default"].removeClass(i, "vc-log-partly-log"), f["default"].removeClass(i, "vc-log-partly-info"), f["default"].removeClass(i, "vc-log-partly-warn"), f["default"].removeClass(i, "vc-log-partly-error"), "all" == n ? f["default"].removeClass(i, "vc-log-partly") : (f["default"].addClass(i, "vc-log-partly"), f["default"].addClass(i, "vc-log-partly-" + n));
          });var o = f["default"].one(".vc-content");f["default"].bind(o, "scroll", function (t) {
            e.isShow && (o.scrollTop + o.offsetHeight >= o.scrollHeight ? e.isInBottom = !0 : e.isInBottom = !1);
          });for (var n = 0; n < e.logList.length; n++) {
            e.printLog(e.logList[n]);
          }e.logList = [];
        } }, { key: "onRemove", value: function value() {
          window.console.log = this.console.log, window.console.info = this.console.info, window.console.warn = this.console.warn, window.console.debug = this.console.debug, window.console.error = this.console.error, window.console.time = this.console.time, window.console.timeEnd = this.console.timeEnd, window.console.clear = this.console.clear, this.console = {};
        } }, { key: "onShow", value: function value() {
          this.isShow = !0, 1 == this.isInBottom && this.autoScrollToBottom();
        } }, { key: "onHide", value: function value() {
          this.isShow = !1;
        } }, { key: "onShowConsole", value: function value() {
          1 == this.isInBottom && this.autoScrollToBottom();
        } }, { key: "onUpdateOption", value: function value() {
          this.vConsole.option.maxLogNumber != this.maxLogNumber && (this.updateMaxLogNumber(), this.limitMaxLogs());
        } }, { key: "updateMaxLogNumber", value: function value() {
          this.maxLogNumber = this.vConsole.option.maxLogNumber || x, this.maxLogNumber = Math.max(1, this.maxLogNumber);
        } }, { key: "limitMaxLogs", value: function value() {
          if (this.isReady) for (; this.logNumber > this.maxLogNumber;) {
            var e = f["default"].one(".vc-item", this.$tabbox);if (!e) break;e.parentNode.removeChild(e), this.logNumber--;
          }
        } }, { key: "showLogType", value: function value(e) {
          var t = f["default"].one(".vc-log", this.$tabbox);f["default"].removeClass(t, "vc-log-partly-log"), f["default"].removeClass(t, "vc-log-partly-info"), f["default"].removeClass(t, "vc-log-partly-warn"), f["default"].removeClass(t, "vc-log-partly-error"), "all" == e ? f["default"].removeClass(t, "vc-log-partly") : (f["default"].addClass(t, "vc-log-partly"), f["default"].addClass(t, "vc-log-partly-" + e));
        } }, { key: "autoScrollToBottom", value: function value() {
          this.vConsole.option.disableLogScrolling || this.scrollToBottom();
        } }, { key: "scrollToBottom", value: function value() {
          var e = f["default"].one(".vc-content");e && (e.scrollTop = e.scrollHeight - e.offsetHeight);
        } }, { key: "mockConsole", value: function value() {
          var e = this,
              t = this,
              o = ["log", "info", "warn", "debug", "error"];window.console ? (o.map(function (e) {
            t.console[e] = window.console[e];
          }), t.console.time = window.console.time, t.console.timeEnd = window.console.timeEnd, t.console.clear = window.console.clear) : window.console = {}, o.map(function (t) {
            window.console[t] = function () {
              for (var o = arguments.length, n = Array(o), i = 0; o > i; i++) {
                n[i] = arguments[i];
              }e.printLog({ logType: t, logs: n });
            };
          });var n = {};window.console.time = function (e) {
            n[e] = Date.now();
          }, window.console.timeEnd = function (e) {
            var t = n[e];t ? (console.log(e + ":", Date.now() - t + "ms"), delete n[e]) : console.log(e + ": 0ms");
          }, window.console.clear = function () {
            for (var e = arguments.length, o = Array(e), n = 0; e > n; n++) {
              o[n] = arguments[n];
            }t.clearLog(), t.console.clear.apply(window.console, o);
          };
        } }, { key: "clearLog", value: function value() {
          f["default"].one(".vc-log", this.$tabbox).innerHTML = "";
        } }, { key: "printOriginLog", value: function value(e) {
          "function" == typeof this.console[e.logType] && this.console[e.logType].apply(window.console, e.logs);
        } }, { key: "printLog", value: function value(e) {
          var t = e.logs || [];if (t.length || e.content) {
            t = [].slice.call(t || []);var o = !0,
                n = /^\[(\w+)\]$/i,
                i = "";if (u.isString(t[0])) {
              var a = t[0].match(n);null !== a && a.length > 0 && (i = a[1].toLowerCase());
            }if (i ? o = i == this.id : 0 == this.allowUnformattedLog && (o = !1), !o) return void (e.noOrigin || this.printOriginLog(e));if (e.date || (e.date = +new Date()), !this.isReady) return void this.logList.push(e);if (u.isString(t[0]) && (t[0] = t[0].replace(n, ""), "" === t[0] && t.shift()), !e.meta) {
              var r = u.getDate(e.date);e.meta = r.hour + ":" + r.minute + ":" + r.second;
            }for (var l = f["default"].render(b["default"], { logType: e.logType, noMeta: !!e.noMeta, meta: e.meta, style: e.style || "" }), s = f["default"].one(".vc-item-content", l), d = 0; d < t.length; d++) {
              var v = void 0;try {
                if ("" === t[d]) continue;v = u.isFunction(t[d]) ? "<span> " + t[d].toString() + "</span>" : u.isObject(t[d]) || u.isArray(t[d]) ? this.getFoldedLine(t[d]) : "<span> " + u.htmlEncode(t[d]).replace(/\n/g, "<br/>") + "</span>";
              } catch (p) {
                v = "<span> [" + c(t[d]) + "]</span>";
              }v && ("string" == typeof v ? s.insertAdjacentHTML("beforeend", v) : s.insertAdjacentElement("beforeend", v));
            }u.isObject(e.content) && s.insertAdjacentElement("beforeend", e.content), f["default"].one(".vc-log", this.$tabbox).insertAdjacentElement("beforeend", l), this.logNumber++, this.limitMaxLogs(), this.isInBottom && this.autoScrollToBottom(), e.noOrigin || this.printOriginLog(e);
          }
        } }, { key: "getFoldedLine", value: function value(e, t) {
          var o = this;if (!t) {
            var n = u.JSONStringify(e),
                i = n.substr(0, 26);t = u.getObjName(e), n.length > 26 && (i += "..."), t += " " + i;
          }var a = f["default"].render(y["default"], { outer: t, lineType: "obj" });return f["default"].bind(f["default"].one(".vc-fold-outer", a), "click", function (t) {
            t.preventDefault(), t.stopPropagation(), f["default"].hasClass(a, "vc-toggle") ? (f["default"].removeClass(a, "vc-toggle"), f["default"].removeClass(f["default"].one(".vc-fold-inner", a), "vc-toggle"), f["default"].removeClass(f["default"].one(".vc-fold-outer", a), "vc-toggle")) : (f["default"].addClass(a, "vc-toggle"), f["default"].addClass(f["default"].one(".vc-fold-inner", a), "vc-toggle"), f["default"].addClass(f["default"].one(".vc-fold-outer", a), "vc-toggle"));var n = f["default"].one(".vc-fold-inner", a);if (0 == n.children.length && e) {
              for (var i = u.getObjAllKeys(e), r = 0; r < i.length; r++) {
                var l = e[i[r]],
                    c = "undefined",
                    s = "";u.isString(l) ? (c = "string", l = '"' + l + '"') : u.isNumber(l) ? c = "number" : u.isBoolean(l) ? c = "boolean" : u.isNull(l) ? (c = "null", l = "null") : u.isUndefined(l) ? (c = "undefined", l = "undefined") : u.isFunction(l) ? (c = "function", l = "function()") : u.isSymbol(l) && (c = "symbol");var d = void 0;if (u.isArray(l)) {
                  var v = u.getObjName(l) + "[" + l.length + "]";d = o.getFoldedLine(l, f["default"].render(w["default"], { key: i[r], keyType: s, value: v, valueType: "array" }, !0));
                } else if (u.isObject(l)) {
                  var p = u.getObjName(l);d = o.getFoldedLine(l, f["default"].render(w["default"], { key: u.htmlEncode(i[r]), keyType: s, value: p, valueType: "object" }, !0));
                } else {
                  e.hasOwnProperty && !e.hasOwnProperty(i[r]) && (s = "private");var h = { lineType: "kv", key: u.htmlEncode(i[r]), keyType: s, value: u.htmlEncode(l), valueType: c };d = f["default"].render(y["default"], h);
                }n.insertAdjacentElement("beforeend", d);
              }if (u.isObject(e)) {
                var g = e.__proto__,
                    b = void 0;b = u.isObject(g) ? o.getFoldedLine(g, f["default"].render(w["default"], { key: "__proto__", keyType: "private", value: u.getObjName(g), valueType: "object" }, !0)) : f["default"].render(w["default"], { key: "__proto__", keyType: "private", value: "null", valueType: "null" }), n.insertAdjacentElement("beforeend", b);
              }
            }return !1;
          }), a;
        } }]), t;
    }(h["default"]);t["default"] = k, e.exports = t["default"];
  }, function (e, t) {
    "use strict";
    function o(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }Object.defineProperty(t, "__esModule", { value: !0 });var n = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }(),
        i = function () {
      function e(t) {
        var n = arguments.length <= 1 || void 0 === arguments[1] ? "newPlugin" : arguments[1];o(this, e), this.id = t, this.name = n, this.isReady = !1, this.eventList = {};
      }return n(e, [{ key: "on", value: function value(e, t) {
          return this.eventList[e] = t, this;
        } }, { key: "trigger", value: function value(e, t) {
          if ("function" == typeof this.eventList[e]) this.eventList[e].call(this, t);else {
            var o = "on" + e.charAt(0).toUpperCase() + e.slice(1);"function" == typeof this[o] && this[o].call(this, t);
          }return this;
        } }, { key: "id", get: function get() {
          return this._id;
        }, set: function set(e) {
          if (!e) throw "Plugin ID cannot be empty";this._id = e.toLowerCase();
        } }, { key: "name", get: function get() {
          return this._name;
        }, set: function set(e) {
          if (!e) throw "Plugin name cannot be empty";this._name = e;
        } }, { key: "vConsole", get: function get() {
          return this._vConsole || void 0;
        }, set: function set(e) {
          if (!e) throw "vConsole cannot be empty";this._vConsole = e;
        } }]), e;
    }();t["default"] = i, e.exports = t["default"];
  }, function (e, t) {
    e.exports = '<div class="vc-item vc-item-{{logType}} {{if (!noMeta)}}vc-item-nometa{{/if}} {{style}}">\n	<span class="vc-item-meta">{{if (!noMeta)}}{{meta}}{{/if}}</span>\n	<div class="vc-item-content"></div>\n</div>';
  }, function (e, t) {
    e.exports = '<div class="vc-fold">\n  {{if (lineType == \'obj\')}}\n    <i class="vc-fold-outer">{{outer}}</i>\n    <div class="vc-fold-inner"></div>\n  {{else if (lineType == \'value\')}}\n    <i class="vc-code-{{valueType}}">{{value}}</i>\n  {{else if (lineType == \'kv\')}}\n    <i class="vc-code-key{{if (keyType)}} vc-code-{{keyType}}-key{{/if}}">{{key}}</i>: <i class="vc-code-{{valueType}}">{{value}}</i>\n  {{/if}}\n</div>';
  }, function (e, t) {
    e.exports = '<span>\n  <i class="vc-code-key{{if (keyType)}} vc-code-{{keyType}}-key{{/if}}">{{key}}</i>: <i class="vc-code-{{valueType}}">{{value}}</i>\n</span>';
  }, function (e, t) {
    e.exports = '<div>\n  <div class="vc-log"></div>\n  <form class="vc-cmd">\n    <button class="vc-cmd-btn" type="submit">OK</button>\n    <div class="vc-cmd-input-wrap">\n      <textarea class="vc-cmd-input" placeholder="command..."></textarea>\n    </div>\n  </form>\n</div>';
  }, function (e, t) {
    e.exports = '<pre class="vc-item-code vc-item-code-{{type}}">{{content}}</pre>';
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      return e && e.__esModule ? e : { "default": e };
    }function i(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var o in e) {
        Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
      }return t["default"] = e, t;
    }function a(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function r(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) && "function" != typeof t ? e : t;
    }function l(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + (typeof t === "undefined" ? "undefined" : _typeof(t)));e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
    }Object.defineProperty(t, "__esModule", { value: !0 });var c = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }(),
        s = function g(e, t, o) {
      null === e && (e = Function.prototype);var n = Object.getOwnPropertyDescriptor(e, t);if (void 0 === n) {
        var i = Object.getPrototypeOf(e);return null === i ? void 0 : g(i, t, o);
      }if ("value" in n) return n.value;var a = n.get;if (void 0 !== a) return a.call(o);
    },
        d = o(4),
        u = (i(d), o(17)),
        v = n(u),
        f = o(25),
        p = n(f),
        h = function (e) {
      function t() {
        var e;a(this, t);for (var o = arguments.length, n = Array(o), i = 0; o > i; i++) {
          n[i] = arguments[i];
        }var l = r(this, (e = Object.getPrototypeOf(t)).call.apply(e, [this].concat(n)));return l.tplTabbox = p["default"], l.allowUnformattedLog = !1, l;
      }return l(t, e), c(t, [{ key: "onInit", value: function value() {
          s(Object.getPrototypeOf(t.prototype), "onInit", this).call(this), this.printSystemInfo();
        } }, { key: "printSystemInfo", value: function value() {
          var e = navigator.userAgent,
              t = "",
              o = e.match(/(ipod).*\s([\d_]+)/i),
              n = e.match(/(ipad).*\s([\d_]+)/i),
              i = e.match(/(iphone)\sos\s([\d_]+)/i),
              a = e.match(/(android)\s([\d\.]+)/i);t = "Unknown", a ? t = "Android " + a[2] : i ? t = "iPhone, iOS " + i[2].replace(/_/g, ".") : n ? t = "iPad, iOS " + n[2].replace(/_/g, ".") : o && (t = "iPod, iOS " + o[2].replace(/_/g, "."));var r = t,
              l = e.match(/MicroMessenger\/([\d\.]+)/i);t = "Unknown", l && l[1] ? (t = l[1], r += ", WeChat " + t, console.info("[system]", "System:", r)) : console.info("[system]", "System:", r), t = "Unknown", t = "https:" == location.protocol ? "HTTPS" : "http:" == location.protocol ? "HTTP" : location.protocol.replace(":", ""), r = t;var c = e.toLowerCase().match(/ nettype\/([^ ]+)/g);t = "Unknown", c && c[0] ? (c = c[0].split("/"), t = c[1], r += ", " + t, console.info("[system]", "Network:", r)) : console.info("[system]", "Protocol:", r), console.info("[system]", "UA:", e), setTimeout(function () {
            var e = window.performance || window.msPerformance || window.webkitPerformance;if (e && e.timing) {
              var t = e.timing;t.navigationStart && console.info("[system]", "navigationStart:", t.navigationStart), t.navigationStart && t.domainLookupStart && console.info("[system]", "navigation:", t.domainLookupStart - t.navigationStart + "ms"), t.domainLookupEnd && t.domainLookupStart && console.info("[system]", "dns:", t.domainLookupEnd - t.domainLookupStart + "ms"), t.connectEnd && t.connectStart && (t.connectEnd && t.secureConnectionStart ? console.info("[system]", "tcp (ssl):", t.connectEnd - t.connectStart + "ms (" + (t.connectEnd - t.secureConnectionStart) + "ms)") : console.info("[system]", "tcp:", t.connectEnd - t.connectStart + "ms")), t.responseStart && t.requestStart && console.info("[system]", "request:", t.responseStart - t.requestStart + "ms"), t.responseEnd && t.responseStart && console.info("[system]", "response:", t.responseEnd - t.responseStart + "ms"), t.domComplete && t.domLoading && (t.domContentLoadedEventStart && t.domLoading ? console.info("[system]", "domComplete (domLoaded):", t.domComplete - t.domLoading + "ms (" + (t.domContentLoadedEventStart - t.domLoading) + "ms)") : console.info("[system]", "domComplete:", t.domComplete - t.domLoading + "ms")), t.loadEventEnd && t.loadEventStart && console.info("[system]", "loadEvent:", t.loadEventEnd - t.loadEventStart + "ms"), t.navigationStart && t.loadEventEnd && console.info("[system]", "total (DOM):", t.loadEventEnd - t.navigationStart + "ms (" + (t.domComplete - t.navigationStart) + "ms)");
            }
          }, 0);
        } }]), t;
    }(v["default"]);t["default"] = h, e.exports = t["default"];
  }, function (e, t) {
    e.exports = '<div>\n  <div class="vc-log"></div>\n</div>';
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var o in e) {
        Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
      }return t["default"] = e, t;
    }function i(e) {
      return e && e.__esModule ? e : { "default": e };
    }function a(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function r(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) && "function" != typeof t ? e : t;
    }function l(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + (typeof t === "undefined" ? "undefined" : _typeof(t)));e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
    }Object.defineProperty(t, "__esModule", { value: !0 });var c = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }(),
        s = o(5),
        d = i(s),
        u = o(4),
        v = n(u),
        f = o(18),
        p = i(f),
        h = o(27),
        g = i(h),
        b = o(28),
        m = i(b),
        y = o(29),
        _ = i(y),
        w = function (e) {
      function t() {
        var e;a(this, t);for (var o = arguments.length, n = Array(o), i = 0; o > i; i++) {
          n[i] = arguments[i];
        }var l = r(this, (e = Object.getPrototypeOf(t)).call.apply(e, [this].concat(n)));return l.$tabbox = d["default"].render(g["default"], {}), l.$header = null, l.reqList = {}, l.domList = {}, l.isReady = !1, l.isShow = !1, l.isInBottom = !0, l._open = void 0, l._send = void 0, l.mockAjax(), l;
      }return l(t, e), c(t, [{ key: "onRenderTab", value: function value(e) {
          e(this.$tabbox);
        } }, { key: "onAddTool", value: function value(e) {
          var t = this,
              o = [{ name: "Clear", global: !1, onClick: function onClick(e) {
              t.clearLog();
            } }];e(o);
        } }, { key: "onReady", value: function value() {
          var e = this;e.isReady = !0, this.renderHeader(), d["default"].delegate(d["default"].one(".vc-log", this.$tabbox), "click", ".vc-group-preview", function (t) {
            var o = this.dataset.reqid,
                n = this.parentNode;d["default"].hasClass(n, "vc-actived") ? (d["default"].removeClass(n, "vc-actived"), e.updateRequest(o, { actived: !1 })) : (d["default"].addClass(n, "vc-actived"), e.updateRequest(o, { actived: !0 })), t.preventDefault();
          });var t = d["default"].one(".vc-content");d["default"].bind(t, "scroll", function (o) {
            e.isShow && (t.scrollTop + t.offsetHeight >= t.scrollHeight ? e.isInBottom = !0 : e.isInBottom = !1);
          });for (var o in e.reqList) {
            e.updateRequest(o, {});
          }
        } }, { key: "onRemove", value: function value() {
          window.XMLHttpRequest && (window.XMLHttpRequest.prototype.open = this._open, window.XMLHttpRequest.prototype.send = this._send, this._open = void 0, this._send = void 0);
        } }, { key: "onShow", value: function value() {
          this.isShow = !0, 1 == this.isInBottom && this.scrollToBottom();
        } }, { key: "onHide", value: function value() {
          this.isShow = !1;
        } }, { key: "onShowConsole", value: function value() {
          1 == this.isInBottom && this.scrollToBottom();
        } }, { key: "scrollToBottom", value: function value() {
          var e = d["default"].one(".vc-content");e.scrollTop = e.scrollHeight - e.offsetHeight;
        } }, { key: "clearLog", value: function value() {
          this.reqList = {};for (var e in this.domList) {
            this.domList[e].remove(), this.domList[e] = void 0;
          }this.domList = {}, this.renderHeader();
        } }, { key: "renderHeader", value: function value() {
          var e = Object.keys(this.reqList).length,
              t = d["default"].render(m["default"], { count: e }),
              o = d["default"].one(".vc-log", this.$tabbox);this.$header ? this.$header.parentNode.replaceChild(t, this.$header) : o.parentNode.insertBefore(t, o), this.$header = t;
        } }, { key: "updateRequest", value: function value(e, t) {
          var o = Object.keys(this.reqList).length,
              n = this.reqList[e] || {};for (var i in t) {
            n[i] = t[i];
          }if (this.reqList[e] = n, this.isReady) {
            var a = { id: e, url: n.url, status: n.status, method: n.method || "-", costTime: n.costTime > 0 ? n.costTime + "ms" : "-", header: n.header || null, getData: n.getData || null, postData: n.postData || null, response: null, actived: !!n.actived };switch (n.responseType) {case "":case "text":
                if (v.isString(n.response)) try {
                  a.response = JSON.parse(n.response), a.response = JSON.stringify(a.response, null, 1), a.response = v.htmlEncode(a.response);
                } catch (r) {
                  a.response = v.htmlEncode(n.response);
                } else "undefined" != typeof n.response && (a.response = Object.prototype.toString.call(n.response));break;case "json":
                "undefined" != typeof n.response && (a.response = JSON.stringify(n.response, null, 1));break;case "blob":case "document":case "arraybuffer":default:
                "undefined" != typeof n.response && (a.response = Object.prototype.toString.call(n.response));}0 == n.readyState || 1 == n.readyState ? a.status = "Pending" : 2 == n.readyState || 3 == n.readyState ? a.status = "Loading" : 4 == n.readyState || (a.status = "Unknown");var l = d["default"].render(_["default"], a),
                c = this.domList[e];n.status >= 400 && d["default"].addClass(d["default"].one(".vc-group-preview", l), "vc-table-row-error"), c ? c.parentNode.replaceChild(l, c) : d["default"].one(".vc-log", this.$tabbox).insertAdjacentElement("beforeend", l), this.domList[e] = l;var s = Object.keys(this.reqList).length;s != o && this.renderHeader(), this.isInBottom && this.scrollToBottom();
          }
        } }, { key: "mockAjax", value: function value() {
          var e = window.XMLHttpRequest;if (e) {
            var t = this,
                o = window.XMLHttpRequest.prototype.open,
                n = window.XMLHttpRequest.prototype.send;t._open = o, t._send = n, window.XMLHttpRequest.prototype.open = function () {
              var e = this,
                  n = [].slice.call(arguments),
                  i = n[0],
                  a = n[1],
                  r = t.getUniqueID(),
                  l = null;e._requestID = r, e._method = i, e._url = a;var c = e.onreadystatechange || function () {},
                  s = function s() {
                var o = t.reqList[r] || {};if (o.readyState = e.readyState, o.status = 0, e.readyState > 1 && (o.status = e.status), o.responseType = e.responseType, 0 == e.readyState) o.startTime || (o.startTime = +new Date());else if (1 == e.readyState) o.startTime || (o.startTime = +new Date());else if (2 == e.readyState) {
                  o.header = {};for (var n = e.getAllResponseHeaders() || "", i = n.split("\n"), a = 0; a < i.length; a++) {
                    var s = i[a];if (s) {
                      var d = s.split(": "),
                          u = d[0],
                          v = d.slice(1).join(": ");o.header[u] = v;
                    }
                  }
                } else 3 == e.readyState || (4 == e.readyState ? (clearInterval(l), o.endTime = +new Date(), o.costTime = o.endTime - (o.startTime || o.endTime), o.response = e.response) : clearInterval(l));return e._noVConsole || t.updateRequest(r, o), c.apply(e, arguments);
              };e.onreadystatechange = s;var d = -1;return l = setInterval(function () {
                d != e.readyState && (d = e.readyState, s.call(e));
              }, 10), o.apply(e, n);
            }, window.XMLHttpRequest.prototype.send = function () {
              var e = this,
                  o = [].slice.call(arguments),
                  i = o[0],
                  a = t.reqList[e._requestID] || {};a.method = e._method.toUpperCase();var r = e._url.split("?");if (a.url = r.shift(), r.length > 0) {
                a.getData = {}, r = r.join("?"), r = r.split("&");var l = !0,
                    c = !1,
                    s = void 0;try {
                  for (var d, u = r[Symbol.iterator](); !(l = (d = u.next()).done); l = !0) {
                    var f = d.value;f = f.split("="), a.getData[f[0]] = f[1];
                  }
                } catch (p) {
                  c = !0, s = p;
                } finally {
                  try {
                    !l && u["return"] && u["return"]();
                  } finally {
                    if (c) throw s;
                  }
                }
              }if ("POST" == a.method) if (v.isString(i)) {
                var h = i.split("&");a.postData = {};var g = !0,
                    b = !1,
                    m = void 0;try {
                  for (var y, _ = h[Symbol.iterator](); !(g = (y = _.next()).done); g = !0) {
                    var w = y.value;w = w.split("="), a.postData[w[0]] = w[1];
                  }
                } catch (p) {
                  b = !0, m = p;
                } finally {
                  try {
                    !g && _["return"] && _["return"]();
                  } finally {
                    if (b) throw m;
                  }
                }
              } else v.isPlainObject(i) && (a.postData = i);return e._noVConsole || t.updateRequest(e._requestID, a), n.apply(e, o);
            };
          }
        } }, { key: "getUniqueID", value: function value() {
          var e = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
            var t = 16 * Math.random() | 0,
                o = "x" == e ? t : 3 & t | 8;return o.toString(16);
          });return e;
        } }]), t;
    }(p["default"]);t["default"] = w, e.exports = t["default"];
  }, function (e, t) {
    e.exports = '<div class="vc-table">\n  <div class="vc-log"></div>\n</div>';
  }, function (e, t) {
    e.exports = '<dl class="vc-table-row">\n  <dd class="vc-table-col vc-table-col-4">Name {{if (count > 0)}}({{count}}){{/if}}</dd>\n  <dd class="vc-table-col">Method</dd>\n  <dd class="vc-table-col">Status</dd>\n  <dd class="vc-table-col">Time</dd>\n</dl>';
  }, function (e, t) {
    e.exports = '<div class="vc-group {{actived ? \'vc-actived\' : \'\'}}">\n  <dl class="vc-table-row vc-group-preview" data-reqid="{{id}}">\n    <dd class="vc-table-col vc-table-col-4">{{url}}</dd>\n    <dd class="vc-table-col">{{method}}</dd>\n    <dd class="vc-table-col">{{status}}</dd>\n    <dd class="vc-table-col">{{costTime}}</dd>\n  </dl>\n  <div class="vc-group-detail">\n    {{if (header !== null)}}\n    <div>\n      <dl class="vc-table-row vc-left-border">\n        <dt class="vc-table-col vc-table-col-title">Headers</dt>\n      </dl>\n      {{for (var key in header)}}\n      <div class="vc-table-row vc-left-border vc-small">\n        <div class="vc-table-col vc-table-col-2">{{key}}</div>\n        <div class="vc-table-col vc-table-col-4 vc-max-height-line">{{header[key]}}</div>\n      </div>\n      {{/for}}\n    </div>\n    {{/if}}\n    {{if (getData !== null)}}\n    <div>\n      <dl class="vc-table-row vc-left-border">\n        <dt class="vc-table-col vc-table-col-title">Query String Parameters</dt>\n      </dl>\n      {{for (var key in getData)}}\n      <div class="vc-table-row vc-left-border vc-small">\n        <div class="vc-table-col vc-table-col-2">{{key}}</div>\n        <div class="vc-table-col vc-table-col-4 vc-max-height-line">{{getData[key]}}</div>\n      </div>\n      {{/for}}\n    </div>\n    {{/if}}\n    {{if (postData !== null)}}\n    <div>\n      <dl class="vc-table-row vc-left-border">\n        <dt class="vc-table-col vc-table-col-title">Form Data</dt>\n      </dl>\n      {{for (var key in postData)}}\n      <div class="vc-table-row vc-left-border vc-small">\n        <div class="vc-table-col vc-table-col-2">{{key}}</div>\n        <div class="vc-table-col vc-table-col-4 vc-max-height-line">{{postData[key]}}</div>\n      </div>\n      {{/for}}\n    </div>\n    {{/if}}\n    <div>\n      <dl class="vc-table-row vc-left-border">\n        <dt class="vc-table-col vc-table-col-title">Response</dt>\n      </dl>\n      <div class="vc-table-row vc-left-border vc-small">\n        <pre class="vc-table-col vc-max-height vc-min-height">{{response || \'\'}}</pre>\n      </div>\n    </div>\n  </div>\n</div>';
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var o in e) {
        Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
      }return t["default"] = e, t;
    }function i(e) {
      return e && e.__esModule ? e : { "default": e };
    }function a(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function r(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) && "function" != typeof t ? e : t;
    }function l(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + (typeof t === "undefined" ? "undefined" : _typeof(t)));e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
    }Object.defineProperty(t, "__esModule", { value: !0 });var c = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }();o(31);var s = o(18),
        d = i(s),
        u = o(33),
        v = i(u),
        f = o(34),
        p = i(f),
        h = o(4),
        g = (n(h), o(5)),
        b = i(g),
        m = function (e) {
      function t() {
        var e;a(this, t);for (var o = arguments.length, n = Array(o), i = 0; o > i; i++) {
          n[i] = arguments[i];
        }var l = r(this, (e = Object.getPrototypeOf(t)).call.apply(e, [this].concat(n))),
            c = l;c.isInited = !1, c.node = {}, c.$tabbox = b["default"].render(v["default"], {}), c.nodes = [], c.activedElem = {};var s = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;return c.observer = new s(function (e) {
          for (var t = 0; t < e.length; t++) {
            var o = e[t];c._isInVConsole(o.target) || c.onMutation(o);
          }
        }), l;
      }return l(t, e), c(t, [{ key: "onRenderTab", value: function value(e) {
          e(this.$tabbox);
        } }, { key: "onAddTool", value: function value(e) {
          var t = this,
              o = [{ name: "Expend", global: !1, onClick: function onClick(e) {
              if (t.activedElem) if (b["default"].hasClass(t.activedElem, "vc-toggle")) for (var o = 0; o < t.activedElem.childNodes.length; o++) {
                var n = t.activedElem.childNodes[o];if (b["default"].hasClass(n, "vcelm-l") && !b["default"].hasClass(n, "vcelm-noc") && !b["default"].hasClass(n, "vc-toggle")) {
                  b["default"].one(".vcelm-node", n).click();break;
                }
              } else b["default"].one(".vcelm-node", t.activedElem).click();
            } }, { name: "Collapse", global: !1, onClick: function onClick(e) {
              t.activedElem && (b["default"].hasClass(t.activedElem, "vc-toggle") ? b["default"].one(".vcelm-node", t.activedElem).click() : t.activedElem.parentNode && b["default"].hasClass(t.activedElem.parentNode, "vcelm-l") && b["default"].one(".vcelm-node", t.activedElem.parentNode).click());
            } }];e(o);
        } }, { key: "onShow", value: function value() {
          if (!this.isInited) {
            this.isInited = !0, this.node = this.getNode(document.documentElement);var e = this.renderView(this.node, b["default"].one(".vc-log", this.$tabbox)),
                t = b["default"].one(".vcelm-node", e);t && t.click();var o = { attributes: !0, childList: !0, characterData: !0, subtree: !0 };this.observer.observe(document.documentElement, o);
          }
        } }, { key: "onRemove", value: function value() {
          this.observer.disconnect();
        } }, { key: "onMutation", value: function value(e) {
          switch (e.type) {case "childList":
              e.removedNodes.length > 0 && this.onChildRemove(e), e.addedNodes.length > 0 && this.onChildAdd(e);break;case "attributes":
              this.onAttributesChange(e);break;case "characterData":
              this.onCharacterDataChange(e);}
        } }, { key: "onChildRemove", value: function value(e) {
          var t = e.target,
              o = t.__vconsole_node;if (o) {
            for (var n = 0; n < e.removedNodes.length; n++) {
              var i = e.removedNodes[n],
                  a = i.__vconsole_node;a && a.view && a.view.parentNode.removeChild(a.view);
            }this.getNode(t);
          }
        } }, { key: "onChildAdd", value: function value(e) {
          var t = e.target,
              o = t.__vconsole_node;if (o) {
            this.getNode(t), o.view && b["default"].removeClass(o.view, "vcelm-noc");for (var n = 0; n < e.addedNodes.length; n++) {
              var i = e.addedNodes[n],
                  a = i.__vconsole_node;if (a) if (null !== e.nextSibling) {
                var r = e.nextSibling.__vconsole_node;r.view && this.renderView(a, r.view, "insertBefore");
              } else o.view && (o.view.lastChild ? this.renderView(a, o.view.lastChild, "insertBefore") : this.renderView(a, o.view));
            }
          }
        } }, { key: "onAttributesChange", value: function value(e) {
          var t = e.target.__vconsole_node;t && (t = this.getNode(e.target), t.view && this.renderView(t, t.view, !0));
        } }, { key: "onCharacterDataChange", value: function value(e) {
          var t = e.target.__vconsole_node;t && (t = this.getNode(e.target), t.view && this.renderView(t, t.view, !0));
        } }, { key: "renderView", value: function value(e, t, o) {
          var n = this,
              i = new p["default"](e).get();switch (e.view = i, b["default"].delegate(i, "click", ".vcelm-node", function (t) {
            t.stopPropagation();var o = this.parentNode;if (!b["default"].hasClass(o, "vcelm-noc")) {
              n.activedElem = o, b["default"].hasClass(o, "vc-toggle") ? b["default"].removeClass(o, "vc-toggle") : b["default"].addClass(o, "vc-toggle");for (var i = -1, a = 0; a < o.children.length; a++) {
                var r = o.children[a];b["default"].hasClass(r, "vcelm-l") && (i++, r.children.length > 0 || (e.childNodes[i] ? n.renderView(e.childNodes[i], r, "replace") : r.style.display = "none"));
              }
            }
          }), o) {case "replace":
              t.parentNode.replaceChild(i, t);break;case "insertBefore":
              t.parentNode.insertBefore(i, t);break;default:
              t.appendChild(i);}return i;
        } }, { key: "getNode", value: function value(e) {
          if (!this._isIgnoredElement(e)) {
            var t = e.__vconsole_node || {};if (t.nodeType = e.nodeType, t.nodeName = e.nodeName, t.tagName = e.tagName || "", t.textContent = "", t.nodeType != e.TEXT_NODE && t.nodeType != e.DOCUMENT_TYPE_NODE || (t.textContent = e.textContent), t.id = e.id || "", t.className = e.className || "", t.attributes = [], e.hasAttributes && e.hasAttributes()) for (var o = 0; o < e.attributes.length; o++) {
              t.attributes.push({ name: e.attributes[o].name, value: e.attributes[o].value || "" });
            }if (t.childNodes = [], e.childNodes.length > 0) for (var n = 0; n < e.childNodes.length; n++) {
              var i = this.getNode(e.childNodes[n]);i && t.childNodes.push(i);
            }return e.__vconsole_node = t, t;
          }
        } }, { key: "_isIgnoredElement", value: function value(e) {
          return e.nodeType == e.TEXT_NODE && "" == e.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$|\n+/g, "");
        } }, { key: "_isInVConsole", value: function value(e) {
          for (var t = e; void 0 != t;) {
            if ("__vconsole" == t.id) return !0;t = t.parentNode || void 0;
          }return !1;
        } }]), t;
    }(d["default"]);t["default"] = m, e.exports = t["default"];
  }, function (e, t, o) {
    var n = o(32);"string" == typeof n && (n = [[e.id, n, ""]]);o(10)(n, {});n.locals && (e.exports = n.locals);
  }, function (e, t, o) {
    t = e.exports = o(9)(), t.push([e.id, '.vcelm-node{color:#183691}.vcelm-k{color:#0086b3}.vcelm-v{color:#905}.vcelm-l{padding-left:8px;position:relative;word-wrap:break-word;line-height:1}.vcelm-l.vc-toggle>.vcelm-node{display:block}.vcelm-l .vcelm-node:active{background-color:rgba(0,0,0,.15)}.vcelm-l.vcelm-noc .vcelm-node:active{background-color:transparent}.vcelm-t{white-space:pre-wrap;word-wrap:break-word}.vcelm-l .vcelm-l{display:none}.vcelm-l.vc-toggle>.vcelm-l{margin-left:4px;display:block}.vcelm-l:before{content:"";display:block;position:absolute;top:6px;left:3px;width:0;height:0;border:3px solid transparent;border-left-color:#000}.vcelm-l.vc-toggle:before{display:block;top:6px;left:0;border-top-color:#000;border-left-color:transparent}.vcelm-l.vcelm-noc:before{display:none}', ""]);
  }, function (e, t) {
    e.exports = '<div>\n  <div class="vc-log"></div>\n</div>';
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var o in e) {
        Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
      }return t["default"] = e, t;
    }function i(e) {
      return e && e.__esModule ? e : { "default": e };
    }function a(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function r(e) {
      var t = ["br", "hr", "img", "input", "link", "meta"];return e = e ? e.toLowerCase() : "", t.indexOf(e) > -1;
    }function l(e) {
      return document.createTextNode(e);
    }function c(e) {
      return e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    }Object.defineProperty(t, "__esModule", { value: !0 });var s = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }(),
        d = o(35),
        u = i(d),
        v = o(36),
        f = i(v),
        p = o(4),
        h = (n(p), o(5)),
        g = i(h),
        b = function () {
      function e(t) {
        a(this, e), this.node = t, this.view = this._create(this.node);
      }return s(e, [{ key: "get", value: function value() {
          return this.view;
        } }, { key: "_create", value: function value(e, t) {
          var o = document.createElement("DIV");switch (g["default"].addClass(o, "vcelm-l"), e.nodeType) {case o.ELEMENT_NODE:
              this._createElementNode(e, o);break;case o.TEXT_NODE:
              this._createTextNode(e, o);break;case o.COMMENT_NODE:case o.DOCUMENT_NODE:case o.DOCUMENT_TYPE_NODE:case o.DOCUMENT_FRAGMENT_NODE:}return o;
        } }, { key: "_createTextNode", value: function value(e, t) {
          g["default"].addClass(t, "vcelm-t vcelm-noc"), e.textContent && t.appendChild(l(c(e.textContent)));
        } }, { key: "_createElementNode", value: function value(e, t) {
          var o = r(e.tagName),
              n = o;0 == e.childNodes.length && (n = !0);var i = g["default"].render(u["default"], { node: e }),
              a = g["default"].render(f["default"], { node: e });if (n) g["default"].addClass(t, "vcelm-noc"), t.appendChild(i), o || t.appendChild(a);else {
            t.appendChild(i);for (var l = 0; l < e.childNodes.length; l++) {
              var c = document.createElement("DIV");g["default"].addClass(c, "vcelm-l"), t.appendChild(c);
            }o || t.appendChild(a);
          }
        } }]), e;
    }();t["default"] = b, e.exports = t["default"];
  }, function (e, t) {
    e.exports = '<span class="vcelm-node">&lt;{{node.tagName.toLowerCase()}}{{if (node.className || node.attributes.length)}}\n  <i class="vcelm-k">\n    {{for (var i = 0; i < node.attributes.length; i++)}}\n      {{if (node.attributes[i].value !== \'\')}}\n        {{node.attributes[i].name}}="<i class="vcelm-v">{{node.attributes[i].value}}</i>"{{else}}\n        {{node.attributes[i].name}}{{/if}}{{/for}}</i>{{/if}}&gt;</span>';
  }, function (e, t) {
    e.exports = '<span class="vcelm-node">&lt;/{{node.tagName.toLowerCase()}}&gt;</span>';
  }, function (e, t, o) {
    "use strict";
    function n(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var o in e) {
        Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
      }return t["default"] = e, t;
    }function i(e) {
      return e && e.__esModule ? e : { "default": e };
    }function a(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function r(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) && "function" != typeof t ? e : t;
    }function l(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + (typeof t === "undefined" ? "undefined" : _typeof(t)));e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
    }Object.defineProperty(t, "__esModule", { value: !0 });var c = function () {
      function e(e, t) {
        for (var o = 0; o < t.length; o++) {
          var n = t[o];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, o, n) {
        return o && e(t.prototype, o), n && e(t, n), t;
      };
    }(),
        s = o(18),
        d = i(s),
        u = o(38),
        v = i(u),
        f = o(39),
        p = i(f),
        h = o(4),
        g = n(h),
        b = o(5),
        m = i(b),
        y = function (e) {
      function t() {
        var e;a(this, t);for (var o = arguments.length, n = Array(o), i = 0; o > i; i++) {
          n[i] = arguments[i];
        }var l = r(this, (e = Object.getPrototypeOf(t)).call.apply(e, [this].concat(n)));return l.$tabbox = m["default"].render(v["default"], {}), l.currentType = "", l.typeNameMap = { cookies: "Cookies", localstorage: "LocalStorage" }, l;
      }return l(t, e), c(t, [{ key: "onRenderTab", value: function value(e) {
          e(this.$tabbox);
        } }, { key: "onAddTopBar", value: function value(e) {
          for (var t = this, o = ["Cookies", "LocalStorage"], n = [], i = 0; i < o.length; i++) {
            n.push({ name: o[i], data: { type: o[i].toLowerCase() }, className: "", onClick: function onClick() {
                return m["default"].hasClass(this, "vc-actived") ? !1 : (t.currentType = this.dataset.type, void t.renderStorage());
              } });
          }n[0].className = "vc-actived", e(n);
        } }, { key: "onAddTool", value: function value(e) {
          var t = this,
              o = [{ name: "Refresh", global: !1, onClick: function onClick(e) {
              t.renderStorage();
            } }, { name: "Clear", global: !1, onClick: function onClick(e) {
              t.clearLog();
            } }];e(o);
        } }, { key: "onReady", value: function value() {} }, { key: "onShow", value: function value() {
          "" == this.currentType && (this.currentType = "cookies", this.renderStorage());
        } }, { key: "clearLog", value: function value() {
          if (this.currentType && window.confirm) {
            var e = window.confirm("Remove all " + this.typeNameMap[this.currentType] + "?");if (!e) return !1;
          }switch (this.currentType) {case "cookies":
              this.clearCookieList();break;case "localstorage":
              this.clearLocalStorageList();break;default:
              return !1;}this.renderStorage();
        } }, { key: "renderStorage", value: function value() {
          var e = [];switch (this.currentType) {case "cookies":
              e = this.getCookieList();break;case "localstorage":
              e = this.getLocalStorageList();break;default:
              return !1;}var t = m["default"].one(".vc-log", this.$tabbox);if (0 == e.length) t.innerHTML = "";else {
            for (var o = 0; o < e.length; o++) {
              e[o].name = g.htmlEncode(e[o].name), e[o].value = g.htmlEncode(e[o].value);
            }t.innerHTML = m["default"].render(p["default"], { list: e }, !0);
          }
        } }, { key: "getCookieList", value: function value() {
          if (!document.cookie || !navigator.cookieEnabled) return [];for (var e = [], t = document.cookie.split(";"), o = 0; o < t.length; o++) {
            var n = t[o].split("="),
                i = n.shift().replace(/^ /, ""),
                a = n.join("=");e.push({ name: decodeURIComponent(i), value: decodeURIComponent(a) });
          }return e;
        } }, { key: "getLocalStorageList", value: function value() {
          if (!window.localStorage) return [];try {
            for (var e = [], t = 0; t < localStorage.length; t++) {
              var o = localStorage.key(t),
                  n = localStorage.getItem(o);e.push({ name: o, value: n });
            }return e;
          } catch (i) {
            return [];
          }
        } }, { key: "clearCookieList", value: function value() {
          if (document.cookie && navigator.cookieEnabled) {
            for (var e = this.getCookieList(), t = 0; t < e.length; t++) {
              document.cookie = e[t].name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }this.renderStorage();
          }
        } }, { key: "clearLocalStorageList", value: function value() {
          if (window.localStorage) try {
            localStorage.clear(), this.renderStorage();
          } catch (e) {
            alert("localStorage.clear() fail.");
          }
        } }]), t;
    }(d["default"]);t["default"] = y, e.exports = t["default"];
  }, function (e, t) {
    e.exports = '<div class="vc-table">\n  <div class="vc-log"></div>\n</div>';
  }, function (e, t) {
    e.exports = '<div>\n  <dl class="vc-table-row">\n    <dd class="vc-table-col">Name</dd>\n    <dd class="vc-table-col vc-table-col-2">Value</dd>\n  </dl>\n  {{for (var i = 0; i < list.length; i++)}}\n  <dl class="vc-table-row">\n    <dd class="vc-table-col">{{list[i].name}}</dd>\n    <dd class="vc-table-col vc-table-col-2">{{list[i].value}}</dd>\n  </dl>\n  {{/for}}\n</div>';
  }]);
});

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * WebAR简单类
 * @param interval 识别间隔时间(毫秒)
 * @param recognizeUrl 识别服务地址
 * @constructor
 */

var WebAR = function WebAR(interval, recognizeUrl) {
    var interval = interval || 1000;
    var recognizeUrl = recognizeUrl || '';

    var videoSetting = { width: 320, height: 240 };
    var videoElement = null;
    var videoDeviceElement = null;

    var canvasElement = null;
    var canvasContext = null;

    var timer = null;
    var isRecognizing = false;

    this.devices = [];

    var debug = document.createElement('div');
    debug.setAttribute('id', 'debug');
    debug.setAttribute('width', (window.innerWidth / 2).toString());
    debug.setAttribute('height', window.innerHeight.toString());
    document.body.appendChild(debug);

    /**
     * 列出所有摄像头
     * @param videoDevice
     * @returns {Promise}
     */
    this.listCamera = function () {

        var _this = this;
        return new Promise(function (resolve, reject) {
            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                console.log(devices);
                devices.find(function (device) {
                    if (device.kind === 'videoinput') {
                        console.log(device);
                        var deviceInfo = {};

                        deviceInfo['name'] = device.label || 'camera';
                        deviceInfo['deviceId'] = device.deviceId;
                        // 将摄像头id存储在select元素中，方便切换前、后置摄像头
                        _this.devices.push(deviceInfo);
                    }
                });
                if (_this.devices.length === 0) {
                    reject('没有摄像头');
                } else {
                    // 创建canvas，截取摄像头图片时使用
                    canvasElement = document.createElement('canvas');
                    canvasContext = canvasElement.getContext('2d');
                    resolve(_this.devices);
                }
            }).catch(function (err) {
                reject(err);
            });
        });
    };

    /**
     * 打开摄像头
     * @param video
     * @param deviceId
     * @param setting
     * @returns {Promise}
     */
    this.openCamera = function (video, deviceId, setting) {
        videoElement = video;
        if (setting) {
            videoSetting = setting;
        }

        // 摄像头参数
        // 更多参数请查看 https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
        var constraints = {
            audio: false,
            video: { deviceId: { exact: deviceId } }
        };

        canvasElement.setAttribute('width', videoSetting.width + 'px');
        canvasElement.setAttribute('height', videoSetting.height + 'px');

        // 如果是切换摄像头，则需要先关闭。
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        return new Promise(function (resolve, reject) {
            navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                videoElement.srcObject = stream;
                videoElement.style.display = 'block';
                videoElement.play();
                resolve(true);
            }).catch(function (err) {
                reject(err);
            });
        });
    };

    /**
     * 截取摄像头图片，返回 base64编码后的图片数据
     * @returns {string}
     */
    this.captureVideo = function () {
        canvasContext.drawImage(videoElement, 0, 0, videoSetting.width, videoSetting.height);
        return canvasElement.toDataURL('image/jpeg', 0.5).split('base64,')[1];
    };

    /**
     * 识别
     */
    this.startRecognize = function (callback) {
        var _this2 = this;

        timer = window.setInterval(function () {
            if (isRecognizing) return;

            isRecognizing = true;

            // 从摄像头中抓取一张图片
            var image = { image: _this2.captureVideo() };

            // 发送到服务器识别
            _this2.httpPost(recognizeUrl, image).then(function (msg) {
                _this2.stopRecognize();

                callback(msg);
            }).catch(function (err) {
                isRecognizing = false;
                _this2.trace(err);
            });
        }, interval);
    };

    /**
     * 停止识别
     */
    this.stopRecognize = function () {
        if (timer) {
            window.clearInterval(timer);
            isRecognizing = false;
        }
    };

    /**
     * HTTP请求，可以使用jQuery等代替
     * @param url
     * @param image
     * @returns {Promise}
     */
    this.httpPost = function (url, image) {
        return new Promise(function (resolve, reject) {
            var http = new XMLHttpRequest();
            http.onload = function () {
                try {
                    var msg = JSON.parse(http.responseText);
                    if (http.status === 200) {
                        if (msg.statusCode === 0) {
                            resolve(msg.result);
                        } else {
                            reject(msg);
                        }
                    } else {
                        reject(msg);
                    }
                } catch (err) {
                    reject(err);
                }
            };
            http.onerror = function (err) {
                reject(err);
            };

            http.open('POST', url);
            http.setRequestHeader('Content-Type', 'application/json;Charset=UTF-8');
            http.send(JSON.stringify(image));
        });
    };

    /**
     * 调用输出
     * @param arg
     */
    this.trace = function (arg) {
        if (typeof arg === 'string') {
            debug.innerHTML += arg;
        } else {
            debug.innerHTML += JSON.stringify(arg);
        }
        debug.innerHTML += '<br />';
    };
};
exports.default = WebAR;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaW5kZXguanMiLCJzcmMvanMvdmNvbnNvbGUubWluLmpzIiwic3JjL2pzL3dlYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7OztBQUNBOzs7Ozs7QUFDQSxJQUFJLGtCQUFKOztBQUVBLElBQU0sS0FBSyxVQUFVLFNBQVYsQ0FBb0IsV0FBcEIsRUFBWDtBQUFBLElBQ0ksWUFBWSxXQUFXLElBQVgsQ0FBZ0IsRUFBaEIsQ0FEaEI7QUFBQSxJQUVJLFdBQVcsMEJBQTBCLElBQTFCLENBQStCLEVBQS9CLENBRmY7QUFBQSxJQUdJLFdBQVcsa0JBQWtCLElBQWxCLENBQXVCLEVBQXZCLENBSGY7O0FBS0EsSUFBTSxRQUFRLElBQUksZUFBSixDQUFVLElBQVYsRUFBZ0IsZ0JBQWhCLENBQWQ7QUFDQSxJQUFNLGFBQWEsRUFBRSxhQUFGLENBQW5CO0FBQ0EsSUFBTSxRQUFRLEVBQUUsUUFBRixFQUFZLENBQVosQ0FBZDtBQUNBLElBQUksaUJBQUosQyxDQUFjOztBQUVkLFFBQVEsR0FBUixDQUFZLEVBQVo7QUFDQSxRQUFRLEdBQVIsQ0FBWSxXQUFaLEVBQXdCLFNBQXhCOztBQUVBLElBQUksWUFBWSxRQUFoQixFQUEwQixDQUV6Qjs7QUFFRDtBQUNBLE1BQU0sVUFBTixHQUNLLElBREwsQ0FDVSxVQUFDLFdBQUQsRUFBaUI7QUFDbkIsWUFBUSxHQUFSLENBQVksV0FBWjtBQUNBO0FBQ0EsUUFBRyxTQUFILEVBQWE7QUFDWixnQkFBUSxHQUFSLENBQVksU0FBWjtBQUNBLG1CQUFXLFlBQVksWUFBWSxNQUFaLEdBQW9CLENBQWhDLEVBQW1DLFFBQTlDO0FBQ0EsS0FIRCxNQUdNLElBQUcsUUFBSCxFQUFZO0FBQ2pCLG1CQUFXLFlBQVksQ0FBWixFQUFlLFFBQTFCO0FBQ0E7QUFFSixDQVhMLEVBWUssS0FaTCxDQVlXLFVBQUMsR0FBRCxFQUFTO0FB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cyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IFdlYkFSIGZyb20gJy4vd2ViYXInO1xuaW1wb3J0IFZDb25zb2xlIGZyb20gJy4vdmNvbnNvbGUubWluJztcbm5ldyBWQ29uc29sZSgpO1xuXG5jb25zdCB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSxcbiAgICBpc0FuZHJvaWQgPSAvYW5kcm9pZC9pLnRlc3QodWEpLFxuICAgIGlzSXBob25lID0gLyhpUGhvbmV8aVBhZHxpUG9kfGlPUykvaS50ZXN0KHVhKSxcbiAgICBpc1dlQ2hhdCA9IC9NaWNyb01lc3Nlbmdlci9pLnRlc3QodWEpO1xuXG5jb25zdCB3ZWJBUiA9IG5ldyBXZWJBUigxMDAwLCAnL3JlY29nbml6ZS5waHAnKTtcbmNvbnN0IG9wZW5DYW1lcmEgPSAkKFwiI29wZW5DYW1lcmFcIik7XG5jb25zdCB2aWRlbyA9ICQoJyN2aWRlbycpWzBdO1xubGV0IGRldmljZUlkOyAvL+aMh+Wumuiwg+eUqOiuvuWkh0lEXG5cbmNvbnNvbGUubG9nKHVhKTtcbmNvbnNvbGUubG9nKCdpc1dlYmNhcnQnLGlzQW5kcm9pZCk7XG5cbmlmIChpc0lwaG9uZSAmJiBpc1dlQ2hhdCkge1xuXG59XG5cbi8vIOWIl+WHuuinhumikeiuvuWkh1xud2ViQVIubGlzdENhbWVyYSgpXG4gICAgLnRoZW4oKHZpZGVvRGV2aWNlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKHZpZGVvRGV2aWNlKTtcbiAgICAgICAgLy/mtYvkuobkuIDkupvmiYvmnLrvvIxhbmRyb2lk5ZCO572u5pGE5YOP5aS05bqU6K+l5piv5pWw57uE55qE5pyA5ZCO5LiA5Liq77yM6Iu55p6c5piv56ys5LiA5LiqXG4gICAgICAgIGlmKGlzQW5kcm9pZCl7XG4gICAgICAgIFx0Y29uc29sZS5sb2coJ2FuZHJvaWQnKTtcbiAgICAgICAgXHRkZXZpY2VJZCA9IHZpZGVvRGV2aWNlW3ZpZGVvRGV2aWNlLmxlbmd0aCAtMV0uZGV2aWNlSWQ7XG4gICAgICAgIH1lbHNlIGlmKGlzSXBob25lKXtcbiAgICAgICAgXHRkZXZpY2VJZCA9IHZpZGVvRGV2aWNlWzBdLmRldmljZUlkO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICBhbGVydCgn6K+l6K6+5aSH5LiN5pSv5oyB5omT5byA5pGE5YOP5aS0Jyk7XG4gICAgfSk7XG5cblxuXG5vcGVuQ2FtZXJhLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIHdlYkFSLm9wZW5DYW1lcmEodmlkZW8sIGRldmljZUlkKVxuICAgICAgICAudGhlbigobXNnKSA9PiB7XG4gICAgICAgICAgICAvLyDmiZPlvIDmkYTlg4/lpLTmiJDlip9cbiAgICAgICAgICAgIC8vIOWwhuinhumikemTuua7oeWFqOWxjyjnroDljZXlpITnkIYpXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHZpZGVvV2lkdGggPSB2aWRlby5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgdmlkZW9IZWlnaHQgPSB2aWRlby5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCB3aW5kb3cuaW5uZXJIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g56uW5bGPXG4gICAgICAgICAgICAgICAgICAgIGlmICh2aWRlb0hlaWdodCA8IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB3aW5kb3cuaW5uZXJIZWlnaHQudG9TdHJpbmcoKSArICdweCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5qiq5bGPXG4gICAgICAgICAgICAgICAgICAgIGlmICh2aWRlb1dpZHRoIDwgd2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB3aW5kb3cuaW5uZXJXaWR0aC50b1N0cmluZygpICsgJ3B4Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgb3BlbkNhbWVyYS5oaWRlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBhbGVydCgn5omT5byA6KeG6aKR6K6+5aSH5aSx6LSlJyk7XG4gICAgICAgIH0pO1xuXG5cbn0pOyIsIi8qIVxuICogdkNvbnNvbGUgdjMuMi4wIChodHRwczovL2dpdGh1Yi5jb20vVGVuY2VudC92Q29uc29sZSlcbiAqIFxuICogVGVuY2VudCBpcyBwbGVhc2VkIHRvIHN1cHBvcnQgdGhlIG9wZW4gc291cmNlIGNvbW11bml0eSBieSBtYWtpbmcgdkNvbnNvbGUgYXZhaWxhYmxlLlxuICogQ29weXJpZ2h0IChDKSAyMDE3IFRITCBBMjkgTGltaXRlZCwgYSBUZW5jZW50IGNvbXBhbnkuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbiFmdW5jdGlvbihlLHQpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPXQoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLHQpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP2V4cG9ydHMuVkNvbnNvbGU9dCgpOmUuVkNvbnNvbGU9dCgpfSh0aGlzLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQobil7aWYob1tuXSlyZXR1cm4gb1tuXS5leHBvcnRzO3ZhciBpPW9bbl09e2V4cG9ydHM6e30saWQ6bixsb2FkZWQ6ITF9O3JldHVybiBlW25dLmNhbGwoaS5leHBvcnRzLGksaS5leHBvcnRzLHQpLGkubG9hZGVkPSEwLGkuZXhwb3J0c312YXIgbz17fTtyZXR1cm4gdC5tPWUsdC5jPW8sdC5wPVwiXCIsdCgwKX0oW2Z1bmN0aW9uKGUsdCxvKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7XCJkZWZhdWx0XCI6ZX19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksbygxKTt2YXIgaT1vKDIpLGE9bihpKSxyPW8oMTgpLGw9bihyKTthW1wiZGVmYXVsdFwiXS5WQ29uc29sZVBsdWdpbj1sW1wiZGVmYXVsdFwiXSx0W1wiZGVmYXVsdFwiXT1hW1wiZGVmYXVsdFwiXSxlLmV4cG9ydHM9dFtcImRlZmF1bHRcIl19LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFN5bWJvbCl7d2luZG93LlN5bWJvbD1mdW5jdGlvbigpe307dmFyIG89XCJfX3N5bWJvbF9pdGVyYXRvcl9rZXlcIjt3aW5kb3cuU3ltYm9sLml0ZXJhdG9yPW8sQXJyYXkucHJvdG90eXBlW29dPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcyx0PTA7cmV0dXJue25leHQ6ZnVuY3Rpb24oKXtyZXR1cm57ZG9uZTplLmxlbmd0aD09PXQsdmFsdWU6ZS5sZW5ndGg9PT10P3ZvaWQgMDplW3QrK119fX19fX0sZnVuY3Rpb24oZSx0LG8pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4oZSl7aWYoZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciB0PXt9O2lmKG51bGwhPWUpZm9yKHZhciBvIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsbykmJih0W29dPWVbb10pO3JldHVybiB0W1wiZGVmYXVsdFwiXT1lLHR9ZnVuY3Rpb24gaShlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e1wiZGVmYXVsdFwiOmV9fWZ1bmN0aW9uIGEoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciByPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbz0wO288dC5sZW5ndGg7bysrKXt2YXIgbj10W29dO24uZW51bWVyYWJsZT1uLmVudW1lcmFibGV8fCExLG4uY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIG4mJihuLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxuLmtleSxuKX19cmV0dXJuIGZ1bmN0aW9uKHQsbyxuKXtyZXR1cm4gbyYmZSh0LnByb3RvdHlwZSxvKSxuJiZlKHQsbiksdH19KCksbD1vKDMpLGM9aShsKSxzPW8oNCksZD1uKHMpLHU9byg1KSx2PWkodSk7byg3KTt2YXIgZj1vKDExKSxwPWkoZiksaD1vKDEyKSxnPWkoaCksYj1vKDEzKSxtPWkoYikseT1vKDE0KSxfPWkoeSksdz1vKDE1KSx4PWkodyksaz1vKDE2KSxDPWkoayksVD1vKDI0KSxPPWkoVCksRT1vKDI2KSxTPWkoRSksTD1vKDMwKSxqPWkoTCksTj1vKDM3KSxQPWkoTiksTT1cIiNfX3Zjb25zb2xlXCIsQT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7aWYoYSh0aGlzLGUpLHZbXCJkZWZhdWx0XCJdLm9uZShNKSlyZXR1cm4gdm9pZCBjb25zb2xlLmRlYnVnKFwidkNvbnNvbGUgaXMgYWxyZWFkeSBleGlzdHMuXCIpO3ZhciBvPXRoaXM7aWYodGhpcy52ZXJzaW9uPWNbXCJkZWZhdWx0XCJdLnZlcnNpb24sdGhpcy4kZG9tPW51bGwsdGhpcy5pc0luaXRlZD0hMSx0aGlzLm9wdGlvbj17ZGVmYXVsdFBsdWdpbnM6W1wic3lzdGVtXCIsXCJuZXR3b3JrXCIsXCJlbGVtZW50XCIsXCJzdG9yYWdlXCJdfSx0aGlzLmFjdGl2ZWRUYWI9XCJcIix0aGlzLnRhYkxpc3Q9W10sdGhpcy5wbHVnaW5MaXN0PXt9LHRoaXMuc3dpdGNoUG9zPXt4OjEwLHk6MTAsc3RhcnRYOjAsc3RhcnRZOjAsZW5kWDowLGVuZFk6MH0sdGhpcy50b29sPWQsdGhpcy4kPXZbXCJkZWZhdWx0XCJdLGQuaXNPYmplY3QodCkpZm9yKHZhciBuIGluIHQpdGhpcy5vcHRpb25bbl09dFtuXTt0aGlzLl9hZGRCdWlsdEluUGx1Z2lucygpO3ZhciBpPWZ1bmN0aW9uKCl7by5pc0luaXRlZHx8KG8uX3JlbmRlcigpLG8uX21vY2tUYXAoKSxvLl9iaW5kRXZlbnQoKSxvLl9hdXRvUnVuKCkpfTt2b2lkIDAhPT1kb2N1bWVudD9cImNvbXBsZXRlXCI9PWRvY3VtZW50LnJlYWR5U3RhdGU/aSgpOnZbXCJkZWZhdWx0XCJdLmJpbmQod2luZG93LFwibG9hZFwiLGkpOiFmdW5jdGlvbigpe3ZhciBlPXZvaWQgMCx0PWZ1bmN0aW9uIG8oKXtkb2N1bWVudCYmXCJjb21wbGV0ZVwiPT1kb2N1bWVudC5yZWFkeVN0YXRlPyhlJiZjbGVhclRpbWVvdXQoZSksaSgpKTplPXNldFRpbWVvdXQobywxKX07ZT1zZXRUaW1lb3V0KHQsMSl9KCl9cmV0dXJuIHIoZSxbe2tleTpcIl9hZGRCdWlsdEluUGx1Z2luc1wiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5hZGRQbHVnaW4obmV3IENbXCJkZWZhdWx0XCJdKFwiZGVmYXVsdFwiLFwiTG9nXCIpKTt2YXIgZT10aGlzLm9wdGlvbi5kZWZhdWx0UGx1Z2lucyx0PXtzeXN0ZW06e3Byb3RvOk9bXCJkZWZhdWx0XCJdLG5hbWU6XCJTeXN0ZW1cIn0sbmV0d29yazp7cHJvdG86U1tcImRlZmF1bHRcIl0sbmFtZTpcIk5ldHdvcmtcIn0sZWxlbWVudDp7cHJvdG86altcImRlZmF1bHRcIl0sbmFtZTpcIkVsZW1lbnRcIn0sc3RvcmFnZTp7cHJvdG86UFtcImRlZmF1bHRcIl0sbmFtZTpcIlN0b3JhZ2VcIn19O2lmKGUmJmQuaXNBcnJheShlKSlmb3IodmFyIG89MDtvPGUubGVuZ3RoO28rKyl7dmFyIG49dFtlW29dXTtuP3RoaXMuYWRkUGx1Z2luKG5ldyBuLnByb3RvKGVbb10sbi5uYW1lKSk6Y29uc29sZS5kZWJ1ZyhcIlVucmVjb2duaXplZCBkZWZhdWx0IHBsdWdpbiBJRDpcIixlW29dKX19fSx7a2V5OlwiX3JlbmRlclwiLHZhbHVlOmZ1bmN0aW9uKCl7aWYoIXZbXCJkZWZhdWx0XCJdLm9uZShNKSl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtlLmlubmVySFRNTD1wW1wiZGVmYXVsdFwiXSxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsZS5jaGlsZHJlblswXSl9dGhpcy4kZG9tPXZbXCJkZWZhdWx0XCJdLm9uZShNKTt2YXIgdD12W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtc3dpdGNoXCIsdGhpcy4kZG9tKSxvPTEqZC5nZXRTdG9yYWdlKFwic3dpdGNoX3hcIiksbj0xKmQuZ2V0U3RvcmFnZShcInN3aXRjaF95XCIpOyhvfHxuKSYmKG8rdC5vZmZzZXRXaWR0aD5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub2Zmc2V0V2lkdGgmJihvPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vZmZzZXRXaWR0aC10Lm9mZnNldFdpZHRoKSxuK3Qub2Zmc2V0SGVpZ2h0PmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vZmZzZXRIZWlnaHQmJihuPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vZmZzZXRIZWlnaHQtdC5vZmZzZXRIZWlnaHQpLDA+byYmKG89MCksMD5uJiYobj0wKSx0aGlzLnN3aXRjaFBvcy54PW8sdGhpcy5zd2l0Y2hQb3MueT1uLHZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1zd2l0Y2hcIikuc3R5bGUucmlnaHQ9bytcInB4XCIsdltcImRlZmF1bHRcIl0ub25lKFwiLnZjLXN3aXRjaFwiKS5zdHlsZS5ib3R0b209bitcInB4XCIpO3ZhciBpPXdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvfHwxLGE9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9XCJ2aWV3cG9ydFwiXScpO2lmKGEmJmEuY29udGVudCl7dmFyIHI9YS5jb250ZW50Lm1hdGNoKC9pbml0aWFsXFwtc2NhbGVcXD1cXGQrKFxcLlxcZCspPy8pLGw9cj9wYXJzZUZsb2F0KHJbMF0uc3BsaXQoXCI9XCIpWzFdKToxOzE+bCYmKHRoaXMuJGRvbS5zdHlsZS5mb250U2l6ZT0xMyppK1wicHhcIil9dltcImRlZmF1bHRcIl0ub25lKFwiLnZjLW1hc2tcIix0aGlzLiRkb20pLnN0eWxlLmRpc3BsYXk9XCJub25lXCJ9fSx7a2V5OlwiX21vY2tUYXBcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPTcwMCx0PTEwLG89dm9pZCAwLG49dm9pZCAwLGk9dm9pZCAwLGE9ITEscj1udWxsO3RoaXMuJGRvbS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLGZ1bmN0aW9uKGUpe2lmKHZvaWQgMD09PW8pe3ZhciB0PWUudGFyZ2V0VG91Y2hlc1swXTtuPXQucGFnZVgsaT10LnBhZ2VZLG89ZS50aW1lU3RhbXAscj1lLnRhcmdldC5ub2RlVHlwZT09PU5vZGUuVEVYVF9OT0RFP2UudGFyZ2V0LnBhcmVudE5vZGU6ZS50YXJnZXR9fSwhMSksdGhpcy4kZG9tLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixmdW5jdGlvbihlKXt2YXIgbz1lLmNoYW5nZWRUb3VjaGVzWzBdOyhNYXRoLmFicyhvLnBhZ2VYLW4pPnR8fE1hdGguYWJzKG8ucGFnZVktaSk+dCkmJihhPSEwKX0pLHRoaXMuJGRvbS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixmdW5jdGlvbih0KXtpZihhPT09ITEmJnQudGltZVN0YW1wLW88ZSYmbnVsbCE9cil7dmFyIG49ci50YWdOYW1lLnRvTG93ZXJDYXNlKCksaT0hMTtzd2l0Y2gobil7Y2FzZVwidGV4dGFyZWFcIjppPSEwO2JyZWFrO2Nhc2VcImlucHV0XCI6c3dpdGNoKHIudHlwZSl7Y2FzZVwiYnV0dG9uXCI6Y2FzZVwiY2hlY2tib3hcIjpjYXNlXCJmaWxlXCI6Y2FzZVwiaW1hZ2VcIjpjYXNlXCJyYWRpb1wiOmNhc2VcInN1Ym1pdFwiOmk9ITE7YnJlYWs7ZGVmYXVsdDppPSFyLmRpc2FibGVkJiYhci5yZWFkT25seX19aT9yLmZvY3VzKCk6dC5wcmV2ZW50RGVmYXVsdCgpO3ZhciBsPXQuY2hhbmdlZFRvdWNoZXNbMF0sYz1kb2N1bWVudC5jcmVhdGVFdmVudChcIk1vdXNlRXZlbnRzXCIpO2MuaW5pdE1vdXNlRXZlbnQoXCJjbGlja1wiLCEwLCEwLHdpbmRvdywxLGwuc2NyZWVuWCxsLnNjcmVlblksbC5jbGllbnRYLGwuY2xpZW50WSwhMSwhMSwhMSwhMSwwLG51bGwpLGMuZm9yd2FyZGVkVG91Y2hFdmVudD0hMCxjLmluaXRFdmVudChcImNsaWNrXCIsITAsITApLHIuZGlzcGF0Y2hFdmVudChjKX1vPXZvaWQgMCxhPSExLHI9bnVsbH0sITEpfX0se2tleTpcIl9iaW5kRXZlbnRcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMsdD12W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtc3dpdGNoXCIsZS4kZG9tKTt2W1wiZGVmYXVsdFwiXS5iaW5kKHQsXCJ0b3VjaHN0YXJ0XCIsZnVuY3Rpb24odCl7ZS5zd2l0Y2hQb3Muc3RhcnRYPXQudG91Y2hlc1swXS5wYWdlWCxlLnN3aXRjaFBvcy5zdGFydFk9dC50b3VjaGVzWzBdLnBhZ2VZfSksdltcImRlZmF1bHRcIl0uYmluZCh0LFwidG91Y2hlbmRcIixmdW5jdGlvbih0KXtlLnN3aXRjaFBvcy54PWUuc3dpdGNoUG9zLmVuZFgsZS5zd2l0Y2hQb3MueT1lLnN3aXRjaFBvcy5lbmRZLGUuc3dpdGNoUG9zLnN0YXJ0WD0wLGUuc3dpdGNoUG9zLnN0YXJ0WT0wLGUuc3dpdGNoUG9zLmVuZFg9MCxlLnN3aXRjaFBvcy5lbmRZPTAsZC5zZXRTdG9yYWdlKFwic3dpdGNoX3hcIixlLnN3aXRjaFBvcy54KSxkLnNldFN0b3JhZ2UoXCJzd2l0Y2hfeVwiLGUuc3dpdGNoUG9zLnkpfSksdltcImRlZmF1bHRcIl0uYmluZCh0LFwidG91Y2htb3ZlXCIsZnVuY3Rpb24obyl7aWYoby50b3VjaGVzLmxlbmd0aD4wKXt2YXIgbj1vLnRvdWNoZXNbMF0ucGFnZVgtZS5zd2l0Y2hQb3Muc3RhcnRYLGk9by50b3VjaGVzWzBdLnBhZ2VZLWUuc3dpdGNoUG9zLnN0YXJ0WSxhPWUuc3dpdGNoUG9zLngtbixyPWUuc3dpdGNoUG9zLnktaTthK3Qub2Zmc2V0V2lkdGg+ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm9mZnNldFdpZHRoJiYoYT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub2Zmc2V0V2lkdGgtdC5vZmZzZXRXaWR0aCkscit0Lm9mZnNldEhlaWdodD5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0JiYocj1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0LXQub2Zmc2V0SGVpZ2h0KSwwPmEmJihhPTApLDA+ciYmKHI9MCksdC5zdHlsZS5yaWdodD1hK1wicHhcIix0LnN0eWxlLmJvdHRvbT1yK1wicHhcIixlLnN3aXRjaFBvcy5lbmRYPWEsZS5zd2l0Y2hQb3MuZW5kWT1yLG8ucHJldmVudERlZmF1bHQoKX19KSx2W1wiZGVmYXVsdFwiXS5iaW5kKHZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1zd2l0Y2hcIixlLiRkb20pLFwiY2xpY2tcIixmdW5jdGlvbigpe2Uuc2hvdygpfSksdltcImRlZmF1bHRcIl0uYmluZCh2W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtaGlkZVwiLGUuJGRvbSksXCJjbGlja1wiLGZ1bmN0aW9uKCl7ZS5oaWRlKCl9KSx2W1wiZGVmYXVsdFwiXS5iaW5kKHZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1tYXNrXCIsZS4kZG9tKSxcImNsaWNrXCIsZnVuY3Rpb24odCl7cmV0dXJuIHQudGFyZ2V0IT12W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtbWFza1wiKT8hMTp2b2lkIGUuaGlkZSgpfSksdltcImRlZmF1bHRcIl0uZGVsZWdhdGUodltcImRlZmF1bHRcIl0ub25lKFwiLnZjLXRhYmJhclwiLGUuJGRvbSksXCJjbGlja1wiLFwiLnZjLXRhYlwiLGZ1bmN0aW9uKHQpe3ZhciBvPXRoaXMuZGF0YXNldC50YWI7byE9ZS5hY3RpdmVkVGFiJiZlLnNob3dUYWIobyl9KSx2W1wiZGVmYXVsdFwiXS5iaW5kKHZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1wYW5lbFwiLGUuJGRvbSksXCJ0cmFuc2l0aW9uZW5kIHdlYmtpdFRyYW5zaXRpb25FbmQgb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmRcIixmdW5jdGlvbih0KXtyZXR1cm4gdC50YXJnZXQhPXZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1wYW5lbFwiKT8hMTp2b2lkKHZbXCJkZWZhdWx0XCJdLmhhc0NsYXNzKGUuJGRvbSxcInZjLXRvZ2dsZVwiKXx8KHQudGFyZ2V0LnN0eWxlLmRpc3BsYXk9XCJub25lXCIpKX0pO3ZhciBvPXZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1jb250ZW50XCIsZS4kZG9tKSxuPSExO3ZbXCJkZWZhdWx0XCJdLmJpbmQobyxcInRvdWNoc3RhcnRcIixmdW5jdGlvbihlKXt2YXIgdD1vLnNjcm9sbFRvcCxpPW8uc2Nyb2xsSGVpZ2h0LGE9dCtvLm9mZnNldEhlaWdodDswPT09dD8oby5zY3JvbGxUb3A9MSwwPT09by5zY3JvbGxUb3AmJih2W1wiZGVmYXVsdFwiXS5oYXNDbGFzcyhlLnRhcmdldCxcInZjLWNtZC1pbnB1dFwiKXx8KG49ITApKSk6YT09PWkmJihvLnNjcm9sbFRvcD10LTEsby5zY3JvbGxUb3A9PT10JiYodltcImRlZmF1bHRcIl0uaGFzQ2xhc3MoZS50YXJnZXQsXCJ2Yy1jbWQtaW5wdXRcIil8fChuPSEwKSkpfSksdltcImRlZmF1bHRcIl0uYmluZChvLFwidG91Y2htb3ZlXCIsZnVuY3Rpb24oZSl7biYmZS5wcmV2ZW50RGVmYXVsdCgpfSksdltcImRlZmF1bHRcIl0uYmluZChvLFwidG91Y2hlbmRcIixmdW5jdGlvbihlKXtuPSExfSl9fSx7a2V5OlwiX2F1dG9SdW5cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuaXNJbml0ZWQ9ITA7Zm9yKHZhciBlIGluIHRoaXMucGx1Z2luTGlzdCl0aGlzLl9pbml0UGx1Z2luKHRoaXMucGx1Z2luTGlzdFtlXSk7dGhpcy50YWJMaXN0Lmxlbmd0aD4wJiZ0aGlzLnNob3dUYWIodGhpcy50YWJMaXN0WzBdKSx0aGlzLnRyaWdnZXJFdmVudChcInJlYWR5XCIpfX0se2tleTpcInRyaWdnZXJFdmVudFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7ZT1cIm9uXCIrZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKStlLnNsaWNlKDEpLGQuaXNGdW5jdGlvbih0aGlzLm9wdGlvbltlXSkmJnRoaXMub3B0aW9uW2VdLmFwcGx5KHRoaXMsdCl9fSx7a2V5OlwiX2luaXRQbHVnaW5cIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD10aGlzO2UudkNvbnNvbGU9dGhpcyxlLnRyaWdnZXIoXCJpbml0XCIpLGUudHJpZ2dlcihcInJlbmRlclRhYlwiLGZ1bmN0aW9uKG8pe3QudGFiTGlzdC5wdXNoKGUuaWQpO3ZhciBuPXZbXCJkZWZhdWx0XCJdLnJlbmRlcihnW1wiZGVmYXVsdFwiXSx7aWQ6ZS5pZCxuYW1lOmUubmFtZX0pO3ZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy10YWJiYXJcIix0LiRkb20pLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLG4pO3ZhciBpPXZbXCJkZWZhdWx0XCJdLnJlbmRlcihtW1wiZGVmYXVsdFwiXSx7aWQ6ZS5pZH0pO28mJihkLmlzU3RyaW5nKG8pP2kuaW5uZXJIVE1MKz1vOmQuaXNGdW5jdGlvbihvLmFwcGVuZFRvKT9vLmFwcGVuZFRvKGkpOmQuaXNFbGVtZW50KG8pJiZpLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLG8pKSx2W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtY29udGVudFwiLHQuJGRvbSkuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsaSl9KSxlLnRyaWdnZXIoXCJhZGRUb3BCYXJcIixmdW5jdGlvbihvKXtpZihvKWZvcih2YXIgbj12W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtdG9wYmFyXCIsdC4kZG9tKSxpPWZ1bmN0aW9uKHQpe3ZhciBpPW9bdF0sYT12W1wiZGVmYXVsdFwiXS5yZW5kZXIoX1tcImRlZmF1bHRcIl0se25hbWU6aS5uYW1lfHxcIlVuZGVmaW5lZFwiLGNsYXNzTmFtZTppLmNsYXNzTmFtZXx8XCJcIixwbHVnaW5JRDplLmlkfSk7aWYoaS5kYXRhKWZvcih2YXIgciBpbiBpLmRhdGEpYS5kYXRhc2V0W3JdPWkuZGF0YVtyXTtkLmlzRnVuY3Rpb24oaS5vbkNsaWNrKSYmdltcImRlZmF1bHRcIl0uYmluZChhLFwiY2xpY2tcIixmdW5jdGlvbih0KXt2YXIgbz1pLm9uQ2xpY2suY2FsbChhKTtvPT09ITF8fCh2W1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyh2W1wiZGVmYXVsdFwiXS5hbGwoXCIudmMtdG9wYmFyLVwiK2UuaWQpLFwidmMtYWN0aXZlZFwiKSx2W1wiZGVmYXVsdFwiXS5hZGRDbGFzcyhhLFwidmMtYWN0aXZlZFwiKSl9KSxuLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLGEpfSxhPTA7YTxvLmxlbmd0aDthKyspaShhKX0pLGUudHJpZ2dlcihcImFkZFRvb2xcIixmdW5jdGlvbihvKXtpZihvKWZvcih2YXIgbj12W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtdG9vbC1sYXN0XCIsdC4kZG9tKSxpPWZ1bmN0aW9uKHQpe3ZhciBpPW9bdF0sYT12W1wiZGVmYXVsdFwiXS5yZW5kZXIoeFtcImRlZmF1bHRcIl0se25hbWU6aS5uYW1lfHxcIlVuZGVmaW5lZFwiLHBsdWdpbklEOmUuaWR9KTsxPT1pLmdsb2JhbCYmdltcImRlZmF1bHRcIl0uYWRkQ2xhc3MoYSxcInZjLWdsb2JhbC10b29sXCIpLGQuaXNGdW5jdGlvbihpLm9uQ2xpY2spJiZ2W1wiZGVmYXVsdFwiXS5iaW5kKGEsXCJjbGlja1wiLGZ1bmN0aW9uKGUpe2kub25DbGljay5jYWxsKGEpfSksbi5wYXJlbnROb2RlLmluc2VydEJlZm9yZShhLG4pfSxhPTA7YTxvLmxlbmd0aDthKyspaShhKX0pLGUuaXNSZWFkeT0hMCxlLnRyaWdnZXIoXCJyZWFkeVwiKX19LHtrZXk6XCJfdHJpZ2dlclBsdWdpbnNFdmVudFwiLHZhbHVlOmZ1bmN0aW9uKGUpe2Zvcih2YXIgdCBpbiB0aGlzLnBsdWdpbkxpc3QpdGhpcy5wbHVnaW5MaXN0W3RdLmlzUmVhZHkmJnRoaXMucGx1Z2luTGlzdFt0XS50cmlnZ2VyKGUpfX0se2tleTpcIl90cmlnZ2VyUGx1Z2luRXZlbnRcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3ZhciBvPXRoaXMucGx1Z2luTGlzdFtlXTtvJiZvLmlzUmVhZHkmJm8udHJpZ2dlcih0KX19LHtrZXk6XCJhZGRQbHVnaW5cIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdm9pZCAwIT09dGhpcy5wbHVnaW5MaXN0W2UuaWRdPyhjb25zb2xlLmRlYnVnKFwiUGx1Z2luIFwiK2UuaWQrXCIgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC5cIiksITEpOih0aGlzLnBsdWdpbkxpc3RbZS5pZF09ZSx0aGlzLmlzSW5pdGVkJiYodGhpcy5faW5pdFBsdWdpbihlKSwxPT10aGlzLnRhYkxpc3QubGVuZ3RoJiZ0aGlzLnNob3dUYWIodGhpcy50YWJMaXN0WzBdKSksITApfX0se2tleTpcInJlbW92ZVBsdWdpblwiLHZhbHVlOmZ1bmN0aW9uKGUpe2U9KGUrXCJcIikudG9Mb3dlckNhc2UoKTt2YXIgdD10aGlzLnBsdWdpbkxpc3RbZV07aWYodm9pZCAwPT09dClyZXR1cm4gY29uc29sZS5kZWJ1ZyhcIlBsdWdpbiBcIitlK1wiIGRvZXMgbm90IGV4aXN0LlwiKSwhMTtpZih0LnRyaWdnZXIoXCJyZW1vdmVcIiksdGhpcy5pc0luaXRlZCl7dmFyIG89dltcImRlZmF1bHRcIl0ub25lKFwiI19fdmNfdGFiX1wiK2UpO28mJm8ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvKTtmb3IodmFyIG49dltcImRlZmF1bHRcIl0uYWxsKFwiLnZjLXRvcGJhci1cIitlLHRoaXMuJGRvbSksaT0wO2k8bi5sZW5ndGg7aSsrKW5baV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuW2ldKTt2YXIgYT12W1wiZGVmYXVsdFwiXS5vbmUoXCIjX192Y19sb2dfXCIrZSk7YSYmYS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGEpO2Zvcih2YXIgcj12W1wiZGVmYXVsdFwiXS5hbGwoXCIudmMtdG9vbC1cIitlLHRoaXMuJGRvbSksbD0wO2w8ci5sZW5ndGg7bCsrKXJbbF0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChyW2xdKX12YXIgYz10aGlzLnRhYkxpc3QuaW5kZXhPZihlKTtjPi0xJiZ0aGlzLnRhYkxpc3Quc3BsaWNlKGMsMSk7dHJ5e2RlbGV0ZSB0aGlzLnBsdWdpbkxpc3RbZV19Y2F0Y2gocyl7dGhpcy5wbHVnaW5MaXN0W2VdPXZvaWQgMH1yZXR1cm4gdGhpcy5hY3RpdmVkVGFiPT1lJiZ0aGlzLnRhYkxpc3QubGVuZ3RoPjAmJnRoaXMuc2hvd1RhYih0aGlzLnRhYkxpc3RbMF0pLCEwfX0se2tleTpcInNob3dcIix2YWx1ZTpmdW5jdGlvbigpe2lmKHRoaXMuaXNJbml0ZWQpe3ZhciBlPXRoaXMsdD12W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtcGFuZWxcIix0aGlzLiRkb20pO3Quc3R5bGUuZGlzcGxheT1cImJsb2NrXCIsc2V0VGltZW91dChmdW5jdGlvbigpe3ZbXCJkZWZhdWx0XCJdLmFkZENsYXNzKGUuJGRvbSxcInZjLXRvZ2dsZVwiKSxlLl90cmlnZ2VyUGx1Z2luc0V2ZW50KFwic2hvd0NvbnNvbGVcIik7dmFyIHQ9dltcImRlZmF1bHRcIl0ub25lKFwiLnZjLW1hc2tcIixlLiRkb20pO3Quc3R5bGUuZGlzcGxheT1cImJsb2NrXCJ9LDEwKX19fSx7a2V5OlwiaGlkZVwiLHZhbHVlOmZ1bmN0aW9uKCl7aWYodGhpcy5pc0luaXRlZCl7dltcImRlZmF1bHRcIl0ucmVtb3ZlQ2xhc3ModGhpcy4kZG9tLFwidmMtdG9nZ2xlXCIpLHRoaXMuX3RyaWdnZXJQbHVnaW5zRXZlbnQoXCJoaWRlQ29uc29sZVwiKTt2YXIgZT12W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtbWFza1wiLHRoaXMuJGRvbSksdD12W1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtcGFuZWxcIix0aGlzLiRkb20pO3ZbXCJkZWZhdWx0XCJdLmJpbmQoZSxcInRyYW5zaXRpb25lbmRcIixmdW5jdGlvbihvKXtlLnN0eWxlLmRpc3BsYXk9XCJub25lXCIsdC5zdHlsZS5kaXNwbGF5PVwibm9uZVwifSl9fX0se2tleTpcInNob3dTd2l0Y2hcIix2YWx1ZTpmdW5jdGlvbigpe2lmKHRoaXMuaXNJbml0ZWQpe3ZhciBlPXZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1zd2l0Y2hcIix0aGlzLiRkb20pO2Uuc3R5bGUuZGlzcGxheT1cImJsb2NrXCJ9fX0se2tleTpcImhpZGVTd2l0Y2hcIix2YWx1ZTpmdW5jdGlvbigpe2lmKHRoaXMuaXNJbml0ZWQpe3ZhciBlPXZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1zd2l0Y2hcIix0aGlzLiRkb20pO2Uuc3R5bGUuZGlzcGxheT1cIm5vbmVcIn19fSx7a2V5Olwic2hvd1RhYlwiLHZhbHVlOmZ1bmN0aW9uKGUpe2lmKHRoaXMuaXNJbml0ZWQpe3ZhciB0PXZbXCJkZWZhdWx0XCJdLm9uZShcIiNfX3ZjX2xvZ19cIitlKTt2W1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyh2W1wiZGVmYXVsdFwiXS5hbGwoXCIudmMtdGFiXCIsdGhpcy4kZG9tKSxcInZjLWFjdGl2ZWRcIiksdltcImRlZmF1bHRcIl0uYWRkQ2xhc3ModltcImRlZmF1bHRcIl0ub25lKFwiI19fdmNfdGFiX1wiK2UpLFwidmMtYWN0aXZlZFwiKSx2W1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyh2W1wiZGVmYXVsdFwiXS5hbGwoXCIudmMtbG9nYm94XCIsdGhpcy4kZG9tKSxcInZjLWFjdGl2ZWRcIiksdltcImRlZmF1bHRcIl0uYWRkQ2xhc3ModCxcInZjLWFjdGl2ZWRcIik7dmFyIG89dltcImRlZmF1bHRcIl0uYWxsKFwiLnZjLXRvcGJhci1cIitlLHRoaXMuJGRvbSk7dltcImRlZmF1bHRcIl0ucmVtb3ZlQ2xhc3ModltcImRlZmF1bHRcIl0uYWxsKFwiLnZjLXRvcHRhYlwiLHRoaXMuJGRvbSksXCJ2Yy10b2dnbGVcIiksdltcImRlZmF1bHRcIl0uYWRkQ2xhc3MobyxcInZjLXRvZ2dsZVwiKSxvLmxlbmd0aD4wP3ZbXCJkZWZhdWx0XCJdLmFkZENsYXNzKHZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1jb250ZW50XCIsdGhpcy4kZG9tKSxcInZjLWhhcy10b3BiYXJcIik6dltcImRlZmF1bHRcIl0ucmVtb3ZlQ2xhc3ModltcImRlZmF1bHRcIl0ub25lKFwiLnZjLWNvbnRlbnRcIix0aGlzLiRkb20pLFwidmMtaGFzLXRvcGJhclwiKSx2W1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyh2W1wiZGVmYXVsdFwiXS5hbGwoXCIudmMtdG9vbFwiLHRoaXMuJGRvbSksXCJ2Yy10b2dnbGVcIiksdltcImRlZmF1bHRcIl0uYWRkQ2xhc3ModltcImRlZmF1bHRcIl0uYWxsKFwiLnZjLXRvb2wtXCIrZSx0aGlzLiRkb20pLFwidmMtdG9nZ2xlXCIpLHRoaXMuYWN0aXZlZFRhYiYmdGhpcy5fdHJpZ2dlclBsdWdpbkV2ZW50KHRoaXMuYWN0aXZlZFRhYixcImhpZGVcIiksdGhpcy5hY3RpdmVkVGFiPWUsdGhpcy5fdHJpZ2dlclBsdWdpbkV2ZW50KHRoaXMuYWN0aXZlZFRhYixcInNob3dcIil9fX0se2tleTpcInNldE9wdGlvblwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7aWYoZC5pc1N0cmluZyhlKSl0aGlzLm9wdGlvbltlXT10LHRoaXMuX3RyaWdnZXJQbHVnaW5zRXZlbnQoXCJ1cGRhdGVPcHRpb25cIik7ZWxzZSBpZihkLmlzT2JqZWN0KGUpKXtmb3IodmFyIG8gaW4gZSl0aGlzLm9wdGlvbltvXT1lW29dO3RoaXMuX3RyaWdnZXJQbHVnaW5zRXZlbnQoXCJ1cGRhdGVPcHRpb25cIil9ZWxzZSBjb25zb2xlLmRlYnVnKFwiVGhlIGZpcnN0IHBhcmFtZXRlciBvZiB2Q29uc29sZS5zZXRPcHRpb24oKSBtdXN0IGJlIGEgc3RyaW5nIG9yIGFuIG9iamVjdC5cIil9fSx7a2V5OlwiZGVzdHJveVwiLHZhbHVlOmZ1bmN0aW9uKCl7aWYodGhpcy5pc0luaXRlZCl7Zm9yKHZhciBlPU9iamVjdC5rZXlzKHRoaXMucGx1Z2luTGlzdCksdD1lLmxlbmd0aC0xO3Q+PTA7dC0tKXRoaXMucmVtb3ZlUGx1Z2luKGVbdF0pO3RoaXMuJGRvbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuJGRvbSl9fX1dKSxlfSgpO3RbXCJkZWZhdWx0XCJdPUEsZS5leHBvcnRzPXRbXCJkZWZhdWx0XCJdfSxmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz17bmFtZTpcInZjb25zb2xlXCIsdmVyc2lvbjpcIjMuMi4wXCIsZGVzY3JpcHRpb246XCJBIGxpZ2h0d2VpZ2h0LCBleHRlbmRhYmxlIGZyb250LWVuZCBkZXZlbG9wZXIgdG9vbCBmb3IgbW9iaWxlIHdlYiBwYWdlLlwiLGhvbWVwYWdlOlwiaHR0cHM6Ly9naXRodWIuY29tL1RlbmNlbnQvdkNvbnNvbGVcIixtYWluOlwiZGlzdC92Y29uc29sZS5taW4uanNcIixzY3JpcHRzOnt0ZXN0OlwibW9jaGFcIixkaXN0Olwid2VicGFja1wifSxrZXl3b3JkczpbXCJjb25zb2xlXCIsXCJkZWJ1Z1wiLFwibW9iaWxlXCJdLHJlcG9zaXRvcnk6e3R5cGU6XCJnaXRcIix1cmw6XCJnaXQraHR0cHM6Ly9naXRodWIuY29tL1RlbmNlbnQvdkNvbnNvbGUuZ2l0XCJ9LGRlcGVuZGVuY2llczp7fSxkZXZEZXBlbmRlbmNpZXM6e1wiYmFiZWwtY29yZVwiOlwiXjYuNy43XCIsXCJiYWJlbC1sb2FkZXJcIjpcIl42LjIuNFwiLFwiYmFiZWwtcGx1Z2luLWFkZC1tb2R1bGUtZXhwb3J0c1wiOlwiXjAuMS40XCIsXCJiYWJlbC1wcmVzZXQtZXMyMDE1XCI6XCJeNi42LjBcIixcImJhYmVsLXByZXNldC1zdGFnZS0zXCI6XCJeNi41LjBcIixjaGFpOlwiXjMuNS4wXCIsXCJjc3MtbG9hZGVyXCI6XCJeMC4yMy4xXCIsXCJleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cIjpcIl4xLjAuMVwiLFwiaHRtbC1sb2FkZXJcIjpcIl4wLjQuM1wiLGpzZG9tOlwiXjkuMi4xXCIsXCJqc29uLWxvYWRlclwiOlwiXjAuNS40XCIsbGVzczpcIl4yLjUuM1wiLFwibGVzcy1sb2FkZXJcIjpcIl4yLjIuM1wiLG1vY2hhOlwiXjIuNS4zXCIsXCJzdHlsZS1sb2FkZXJcIjpcIl4wLjEzLjFcIix3ZWJwYWNrOlwifjEuMTIuMTFcIn0sYXV0aG9yOlwiVGVuY2VudFwiLGxpY2Vuc2U6XCJNSVRcIn19LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbyhlKXt2YXIgdD1lPjA/bmV3IERhdGUoZSk6bmV3IERhdGUsbz10LmdldERhdGUoKTwxMD9cIjBcIit0LmdldERhdGUoKTp0LmdldERhdGUoKSxuPXQuZ2V0TW9udGgoKTw5P1wiMFwiKyh0LmdldE1vbnRoKCkrMSk6dC5nZXRNb250aCgpKzEsaT10LmdldEZ1bGxZZWFyKCksYT10LmdldEhvdXJzKCk8MTA/XCIwXCIrdC5nZXRIb3VycygpOnQuZ2V0SG91cnMoKSxyPXQuZ2V0TWludXRlcygpPDEwP1wiMFwiK3QuZ2V0TWludXRlcygpOnQuZ2V0TWludXRlcygpLGw9dC5nZXRTZWNvbmRzKCk8MTA/XCIwXCIrdC5nZXRTZWNvbmRzKCk6dC5nZXRTZWNvbmRzKCksYz10LmdldE1pbGxpc2Vjb25kcygpPDEwP1wiMFwiK3QuZ2V0TWlsbGlzZWNvbmRzKCk6dC5nZXRNaWxsaXNlY29uZHMoKTtyZXR1cm4gMTAwPmMmJihjPVwiMFwiK2MpLHt0aW1lOit0LHllYXI6aSxtb250aDpuLGRheTpvLGhvdXI6YSxtaW51dGU6cixzZWNvbmQ6bCxtaWxsaXNlY29uZDpjfX1mdW5jdGlvbiBuKGUpe3JldHVyblwiW29iamVjdCBOdW1iZXJdXCI9PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlKX1mdW5jdGlvbiBpKGUpe3JldHVyblwiW29iamVjdCBTdHJpbmddXCI9PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlKX1mdW5jdGlvbiBhKGUpe3JldHVyblwiW29iamVjdCBBcnJheV1cIj09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGUpfWZ1bmN0aW9uIHIoZSl7cmV0dXJuXCJbb2JqZWN0IEJvb2xlYW5dXCI9PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlKX1mdW5jdGlvbiBsKGUpe3JldHVyblwiW29iamVjdCBVbmRlZmluZWRdXCI9PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlKX1mdW5jdGlvbiBjKGUpe3JldHVyblwiW29iamVjdCBOdWxsXVwiPT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZSl9ZnVuY3Rpb24gcyhlKXtyZXR1cm5cIltvYmplY3QgU3ltYm9sXVwiPT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZSl9ZnVuY3Rpb24gZChlKXtyZXR1cm4hKFwiW29iamVjdCBPYmplY3RdXCIhPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlKSYmKG4oZSl8fGkoZSl8fHIoZSl8fGEoZSl8fGMoZSl8fHUoZSl8fGwoZSl8fHMoZSkpKX1mdW5jdGlvbiB1KGUpe3JldHVyblwiW29iamVjdCBGdW5jdGlvbl1cIj09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGUpfWZ1bmN0aW9uIHYoZSl7cmV0dXJuXCJvYmplY3RcIj09PShcInVuZGVmaW5lZFwiPT10eXBlb2YgSFRNTEVsZW1lbnQ/XCJ1bmRlZmluZWRcIjp3KEhUTUxFbGVtZW50KSk/ZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50OmUmJlwib2JqZWN0XCI9PT0oXCJ1bmRlZmluZWRcIj09dHlwZW9mIGU/XCJ1bmRlZmluZWRcIjp3KGUpKSYmbnVsbCE9PWUmJjE9PT1lLm5vZGVUeXBlJiZcInN0cmluZ1wiPT10eXBlb2YgZS5ub2RlTmFtZX1mdW5jdGlvbiBmKGUpe3ZhciB0PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlKTtyZXR1cm5cIltvYmplY3QgZ2xvYmFsXVwiPT10fHxcIltvYmplY3QgV2luZG93XVwiPT10fHxcIltvYmplY3QgRE9NV2luZG93XVwiPT10fWZ1bmN0aW9uIHAoZSl7dmFyIHQ9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtpZighZXx8XCJvYmplY3RcIiE9PShcInVuZGVmaW5lZFwiPT10eXBlb2YgZT9cInVuZGVmaW5lZFwiOncoZSkpfHxlLm5vZGVUeXBlfHxmKGUpKXJldHVybiExO3RyeXtpZihlLmNvbnN0cnVjdG9yJiYhdC5jYWxsKGUsXCJjb25zdHJ1Y3RvclwiKSYmIXQuY2FsbChlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSxcImlzUHJvdG90eXBlT2ZcIikpcmV0dXJuITF9Y2F0Y2gobyl7cmV0dXJuITF9dmFyIG49dm9pZCAwO2ZvcihuIGluIGUpO3JldHVybiB2b2lkIDA9PT1ufHx0LmNhbGwoZSxuKX1mdW5jdGlvbiBoKGUpe3JldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShlKSkucGFyZW50Tm9kZS5pbm5lckhUTUx9ZnVuY3Rpb24gZyhlKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0xfHx2b2lkIDA9PT1hcmd1bWVudHNbMV0/XCJcdFwiOmFyZ3VtZW50c1sxXSxvPWFyZ3VtZW50cy5sZW5ndGg8PTJ8fHZvaWQgMD09PWFyZ3VtZW50c1syXT9cIkNJUkNVTEFSX0RFUEVOREVDWV9PQkpFQ1RcIjphcmd1bWVudHNbMl0sbj1bXSxpPUpTT04uc3RyaW5naWZ5KGUsZnVuY3Rpb24oZSx0KXtpZihcIm9iamVjdFwiPT09KFwidW5kZWZpbmVkXCI9PXR5cGVvZiB0P1widW5kZWZpbmVkXCI6dyh0KSkmJm51bGwhPT10KXtpZih+bi5pbmRleE9mKHQpKXJldHVybiBvO24ucHVzaCh0KX1yZXR1cm4gdH0sdCk7cmV0dXJuIG49bnVsbCxpfWZ1bmN0aW9uIGIoZSl7aWYoIWQoZSkmJiFhKGUpKXJldHVybltdO3ZhciB0PVtcInRvU3RyaW5nXCIsXCJ0b0xvY2FsZVN0cmluZ1wiLFwidmFsdWVPZlwiLFwiaGFzT3duUHJvcGVydHlcIixcImlzUHJvdG90eXBlT2ZcIixcInByb3BlcnR5SXNFbnVtZXJhYmxlXCIsXCJjb25zdHJ1Y3RvclwiXSxvPVtdO2Zvcih2YXIgbiBpbiBlKXQuaW5kZXhPZihuKTwwJiZvLnB1c2gobik7cmV0dXJuIG89by5zb3J0KCl9ZnVuY3Rpb24gbShlKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGUpLnJlcGxhY2UoXCJbb2JqZWN0IFwiLFwiXCIpLnJlcGxhY2UoXCJdXCIsXCJcIil9ZnVuY3Rpb24geShlLHQpe3dpbmRvdy5sb2NhbFN0b3JhZ2UmJihlPVwidkNvbnNvbGVfXCIrZSxsb2NhbFN0b3JhZ2Uuc2V0SXRlbShlLHQpKX1mdW5jdGlvbiBfKGUpe3JldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlPyhlPVwidkNvbnNvbGVfXCIrZSxsb2NhbFN0b3JhZ2UuZ2V0SXRlbShlKSk6dm9pZCAwfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciB3PVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbihlKXtyZXR1cm4gdHlwZW9mIGV9OmZ1bmN0aW9uKGUpe3JldHVybiBlJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJmUuY29uc3RydWN0b3I9PT1TeW1ib2w/XCJzeW1ib2xcIjp0eXBlb2YgZX07dC5nZXREYXRlPW8sdC5pc051bWJlcj1uLHQuaXNTdHJpbmc9aSx0LmlzQXJyYXk9YSx0LmlzQm9vbGVhbj1yLHQuaXNVbmRlZmluZWQ9bCx0LmlzTnVsbD1jLHQuaXNTeW1ib2w9cyx0LmlzT2JqZWN0PWQsdC5pc0Z1bmN0aW9uPXUsdC5pc0VsZW1lbnQ9dix0LmlzV2luZG93PWYsdC5pc1BsYWluT2JqZWN0PXAsdC5odG1sRW5jb2RlPWgsdC5KU09OU3RyaW5naWZ5PWcsdC5nZXRPYmpBbGxLZXlzPWIsdC5nZXRPYmpOYW1lPW0sdC5zZXRTdG9yYWdlPXksdC5nZXRTdG9yYWdlPV99LGZ1bmN0aW9uKGUsdCxvKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7XCJkZWZhdWx0XCI6ZX19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGk9byg0KSxhPW8oNikscj1uKGEpLGw9e307bC5vbmU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdD90LnF1ZXJ5U2VsZWN0b3IoZSk6ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlKX0sbC5hbGw9ZnVuY3Rpb24oZSx0KXt2YXIgbz12b2lkIDAsbj1bXTtyZXR1cm4gbz10P3QucXVlcnlTZWxlY3RvckFsbChlKTpkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGUpLG8mJm8ubGVuZ3RoPjAmJihuPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG8pKSxufSxsLmFkZENsYXNzPWZ1bmN0aW9uKGUsdCl7aWYoZSl7KDAsaS5pc0FycmF5KShlKXx8KGU9W2VdKTtmb3IodmFyIG89MDtvPGUubGVuZ3RoO28rKyl7dmFyIG49ZVtvXS5jbGFzc05hbWV8fFwiXCIsYT1uLnNwbGl0KFwiIFwiKTthLmluZGV4T2YodCk+LTF8fChhLnB1c2godCksZVtvXS5jbGFzc05hbWU9YS5qb2luKFwiIFwiKSl9fX0sbC5yZW1vdmVDbGFzcz1mdW5jdGlvbihlLHQpe2lmKGUpeygwLGkuaXNBcnJheSkoZSl8fChlPVtlXSk7Zm9yKHZhciBvPTA7bzxlLmxlbmd0aDtvKyspe2Zvcih2YXIgbj1lW29dLmNsYXNzTmFtZS5zcGxpdChcIiBcIiksYT0wO2E8bi5sZW5ndGg7YSsrKW5bYV09PXQmJihuW2FdPVwiXCIpO2Vbb10uY2xhc3NOYW1lPW4uam9pbihcIiBcIikudHJpbSgpfX19LGwuaGFzQ2xhc3M9ZnVuY3Rpb24oZSx0KXtpZighZSlyZXR1cm4hMTtmb3IodmFyIG89ZS5jbGFzc05hbWUuc3BsaXQoXCIgXCIpLG49MDtuPG8ubGVuZ3RoO24rKylpZihvW25dPT10KXJldHVybiEwO3JldHVybiExfSxsLmJpbmQ9ZnVuY3Rpb24oZSx0LG8sbil7aWYoZSl7dm9pZCAwPT09biYmKG49ITEpLCgwLGkuaXNBcnJheSkoZSl8fChlPVtlXSk7Zm9yKHZhciBhPTA7YTxlLmxlbmd0aDthKyspZVthXS5hZGRFdmVudExpc3RlbmVyKHQsbyxuKX19LGwuZGVsZWdhdGU9ZnVuY3Rpb24oZSx0LG8sbil7ZSYmZS5hZGRFdmVudExpc3RlbmVyKHQsZnVuY3Rpb24odCl7dmFyIGk9bC5hbGwobyxlKTtpZihpKWU6Zm9yKHZhciBhPTA7YTxpLmxlbmd0aDthKyspZm9yKHZhciByPXQudGFyZ2V0O3I7KXtpZihyPT1pW2FdKXtuLmNhbGwocix0KTticmVhayBlfWlmKHI9ci5wYXJlbnROb2RlLHI9PWUpYnJlYWt9fSwhMSl9LGwucmVuZGVyPXJbXCJkZWZhdWx0XCJdLHRbXCJkZWZhdWx0XCJdPWwsZS5leHBvcnRzPXRbXCJkZWZhdWx0XCJdfSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG8oZSx0LG8pe3ZhciBuPS9cXHtcXHsoW15cXH1dKylcXH1cXH0vZyxpPVwiXCIsYT1cIlwiLHI9MCxsPVtdLGM9ZnVuY3Rpb24oZSx0KXtcIlwiIT09ZSYmKGkrPXQ/ZS5tYXRjaCgvXiA/ZWxzZS9nKT9cIn0gXCIrZStcIiB7XFxuXCI6ZS5tYXRjaCgvXFwvKGlmfGZvcnxzd2l0Y2gpL2cpP1wifVxcblwiOmUubWF0Y2goL14gP2lmfGZvcnxzd2l0Y2gvZyk/ZStcIiB7XFxuXCI6ZS5tYXRjaCgvXiA/KGJyZWFrfGNvbnRpbnVlKSA/JC9nKT9lK1wiO1xcblwiOmUubWF0Y2goL14gPyhjYXNlfGRlZmF1bHQpL2cpP2UrXCI6XFxuXCI6XCJhcnIucHVzaChcIitlK1wiKTtcXG5cIjonYXJyLnB1c2goXCInK2UucmVwbGFjZSgvXCIvZywnXFxcXFwiJykrJ1wiKTtcXG4nKX07Zm9yKHdpbmRvdy5fX21pdG9fZGF0YT10LHdpbmRvdy5fX21pdG9fY29kZT1cIlwiLHdpbmRvdy5fX21pdG9fcmVzdWx0PVwiXCIsZT1lLnJlcGxhY2UoLyhcXHtcXHsgP3N3aXRjaCguKz8pXFx9XFx9KVtcXHJcXG5cXHQgXStcXHtcXHsvZyxcIiQxe3tcIiksZT1lLnJlcGxhY2UoL15bXFxyXFxuXS8sXCJcIikucmVwbGFjZSgvXFxuL2csXCJcXFxcXFxuXCIpLnJlcGxhY2UoL1xcci9nLFwiXFxcXFxcclwiKSxhPVwiKGZ1bmN0aW9uKCl7XFxuXCIsaT1cInZhciBhcnIgPSBbXTtcXG5cIjtsPW4uZXhlYyhlKTspYyhlLnNsaWNlKHIsbC5pbmRleCksITEpLGMobFsxXSwhMCkscj1sLmluZGV4K2xbMF0ubGVuZ3RoO2MoZS5zdWJzdHIocixlLmxlbmd0aC1yKSwhMSksaSs9J19fbWl0b19yZXN1bHQgPSBhcnIuam9pbihcIlwiKTsnLGk9XCJ3aXRoIChfX21pdG9fZGF0YSkge1xcblwiK2krXCJcXG59XCIsYSs9aSxhKz1cIn0pKCk7XCI7dmFyIHM9ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIiksZD1cIlwiO3MubGVuZ3RoPjAmJihkPXNbMF0uZ2V0QXR0cmlidXRlKFwibm9uY2VcIil8fFwiXCIpO3ZhciB1PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJTQ1JJUFRcIik7dS5pbm5lckhUTUw9YSx1LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsZCksZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHUpO3ZhciB2PV9fbWl0b19yZXN1bHQ7aWYoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUNoaWxkKHUpLCFvKXt2YXIgZj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiRElWXCIpO2YuaW5uZXJIVE1MPXYsdj1mLmNoaWxkcmVuWzBdfXJldHVybiB2fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHRbXCJkZWZhdWx0XCJdPW8sZS5leHBvcnRzPXRbXCJkZWZhdWx0XCJdfSxmdW5jdGlvbihlLHQsbyl7dmFyIG49byg4KTtcInN0cmluZ1wiPT10eXBlb2YgbiYmKG49W1tlLmlkLG4sXCJcIl1dKTtvKDEwKShuLHt9KTtuLmxvY2FscyYmKGUuZXhwb3J0cz1uLmxvY2Fscyl9LGZ1bmN0aW9uKGUsdCxvKXt0PWUuZXhwb3J0cz1vKDkpKCksdC5wdXNoKFtlLmlkLCcjX192Y29uc29sZXtjb2xvcjojMDAwO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtZmFtaWx5OkhlbHZldGljYSBOZXVlLEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmfSNfX3Zjb25zb2xlIC52Yy1tYXgtaGVpZ2h0e21heC1oZWlnaHQ6MTkuMjMwNzY5MjNlbX0jX192Y29uc29sZSAudmMtbWF4LWhlaWdodC1saW5le21heC1oZWlnaHQ6My4zODQ2MTUzOGVtfSNfX3Zjb25zb2xlIC52Yy1taW4taGVpZ2h0e21pbi1oZWlnaHQ6My4wNzY5MjMwOGVtfSNfX3Zjb25zb2xlIGRkLCNfX3Zjb25zb2xlIGRsLCNfX3Zjb25zb2xlIHByZXttYXJnaW46MH0jX192Y29uc29sZSAudmMtc3dpdGNoe2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246Zml4ZWQ7cmlnaHQ6Ljc2OTIzMDc3ZW07Ym90dG9tOi43NjkyMzA3N2VtO2NvbG9yOiNmZmY7YmFja2dyb3VuZC1jb2xvcjojMDRiZTAyO2xpbmUtaGVpZ2h0OjE7Zm9udC1zaXplOjEuMDc2OTIzMDhlbTtwYWRkaW5nOi42MTUzODQ2MmVtIDEuMjMwNzY5MjNlbTt6LWluZGV4OjEwMDAwO2JvcmRlci1yYWRpdXM6LjMwNzY5MjMxZW07Ym94LXNoYWRvdzowIDAgLjYxNTM4NDYyZW0gcmdiYSgwLDAsMCwuNCl9I19fdmNvbnNvbGUgLnZjLW1hc2t7dG9wOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt6LWluZGV4OjEwMDAxO3RyYW5zaXRpb246YmFja2dyb3VuZCAuM3M7LXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnRyYW5zcGFyZW50O292ZXJmbG93LXk6c2Nyb2xsfSNfX3Zjb25zb2xlIC52Yy1tYXNrLCNfX3Zjb25zb2xlIC52Yy1wYW5lbHtkaXNwbGF5Om5vbmU7cG9zaXRpb246Zml4ZWQ7bGVmdDowO3JpZ2h0OjA7Ym90dG9tOjB9I19fdmNvbnNvbGUgLnZjLXBhbmVse21pbi1oZWlnaHQ6ODUlO3otaW5kZXg6MTAwMDI7YmFja2dyb3VuZC1jb2xvcjojZWZlZmY0Oy13ZWJraXQtdHJhbnNpdGlvbjotd2Via2l0LXRyYW5zZm9ybSAuM3M7dHJhbnNpdGlvbjotd2Via2l0LXRyYW5zZm9ybSAuM3M7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjNzO3RyYW5zaXRpb246dHJhbnNmb3JtIC4zcywtd2Via2l0LXRyYW5zZm9ybSAuM3M7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlWSgxMDAlKTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgxMDAlKX0jX192Y29uc29sZSAudmMtdGFiYmFye2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNkOWQ5ZDk7b3ZlcmZsb3cteDphdXRvO2hlaWdodDozZW07d2lkdGg6YXV0bzt3aGl0ZS1zcGFjZTpub3dyYXB9I19fdmNvbnNvbGUgLnZjLXRhYmJhciAudmMtdGFie2Rpc3BsYXk6aW5saW5lLWJsb2NrO2xpbmUtaGVpZ2h0OjNlbTtwYWRkaW5nOjAgMS4xNTM4NDYxNWVtO2JvcmRlci1yaWdodDoxcHggc29saWQgI2Q5ZDlkOTt0ZXh0LWRlY29yYXRpb246bm9uZTtjb2xvcjojMDAwOy13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjp0cmFuc3BhcmVudDstd2Via2l0LXRvdWNoLWNhbGxvdXQ6bm9uZX0jX192Y29uc29sZSAudmMtdGFiYmFyIC52Yy10YWI6YWN0aXZle2JhY2tncm91bmQtY29sb3I6cmdiYSgwLDAsMCwuMTUpfSNfX3Zjb25zb2xlIC52Yy10YWJiYXIgLnZjLXRhYi52Yy1hY3RpdmVke2JhY2tncm91bmQtY29sb3I6I2ZmZn0jX192Y29uc29sZSAudmMtY29udGVudHtiYWNrZ3JvdW5kLWNvbG9yOiNmZmY7b3ZlcmZsb3cteDpoaWRkZW47b3ZlcmZsb3cteTphdXRvO3Bvc2l0aW9uOmFic29sdXRlO3RvcDozLjA3NjkyMzA4ZW07bGVmdDowO3JpZ2h0OjA7Ym90dG9tOjMuMDc2OTIzMDhlbTstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaH0jX192Y29uc29sZSAudmMtY29udGVudC52Yy1oYXMtdG9wYmFye3RvcDo1LjQ2MTUzODQ2ZW19I19fdmNvbnNvbGUgLnZjLXRvcGJhcntiYWNrZ3JvdW5kLWNvbG9yOiNmYmY5ZmU7ZGlzcGxheTpmbGV4O2Rpc3BsYXk6LXdlYmtpdC1ib3g7ZmxleC1kaXJlY3Rpb246cm93O2ZsZXgtd3JhcDp3cmFwOy13ZWJraXQtYm94LWRpcmVjdGlvbjpyb3c7LXdlYmtpdC1mbGV4LXdyYXA6d3JhcDt3aWR0aDoxMDAlfSNfX3Zjb25zb2xlIC52Yy10b3BiYXIgLnZjLXRvcHRhYntkaXNwbGF5Om5vbmU7ZmxleDoxOy13ZWJraXQtYm94LWZsZXg6MTtsaW5lLWhlaWdodDoyLjMwNzY5MjMxZW07cGFkZGluZzowIDEuMTUzODQ2MTVlbTtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZDlkOWQ5O3RleHQtZGVjb3JhdGlvbjpub25lO3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOiMwMDA7LXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnRyYW5zcGFyZW50Oy13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lfSNfX3Zjb25zb2xlIC52Yy10b3BiYXIgLnZjLXRvcHRhYi52Yy10b2dnbGV7ZGlzcGxheTpibG9ja30jX192Y29uc29sZSAudmMtdG9wYmFyIC52Yy10b3B0YWI6YWN0aXZle2JhY2tncm91bmQtY29sb3I6cmdiYSgwLDAsMCwuMTUpfSNfX3Zjb25zb2xlIC52Yy10b3BiYXIgLnZjLXRvcHRhYi52Yy1hY3RpdmVke2JvcmRlci1ib3R0b206MXB4IHNvbGlkICMzZTgyZjd9I19fdmNvbnNvbGUgLnZjLWxvZ2JveHtkaXNwbGF5Om5vbmU7cG9zaXRpb246cmVsYXRpdmU7bWluLWhlaWdodDoxMDAlfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggaXtmb250LXN0eWxlOm5vcm1hbH0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1sb2d7cGFkZGluZy1ib3R0b206M2VtOy13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjp0cmFuc3BhcmVudH0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1sb2c6ZW1wdHk6YmVmb3Jle2NvbnRlbnQ6XCJFbXB0eVwiO2NvbG9yOiM5OTk7cG9zaXRpb246YWJzb2x1dGU7dG9wOjQ1JTtsZWZ0OjA7cmlnaHQ6MDtib3R0b206MDtmb250LXNpemU6MS4xNTM4NDYxNWVtO3RleHQtYWxpZ246Y2VudGVyfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWl0ZW17bWFyZ2luOjA7cGFkZGluZzouNDYxNTM4NDZlbSAuNjE1Mzg0NjJlbTtvdmVyZmxvdzpoaWRkZW47bGluZS1oZWlnaHQ6MS4zO2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNlZWU7d29yZC1icmVhazpicmVhay13b3JkfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWl0ZW0taW5mb3tjb2xvcjojNmE1YWNkfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWl0ZW0tZGVidWd7Y29sb3I6I2RhYTUyMH0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1pdGVtLXdhcm57Y29sb3I6b3JhbmdlO2JvcmRlci1jb2xvcjojZmZiOTMwO2JhY2tncm91bmQtY29sb3I6I2ZmZmFjZH0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1pdGVtLWVycm9ye2NvbG9yOiNkYzE0M2M7Ym9yZGVyLWNvbG9yOiNmNGEwYWI7YmFja2dyb3VuZC1jb2xvcjojZmZlNGUxfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWxvZy52Yy1sb2ctcGFydGx5IC52Yy1pdGVte2Rpc3BsYXk6bm9uZX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1sb2cudmMtbG9nLXBhcnRseS1lcnJvciAudmMtaXRlbS1lcnJvciwjX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1sb2cudmMtbG9nLXBhcnRseS1pbmZvIC52Yy1pdGVtLWluZm8sI19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtbG9nLnZjLWxvZy1wYXJ0bHktbG9nIC52Yy1pdGVtLWxvZywjX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1sb2cudmMtbG9nLXBhcnRseS13YXJuIC52Yy1pdGVtLXdhcm57ZGlzcGxheTpibG9ja30jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1pdGVtIC52Yy1pdGVtLWNvbnRlbnR7bWFyZ2luLXJpZ2h0OjQuNjE1Mzg0NjJlbTtkaXNwbGF5OmJsb2NrfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWl0ZW0gLnZjLWl0ZW0tbWV0YXtjb2xvcjojODg4O2Zsb2F0OnJpZ2h0O3dpZHRoOjQuNjE1Mzg0NjJlbTt0ZXh0LWFsaWduOnJpZ2h0fSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWl0ZW0udmMtaXRlbS1ub21ldGEgLnZjLWl0ZW0tY29udGVudHttYXJnaW4tcmlnaHQ6MH0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1pdGVtLnZjLWl0ZW0tbm9tZXRhIC52Yy1pdGVtLW1ldGF7ZGlzcGxheTpub25lfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWl0ZW0gLnZjLWl0ZW0tY29kZXtkaXNwbGF5OmJsb2NrO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93OmF1dG87cG9zaXRpb246cmVsYXRpdmV9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtaXRlbS1jb2RlLnZjLWl0ZW0tY29kZS1pbnB1dCwjX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1pdGVtIC52Yy1pdGVtLWNvZGUudmMtaXRlbS1jb2RlLW91dHB1dHtwYWRkaW5nLWxlZnQ6LjkyMzA3NjkyZW19I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtaXRlbS1jb2RlLnZjLWl0ZW0tY29kZS1pbnB1dDpiZWZvcmUsI19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtaXRlbS1jb2RlLnZjLWl0ZW0tY29kZS1vdXRwdXQ6YmVmb3Jle2NvbnRlbnQ6XCJcXFxcMjAzQVwiO3Bvc2l0aW9uOmFic29sdXRlO3RvcDotLjIzMDc2OTIzZW07bGVmdDowO2ZvbnQtc2l6ZToxLjIzMDc2OTIzZW07Y29sb3I6IzZhNWFjZH0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1pdGVtIC52Yy1pdGVtLWNvZGUudmMtaXRlbS1jb2RlLW91dHB1dDpiZWZvcmV7Y29udGVudDpcIlxcXFwyMDM5XCJ9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtZm9sZHtkaXNwbGF5OmJsb2NrO292ZXJmbG93OmF1dG87LXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6dG91Y2h9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtZm9sZCAudmMtZm9sZC1vdXRlcntkaXNwbGF5OmJsb2NrO2ZvbnQtc3R5bGU6aXRhbGljO3BhZGRpbmctbGVmdDouNzY5MjMwNzdlbTtwb3NpdGlvbjpyZWxhdGl2ZX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1pdGVtIC52Yy1mb2xkIC52Yy1mb2xkLW91dGVyOmFjdGl2ZXtiYWNrZ3JvdW5kLWNvbG9yOiNlNmU2ZTZ9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtZm9sZCAudmMtZm9sZC1vdXRlcjpiZWZvcmV7Y29udGVudDpcIlwiO3Bvc2l0aW9uOmFic29sdXRlO3RvcDouMzA3NjkyMzFlbTtsZWZ0Oi4xNTM4NDYxNWVtO3dpZHRoOjA7aGVpZ2h0OjA7Ym9yZGVyOi4zMDc2OTIzMWVtIHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1sZWZ0LWNvbG9yOiMwMDB9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtZm9sZCAudmMtZm9sZC1vdXRlci52Yy10b2dnbGU6YmVmb3Jle3RvcDouNDYxNTM4NDZlbTtsZWZ0OjA7Ym9yZGVyLXRvcC1jb2xvcjojMDAwO2JvcmRlci1sZWZ0LWNvbG9yOnRyYW5zcGFyZW50fSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWl0ZW0gLnZjLWZvbGQgLnZjLWZvbGQtaW5uZXJ7ZGlzcGxheTpub25lO21hcmdpbi1sZWZ0Oi43NjkyMzA3N2VtfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWl0ZW0gLnZjLWZvbGQgLnZjLWZvbGQtaW5uZXIudmMtdG9nZ2xle2Rpc3BsYXk6YmxvY2t9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtZm9sZCAudmMtZm9sZC1pbm5lciAudmMtY29kZS1rZXl7bWFyZ2luLWxlZnQ6Ljc2OTIzMDc3ZW19I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtaXRlbSAudmMtZm9sZCAudmMtZm9sZC1vdXRlciAudmMtY29kZS1rZXl7bWFyZ2luLWxlZnQ6MH0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1jb2RlLWtleXtjb2xvcjojOTA1fSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWNvZGUtcHJpdmF0ZS1rZXl7Y29sb3I6I2QzOTFiNX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1jb2RlLWZ1bmN0aW9ue2NvbG9yOiM5MDU7Zm9udC1zdHlsZTppdGFsaWN9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtY29kZS1ib29sZWFuLCNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWNvZGUtbnVtYmVye2NvbG9yOiMwMDg2YjN9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtY29kZS1zdHJpbmd7Y29sb3I6IzE4MzY5MX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1jb2RlLW51bGwsI19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtY29kZS11bmRlZmluZWR7Y29sb3I6IzY2Nn0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1jbWR7cG9zaXRpb246YWJzb2x1dGU7aGVpZ2h0OjMuMDc2OTIzMDhlbTtsZWZ0OjA7cmlnaHQ6MDtib3R0b206MDtib3JkZXItdG9wOjFweCBzb2xpZCAjZDlkOWQ5O2Rpc3BsYXk6YmxvY2shaW1wb3J0YW50fSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWNtZCAudmMtY21kLWlucHV0LXdyYXB7ZGlzcGxheTpibG9jaztoZWlnaHQ6Mi4xNTM4NDYxNWVtO21hcmdpbi1yaWdodDozLjA3NjkyMzA4ZW07cGFkZGluZzouNDYxNTM4NDZlbSAuNjE1Mzg0NjJlbX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1jbWQgLnZjLWNtZC1pbnB1dHt3aWR0aDoxMDAlO2JvcmRlcjpub25lO3Jlc2l6ZTpub25lO291dGxpbmU6bm9uZTtwYWRkaW5nOjA7Zm9udC1zaXplOi45MjMwNzY5MmVtfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWNtZCAudmMtY21kLWlucHV0Ojotd2Via2l0LWlucHV0LXBsYWNlaG9sZGVye2xpbmUtaGVpZ2h0OjIuMTUzODQ2MTVlbX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1jbWQgLnZjLWNtZC1idG57cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7cmlnaHQ6MDtib3R0b206MDt3aWR0aDozLjA3NjkyMzA4ZW07Ym9yZGVyOm5vbmU7YmFja2dyb3VuZC1jb2xvcjojZWZlZmY0O291dGxpbmU6bm9uZTstd2Via2l0LXRvdWNoLWNhbGxvdXQ6bm9uZTtmb250LXNpemU6MWVtfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLWNtZCAudmMtY21kLWJ0bjphY3RpdmV7YmFja2dyb3VuZC1jb2xvcjpyZ2JhKDAsMCwwLC4xNSl9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtZ3JvdXAgLnZjLWdyb3VwLXByZXZpZXd7LXdlYmtpdC10b3VjaC1jYWxsb3V0Om5vbmV9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtZ3JvdXAgLnZjLWdyb3VwLXByZXZpZXc6YWN0aXZle2JhY2tncm91bmQtY29sb3I6I2U2ZTZlNn0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1ncm91cCAudmMtZ3JvdXAtZGV0YWlse2Rpc3BsYXk6bm9uZTtwYWRkaW5nOjAgMCAuNzY5MjMwNzdlbSAxLjUzODQ2MTU0ZW07Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2VlZX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1ncm91cC52Yy1hY3RpdmVkIC52Yy1ncm91cC1kZXRhaWx7ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLWNvbG9yOiNmYmY5ZmV9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtZ3JvdXAudmMtYWN0aXZlZCAudmMtdGFibGUtcm93e2JhY2tncm91bmQtY29sb3I6I2ZmZn0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy1ncm91cC52Yy1hY3RpdmVkIC52Yy1ncm91cC1wcmV2aWV3e2JhY2tncm91bmQtY29sb3I6I2ZiZjlmZX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy10YWJsZSAudmMtdGFibGUtcm93e2Rpc3BsYXk6ZmxleDtkaXNwbGF5Oi13ZWJraXQtZmxleDtmbGV4LWRpcmVjdGlvbjpyb3c7ZmxleC13cmFwOndyYXA7LXdlYmtpdC1ib3gtZGlyZWN0aW9uOnJvdzstd2Via2l0LWZsZXgtd3JhcDp3cmFwO292ZXJmbG93OmhpZGRlbjtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZWVlfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1yb3cudmMtbGVmdC1ib3JkZXJ7Ym9yZGVyLWxlZnQ6MXB4IHNvbGlkICNlZWV9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtdGFibGUgLnZjLXRhYmxlLWNvbHtmbGV4OjE7LXdlYmtpdC1ib3gtZmxleDoxO3BhZGRpbmc6LjIzMDc2OTIzZW0gLjMwNzY5MjMxZW07Ym9yZGVyLWxlZnQ6MXB4IHNvbGlkICNlZWU7b3ZlcmZsb3c6YXV0bzt3aGl0ZS1zcGFjZTpwcmUtd3JhcDt3b3JkLWJyZWFrOmJyZWFrLXdvcmQ7LXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6dG91Y2h9I19fdmNvbnNvbGUgLnZjLWxvZ2JveCAudmMtdGFibGUgLnZjLXRhYmxlLWNvbDpmaXJzdC1jaGlsZHtib3JkZXI6bm9uZX0jX192Y29uc29sZSAudmMtbG9nYm94IC52Yy10YWJsZSAudmMtc21hbGwgLnZjLXRhYmxlLWNvbHtwYWRkaW5nOjAgLjMwNzY5MjMxZW07Zm9udC1zaXplOi45MjMwNzY5MmVtfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1jb2wtMntmbGV4OjI7LXdlYmtpdC1ib3gtZmxleDoyfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1jb2wtM3tmbGV4OjM7LXdlYmtpdC1ib3gtZmxleDozfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1jb2wtNHtmbGV4OjQ7LXdlYmtpdC1ib3gtZmxleDo0fSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1jb2wtNXtmbGV4OjU7LXdlYmtpdC1ib3gtZmxleDo1fSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1jb2wtNntmbGV4OjY7LXdlYmtpdC1ib3gtZmxleDo2fSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1yb3ctZXJyb3J7Ym9yZGVyLWNvbG9yOiNmNGEwYWI7YmFja2dyb3VuZC1jb2xvcjojZmZlNGUxfSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1yb3ctZXJyb3IgLnZjLXRhYmxlLWNvbHtjb2xvcjojZGMxNDNjO2JvcmRlci1jb2xvcjojZjRhMGFifSNfX3Zjb25zb2xlIC52Yy1sb2dib3ggLnZjLXRhYmxlIC52Yy10YWJsZS1jb2wtdGl0bGV7Zm9udC13ZWlnaHQ6NzAwfSNfX3Zjb25zb2xlIC52Yy1sb2dib3gudmMtYWN0aXZlZHtkaXNwbGF5OmJsb2NrfSNfX3Zjb25zb2xlIC52Yy10b29sYmFye2JvcmRlci10b3A6MXB4IHNvbGlkICNkOWQ5ZDk7bGluZS1oZWlnaHQ6M2VtO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO2Rpc3BsYXk6ZmxleDtkaXNwbGF5Oi13ZWJraXQtYm94O2ZsZXgtZGlyZWN0aW9uOnJvdzstd2Via2l0LWJveC1kaXJlY3Rpb246cm93fSNfX3Zjb25zb2xlIC52Yy10b29sYmFyIC52Yy10b29se2Rpc3BsYXk6bm9uZTt0ZXh0LWRlY29yYXRpb246bm9uZTtjb2xvcjojMDAwO3dpZHRoOjUwJTtmbGV4OjE7LXdlYmtpdC1ib3gtZmxleDoxO3RleHQtYWxpZ246Y2VudGVyO3Bvc2l0aW9uOnJlbGF0aXZlOy13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lfSNfX3Zjb25zb2xlIC52Yy10b29sYmFyIC52Yy10b29sLnZjLWdsb2JhbC10b29sLCNfX3Zjb25zb2xlIC52Yy10b29sYmFyIC52Yy10b29sLnZjLXRvZ2dsZXtkaXNwbGF5OmJsb2NrfSNfX3Zjb25zb2xlIC52Yy10b29sYmFyIC52Yy10b29sOmFjdGl2ZXtiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoMCwwLDAsLjE1KX0jX192Y29uc29sZSAudmMtdG9vbGJhciAudmMtdG9vbDphZnRlcntjb250ZW50OlwiIFwiO3Bvc2l0aW9uOmFic29sdXRlO3RvcDouNTM4NDYxNTRlbTtib3R0b206LjUzODQ2MTU0ZW07cmlnaHQ6MDtib3JkZXItbGVmdDoxcHggc29saWQgI2Q5ZDlkOX0jX192Y29uc29sZSAudmMtdG9vbGJhciAudmMtdG9vbC1sYXN0OmFmdGVye2JvcmRlcjpub25lfSNfX3Zjb25zb2xlLnZjLXRvZ2dsZSAudmMtc3dpdGNoe2Rpc3BsYXk6bm9uZX0jX192Y29uc29sZS52Yy10b2dnbGUgLnZjLW1hc2t7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLC42KTtkaXNwbGF5OmJsb2NrfSNfX3Zjb25zb2xlLnZjLXRvZ2dsZSAudmMtcGFuZWx7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlKDApO3RyYW5zZm9ybTp0cmFuc2xhdGUoMCl9JyxcIlwiXSl9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7ZS5leHBvcnRzPWZ1bmN0aW9uKCl7dmFyIGU9W107cmV0dXJuIGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtmb3IodmFyIGU9W10sdD0wO3Q8dGhpcy5sZW5ndGg7dCsrKXt2YXIgbz10aGlzW3RdO29bMl0/ZS5wdXNoKFwiQG1lZGlhIFwiK29bMl0rXCJ7XCIrb1sxXStcIn1cIik6ZS5wdXNoKG9bMV0pfXJldHVybiBlLmpvaW4oXCJcIil9LGUuaT1mdW5jdGlvbih0LG8pe1wic3RyaW5nXCI9PXR5cGVvZiB0JiYodD1bW251bGwsdCxcIlwiXV0pO2Zvcih2YXIgbj17fSxpPTA7aTx0aGlzLmxlbmd0aDtpKyspe3ZhciBhPXRoaXNbaV1bMF07XCJudW1iZXJcIj09dHlwZW9mIGEmJihuW2FdPSEwKX1mb3IoaT0wO2k8dC5sZW5ndGg7aSsrKXt2YXIgcj10W2ldO1wibnVtYmVyXCI9PXR5cGVvZiByWzBdJiZuW3JbMF1dfHwobyYmIXJbMl0/clsyXT1vOm8mJihyWzJdPVwiKFwiK3JbMl0rXCIpIGFuZCAoXCIrbytcIilcIiksZS5wdXNoKHIpKX19LGV9fSxmdW5jdGlvbihlLHQsbyl7ZnVuY3Rpb24gbihlLHQpe2Zvcih2YXIgbz0wO288ZS5sZW5ndGg7bysrKXt2YXIgbj1lW29dLGk9ZltuLmlkXTtpZihpKXtpLnJlZnMrKztmb3IodmFyIGE9MDthPGkucGFydHMubGVuZ3RoO2ErKylpLnBhcnRzW2FdKG4ucGFydHNbYV0pO2Zvcig7YTxuLnBhcnRzLmxlbmd0aDthKyspaS5wYXJ0cy5wdXNoKHMobi5wYXJ0c1thXSx0KSl9ZWxzZXtmb3IodmFyIHI9W10sYT0wO2E8bi5wYXJ0cy5sZW5ndGg7YSsrKXIucHVzaChzKG4ucGFydHNbYV0sdCkpO2Zbbi5pZF09e2lkOm4uaWQscmVmczoxLHBhcnRzOnJ9fX19ZnVuY3Rpb24gaShlKXtmb3IodmFyIHQ9W10sbz17fSxuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciBpPWVbbl0sYT1pWzBdLHI9aVsxXSxsPWlbMl0sYz1pWzNdLHM9e2NzczpyLG1lZGlhOmwsc291cmNlTWFwOmN9O29bYV0/b1thXS5wYXJ0cy5wdXNoKHMpOnQucHVzaChvW2FdPXtpZDphLHBhcnRzOltzXX0pfXJldHVybiB0fWZ1bmN0aW9uIGEoZSx0KXt2YXIgbz1nKCksbj15W3kubGVuZ3RoLTFdO2lmKFwidG9wXCI9PT1lLmluc2VydEF0KW4/bi5uZXh0U2libGluZz9vLmluc2VydEJlZm9yZSh0LG4ubmV4dFNpYmxpbmcpOm8uYXBwZW5kQ2hpbGQodCk6by5pbnNlcnRCZWZvcmUodCxvLmZpcnN0Q2hpbGQpLHkucHVzaCh0KTtlbHNle2lmKFwiYm90dG9tXCIhPT1lLmluc2VydEF0KXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciAnaW5zZXJ0QXQnLiBNdXN0IGJlICd0b3AnIG9yICdib3R0b20nLlwiKTtvLmFwcGVuZENoaWxkKHQpfX1mdW5jdGlvbiByKGUpe2UucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKTt2YXIgdD15LmluZGV4T2YoZSk7dD49MCYmeS5zcGxpY2UodCwxKX1mdW5jdGlvbiBsKGUpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtyZXR1cm4gdC50eXBlPVwidGV4dC9jc3NcIixhKGUsdCksdH1mdW5jdGlvbiBjKGUpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO3JldHVybiB0LnJlbD1cInN0eWxlc2hlZXRcIixhKGUsdCksdH1mdW5jdGlvbiBzKGUsdCl7dmFyIG8sbixpO2lmKHQuc2luZ2xldG9uKXt2YXIgYT1tKys7bz1ifHwoYj1sKHQpKSxuPWQuYmluZChudWxsLG8sYSwhMSksaT1kLmJpbmQobnVsbCxvLGEsITApfWVsc2UgZS5zb3VyY2VNYXAmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFVSTCYmXCJmdW5jdGlvblwiPT10eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCYmXCJmdW5jdGlvblwiPT10eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCYmXCJmdW5jdGlvblwiPT10eXBlb2YgQmxvYiYmXCJmdW5jdGlvblwiPT10eXBlb2YgYnRvYT8obz1jKHQpLG49di5iaW5kKG51bGwsbyksaT1mdW5jdGlvbigpe3Iobyksby5ocmVmJiZVUkwucmV2b2tlT2JqZWN0VVJMKG8uaHJlZil9KToobz1sKHQpLG49dS5iaW5kKG51bGwsbyksaT1mdW5jdGlvbigpe3Iobyl9KTtyZXR1cm4gbihlKSxmdW5jdGlvbih0KXtpZih0KXtpZih0LmNzcz09PWUuY3NzJiZ0Lm1lZGlhPT09ZS5tZWRpYSYmdC5zb3VyY2VNYXA9PT1lLnNvdXJjZU1hcClyZXR1cm47bihlPXQpfWVsc2UgaSgpfX1mdW5jdGlvbiBkKGUsdCxvLG4pe3ZhciBpPW8/XCJcIjpuLmNzcztpZihlLnN0eWxlU2hlZXQpZS5zdHlsZVNoZWV0LmNzc1RleHQ9Xyh0LGkpO2Vsc2V7dmFyIGE9ZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaSkscj1lLmNoaWxkTm9kZXM7clt0XSYmZS5yZW1vdmVDaGlsZChyW3RdKSxyLmxlbmd0aD9lLmluc2VydEJlZm9yZShhLHJbdF0pOmUuYXBwZW5kQ2hpbGQoYSl9fWZ1bmN0aW9uIHUoZSx0KXt2YXIgbz10LmNzcyxuPXQubWVkaWE7aWYobiYmZS5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLG4pLGUuc3R5bGVTaGVldCllLnN0eWxlU2hlZXQuY3NzVGV4dD1vO2Vsc2V7Zm9yKDtlLmZpcnN0Q2hpbGQ7KWUucmVtb3ZlQ2hpbGQoZS5maXJzdENoaWxkKTtlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG8pKX19ZnVuY3Rpb24gdihlLHQpe3ZhciBvPXQuY3NzLG49dC5zb3VyY2VNYXA7biYmKG8rPVwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIitidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShuKSkpKStcIiAqL1wiKTt2YXIgaT1uZXcgQmxvYihbb10se3R5cGU6XCJ0ZXh0L2Nzc1wiXG59KSxhPWUuaHJlZjtlLmhyZWY9VVJMLmNyZWF0ZU9iamVjdFVSTChpKSxhJiZVUkwucmV2b2tlT2JqZWN0VVJMKGEpfXZhciBmPXt9LHA9ZnVuY3Rpb24oZSl7dmFyIHQ7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuXCJ1bmRlZmluZWRcIj09dHlwZW9mIHQmJih0PWUuYXBwbHkodGhpcyxhcmd1bWVudHMpKSx0fX0saD1wKGZ1bmN0aW9uKCl7cmV0dXJuL21zaWUgWzYtOV1cXGIvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSl9KSxnPXAoZnVuY3Rpb24oKXtyZXR1cm4gZG9jdW1lbnQuaGVhZHx8ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdfSksYj1udWxsLG09MCx5PVtdO2UuZXhwb3J0cz1mdW5jdGlvbihlLHQpe3Q9dHx8e30sXCJ1bmRlZmluZWRcIj09dHlwZW9mIHQuc2luZ2xldG9uJiYodC5zaW5nbGV0b249aCgpKSxcInVuZGVmaW5lZFwiPT10eXBlb2YgdC5pbnNlcnRBdCYmKHQuaW5zZXJ0QXQ9XCJib3R0b21cIik7dmFyIG89aShlKTtyZXR1cm4gbihvLHQpLGZ1bmN0aW9uKGUpe2Zvcih2YXIgYT1bXSxyPTA7cjxvLmxlbmd0aDtyKyspe3ZhciBsPW9bcl0sYz1mW2wuaWRdO2MucmVmcy0tLGEucHVzaChjKX1pZihlKXt2YXIgcz1pKGUpO24ocyx0KX1mb3IodmFyIHI9MDtyPGEubGVuZ3RoO3IrKyl7dmFyIGM9YVtyXTtpZigwPT09Yy5yZWZzKXtmb3IodmFyIGQ9MDtkPGMucGFydHMubGVuZ3RoO2QrKyljLnBhcnRzW2RdKCk7ZGVsZXRlIGZbYy5pZF19fX19O3ZhciBfPWZ1bmN0aW9uKCl7dmFyIGU9W107cmV0dXJuIGZ1bmN0aW9uKHQsbyl7cmV0dXJuIGVbdF09byxlLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXCIpfX0oKX0sZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9JzxkaXYgaWQ9XCJfX3Zjb25zb2xlXCIgY2xhc3M9XCJcIj5cXG4gIDxkaXYgY2xhc3M9XCJ2Yy1zd2l0Y2hcIj52Q29uc29sZTwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cInZjLW1hc2tcIj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cInZjLXBhbmVsXCI+XFxuICAgIDxkaXYgY2xhc3M9XCJ2Yy10YWJiYXJcIj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJ2Yy10b3BiYXJcIj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJ2Yy1jb250ZW50XCI+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwidmMtdG9vbGJhclwiPlxcbiAgICAgIDxhIGNsYXNzPVwidmMtdG9vbCB2Yy1nbG9iYWwtdG9vbCB2Yy10b29sLWxhc3QgdmMtaGlkZVwiPkhpZGU8L2E+XFxuICAgIDwvZGl2PlxcbiAgPC9kaXY+XFxuPC9kaXY+J30sZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9JzxhIGNsYXNzPVwidmMtdGFiXCIgZGF0YS10YWI9XCJ7e2lkfX1cIiBpZD1cIl9fdmNfdGFiX3t7aWR9fVwiPnt7bmFtZX19PC9hPid9LGZ1bmN0aW9uKGUsdCl7ZS5leHBvcnRzPSc8ZGl2IGNsYXNzPVwidmMtbG9nYm94XCIgaWQ9XCJfX3ZjX2xvZ197e2lkfX1cIj5cXG4gIFxcbjwvZGl2Pid9LGZ1bmN0aW9uKGUsdCl7ZS5leHBvcnRzPSc8YSBjbGFzcz1cInZjLXRvcHRhYiB2Yy10b3BiYXIte3twbHVnaW5JRH19e3tpZiAoY2xhc3NOYW1lKX19IHt7Y2xhc3NOYW1lfX17ey9pZn19XCI+e3tuYW1lfX08L2E+J30sZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9JzxhIGNsYXNzPVwidmMtdG9vbCB2Yy10b29sLXt7cGx1Z2luSUR9fVwiPnt7bmFtZX19PC9hPid9LGZ1bmN0aW9uKGUsdCxvKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUpe2lmKGUmJmUuX19lc01vZHVsZSlyZXR1cm4gZTt2YXIgdD17fTtpZihudWxsIT1lKWZvcih2YXIgbyBpbiBlKU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLG8pJiYodFtvXT1lW29dKTtyZXR1cm4gdFtcImRlZmF1bHRcIl09ZSx0fWZ1bmN0aW9uIGkoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntcImRlZmF1bHRcIjplfX1mdW5jdGlvbiBhKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiByKGUsdCl7aWYoIWUpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiF0fHxcIm9iamVjdFwiIT10eXBlb2YgdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgdD9lOnR9ZnVuY3Rpb24gbChlLHQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQmJm51bGwhPT10KXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiB0KTtlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQmJnQucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6ZSxlbnVtZXJhYmxlOiExLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSx0JiYoT2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5zZXRQcm90b3R5cGVPZihlLHQpOmUuX19wcm90b19fPXQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBjPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbz0wO288dC5sZW5ndGg7bysrKXt2YXIgbj10W29dO24uZW51bWVyYWJsZT1uLmVudW1lcmFibGV8fCExLG4uY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIG4mJihuLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxuLmtleSxuKX19cmV0dXJuIGZ1bmN0aW9uKHQsbyxuKXtyZXR1cm4gbyYmZSh0LnByb3RvdHlwZSxvKSxuJiZlKHQsbiksdH19KCkscz1mdW5jdGlvbiB3KGUsdCxvKXtudWxsPT09ZSYmKGU9RnVuY3Rpb24ucHJvdG90eXBlKTt2YXIgbj1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsdCk7aWYodm9pZCAwPT09bil7dmFyIGk9T2JqZWN0LmdldFByb3RvdHlwZU9mKGUpO3JldHVybiBudWxsPT09aT92b2lkIDA6dyhpLHQsbyl9aWYoXCJ2YWx1ZVwiaW4gbilyZXR1cm4gbi52YWx1ZTt2YXIgYT1uLmdldDtpZih2b2lkIDAhPT1hKXJldHVybiBhLmNhbGwobyl9LGQ9byg1KSx1PWkoZCksdj1vKDQpLGY9bih2KSxwPW8oMTcpLGg9aShwKSxnPW8oMjIpLGI9aShnKSxtPW8oMjMpLHk9aShtKSxfPWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoKXt2YXIgZTthKHRoaXMsdCk7Zm9yKHZhciBvPWFyZ3VtZW50cy5sZW5ndGgsbj1BcnJheShvKSxpPTA7bz5pO2krKyluW2ldPWFyZ3VtZW50c1tpXTt2YXIgbD1yKHRoaXMsKGU9T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpKS5jYWxsLmFwcGx5KGUsW3RoaXNdLmNvbmNhdChuKSkpO3JldHVybiBsLnRwbFRhYmJveD1iW1wiZGVmYXVsdFwiXSxsLndpbmRvd09uRXJyb3I9bnVsbCxsfXJldHVybiBsKHQsZSksYyh0LFt7a2V5Olwib25SZWFkeVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcztzKE9iamVjdC5nZXRQcm90b3R5cGVPZih0LnByb3RvdHlwZSksXCJvblJlYWR5XCIsdGhpcykuY2FsbCh0aGlzKSx1W1wiZGVmYXVsdFwiXS5iaW5kKHVbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1jbWRcIix0aGlzLiR0YWJib3gpLFwic3VibWl0XCIsZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpO3ZhciBvPXVbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1jbWQtaW5wdXRcIix0LnRhcmdldCksbj1vLnZhbHVlO28udmFsdWU9XCJcIixcIlwiIT09biYmZS5ldmFsQ29tbWFuZChuKX0pO3ZhciBvPVwiXCI7bys9XCJpZiAoISF3aW5kb3cpIHtcIixvKz1cIndpbmRvdy5fX3ZDb25zb2xlX2NtZF9yZXN1bHQgPSB1bmRlZmluZWQ7XCIsbys9XCJ3aW5kb3cuX192Q29uc29sZV9jbWRfZXJyb3IgPSBmYWxzZTtcIixvKz1cIn1cIjt2YXIgbj1kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKSxpPVwiXCI7bi5sZW5ndGg+MCYmKGk9blswXS5nZXRBdHRyaWJ1dGUoXCJub25jZVwiKXx8XCJcIik7dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIlNDUklQVFwiKTthLmlubmVySFRNTD1vLGEuc2V0QXR0cmlidXRlKFwibm9uY2VcIixpKSxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoYSksZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUNoaWxkKGEpfX0se2tleTpcIm1vY2tDb25zb2xlXCIsdmFsdWU6ZnVuY3Rpb24oKXtzKE9iamVjdC5nZXRQcm90b3R5cGVPZih0LnByb3RvdHlwZSksXCJtb2NrQ29uc29sZVwiLHRoaXMpLmNhbGwodGhpcyk7dmFyIGU9dGhpcztmLmlzRnVuY3Rpb24od2luZG93Lm9uZXJyb3IpJiYodGhpcy53aW5kb3dPbkVycm9yPXdpbmRvdy5vbmVycm9yKSx3aW5kb3cub25lcnJvcj1mdW5jdGlvbih0LG8sbixpLGEpe3ZhciByPXQ7byYmKHIrPVwiXFxuXCIrby5yZXBsYWNlKGxvY2F0aW9uLm9yaWdpbixcIlwiKSksKG58fGkpJiYocis9XCI6XCIrbitcIjpcIitpKTt2YXIgbD0hIWEmJiEhYS5zdGFjayxjPWwmJmEuc3RhY2sudG9TdHJpbmcoKXx8XCJcIjtlLnByaW50TG9nKHtsb2dUeXBlOlwiZXJyb3JcIixsb2dzOltyLGNdLG5vT3JpZ2luOiEwfSksZi5pc0Z1bmN0aW9uKGUud2luZG93T25FcnJvcikmJmUud2luZG93T25FcnJvci5jYWxsKHdpbmRvdyx0LG8sbixpLGEpfX19LHtrZXk6XCJldmFsQ29tbWFuZFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMucHJpbnRMb2coe2xvZ1R5cGU6XCJsb2dcIixjb250ZW50OnVbXCJkZWZhdWx0XCJdLnJlbmRlcih5W1wiZGVmYXVsdFwiXSx7Y29udGVudDplLHR5cGU6XCJpbnB1dFwifSksbm9NZXRhOiEwLHN0eWxlOlwiXCJ9KTt2YXIgdD1cIlwiO3QrPVwidHJ5IHtcXG5cIix0Kz1cIndpbmRvdy5fX3ZDb25zb2xlX2NtZF9yZXN1bHQgPSAoZnVuY3Rpb24oKSB7XFxuXCIsdCs9XCJyZXR1cm4gXCIrZStcIjtcXG5cIix0Kz1cIn0pKCk7XFxuXCIsdCs9XCJ3aW5kb3cuX192Q29uc29sZV9jbWRfZXJyb3IgPSBmYWxzZTtcXG5cIix0Kz1cIn0gY2F0Y2ggKGUpIHtcXG5cIix0Kz1cIndpbmRvdy5fX3ZDb25zb2xlX2NtZF9yZXN1bHQgPSBlLm1lc3NhZ2U7XFxuXCIsdCs9XCJ3aW5kb3cuX192Q29uc29sZV9jbWRfZXJyb3IgPSB0cnVlO1xcblwiLHQrPVwifVwiO3ZhciBvPWRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpLG49XCJcIjtvLmxlbmd0aD4wJiYobj1vWzBdLmdldEF0dHJpYnV0ZShcIm5vbmNlXCIpfHxcIlwiKTt2YXIgaT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiU0NSSVBUXCIpO2kuaW5uZXJIVE1MPXQsaS5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLG4pLGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChpKTt2YXIgYT13aW5kb3cuX192Q29uc29sZV9jbWRfcmVzdWx0LHI9d2luZG93Ll9fdkNvbnNvbGVfY21kX2Vycm9yO2lmKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5yZW1vdmVDaGlsZChpKSwwPT1yKXt2YXIgbD12b2lkIDA7Zi5pc0FycmF5KGEpfHxmLmlzT2JqZWN0KGEpP2w9dGhpcy5nZXRGb2xkZWRMaW5lKGEpOihmLmlzTnVsbChhKT9hPVwibnVsbFwiOmYuaXNVbmRlZmluZWQoYSk/YT1cInVuZGVmaW5lZFwiOmYuaXNGdW5jdGlvbihhKT9hPVwiZnVuY3Rpb24oKVwiOmYuaXNTdHJpbmcoYSkmJihhPSdcIicrYSsnXCInKSxsPXVbXCJkZWZhdWx0XCJdLnJlbmRlcih5W1wiZGVmYXVsdFwiXSx7Y29udGVudDphLHR5cGU6XCJvdXRwdXRcIn0pKSx0aGlzLnByaW50TG9nKHtsb2dUeXBlOlwibG9nXCIsY29udGVudDpsLG5vTWV0YTohMCxzdHlsZTpcIlwifSl9ZWxzZSB0aGlzLnByaW50TG9nKHtsb2dUeXBlOlwiZXJyb3JcIixsb2dzOlthXSxub01ldGE6ITAsc3R5bGU6XCJcIn0pfX1dKSx0fShoW1wiZGVmYXVsdFwiXSk7dFtcImRlZmF1bHRcIl09XyxlLmV4cG9ydHM9dFtcImRlZmF1bHRcIl19LGZ1bmN0aW9uKGUsdCxvKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7XCJkZWZhdWx0XCI6ZX19ZnVuY3Rpb24gaShlKXtpZihlJiZlLl9fZXNNb2R1bGUpcmV0dXJuIGU7dmFyIHQ9e307aWYobnVsbCE9ZSlmb3IodmFyIG8gaW4gZSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSxvKSYmKHRbb109ZVtvXSk7cmV0dXJuIHRbXCJkZWZhdWx0XCJdPWUsdH1mdW5jdGlvbiBhKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiByKGUsdCl7aWYoIWUpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiF0fHxcIm9iamVjdFwiIT10eXBlb2YgdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgdD9lOnR9ZnVuY3Rpb24gbChlLHQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQmJm51bGwhPT10KXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiB0KTtlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQmJnQucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6ZSxlbnVtZXJhYmxlOiExLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSx0JiYoT2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5zZXRQcm90b3R5cGVPZihlLHQpOmUuX19wcm90b19fPXQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbihlKXtyZXR1cm4gdHlwZW9mIGV9OmZ1bmN0aW9uKGUpe3JldHVybiBlJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJmUuY29uc3RydWN0b3I9PT1TeW1ib2w/XCJzeW1ib2xcIjp0eXBlb2YgZX0scz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG89MDtvPHQubGVuZ3RoO28rKyl7dmFyIG49dFtvXTtuLmVudW1lcmFibGU9bi5lbnVtZXJhYmxlfHwhMSxuLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiBuJiYobi53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsbi5rZXksbil9fXJldHVybiBmdW5jdGlvbih0LG8sbil7cmV0dXJuIG8mJmUodC5wcm90b3R5cGUsbyksbiYmZSh0LG4pLHR9fSgpLGQ9byg0KSx1PWkoZCksdj1vKDUpLGY9bih2KSxwPW8oMTgpLGg9bihwKSxnPW8oMTkpLGI9bihnKSxtPW8oMjApLHk9bihtKSxfPW8oMjEpLHc9bihfKSx4PTFlMyxrPWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoKXt2YXIgZTthKHRoaXMsdCk7Zm9yKHZhciBvPWFyZ3VtZW50cy5sZW5ndGgsbj1BcnJheShvKSxpPTA7bz5pO2krKyluW2ldPWFyZ3VtZW50c1tpXTt2YXIgbD1yKHRoaXMsKGU9T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpKS5jYWxsLmFwcGx5KGUsW3RoaXNdLmNvbmNhdChuKSkpO3JldHVybiBsLnRwbFRhYmJveD1cIlwiLGwuYWxsb3dVbmZvcm1hdHRlZExvZz0hMCxsLmlzUmVhZHk9ITEsbC5pc1Nob3c9ITEsbC4kdGFiYm94PW51bGwsbC5jb25zb2xlPXt9LGwubG9nTGlzdD1bXSxsLmlzSW5Cb3R0b209ITAsbC5tYXhMb2dOdW1iZXI9eCxsLmxvZ051bWJlcj0wLGwubW9ja0NvbnNvbGUoKSxsfXJldHVybiBsKHQsZSkscyh0LFt7a2V5Olwib25Jbml0XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLiR0YWJib3g9ZltcImRlZmF1bHRcIl0ucmVuZGVyKHRoaXMudHBsVGFiYm94LHt9KSx0aGlzLnVwZGF0ZU1heExvZ051bWJlcigpfX0se2tleTpcIm9uUmVuZGVyVGFiXCIsdmFsdWU6ZnVuY3Rpb24oZSl7ZSh0aGlzLiR0YWJib3gpfX0se2tleTpcIm9uQWRkVG9wQmFyXCIsdmFsdWU6ZnVuY3Rpb24oZSl7Zm9yKHZhciB0PXRoaXMsbz1bXCJBbGxcIixcIkxvZ1wiLFwiSW5mb1wiLFwiV2FyblwiLFwiRXJyb3JcIl0sbj1bXSxpPTA7aTxvLmxlbmd0aDtpKyspbi5wdXNoKHtuYW1lOm9baV0sZGF0YTp7dHlwZTpvW2ldLnRvTG93ZXJDYXNlKCl9LGNsYXNzTmFtZTpcIlwiLG9uQ2xpY2s6ZnVuY3Rpb24oKXtyZXR1cm4gZltcImRlZmF1bHRcIl0uaGFzQ2xhc3ModGhpcyxcInZjLWFjdGl2ZWRcIik/ITE6dm9pZCB0LnNob3dMb2dUeXBlKHRoaXMuZGF0YXNldC50eXBlfHxcImFsbFwiKX19KTtuWzBdLmNsYXNzTmFtZT1cInZjLWFjdGl2ZWRcIixlKG4pfX0se2tleTpcIm9uQWRkVG9vbFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMsbz1be25hbWU6XCJDbGVhclwiLGdsb2JhbDohMSxvbkNsaWNrOmZ1bmN0aW9uKCl7dC5jbGVhckxvZygpLHQudkNvbnNvbGUudHJpZ2dlckV2ZW50KFwiY2xlYXJMb2dcIil9fV07ZShvKX19LHtrZXk6XCJvblJlYWR5XCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO2UuaXNSZWFkeT0hMDt2YXIgdD1mW1wiZGVmYXVsdFwiXS5hbGwoXCIudmMtc3VidGFiXCIsZS4kdGFiYm94KTtmW1wiZGVmYXVsdFwiXS5iaW5kKHQsXCJjbGlja1wiLGZ1bmN0aW9uKG8pe2lmKG8ucHJldmVudERlZmF1bHQoKSxmW1wiZGVmYXVsdFwiXS5oYXNDbGFzcyh0aGlzLFwidmMtYWN0aXZlZFwiKSlyZXR1cm4hMTtmW1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyh0LFwidmMtYWN0aXZlZFwiKSxmW1wiZGVmYXVsdFwiXS5hZGRDbGFzcyh0aGlzLFwidmMtYWN0aXZlZFwiKTt2YXIgbj10aGlzLmRhdGFzZXQudHlwZSxpPWZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1sb2dcIixlLiR0YWJib3gpO2ZbXCJkZWZhdWx0XCJdLnJlbW92ZUNsYXNzKGksXCJ2Yy1sb2ctcGFydGx5LWxvZ1wiKSxmW1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyhpLFwidmMtbG9nLXBhcnRseS1pbmZvXCIpLGZbXCJkZWZhdWx0XCJdLnJlbW92ZUNsYXNzKGksXCJ2Yy1sb2ctcGFydGx5LXdhcm5cIiksZltcImRlZmF1bHRcIl0ucmVtb3ZlQ2xhc3MoaSxcInZjLWxvZy1wYXJ0bHktZXJyb3JcIiksXCJhbGxcIj09bj9mW1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyhpLFwidmMtbG9nLXBhcnRseVwiKTooZltcImRlZmF1bHRcIl0uYWRkQ2xhc3MoaSxcInZjLWxvZy1wYXJ0bHlcIiksZltcImRlZmF1bHRcIl0uYWRkQ2xhc3MoaSxcInZjLWxvZy1wYXJ0bHktXCIrbikpfSk7dmFyIG89ZltcImRlZmF1bHRcIl0ub25lKFwiLnZjLWNvbnRlbnRcIik7ZltcImRlZmF1bHRcIl0uYmluZChvLFwic2Nyb2xsXCIsZnVuY3Rpb24odCl7ZS5pc1Nob3cmJihvLnNjcm9sbFRvcCtvLm9mZnNldEhlaWdodD49by5zY3JvbGxIZWlnaHQ/ZS5pc0luQm90dG9tPSEwOmUuaXNJbkJvdHRvbT0hMSl9KTtmb3IodmFyIG49MDtuPGUubG9nTGlzdC5sZW5ndGg7bisrKWUucHJpbnRMb2coZS5sb2dMaXN0W25dKTtlLmxvZ0xpc3Q9W119fSx7a2V5Olwib25SZW1vdmVcIix2YWx1ZTpmdW5jdGlvbigpe3dpbmRvdy5jb25zb2xlLmxvZz10aGlzLmNvbnNvbGUubG9nLHdpbmRvdy5jb25zb2xlLmluZm89dGhpcy5jb25zb2xlLmluZm8sd2luZG93LmNvbnNvbGUud2Fybj10aGlzLmNvbnNvbGUud2Fybix3aW5kb3cuY29uc29sZS5kZWJ1Zz10aGlzLmNvbnNvbGUuZGVidWcsd2luZG93LmNvbnNvbGUuZXJyb3I9dGhpcy5jb25zb2xlLmVycm9yLHdpbmRvdy5jb25zb2xlLnRpbWU9dGhpcy5jb25zb2xlLnRpbWUsd2luZG93LmNvbnNvbGUudGltZUVuZD10aGlzLmNvbnNvbGUudGltZUVuZCx3aW5kb3cuY29uc29sZS5jbGVhcj10aGlzLmNvbnNvbGUuY2xlYXIsdGhpcy5jb25zb2xlPXt9fX0se2tleTpcIm9uU2hvd1wiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pc1Nob3c9ITAsMT09dGhpcy5pc0luQm90dG9tJiZ0aGlzLmF1dG9TY3JvbGxUb0JvdHRvbSgpfX0se2tleTpcIm9uSGlkZVwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pc1Nob3c9ITF9fSx7a2V5Olwib25TaG93Q29uc29sZVwiLHZhbHVlOmZ1bmN0aW9uKCl7MT09dGhpcy5pc0luQm90dG9tJiZ0aGlzLmF1dG9TY3JvbGxUb0JvdHRvbSgpfX0se2tleTpcIm9uVXBkYXRlT3B0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLnZDb25zb2xlLm9wdGlvbi5tYXhMb2dOdW1iZXIhPXRoaXMubWF4TG9nTnVtYmVyJiYodGhpcy51cGRhdGVNYXhMb2dOdW1iZXIoKSx0aGlzLmxpbWl0TWF4TG9ncygpKX19LHtrZXk6XCJ1cGRhdGVNYXhMb2dOdW1iZXJcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMubWF4TG9nTnVtYmVyPXRoaXMudkNvbnNvbGUub3B0aW9uLm1heExvZ051bWJlcnx8eCx0aGlzLm1heExvZ051bWJlcj1NYXRoLm1heCgxLHRoaXMubWF4TG9nTnVtYmVyKX19LHtrZXk6XCJsaW1pdE1heExvZ3NcIix2YWx1ZTpmdW5jdGlvbigpe2lmKHRoaXMuaXNSZWFkeSlmb3IoO3RoaXMubG9nTnVtYmVyPnRoaXMubWF4TG9nTnVtYmVyOyl7dmFyIGU9ZltcImRlZmF1bHRcIl0ub25lKFwiLnZjLWl0ZW1cIix0aGlzLiR0YWJib3gpO2lmKCFlKWJyZWFrO2UucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKSx0aGlzLmxvZ051bWJlci0tfX19LHtrZXk6XCJzaG93TG9nVHlwZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3ZhciB0PWZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1sb2dcIix0aGlzLiR0YWJib3gpO2ZbXCJkZWZhdWx0XCJdLnJlbW92ZUNsYXNzKHQsXCJ2Yy1sb2ctcGFydGx5LWxvZ1wiKSxmW1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyh0LFwidmMtbG9nLXBhcnRseS1pbmZvXCIpLGZbXCJkZWZhdWx0XCJdLnJlbW92ZUNsYXNzKHQsXCJ2Yy1sb2ctcGFydGx5LXdhcm5cIiksZltcImRlZmF1bHRcIl0ucmVtb3ZlQ2xhc3ModCxcInZjLWxvZy1wYXJ0bHktZXJyb3JcIiksXCJhbGxcIj09ZT9mW1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyh0LFwidmMtbG9nLXBhcnRseVwiKTooZltcImRlZmF1bHRcIl0uYWRkQ2xhc3ModCxcInZjLWxvZy1wYXJ0bHlcIiksZltcImRlZmF1bHRcIl0uYWRkQ2xhc3ModCxcInZjLWxvZy1wYXJ0bHktXCIrZSkpfX0se2tleTpcImF1dG9TY3JvbGxUb0JvdHRvbVwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy52Q29uc29sZS5vcHRpb24uZGlzYWJsZUxvZ1Njcm9sbGluZ3x8dGhpcy5zY3JvbGxUb0JvdHRvbSgpfX0se2tleTpcInNjcm9sbFRvQm90dG9tXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT1mW1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtY29udGVudFwiKTtlJiYoZS5zY3JvbGxUb3A9ZS5zY3JvbGxIZWlnaHQtZS5vZmZzZXRIZWlnaHQpfX0se2tleTpcIm1vY2tDb25zb2xlXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLHQ9dGhpcyxvPVtcImxvZ1wiLFwiaW5mb1wiLFwid2FyblwiLFwiZGVidWdcIixcImVycm9yXCJdO3dpbmRvdy5jb25zb2xlPyhvLm1hcChmdW5jdGlvbihlKXt0LmNvbnNvbGVbZV09d2luZG93LmNvbnNvbGVbZV19KSx0LmNvbnNvbGUudGltZT13aW5kb3cuY29uc29sZS50aW1lLHQuY29uc29sZS50aW1lRW5kPXdpbmRvdy5jb25zb2xlLnRpbWVFbmQsdC5jb25zb2xlLmNsZWFyPXdpbmRvdy5jb25zb2xlLmNsZWFyKTp3aW5kb3cuY29uc29sZT17fSxvLm1hcChmdW5jdGlvbih0KXt3aW5kb3cuY29uc29sZVt0XT1mdW5jdGlvbigpe2Zvcih2YXIgbz1hcmd1bWVudHMubGVuZ3RoLG49QXJyYXkobyksaT0wO28+aTtpKyspbltpXT1hcmd1bWVudHNbaV07ZS5wcmludExvZyh7bG9nVHlwZTp0LGxvZ3M6bn0pfX0pO3ZhciBuPXt9O3dpbmRvdy5jb25zb2xlLnRpbWU9ZnVuY3Rpb24oZSl7bltlXT1EYXRlLm5vdygpfSx3aW5kb3cuY29uc29sZS50aW1lRW5kPWZ1bmN0aW9uKGUpe3ZhciB0PW5bZV07dD8oY29uc29sZS5sb2coZStcIjpcIixEYXRlLm5vdygpLXQrXCJtc1wiKSxkZWxldGUgbltlXSk6Y29uc29sZS5sb2coZStcIjogMG1zXCIpfSx3aW5kb3cuY29uc29sZS5jbGVhcj1mdW5jdGlvbigpe2Zvcih2YXIgZT1hcmd1bWVudHMubGVuZ3RoLG89QXJyYXkoZSksbj0wO2U+bjtuKyspb1tuXT1hcmd1bWVudHNbbl07dC5jbGVhckxvZygpLHQuY29uc29sZS5jbGVhci5hcHBseSh3aW5kb3cuY29uc29sZSxvKX19fSx7a2V5OlwiY2xlYXJMb2dcIix2YWx1ZTpmdW5jdGlvbigpe2ZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1sb2dcIix0aGlzLiR0YWJib3gpLmlubmVySFRNTD1cIlwifX0se2tleTpcInByaW50T3JpZ2luTG9nXCIsdmFsdWU6ZnVuY3Rpb24oZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5jb25zb2xlW2UubG9nVHlwZV0mJnRoaXMuY29uc29sZVtlLmxvZ1R5cGVdLmFwcGx5KHdpbmRvdy5jb25zb2xlLGUubG9ncyl9fSx7a2V5OlwicHJpbnRMb2dcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD1lLmxvZ3N8fFtdO2lmKHQubGVuZ3RofHxlLmNvbnRlbnQpe3Q9W10uc2xpY2UuY2FsbCh0fHxbXSk7dmFyIG89ITAsbj0vXlxcWyhcXHcrKVxcXSQvaSxpPVwiXCI7aWYodS5pc1N0cmluZyh0WzBdKSl7dmFyIGE9dFswXS5tYXRjaChuKTtudWxsIT09YSYmYS5sZW5ndGg+MCYmKGk9YVsxXS50b0xvd2VyQ2FzZSgpKX1pZihpP289aT09dGhpcy5pZDowPT10aGlzLmFsbG93VW5mb3JtYXR0ZWRMb2cmJihvPSExKSwhbylyZXR1cm4gdm9pZChlLm5vT3JpZ2lufHx0aGlzLnByaW50T3JpZ2luTG9nKGUpKTtpZihlLmRhdGV8fChlLmRhdGU9K25ldyBEYXRlKSwhdGhpcy5pc1JlYWR5KXJldHVybiB2b2lkIHRoaXMubG9nTGlzdC5wdXNoKGUpO2lmKHUuaXNTdHJpbmcodFswXSkmJih0WzBdPXRbMF0ucmVwbGFjZShuLFwiXCIpLFwiXCI9PT10WzBdJiZ0LnNoaWZ0KCkpLCFlLm1ldGEpe3ZhciByPXUuZ2V0RGF0ZShlLmRhdGUpO2UubWV0YT1yLmhvdXIrXCI6XCIrci5taW51dGUrXCI6XCIrci5zZWNvbmR9Zm9yKHZhciBsPWZbXCJkZWZhdWx0XCJdLnJlbmRlcihiW1wiZGVmYXVsdFwiXSx7bG9nVHlwZTplLmxvZ1R5cGUsbm9NZXRhOiEhZS5ub01ldGEsbWV0YTplLm1ldGEsc3R5bGU6ZS5zdHlsZXx8XCJcIn0pLHM9ZltcImRlZmF1bHRcIl0ub25lKFwiLnZjLWl0ZW0tY29udGVudFwiLGwpLGQ9MDtkPHQubGVuZ3RoO2QrKyl7dmFyIHY9dm9pZCAwO3RyeXtpZihcIlwiPT09dFtkXSljb250aW51ZTt2PXUuaXNGdW5jdGlvbih0W2RdKT9cIjxzcGFuPiBcIit0W2RdLnRvU3RyaW5nKCkrXCI8L3NwYW4+XCI6dS5pc09iamVjdCh0W2RdKXx8dS5pc0FycmF5KHRbZF0pP3RoaXMuZ2V0Rm9sZGVkTGluZSh0W2RdKTpcIjxzcGFuPiBcIit1Lmh0bWxFbmNvZGUodFtkXSkucmVwbGFjZSgvXFxuL2csXCI8YnIvPlwiKStcIjwvc3Bhbj5cIn1jYXRjaChwKXt2PVwiPHNwYW4+IFtcIitjKHRbZF0pK1wiXTwvc3Bhbj5cIn12JiYoXCJzdHJpbmdcIj09dHlwZW9mIHY/cy5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIix2KTpzLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLHYpKX11LmlzT2JqZWN0KGUuY29udGVudCkmJnMuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsZS5jb250ZW50KSxmW1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtbG9nXCIsdGhpcy4kdGFiYm94KS5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIixsKSx0aGlzLmxvZ051bWJlcisrLHRoaXMubGltaXRNYXhMb2dzKCksdGhpcy5pc0luQm90dG9tJiZ0aGlzLmF1dG9TY3JvbGxUb0JvdHRvbSgpLGUubm9PcmlnaW58fHRoaXMucHJpbnRPcmlnaW5Mb2coZSl9fX0se2tleTpcImdldEZvbGRlZExpbmVcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3ZhciBvPXRoaXM7aWYoIXQpe3ZhciBuPXUuSlNPTlN0cmluZ2lmeShlKSxpPW4uc3Vic3RyKDAsMjYpO3Q9dS5nZXRPYmpOYW1lKGUpLG4ubGVuZ3RoPjI2JiYoaSs9XCIuLi5cIiksdCs9XCIgXCIraX12YXIgYT1mW1wiZGVmYXVsdFwiXS5yZW5kZXIoeVtcImRlZmF1bHRcIl0se291dGVyOnQsbGluZVR5cGU6XCJvYmpcIn0pO3JldHVybiBmW1wiZGVmYXVsdFwiXS5iaW5kKGZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1mb2xkLW91dGVyXCIsYSksXCJjbGlja1wiLGZ1bmN0aW9uKHQpe3QucHJldmVudERlZmF1bHQoKSx0LnN0b3BQcm9wYWdhdGlvbigpLGZbXCJkZWZhdWx0XCJdLmhhc0NsYXNzKGEsXCJ2Yy10b2dnbGVcIik/KGZbXCJkZWZhdWx0XCJdLnJlbW92ZUNsYXNzKGEsXCJ2Yy10b2dnbGVcIiksZltcImRlZmF1bHRcIl0ucmVtb3ZlQ2xhc3MoZltcImRlZmF1bHRcIl0ub25lKFwiLnZjLWZvbGQtaW5uZXJcIixhKSxcInZjLXRvZ2dsZVwiKSxmW1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyhmW1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtZm9sZC1vdXRlclwiLGEpLFwidmMtdG9nZ2xlXCIpKTooZltcImRlZmF1bHRcIl0uYWRkQ2xhc3MoYSxcInZjLXRvZ2dsZVwiKSxmW1wiZGVmYXVsdFwiXS5hZGRDbGFzcyhmW1wiZGVmYXVsdFwiXS5vbmUoXCIudmMtZm9sZC1pbm5lclwiLGEpLFwidmMtdG9nZ2xlXCIpLGZbXCJkZWZhdWx0XCJdLmFkZENsYXNzKGZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1mb2xkLW91dGVyXCIsYSksXCJ2Yy10b2dnbGVcIikpO3ZhciBuPWZbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1mb2xkLWlubmVyXCIsYSk7aWYoMD09bi5jaGlsZHJlbi5sZW5ndGgmJmUpe2Zvcih2YXIgaT11LmdldE9iakFsbEtleXMoZSkscj0wO3I8aS5sZW5ndGg7cisrKXt2YXIgbD1lW2lbcl1dLGM9XCJ1bmRlZmluZWRcIixzPVwiXCI7dS5pc1N0cmluZyhsKT8oYz1cInN0cmluZ1wiLGw9J1wiJytsKydcIicpOnUuaXNOdW1iZXIobCk/Yz1cIm51bWJlclwiOnUuaXNCb29sZWFuKGwpP2M9XCJib29sZWFuXCI6dS5pc051bGwobCk/KGM9XCJudWxsXCIsbD1cIm51bGxcIik6dS5pc1VuZGVmaW5lZChsKT8oYz1cInVuZGVmaW5lZFwiLGw9XCJ1bmRlZmluZWRcIik6dS5pc0Z1bmN0aW9uKGwpPyhjPVwiZnVuY3Rpb25cIixsPVwiZnVuY3Rpb24oKVwiKTp1LmlzU3ltYm9sKGwpJiYoYz1cInN5bWJvbFwiKTt2YXIgZD12b2lkIDA7aWYodS5pc0FycmF5KGwpKXt2YXIgdj11LmdldE9iak5hbWUobCkrXCJbXCIrbC5sZW5ndGgrXCJdXCI7ZD1vLmdldEZvbGRlZExpbmUobCxmW1wiZGVmYXVsdFwiXS5yZW5kZXIod1tcImRlZmF1bHRcIl0se2tleTppW3JdLGtleVR5cGU6cyx2YWx1ZTp2LHZhbHVlVHlwZTpcImFycmF5XCJ9LCEwKSl9ZWxzZSBpZih1LmlzT2JqZWN0KGwpKXt2YXIgcD11LmdldE9iak5hbWUobCk7ZD1vLmdldEZvbGRlZExpbmUobCxmW1wiZGVmYXVsdFwiXS5yZW5kZXIod1tcImRlZmF1bHRcIl0se2tleTp1Lmh0bWxFbmNvZGUoaVtyXSksa2V5VHlwZTpzLHZhbHVlOnAsdmFsdWVUeXBlOlwib2JqZWN0XCJ9LCEwKSl9ZWxzZXtlLmhhc093blByb3BlcnR5JiYhZS5oYXNPd25Qcm9wZXJ0eShpW3JdKSYmKHM9XCJwcml2YXRlXCIpO3ZhciBoPXtsaW5lVHlwZTpcImt2XCIsa2V5OnUuaHRtbEVuY29kZShpW3JdKSxrZXlUeXBlOnMsdmFsdWU6dS5odG1sRW5jb2RlKGwpLHZhbHVlVHlwZTpjfTtkPWZbXCJkZWZhdWx0XCJdLnJlbmRlcih5W1wiZGVmYXVsdFwiXSxoKX1uLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLGQpfWlmKHUuaXNPYmplY3QoZSkpe3ZhciBnPWUuX19wcm90b19fLGI9dm9pZCAwO2I9dS5pc09iamVjdChnKT9vLmdldEZvbGRlZExpbmUoZyxmW1wiZGVmYXVsdFwiXS5yZW5kZXIod1tcImRlZmF1bHRcIl0se2tleTpcIl9fcHJvdG9fX1wiLGtleVR5cGU6XCJwcml2YXRlXCIsdmFsdWU6dS5nZXRPYmpOYW1lKGcpLHZhbHVlVHlwZTpcIm9iamVjdFwifSwhMCkpOmZbXCJkZWZhdWx0XCJdLnJlbmRlcih3W1wiZGVmYXVsdFwiXSx7a2V5OlwiX19wcm90b19fXCIsa2V5VHlwZTpcInByaXZhdGVcIix2YWx1ZTpcIm51bGxcIix2YWx1ZVR5cGU6XCJudWxsXCJ9KSxuLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLGIpfX1yZXR1cm4hMX0pLGF9fV0pLHR9KGhbXCJkZWZhdWx0XCJdKTt0W1wiZGVmYXVsdFwiXT1rLGUuZXhwb3J0cz10W1wiZGVmYXVsdFwiXX0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBvKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbj1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG89MDtvPHQubGVuZ3RoO28rKyl7dmFyIG49dFtvXTtuLmVudW1lcmFibGU9bi5lbnVtZXJhYmxlfHwhMSxuLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiBuJiYobi53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsbi5rZXksbil9fXJldHVybiBmdW5jdGlvbih0LG8sbil7cmV0dXJuIG8mJmUodC5wcm90b3R5cGUsbyksbiYmZSh0LG4pLHR9fSgpLGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT9cIm5ld1BsdWdpblwiOmFyZ3VtZW50c1sxXTtvKHRoaXMsZSksdGhpcy5pZD10LHRoaXMubmFtZT1uLHRoaXMuaXNSZWFkeT0hMSx0aGlzLmV2ZW50TGlzdD17fX1yZXR1cm4gbihlLFt7a2V5Olwib25cIix2YWx1ZTpmdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLmV2ZW50TGlzdFtlXT10LHRoaXN9fSx7a2V5OlwidHJpZ2dlclwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5ldmVudExpc3RbZV0pdGhpcy5ldmVudExpc3RbZV0uY2FsbCh0aGlzLHQpO2Vsc2V7dmFyIG89XCJvblwiK2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkrZS5zbGljZSgxKTtcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzW29dJiZ0aGlzW29dLmNhbGwodGhpcyx0KX1yZXR1cm4gdGhpc319LHtrZXk6XCJpZFwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pZH0sc2V0OmZ1bmN0aW9uKGUpe2lmKCFlKXRocm93XCJQbHVnaW4gSUQgY2Fubm90IGJlIGVtcHR5XCI7dGhpcy5faWQ9ZS50b0xvd2VyQ2FzZSgpfX0se2tleTpcIm5hbWVcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbmFtZX0sc2V0OmZ1bmN0aW9uKGUpe2lmKCFlKXRocm93XCJQbHVnaW4gbmFtZSBjYW5ub3QgYmUgZW1wdHlcIjt0aGlzLl9uYW1lPWV9fSx7a2V5OlwidkNvbnNvbGVcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdkNvbnNvbGV8fHZvaWQgMH0sc2V0OmZ1bmN0aW9uKGUpe2lmKCFlKXRocm93XCJ2Q29uc29sZSBjYW5ub3QgYmUgZW1wdHlcIjt0aGlzLl92Q29uc29sZT1lfX1dKSxlfSgpO3RbXCJkZWZhdWx0XCJdPWksZS5leHBvcnRzPXRbXCJkZWZhdWx0XCJdfSxmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz0nPGRpdiBjbGFzcz1cInZjLWl0ZW0gdmMtaXRlbS17e2xvZ1R5cGV9fSB7e2lmICghbm9NZXRhKX19dmMtaXRlbS1ub21ldGF7ey9pZn19IHt7c3R5bGV9fVwiPlxcblx0PHNwYW4gY2xhc3M9XCJ2Yy1pdGVtLW1ldGFcIj57e2lmICghbm9NZXRhKX19e3ttZXRhfX17ey9pZn19PC9zcGFuPlxcblx0PGRpdiBjbGFzcz1cInZjLWl0ZW0tY29udGVudFwiPjwvZGl2PlxcbjwvZGl2Pid9LGZ1bmN0aW9uKGUsdCl7ZS5leHBvcnRzPSc8ZGl2IGNsYXNzPVwidmMtZm9sZFwiPlxcbiAge3tpZiAobGluZVR5cGUgPT0gXFwnb2JqXFwnKX19XFxuICAgIDxpIGNsYXNzPVwidmMtZm9sZC1vdXRlclwiPnt7b3V0ZXJ9fTwvaT5cXG4gICAgPGRpdiBjbGFzcz1cInZjLWZvbGQtaW5uZXJcIj48L2Rpdj5cXG4gIHt7ZWxzZSBpZiAobGluZVR5cGUgPT0gXFwndmFsdWVcXCcpfX1cXG4gICAgPGkgY2xhc3M9XCJ2Yy1jb2RlLXt7dmFsdWVUeXBlfX1cIj57e3ZhbHVlfX08L2k+XFxuICB7e2Vsc2UgaWYgKGxpbmVUeXBlID09IFxcJ2t2XFwnKX19XFxuICAgIDxpIGNsYXNzPVwidmMtY29kZS1rZXl7e2lmIChrZXlUeXBlKX19IHZjLWNvZGUte3trZXlUeXBlfX0ta2V5e3svaWZ9fVwiPnt7a2V5fX08L2k+OiA8aSBjbGFzcz1cInZjLWNvZGUte3t2YWx1ZVR5cGV9fVwiPnt7dmFsdWV9fTwvaT5cXG4gIHt7L2lmfX1cXG48L2Rpdj4nfSxmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz0nPHNwYW4+XFxuICA8aSBjbGFzcz1cInZjLWNvZGUta2V5e3tpZiAoa2V5VHlwZSl9fSB2Yy1jb2RlLXt7a2V5VHlwZX19LWtleXt7L2lmfX1cIj57e2tleX19PC9pPjogPGkgY2xhc3M9XCJ2Yy1jb2RlLXt7dmFsdWVUeXBlfX1cIj57e3ZhbHVlfX08L2k+XFxuPC9zcGFuPid9LGZ1bmN0aW9uKGUsdCl7ZS5leHBvcnRzPSc8ZGl2PlxcbiAgPGRpdiBjbGFzcz1cInZjLWxvZ1wiPjwvZGl2PlxcbiAgPGZvcm0gY2xhc3M9XCJ2Yy1jbWRcIj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cInZjLWNtZC1idG5cIiB0eXBlPVwic3VibWl0XCI+T0s8L2J1dHRvbj5cXG4gICAgPGRpdiBjbGFzcz1cInZjLWNtZC1pbnB1dC13cmFwXCI+XFxuICAgICAgPHRleHRhcmVhIGNsYXNzPVwidmMtY21kLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJjb21tYW5kLi4uXCI+PC90ZXh0YXJlYT5cXG4gICAgPC9kaXY+XFxuICA8L2Zvcm0+XFxuPC9kaXY+J30sZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9JzxwcmUgY2xhc3M9XCJ2Yy1pdGVtLWNvZGUgdmMtaXRlbS1jb2RlLXt7dHlwZX19XCI+e3tjb250ZW50fX08L3ByZT4nfSxmdW5jdGlvbihlLHQsbyl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e1wiZGVmYXVsdFwiOmV9fWZ1bmN0aW9uIGkoZSl7aWYoZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciB0PXt9O2lmKG51bGwhPWUpZm9yKHZhciBvIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsbykmJih0W29dPWVbb10pO3JldHVybiB0W1wiZGVmYXVsdFwiXT1lLHR9ZnVuY3Rpb24gYShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gcihlLHQpe2lmKCFlKXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4hdHx8XCJvYmplY3RcIiE9dHlwZW9mIHQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQ/ZTp0fWZ1bmN0aW9uIGwoZSx0KXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZudWxsIT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIit0eXBlb2YgdCk7ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0JiZ0LnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmUsZW51bWVyYWJsZTohMSx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksdCYmKE9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3Quc2V0UHJvdG90eXBlT2YoZSx0KTplLl9fcHJvdG9fXz10KX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG89MDtvPHQubGVuZ3RoO28rKyl7dmFyIG49dFtvXTtuLmVudW1lcmFibGU9bi5lbnVtZXJhYmxlfHwhMSxuLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiBuJiYobi53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsbi5rZXksbil9fXJldHVybiBmdW5jdGlvbih0LG8sbil7cmV0dXJuIG8mJmUodC5wcm90b3R5cGUsbyksbiYmZSh0LG4pLHR9fSgpLHM9ZnVuY3Rpb24gZyhlLHQsbyl7bnVsbD09PWUmJihlPUZ1bmN0aW9uLnByb3RvdHlwZSk7dmFyIG49T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLHQpO2lmKHZvaWQgMD09PW4pe3ZhciBpPU9iamVjdC5nZXRQcm90b3R5cGVPZihlKTtyZXR1cm4gbnVsbD09PWk/dm9pZCAwOmcoaSx0LG8pfWlmKFwidmFsdWVcImluIG4pcmV0dXJuIG4udmFsdWU7dmFyIGE9bi5nZXQ7aWYodm9pZCAwIT09YSlyZXR1cm4gYS5jYWxsKG8pfSxkPW8oNCksdT0oaShkKSxvKDE3KSksdj1uKHUpLGY9bygyNSkscD1uKGYpLGg9ZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdCgpe3ZhciBlO2EodGhpcyx0KTtmb3IodmFyIG89YXJndW1lbnRzLmxlbmd0aCxuPUFycmF5KG8pLGk9MDtvPmk7aSsrKW5baV09YXJndW1lbnRzW2ldO3ZhciBsPXIodGhpcywoZT1PYmplY3QuZ2V0UHJvdG90eXBlT2YodCkpLmNhbGwuYXBwbHkoZSxbdGhpc10uY29uY2F0KG4pKSk7cmV0dXJuIGwudHBsVGFiYm94PXBbXCJkZWZhdWx0XCJdLGwuYWxsb3dVbmZvcm1hdHRlZExvZz0hMSxsfXJldHVybiBsKHQsZSksYyh0LFt7a2V5Olwib25Jbml0XCIsdmFsdWU6ZnVuY3Rpb24oKXtzKE9iamVjdC5nZXRQcm90b3R5cGVPZih0LnByb3RvdHlwZSksXCJvbkluaXRcIix0aGlzKS5jYWxsKHRoaXMpLHRoaXMucHJpbnRTeXN0ZW1JbmZvKCl9fSx7a2V5OlwicHJpbnRTeXN0ZW1JbmZvXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT1uYXZpZ2F0b3IudXNlckFnZW50LHQ9XCJcIixvPWUubWF0Y2goLyhpcG9kKS4qXFxzKFtcXGRfXSspL2kpLG49ZS5tYXRjaCgvKGlwYWQpLipcXHMoW1xcZF9dKykvaSksaT1lLm1hdGNoKC8oaXBob25lKVxcc29zXFxzKFtcXGRfXSspL2kpLGE9ZS5tYXRjaCgvKGFuZHJvaWQpXFxzKFtcXGRcXC5dKykvaSk7dD1cIlVua25vd25cIixhP3Q9XCJBbmRyb2lkIFwiK2FbMl06aT90PVwiaVBob25lLCBpT1MgXCIraVsyXS5yZXBsYWNlKC9fL2csXCIuXCIpOm4/dD1cImlQYWQsIGlPUyBcIituWzJdLnJlcGxhY2UoL18vZyxcIi5cIik6byYmKHQ9XCJpUG9kLCBpT1MgXCIrb1syXS5yZXBsYWNlKC9fL2csXCIuXCIpKTt2YXIgcj10LGw9ZS5tYXRjaCgvTWljcm9NZXNzZW5nZXJcXC8oW1xcZFxcLl0rKS9pKTt0PVwiVW5rbm93blwiLGwmJmxbMV0/KHQ9bFsxXSxyKz1cIiwgV2VDaGF0IFwiK3QsY29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcIlN5c3RlbTpcIixyKSk6Y29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcIlN5c3RlbTpcIixyKSx0PVwiVW5rbm93blwiLHQ9XCJodHRwczpcIj09bG9jYXRpb24ucHJvdG9jb2w/XCJIVFRQU1wiOlwiaHR0cDpcIj09bG9jYXRpb24ucHJvdG9jb2w/XCJIVFRQXCI6bG9jYXRpb24ucHJvdG9jb2wucmVwbGFjZShcIjpcIixcIlwiKSxyPXQ7dmFyIGM9ZS50b0xvd2VyQ2FzZSgpLm1hdGNoKC8gbmV0dHlwZVxcLyhbXiBdKykvZyk7dD1cIlVua25vd25cIixjJiZjWzBdPyhjPWNbMF0uc3BsaXQoXCIvXCIpLHQ9Y1sxXSxyKz1cIiwgXCIrdCxjb25zb2xlLmluZm8oXCJbc3lzdGVtXVwiLFwiTmV0d29yazpcIixyKSk6Y29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcIlByb3RvY29sOlwiLHIpLGNvbnNvbGUuaW5mbyhcIltzeXN0ZW1dXCIsXCJVQTpcIixlKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dmFyIGU9d2luZG93LnBlcmZvcm1hbmNlfHx3aW5kb3cubXNQZXJmb3JtYW5jZXx8d2luZG93LndlYmtpdFBlcmZvcm1hbmNlO2lmKGUmJmUudGltaW5nKXt2YXIgdD1lLnRpbWluZzt0Lm5hdmlnYXRpb25TdGFydCYmY29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcIm5hdmlnYXRpb25TdGFydDpcIix0Lm5hdmlnYXRpb25TdGFydCksdC5uYXZpZ2F0aW9uU3RhcnQmJnQuZG9tYWluTG9va3VwU3RhcnQmJmNvbnNvbGUuaW5mbyhcIltzeXN0ZW1dXCIsXCJuYXZpZ2F0aW9uOlwiLHQuZG9tYWluTG9va3VwU3RhcnQtdC5uYXZpZ2F0aW9uU3RhcnQrXCJtc1wiKSx0LmRvbWFpbkxvb2t1cEVuZCYmdC5kb21haW5Mb29rdXBTdGFydCYmY29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcImRuczpcIix0LmRvbWFpbkxvb2t1cEVuZC10LmRvbWFpbkxvb2t1cFN0YXJ0K1wibXNcIiksdC5jb25uZWN0RW5kJiZ0LmNvbm5lY3RTdGFydCYmKHQuY29ubmVjdEVuZCYmdC5zZWN1cmVDb25uZWN0aW9uU3RhcnQ/Y29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcInRjcCAoc3NsKTpcIix0LmNvbm5lY3RFbmQtdC5jb25uZWN0U3RhcnQrXCJtcyAoXCIrKHQuY29ubmVjdEVuZC10LnNlY3VyZUNvbm5lY3Rpb25TdGFydCkrXCJtcylcIik6Y29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcInRjcDpcIix0LmNvbm5lY3RFbmQtdC5jb25uZWN0U3RhcnQrXCJtc1wiKSksdC5yZXNwb25zZVN0YXJ0JiZ0LnJlcXVlc3RTdGFydCYmY29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcInJlcXVlc3Q6XCIsdC5yZXNwb25zZVN0YXJ0LXQucmVxdWVzdFN0YXJ0K1wibXNcIiksdC5yZXNwb25zZUVuZCYmdC5yZXNwb25zZVN0YXJ0JiZjb25zb2xlLmluZm8oXCJbc3lzdGVtXVwiLFwicmVzcG9uc2U6XCIsdC5yZXNwb25zZUVuZC10LnJlc3BvbnNlU3RhcnQrXCJtc1wiKSx0LmRvbUNvbXBsZXRlJiZ0LmRvbUxvYWRpbmcmJih0LmRvbUNvbnRlbnRMb2FkZWRFdmVudFN0YXJ0JiZ0LmRvbUxvYWRpbmc/Y29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcImRvbUNvbXBsZXRlIChkb21Mb2FkZWQpOlwiLHQuZG9tQ29tcGxldGUtdC5kb21Mb2FkaW5nK1wibXMgKFwiKyh0LmRvbUNvbnRlbnRMb2FkZWRFdmVudFN0YXJ0LXQuZG9tTG9hZGluZykrXCJtcylcIik6Y29uc29sZS5pbmZvKFwiW3N5c3RlbV1cIixcImRvbUNvbXBsZXRlOlwiLHQuZG9tQ29tcGxldGUtdC5kb21Mb2FkaW5nK1wibXNcIikpLHQubG9hZEV2ZW50RW5kJiZ0LmxvYWRFdmVudFN0YXJ0JiZjb25zb2xlLmluZm8oXCJbc3lzdGVtXVwiLFwibG9hZEV2ZW50OlwiLHQubG9hZEV2ZW50RW5kLXQubG9hZEV2ZW50U3RhcnQrXCJtc1wiKSx0Lm5hdmlnYXRpb25TdGFydCYmdC5sb2FkRXZlbnRFbmQmJmNvbnNvbGUuaW5mbyhcIltzeXN0ZW1dXCIsXCJ0b3RhbCAoRE9NKTpcIix0LmxvYWRFdmVudEVuZC10Lm5hdmlnYXRpb25TdGFydCtcIm1zIChcIisodC5kb21Db21wbGV0ZS10Lm5hdmlnYXRpb25TdGFydCkrXCJtcylcIil9fSwwKX19XSksdH0odltcImRlZmF1bHRcIl0pO3RbXCJkZWZhdWx0XCJdPWgsZS5leHBvcnRzPXRbXCJkZWZhdWx0XCJdfSxmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz0nPGRpdj5cXG4gIDxkaXYgY2xhc3M9XCJ2Yy1sb2dcIj48L2Rpdj5cXG48L2Rpdj4nfSxmdW5jdGlvbihlLHQsbyl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlKXtpZihlJiZlLl9fZXNNb2R1bGUpcmV0dXJuIGU7dmFyIHQ9e307aWYobnVsbCE9ZSlmb3IodmFyIG8gaW4gZSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSxvKSYmKHRbb109ZVtvXSk7cmV0dXJuIHRbXCJkZWZhdWx0XCJdPWUsdH1mdW5jdGlvbiBpKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7XCJkZWZhdWx0XCI6ZX19ZnVuY3Rpb24gYShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gcihlLHQpe2lmKCFlKXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4hdHx8XCJvYmplY3RcIiE9dHlwZW9mIHQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQ/ZTp0fWZ1bmN0aW9uIGwoZSx0KXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZudWxsIT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIit0eXBlb2YgdCk7ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0JiZ0LnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmUsZW51bWVyYWJsZTohMSx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksdCYmKE9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3Quc2V0UHJvdG90eXBlT2YoZSx0KTplLl9fcHJvdG9fXz10KX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG89MDtvPHQubGVuZ3RoO28rKyl7dmFyIG49dFtvXTtuLmVudW1lcmFibGU9bi5lbnVtZXJhYmxlfHwhMSxuLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiBuJiYobi53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsbi5rZXksbil9fXJldHVybiBmdW5jdGlvbih0LG8sbil7cmV0dXJuIG8mJmUodC5wcm90b3R5cGUsbyksbiYmZSh0LG4pLHR9fSgpLHM9byg1KSxkPWkocyksdT1vKDQpLHY9bih1KSxmPW8oMTgpLHA9aShmKSxoPW8oMjcpLGc9aShoKSxiPW8oMjgpLG09aShiKSx5PW8oMjkpLF89aSh5KSx3PWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoKXt2YXIgZTthKHRoaXMsdCk7Zm9yKHZhciBvPWFyZ3VtZW50cy5sZW5ndGgsbj1BcnJheShvKSxpPTA7bz5pO2krKyluW2ldPWFyZ3VtZW50c1tpXTt2YXIgbD1yKHRoaXMsKGU9T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpKS5jYWxsLmFwcGx5KGUsW3RoaXNdLmNvbmNhdChuKSkpO3JldHVybiBsLiR0YWJib3g9ZFtcImRlZmF1bHRcIl0ucmVuZGVyKGdbXCJkZWZhdWx0XCJdLHt9KSxsLiRoZWFkZXI9bnVsbCxsLnJlcUxpc3Q9e30sbC5kb21MaXN0PXt9LGwuaXNSZWFkeT0hMSxsLmlzU2hvdz0hMSxsLmlzSW5Cb3R0b209ITAsbC5fb3Blbj12b2lkIDAsbC5fc2VuZD12b2lkIDAsbC5tb2NrQWpheCgpLGx9cmV0dXJuIGwodCxlKSxjKHQsW3trZXk6XCJvblJlbmRlclRhYlwiLHZhbHVlOmZ1bmN0aW9uKGUpe2UodGhpcy4kdGFiYm94KX19LHtrZXk6XCJvbkFkZFRvb2xcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD10aGlzLG89W3tuYW1lOlwiQ2xlYXJcIixnbG9iYWw6ITEsb25DbGljazpmdW5jdGlvbihlKXt0LmNsZWFyTG9nKCl9fV07ZShvKX19LHtrZXk6XCJvblJlYWR5XCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO2UuaXNSZWFkeT0hMCx0aGlzLnJlbmRlckhlYWRlcigpLGRbXCJkZWZhdWx0XCJdLmRlbGVnYXRlKGRbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1sb2dcIix0aGlzLiR0YWJib3gpLFwiY2xpY2tcIixcIi52Yy1ncm91cC1wcmV2aWV3XCIsZnVuY3Rpb24odCl7dmFyIG89dGhpcy5kYXRhc2V0LnJlcWlkLG49dGhpcy5wYXJlbnROb2RlO2RbXCJkZWZhdWx0XCJdLmhhc0NsYXNzKG4sXCJ2Yy1hY3RpdmVkXCIpPyhkW1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyhuLFwidmMtYWN0aXZlZFwiKSxlLnVwZGF0ZVJlcXVlc3Qobyx7YWN0aXZlZDohMX0pKTooZFtcImRlZmF1bHRcIl0uYWRkQ2xhc3MobixcInZjLWFjdGl2ZWRcIiksZS51cGRhdGVSZXF1ZXN0KG8se2FjdGl2ZWQ6ITB9KSksdC5wcmV2ZW50RGVmYXVsdCgpfSk7dmFyIHQ9ZFtcImRlZmF1bHRcIl0ub25lKFwiLnZjLWNvbnRlbnRcIik7ZFtcImRlZmF1bHRcIl0uYmluZCh0LFwic2Nyb2xsXCIsZnVuY3Rpb24obyl7ZS5pc1Nob3cmJih0LnNjcm9sbFRvcCt0Lm9mZnNldEhlaWdodD49dC5zY3JvbGxIZWlnaHQ/ZS5pc0luQm90dG9tPSEwOmUuaXNJbkJvdHRvbT0hMSl9KTtmb3IodmFyIG8gaW4gZS5yZXFMaXN0KWUudXBkYXRlUmVxdWVzdChvLHt9KX19LHtrZXk6XCJvblJlbW92ZVwiLHZhbHVlOmZ1bmN0aW9uKCl7d2luZG93LlhNTEh0dHBSZXF1ZXN0JiYod2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5vcGVuPXRoaXMuX29wZW4sd2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kPXRoaXMuX3NlbmQsdGhpcy5fb3Blbj12b2lkIDAsdGhpcy5fc2VuZD12b2lkIDApfX0se2tleTpcIm9uU2hvd1wiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pc1Nob3c9ITAsMT09dGhpcy5pc0luQm90dG9tJiZ0aGlzLnNjcm9sbFRvQm90dG9tKCl9fSx7a2V5Olwib25IaWRlXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmlzU2hvdz0hMX19LHtrZXk6XCJvblNob3dDb25zb2xlXCIsdmFsdWU6ZnVuY3Rpb24oKXsxPT10aGlzLmlzSW5Cb3R0b20mJnRoaXMuc2Nyb2xsVG9Cb3R0b20oKX19LHtrZXk6XCJzY3JvbGxUb0JvdHRvbVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9ZFtcImRlZmF1bHRcIl0ub25lKFwiLnZjLWNvbnRlbnRcIik7ZS5zY3JvbGxUb3A9ZS5zY3JvbGxIZWlnaHQtZS5vZmZzZXRIZWlnaHR9fSx7a2V5OlwiY2xlYXJMb2dcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMucmVxTGlzdD17fTtmb3IodmFyIGUgaW4gdGhpcy5kb21MaXN0KXRoaXMuZG9tTGlzdFtlXS5yZW1vdmUoKSx0aGlzLmRvbUxpc3RbZV09dm9pZCAwO3RoaXMuZG9tTGlzdD17fSx0aGlzLnJlbmRlckhlYWRlcigpfX0se2tleTpcInJlbmRlckhlYWRlclwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9T2JqZWN0LmtleXModGhpcy5yZXFMaXN0KS5sZW5ndGgsdD1kW1wiZGVmYXVsdFwiXS5yZW5kZXIobVtcImRlZmF1bHRcIl0se2NvdW50OmV9KSxvPWRbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1sb2dcIix0aGlzLiR0YWJib3gpO3RoaXMuJGhlYWRlcj90aGlzLiRoZWFkZXIucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQodCx0aGlzLiRoZWFkZXIpOm8ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodCxvKSx0aGlzLiRoZWFkZXI9dH19LHtrZXk6XCJ1cGRhdGVSZXF1ZXN0XCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXt2YXIgbz1PYmplY3Qua2V5cyh0aGlzLnJlcUxpc3QpLmxlbmd0aCxuPXRoaXMucmVxTGlzdFtlXXx8e307Zm9yKHZhciBpIGluIHQpbltpXT10W2ldO2lmKHRoaXMucmVxTGlzdFtlXT1uLHRoaXMuaXNSZWFkeSl7dmFyIGE9e2lkOmUsdXJsOm4udXJsLHN0YXR1czpuLnN0YXR1cyxtZXRob2Q6bi5tZXRob2R8fFwiLVwiLGNvc3RUaW1lOm4uY29zdFRpbWU+MD9uLmNvc3RUaW1lK1wibXNcIjpcIi1cIixoZWFkZXI6bi5oZWFkZXJ8fG51bGwsZ2V0RGF0YTpuLmdldERhdGF8fG51bGwscG9zdERhdGE6bi5wb3N0RGF0YXx8bnVsbCxyZXNwb25zZTpudWxsLGFjdGl2ZWQ6ISFuLmFjdGl2ZWR9O3N3aXRjaChuLnJlc3BvbnNlVHlwZSl7Y2FzZVwiXCI6Y2FzZVwidGV4dFwiOmlmKHYuaXNTdHJpbmcobi5yZXNwb25zZSkpdHJ5e2EucmVzcG9uc2U9SlNPTi5wYXJzZShuLnJlc3BvbnNlKSxhLnJlc3BvbnNlPUpTT04uc3RyaW5naWZ5KGEucmVzcG9uc2UsbnVsbCwxKSxhLnJlc3BvbnNlPXYuaHRtbEVuY29kZShhLnJlc3BvbnNlKX1jYXRjaChyKXthLnJlc3BvbnNlPXYuaHRtbEVuY29kZShuLnJlc3BvbnNlKX1lbHNlXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG4ucmVzcG9uc2UmJihhLnJlc3BvbnNlPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuLnJlc3BvbnNlKSk7YnJlYWs7Y2FzZVwianNvblwiOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBuLnJlc3BvbnNlJiYoYS5yZXNwb25zZT1KU09OLnN0cmluZ2lmeShuLnJlc3BvbnNlLG51bGwsMSkpO2JyZWFrO2Nhc2VcImJsb2JcIjpjYXNlXCJkb2N1bWVudFwiOmNhc2VcImFycmF5YnVmZmVyXCI6ZGVmYXVsdDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygbi5yZXNwb25zZSYmKGEucmVzcG9uc2U9T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4ucmVzcG9uc2UpKX0wPT1uLnJlYWR5U3RhdGV8fDE9PW4ucmVhZHlTdGF0ZT9hLnN0YXR1cz1cIlBlbmRpbmdcIjoyPT1uLnJlYWR5U3RhdGV8fDM9PW4ucmVhZHlTdGF0ZT9hLnN0YXR1cz1cIkxvYWRpbmdcIjo0PT1uLnJlYWR5U3RhdGV8fChhLnN0YXR1cz1cIlVua25vd25cIik7dmFyIGw9ZFtcImRlZmF1bHRcIl0ucmVuZGVyKF9bXCJkZWZhdWx0XCJdLGEpLGM9dGhpcy5kb21MaXN0W2VdO24uc3RhdHVzPj00MDAmJmRbXCJkZWZhdWx0XCJdLmFkZENsYXNzKGRbXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1ncm91cC1wcmV2aWV3XCIsbCksXCJ2Yy10YWJsZS1yb3ctZXJyb3JcIiksYz9jLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGwsYyk6ZFtcImRlZmF1bHRcIl0ub25lKFwiLnZjLWxvZ1wiLHRoaXMuJHRhYmJveCkuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsbCksdGhpcy5kb21MaXN0W2VdPWw7dmFyIHM9T2JqZWN0LmtleXModGhpcy5yZXFMaXN0KS5sZW5ndGg7cyE9byYmdGhpcy5yZW5kZXJIZWFkZXIoKSx0aGlzLmlzSW5Cb3R0b20mJnRoaXMuc2Nyb2xsVG9Cb3R0b20oKX19fSx7a2V5OlwibW9ja0FqYXhcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPXdpbmRvdy5YTUxIdHRwUmVxdWVzdDtpZihlKXt2YXIgdD10aGlzLG89d2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5vcGVuLG49d2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kO3QuX29wZW49byx0Ll9zZW5kPW4sd2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5vcGVuPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcyxuPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxpPW5bMF0sYT1uWzFdLHI9dC5nZXRVbmlxdWVJRCgpLGw9bnVsbDtlLl9yZXF1ZXN0SUQ9cixlLl9tZXRob2Q9aSxlLl91cmw9YTt2YXIgYz1lLm9ucmVhZHlzdGF0ZWNoYW5nZXx8ZnVuY3Rpb24oKXt9LHM9ZnVuY3Rpb24oKXt2YXIgbz10LnJlcUxpc3Rbcl18fHt9O2lmKG8ucmVhZHlTdGF0ZT1lLnJlYWR5U3RhdGUsby5zdGF0dXM9MCxlLnJlYWR5U3RhdGU+MSYmKG8uc3RhdHVzPWUuc3RhdHVzKSxvLnJlc3BvbnNlVHlwZT1lLnJlc3BvbnNlVHlwZSwwPT1lLnJlYWR5U3RhdGUpby5zdGFydFRpbWV8fChvLnN0YXJ0VGltZT0rbmV3IERhdGUpO2Vsc2UgaWYoMT09ZS5yZWFkeVN0YXRlKW8uc3RhcnRUaW1lfHwoby5zdGFydFRpbWU9K25ldyBEYXRlKTtlbHNlIGlmKDI9PWUucmVhZHlTdGF0ZSl7by5oZWFkZXI9e307Zm9yKHZhciBuPWUuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCl8fFwiXCIsaT1uLnNwbGl0KFwiXFxuXCIpLGE9MDthPGkubGVuZ3RoO2ErKyl7dmFyIHM9aVthXTtpZihzKXt2YXIgZD1zLnNwbGl0KFwiOiBcIiksdT1kWzBdLHY9ZC5zbGljZSgxKS5qb2luKFwiOiBcIik7by5oZWFkZXJbdV09dn19fWVsc2UgMz09ZS5yZWFkeVN0YXRlfHwoND09ZS5yZWFkeVN0YXRlPyhjbGVhckludGVydmFsKGwpLG8uZW5kVGltZT0rbmV3IERhdGUsby5jb3N0VGltZT1vLmVuZFRpbWUtKG8uc3RhcnRUaW1lfHxvLmVuZFRpbWUpLG8ucmVzcG9uc2U9ZS5yZXNwb25zZSk6Y2xlYXJJbnRlcnZhbChsKSk7cmV0dXJuIGUuX25vVkNvbnNvbGV8fHQudXBkYXRlUmVxdWVzdChyLG8pLGMuYXBwbHkoZSxhcmd1bWVudHMpfTtlLm9ucmVhZHlzdGF0ZWNoYW5nZT1zO3ZhciBkPS0xO3JldHVybiBsPXNldEludGVydmFsKGZ1bmN0aW9uKCl7ZCE9ZS5yZWFkeVN0YXRlJiYoZD1lLnJlYWR5U3RhdGUscy5jYWxsKGUpKX0sMTApLG8uYXBwbHkoZSxuKX0sd2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcyxvPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxpPW9bMF0sYT10LnJlcUxpc3RbZS5fcmVxdWVzdElEXXx8e307YS5tZXRob2Q9ZS5fbWV0aG9kLnRvVXBwZXJDYXNlKCk7dmFyIHI9ZS5fdXJsLnNwbGl0KFwiP1wiKTtpZihhLnVybD1yLnNoaWZ0KCksci5sZW5ndGg+MCl7YS5nZXREYXRhPXt9LHI9ci5qb2luKFwiP1wiKSxyPXIuc3BsaXQoXCImXCIpO3ZhciBsPSEwLGM9ITEscz12b2lkIDA7dHJ5e2Zvcih2YXIgZCx1PXJbU3ltYm9sLml0ZXJhdG9yXSgpOyEobD0oZD11Lm5leHQoKSkuZG9uZSk7bD0hMCl7dmFyIGY9ZC52YWx1ZTtmPWYuc3BsaXQoXCI9XCIpLGEuZ2V0RGF0YVtmWzBdXT1mWzFdfX1jYXRjaChwKXtjPSEwLHM9cH1maW5hbGx5e3RyeXshbCYmdVtcInJldHVyblwiXSYmdVtcInJldHVyblwiXSgpfWZpbmFsbHl7aWYoYyl0aHJvdyBzfX19aWYoXCJQT1NUXCI9PWEubWV0aG9kKWlmKHYuaXNTdHJpbmcoaSkpe3ZhciBoPWkuc3BsaXQoXCImXCIpO2EucG9zdERhdGE9e307dmFyIGc9ITAsYj0hMSxtPXZvaWQgMDt0cnl7Zm9yKHZhciB5LF89aFtTeW1ib2wuaXRlcmF0b3JdKCk7IShnPSh5PV8ubmV4dCgpKS5kb25lKTtnPSEwKXt2YXIgdz15LnZhbHVlO3c9dy5zcGxpdChcIj1cIiksYS5wb3N0RGF0YVt3WzBdXT13WzFdfX1jYXRjaChwKXtiPSEwLG09cH1maW5hbGx5e3RyeXshZyYmX1tcInJldHVyblwiXSYmX1tcInJldHVyblwiXSgpfWZpbmFsbHl7aWYoYil0aHJvdyBtfX19ZWxzZSB2LmlzUGxhaW5PYmplY3QoaSkmJihhLnBvc3REYXRhPWkpO3JldHVybiBlLl9ub1ZDb25zb2xlfHx0LnVwZGF0ZVJlcXVlc3QoZS5fcmVxdWVzdElELGEpLG4uYXBwbHkoZSxvKX19fX0se2tleTpcImdldFVuaXF1ZUlEXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT1cInh4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eFwiLnJlcGxhY2UoL1t4eV0vZyxmdW5jdGlvbihlKXt2YXIgdD0xNipNYXRoLnJhbmRvbSgpfDAsbz1cInhcIj09ZT90OjMmdHw4O3JldHVybiBvLnRvU3RyaW5nKDE2KX0pO3JldHVybiBlfX1dKSx0fShwW1wiZGVmYXVsdFwiXSk7dFtcImRlZmF1bHRcIl09dyxlLmV4cG9ydHM9dFtcImRlZmF1bHRcIl19LGZ1bmN0aW9uKGUsdCl7ZS5leHBvcnRzPSc8ZGl2IGNsYXNzPVwidmMtdGFibGVcIj5cXG4gIDxkaXYgY2xhc3M9XCJ2Yy1sb2dcIj48L2Rpdj5cXG48L2Rpdj4nfSxmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz0nPGRsIGNsYXNzPVwidmMtdGFibGUtcm93XCI+XFxuICA8ZGQgY2xhc3M9XCJ2Yy10YWJsZS1jb2wgdmMtdGFibGUtY29sLTRcIj5OYW1lIHt7aWYgKGNvdW50ID4gMCl9fSh7e2NvdW50fX0pe3svaWZ9fTwvZGQ+XFxuICA8ZGQgY2xhc3M9XCJ2Yy10YWJsZS1jb2xcIj5NZXRob2Q8L2RkPlxcbiAgPGRkIGNsYXNzPVwidmMtdGFibGUtY29sXCI+U3RhdHVzPC9kZD5cXG4gIDxkZCBjbGFzcz1cInZjLXRhYmxlLWNvbFwiPlRpbWU8L2RkPlxcbjwvZGw+J30sZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9JzxkaXYgY2xhc3M9XCJ2Yy1ncm91cCB7e2FjdGl2ZWQgPyBcXCd2Yy1hY3RpdmVkXFwnIDogXFwnXFwnfX1cIj5cXG4gIDxkbCBjbGFzcz1cInZjLXRhYmxlLXJvdyB2Yy1ncm91cC1wcmV2aWV3XCIgZGF0YS1yZXFpZD1cInt7aWR9fVwiPlxcbiAgICA8ZGQgY2xhc3M9XCJ2Yy10YWJsZS1jb2wgdmMtdGFibGUtY29sLTRcIj57e3VybH19PC9kZD5cXG4gICAgPGRkIGNsYXNzPVwidmMtdGFibGUtY29sXCI+e3ttZXRob2R9fTwvZGQ+XFxuICAgIDxkZCBjbGFzcz1cInZjLXRhYmxlLWNvbFwiPnt7c3RhdHVzfX08L2RkPlxcbiAgICA8ZGQgY2xhc3M9XCJ2Yy10YWJsZS1jb2xcIj57e2Nvc3RUaW1lfX08L2RkPlxcbiAgPC9kbD5cXG4gIDxkaXYgY2xhc3M9XCJ2Yy1ncm91cC1kZXRhaWxcIj5cXG4gICAge3tpZiAoaGVhZGVyICE9PSBudWxsKX19XFxuICAgIDxkaXY+XFxuICAgICAgPGRsIGNsYXNzPVwidmMtdGFibGUtcm93IHZjLWxlZnQtYm9yZGVyXCI+XFxuICAgICAgICA8ZHQgY2xhc3M9XCJ2Yy10YWJsZS1jb2wgdmMtdGFibGUtY29sLXRpdGxlXCI+SGVhZGVyczwvZHQ+XFxuICAgICAgPC9kbD5cXG4gICAgICB7e2ZvciAodmFyIGtleSBpbiBoZWFkZXIpfX1cXG4gICAgICA8ZGl2IGNsYXNzPVwidmMtdGFibGUtcm93IHZjLWxlZnQtYm9yZGVyIHZjLXNtYWxsXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwidmMtdGFibGUtY29sIHZjLXRhYmxlLWNvbC0yXCI+e3trZXl9fTwvZGl2PlxcbiAgICAgICAgPGRpdiBjbGFzcz1cInZjLXRhYmxlLWNvbCB2Yy10YWJsZS1jb2wtNCB2Yy1tYXgtaGVpZ2h0LWxpbmVcIj57e2hlYWRlcltrZXldfX08L2Rpdj5cXG4gICAgICA8L2Rpdj5cXG4gICAgICB7ey9mb3J9fVxcbiAgICA8L2Rpdj5cXG4gICAge3svaWZ9fVxcbiAgICB7e2lmIChnZXREYXRhICE9PSBudWxsKX19XFxuICAgIDxkaXY+XFxuICAgICAgPGRsIGNsYXNzPVwidmMtdGFibGUtcm93IHZjLWxlZnQtYm9yZGVyXCI+XFxuICAgICAgICA8ZHQgY2xhc3M9XCJ2Yy10YWJsZS1jb2wgdmMtdGFibGUtY29sLXRpdGxlXCI+UXVlcnkgU3RyaW5nIFBhcmFtZXRlcnM8L2R0PlxcbiAgICAgIDwvZGw+XFxuICAgICAge3tmb3IgKHZhciBrZXkgaW4gZ2V0RGF0YSl9fVxcbiAgICAgIDxkaXYgY2xhc3M9XCJ2Yy10YWJsZS1yb3cgdmMtbGVmdC1ib3JkZXIgdmMtc21hbGxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ2Yy10YWJsZS1jb2wgdmMtdGFibGUtY29sLTJcIj57e2tleX19PC9kaXY+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwidmMtdGFibGUtY29sIHZjLXRhYmxlLWNvbC00IHZjLW1heC1oZWlnaHQtbGluZVwiPnt7Z2V0RGF0YVtrZXldfX08L2Rpdj5cXG4gICAgICA8L2Rpdj5cXG4gICAgICB7ey9mb3J9fVxcbiAgICA8L2Rpdj5cXG4gICAge3svaWZ9fVxcbiAgICB7e2lmIChwb3N0RGF0YSAhPT0gbnVsbCl9fVxcbiAgICA8ZGl2PlxcbiAgICAgIDxkbCBjbGFzcz1cInZjLXRhYmxlLXJvdyB2Yy1sZWZ0LWJvcmRlclwiPlxcbiAgICAgICAgPGR0IGNsYXNzPVwidmMtdGFibGUtY29sIHZjLXRhYmxlLWNvbC10aXRsZVwiPkZvcm0gRGF0YTwvZHQ+XFxuICAgICAgPC9kbD5cXG4gICAgICB7e2ZvciAodmFyIGtleSBpbiBwb3N0RGF0YSl9fVxcbiAgICAgIDxkaXYgY2xhc3M9XCJ2Yy10YWJsZS1yb3cgdmMtbGVmdC1ib3JkZXIgdmMtc21hbGxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ2Yy10YWJsZS1jb2wgdmMtdGFibGUtY29sLTJcIj57e2tleX19PC9kaXY+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwidmMtdGFibGUtY29sIHZjLXRhYmxlLWNvbC00IHZjLW1heC1oZWlnaHQtbGluZVwiPnt7cG9zdERhdGFba2V5XX19PC9kaXY+XFxuICAgICAgPC9kaXY+XFxuICAgICAge3svZm9yfX1cXG4gICAgPC9kaXY+XFxuICAgIHt7L2lmfX1cXG4gICAgPGRpdj5cXG4gICAgICA8ZGwgY2xhc3M9XCJ2Yy10YWJsZS1yb3cgdmMtbGVmdC1ib3JkZXJcIj5cXG4gICAgICAgIDxkdCBjbGFzcz1cInZjLXRhYmxlLWNvbCB2Yy10YWJsZS1jb2wtdGl0bGVcIj5SZXNwb25zZTwvZHQ+XFxuICAgICAgPC9kbD5cXG4gICAgICA8ZGl2IGNsYXNzPVwidmMtdGFibGUtcm93IHZjLWxlZnQtYm9yZGVyIHZjLXNtYWxsXCI+XFxuICAgICAgICA8cHJlIGNsYXNzPVwidmMtdGFibGUtY29sIHZjLW1heC1oZWlnaHQgdmMtbWluLWhlaWdodFwiPnt7cmVzcG9uc2UgfHwgXFwnXFwnfX08L3ByZT5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj4nfSxmdW5jdGlvbihlLHQsbyl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlKXtpZihlJiZlLl9fZXNNb2R1bGUpcmV0dXJuIGU7dmFyIHQ9e307aWYobnVsbCE9ZSlmb3IodmFyIG8gaW4gZSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSxvKSYmKHRbb109ZVtvXSk7cmV0dXJuIHRbXCJkZWZhdWx0XCJdPWUsdH1mdW5jdGlvbiBpKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7XCJkZWZhdWx0XCI6ZX19ZnVuY3Rpb24gYShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG59ZnVuY3Rpb24gcihlLHQpe2lmKCFlKXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4hdHx8XCJvYmplY3RcIiE9dHlwZW9mIHQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQ/ZTp0fWZ1bmN0aW9uIGwoZSx0KXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZudWxsIT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIit0eXBlb2YgdCk7ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0JiZ0LnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmUsZW51bWVyYWJsZTohMSx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksdCYmKE9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3Quc2V0UHJvdG90eXBlT2YoZSx0KTplLl9fcHJvdG9fXz10KX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG89MDtvPHQubGVuZ3RoO28rKyl7dmFyIG49dFtvXTtuLmVudW1lcmFibGU9bi5lbnVtZXJhYmxlfHwhMSxuLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiBuJiYobi53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsbi5rZXksbil9fXJldHVybiBmdW5jdGlvbih0LG8sbil7cmV0dXJuIG8mJmUodC5wcm90b3R5cGUsbyksbiYmZSh0LG4pLHR9fSgpO28oMzEpO3ZhciBzPW8oMTgpLGQ9aShzKSx1PW8oMzMpLHY9aSh1KSxmPW8oMzQpLHA9aShmKSxoPW8oNCksZz0obihoKSxvKDUpKSxiPWkoZyksbT1mdW5jdGlvbihlKXtmdW5jdGlvbiB0KCl7dmFyIGU7YSh0aGlzLHQpO2Zvcih2YXIgbz1hcmd1bWVudHMubGVuZ3RoLG49QXJyYXkobyksaT0wO28+aTtpKyspbltpXT1hcmd1bWVudHNbaV07dmFyIGw9cih0aGlzLChlPU9iamVjdC5nZXRQcm90b3R5cGVPZih0KSkuY2FsbC5hcHBseShlLFt0aGlzXS5jb25jYXQobikpKSxjPWw7Yy5pc0luaXRlZD0hMSxjLm5vZGU9e30sYy4kdGFiYm94PWJbXCJkZWZhdWx0XCJdLnJlbmRlcih2W1wiZGVmYXVsdFwiXSx7fSksYy5ub2Rlcz1bXSxjLmFjdGl2ZWRFbGVtPXt9O3ZhciBzPXdpbmRvdy5NdXRhdGlvbk9ic2VydmVyfHx3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlcnx8d2luZG93Lk1vek11dGF0aW9uT2JzZXJ2ZXI7cmV0dXJuIGMub2JzZXJ2ZXI9bmV3IHMoZnVuY3Rpb24oZSl7Zm9yKHZhciB0PTA7dDxlLmxlbmd0aDt0Kyspe3ZhciBvPWVbdF07Yy5faXNJblZDb25zb2xlKG8udGFyZ2V0KXx8Yy5vbk11dGF0aW9uKG8pfX0pLGx9cmV0dXJuIGwodCxlKSxjKHQsW3trZXk6XCJvblJlbmRlclRhYlwiLHZhbHVlOmZ1bmN0aW9uKGUpe2UodGhpcy4kdGFiYm94KX19LHtrZXk6XCJvbkFkZFRvb2xcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD10aGlzLG89W3tuYW1lOlwiRXhwZW5kXCIsZ2xvYmFsOiExLG9uQ2xpY2s6ZnVuY3Rpb24oZSl7aWYodC5hY3RpdmVkRWxlbSlpZihiW1wiZGVmYXVsdFwiXS5oYXNDbGFzcyh0LmFjdGl2ZWRFbGVtLFwidmMtdG9nZ2xlXCIpKWZvcih2YXIgbz0wO288dC5hY3RpdmVkRWxlbS5jaGlsZE5vZGVzLmxlbmd0aDtvKyspe3ZhciBuPXQuYWN0aXZlZEVsZW0uY2hpbGROb2Rlc1tvXTtpZihiW1wiZGVmYXVsdFwiXS5oYXNDbGFzcyhuLFwidmNlbG0tbFwiKSYmIWJbXCJkZWZhdWx0XCJdLmhhc0NsYXNzKG4sXCJ2Y2VsbS1ub2NcIikmJiFiW1wiZGVmYXVsdFwiXS5oYXNDbGFzcyhuLFwidmMtdG9nZ2xlXCIpKXtiW1wiZGVmYXVsdFwiXS5vbmUoXCIudmNlbG0tbm9kZVwiLG4pLmNsaWNrKCk7YnJlYWt9fWVsc2UgYltcImRlZmF1bHRcIl0ub25lKFwiLnZjZWxtLW5vZGVcIix0LmFjdGl2ZWRFbGVtKS5jbGljaygpfX0se25hbWU6XCJDb2xsYXBzZVwiLGdsb2JhbDohMSxvbkNsaWNrOmZ1bmN0aW9uKGUpe3QuYWN0aXZlZEVsZW0mJihiW1wiZGVmYXVsdFwiXS5oYXNDbGFzcyh0LmFjdGl2ZWRFbGVtLFwidmMtdG9nZ2xlXCIpP2JbXCJkZWZhdWx0XCJdLm9uZShcIi52Y2VsbS1ub2RlXCIsdC5hY3RpdmVkRWxlbSkuY2xpY2soKTp0LmFjdGl2ZWRFbGVtLnBhcmVudE5vZGUmJmJbXCJkZWZhdWx0XCJdLmhhc0NsYXNzKHQuYWN0aXZlZEVsZW0ucGFyZW50Tm9kZSxcInZjZWxtLWxcIikmJmJbXCJkZWZhdWx0XCJdLm9uZShcIi52Y2VsbS1ub2RlXCIsdC5hY3RpdmVkRWxlbS5wYXJlbnROb2RlKS5jbGljaygpKX19XTtlKG8pfX0se2tleTpcIm9uU2hvd1wiLHZhbHVlOmZ1bmN0aW9uKCl7aWYoIXRoaXMuaXNJbml0ZWQpe3RoaXMuaXNJbml0ZWQ9ITAsdGhpcy5ub2RlPXRoaXMuZ2V0Tm9kZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO3ZhciBlPXRoaXMucmVuZGVyVmlldyh0aGlzLm5vZGUsYltcImRlZmF1bHRcIl0ub25lKFwiLnZjLWxvZ1wiLHRoaXMuJHRhYmJveCkpLHQ9YltcImRlZmF1bHRcIl0ub25lKFwiLnZjZWxtLW5vZGVcIixlKTt0JiZ0LmNsaWNrKCk7dmFyIG89e2F0dHJpYnV0ZXM6ITAsY2hpbGRMaXN0OiEwLGNoYXJhY3RlckRhdGE6ITAsc3VidHJlZTohMH07dGhpcy5vYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxvKX19fSx7a2V5Olwib25SZW1vdmVcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpfX0se2tleTpcIm9uTXV0YXRpb25cIix2YWx1ZTpmdW5jdGlvbihlKXtzd2l0Y2goZS50eXBlKXtjYXNlXCJjaGlsZExpc3RcIjplLnJlbW92ZWROb2Rlcy5sZW5ndGg+MCYmdGhpcy5vbkNoaWxkUmVtb3ZlKGUpLGUuYWRkZWROb2Rlcy5sZW5ndGg+MCYmdGhpcy5vbkNoaWxkQWRkKGUpO2JyZWFrO2Nhc2VcImF0dHJpYnV0ZXNcIjp0aGlzLm9uQXR0cmlidXRlc0NoYW5nZShlKTticmVhaztjYXNlXCJjaGFyYWN0ZXJEYXRhXCI6dGhpcy5vbkNoYXJhY3RlckRhdGFDaGFuZ2UoZSl9fX0se2tleTpcIm9uQ2hpbGRSZW1vdmVcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD1lLnRhcmdldCxvPXQuX192Y29uc29sZV9ub2RlO2lmKG8pe2Zvcih2YXIgbj0wO248ZS5yZW1vdmVkTm9kZXMubGVuZ3RoO24rKyl7dmFyIGk9ZS5yZW1vdmVkTm9kZXNbbl0sYT1pLl9fdmNvbnNvbGVfbm9kZTthJiZhLnZpZXcmJmEudmlldy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGEudmlldyl9dGhpcy5nZXROb2RlKHQpfX19LHtrZXk6XCJvbkNoaWxkQWRkXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS50YXJnZXQsbz10Ll9fdmNvbnNvbGVfbm9kZTtpZihvKXt0aGlzLmdldE5vZGUodCksby52aWV3JiZiW1wiZGVmYXVsdFwiXS5yZW1vdmVDbGFzcyhvLnZpZXcsXCJ2Y2VsbS1ub2NcIik7Zm9yKHZhciBuPTA7bjxlLmFkZGVkTm9kZXMubGVuZ3RoO24rKyl7dmFyIGk9ZS5hZGRlZE5vZGVzW25dLGE9aS5fX3Zjb25zb2xlX25vZGU7aWYoYSlpZihudWxsIT09ZS5uZXh0U2libGluZyl7dmFyIHI9ZS5uZXh0U2libGluZy5fX3Zjb25zb2xlX25vZGU7ci52aWV3JiZ0aGlzLnJlbmRlclZpZXcoYSxyLnZpZXcsXCJpbnNlcnRCZWZvcmVcIil9ZWxzZSBvLnZpZXcmJihvLnZpZXcubGFzdENoaWxkP3RoaXMucmVuZGVyVmlldyhhLG8udmlldy5sYXN0Q2hpbGQsXCJpbnNlcnRCZWZvcmVcIik6dGhpcy5yZW5kZXJWaWV3KGEsby52aWV3KSl9fX19LHtrZXk6XCJvbkF0dHJpYnV0ZXNDaGFuZ2VcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD1lLnRhcmdldC5fX3Zjb25zb2xlX25vZGU7dCYmKHQ9dGhpcy5nZXROb2RlKGUudGFyZ2V0KSx0LnZpZXcmJnRoaXMucmVuZGVyVmlldyh0LHQudmlldywhMCkpfX0se2tleTpcIm9uQ2hhcmFjdGVyRGF0YUNoYW5nZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3ZhciB0PWUudGFyZ2V0Ll9fdmNvbnNvbGVfbm9kZTt0JiYodD10aGlzLmdldE5vZGUoZS50YXJnZXQpLHQudmlldyYmdGhpcy5yZW5kZXJWaWV3KHQsdC52aWV3LCEwKSl9fSx7a2V5OlwicmVuZGVyVmlld1wiLHZhbHVlOmZ1bmN0aW9uKGUsdCxvKXt2YXIgbj10aGlzLGk9bmV3IHBbXCJkZWZhdWx0XCJdKGUpLmdldCgpO3N3aXRjaChlLnZpZXc9aSxiW1wiZGVmYXVsdFwiXS5kZWxlZ2F0ZShpLFwiY2xpY2tcIixcIi52Y2VsbS1ub2RlXCIsZnVuY3Rpb24odCl7dC5zdG9wUHJvcGFnYXRpb24oKTt2YXIgbz10aGlzLnBhcmVudE5vZGU7aWYoIWJbXCJkZWZhdWx0XCJdLmhhc0NsYXNzKG8sXCJ2Y2VsbS1ub2NcIikpe24uYWN0aXZlZEVsZW09byxiW1wiZGVmYXVsdFwiXS5oYXNDbGFzcyhvLFwidmMtdG9nZ2xlXCIpP2JbXCJkZWZhdWx0XCJdLnJlbW92ZUNsYXNzKG8sXCJ2Yy10b2dnbGVcIik6YltcImRlZmF1bHRcIl0uYWRkQ2xhc3MobyxcInZjLXRvZ2dsZVwiKTtmb3IodmFyIGk9LTEsYT0wO2E8by5jaGlsZHJlbi5sZW5ndGg7YSsrKXt2YXIgcj1vLmNoaWxkcmVuW2FdO2JbXCJkZWZhdWx0XCJdLmhhc0NsYXNzKHIsXCJ2Y2VsbS1sXCIpJiYoaSsrLHIuY2hpbGRyZW4ubGVuZ3RoPjB8fChlLmNoaWxkTm9kZXNbaV0/bi5yZW5kZXJWaWV3KGUuY2hpbGROb2Rlc1tpXSxyLFwicmVwbGFjZVwiKTpyLnN0eWxlLmRpc3BsYXk9XCJub25lXCIpKX19fSksbyl7Y2FzZVwicmVwbGFjZVwiOnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaSx0KTticmVhaztjYXNlXCJpbnNlcnRCZWZvcmVcIjp0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGksdCk7YnJlYWs7ZGVmYXVsdDp0LmFwcGVuZENoaWxkKGkpfXJldHVybiBpfX0se2tleTpcImdldE5vZGVcIix2YWx1ZTpmdW5jdGlvbihlKXtpZighdGhpcy5faXNJZ25vcmVkRWxlbWVudChlKSl7dmFyIHQ9ZS5fX3Zjb25zb2xlX25vZGV8fHt9O2lmKHQubm9kZVR5cGU9ZS5ub2RlVHlwZSx0Lm5vZGVOYW1lPWUubm9kZU5hbWUsdC50YWdOYW1lPWUudGFnTmFtZXx8XCJcIix0LnRleHRDb250ZW50PVwiXCIsdC5ub2RlVHlwZSE9ZS5URVhUX05PREUmJnQubm9kZVR5cGUhPWUuRE9DVU1FTlRfVFlQRV9OT0RFfHwodC50ZXh0Q29udGVudD1lLnRleHRDb250ZW50KSx0LmlkPWUuaWR8fFwiXCIsdC5jbGFzc05hbWU9ZS5jbGFzc05hbWV8fFwiXCIsdC5hdHRyaWJ1dGVzPVtdLGUuaGFzQXR0cmlidXRlcyYmZS5oYXNBdHRyaWJ1dGVzKCkpZm9yKHZhciBvPTA7bzxlLmF0dHJpYnV0ZXMubGVuZ3RoO28rKyl0LmF0dHJpYnV0ZXMucHVzaCh7bmFtZTplLmF0dHJpYnV0ZXNbb10ubmFtZSx2YWx1ZTplLmF0dHJpYnV0ZXNbb10udmFsdWV8fFwiXCJ9KTtpZih0LmNoaWxkTm9kZXM9W10sZS5jaGlsZE5vZGVzLmxlbmd0aD4wKWZvcih2YXIgbj0wO248ZS5jaGlsZE5vZGVzLmxlbmd0aDtuKyspe3ZhciBpPXRoaXMuZ2V0Tm9kZShlLmNoaWxkTm9kZXNbbl0pO2kmJnQuY2hpbGROb2Rlcy5wdXNoKGkpfXJldHVybiBlLl9fdmNvbnNvbGVfbm9kZT10LHR9fX0se2tleTpcIl9pc0lnbm9yZWRFbGVtZW50XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIGUubm9kZVR5cGU9PWUuVEVYVF9OT0RFJiZcIlwiPT1lLnRleHRDb250ZW50LnJlcGxhY2UoL15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJHxcXG4rL2csXCJcIil9fSx7a2V5OlwiX2lzSW5WQ29uc29sZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe2Zvcih2YXIgdD1lO3ZvaWQgMCE9dDspe2lmKFwiX192Y29uc29sZVwiPT10LmlkKXJldHVybiEwO3Q9dC5wYXJlbnROb2RlfHx2b2lkIDB9cmV0dXJuITF9fV0pLHR9KGRbXCJkZWZhdWx0XCJdKTt0W1wiZGVmYXVsdFwiXT1tLGUuZXhwb3J0cz10W1wiZGVmYXVsdFwiXX0sZnVuY3Rpb24oZSx0LG8pe3ZhciBuPW8oMzIpO1wic3RyaW5nXCI9PXR5cGVvZiBuJiYobj1bW2UuaWQsbixcIlwiXV0pO28oMTApKG4se30pO24ubG9jYWxzJiYoZS5leHBvcnRzPW4ubG9jYWxzKX0sZnVuY3Rpb24oZSx0LG8pe3Q9ZS5leHBvcnRzPW8oOSkoKSx0LnB1c2goW2UuaWQsJy52Y2VsbS1ub2Rle2NvbG9yOiMxODM2OTF9LnZjZWxtLWt7Y29sb3I6IzAwODZiM30udmNlbG0tdntjb2xvcjojOTA1fS52Y2VsbS1se3BhZGRpbmctbGVmdDo4cHg7cG9zaXRpb246cmVsYXRpdmU7d29yZC13cmFwOmJyZWFrLXdvcmQ7bGluZS1oZWlnaHQ6MX0udmNlbG0tbC52Yy10b2dnbGU+LnZjZWxtLW5vZGV7ZGlzcGxheTpibG9ja30udmNlbG0tbCAudmNlbG0tbm9kZTphY3RpdmV7YmFja2dyb3VuZC1jb2xvcjpyZ2JhKDAsMCwwLC4xNSl9LnZjZWxtLWwudmNlbG0tbm9jIC52Y2VsbS1ub2RlOmFjdGl2ZXtiYWNrZ3JvdW5kLWNvbG9yOnRyYW5zcGFyZW50fS52Y2VsbS10e3doaXRlLXNwYWNlOnByZS13cmFwO3dvcmQtd3JhcDpicmVhay13b3JkfS52Y2VsbS1sIC52Y2VsbS1se2Rpc3BsYXk6bm9uZX0udmNlbG0tbC52Yy10b2dnbGU+LnZjZWxtLWx7bWFyZ2luLWxlZnQ6NHB4O2Rpc3BsYXk6YmxvY2t9LnZjZWxtLWw6YmVmb3Jle2NvbnRlbnQ6XCJcIjtkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3RvcDo2cHg7bGVmdDozcHg7d2lkdGg6MDtoZWlnaHQ6MDtib3JkZXI6M3B4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1sZWZ0LWNvbG9yOiMwMDB9LnZjZWxtLWwudmMtdG9nZ2xlOmJlZm9yZXtkaXNwbGF5OmJsb2NrO3RvcDo2cHg7bGVmdDowO2JvcmRlci10b3AtY29sb3I6IzAwMDtib3JkZXItbGVmdC1jb2xvcjp0cmFuc3BhcmVudH0udmNlbG0tbC52Y2VsbS1ub2M6YmVmb3Jle2Rpc3BsYXk6bm9uZX0nLFwiXCJdKX0sZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9JzxkaXY+XFxuICA8ZGl2IGNsYXNzPVwidmMtbG9nXCI+PC9kaXY+XFxuPC9kaXY+J30sZnVuY3Rpb24oZSx0LG8pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4oZSl7aWYoZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciB0PXt9O2lmKG51bGwhPWUpZm9yKHZhciBvIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsbykmJih0W29dPWVbb10pO3JldHVybiB0W1wiZGVmYXVsdFwiXT1lLHR9ZnVuY3Rpb24gaShlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e1wiZGVmYXVsdFwiOmV9fWZ1bmN0aW9uIGEoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfWZ1bmN0aW9uIHIoZSl7dmFyIHQ9W1wiYnJcIixcImhyXCIsXCJpbWdcIixcImlucHV0XCIsXCJsaW5rXCIsXCJtZXRhXCJdO3JldHVybiBlPWU/ZS50b0xvd2VyQ2FzZSgpOlwiXCIsdC5pbmRleE9mKGUpPi0xfWZ1bmN0aW9uIGwoZSl7cmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGUpfWZ1bmN0aW9uIGMoZSl7cmV0dXJuIGUucmVwbGFjZSgvXltcXHNcXHVGRUZGXFx4QTBdK3xbXFxzXFx1RkVGRlxceEEwXSskL2csXCJcIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBvPTA7bzx0Lmxlbmd0aDtvKyspe3ZhciBuPXRbb107bi5lbnVtZXJhYmxlPW4uZW51bWVyYWJsZXx8ITEsbi5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gbiYmKG4ud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLG4ua2V5LG4pfX1yZXR1cm4gZnVuY3Rpb24odCxvLG4pe3JldHVybiBvJiZlKHQucHJvdG90eXBlLG8pLG4mJmUodCxuKSx0fX0oKSxkPW8oMzUpLHU9aShkKSx2PW8oMzYpLGY9aSh2KSxwPW8oNCksaD0obihwKSxvKDUpKSxnPWkoaCksYj1mdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7YSh0aGlzLGUpLHRoaXMubm9kZT10LHRoaXMudmlldz10aGlzLl9jcmVhdGUodGhpcy5ub2RlKX1yZXR1cm4gcyhlLFt7a2V5OlwiZ2V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52aWV3fX0se2tleTpcIl9jcmVhdGVcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3ZhciBvPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJESVZcIik7c3dpdGNoKGdbXCJkZWZhdWx0XCJdLmFkZENsYXNzKG8sXCJ2Y2VsbS1sXCIpLGUubm9kZVR5cGUpe2Nhc2Ugby5FTEVNRU5UX05PREU6dGhpcy5fY3JlYXRlRWxlbWVudE5vZGUoZSxvKTticmVhaztjYXNlIG8uVEVYVF9OT0RFOnRoaXMuX2NyZWF0ZVRleHROb2RlKGUsbyk7YnJlYWs7Y2FzZSBvLkNPTU1FTlRfTk9ERTpjYXNlIG8uRE9DVU1FTlRfTk9ERTpjYXNlIG8uRE9DVU1FTlRfVFlQRV9OT0RFOmNhc2Ugby5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFOn1yZXR1cm4gb319LHtrZXk6XCJfY3JlYXRlVGV4dE5vZGVcIix2YWx1ZTpmdW5jdGlvbihlLHQpe2dbXCJkZWZhdWx0XCJdLmFkZENsYXNzKHQsXCJ2Y2VsbS10IHZjZWxtLW5vY1wiKSxlLnRleHRDb250ZW50JiZ0LmFwcGVuZENoaWxkKGwoYyhlLnRleHRDb250ZW50KSkpfX0se2tleTpcIl9jcmVhdGVFbGVtZW50Tm9kZVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7dmFyIG89cihlLnRhZ05hbWUpLG49bzswPT1lLmNoaWxkTm9kZXMubGVuZ3RoJiYobj0hMCk7dmFyIGk9Z1tcImRlZmF1bHRcIl0ucmVuZGVyKHVbXCJkZWZhdWx0XCJdLHtub2RlOmV9KSxhPWdbXCJkZWZhdWx0XCJdLnJlbmRlcihmW1wiZGVmYXVsdFwiXSx7bm9kZTplfSk7aWYobilnW1wiZGVmYXVsdFwiXS5hZGRDbGFzcyh0LFwidmNlbG0tbm9jXCIpLHQuYXBwZW5kQ2hpbGQoaSksb3x8dC5hcHBlbmRDaGlsZChhKTtlbHNle3QuYXBwZW5kQ2hpbGQoaSk7Zm9yKHZhciBsPTA7bDxlLmNoaWxkTm9kZXMubGVuZ3RoO2wrKyl7dmFyIGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkRJVlwiKTtnW1wiZGVmYXVsdFwiXS5hZGRDbGFzcyhjLFwidmNlbG0tbFwiKSx0LmFwcGVuZENoaWxkKGMpfW98fHQuYXBwZW5kQ2hpbGQoYSl9fX1dKSxlfSgpO3RbXCJkZWZhdWx0XCJdPWIsZS5leHBvcnRzPXRbXCJkZWZhdWx0XCJdfSxmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz0nPHNwYW4gY2xhc3M9XCJ2Y2VsbS1ub2RlXCI+Jmx0O3t7bm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCl9fXt7aWYgKG5vZGUuY2xhc3NOYW1lIHx8IG5vZGUuYXR0cmlidXRlcy5sZW5ndGgpfX1cXG4gIDxpIGNsYXNzPVwidmNlbG0ta1wiPlxcbiAgICB7e2ZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKX19XFxuICAgICAge3tpZiAobm9kZS5hdHRyaWJ1dGVzW2ldLnZhbHVlICE9PSBcXCdcXCcpfX1cXG4gICAgICAgIHt7bm9kZS5hdHRyaWJ1dGVzW2ldLm5hbWV9fT1cIjxpIGNsYXNzPVwidmNlbG0tdlwiPnt7bm9kZS5hdHRyaWJ1dGVzW2ldLnZhbHVlfX08L2k+XCJ7e2Vsc2V9fVxcbiAgICAgICAge3tub2RlLmF0dHJpYnV0ZXNbaV0ubmFtZX19e3svaWZ9fXt7L2Zvcn19PC9pPnt7L2lmfX0mZ3Q7PC9zcGFuPid9LGZ1bmN0aW9uKGUsdCl7ZS5leHBvcnRzPSc8c3BhbiBjbGFzcz1cInZjZWxtLW5vZGVcIj4mbHQ7L3t7bm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCl9fSZndDs8L3NwYW4+J30sZnVuY3Rpb24oZSx0LG8pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4oZSl7aWYoZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciB0PXt9O2lmKG51bGwhPWUpZm9yKHZhciBvIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsbykmJih0W29dPWVbb10pO3JldHVybiB0W1wiZGVmYXVsdFwiXT1lLHR9ZnVuY3Rpb24gaShlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e1wiZGVmYXVsdFwiOmV9fWZ1bmN0aW9uIGEoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfWZ1bmN0aW9uIHIoZSx0KXtpZighZSl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIXR8fFwib2JqZWN0XCIhPXR5cGVvZiB0JiZcImZ1bmN0aW9uXCIhPXR5cGVvZiB0P2U6dH1mdW5jdGlvbiBsKGUsdCl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgdCYmbnVsbCE9PXQpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIrdHlwZW9mIHQpO2UucHJvdG90eXBlPU9iamVjdC5jcmVhdGUodCYmdC5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTplLGVudW1lcmFibGU6ITEsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLHQmJihPYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LnNldFByb3RvdHlwZU9mKGUsdCk6ZS5fX3Byb3RvX189dCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBvPTA7bzx0Lmxlbmd0aDtvKyspe3ZhciBuPXRbb107bi5lbnVtZXJhYmxlPW4uZW51bWVyYWJsZXx8ITEsbi5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gbiYmKG4ud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLG4ua2V5LG4pfX1yZXR1cm4gZnVuY3Rpb24odCxvLG4pe3JldHVybiBvJiZlKHQucHJvdG90eXBlLG8pLG4mJmUodCxuKSx0fX0oKSxzPW8oMTgpLGQ9aShzKSx1PW8oMzgpLHY9aSh1KSxmPW8oMzkpLHA9aShmKSxoPW8oNCksZz1uKGgpLGI9byg1KSxtPWkoYikseT1mdW5jdGlvbihlKXtmdW5jdGlvbiB0KCl7dmFyIGU7YSh0aGlzLHQpO2Zvcih2YXIgbz1hcmd1bWVudHMubGVuZ3RoLG49QXJyYXkobyksaT0wO28+aTtpKyspbltpXT1hcmd1bWVudHNbaV07dmFyIGw9cih0aGlzLChlPU9iamVjdC5nZXRQcm90b3R5cGVPZih0KSkuY2FsbC5hcHBseShlLFt0aGlzXS5jb25jYXQobikpKTtyZXR1cm4gbC4kdGFiYm94PW1bXCJkZWZhdWx0XCJdLnJlbmRlcih2W1wiZGVmYXVsdFwiXSx7fSksbC5jdXJyZW50VHlwZT1cIlwiLGwudHlwZU5hbWVNYXA9e2Nvb2tpZXM6XCJDb29raWVzXCIsbG9jYWxzdG9yYWdlOlwiTG9jYWxTdG9yYWdlXCJ9LGx9cmV0dXJuIGwodCxlKSxjKHQsW3trZXk6XCJvblJlbmRlclRhYlwiLHZhbHVlOmZ1bmN0aW9uKGUpe2UodGhpcy4kdGFiYm94KX19LHtrZXk6XCJvbkFkZFRvcEJhclwiLHZhbHVlOmZ1bmN0aW9uKGUpe2Zvcih2YXIgdD10aGlzLG89W1wiQ29va2llc1wiLFwiTG9jYWxTdG9yYWdlXCJdLG49W10saT0wO2k8by5sZW5ndGg7aSsrKW4ucHVzaCh7bmFtZTpvW2ldLGRhdGE6e3R5cGU6b1tpXS50b0xvd2VyQ2FzZSgpfSxjbGFzc05hbWU6XCJcIixvbkNsaWNrOmZ1bmN0aW9uKCl7cmV0dXJuIG1bXCJkZWZhdWx0XCJdLmhhc0NsYXNzKHRoaXMsXCJ2Yy1hY3RpdmVkXCIpPyExOih0LmN1cnJlbnRUeXBlPXRoaXMuZGF0YXNldC50eXBlLHZvaWQgdC5yZW5kZXJTdG9yYWdlKCkpfX0pO25bMF0uY2xhc3NOYW1lPVwidmMtYWN0aXZlZFwiLGUobil9fSx7a2V5Olwib25BZGRUb29sXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcyxvPVt7bmFtZTpcIlJlZnJlc2hcIixnbG9iYWw6ITEsb25DbGljazpmdW5jdGlvbihlKXt0LnJlbmRlclN0b3JhZ2UoKX19LHtuYW1lOlwiQ2xlYXJcIixnbG9iYWw6ITEsb25DbGljazpmdW5jdGlvbihlKXt0LmNsZWFyTG9nKCl9fV07ZShvKX19LHtrZXk6XCJvblJlYWR5XCIsdmFsdWU6ZnVuY3Rpb24oKXt9fSx7a2V5Olwib25TaG93XCIsdmFsdWU6ZnVuY3Rpb24oKXtcIlwiPT10aGlzLmN1cnJlbnRUeXBlJiYodGhpcy5jdXJyZW50VHlwZT1cImNvb2tpZXNcIix0aGlzLnJlbmRlclN0b3JhZ2UoKSl9fSx7a2V5OlwiY2xlYXJMb2dcIix2YWx1ZTpmdW5jdGlvbigpe2lmKHRoaXMuY3VycmVudFR5cGUmJndpbmRvdy5jb25maXJtKXt2YXIgZT13aW5kb3cuY29uZmlybShcIlJlbW92ZSBhbGwgXCIrdGhpcy50eXBlTmFtZU1hcFt0aGlzLmN1cnJlbnRUeXBlXStcIj9cIik7aWYoIWUpcmV0dXJuITF9c3dpdGNoKHRoaXMuY3VycmVudFR5cGUpe2Nhc2VcImNvb2tpZXNcIjp0aGlzLmNsZWFyQ29va2llTGlzdCgpO2JyZWFrO2Nhc2VcImxvY2Fsc3RvcmFnZVwiOnRoaXMuY2xlYXJMb2NhbFN0b3JhZ2VMaXN0KCk7YnJlYWs7ZGVmYXVsdDpyZXR1cm4hMX10aGlzLnJlbmRlclN0b3JhZ2UoKX19LHtrZXk6XCJyZW5kZXJTdG9yYWdlXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT1bXTtzd2l0Y2godGhpcy5jdXJyZW50VHlwZSl7Y2FzZVwiY29va2llc1wiOmU9dGhpcy5nZXRDb29raWVMaXN0KCk7YnJlYWs7Y2FzZVwibG9jYWxzdG9yYWdlXCI6ZT10aGlzLmdldExvY2FsU3RvcmFnZUxpc3QoKTticmVhaztkZWZhdWx0OnJldHVybiExfXZhciB0PW1bXCJkZWZhdWx0XCJdLm9uZShcIi52Yy1sb2dcIix0aGlzLiR0YWJib3gpO2lmKDA9PWUubGVuZ3RoKXQuaW5uZXJIVE1MPVwiXCI7ZWxzZXtmb3IodmFyIG89MDtvPGUubGVuZ3RoO28rKyllW29dLm5hbWU9Zy5odG1sRW5jb2RlKGVbb10ubmFtZSksZVtvXS52YWx1ZT1nLmh0bWxFbmNvZGUoZVtvXS52YWx1ZSk7dC5pbm5lckhUTUw9bVtcImRlZmF1bHRcIl0ucmVuZGVyKHBbXCJkZWZhdWx0XCJdLHtsaXN0OmV9LCEwKX19fSx7a2V5OlwiZ2V0Q29va2llTGlzdFwiLHZhbHVlOmZ1bmN0aW9uKCl7aWYoIWRvY3VtZW50LmNvb2tpZXx8IW5hdmlnYXRvci5jb29raWVFbmFibGVkKXJldHVybltdO2Zvcih2YXIgZT1bXSx0PWRvY3VtZW50LmNvb2tpZS5zcGxpdChcIjtcIiksbz0wO288dC5sZW5ndGg7bysrKXt2YXIgbj10W29dLnNwbGl0KFwiPVwiKSxpPW4uc2hpZnQoKS5yZXBsYWNlKC9eIC8sXCJcIiksYT1uLmpvaW4oXCI9XCIpO2UucHVzaCh7bmFtZTpkZWNvZGVVUklDb21wb25lbnQoaSksdmFsdWU6ZGVjb2RlVVJJQ29tcG9uZW50KGEpfSl9cmV0dXJuIGV9fSx7a2V5OlwiZ2V0TG9jYWxTdG9yYWdlTGlzdFwiLHZhbHVlOmZ1bmN0aW9uKCl7aWYoIXdpbmRvdy5sb2NhbFN0b3JhZ2UpcmV0dXJuW107dHJ5e2Zvcih2YXIgZT1bXSx0PTA7dDxsb2NhbFN0b3JhZ2UubGVuZ3RoO3QrKyl7dmFyIG89bG9jYWxTdG9yYWdlLmtleSh0KSxuPWxvY2FsU3RvcmFnZS5nZXRJdGVtKG8pO2UucHVzaCh7bmFtZTpvLHZhbHVlOm59KX1yZXR1cm4gZX1jYXRjaChpKXtyZXR1cm5bXX19fSx7a2V5OlwiY2xlYXJDb29raWVMaXN0XCIsdmFsdWU6ZnVuY3Rpb24oKXtpZihkb2N1bWVudC5jb29raWUmJm5hdmlnYXRvci5jb29raWVFbmFibGVkKXtmb3IodmFyIGU9dGhpcy5nZXRDb29raWVMaXN0KCksdD0wO3Q8ZS5sZW5ndGg7dCsrKWRvY3VtZW50LmNvb2tpZT1lW3RdLm5hbWUrXCI9O2V4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBHTVRcIjt0aGlzLnJlbmRlclN0b3JhZ2UoKX19fSx7a2V5OlwiY2xlYXJMb2NhbFN0b3JhZ2VMaXN0XCIsdmFsdWU6ZnVuY3Rpb24oKXtpZih3aW5kb3cubG9jYWxTdG9yYWdlKXRyeXtsb2NhbFN0b3JhZ2UuY2xlYXIoKSx0aGlzLnJlbmRlclN0b3JhZ2UoKX1jYXRjaChlKXthbGVydChcImxvY2FsU3RvcmFnZS5jbGVhcigpIGZhaWwuXCIpfX19XSksdH0oZFtcImRlZmF1bHRcIl0pO3RbXCJkZWZhdWx0XCJdPXksZS5leHBvcnRzPXRbXCJkZWZhdWx0XCJdfSxmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz0nPGRpdiBjbGFzcz1cInZjLXRhYmxlXCI+XFxuICA8ZGl2IGNsYXNzPVwidmMtbG9nXCI+PC9kaXY+XFxuPC9kaXY+J30sZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9JzxkaXY+XFxuICA8ZGwgY2xhc3M9XCJ2Yy10YWJsZS1yb3dcIj5cXG4gICAgPGRkIGNsYXNzPVwidmMtdGFibGUtY29sXCI+TmFtZTwvZGQ+XFxuICAgIDxkZCBjbGFzcz1cInZjLXRhYmxlLWNvbCB2Yy10YWJsZS1jb2wtMlwiPlZhbHVlPC9kZD5cXG4gIDwvZGw+XFxuICB7e2ZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKyl9fVxcbiAgPGRsIGNsYXNzPVwidmMtdGFibGUtcm93XCI+XFxuICAgIDxkZCBjbGFzcz1cInZjLXRhYmxlLWNvbFwiPnt7bGlzdFtpXS5uYW1lfX08L2RkPlxcbiAgICA8ZGQgY2xhc3M9XCJ2Yy10YWJsZS1jb2wgdmMtdGFibGUtY29sLTJcIj57e2xpc3RbaV0udmFsdWV9fTwvZGQ+XFxuICA8L2RsPlxcbiAge3svZm9yfX1cXG48L2Rpdj4nfV0pfSk7IiwiLyoqXG4gKiBXZWJBUueugOWNleexu1xuICogQHBhcmFtIGludGVydmFsIOivhuWIq+mXtOmalOaXtumXtCjmr6vnp5IpXG4gKiBAcGFyYW0gcmVjb2duaXplVXJsIOivhuWIq+acjeWKoeWcsOWdgFxuICogQGNvbnN0cnVjdG9yXG4gKi9cblxuY29uc3QgV2ViQVIgPSBmdW5jdGlvbihpbnRlcnZhbCwgcmVjb2duaXplVXJsKSB7XG4gICAgdmFyIGludGVydmFsID0gaW50ZXJ2YWwgfHwgMTAwMDtcbiAgICB2YXIgcmVjb2duaXplVXJsID0gcmVjb2duaXplVXJsIHx8ICcnO1xuXG4gICAgdmFyIHZpZGVvU2V0dGluZyA9IHt3aWR0aDogMzIwLCBoZWlnaHQ6IDI0MH07XG4gICAgdmFyIHZpZGVvRWxlbWVudCA9IG51bGw7XG4gICAgdmFyIHZpZGVvRGV2aWNlRWxlbWVudCA9IG51bGw7XG5cbiAgICB2YXIgY2FudmFzRWxlbWVudCA9IG51bGw7XG4gICAgdmFyIGNhbnZhc0NvbnRleHQgPSBudWxsO1xuXG4gICAgdmFyIHRpbWVyID0gbnVsbDtcbiAgICB2YXIgaXNSZWNvZ25pemluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5kZXZpY2VzID0gW107XG5cbiAgICB2YXIgZGVidWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkZWJ1Zy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2RlYnVnJyk7XG4gICAgZGVidWcuc2V0QXR0cmlidXRlKCd3aWR0aCcsICh3aW5kb3cuaW5uZXJXaWR0aCAvIDIpLnRvU3RyaW5nKCkpO1xuICAgIGRlYnVnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0Jywgd2luZG93LmlubmVySGVpZ2h0LnRvU3RyaW5nKCkpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGVidWcpO1xuXG4gICAgLyoqXG4gICAgICog5YiX5Ye65omA5pyJ5pGE5YOP5aS0XG4gICAgICogQHBhcmFtIHZpZGVvRGV2aWNlXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgdGhpcy5saXN0Q2FtZXJhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKClcbiAgICAgICAgICAgICAgICAudGhlbigoZGV2aWNlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkZXZpY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlcy5maW5kKChkZXZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2Uua2luZCA9PT0gJ3ZpZGVvaW5wdXQnKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRldmljZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRldmljZUluZm8gPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZUluZm9bJ25hbWUnXSA9IGRldmljZS5sYWJlbCB8fCAnY2FtZXJhJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VJbmZvWydkZXZpY2VJZCddID0gIGRldmljZS5kZXZpY2VJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlsIbmkYTlg4/lpLRpZOWtmOWCqOWcqHNlbGVjdOWFg+e0oOS4re+8jOaWueS+v+WIh+aNouWJjeOAgeWQjue9ruaRhOWDj+WktFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmRldmljZXMucHVzaChkZXZpY2VJbmZvKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLmRldmljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ+ayoeacieaRhOWDj+WktCcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yib5bu6Y2FudmFz77yM5oiq5Y+W5pGE5YOP5aS05Zu+54mH5pe25L2/55SoXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXNDb250ZXh0ID0gY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShfdGhpcy5kZXZpY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDmiZPlvIDmkYTlg4/lpLRcbiAgICAgKiBAcGFyYW0gdmlkZW9cbiAgICAgKiBAcGFyYW0gZGV2aWNlSWRcbiAgICAgKiBAcGFyYW0gc2V0dGluZ1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHRoaXMub3BlbkNhbWVyYSA9IGZ1bmN0aW9uKHZpZGVvLCBkZXZpY2VJZCwgc2V0dGluZykge1xuICAgICAgICB2aWRlb0VsZW1lbnQgPSB2aWRlbztcbiAgICAgICAgaWYgKHNldHRpbmcpIHtcbiAgICAgICAgICAgIHZpZGVvU2V0dGluZyA9IHNldHRpbmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmkYTlg4/lpLTlj4LmlbBcbiAgICAgICAgLy8g5pu05aSa5Y+C5pWw6K+35p+l55yLIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9NZWRpYVN0cmVhbUNvbnN0cmFpbnRzXG4gICAgICAgIGNvbnN0IGNvbnN0cmFpbnRzID0ge1xuICAgICAgICAgICAgYXVkaW86IGZhbHNlLFxuICAgICAgICAgICAgdmlkZW86IHtkZXZpY2VJZDoge2V4YWN0OiBkZXZpY2VJZH19XG4gICAgICAgIH07XG5cbiAgICAgICAgY2FudmFzRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdmlkZW9TZXR0aW5nLndpZHRoICsgJ3B4Jyk7XG4gICAgICAgIGNhbnZhc0VsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB2aWRlb1NldHRpbmcuaGVpZ2h0ICsgJ3B4Jyk7XG5cbiAgICAgICAgLy8g5aaC5p6c5piv5YiH5o2i5pGE5YOP5aS077yM5YiZ6ZyA6KaB5YWI5YWz6Zet44CCXG4gICAgICAgIGlmICh2aWRlb0VsZW1lbnQuc3JjT2JqZWN0KSB7XG4gICAgICAgICAgICB2aWRlb0VsZW1lbnQuc3JjT2JqZWN0LmdldFRyYWNrcygpLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhY2suc3RvcCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHN0cmVhbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2aWRlb0VsZW1lbnQuc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgICAgICAgICAgICB2aWRlb0VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIHZpZGVvRWxlbWVudC5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIOaIquWPluaRhOWDj+WktOWbvueJh++8jOi/lOWbniBiYXNlNjTnvJbnoIHlkI7nmoTlm77niYfmlbDmja5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMuY2FwdHVyZVZpZGVvID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNhbnZhc0NvbnRleHQuZHJhd0ltYWdlKHZpZGVvRWxlbWVudCwgMCwgMCwgdmlkZW9TZXR0aW5nLndpZHRoLCB2aWRlb1NldHRpbmcuaGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIGNhbnZhc0VsZW1lbnQudG9EYXRhVVJMKCdpbWFnZS9qcGVnJywgMC41KS5zcGxpdCgnYmFzZTY0LCcpWzFdO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDor4bliKtcbiAgICAgKi9cbiAgICB0aGlzLnN0YXJ0UmVjb2duaXplID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzUmVjb2duaXppbmcpIHJldHVybjtcblxuICAgICAgICAgICAgaXNSZWNvZ25pemluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIOS7juaRhOWDj+WktOS4reaKk+WPluS4gOW8oOWbvueJh1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSB7aW1hZ2U6IHRoaXMuY2FwdHVyZVZpZGVvKCl9O1xuXG4gICAgICAgICAgICAvLyDlj5HpgIHliLDmnI3liqHlmajor4bliKtcbiAgICAgICAgICAgIHRoaXMuaHR0cFBvc3QocmVjb2duaXplVXJsLCBpbWFnZSlcbiAgICAgICAgICAgICAgICAudGhlbigobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcFJlY29nbml6ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG1zZyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpc1JlY29nbml6aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhY2UoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDlgZzmraLor4bliKtcbiAgICAgKi9cbiAgICB0aGlzLnN0b3BSZWNvZ25pemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICAgICAgICBpc1JlY29nbml6aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSFRUUOivt+axgu+8jOWPr+S7peS9v+eUqGpRdWVyeeetieS7o+abv1xuICAgICAqIEBwYXJhbSB1cmxcbiAgICAgKiBAcGFyYW0gaW1hZ2VcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICB0aGlzLmh0dHBQb3N0ID0gZnVuY3Rpb24odXJsLCBpbWFnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgaHR0cC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXNnID0gSlNPTi5wYXJzZShodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobXNnLnN0YXR1c0NvZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1zZy5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChtc2cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBodHRwLm9uZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBodHRwLm9wZW4oJ1BPU1QnLCB1cmwpO1xuICAgICAgICAgICAgaHR0cC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbjtDaGFyc2V0PVVURi04Jyk7XG4gICAgICAgICAgICBodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoaW1hZ2UpKVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog6LCD55So6L6T5Ye6XG4gICAgICogQHBhcmFtIGFyZ1xuICAgICAqL1xuICAgIHRoaXMudHJhY2UgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBkZWJ1Zy5pbm5lckhUTUwgKz0gYXJnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVidWcuaW5uZXJIVE1MICs9IEpTT04uc3RyaW5naWZ5KGFyZyk7XG4gICAgICAgIH1cbiAgICAgICAgZGVidWcuaW5uZXJIVE1MICs9ICc8YnIgLz4nO1xuICAgIH07XG5cbn07XG5leHBvcnQgZGVmYXVsdCBXZWJBUjtcbiJdfQ==
