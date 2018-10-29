const jQuery = (() => {
  let oldjQuery = window.jQuery
  let old$ = window.$
  let jQuery = window.jQuery = window.$ = require("jquery.transit")
  require("jquery-ui/ui/version")
  require("jquery-ui/ui/keycode")
  require("jquery-ui/ui/widget")
  window.jQuery = oldjQuery
  window.$ = old$
  return jQuery
})()
const $ = jQuery
const EventEmitter = require('events').EventEmitter

const flatten = (arr, ...args) => {
  return [].concat(arr, args).reduce((res, obj) => {
    return clone(res, obj)
  }, {})
}

const clone = (...args) => {
  return $.extend({}, ...args)
}

function wait(t){
  return new Promise( resolve => setTimeout(resolve, t))
}

class Site extends EventEmitter {

  constructor() {
    super()
    this.EVENTS = {
      LOADED: 'loaded',
      READY: 'ready',
      AFTER_WIDGETS_INIT: 'afterWidgetsInit',
      XHR_LOAD_START: 'xhrLoadStart',
      XHR_TRANSITIONING_OUT: 'xhrTransitioningOut',
      XHR_LOAD_MIDDLE: 'xhrLoadMiddle',
      XHR_LOAD_END: 'xhrLoadEnd',
      XHR_WILL_TRANSITION: 'xhrWillTransition',
      XHR_WILL_TRANSITION_OUT: 'xhrWillTransitionOut',
      XHR_WILL_SWAP_CONTENT: 'xhrWillSwapContent',
      XHR_WILL_TRANSITION_WIDGETS_IN: 'xhrWillTransitionWidgetsIn',
      XHR_WILL_SCROLL_TO_PREV_POSITION: 'xhrWillScrollToPrevPosition',
      XHR_PAGE_CHANGED: 'xhrPageChanged',
      XHR_LOADING_START: 'xhrLoadingStart',
      XHR_LOADING_STOP: 'xhrLoadingStop',
      XHR_POP_STATE: 'xhrPopState',
      XHR_LINK_CLICK: 'xhrLinkClick',
    }

    const size = 40
		const style = `
			font-size: 1px;
			line-height:${size*.5}px;padding:${size*.25}px ${size*.5}px;
			background-size: ${size}px ${size*.75}px;
			background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg class='header-logo' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 84 45' enable-background='new 0 0 84 45' xml:space='preserve'%3e%3cstyle%3e %23ED_Logo%7btransition: transform 0.3s;%7d %23ED_Logo:hover%7btransform: scale(1.1);%7d %3c/style%3e%3cg id='ED_Logo'%3e%3cg%3e%3cpath d='M11.4,34.4h19.2V45H0V0h30.6v10.6H11.4v6.6h18.8v10.7H11.4V34.4z'%3e%3c/path%3e%3cpath d='M51.1,0c15.3,0,23,11.3,23,22.6c0,11.2-7.7,22.4-23,22.4H33.6V0H51.1z M51.1,34.5c7.8,0,11.8-6,11.8-12 c0-5.9-4-12.2-11.8-12.2h-6.2v24.1C44.9,34.5,48.2,34.5,51.1,34.5z'%3e%3c/path%3e%3cpath d='M84,39.3c0,2.8-2.6,5.7-6.2,5.7c-3.3,0-6-2.9-6-5.7c0-3.4,2.7-5.7,6-5.7C81.4,33.6,84,35.9,84,39.3z'%3e%3c/path%3e%3c/g%3e%3c/g%3e%3c/svg%3e");
			background-repeat:no-repeat;
			background-position:center;
    `
		console.log('%c ', style, '\nSite by ED.\nhttps://ed.com.au');

    this.$ = jQuery
    this.preloadedImages = []

    this.pageCache = {}
    this.preloadedPages = {}

    this.pagePreloadQueue = []
    this.isPreloadingPages = false

    this.XHRRequestCounter = 0

    this.xhrOptions = {
  		scrollAnimation: {
  			duration: 220
  		},
      xhrEnabled: true,
      loadImages: true,
      autoScrollRestore: true,
  		imageLoadTimeout: 3000,
  		widgetTransitionDelay: 0,
  		cachePages: true,
      swapBodyClasses: (newClasses) => new Promise(resolve => {
        setTimeout(() => {
          document.body.className = newClasses
          resolve()
        }, (this.xhrOptions.widgetTransitionDelay || 500) / 2)
      }),
  		swapContent: (container, originalContent, newContent, direction) => {

  			var duration = this.xhrOptions.widgetTransitionDelay || 500

  			// Fade out old content
  			originalContent.fadeOut({
  				duration: duration/2,
  				complete: function() {

  					// Not forgetting to remove the old content
  					originalContent.remove()

  					// Fade in new content
  					newContent.css({
  						display: 'block',
  						opacity: 0
  					}).animate({
  						opacity: 1
  					}, {
  						duration: duration/2
  					})

  				}
  			})

        return duration + 500

  		},
  		filterBodyClasses: (oldClasses, newClasses) => {
  			return newClasses
      },
  	}

    // Init dev mode
    this.initLiveReload()

    this.components = {}

    // Wait for DOM load
    jQuery(() => this.domReady())
  }

