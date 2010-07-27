if (typeof eu == "undefined") {
    var eu = {};
    
    if (typeof eu.iksproject == "undefined") {
        eu.iksproject = {};
    }
}

eu.iksproject.PersonPlugin = new GENTICS.Aloha.Plugin('eu.iksproject.plugins.Person');
eu.iksproject.LoaderPlugin.loadAsset('eu.iksproject.plugins.Person', 'person', 'css');

eu.iksproject.PersonPlugin.languages = ['en', 'fi'];

eu.iksproject.Utils.RDFa.registerNamespaceHandler(
    'eu.iksproject.plugins.Person', // pluginPrefix
    'http://rdf.data-vocabulary.org/#', // namespace
    ['Person'] // Supported classes from the namespace
);

eu.iksproject.PersonPlugin.activeElement = null;

/**
 * Initialize the plugin, register the buttons
 */
eu.iksproject.PersonPlugin.init = function() {
	var that = this;
	
	eu.iksproject.PersonPlugin.usedProperties = {
        'name': {
            'elementOptions': {visible: true},
            'form': {
                'label': GENTICS.Aloha.i18n(eu.iksproject.PersonPlugin, 'property.name'),
            }
        },
        'nickname': {
            'form': {
                'label': GENTICS.Aloha.i18n(eu.iksproject.PersonPlugin, 'property.nickname'),
            }
        },
        'url': {
            'form': {
                'label': GENTICS.Aloha.i18n(eu.iksproject.PersonPlugin, 'property.url'),
            }
        }
    };
	
	this.initButtons();
	this.initPanel();
};

/**
 * Expose a nice name for the Plugin
 * @hide
 */
eu.iksproject.PersonPlugin.toString = function() {
	return "eu.iksproject.plugins.Person";
};

eu.iksproject.PersonPlugin.initButtons = function() {
    var that = this;
    
    var personRDFaElement = new eu.iksproject.Utils.RDFa.Element('http://rdf.data-vocabulary.org/#', 'Person');
    
	// the 'create person' button
	this.createPersonButton = new GENTICS.Aloha.ui.Button({
		'iconClass' : 'GENTICS_button GENTICS_button_addPerson',
		'size' : 'small',
		'tooltip' : this.i18n('button.person.tooltip'),
		'markupWrapper': personRDFaElement.getElement(true),
		'onclick' : function (element, event) {
			if (GENTICS.Aloha.activeEditable) {
				GENTICS.Aloha.activeEditable.obj[0].focus();
			}
			
			var rangeObject = GENTICS.Aloha.Selection.rangeObject;
            
            var personRDFaElement = new eu.iksproject.Utils.RDFa.Element('http://rdf.data-vocabulary.org/#', 'Person');
            jQuery.each(eu.iksproject.PersonPlugin.usedProperties, function(name, data) {
                personRDFaElement.addProperty(name, data.elementOptions);
            });
            
			// add the markup
			GENTICS.Utils.Dom.addMarkup(rangeObject, personRDFaElement.getElement());
			//GENTICS.Utils.Dom.addMarkup(rangeObject, personRDFaElement.getProperty('name').getElementTree()); //this is the same thing
            
			// select the modified range
			rangeObject.select();
			return false;
		}
	});

	// add to floating menu
	GENTICS.Aloha.FloatingMenu.addButton(
		'GENTICS.Aloha.continuoustext',
		this.createPersonButton,
		this.i18n('tab.annotations'),
		1
	);
	
	// add the event handler for selection change
	GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'selectionChanged', function(event, rangeObject) {
		// iterate over all buttons
		for (var i = 0; i < rangeObject.markupEffectiveAtStart.length; i++) {
			var effectiveMarkup = rangeObject.markupEffectiveAtStart[i];
			if (! jQuery(effectiveMarkup).attr('typeof')) {
			    continue;
		    }
		    
			if (GENTICS.Aloha.Selection.standardTextLevelSemanticsComparator(effectiveMarkup, that.createPersonButton.markupWrapper)) {
                that.showPanel(effectiveMarkup);
                var panelActive = true;
		    }
		}
		
		if (! panelActive) {
		    that.hidePanel();
		}
	});
};

eu.iksproject.PersonPlugin.initPanel = function () {
	var that = this;
    
    var form_items = [];
    var item = null;    
    jQuery.each(eu.iksproject.PersonPlugin.usedProperties, function(name, data) {
        edit_item = {
            name: name,
            fieldLabel: data.form.label
        };
        form_items.push(edit_item);
        
        visibility_item = {
            name: name + '_visibility',
            fieldLabel: that.i18n('form.visibility'),
            xtype: 'checkbox'
        };
        form_items.push(visibility_item);
    });
    
    this.propertyFormPanel = new Ext.FormPanel({
		labelWidth: 75,
        frame: true,
        title: this.i18n('button.person.tooltip'),
        bodyStyle: 'padding:5px 5px 0',
        width: 350,
        defaults: {width: 230},
        defaultType: 'textfield',
        items: form_items
	});
    
    var submit = this.propertyFormPanel.addButton({
            text: 'Save',
            handler: function(){
                var rdfaEl = eu.iksproject.PersonPlugin.activeElement;
                var form = that.propertyFormPanel.getForm();
                var opts = {};
                            
                jQuery.each(rdfaEl.properties, function(name, property) {
                    opts = {
                        visible: form.findField(name + '_visibility').getValue()
                    };
                    eu.iksproject.PersonPlugin.activeElement.getProperty(name).update(form.findField(name).getValue(), opts);
                });
            }
        });
    
    this.panel = new Ext.Window({
        resizable: false,
        closable:false,
        x: 10,
        items : this.propertyFormPanel
    });

    this.panel.render(document.body);
};

eu.iksproject.PersonPlugin.showPanel = function(effectiveMarkup) {
    var personRDFaElement = eu.iksproject.Utils.RDFa.readElementFrom(effectiveMarkup);
    
    var form = this.propertyFormPanel.getForm();
    
    jQuery.each(personRDFaElement.properties, function(name, property) {
        if (form.findField(name)) {
            form.findField(name).setValue(property.value);
            form.findField(name + '_visibility').setValue(property.options.visible);            
        }
    });
    
    eu.iksproject.PersonPlugin.activeElement = personRDFaElement;
    
    this.panel.show();
};

eu.iksproject.PersonPlugin.hidePanel = function() {
    eu.iksproject.PersonPlugin.activeElement = null;
    
    this.panel.hide();
};
