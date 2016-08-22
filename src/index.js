const jQuery = require("jquery");
const $ = jQuery;
window.jQuery = $;
window.$ = $;
require("jquery-ui/ui/version");
require("jquery-ui/ui/keycode");
require("jquery-ui/ui/widget");

const baseWidget = {
  debounce: function(callback, time, name) {
    
    var self = this;
    
    name = name || '_';
    
    self._scheduledTimers = self._scheduledTimers || {};
    
    clearTimeout(this._scheduledTimers[name]);
    
    this._scheduledTimers[name] = setTimeout(function() {
      callback.call(self);
    }, time);
    
  },
  throttle: function(callback, time, name, val) {
    
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
  afterInit: function(callback) {
    var self = this;
    $(document).bind('afterWidgetsInit.'+this.uuid, function() {
      callback.call(self);
      $(document).unbind('afterWidgetsInit.'+self.uuid);
    });
  },
  instance: function() {
    return this;
  }
};

class Site {
  
  constructor() {
    
    console.log("Hey");
    
    // Init dev mode
    this.initLiveReload();
    
    this.components = {};
    
    // Wait for DOM load
    $(() => this.domReady());
  }
  
  domReady() {
    
    this.initWidgets();
    
  }
  
  initLiveReload() {
    
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
    
    $(document).trigger('afterWidgetsInit');
    
  }
  
  widget(name, def) {
    if(name.indexOf('.') === -1) {
      name = 'ui.'+name;
    }
    $.widget(name, $.extend({}, baseWidget, def));
  }
  
}

module.exports = new Site();