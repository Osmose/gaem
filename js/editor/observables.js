define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout');

    // Observable object that lets you set and retrive keys
    ko.observableObject = function(obj) {
        var result = new ko.observable(obj || {});
        ko.utils.extend(result, ko.observableObject.fn);

        ko.exportProperty(result, 'get', result.get);
        ko.exportProperty(result, 'set', result.set);
        ko.exportProperty(result, 'keys', ko.computed(function() {
            return _.keys(result());
        }));
        ko.exportProperty(result, 'values', ko.computed(function() {
            return _.values(result());
        }));

        return result;
    };

    ko.observableObject.fn = {
        get: function(key) {
            var obj = this();
            return obj[key];
        },
        set: function(key, value) {
            var obj = this();
            this.valueWillMutate();
            obj[key] = value;
            this.valueHasMutated();
        }
    };

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
});
