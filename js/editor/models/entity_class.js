define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout');

    // Observable object that lets you set and retrive keys
    ko.observableObject = function(obj) {
        var result = new ko.observable(obj);
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

    // Model for entity class
    function EntityClass(data) {
        _.extend(this, {
            id: ko.observable(data.id),
            tileset_id: ko.observable(data.tileset_id),
            sprite_id: ko.observable(data.sprite_id),
            bounding_box: ko.observableObject(data.bounding_box),
            sprites: ko.observableObject(data.sprites),
            handlers: ko.observableObject(data.handlers)
        });
    }

    return EntityClass;
});
