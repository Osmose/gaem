define(function() {
    return {
        // Checks if two boxes are colliding
        // Boxes are objects with keys: left, right, top, bottom
        box_collision: function(box1, box2) {
            if (box1.right <= box2.left) return false;
            if (box1.left > box2.right) return false;
            if (box1.bottom <= box2.top) return false;
            if (box1.top > box2.bottom) return false;

            return true;
        },
        
        // Checks if one box contains another
        box_contains: function(box, container) {
            if (box.left < container.left) return false;
            if (box.right > container.right) return false;
            if (box.top < container.top) return false;
            if (box.bottom > container.bottom) return false;

            return true;
        }
    };
});
