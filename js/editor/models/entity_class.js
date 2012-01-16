define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout'),

        loader = require('core/loader');

    // Model for entity class
    function EntityClass(id, data) {
        var self = this;
        _.extend(this, {
            id: ko.observable(id),
            tileset_id: ko.observable(data.tileset_id),
            sprite_id: ko.observable(data.sprite_id),
            bounding_box: ko.observableObject(data.bounding_box),
            sprites: ko.observableObject(data.sprites),
            handlers: ko.observableObject(data.handlers)
        });

        this.icon = ko.computed(function() {
            var tileset = loader.get(self.tileset_id()),
                tilenum = self.sprites.get(self.sprite_id());

            // Pick first frame of animation if needed.
            if (_.isArray(tilenum)) {
                tilenum = tilenum[0];
            }

            return tileset.getTileCanvas(tilenum);
        });
    }

    _.extend(EntityClass.prototype, {
        // Convert entity to a plain object. Avoids elements that cause errors
        // or are unneeded, like `icon`.
        toJS: function() {
            return {
                tileset_id: this.tileset_id,
                sprite_id: this.sprite_id,
                bounding_box: this.bounding_box,
                sprites: this.sprites,
                handlers: this.handlers
            };
        }
    });

    return EntityClass;
});
