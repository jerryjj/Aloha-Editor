/*!
* Aloha Editor
* Author & Copyright (c) 2010 Gentics Software GmbH
* aloha-sales@gentics.com
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/
/**
 * Plugin Registry
 * @namespace GENTICS.Aloha
 * @class PluginRegistry
 * @singleton
 */
GENTICS.Aloha.PluginRegistry = function() {
	this.plugins = new Array();
};

/**
 * Register a plugin
 * @param {Plugin} plugin plugin to register
 */
GENTICS.Aloha.PluginRegistry.prototype.register = function(plugin) {
	if (plugin instanceof GENTICS.Aloha.Plugin) {
		// TODO check for duplicate plugin prefixes
		this.plugins.push(plugin);
	}
};

/**
 * Get Plugin instance by pluginPrefix
 * @param {String} pluginPrefix unique plugin prefix
 * @return {Plugin} registered plugin
 */
GENTICS.Aloha.PluginRegistry.prototype.getInstance = function(pluginPrefix) {
    for (var i=0; i<this.plugins.length;i++) {
        if (this.plugins[i].toString() == pluginPrefix) {
            return this.plugins[i];
        }
    }
    
    return false;
};

/**
 * Initialize all registered plugins
 * @return void
 * @hide
 */
GENTICS.Aloha.PluginRegistry.prototype.init = function() {
	// iterate through all registered plugins
	for ( var i = 0; i < this.plugins.length; i++) {
		var plugin = this.plugins[i];

		// get the plugin settings
		if (GENTICS.Aloha.settings.plugins == undefined) {
			GENTICS.Aloha.settings.plugins = {};
		}
		
		plugin.settings = GENTICS.Aloha.settings.plugins[plugin.prefix];
		
		if (plugin.settings == undefined) {
			plugin.settings = {};
		}
		
		if (plugin.settings.enabled == undefined) {
			plugin.settings.enabled = true;
		}

		// initialize i18n for the plugin
		// determine the actual language
		var actualLanguage = plugin.languages ? GENTICS.Aloha.getLanguage(GENTICS.Aloha.settings.i18n.current, plugin.languages) : null;

		if (!actualLanguage) {
			GENTICS.Aloha.Log.warn(this, 'Could not determine actual language, no languages available for plugin ' + plugin);
		} else {
			// load the dictionary file for the actual language
			var fileUrl = GENTICS.Aloha.settings.base + 'plugins/' + plugin.basePath + '/i18n/' + actualLanguage + '.dict';
			GENTICS.Aloha.loadI18nFile(fileUrl, plugin);
		}

		if (plugin.settings.enabled == true) {
			// initialize the plugin
			this.plugins[i].init();
		}
	}
};

/**
 * Pass the given jQuery object, which represents an editable to all plugins, so that they can make the content clean (prepare for saving)
 * @param obj jQuery object representing an editable
 * @return void
 * @hide
 */
GENTICS.Aloha.PluginRegistry.prototype.makeClean = function(obj) {
	// iterate through all registered plugins
	for ( var i = 0; i < this.plugins.length; i++) {
		var plugin = this.plugins[i];
		if (GENTICS.Aloha.Log.isDebugEnabled()) {
			GENTICS.Aloha.Log.debug(this, "Passing contents of HTML Element with id { " + obj.attr("id") + " } for cleaning to plugin { " + plugin.prefix + " }");
		}
		plugin.makeClean(obj);
	}
};

/**
 * Create the PluginRegistry object
 * @hide
 */
GENTICS.Aloha.PluginRegistry = new GENTICS.Aloha.PluginRegistry();

/**
 * Expose a nice name for the PluginRegistry
 * @hide
 */
GENTICS.Aloha.PluginRegistry.toString = function() {
	return "com.gentics.aloha.PluginRegistry";
};

/**
 * Abstract Plugin Object
 * @namespace GENTICS.Aloha
 * @class Plugin
 * @constructor
 * @param {String} pluginPrefix unique plugin prefix
 * @param {String} basePath (optional) basepath of the plugin (relative to 'plugins' folder). If not given, the basePath pluginPrefix is taken
 */
GENTICS.Aloha.Plugin = function(pluginPrefix, basePath) {
	/**
	 * Settings of the plugin
	 */
	this.prefix = pluginPrefix;
	this.basePath = basePath ? basePath : pluginPrefix;
	GENTICS.Aloha.PluginRegistry.register(this);
};

/**
 * contains the plugin's settings object
 * @cfg {Object} settings the plugins settings stored in an object
 */
GENTICS.Aloha.Plugin.prototype.settings = null;

/**
 * Init method of the plugin. Called from Aloha Core to initialize this plugin
 * @return void
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.init = function() {};

/**
 * Make the given jQuery object (representing an editable) clean for saving
 * @param obj jQuery object to make clean
 * @return void
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.makeClean = function (obj) {};

/**
 * Make a system-wide unique id out of a plugin-wide unique id by prefixing it with the plugin prefix
 * @param id plugin-wide unique id
 * @return system-wide unique id
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.getUID = function(id) {
	return this.prefix + "." + id;
};

/**
 * Localize the given key for the plugin.
 * @param key key to be localized
 * @param replacements array of replacement strings
 * @return localized string
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.i18n = function(key, replacements) {
	return GENTICS.Aloha.i18n(this, key, replacements);
};

/**
 * Return string representation of the plugin, which is the prefix
 * @return prefix
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.toString = function() {
	return this.prefix;
};

/**
 * Log a plugin message to the logger
 * @param level log level
 * @param message log message
 * @return void
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.log = function (level, message) {
	GENTICS.Aloha.Log.log(level, this, message);
};
