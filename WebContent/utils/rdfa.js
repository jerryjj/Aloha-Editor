/*!
* Aloha Editor
* Author & Copyright (c) 2010 IKS
* jerry.jalava@infigo.fi
* Licensed under the terms of http://www.aloha-editor.com/license.html
*/
if (typeof eu == 'undefined' || !eu) {
	var eu = {};
}

if (typeof eu.iksproject == 'undefined' || !eu.iksproject) {
	eu.iksproject = {};
}

if (typeof eu.iksproject.Utils == 'undefined' || !eu.iksproject.Utils) {
	eu.iksproject.Utils = {};
}

if (typeof eu.iksproject.Utils.RDFa == 'undefined' || !eu.iksproject.Utils.RDFa) {
	/**
	 * @namespace eu.iksproject.Utils
	 * @class RDFa provides methods to get information about RDFa in DOM and to manipulate it
	 * @singleton
	 */
	eu.iksproject.Utils.RDFa = function () {};
}

eu.iksproject.Utils.RDFa.prototype.namespaceHandlers = {};

eu.iksproject.Utils.RDFa.prototype.generateRandomNamespacePrefix = function(className) {
    var seed = Math.floor(Math.random()*1000) + Math.floor(new Date().getTime() / 1000);
    return seed + '_' + className;
};

/**
 * Plugins should register all RFDa namespaces and its classes that they support.
 *
 * @namespace eu.iksproject.Utils
 * @param {String} pluginName Name of the plugin
 * @param {String} namespace Namespace which the plugin can handle
 * @param {Array} classes List of classes from the namespace which the plugin can handle
 */
eu.iksproject.Utils.RDFa.prototype.registerNamespaceHandler = function(pluginName, namespace, classes) {
    if (typeof this.namespaceHandlers[namespace] == 'undefined') {
        this.namespaceHandlers[namespace] = {};
    }
    
    if (! (classes instanceof Array)) {
        classes = [classes];
    }
    
    for (var i=0; i<classes.length; i++) {
        this.namespaceHandlers[namespace][classes[i]] = pluginName;
    }
};

/**
 * Returns assocative array of all the classes and their handler plugin names
 * that have been registered.
 *
 * @param {String} namespace Namespace
 */
eu.iksproject.Utils.RDFa.prototype.getClassesForNamespace = function(namespace) {
    if (typeof this.namespaceHandlers[namespace] == 'undefined') {
        return false;
    }
    
    return this.namespaceHandlers[namespace];
};

/**
 * Returns plugin instance by the given namespace and classname.
 *
 * @param {String} namespace Namespace
 * @param {String} className Name of the class
 * @return {Plugin} instance of the registered plugin
 */
eu.iksproject.Utils.RDFa.prototype.getHandlerForClass = function(namespace, className) {
    if (typeof this.namespaceHandlers[namespace] == 'undefined') {
        return false;
    }
    
    return GENTICS.Aloha.PluginRegistry.getInstance(this.namespaceHandlers[namespace][className]);
};

eu.iksproject.Utils.RDFa.prototype.readElementFrom = function(html) {
    html = jQuery(html);
    var data = html.data();
    
    var properties = jQuery("[property*='']", html);
    
    var el = new eu.iksproject.Utils.RDFa.Element(data.ns, data.classname, data.opts);    
    
    var pdata = null;
    var value = null;
    properties.each(function() {
        pdata = jQuery(this).data();
        if (pdata.opts.visible) {
            value = jQuery(this).text();
        } else {
            value = jQuery(this).attr('content');
        }
        
        el.addProperty(pdata.name, pdata.opts, value);
    });
    
    return el;
};

/**
 * Element representing RDFa object
 *
 * @class Element
 * @namespace eu.iksproject.Utils.RDFa
 * @param {String} namespace Namespace
 * @param {String} className Name of the class
 * @param {Object} opts Overriding options
 */
eu.iksproject.Utils.RDFa.prototype.Element = function (namespace, className, opts) {
    this.options = jQuery.extend({}, {
        'shortHandle': null,
        'elementName': 'span'
    }, opts || {});
    this.properties = {};
    
    if (this.options.shortHandle == null) {
        this.options.shortHandle = eu.iksproject.Utils.RDFa.generateRandomNamespacePrefix(className);
    }
    
    this.elementCreated = false;
    
    this.namespace = namespace;
    this.classname = className;
    this.nsPrefix = 'xmlns:' + this.options.shortHandle;
    this.shortHandlePrefix = this.options.shortHandle + ':';
    
    this.readElement();
    //this.createElement(true);
};

eu.iksproject.Utils.RDFa.prototype.Element.prototype.readElement = function() {
    var existing = jQuery(this.options.elementName + '[typeof="' + this.shortHandlePrefix + this.classname + '"]');    
    if (existing.length) {
        this.element = existing;
        this.elementCreated = true;
    }
};

