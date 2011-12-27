require.config({
    paths: {
        underscore: 'lib/underscore'
    }
});

require(['underscore', 'keyboardcontrols', 'entities/player', 'loader',
         'tilemap'],
function(_, KeyboardControls, Player, Loader, Tilemap) {
    function Engine() {
        this.WIDTH = 160;
        this.HEIGHT = 144;
        this.SCALE = 3;
        this.running = false;
        this.kb = new KeyboardControls();
        this.entities = [];
        this.tilemap = null;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = this.WIDTH * this.SCALE;
        this.canvas.height = this.HEIGHT * this.SCALE;
        this.ctx.scale(this.SCALE, this.SCALE);
        this.ctx.mozImageSmoothingEnabled = false;

        document.getElementById('gaem').appendChild(this.canvas);
    }

    Engine.prototype.tick = function() {
        _.each(this.entities, function(entity) {
            entity.tick();
        });
    };

    Engine.prototype.render = function() {
        var self = this;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        if (this.tilemap !== null) {
            this.tilemap.draw(this.ctx, 0, 0);
        }

        _.each(this.entities, function(entity) {
            entity.render(self.ctx);
        });
    };

    var requestFrame = (function() {
        return window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 30);
            };
    })();

    function loop() {
        var engine = window.engine;

        engine.tick();
        engine.render();
        if (engine.running) {
            requestFrame(loop, engine.canvas);
        }
    };

    function start() {
        var engine = window.engine = new Engine();
        engine.loader = new Loader();
        engine.loader.loadTileset('img/entities.png', 'entities', 16, 16);
        engine.loader.loadTileset('img/la_overtile.png', 'overworld',
                                  16, 16, 1, 1);

        engine.loader.onload(function() {
            engine.entities.push(new Player(engine, {
                x: 16,
                y: 16,
                tiles: engine.loader.get('entities')
            }));
            engine.tilemap = new Tilemap(engine.loader.get('overworld'), {
                tileWidth: 16, tileHeight: 16,
                width: 10, height: 8,
                map: [
                    [120, 121, 121, 121, 121, 121, 121, 121, 121, 122],
                    [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                    [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                    [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                    [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                    [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                    [144, 145, 145, 145, 145, 145, 376, 145, 145, 146],
                    [168, 169, 169, 169, 169, 169, 169, 169, 169, 170]
                ],
                anim: {
                    376: [376, 15, 377, 15, 378, 15, 379, 15]
                }
            });

            engine.running = true;
            loop();
        });
    };

    if (document.readyState === 'complete') {
        start();
    } else {
        window.onload = start;
    }
});
