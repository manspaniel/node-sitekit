const jQuery = (() => {
  let oldjQuery = window.jQuery;
  let old$ = window.$;
  let jQuery = window.jQuery = window.$ = require("jquery");
  require("jquery-ui/ui/version");
  require("jquery-ui/ui/keycode");
  require("jquery-ui/ui/widget");
  window.jQuery = oldjQuery;
  window.$ = old$;
  return jQuery;
})();
const $ = jQuery;
const EventEmitter = require('events').EventEmitter;

class Site extends EventEmitter {
  
  constructor() {
    
    super();
    
    this.$ = jQuery;
    this.preloadedImages = [];
    
    this.pageCache = {};
    this.preloadedPages = {};

    this.pagePreloadQueue = [];
    this.isPreloadingPages = false;
    
    this.XHRRequestCounter = 0;
    
    this.xhrOptions = {
  		scrollAnimation: {
  			duration: 400
  		},
      xhrEnabled: true,
  		loadImages: true,
  		imageLoadTimeout: 3000,
  		widgetTransitionDelay: 0,
  		cachePages: false,
  		swapContent: (container, originalContent, newContent, direction) => {
  			
  			var duration = this.xhrOptions.widgetTransitionDelay || 500;
  			
  			// Fade out old content
  			originalContent.fadeOut({
  				duration: duration/2,
  				complete: function() {
  					
  					// Not forgetting to remove the old content
  					originalContent.remove();
  					
  					// Fade in new content
  					newContent.css({
  						display: 'inline',
  						opacity: 0
  					}).animate({
  						opacity: 1
  					}, {
  						duration: duration/2
  					});
  					
  				}
  			});
  			
  		},
  		filterBodyClasses: (oldClasses, newClasses) => {
  			return newClasses;
  		}
  	};
    
    // Init dev mode
    this.initLiveReload();
    
    this.components = {};
    
    // Wait for DOM load
    jQuery(() => this.domReady());
  }
  
  domReady() {
    
    this.initWidgets();
    this.initXHRPageSystem();
    
  }
  
  initLiveReload() {
    
    return;
    
    if(navigator.appName != "Netscape" || !window.location.href.match(/(2016|ngrok)/)) {
      return false;
    }
    
    let refresh = () => history.go(0);
    
    let check = () => {
      $.ajax({
        url: '/devcheck',
        error: () => {
          // Failed, start checking again
          setTimeout(check, 1000);
        },
        success: () => {
          // We got a response
          refresh();
        }
      });
    };
    
    check();
  }
  
  setGlobalState(state, reset) {
    
    for(var k in this.components) {
      var component = this.components[k];
      if(component && component.setState) {
        if(k in state || reset !== false) {
          component.setState(state[k] || {});
        }
      }
    }
    
  }
  
  findWidgets(name, el) {
    let result = [];
    let widgets = $('[data-widget]', el || document.body).each((k, el) => {
      let widgetNames = $.data(el, 'widgetNames');
      if(widgetNames && widgetNames.indexOf(name) != -1) {
        let instance = $(el)[name]('instance');
        result.push(instance);
      }
    });
    return result;
  }
  
  findWidget(name, el) {
    let widgets = this.findWidgets(name, el);
    if(widgets && widgets.length) {
      return widgets[0];
    } else {
      return null;
    }
  }
  
  getAllWidgets(el) {
    let result = [];
    let widgets = $('[data-widget]', el || document.body);
    if(el) widgets = widgets.add(el);
    // debugger;
    widgets.each((k, el) => {
      let widgetNames = $.data(el, 'widgetNames');
      for(let k in widgetNames) {
        let instance = $(el)[widgetNames[k]]('instance');
        if(instance) {
          result.push(instance);
        }
      }
    });
    return result;
  }
  
  triggerAllWidgets(methodName, target) {
    
    let args = Array.prototype.slice.call(arguments, 2);
    
    let widgets = this.getAllWidgets(target);
    
    for(let k in widgets) {
      let widget = widgets[k];
      if(widget && methodName in widget) {
        widget[methodName].apply(widget, args);
      }
    }
    
  }
  
  getWidgetDefs(el) {
    
    el = $(el);
    
    let widgets = (el.attr('data-widget') || el.attr('data-widgets')).split(/\,\s*/g);
    let isInitialized = el.data('hasBeenInitialized');
    
    for(let k in widgets) {
      
      let widgetInfo = widgets[k].split('#');
      
      widgets[k] = {
        name: widgetInfo[0],
        identifier: widgetInfo[1],
        instance: isInitialized ? el[widgetInfo[0]]('instance') : null
      };
      
    }
    
    return widgets;
    
  }
  
