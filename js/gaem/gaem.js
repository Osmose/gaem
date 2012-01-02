require.config({
    paths: {
        underscore: '../lib/underscore',
        jquery: '../lib/jquery'
    }
});

require(['jquery', 'core/engine', 'core/loader', 'entities/player'],
function($, Engine, loader, Player) {
    $(function() {
        var engine = window.engine = new Engine();
        loader.loadResources('resources.json');

        loader.onload(function() {
            engine.loadTilemaps(loader.get('map'));
            engine.setTilemap('base');

            engine.player = new Player(engine, {
                x: 16,
                y: 16,
                tiles: loader.get('entities')
            });

            engine.running = true;
            engine.loop();
        });
    });
});
