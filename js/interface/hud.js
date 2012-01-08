define(['underscore', 'core/constants', 'core/loader', 'util'],
function(_, cst, loader, ut) {
    // HUD display at bottom of the screen (and top of menu).
    function HUD(player) {
        this.player = player;
    }

    _.extend(HUD.prototype, {
        FULL_HEART: 0,
        HALF_HEART: 1,
        EMPTY_HEART: 2,
        bg: '#FFFF8B',
        render: function(ctx, x, y) {
            var hud_img = loader.get('hud');

            ctx.save();
            ctx.fillStyle = this.bg;
            ctx.fillRect(x, y, cst.WIDTH, 16);
            ctx.drawImage(hud_img, x, y);

            this.renderHealth(ctx, x + 104, y);
            this.renderMoney(ctx, x + 80, y + 8);

            ctx.restore();
        },
        renderHealth: function(ctx, x, y) {
            var hearts = loader.get('hearts'),
                hx = x, hy = y,
                health = this.player.health,
                max_health = this.player.max_health;
            for (var k = 0; k < max_health; k++) {
                // Determine which heart to draw
                var tile = this.EMPTY_HEART;
                if (k < health) {
                    if (k + 1 > health) {
                        tile = this.HALF_HEART;
                    } else {
                        tile = this.FULL_HEART;
                    }
                }

                hearts.drawTile(ctx, tile, hx, hy);
                hx += 8;

                // Second row
                if (k === 7) {
                    hy += 8;
                    hx = x;
                }
            }
        },
        renderMoney: function(ctx, x, y) {
            var font = loader.get('hud_font');

            // Zero pad money string
            var money = '' + this.player.money,
                padding = '';
            for (var k = 3; k > money.length; k--) {
                padding += '0';
            }

            ut.text(ctx, font, padding + money, x, y, 3);
        }
    });

    return HUD;
});