  domReady() {
    if (this._domReadyCalled) return
    this._domReadyCalled = true

    this.pageState = $("pagestate").data('state')
    this.initWidgets()
    this.initXHRPageSystem()
    this.preloadWidgets($(document.body), () => {
      this.emit(this.EVENTS.LOADED)
    })
    this.transitionWidgetsIn($(document.body), this.pageState, { initial: true }, () => {})
    this.emit(this.EVENTS.READY)
  }

  initLiveReload() {

    return

    if(navigator.appName != "Netscape" || !window.location.href.match(/(2016|ngrok)/)) {
      return false
    }

    let refresh = () => history.go(0)

    let check = () => {
      $.ajax({
        url: '/devcheck',
        error: () => {
          // Failed, start checking again
          setTimeout(check, 1000)
        },
        success: () => {
          // We got a response
          refresh()
        }
      })
    }

    check()
	}

  setGlobalState(state, reset) {

    for(var k in this.components) {
      var component = this.components[k]
      if(component && component.setState) {
        if(k in state || reset !== false) {
          component.setState(state[k] || {})
        }
      }
    }

  }

  findWidgets(name, el) {
    let result = []
    let widgets = $('[data-widget]', el || document.body).each((k, el) => {
      let widgetNames = $.data(el, 'widgetNames')
      if(widgetNames && widgetNames.indexOf(name) != -1) {
        let instance = $(el)[name]('instance')
        result.push(instance)
      }
    })
    return result
  }

  findWidget(name, el) {
    let widgets = this.findWidgets(name, el)
    if(widgets && widgets.length) {
      return widgets[0]
    } else {
      return null
    }
  }

  getAllWidgets(el) {
    let result = []
    let widgets = $('[data-widget]', el || document.body)
    if(el) widgets = widgets.add(el)
    widgets.each((k, el) => {
      let widgetNames = $.data(el, 'widgetNames')
      for(let k in widgetNames) {
        let instance = $(el)[widgetNames[k]]('instance')
        if(instance) {
          result.push(instance)
        }
      }
    })
    return result
  }

  triggerAllWidgets(methodName, target = null, ...args) {

    let widgets = this.getAllWidgets(target)

    for(let k in widgets) {
      let widget = widgets[k]
      if(widget && methodName in widget) {
        widget[methodName].apply(widget, args)
      }
    }

  }

  getWidgetDefs(el) {

    el = $(el)

    let widgets = (el.attr('data-widget') || el.attr('data-widgets')).split(/\,\s*/g)
    let isInitialized = el.data('hasBeenInitialized')

    for(let k in widgets) {

      let widgetInfo = widgets[k].split('#')

      widgets[k] = {
        name: widgetInfo[0],
        identifier: widgetInfo[1],
        instance: isInitialized ? el[widgetInfo[0]]('instance') : null
      }

    }

    return widgets

  }

  initWidgets(targetEl) {

    targetEl = $(targetEl || document.body)

    // Look for uninitialized widgets
    targetEl.find("[data-widget]").each((k, thisEl) => {

      // Grab the element and data
      let el = $(thisEl)
      let data = el.data()

      // Only initialize once
      if(data.hasBeenInitialized) return

      // Prepare options
      let options = {}
      for(let k in data) {
        if(k[0] !== "_") {
          options[k] = data[k]
        }
      }

      let widgets = this.getWidgetDefs(el)
      let widgetNames = []
      for(let i = 0; i < widgets.length; i++) {

        let widget = widgets[i]

        widgetNames.push(widget.name)

        // Throw an error if that widget doesn't exist
        if(widget.name in $.fn === false) {
          if(data.widgetOptional === true) {
            return
          } else {
            console.error("Could not initialize widget '"+widget.name+"', as no widget with this name has been declared.")
            return
          }
        }

        // Spawn the widget, and grab it's instance
        try {
          el[widget.name](options)
          let instance = el[widget.name]('instance')

          // Save it to the components object
          if(widget.identifier) {
            this.components[widget.identifier] = instance
          }
        } catch (err) {
          this.reportError(`Error initializing widget '${widget.name}'`, err)
          console.error(err)
        }

      }

      // Mark as initialized
      el.data('hasBeenInitialized', true)
      $.data(thisEl, 'widgetNames', widgetNames)

    })

    this.emit(this.EVENTS.AFTER_WIDGETS_INIT)

  }

