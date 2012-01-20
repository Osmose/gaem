define(function(require) {
    var _ = require('underscore'),
        $ = require('jquery'),
        ko = require('knockout'),

        EntityClass = require('editor/models/entity_class'),
        EntityClassViewModel = require('editor/entity_classes/viewmodel'),
        Map = require('editor/models/map'),
        MapsViewModel = require('editor/maps/viewmodel'),
        Player = require('editor/models/player'),
        PlayerViewModel = require('editor/player/viewmodel'),

        workspace_html = require('text!editor/workspace.html'),
        workspace_tmpl = _.template(workspace_html);

    function EditorViewModel() {
        var self = this;

        this.loadGameData = function(game_data) {
            this.game_data = game_data;

            // Initialize game data
            // Order matters: Maps depend on entity classes.
            this.entity_classes = ko.observableArray();
            _.each(game_data.entity_classes, function(data) {
                self.entity_classes.push(new EntityClass(data));
            });

            var maps = _.map(game_data.maps, function(map) {
                return new Map(map.id, map.tileset, map.width, map.height, map);
            });
            this.maps = ko.observableArray(maps);

            this.entity_class_ids = ko.computed(function() {
                return _.map(self.entity_classes(), function(ecls) {
                    return ecls.id;
                });
            });

            this.player = new Player(game_data.player);

            this.view_models = {
                'maps': new MapsViewModel(this),
                'player': new PlayerViewModel(this),
                'entity_classes': new EntityClassViewModel(this)
            };
        };

        this.getEntityClass = function(id) {
            return _.find(self.entity_classes(), function(ecls) {
                return ecls.id() === id;
            });
        };

        this.editMap = function(map) {
            self.view_models.maps.map(map);
            self.activateViewModel(self.view_models.maps);
        };

        this.editPlayer = function() {
            self.activateViewModel(self.view_models.player);
        };

        this.addEntityClass = function() {
            var entity_classes = self.entity_classes(),
                id = 'new_entity',
                match = false,
                k = 0;
            do {
                id = 'new_entity' + (++k);
                match = _.find(entity_classes, function(ecls) {
                    return ecls.id() === id;
                });
            } while (match !== undefined);

            var ecls = new EntityClass({id: id});
            self.entity_classes.push(ecls);
            self.editEntityClass(ecls);
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

        var maxDepth = 10;
        this.serialize = function(data) {
            return JSON.stringify(data, function(key, value) {
                // Loop because an observable's value might in turn be
                // another observable wrapper
                for (var k = 0; ko.isObservable(value) && (k < maxDepth); k++)
                    value = value();
                return value;
            });
        };

        this.save = function() {
            var data = {
                player: self.player,
                maps: self.maps,
                entity_classes: self.entity_classes
            };

            // TODO: Make this better
            alert(self.serialize(data));
        };
    }

    // Singleton! (aka global!)
    return new EditorViewModel();
});
