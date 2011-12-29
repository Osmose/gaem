require.config({
    paths: {
        'jquery': '../../js/libs/jquery.js'
    }
});

require(['jquery'], function($) {
    var tilesets = {
        overworld: {
            url: '../../assets/img/la_overtile.png',
            tileWidth: 16,
            tileHeight: 16,

        }
    };

    function start() {

    }

    $(start);
});
