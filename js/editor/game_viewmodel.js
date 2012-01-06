define(['knockout', 'underscore', 'jquery', 'editor/constants',
        'editor/map_model'],
function(ko, _, $, cst, Map) {
    function GameViewModel(editor) {
        var self = this;
        self.maps = editor.maps;
        self.currentMap = editor.currentMap;
        self.currentMapId = editor.currentMapId;

        self.addMap = function(form) {
            var id = $('#add-map-id').val(),
                tileset = $('#add-map-tileset').val(),
                existing = _.any(this.maps(), function(map) {
                    return map.id() === id;
                });

            if (existing === true) {
                $('#add-map-error p')
                    .text('A map with that ID already exists.')
                    .parent('#add-map-error').fadeIn();
                return;
            }

            self.maps.push(new Map(id, tileset, cst.MAP_WIDTH, cst.MAP_HEIGHT));
            self.currentMapId(id);
            $('#add-map-dialog').modal('hide');
        };
    }

    return GameViewModel;
});
