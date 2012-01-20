define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout'),

        ut = require('util');

    function Entity(data) {
        var self = this,
            editor = require('editor/editor');

        _.extend(this, {
            entity_class: ko.observable(editor.getEntityClass(data.entity_class_id)),
            x: ko.observable(ut.oget(data, 'x', 0)),
            y: ko.observable(ut.oget(data, 'y', 0))
        });

        this.entity_class_id = ko.computed({
            read: function() {
                if (self.entity_class()) {
                    return self.entity_class().id();
                }

                return undefined;
            },
            write: function(value) {
                self.entity_class(editor.getEntityClass(value));
            }
        });
    }

    _.extend(Entity.prototype, {
        toJSON: ut.buildToJSON([
            'entity_class_id',
            'x',
            'y'
        ])
    });

    return Entity;
});
