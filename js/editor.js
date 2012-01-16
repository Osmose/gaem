require.config({
    paths: {
        ICanHaz: 'lib/ICanHaz',
        underscore: 'lib/underscore',
        jquery: 'lib/jquery',
        knockout: 'lib/knockout',
        text: 'lib/text',
        ace: 'lib/ace'
    },
    deps: ['editor/bindings', 'editor/observables']
});

define(function(require) {
    var _ = require('underscore'),
        $ = require('jquery'),
        ko = require('knockout'),

        loader = require('core/loader'),
        EntityClass = require('editor/models/entity_class'),
        EntityClassViewModel = require('editor/entity_classes/viewmodel'),
        Map = require('editor/models/map'),
        MapsViewModel = require('editor/maps/viewmodel'),
        Player = require('editor/models/player'),
        PlayerViewModel = require('editor/player/viewmodel'),

        workspace_html = require('text!editor/workspace.html'),
        workspace_tmpl = _.template(workspace_html);

    function EditorViewModel(game_data) {
        var self = this;
        this.game_data = game_data;

        // Initialize game data
        var maps = _.map(game_data.maps, function(map) {
            return new Map(map.id, map.tileset, map.width, map.height, map);
        });
        this.maps = ko.observableArray(maps);

        this.entity_classes = ko.observableObject();
        _.each(game_data.entity_classes, function(data, key) {
            self.entity_classes.set(key, new EntityClass(key, data));
        });

        this.player = new Player(game_data.player);

        this.view_models = {
            'maps': new MapsViewModel(this),
            'player': new PlayerViewModel(this),
            'entity_classes': new EntityClassViewModel(this)
        };

        this.editMap = function(map) {
            self.view_models.maps.map(map);
            self.activateViewModel(self.view_models.maps);
        };

        this.editPlayer = function() {
            self.activateViewModel(self.view_models.player);
        };

        this.editEntityClass = function(entity_class) {
            self.view_models.entity_classes.ecls(entity_class);
            self.activateViewModel(self.view_models.entity_classes);
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
                player: self.player,
                maps: self.maps,
                entity_classes: {}
            };

            // Serialize entities seperately due to issues with
            // icon attribute.
            _.each(self.entity_classes(), function(entity, id) {
                data.entity_classes[id] = entity.toJS();
            });

            // TODO: Make this better
            alert(ko.toJSON(data));
        };
    }

    $(function() {
        $(window).resize(function() {
            alert('resize!');
        });
        loader.loadResources('resources.json');
        loader.loadResources('editor_resources.json');
        loader.onload(function() {
            // Activate tab functionality
            $('.tabs a').live('click', function() {
                $(this).parents('.tabs').children('li').removeClass('active');
                $(this).parent('li').addClass('active');
                $('.tab-content > div').hide();
                $(this.hash).show().trigger('tab-show');
            });

            ko.applyBindings(new EditorViewModel(loader.get('gamedata')));
        });
    });
});
