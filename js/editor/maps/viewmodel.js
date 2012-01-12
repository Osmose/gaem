define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout'),

        loader = require('core/loader'),

        maps_general = require('text!./general.html'),
        maps_tiles = require('text!./tiles.html');

    function MapsViewModel(editor) {
        var self = this;
        this.editor = editor;
        this.map = ko.observable();

        this.workspace = {
            tabs: [
                {name: 'General', anchor: 'maps-general',
                 content: maps_general},
                {name: 'Tiles', anchor: 'maps-tiles',
                 content: maps_tiles}
            ]
        };

        // Tilemap Editor
        this.tileset_img = ko.computed(function() {
            return self.map() ? loader.get(self.map().tileset()).img : undefined;
        });
    }

    return MapsViewModel;
});
