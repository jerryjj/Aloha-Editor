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

/**
 * Initialize the plugin, register the buttons
 */
eu.iksproject.PersonPlugin.init = function() {
	var that = this;
	
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
	// the 'create person' button
	this.createPersonButton = new GENTICS.Aloha.ui.Button({
		'iconClass' : 'GENTICS_button GENTICS_button_addPerson',
		'size' : 'small',
		'tooltip' : this.i18n('button.person.tooltip'),
		'onclick' : function (element, event) {
			if (GENTICS.Aloha.activeEditable) {
				GENTICS.Aloha.activeEditable.obj[0].focus();
			}
			
			var markup = new eu.iksproject.Utils.RDFa.Element('http://rdf.data-vocabulary.org/#', 'Person', {'shortHandle': 'v'});
			markup.addProperty('name');
			markup.addProperty('url');
			
			var rangeObject = GENTICS.Aloha.Selection.rangeObject;
            
			// add the markup
			GENTICS.Utils.Dom.addMarkup(rangeObject, markup.getElement());
			//GENTICS.Utils.Dom.addMarkup(rangeObject, markup.getProperty('name').getElementTree()); //this is the same thing
            
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
};

eu.iksproject.PersonPlugin.initPanel = function () {
	var that = this;

	this.panel = new Ext.Window({
		items : new Ext.FormPanel({
			labelWidth: 75,
	        frame:true,
	        title: 'Simple Form',
	        bodyStyle:'padding:5px 5px 0',
	        width: 350,
	        defaults: {width: 230},
	        defaultType: 'textfield',
	        items: [{
                fieldLabel: 'Name',
                name: 'name',
            },{
                fieldLabel: 'Nickname',
                name: 'nickname'
            },{
                fieldLabel: 'URL',
                name: 'url'
            }
        ]
		}),
		buttons: [{
            text:'Submit',
            handler : function () {
				
			}
        },{
            text: 'Close',
            handler: function(){
                that.panel.hide();
            }
        }]
	});

    this.panel.render(document.body);
    this.panel.show();
};
