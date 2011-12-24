require.config({
    paths: {
        underscore: 'lib/underscore'
    }
});

require(['keyboardcontrols', 'js/loader.js', 'js/tiles.js'],
        function(KeyboardControls) {
    var WIDTH = 320,
        HEIGHT = 240,
        SCALE = 2,
        running = false,
        kb = new KeyboardControls(),
        canvas, ctx,
        x, y;

    var requestFrame = (function() {
        return window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 30);
            };
    })();

    function tick() {
        if (kb.keys[kb.RIGHT]) x += 2;
        if (kb.keys[kb.LEFT]) x -= 2;
        if (kb.keys[kb.DOWN]) y += 2;
        if (kb.keys[kb.UP]) y -= 2;
    }

    function render() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x - 4, y - 4, 10, 10);
    }

    function loop() {
        tick();
        render();
        if (running) {
            requestFrame(loop, canvas);
        }
    }

    function start() {
        running = true;
        loop();
    }

    function init() {
        x = 10;
        y = 10;
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');

        canvas.width = WIDTH * SCALE;
        canvas.height = HEIGHT * SCALE;
        ctx.scale(SCALE, SCALE);

        document.getElementById('gaem').appendChild(canvas);

        start();
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.onload = init;
    }
});
