define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout'),

        ut = require('util');

    function Entity(data) {
        _.extend(this, {
            entity_class: ko.observable(ut.oget(data, 'entity_class')),
            x: ko.observable(ut.oget(data, 'x', 0)),
            y: ko.observable(ut.oget(data, 'y', 0))
        });
    }

    return Entity;
});
