require.config({
    paths: {
        ICanHaz: 'lib/ICanHaz',
        underscore: 'lib/underscore',
        jquery: 'lib/jquery',
        knockout: 'lib/knockout',
        text: 'lib/test'
    }
});

require(['underscore', 'jquery', 'knockout', 'util', 'editor/constants', 'core/loader',
         'editor/map_model', 'editor/tiles_viewmodel', 'editor/game_viewmodel',
         'editor/terrain_viewmodel', 'lib/bootstrap-modal'],
function(_, $, ko, ut, cst, loader, Map, TilesViewModel, GameViewModel,
         TerrainViewModel) {

    // Similar to observableArray, but for tilemaps (array of arrays)
    ko.observableTilemap = function(map) {
        // TODO: Data validation
        var result = new ko.observable(map);
        ko.utils.extend(result, ko.observableTilemap.fn);

        ko.exportProperty(result, 'get', result.get);
        ko.exportProperty(result, 'set', result.set);

        return result;
    };

    ko.observableTilemap.fn = {
        get: function(tx, ty) {
            var map = this();
            return map[ty][tx];
        },
        set: function(tx, ty, tile) {
            var map = this();
            this.valueWillMutate();
            map[ty][tx] = tile;
            this.valueHasMutated();
        }
    };

    function EditorViewModel() {
        var self = this;
        var maps = _.map(loader.get('map'), function(map) {
            return new Map(map.id, map.tileset, map.width, map.height, map);
        });
        self.maps = ko.observableArray(maps);

        self.currentMapId = ko.observable(maps[0].id());
        self.currentMap = ko.computed(function() {
             return _.find(self.maps(), function(m) {
                 return m.id() === self.currentMapId();
             });
        });

        self.game_json = ko.computed(function() {
            return ko.toJSON(self.maps);
        });

        self.tileClick = function(tx, ty) {
            self.currentMap.tiles.set(tx, ty, self.currentTile());
        };

        // Activate child ViewModels
        ko.applyBindings(new GameViewModel(self),
                         $('#game-editor').get(0));
        ko.applyBindings(new TilesViewModel(self),
                         $('#tilemap-editor').get(0));
        ko.applyBindings(new TerrainViewModel(self),
                         $('#terrain-editor').get(0));
    }

    $(function() {
        loader.loadResources('resources.json');
        loader.loadResources('editor_resources.json');
        loader.onload(function() {
            // Activate tab functionality
            $('#modes a').click(function() {
                $('#modes li').removeClass('active');
                $(this).parent('li').addClass('active');
                $('.editors section').hide();
                $(this.hash).show();
            });
            $('#modes .active a').click();

            ko.applyBindings(new EditorViewModel(),
                             $('#json-container').get(0));
        });
    });
});
