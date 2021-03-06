define(function(require) {
    var $ = require('jquery'),
        ko = require('knockout'),
        ace = require('ace/ace'),

        ut = require('util'),
        cst = require('./constants'),

        loader = require('core/loader');

    // Binding for drawing a tilemap on a canvas
    ko.bindingHandlers.tilemap = {
        init: function(canvas, mapAccessor, allBindingsAccessor) {
            var allBindings = allBindingsAccessor(),
                scale = allBindings['scale'] || cst.SCALE;
            ut.canvas(cst.WIDTH, cst.HEIGHT, scale, canvas);
        },
        update: function(canvas, mapAccessor, allBindingsAccessor) {
            var allBindings = allBindingsAccessor(),
                ctx = canvas.getContext('2d'),
                map = mapAccessor()(),
                tileset = loader.get(map.tileset());

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, cst.WIDTH, cst.HEIGHT);
            for (var ty = 0; ty < map.height; ty++) {
                for (var tx = 0; tx < map.width; tx++) {
                    tileset.drawTile(ctx, map.tiles.get(tx, ty),
                                     tx * tileset.tw, ty * tileset.th);
                }
            }

            if ('overlay' in allBindings) {
                allBindings['overlay'](canvas);
            }
        }
    };

    // Binding for drawing an arbitrary image on a canvas
    ko.bindingHandlers.image = {
        update: function(canvas, imgAccessor, allBindingsAccessor) {
            var ctx = canvas.getContext('2d'),
                allBindings = allBindingsAccessor(),
                scale = allBindings['scale'] || 1,
                img = ko.utils.unwrapObservable(imgAccessor());
            ut.canvas(img.width, img.height, scale, canvas);
            ctx.drawImage(img, 0, 0);

            if ('overlay' in allBindings) {
                allBindings.overlay(canvas);
            }
        }
    };

    // Binding for running a function whenever the mouse is clicked or
    // dragged across an element.
    ko.bindingHandlers.paint = {
        init: function(elem, drawFuncAccessor) {
            var drawing = false,
                drawFunc = drawFuncAccessor();
            $(elem).mousedown(function(e) {
                drawing = true;
                drawFunc.call(this, e);
            }).mousemove(function(e) {
                if (drawing) {
                    drawFunc.call(this, e);
                }
            }).mouseup(function(e) {
                drawing = false;
            });
        }
    };

    // Activates the ace code editor on an element.
    require('ace/theme/monokai');
    ko.bindingHandlers.ace = {
        modes: {
            javascript: require("ace/mode/javascript").Mode
        },
        init: function(elem, modeAccessor, allBindingsAccessor) {
            var editor = ace.edit(elem),
                mode = modeAccessor(),
                modes = ko.bindingHandlers.ace.modes,
                allBindings = allBindingsAccessor();

            $(elem).data('editor', editor);
            editor.getSession().setMode(new modes[mode]());
            editor.getSession().setUseWorker(false);
            editor.setHighlightActiveLine(false);
            editor.setTheme('ace/theme/monokai');

            // Editor should resize when the tab it is contained in is shown.
            $(elem).parent('.tab').bind('tab-show', function() {
                editor.resize();
            });

            if ('aceValue' in allBindings) {
                editor.getSession().setValue(allBindings.aceValue());
                allBindings.aceValue.subscribe(function(value) {
                    if (editor.getSession().getValue() !== value) {
                        editor.getSession().setValue(value);
                    }
                });
                editor.getSession().on('change', function() {
                    allBindings.aceValue(editor.getSession().getValue());
                });
            }
        }
    };
});
