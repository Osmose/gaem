define(function(require) {
    var ko = require('knockout'),

        player_general = require('text!./general.html');


    function PlayerViewModel(editor) {
        var self = this;
        this.editor = editor;
        this.player = editor.player;

        this.workspace = {
            tabs: [
                {name: 'General', anchor: 'player-general',
                 class_attr: '', content: player_general}
            ]
        };
    }

    return PlayerViewModel;
});
