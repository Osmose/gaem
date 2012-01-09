define(['underscore', 'util', 'entities/entity'],
function(_, ut, Entity) {
    // An Entity defined by an "Entity class" that is
    // defined in the game data. Provides several callbacks and
    // convenience methods for typical entity behavior.
    function EntityInstance(engine, data) {
        var self = this;
        Entity.apply(this, arguments);

        _.defaults(data, {
            solid: false
        });

        this.original = {
            x: this.x,
            y: this.y
        };

        _.extend(this, {
            handlers: {}
        });

        // data.handlers holds the code for handling various events.
        _.each(data.handlers, function(code, id) {
            // Creates a new function with the arguments defined in
            // EntityInstance.handlers[id] and the body given in
            // data.handlers[id].
            var args = _.clone(EntityInstance.handlers[id]);
            args.push(code);
            self.handlers[id] = Function.apply({}, args);
        });
    }

    // Stores lists of arguments for each handler.
    EntityInstance.handlers = {};
    _.extend(EntityInstance.handlers, {
        interact: ['player'], // The player pressed 'A' while facing the entity.
        player_collision: ['player'] // Player is touching entity
    });

    _.extend(EntityInstance.prototype, Entity.prototype, {
        // Handles an event of the given type. All arguments following type
        // are passed to the handler.
        handle: function(type) {
            var handler_args = _.toArray(arguments).slice(1);
            if (type in this.handlers) {
                this.handlers[type].apply(this, handler_args);
            }
        },

        // Reset entity to original position
        reset: function() {
            _.extend(this, this.original);
        }
    });

    return EntityInstance;
});
