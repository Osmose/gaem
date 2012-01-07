define(['underscore', 'jquery', 'knockout', 'util', 'editor/constants',
        'core/loader', 'editor/common'],
function(_, $, ko, ut, cst, loader, common) {
   function TerrainViewModel(editor) {
       var self = this;
       self.maps = editor.maps;
       self.currentMap = editor.currentMap;
       self.currentMapId = editor.currentMapId;
       self.currentTerrainMap = ko.computed(function() {
           return self.currentMap().terrain();
       });

       self.currentTerrain = ko.observable(0);
       self.currentTerrainName = ko.computed(function() {
           var terrain = self.currentTerrain();
           return _.find(self.terrain, function(t) {
               return t.value === terrain;
           }).name;
       });
       self.terrainTileset = ko.observable('terrain');

       self.terrainClick = function(pos) {
           var terrain = self.currentTerrain(),
               terrainMap = self.currentMap().terrain;

           if (terrainMap.get(pos.tx, pos.ty) !== terrain) {
               terrainMap.set(pos.tx, pos.ty, terrain);
           }
       };
    }

    _.extend(TerrainViewModel.prototype, {
        terrain: [
            {name: 'Empty', value: 0},
            {name: 'Solid', value: 1}
        ]
    });

    ko.bindingHandlers.overlayTilemapEditor = {
        init: function(canvas, paramsAccessor) {
            var params = paramsAccessor(),
                overlayTileset = loader.get(params.overlayTileset),
                click = params.click,
                mousePos = common.createMousePos(overlayTileset);
            ut.canvas(cst.WIDTH, cst.HEIGHT, cst.SCALE, canvas);

            common.bindDrawing(canvas, mousePos, click);
        },
        update: function(canvas, paramsAccessor) {
            var ctx = canvas.getContext('2d'),
                params = paramsAccessor(),
                map = params.map(),
                overlay = params.overlayMap(),
                overlayTileset = params.overlayTileset;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, cst.WIDTH, cst.HEIGHT);
            map.render(ctx);

            ctx.save();
            ctx.globalAlpha = 0.8;
            ut.renderMap(ctx, overlay, loader.get(overlayTileset),
                         map.width, map.height);
            ctx.restore();
        }
    };

    return TerrainViewModel;
});
