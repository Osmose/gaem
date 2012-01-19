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
    var $ = require('jquery'),
        ko = require('knockout'),

        loader = require('core/loader'),
        editor = require('editor/editor');

    $(function() {
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

            editor.loadGameData(loader.get('gamedata'));
            ko.applyBindings(editor);
        });
    });
});