  initWidgets(targetEl) {
    
    targetEl = $(targetEl || document.body);
    
    // Look for uninitialized widgets
    targetEl.find("[data-widget]").each((k, thisEl) => {
      
      // Grab the element and data
      let el = $(thisEl);
      let data = el.data();
      
      // Only initialize once
      if(data.hasBeenInitialized) return;
      
      // Prepare options
      let options = {};
      for(let k in data) {
        if(k[0] !== "_") {
          options[k] = data[k];
        }
      }
      
      let widgets = this.getWidgetDefs(el);
      let widgetNames = [];
      for(let i = 0; i < widgets.length; i++) {
        
        let widget = widgets[i];
        
        widgetNames.push(widget.name);
        
        // Throw an error if that widget doesn't exist
        if(widget.name in $.fn === false) {
          if(data.widgetOptional === true) {
            return;
          } else {
            console.error("Could not initialize widget '"+widget.name+"', as no widget with this name has been declared.");
            return;
          }
        }
        
        // Spawn the widget, and grab it's instance
        el[widget.name](options);
        let instance = el[widget.name]('instance');
        
        // Save it to the components object
        if(widget.identifier) {
          this.components[widget.identifier] = instance;
        }
        
      }
      
      // Mark as initialized
      el.data('hasBeenInitialized', true);
      $.data(thisEl, 'widgetNames', widgetNames);
      
    });
    
    this.emit('afterWidgetsInit');
    
  }
  
  widget(name, def) {
    if(name.indexOf('.') === -1) {
      name = 'ui.'+name;
    }
    $.widget(name, $.extend({}, baseWidget, def));
  }
  
	preloadImages(srcs, timeout, callback) {
		
		var images = [];
		
		var callbackCalled = false;
		var triggerCallback = () => {
			if(!callbackCalled) {
				callbackCalled = true;
				if(callback) callback();
			}
		};
		
		if(srcs.length === 0) {
			triggerCallback();
			return;
		}
		
		var loaded = (img) => {
			images.push(img);
			this.preloadedImages.push(img);
			if(images.length == srcs.length) {
				triggerCallback();
			}
		};
		
		if(timeout !== false) {
			setTimeout(() => {
				triggerCallback();
			}, timeout);
		}
    
    let preloadItem = (src) => {
      let img = $("<img>");
			
			let hasLoaded = false;
			
			img.on("load", () => {
				if(!hasLoaded) {
					loaded(img);
				}
			});
			
			img[0].src = src;
			
			if(img[0].width || img[0].naturalWidth) {
				if(!hasLoaded) {
					hasLoaded = true;
					loaded(img);
				}
			}
    };
		
    srcs.map(preloadItem);
    
	}
	
