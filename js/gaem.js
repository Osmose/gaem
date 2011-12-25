require.config({
    paths: {
        underscore: 'lib/underscore'
    }
});

require(['underscore', 'keyboardcontrols', 'entities/player', 'loader',
         'js/tiles.js'],
function(_, KeyboardControls, Player, Loader) {
    function Engine() {
        this.WIDTH = 160;
        this.HEIGHT = 144;
        this.SCALE = 3;
        this.running = false;
        this.kb = new KeyboardControls();
        this.entities = [];

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

        engine.loader.onload(function() {
            engine.entities.push(new Player(engine, {
                x: 16,
                y: 16,
                tiles: engine.loader.get('entities')
            }));

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
