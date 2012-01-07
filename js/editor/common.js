define(['jquery', 'editor/constants'], function($, cst) {
    return {
        // Adds a drawing interaction to an element.
        // Mouse pos returns mouse position data, and click
        // performs the painting.
        bindDrawing: function(elem, mousePos, click) {
            // Draw by clicking and dragging the mouse.
            var drawing = false;
            $(elem).mousedown(function(e) {
                var pos = mousePos.call(elem, e);

                drawing = true;
                click(pos);
            }).mousemove(function(e) {
                if (drawing) {
                    var pos = mousePos.call(elem, e);
                    click(pos);
                }
            }).mouseup(function(e) {
                drawing = false;
            });
        },

        // Returns a function that can determine the tile position
        // of a mouse using the given tileset.
        createMousePos: function(tileset) {
            return function(e) {
                var x = e.pageX - this.offsetLeft,
                    y = e.pageY - this.offsetTop,
                    tx = Math.floor(x / (tileset.tw * cst.SCALE)),
                    ty = Math.floor(y / (tileset.th * cst.SCALE));
                return {tx: tx, ty: ty};
            };
        }
    };
});
