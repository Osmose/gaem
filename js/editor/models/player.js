define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout');

    // Model for player
    function Player(data) {
        _.extend(this, {
            start_map: ko.observable(data.start_map),
            x: ko.observable(data.x),
            y: ko.observable(data.y),
            tileset_id: data.tileset_id,
            sprite_id: data.sprite_id,
            bounding_box: data.bounding_box,
            sprites: data.sprites
        });
    }

    return Player;
});
