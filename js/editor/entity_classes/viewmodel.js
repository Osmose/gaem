define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout'),

        loader = require('core/loader'),

        ecls_general = require('text!./general.html'),
        ecls_handlers = require('text!./handlers.html');


    function EntityClassViewModel(editor) {
        var self = this;
        this.editor = editor;
        this.ecls = ko.observable();

        this.workspace = {
            tabs: [
                {name: 'General', anchor: 'ecls-general',
                 class_attr: '', content: ecls_general},
                {name: 'Handlers', anchor: 'ecls-handlers',
                 class_attr: '', content: ecls_handlers}
            ]
        };

        this.handlers = ['interact'];

        /*******
         General
         *******/
        // Icon for the current entity class.
        this.ecls_icon = ko.computed(function() {
            var ecls = self.ecls();
            if (ecls) {
                var tileset = loader.get(ecls.tileset_id()),
                    tilenum = ecls.sprites.get(ecls.sprite_id());

                // Pick first frame of animation if needed.
                if (_.isArray(tilenum)) {
                    tilenum = tilenum[0];
                }

                return tileset.getTileCanvas(tilenum);
            }

            return undefined;
        });

        /********
         Handlers
         ********/
        this.current_handler_id = ko.observable();
        this.handler_code = ko.computed({
            read: function() {
                if (self.ecls()) {
                    return self.ecls().handlers.get(self.current_handler_id());
                }

                return undefined;
            },
            write: function(value) {
                self.ecls().handlers.set(self.current_handler_id(), value);
            }
        });
    }

    return EntityClassViewModel;
});