  reportError (...args) {
    for (let arg of args)  {
      console.error(arg)
    }
  }

  propsToSave(){
    return ['_create', '_destroy', '_transitionIn', '_transitionOut']
  }

  saveWidgetProps(self, mixins, name){
    return this.propsToSave().reduce((result, key) => {
      // Replaces the protected prop with a function that sequentially calls
      // the protected prop on all extensions
      result[key] = function(...args){

        if ( typeof self[key] === 'function' ) self[key].apply(this, args)
        mixins
          .forEach(mixin => {
            if ( typeof mixin[key] === 'function' ) {
              mixin[key].apply(this, args)
            }
          })
      }
      return result
    }, {})
  }

  prepWidgetExtensions(name, def){
    const mixins = def.use
    const meta = []
    const mixeds = mixins.map(mixin => {
      meta.push({name: mixin.name})
      return mixin(this, this.$, name, clone(def))
    })


    // Warn of overwritten props
    mixeds.forEach((mix, curr) => {
      Object.keys(mix)
        .filter(k => !this.propsToSave().includes(k))
        .forEach(k => {
          if(def[k]){
            console.warn(`The prop ${k} will be overwritten by extension ${mixins[curr].name || curr}`)
          }
          // only check mixins below this current one
          mixeds
          .map((mixed, i) => {
            return {mix: mixed, name: meta[i].name}
          })
          .filter((_, i) => i < curr)
          .forEach((mixed, i) => {
            if(mixed.mix[k]){
              console.warn(`The prop ${k} from extension ${mixed.name || i} will be overwritten by extension ${mixins[curr].name || curr}`)
            }
          })
        })
    })

    const saved = this.saveWidgetProps(def, mixeds, name)

    return clone(def, flatten(mixeds, saved))
  }

  widget(name, def, explicitBase) {
    let finalDef = def
    // widget.use is an array we will treat it as an array of extensions
    if(def.use){
      if(Array.isArray(def.use)){
        finalDef = this.prepWidgetExtensions(name, def)
      }else{
        console.warn(`The ${name} widget has property 'use' but it is not an array.`)
      }
    }
    if(name.indexOf('.') === -1) {
      name = 'ui.'+name
    }
    $.widget(name, $.extend({}, baseWidget, explicitBase || {}, finalDef))
  }

	preloadImages(srcs, timeout, callback) {

		var images = []

		var callbackCalled = false
		var triggerCallback = () => {
			if(!callbackCalled) {
				callbackCalled = true
				if(callback) callback()
			}
		}

		if(srcs.length === 0) {
			triggerCallback()
			return
		}

		var loaded = (img) => {
			images.push(img)
			this.preloadedImages.push(img[0])
			if(images.length == srcs.length) {
				triggerCallback()
			}
		}

		if(timeout !== false) {
			setTimeout(() => {
				triggerCallback()
			}, timeout)
		}

    let preloadItem = (src) => {
      let img = $("<img>")

			let hasLoaded = false

			img.on("load", () => {
				if(!hasLoaded) {
					loaded(img)
				}
			})

			img[0].src = src

			if(img[0].width || img[0].naturalWidth) {
				if(!hasLoaded) {
					hasLoaded = true
					loaded(img)
				}
			}
    }

    srcs.map(preloadItem)

	}

