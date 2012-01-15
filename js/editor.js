require.config({
    paths: {
        ICanHaz: 'lib/ICanHaz',
        underscore: 'lib/underscore',
        jquery: 'lib/jquery',
        knockout: 'lib/knockout',
        text: 'lib/text'
    }
});

define(function(require) {
    var _ = require('underscore'),
        $ = require('jquery'),
        ko = require('knockout'),

        loader = require('core/loader'),
        Map = require('editor/map_model'),
        MapsViewModel = require('editor/maps/viewmodel'),

        workspace_html = require('text!editor/workspace.html'),
        workspace_tmpl = _.template(workspace_html);

    // Load bindings
    require('editor/bindings');

    function EditorViewModel(game_data) {
        var self = this;

        this.game_data = game_data;
        this.view_models = {
            'maps': new MapsViewModel(this)
        };

        // Initialize maps
        var maps = _.map(game_data.maps, function(map) {
            return new Map(map.id, map.tileset, map.width, map.height, map);
        });
        this.maps = ko.observableArray(maps);

        this.editMap = function(map) {
            self.view_models.maps.map(map);
            self.activateViewModel(self.view_models.maps);
        };

        // Activate the specified view model; insert its HTML into the main
        // editor panel and bind the view model to it.
        this.activateViewModel = function(view_model) {
            var view_model_workspace = workspace_tmpl(view_model.workspace),
                $workspace = $('#workspace');

            $workspace.empty()
                .html(view_model_workspace)

                .find('.tabs li:first-child a')
                .click(); // Activate first tab

            ko.applyBindings(view_model, $workspace.get(0));
        };

        this.save = function() {
            var data = {
                player: self.game_data.player,
                maps: ko.toJSON(self.maps)
            };

            // TODO: Make this better
            alert(JSON.stringify(data));
        };
    }

    $(function() {
        loader.loadResources('resources.json');
        loader.loadResources('editor_resources.json');
        loader.onload(function() {
            // Activate tab functionality
            $('.tabs a').live('click', function() {
                $(this).parents('.tabs').children('li').removeClass('active');
                $(this).parent('li').addClass('active');
                $('.tab-content > div').hide();
                $(this.hash).show();
            });

            ko.applyBindings(new EditorViewModel(loader.get('gamedata')));
        });
    });
});
