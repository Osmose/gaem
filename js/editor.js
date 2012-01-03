require.config({
    paths: {
        ICanHaz: 'lib/ICanHaz',
        underscore: 'lib/underscore',
        jquery: 'lib/jquery'
    }
});

require(['underscore', 'jquery', 'core/loader', 'core/tilemap',
         'core/tilemap_collection', 'editor/tiles_mode', 'editor/terrain_mode'],
function(_, $, loader, Tilemap, TilemapCollection, TilesMode, TerrainMode) {
    function Editor(canvas, map_data) {
        var self = this;

        _.extend(this, {
            WIDTH: 160,
            HEIGHT: 128,
            SCALE: 3,
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            tilemap_collection: new TilemapCollection(map_data),
            tilemap: null,
            mode: null,
            $sidebar: $('#sidebar'),
            $json: $('#json')
        });

        this.openMap('base');
        this.initCanvas(canvas);

        this.modes = {
            'tiles': new TilesMode(this),
            'terrain': new TerrainMode(this)
        };
        this.setMode('tiles');

        this.updateJSON();
    }

    _.extend(Editor.prototype, {
        setMode: function(mode) {
            this.mode = this.modes[mode];
            this.mode.init();
        },
        openMap: function(mapID) {
            this.tilemap = this.tilemap_collection.get(mapID);
        },
        render: function() {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, 160, 144);
            this.tilemap.animate();
            this.tilemap.draw(this.ctx, 0, 0);
            this.mode.render(this.ctx);
        },
        updateJSON: function() {
            this.$json.val(JSON.stringify(this.tilemap_collection.map_data));
        },
        initCanvas: function() {
            var canvas = this.canvas,
                ctx = this.ctx,
                self = this;

            canvas.width = this.WIDTH * this.SCALE;
            canvas.height = this.HEIGHT * this.SCALE;

            ctx = canvas.getContext('2d');
            ctx.scale(this.SCALE, this.SCALE);
            ctx.mozImageSmoothingEnabled = false;

            $(canvas).click(function(e) {
                var x = e.pageX - this.offsetLeft,
                    y = e.pageY - this.offsetTop,
                    tx = Math.floor(x / 48),
                    ty = Math.floor(y / 48);

                self.mode.map_click(tx, ty);
            });
        }
    });

    var editor;

    var requestFrame = (function() {
        return window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 30);
            };
    })();

    function loop() {
        editor.render();
        requestFrame(loop, editor.canvas);
    }

    function start() {
        $('#modes a').click(function() {
            editor.setMode($(this).data('mode'));
            $('#modes li').removeClass('active');
            $(this).parent('li').addClass('active');
        });

        loader.loadResources('resources.json');
        loader.loadResources('editor_resources.json');
        loader.onload(function() {
            editor = new Editor(document.getElementById('map'),
                                loader.get('map'));

            loop();
        });
    }

    $(start);
});
