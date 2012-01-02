define(function() {
    return {
        LEFT: 0, WEST: 0,
        RIGHT: 1, EAST: 1,
        UP: 2, NORTH: 2,
        DOWN: 3, SOUTH: 3,

        // Maps direction numbers to string names. Used for serialization.
        directionToString: function(direction) {
            switch (direction) {
            case this.WEST: return 'west';
            case this.EAST: return 'east';
            case this.NORTH: return 'north';
            case this.SOUTH: return 'south';
            }

            return undefined;
        },

        // Checks if two boxes are colliding
        // Boxes are objects with keys: left, right, top, bottom
        box_collision: function(box1, box2) {
            if (box1.right <= box2.left) return false;
            if (box1.left > box2.right) return false;
            if (box1.bottom <= box2.top) return false;
            if (box1.top > box2.bottom) return false;

            return true;
        },

        // Checks if one box contains another.
        // Returns the broken side, or true if contained.
        box_contains: function(box, container) {
            if (box.left < container.left) return this.LEFT;
            if (box.right > container.right) return this.RIGHT;
            if (box.top < container.top) return this.UP;
            if (box.bottom > container.bottom) return this.DOWN;

            return true;
        }
    };
});
