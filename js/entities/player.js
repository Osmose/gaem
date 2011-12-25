define(['underscore'], function(_) {
    function Player(engine, options) {
        this.eng = engine;

        _.defaults(options, {
            x: 0,
            y: 0,
            tiles: null
        });
        _.extend(this, options);
    }

    Player.prototype.render = function(ctx) {
        if (this.tiles !== null) {
            this.tiles.drawTile(ctx, 0, this.x - 8, this.y - 8);
        }
    };

    Player.prototype.tick = function() {
        var kb = this.eng.kb;

        if (kb.keys[kb.RIGHT]) this.x += 2;
        if (kb.keys[kb.LEFT]) this.x -= 2;
        if (kb.keys[kb.DOWN]) this.y += 2;
        if (kb.keys[kb.UP]) this.y -= 2;
    };

    return Player;
});
