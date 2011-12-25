define(['underscore'], function(_) {
    function Entity(engine) {
        this.facing = Entity.DOWN;
    };

    _.extend(this.prototype, {
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3,
        UP: 4
    });

    return Entity;
});