	/*
		Preloads images from the specified elements, with an optional timeout.
		Callback will be triggered when their all elements have loaded, or when the timeout (in milliseconds) is reached.
		Set timeout to false for no timeout.

		eg.
			Site.preloadContent(els, 5000, callback)
			Site.preloadContent(els, false, callback)
	*/
	preloadContent(els, timeout, callback) {

		var images = []
		var callbackCalled = false

		$(els).each((k, el) => {

			var self = $(el)

			// Get images from 'style' attribute of div elements only
			self.find("[style], .preload").each((k, el) => {
        let backgroundImage = $(el).css('backgroundImage')
				if(backgroundImage) {
					var match = backgroundImage.match(/url\((.+)\)/)
					if(match) {
						var src = match[1].replace(/(^[\'\"]|[\'\"]$)/g, '')
						images.push(src)
					}
				}
			})

			// Get 'src' attributes from images
			self.find("img").each((k, el) => {
				images.push(el.src)
			})

		})

		this.preloadImages(images, timeout, callback)

	}

	getURLPath(input) {
		var match = input.match(/:\/\/[^\/]+([^#?]*)/)
		if(match) {
			return match[1].replace(/\/$/, '')
		} else {
			return ""
		}
	}

	resizeToFit(width, height, viewportWidth, viewportHeight, cover) {

		var result = {}

		if((cover && width/height > viewportWidth/viewportHeight) || (!cover && width/height < viewportWidth/viewportHeight)) {
			result.width = viewportHeight * width/height
			result.height = viewportHeight
		} else {
			result.width = viewportWidth
			result.height = viewportWidth * height/width
		}

		result.top = viewportHeight/2 - result.height/2
		result.left = viewportWidth/2 - result.width/2

		return result

	}

	forceResizeWindow() {
		window.resizeTo(window.outerWidth, window.outerHeight)
	}

  preloadPages() {
		if(this.isPreloadingPages) return
		this.isPreloadingPages = true

		var loadNext = () => {

			// Filter out pre-preloaded urls
			this.pagePreloadQueue = this.pagePreloadQueue.filter((url) => {
				return this.preloadedPages[url] ? false : true
			})

			if(this.pagePreloadQueue.length === 0) {
				this.isPreloadingPages = false
			} else {
				var url = this.pagePreloadQueue.shift()
				this.getContent(url, () => {
					setTimeout(loadNext)
				}, true)
			}
		}

		loadNext()

  }

  getRefreshes(target){
    const itemsToRefresh = target.find('[data-xhr-refresh]').addBack( '[data-xhr-refresh]' ).not('[data-page-container] [data-xhr-refresh]').get()

    const items = itemsToRefresh.filter(el => {
      const id = $(el).attr('id')

      // Warn
      if ( !id ) {
        console.warn('Refreshed item', el, 'is missing an id attribute. Include one to refresh the element on page change')
        return false
      }

      return true
    })

    return items
  }

  doRefreshes(result){
    const $page = this.XHRPageContainer.parent().children().not( '[data-page-container]' )
    const swapping = []
    const leaving = []
    const entering = []

    const removeAttributes = el => {
      const attr = Array.prototype.slice.call( el.prop( 'attributes' ) )
      attr.forEach(attr => {
        el.removeAttr( attr.name )
      })
    }

    const copyAttributes = (from, to) => {
      const attr = Array.prototype.slice.call( from.prop( 'attributes' ) )
      attr.forEach(attr => {
        to.attr( attr.name, from.attr( attr.name ) )
      })
    }

    this.getRefreshes( $page )
    .forEach( item => {

      const $item = $( item )
      const id = $item.attr( 'id' )
      const oldKey = $item.attr( 'data-xhr-refresh' )

      const newRefresh = result.find( `#${id}[data-xhr-refresh]` ).addBack( `#${id}[data-xhr-refresh]` )

      // This item isn't in the new dom
      if ( !newRefresh.length ) {
        leaving.push( item )
      }

      // Diff the item
      const newKey = newRefresh.attr( 'data-xhr-refresh' )

      // Invalidated by key. Completely refresh that thing!
      // (If it's the same we will probably leave it 😀)
      if ( newKey !== oldKey ) {
        swapping.push( [ item, newRefresh.get( 0 ) ] )
      }

    } )

    this.getRefreshes( result )
    .forEach( item => {

      if ( swapping.find( swapped => swapped[1] === item ) ) {
        // Already swapping this item... ignore
        return
      }

      entering.push( item )
    } )

    const returnVal = {
      swapping: {
        items: swapping,
        swap: ( ) =>  new Promise( resolve => {

          swapping.forEach( item => {

            const $item1 = $( item[0] )
            const $item2 = $( item[1] )
            $item1.html( $( $item2 ).html() )
            removeAttributes( $item1 )
            copyAttributes( $item2, $item1 )
            this.initWidgets( $item1.parent() )
            this.handleXHRLinks( $item1.parent() )

          } )

          resolve()
        } )
      },
      leaving: {
        items: leaving,
        $items: $( leaving )
      },
      entering: {
        items: entering,
        $items: $( entering )
      }
    }

    return returnVal

  }

  restoreScroll(fn){

    const { state } = history

    if(state && typeof state.scrollY === 'number' && !state.dontAutoScroll){

      this.emit(this.EVENTS.XHR_WILL_SCROLL_TO_PREV_POSITION)

      if ( typeof fn === 'function' ) {
        return fn(state)
      } else {
        return new Promise( resolve => {
          window.scrollTo(0, state.scrollY)
          resolve()
        } )
      }

    }

  }

  getContent(url, callback, isPreload) {

		url = url.replace(/\#.+/, '')

		if(url.indexOf('?') == -1) {
			url += "?xhr-page=true"
		} else {
			url += "&xhr-page=true"
		}

		// Mark as preloaded (even if it's not). It won't appear in pageCache until it's been completely loaded. This is just to prevent the page from being preloaded more than once.
		if(isPreload && this.preloadedPages[url]) {
			callback()
			return
		}
		this.preloadedPages[url] = true

		if(this.xhrOptions.cachePages && this.pageCache[url]) {
			callback(this.pageCache[url])
		} else {
			$.ajax({
				url: url,
				async: true,
				global: !isPreload,
				success: (response, textStatus) => {
					callback(response, textStatus, null)
					if(response && this.xhrOptions.cachePages) {
						this.pageCache[url] = response
					}
				},
				error: (jqXHR, textStatus, error) => {
					callback(jqXHR.responseText, textStatus, error)
				}
			})
		}

  }

	goToURL(url, dontPush) {

		var originalURL = url
		var requestID = ++this.XHRRequestCounter

		this.lastURL = url

		// See if any widgets want to intercept this request instead
		var allWidgets = this.getAllWidgets()
		var urlPath = url.replace(/\#.+$/, '').match(/:\/\/[^\/]+(.*)/)
		for(var k in allWidgets) {
			var widget = allWidgets[k]
			if(widget && widget.xhrPageWillLoad) {
				var result = widget.xhrPageWillLoad(urlPath, url)
				if(result === false) {
					history.pushState({}, null, originalURL)
          if(window.ga) {
            // Inform Google Analytics
            ga('send', {
              hitType: 'pageview',
              page: location.pathname
            })
          }
					return
				}
			}
    }

    const scrollToSave = this.generateReplaceState()

    if(this.xhrOptions.scrollAnimation) {
  		var htmlBody = $("html,body").stop(true).animate({scrollTop: 0}, this.xhrOptions.scrollAnimation).one('scroll', () => {
  			htmlBody.stop(true)
  		})
    }

		this.emit(this.EVENTS.XHR_LOAD_START)

		this.getContent(originalURL, (response, textStatus) => {
			if(requestID !== this.XHRRequestCounter) {
				// Looks like another request was made after this one, so ignore the response.
				return
			}
			this.emit(this.EVENTS.XHR_TRANSITIONING_OUT)
			// Alter the response to keep the body tag
			response = response.replace(/(<\/?)body([^a-z])/g, '$1bodyfake$2')
			response = response.replace(/(<\/?)head([^a-z])/g, '$1headfake$2')

			// Convert the text response to DOM structure
			var result = $("<div>"+response+"</div>")

			// Pull out the contents
			var foundPageContainer = result.find(".xhr-page-contents, [data-page-container]").first()

			if(foundPageContainer.length === 0) {
				// Could not find a page container element :/ just link to the page
				window.location.href = originalURL
				console.error("Could not find an element with a `data-page-container` attribute within the fetched XHR page response. Sending user directly to the page.")
				return
			}

			// Grab content
			var newContent = $("<div class='xhr-page-contents'></div>").append(foundPageContainer.children())

			this.emit(this.EVENTS.XHR_LOAD_MIDDLE)

			var finalize = () => {
				this.emit(this.EVENTS.XHR_LOAD_END)

				// Grab the page title
				var title = result.find("title").html()

				// Grab any resources
				var includes = result.find("headfake").find("script, link[rel=stylesheet]")

				// Grab the body class
				var bodyClass = result.find("bodyfake").attr('class')
				bodyClass = this.xhrOptions.filterBodyClasses(document.body.className, bodyClass)

				var oldPageState = this.pageState
				this.pageState = result.find("pagestate").data('state')

        // Look for gravity forms scripts in the footer
        // result.find("script").each((k, el) => {
        //   if(!el.getAttribute('src') && el.innerHTML.indexOf("var gf_global")) {
        //
        //   }
        // })

				// Set page title
				$("head title").html(title)
        this.xhrOptions.swapBodyClasses(bodyClass + " xhr-transitioning-out")

				var existingScripts = $(document.head).find("script")
				var existingStylesheets = $(document.head).find("link[rel=stylesheet]")

				// Swap menus out
				const swapMenus = () => {
          result.find("ul.menu").each((k, item) => {

            if(item.parentNode.parentNode.getAttribute('data-swap-classes')) {
              // Just swap classes for each li
              var id = item.getAttribute('id')
              if(!id) return
    					// var el = $('#'+id.replace(/\-[0-9]+/, ''))
              var el = $('#'+id)

              var existingItems = el.find("li")

              if(existingItems.length) {
                $(item).find("li").each((k, li) => {
                  existingItems[k].className = li.className
                })
              }
  					} else {
              // Swap the entire contents (default behaviour)
    					var id = item.getAttribute('id')
              if(!id) return
              // var el = $('#'+id.replace(/\-[0-9]+/, ''))
    					var el = $('#'+id)
                .html(item.innerHTML)
    					this.handleXHRLinks(el)
            }

  				})
        }

				// Swap WP 'Edit Post' link
				var editButton = result.find("#wp-admin-bar-edit")
				if(editButton.length) {
					$("#wp-admin-bar-edit").html(editButton.html())
				}

				// Apply any missing scripts
				includes.each((i, el) => {

					if($(el).parents("[data-page-container]").length) return

					if(el.tagName == "SCRIPT") {

						var scriptSrc = el.src.replace(/\?.*$/, '')
						var includeScript = true
						existingScripts.each((k, el) => {
							var elSrc = el.src.replace(/\?.*$/, '')
							if(scriptSrc == elSrc) {
								includeScript = false
							}
						})

						if(includeScript) {
							$(el).appendTo(document.head)
						}

					} else if(el.tagName == "LINK") {

						var linkHref = el.href.replace(/\?.*$/, '')
						var includeStyles = true
						existingStylesheets.each((k, el) => {
							var elHref = el.href.replace(/\?.*$/, '')
							if(linkHref == elHref) {
								includeStyles = false
							}
						})

						if(includeStyles) {
							$(el).appendTo(document.head)
						}

					}

				})

				// Grab old content, by wrapping it in a span
        let oldContent = this.XHRPageContainer.children('.xhr-page-contents')
        if (oldContent.length === 0) {
  				this.XHRPageContainer.wrapInner("<span class='xhr-page-contents'></span>")
  				oldContent = this.XHRPageContainer.children().first()
        }

        const refreshes = this.doRefreshes( result )

				// Add new content to the page
				try {
					this.XHRPageContainer.append(newContent)
				} catch(e) {

				}

				newContent.hide()

				// Apply to history
				if(!dontPush) {

          // Replace the last state just before move on
          history.replaceState(
            clone(history.state, scrollToSave),
            null
          )

          // Move on
					history.pushState(
						{},
						title,
						originalURL
					)
          if(window.ga) {
            // Inform Google Analytics
            ga('send', {
              hitType: 'pageview',
              page: location.pathname
            })
          }
				}
        this.emit(this.EVENTS.XHR_WILL_TRANSITION)
				// Destroy existing widgets
				var steps = [
          (next) => {
            this.initWidgets(newContent)
            Promise.race([
              new Promise(resolve => this.preloadWidgets(newContent, resolve)),
              new Promise(resolve => setTimeout(resolve, 6000))
            ]).then(next)
          },
					(next) => {
						this.transitionWidgetsOut(oldContent, oldPageState, this.pageState, true, next)
					},
					async (next) => {
						// Set up links and widgets
            swapMenus()
            newContent.show()
						this.forceResizeWindow()
						this.handleXHRLinks(newContent)
						newContent.hide()

						// Perform the swap!
            this.emit(this.EVENTS.XHR_WILL_SWAP_CONTENT)
						var delayOrPromise = this.xhrOptions.widgetTransitionDelay
						delayOrPromise = this.xhrOptions.swapContent(
              this.XHRPageContainer,
              oldContent,
              newContent,
              dontPush ? "back" : "forward",

              // NEW: Everything after newContent is now in an Object
              {
                refreshes,
              }
            ) || delay

            if ( typeof delayOrPromise === 'number') {
              await wait(delayOrPromise)
            } else {
              await delayOrPromise
            }
            next()
					},
					(next) => {
            this.emit(this.EVENTS.XHR_WILL_TRANSITION_WIDGETS_IN)

            if ( this.xhrOptions.autoScrollRestore ) this.restoreScroll()

						this.transitionWidgetsIn(newContent, this.pageState, oldPageState, next)
					}
				]

				var stepIndex = 0
				var next = () => {
					if(stepIndex < steps.length) {
						steps[stepIndex++](next)
					} else {
						this.emit(this.EVENTS.XHR_PAGE_CHANGED)
					}
				}

				next()

			}

			if(this.xhrOptions.loadImages) {
				this.preloadContent(newContent, this.xhrOptions.imageLoadTimeout, finalize)
			} else {
				finalize()
 			}

		})

  }

  preloadWidgets (targetEl, callback) {
    const promises = this.getAllWidgets(targetEl)
      .filter(widget => widget._preloadWidget)
      .map(widget => {
        // Create a 'promise to load'
        widget.__promiseToLoad = new Promise(resolve => {
          try {
            widget._preloadWidget(() => {
              resolve()
            })
          } catch (err) {
            resolve()
            console.error(err)
          }
        })
        return widget.__promiseToLoad
      })
    Promise.all(promises).then(callback).catch(err => callback())
	}

	generateReplaceState(s){
		if ('scrollRestoration' in history && history.scrollRestoration !== 'manual') {
				history.scrollRestoration = 'manual';
		}
		const t = {
			scrollY: window.scrollY
			|| window.pageYOffset
			|| document.documentElement.scrollTop,
			scrollX: window.scrollX
			|| window.pageXOffset
			|| document.documentElement.scrollLeft,
		}
		// console.log(s, t)
		return t
	}

	transitionWidgetsIn(targetEl, newState, oldState, callback) {

		var foundTransition = false
		var finalDelay = 0

		targetEl.find("[data-widget]").each((index, el) => {

			el = $(el)
			var widgets = this.getWidgetDefs(el)

			for(let k in widgets) {
				if(widgets[k].instance && widgets[k].instance._transitionIn) {
          const widget = widgets[k].instance
          if (widget.__promiseToLoad) {
            widget.__promiseToLoad.then(() => {
              widget._transitionIn(newState, oldState, this.xhrOptions.widgetTransitionDelay)
            })
          } else {
  					var delay = widget._transitionIn(newState, oldState, this.xhrOptions.widgetTransitionDelay)
  					foundTransition = true
  					finalDelay = Math.max(delay, finalDelay)
          }
				}
			}

		})

		if(foundTransition && finalDelay) {
			setTimeout(callback, finalDelay)
		} else if(foundTransition && !finalDelay) {
			setTimeout(callback, this.xhrOptions.widgetTransitionDelay)
		} else {
			callback()
		}

	}

	transitionWidgetsOut (targetEl, newState, oldState, destroy, callback) {

		var foundTransition = false
		var finalDelay = 0

    let widgets = this.getAllWidgets(targetEl)

    for(let widget of widgets) {
      foundTransition = true
      if(widget._transitionOut) {
        var delay = widget._transitionOut(newState, oldState, this.xhrOptions.widgetTransitionDelay)
        finalDelay = Math.max(delay, finalDelay)
        if(destroy) {
          widget.destroy()
        }
      }
    }

		if(foundTransition && finalDelay) {
			setTimeout(callback, finalDelay)
		} else if(foundTransition && !finalDelay) {
			setTimeout(callback, this.xhrOptions.widgetTransitionDelay)
		} else {
			callback()
		}

	}

  wrapXHRInner () {
    const target = this.XHRPageContainer
    const wrapper = $("<span class='xhr-page-contents'></span>")
    wrapper.appendTo(target).append(target.children())
  }

	initXHRPageSystem() {
    if(!this.xhrOptions.xhrEnabled) return

		// Grab the page container, if one exists
		this.XHRPageContainer = $("[data-page-container]:first")
		if(this.XHRPageContainer.length === 0) {
			this.XHRPageContainer = null
			return
		}

		// Add event listeners to jQuery which will add/remove the 'xhr-loading' class
		$(document).ajaxStart(() => {
			$(document.body).addClass("xhr-loading")
			this.emit(this.EVENTS.XHR_LOADING_START)
		}).ajaxStop(() => {
			$(document.body).removeClass("xhr-loading")
			this.emit(this.EVENTS.XHR_LOADING_STOP)
		})

		// Add event listeners to links where appropriate
		this.handleXHRLinks()

    if(history.replaceState) {
      history.replaceState(window.history.state, window.title, window.location.href)
		}

		// Handle browser back button
		window.addEventListener("popstate", (e) => {
			if(e.state) {
        let wasDefaultPrevented = false
        e.preventDefault = () => {
          wasDefaultPrevented = true
        }
        this.emit(this.EVENTS.XHR_POP_STATE, e)
        if(!wasDefaultPrevented) {
  				this.goToURL(window.location.href, true)
        }
      }
		})

	}

	handleXHRLinks(targetEl) {

		targetEl = $(targetEl || document.body)

    const baseURL = window.location.origin

		targetEl.find("a").each((index, el) => {
			var linkEl = $(el)
			if(linkEl.data('prevent-xhr') || linkEl.data('xhr-event-added')) return
			if(linkEl.attr('target')) return

			if(linkEl.parents("#wpadminbar").length || linkEl.parents("[data-prevent-xhr]").length) return

			// Ensure the URL is usable
			var url = el.href
			if(url.indexOf(baseURL) !== 0) {
				// Link is not on this site
				return
			}
      if(url.match(/(wp-admin|wp-login)/g)) {
        // A bit too wordpressy
        return
      }
			if(url.match(/\.[a-z]$/i) || url.match(/(mailto|tel):/i)) {
				// Link is a file
				return
			}
			if(url.match(/\#/)) {
				// link contains a hashbang
				return
			}

      if (this.xhrOptions.cachePages) {
        if (!linkEl.data('no-preload') && linkEl.parents('[data-no-preload]').length === 0) {
    			this.pagePreloadQueue.push(el.href)
    			this.preloadPages()
        }
      }

			linkEl.click((e) => {
				if(!e.metaKey && !e.ctrlKey) {
					this.emit(this.EVENTS.XHR_LINK_CLICK, e, $(linkEl))
          // A dev can use e.preventDefault() to also prevent any XHR transitions!
          if(!e.isDefaultPrevented()) {
            e.preventDefault()
            if (!this.clickingDisabled) {
    					this.goToURL(el.href)
            }
          }
				}
			})

		})

	}

  disableClickingFor (duration) {
    if (this.clickingDisabled) {
      duration = Math.max(this.clickingDisabled, duration)
    }
    this.clickingDisabled = duration
    clearTimeout(this.disabledClickTimer)
    this.disabledClickTimer = setTimeout(() => {
      this.clickingDisabled = false
    }, duration)
  }

	callAPI(method, args, callback) {

		if(args instanceof Function) {
			callback = args
			args = null
		}

		return new Promise((resolve, reject) => {
      $.ajax({
  			method: 'post',
  			url: "/json-api/"+method,
  			data: JSON.stringify(args),
  			dataType: "json",
  			success: (response) => {
  				if (callback) callback(response.error, response.result)
          if (response.error) {
            reject(response.error)
          } else {
            resolve(response.result)
          }
  			},
  			error: (jqXHR, textStatus, errorThrown) => {
  				var message = ""
  				if(textStatus && XHRErrorCodes[textStatus]) {
  					message = XHRErrorCodes[textStatus]
  				} else {
  					message = "Server error occurred while making API request"
  				}
  				if(errorThrown && message) {
  					message += ": "+errorThrown
  				}
          if (callback) {
    				callback({
    					code: textStatus || errorThrown,
    					message: message,
    					info: null
    				}, null)
          }
          reject({
            code: textStatus || errorThrown,
            message: message,
            info: null
          })
  			}
  		})
    })
  }


}

const XHRErrorCodes = {
  "timeout": "Timed out while making API request",
  "abort": "XHR request was aborted",
  "error": "XHR request encountered an error",
  "parsererror": "Unable to parse API request"
}

const baseWidget = {
  debounce(callback, time, name) {

    var self = this

    name = name || '_'

    self._scheduledTimers = self._scheduledTimers || {}

    clearTimeout(this._scheduledTimers[name])

    this._scheduledTimers[name] = setTimeout(() => {
      callback.call(this)
    }, time)

  },
  throttle(callback, time, name, val) {

    var self = this
    name = name || '_'

    self._throttled = self._throttled || {}
    self._scheduledTimers = self._scheduledTimers || {}

    if(self._throttled[name] === undefined) {
      clearTimeout(this._scheduledTimers[name])
      this._scheduledTimers[name] = setTimeout(() => {
        this._scheduledTimers[name] = null
        self._throttled[name] = undefined
      }, time)
      self._throttled[name] = val
      callback()
    }

  },
  afterInit(callback) {
    $(document).bind('afterWidgetsInit.'+this.uuid, () => {
      callback.call(this)
      $(document).unbind('afterWidgetsInit.'+this.uuid)
    })
  },
  instance() {
    return this
  }
}

module.exports = Site;