eu.iksproject.Utils.RDFa.prototype.Element.prototype.createElement = function(withoutChildren) {
    if (typeof withoutChildren == "undefined") {
        withoutChildren = false;
    }
    
    if (! this.elementCreated) {
        this.element = jQuery('<' + this.options.elementName + '/>');

        this.attrs = {};
        this.attrs[this.nsPrefix] = this.namespace;
        this.attrs['typeof'] = this.shortHandlePrefix + this.classname;

        this.element.attr(this.attrs);
    }
    
    this.element.data({
        ns: this.namespace,
        classname: this.classname,
        opts: this.options
    });
    
    this.elementCreated = true;
    
    if (! withoutChildren) {
        var self = this;
        jQuery.each(this.properties, function(name, property) {
            self.properties[name].createElement();
        });
    }
};

eu.iksproject.Utils.RDFa.prototype.Element.prototype.getElement = function(withoutChildren) {
    if (typeof withoutChildren == "undefined") {
        withoutChildren = false;
    }
    
    this.createElement(withoutChildren);
    
    var rootElement = this.element;
    
    if (withoutChildren) {
        return rootElement;
    }
    
    return rootElement;
};

eu.iksproject.Utils.RDFa.prototype.Element.prototype.addProperty = function(propertyName, opts, value) {
    if (typeof this.properties[propertyName] != "undefined") {
        this.properties[propertyName].update(value, opts);
        
        return;
    }
    
    this.properties[propertyName] = new eu.iksproject.Utils.RDFa.ElementProperty(this, propertyName, opts, value);
};

eu.iksproject.Utils.RDFa.prototype.Element.prototype.getProperty = function(propertyName) {
    if (typeof this.properties[propertyName] == "undefined") {        
        return;
    }
    
    return this.properties[propertyName];
};

/**
 * ElementProperty representing RDFa object property
 *
 * @class ElementProperty
 * @namespace eu.iksproject.Utils.RDFa
 * @param {eu.iksproject.Utils.RDFa.Element} parentElement Element that this property belongs to
 * @param {String} propertyName Name of the property
 * @param {Mixed} value Value of the property
 * @param {Object} opts Overriding options
 */
eu.iksproject.Utils.RDFa.prototype.ElementProperty = function(parentElement, propertyName, opts, value) {
    this.options = jQuery.extend({}, {
        'elementName': 'span',
        'visible': false,
        'namespace': null,
    }, opts || {});
    
    if (this.options.namespace != null && typeof this.options.shortHandle == "undefined") {
        this.options.shortHandle = this.options.namespace + '_NS';
    }
    
    this.elementCreated = false;
    
    this.parent = parentElement;
    this.name = propertyName;
    this.value = value;
    
    this.readElement();
    //this.createElement();
};

eu.iksproject.Utils.RDFa.prototype.ElementProperty.prototype.readElement = function() {
    var existing = jQuery(this.options.elementName + '[property="'+this.parent.shortHandlePrefix + this.name+'"]', this.parent.element);
    if (existing.length) {
        this.element = existing;
        this.elementCreated = true;
    }
};

eu.iksproject.Utils.RDFa.prototype.ElementProperty.prototype.update = function(value, opts) {
    this.options = jQuery.extend(this.options, opts || {});
    this.value = value;
    
    this.createElement();
};

eu.iksproject.Utils.RDFa.prototype.ElementProperty.prototype.createElement = function() {
    if (! this.elementCreated) {
        this.element = jQuery('<' + this.options.elementName + '/>');
        
        this.attrs = {};

        var shorthandlePrefix = this.parent.shortHandlePrefix;

        if (this.options.namespace != null) {
            if (typeof this.options.shortHandle != "undefined") {
                shortHandlePrefix = this.options.shortHandle;
            }

            this.attrs['xmlns:' + shortHandlePrefix] = this.options.namespace;
        }

        this.attrs['property'] = shorthandlePrefix + this.name;
        this.attrs['content'] = '';
        
        this.element.attr(this.attrs);
        
        this.element.appendTo(this.parent.element);
        
        this.elementCreated = true;
    }
    
    this.element.attr('content', '');
    this.element.html('');
    
    if (this.value) {
        if (! this.options.visible) {
            this.element.attr('content', this.value);
        } else {
            this.element.removeAttr('content');
            this.element.html(this.value);
        }
    }
    
    this.element.data({
        name: this.name,
        opts: this.options
    });
};

eu.iksproject.Utils.RDFa.prototype.ElementProperty.prototype.getElement = function() {
    if (! this.elementCreated) {
        this.createElement();
    }
    
    return this.element;
};

eu.iksproject.Utils.RDFa.prototype.ElementProperty.prototype.getElementTree = function() {
    if (! this.elementCreated) {
        this.createElement();
    }
    
    var tree = this.parent.getElement(false);
    
    this.element.appendTo(tree);
    
    return tree;
};

/**
 * Create the singleton object
 * @hide
 */
eu.iksproject.Utils.RDFa = new eu.iksproject.Utils.RDFa();