	/*
		Preloads images from the specified elements, with an optional timeout.
		Callback will be triggered when their all elements have loaded, or when the timeout (in milliseconds) is reached.
		Set timeout to false for no timeout.
		
		eg.
			Site.preloadContent(els, 5000, callback);
			Site.preloadContent(els, false, callback);
	*/
	preloadContent(els, timeout, callback) {
		
		var images = [];
		var callbackCalled = false;
		
		$(els).each((k, el) => {
			
			var self = $(el);
			
			// Get images from 'style' attribute of div elements only
			self.find("[style], .preload").each((k, el) => {
        let backgroundImage = $(el).css('backgroundImage');
				if(backgroundImage) {
					var match = backgroundImage.match(/url\((.+)\)/);
					if(match) {
						var src = match[1].replace(/(^[\'\"]|[\'\"]$)/g, '');
						images.push(src);
					}
				}
			});
			
			// Get 'src' attributes from images
			self.find("img").each((k, el) => {
				images.push(el.src);
			});
			
		});
		
		this.preloadImages(images, timeout, callback);
		
	}
	
	getURLPath(input) {
		var match = input.match(/:\/\/[^\/]+([^#?]*)/);
		if(match) {
			return match[1].replace(/\/$/, '');
		} else {
			return "";
		}
	}
	
	resizeToFit(width, height, viewportWidth, viewportHeight, cover) {
		
		var result = {};
		
		if((cover && width/height > viewportWidth/viewportHeight) || (!cover && width/height < viewportWidth/viewportHeight)) {
			result.width = viewportHeight * width/height;
			result.height = viewportHeight;
		} else {
			result.width = viewportWidth;
			result.height = viewportWidth * height/width;
		}
		
		result.top = viewportHeight/2 - result.height/2;
		result.left = viewportWidth/2 - result.width/2;
		
		return result;
		
	}
	
	forceResizeWindow() {
		window.resizeTo(window.outerWidth, window.outerHeight);
	}
  
  preloadPages() {
		if(this.isPreloadingPages) return;
		this.isPreloadingPages = true;
		
		var loadNext = () => {
			
			// Filter out pre-preloaded urls
			this.pagePreloadQueue = this.pagePreloadQueue.filter((url) => {
				return this.preloadedPages[url] ? false : true;
			});
			
			if(this.pagePreloadQueue.length === 0) {
				this.isPreloadingPages = false;
			} else {
				var url = this.pagePreloadQueue.shift();
				this.getContent(url, () => {
					setTimeout(loadNext);
				}, true);
			}
		};
		
		loadNext();
		
	}
  
  getContent(url, callback, isPreload) {
		
		url = url.replace(/\#.+/, '');
		
		if(url.indexOf('?') == -1) {
			url += "?xhr-page=true";
		} else {
			url += "&xhr-page=true";
		}
		
		// Mark as preloaded (even if it's not). It won't appear in pageCache until it's been completely loaded. This is just to prevent the page from being preloaded more than once.
		if(isPreload && this.preloadedPages[url]) {
			callback();
			return;
		}
		this.preloadedPages[url] = true;
		
		if(this.xhrOptions.cachePages && this.pageCache[url]) {
			callback(this.pageCache[url]);
		} else {
			$.ajax({
				url: url,
				async: true,
				global: !isPreload,
				success: (response, textStatus) => {
					callback(response, textStatus, null);
					if(response && this.xhrOptions.cachePages) {
						this.pageCache[url] = response;
					}
				},
				error: (jqXHR, textStatus, error) => {
					callback(jqXHR.responseText, textStatus, error);
				}
			});
		}
		
	}
	
	goToURL(url, dontPush) {
		
		var originalURL = url;
		var requestID = ++this.XHRRequestCounter;
		
		this.lastURL = url;
		
		// See if any widgets want to intercept this request instead
		var allWidgets = this.getAllWidgets();
		var urlPath = url.replace(/\#.+$/, '').match(/:\/\/[^\/]+(.*)/)
		for(var k in allWidgets) {
			var widget = allWidgets[k];
			if(widget && widget.xhrPageWillLoad) {
				var result = widget.xhrPageWillLoad(urlPath, url);
				if(result === false) {
					history.pushState({}, null, originalURL);
					return;
				}
			}
		}
		
		var htmlBody = $("html,body").stop(true).animate({scrollTop: 0}, this.xhrOptions.scrollAnimation).one('scroll', () => {
			htmlBody.stop(true);
		});
		
		this.emit("xhrLoadStart");
		
		this.getContent(originalURL, (response, textStatus) => {
			if(requestID !== this.XHRRequestCounter) {
				// Looks like another request was made after this one, so ignore the response.
				return;
			}
			this.emit("xhrTransitioningOut");
			
			// Alter the response to keep the body tag
			response = response.replace(/(<\/?)body/g, '$1bodyfake');
			response = response.replace(/(<\/?)head/g, '$1headfake');
			
			// Convert the text response to DOM structure
			var result = $("<div>"+response+"</div>");
			
			// Pull out the contents
			var foundPageContainer = result.find("[data-page-container]:first");
			
			if(foundPageContainer.length === 0) {
				// Could not find a page container element :/ just link to the page
				window.location.href = originalURL;
				console.error("Could not find an element with a `data-page-container` attribute within the fetched XHR page response. Sending user directly to the page.");
				return;
			}
			
			// Grab content
			var newContent = $("<div class='xhr-page-contents'></div>").append(foundPageContainer.children());
			
			this.emit("xhrLoadMiddle");
			
			var finalize = () => {
				this.emit("xhrLoadEnd");
				
				// Grab the page title
				var title = result.find("title").html();
				
				// Grab any resources
				var includes = result.find("headfake").find("script, link[rel=stylesheet]");
				
				// Grab the body class
				var bodyClass = result.find("bodyfake").attr('class');
				bodyClass = this.xhrOptions.filterBodyClasses(document.body.className, bodyClass);
				
				var oldPageState = this.pageState;
				this.pageState = result.find("pagestate").data('state');
				
				// Set page title
				$("head title").html(title);
				document.body.className = bodyClass + " xhr-transitioning-out";
				
				var existingScripts = $(document.head).find("script");
				var existingStylesheets = $(document.head).find("link[rel=stylesheet]");
				
				// Swap menus out
				result.find("ul.menu").each((k, item) => {
					
					var id = item.getAttribute('id');
					var el = $('#'+id).html(item.innerHTML);
					this.handleXHRLinks(el);
					
				});
				
				// Swap WP 'Edit Post' link
				var editButton = result.find("#wp-admin-bar-edit");
				if(editButton.length) {
					$("#wp-admin-bar-edit").html(editButton.html());
				}
				
				// Apply any missing scripts
				includes.each((i, el) => {
          
					if($(el).parents("[data-page-container]").length) return;
					
					if(el.tagName == "SCRIPT") {
						
						var scriptSrc = el.src.replace(/\?.*$/, '');
						var includeScript = true;
						existingScripts.each(() => {
							var elSrc = el.src.replace(/\?.*$/, '');
							if(scriptSrc == elSrc) {
								includeScript = false;
							}
						});
						
						if(includeScript) {
							$(el).appendTo(document.head);
						}
						
					} else if(el.tagName == "LINK") {
						
						var linkHref = el.href.replace(/\?.*$/, '');
						var includeStyles = true;
						existingStylesheets.each(() => {
							var elHref = el.href.replace(/\?.*$/, '');
							if(linkHref == elHref) {
								includeStyles = false;
							}
						});
						
						if(includeStyles) {
							$(el).appendTo(document.head);
						}
						
					}
					
				});
				
				// Grab old content, by wrapping it in a span
				this.XHRPageContainer.wrapInner("<div class='xhr-page-contents'></div>");
				var oldContent = this.XHRPageContainer.children().first();
				
				// Add new content to the page
				try {
					this.XHRPageContainer.append(newContent);
				} catch(e) {
					
				}
				
				newContent.hide();
				
				// Apply to history
				if(!dontPush) {
					history.pushState({}, title, originalURL);
				}
				
				// Destroy existing widgets
				var steps = [
					(next) => {
						this.transitionWidgetsOut(this.XHRPageContainer, oldPageState, this.pageState, true, next);
					},
					(next) => {
						// Set up links and widgets
						newContent.show();
						this.forceResizeWindow();
						this.initWidgets(newContent);
						this.handleXHRLinks(newContent);
						newContent.hide();
						
						// Perform the swap!
						var delay = this.xhrOptions.widgetTransitionDelay;
						delay = this.xhrOptions.swapContent(this.XHRPageContainer, oldContent, newContent, dontPush ? "back" : "forward") || delay;
						setTimeout(next, delay);
					},
					(next) => {
						this.transitionWidgetsIn(newContent, this.pageState, oldPageState, next);
					}
				];
				
				var stepIndex = 0;
				var next = () => {
					if(stepIndex < steps.length) {
						steps[stepIndex++](next);
					} else {
						this.emit("xhrPageChanged");
					}
				};
				
				next();
			
			};
			
			if(this.xhrOptions.loadImages) {
				this.preloadContent(newContent, this.xhrOptions.imageLoadTimeout, finalize);
			} else {
				finalize();
 			}
			
		});
		
	}
	
	transitionWidgetsIn(targetEl, newState, oldState, callback) {
		
		var foundTransition = false;
		var finalDelay = 0;
		
		targetEl.find("[data-widget]").each((index, el) => {
			
			el = $(el);
			var widgets = this.getWidgetDefs(el);
			
			for(var k in widgets) {
				if(widgets[k].instance && widgets[k].instance._transitionIn) {
					var delay = widgets[k].instance._transitionIn(newState, oldState, this.xhrOptions.widgetTransitionDelay);
					foundTransition = true;
					finalDelay = Math.max(delay, finalDelay);
				}
			}
			
		});
		
		if(foundTransition && finalDelay) {
			setTimeout(callback, finalDelay);
		} else if(foundTransition && !finalDelay) {
			setTimeout(callback, this.xhrOptions.widgetTransitionDelay);
		} else {
			callback();
		}
		
	}
	
	transitionWidgetsOut(targetEl, newState, oldState, destroy, callback) {
		
		var foundTransition = false;
		var finalDelay = 0;
    
    let widgets = this.getAllWidgets(targetEl);
    
    for(let widget of widgets) {
      foundTransition = true;
      if(widget._transitionOut) {
        var delay = widget._transitionOut(newState, oldState, this.xhrOptions.widgetTransitionDelay);
        finalDelay = Math.max(delay, finalDelay);
        if(destroy) {
          widget.destroy();
        }
      }
    }
		
		if(foundTransition && finalDelay) {
			setTimeout(callback, finalDelay);
		} else if(foundTransition && !finalDelay) {
			setTimeout(callback, this.xhrOptions.widgetTransitionDelay);
		} else {
			callback();
		}
		
	}
	
	initXHRPageSystem() {
    if(!this.xhrOptions.xhrEnabled) return;
		
		// Grab the page container, if one exists
		this.XHRPageContainer = $("[data-page-container]:first");
		if(this.XHRPageContainer.length === 0) {
			this.XHRPageContainer = null;
			return;
		}
		
		// Add event listeners to jQuery which will add/remove the 'xhr-loading' class
		$(document).ajaxStart(() => {
			$(document.body).addClass("xhr-loading");
			this.emit("xhrLoadingStart");
		}).ajaxStop(() => {
			$(document.body).removeClass("xhr-loading");
			this.emit("xhrLoadingStop");
		});
		
		// Add event listeners to links where appropriate
		this.handleXHRLinks();
    
    if(history.replaceState) {
      history.replaceState({}, window.title, window.location.href)
    }
		
		// Handle browser back button
		window.addEventListener("popstate", (e) => {
			if(e.state) {
        let wasDefaultPrevented = false
        e.preventDefault = () => {
          wasDefaultPrevented = true
        }
        this.emit('xhrPopState', e)
        if(!wasDefaultPrevented) {
  				this.goToURL(window.location.href, true);
        }
      }
		});
		
	}
	
	handleXHRLinks(targetEl) {
		
		targetEl = $(targetEl || document.body);
		
    const baseURL = window.location.origin;
		
		targetEl.find("a").each((index, el) => {
			var linkEl = $(el);
			if(linkEl.data('prevent-xhr') || linkEl.data('xhr-event-added')) return;
			if(linkEl.attr('target')) return;
			
			if(linkEl.parents("#wpadminbar").length || linkEl.parents("[data-prevent-xhr]").length) return;
			
			// Ensure the URL is usable
			var url = el.href;
			if(url.indexOf(baseURL) !== 0) {
				// Link is not on this site
				return;
			}
			if(url.match(/\.[a-z]$/i) || url.match(/^(mailto|tel)\:/i)) {
				// Link is a file
				return;
			}
			if(url.match(/\#/)) {
				// link contains a hashbang
				return;
			}
			
			this.pagePreloadQueue.push(el.href);
			this.preloadPages();
			
			linkEl.click((e) => {
				if(!e.metaKey && !e.ctrlKey) {
					this.emit('xhrLinkClick', e, $(linkEl));
          // A dev can use e.preventDefault() to also prevent any XHR transitions!
          if(!e.isDefaultPrevented()) {
            e.preventDefault();
  					this.goToURL(el.href);
          }
				}
			});
			
		});
		
	}
	
	callAPI(method, args, callback) {
		
		if(args instanceof Function) {
			callback = args;
			args = null;
		}
		
		$.ajax({
			method: 'post',
			url: "/json-api/"+method,
			data: JSON.stringify(args),
			dataType: "json",
			success: (response) => {
				callback(response.error, response.result);
			},
			error: (jqXHR, textStatus, errorThrown) => {
				var message = "";
				if(textStatus && XHRErrorCodes[textStatus]) {
					message = XHRErrorCodes[textStatus];
				} else {
					message = "Server error occurred while making API request";
				}
				if(errorThrown && message) {
					message += ": "+errorThrown;
				}
				callback({
					code: textStatus || errorThrown,
					message: message,
					info: null
				}, null);
			}
		});
  }
  
  
}

const XHRErrorCodes = {
  "timeout": "Timed out while making API request",
  "abort": "XHR request was aborted",
  "error": "XHR request encountered an error",
  "parsererror": "Unable to parse API request"
};

const baseWidget = {
  debounce(callback, time, name) {
    
    var self = this;
    
    name = name || '_';
    
    self._scheduledTimers = self._scheduledTimers || {};
    
    clearTimeout(this._scheduledTimers[name]);
    
    this._scheduledTimers[name] = setTimeout(() => {
      callback.call(this);
    }, time);
    
  },
  throttle(callback, time, name, val) {
    
    var self = this;
    name = name || '_';
    
    self._throttled = self._throttled || {};
    self._scheduledTimers = self._scheduledTimers || {};
    
    if(self._throttled[name] === undefined) {
      clearTimeout(this._scheduledTimers[name]);
      this._scheduledTimers[name] = setTimeout(() => {
        this._scheduledTimers[name] = null;
        self._throttled[name] = undefined;
      }, time);
      self._throttled[name] = val;
      callback();
    }
    
  },
  afterInit(callback) {
    $(document).bind('afterWidgetsInit.'+this.uuid, () => {
      callback.call(this);
      $(document).unbind('afterWidgetsInit.'+this.uuid);
    });
  },
  instance() {
    return this;
  }
};

module.exports = Site;