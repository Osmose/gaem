require.config({
    baseUrl: "../../js/",
    paths: {
        underscore: 'lib/underscore',
        jquery: 'lib/jquery'
    }
});

require(['jquery', 'loader', 'tilemap'], function($, Loader, Tilemap) {
    var loader = new Loader('../../assets/'),
        $json = $('#json'),
        $palette = $('#palette'),
        $canvas = $('#map'),
        $curtile = $('#curtile'),
        tileset, tilemap, maps,
        curtile = 0,
        canvas, ctx;

    var requestFrame = (function() {
        return window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 30);
            };
    })();

    $canvas.click(function(e) {
        var x = e.pageX - this.offsetLeft,
            y = e.pageY - this.offsetTop,
            tx = Math.floor(x / 48),
            ty = Math.floor(y / 48);

        maps.base.map[ty][tx] = curtile;
        tilemap.map[ty][tx] = curtile;
        $json.val(JSON.stringify(maps));
    });

    $palette.click(function(e) {
        var x = e.pageX - this.offsetLeft,
            y = e.pageY - this.offsetTop,
            tx = Math.floor(x / (tileset.tw + tileset.xGap)),
            ty = Math.floor(y / (tileset.th + tileset.yGap));

        setCurTile((ty * tileset.img_tw) + tx);
    });

    function loop() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 160, 144);
        tilemap.animate();
        tilemap.draw(ctx, 0, 0);
        requestFrame(loop, canvas);
    }

    function init_curtile() {
        var canvas = $curtile.get(0),
            ctx = canvas.getContext('2d');

        canvas.width = tileset.tw * 3;
        canvas.height = tileset.th * 3;
        ctx.scale(3, 3);
        ctx.mozImageSmoothingEnabled = false;

        setCurTile(0);
    }

    function setCurTile(tilenum) {
        var ctx = $curtile.get(0).getContext('2d');
        curtile = tilenum;
        tileset.drawTile(ctx, tilenum, 0, 0);
    }

    function init_palette(tileset) {
        var img = tileset.img,
            canvas = $palette.get(0),
            ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    }

    function start() {
        canvas = $canvas.get(0);
        canvas.width = 160 * 3;
        canvas.height = 128 * 3;

        ctx = canvas.getContext('2d');
        ctx.scale(3, 3);
        ctx.mozImageSmoothingEnabled = false;

        loader.loadResources('resources.json');
        loader.onload(function() {
            tileset = loader.get('overworld');
            init_palette(tileset);
            init_curtile();

            maps = {
                base: {
                    tileset: "overworld",
                    width: 10,
                    height: 8,
                    map: [
                        [120, 121, 121, 121, 121, 121, 121, 121, 121, 122],
                        [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                        [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                        [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                        [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                        [144, 145, 145, 145, 145, 145, 145, 145, 145, 146],
                        [144, 145, 145, 145, 145, 145, 376, 145, 145, 146],
                        [168, 169, 169, 169, 169, 169, 169, 169, 169, 170]
                    ]
                }
            };
            tilemap = new Tilemap(loader, maps.base);

            $json.val(JSON.stringify(maps));

            loop();
        });
    }

    $(start);
});
