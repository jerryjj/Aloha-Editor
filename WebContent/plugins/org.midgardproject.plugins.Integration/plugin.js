/*!
* Aloha Editor Midgard integration
* Author & Copyright (c) 2010 The Midgard Project
* dev@lists.midgard-project.org
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/
/**
 * @author bergie
 */
if (typeof org == 'undefined') {
    var org = {};

    if (typeof org.midgardproject == 'undefined') {
        org.midgardproject = {};
    }
}

org.midgardproject.IntegrationPlugin = new GENTICS.Aloha.Plugin('org.midgardproject.plugins.Integration');

/**
 * Configure the available languages
 */
org.midgardproject.IntegrationPlugin.languages = ['en'];

/**
 * Holder for Midgard objects (array indexed by GUID) that have been made editable on the page
 */
org.midgardproject.IntegrationPlugin.objects = {};

/**
 * Initialize the plugin and set initialize flag on true
 */
org.midgardproject.IntegrationPlugin.init = function () {

    // remember refernce to this class for callback
    var that = this;
    
    // create save button to ribbon
    var saveButton = new GENTICS.Aloha.ui.Button({
        label : this.i18n('save'),
        onclick : function() {
            that.save();
        }
    });
        
    // add button to ribbon
    GENTICS.Aloha.Ribbon.addButton(saveButton);

    //jQuery.xmlns.mgd = "http://www.midgard-project.org/midgard2/9.03";

    var objectcontainers = jQuery('[mgd\\:guid]');
    jQuery.each(objectcontainers, function(index, objectinstance)
    {
        var objectinstance = jQuery(objectinstance);
        var children = jQuery('*', objectinstance).filter(function() {
            return jQuery(this).attr('mgd:property'); 
        });
        var guid = objectinstance.attr('mgd:guid');
        var type = objectinstance.attr('mgd:type');
        
        if (typeof org.midgardproject.IntegrationPlugin.objects[guid] == "undefined") {
            org.midgardproject.IntegrationPlugin.objects[guid] = {};
        }

        org.midgardproject.IntegrationPlugin.objects[guid].type = type;
        org.midgardproject.IntegrationPlugin.objects[guid].element = objectinstance;
        org.midgardproject.IntegrationPlugin.objects[guid].properties = {};

        jQuery.each(children, function(index, childinstance)
        {
            var childinstance = jQuery(childinstance);
            var propertyName = childinstance.attr('mgd:property');
            org.midgardproject.IntegrationPlugin.objects[guid].properties[propertyName] = new GENTICS.Aloha.Editable(childinstance);
            childinstance.org_midgardproject_integration_guid = guid;
        });
    });
};

/**
 * collect data and save 
 */
org.midgardproject.IntegrationPlugin.save = function () {

    // iterate all Midgard objects which have been made Aloha editable
    jQuery.each(org.midgardproject.IntegrationPlugin.objects, function(index, midgardObject) {
        var guid = index;
        var type = midgardObject.type;
        var propertyContents = {};
        jQuery.each(midgardObject.properties, function(index, alohaInstance) {
            propertyContents[index] = alohaInstance.getContents();
        });

        // Send the edited fields to the form handler backend
        var url = '/mgd:admin/object/update/' + type + '/' + guid + '/json';
        jQuery.ajax({url: url, dataType: 'json', data: propertyContents, type: 'POST'});
    });
} ;
