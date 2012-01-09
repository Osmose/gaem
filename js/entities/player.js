define(['underscore', 'core/loader', 'util', 'entities/entity'],
function(_, loader, util, Entity) {
    function Player(engine, data) {
        Entity.call(this, engine, data);

        _.extend(this, {
            health: 3,
            max_health: 3,
            money: 0
        });

        this.moving = false;
        this.facing = 'down';
    }

    _.extend(Player.prototype, Entity.prototype, {
        tick: function() {
            var kb = this.engine.kb,
                vx = 0, vy = 0;

            // Read input to determine movement.
            var newFacing = null;
            if (kb.keys[kb.RIGHT]) {vx += 1; newFacing = 'right';}
            if (kb.keys[kb.LEFT]) {vx -= 1; newFacing = 'left';}
            if (kb.keys[kb.DOWN]) {vy += 1; newFacing = 'down';}
            if (kb.keys[kb.UP]) {vy -= 1; newFacing = 'up';}

            // Check for collision.
            var xc = this.collides(vx, 0),
                yc = this.collides(0, vy);
            if (xc.solid) vx = 0;
            if (yc.solid) vy = 0;
            this.moving = (vx !== 0 || vy !== 0);

            // Change facing and sprite if needed.
            if (newFacing !== null) {
                this.facing = newFacing;
            }
            if (this.moving) {
                this.setSprite(this.facing + '_move');
            } else {
                this.setSprite(this.facing);
            }

            // Check for movement off the side of the screen
            var edge = xc.edge || yc.edge;
            if (edge !== null) {
                var map = this.engine.tilemap.getExit(edge);
                if (map !== null) {
                    this.engine.startTransition(map, 'slide', {
                        direction: edge
                    });
                }

                return;
            }

            // Check for a door
            var doors = _.union(xc.tiles.doors, yc.tiles.doors);
            if (doors.length > 0) {
                var tilemap = this.engine.tilemap,
                    door = tilemap.getDoor(doors[0].tx, doors[0].ty);
                if (door !== null) {
                    this.engine.startTransition(door.target, 'fade', {
                        player_x: door.player.x,
                        player_y: door.player.y
                    });
                }
            }

            // Check for entity interaction
            var entities = _(yc.entities).chain()
                    .union(xc.entities)
                    .map(function (collision) {
                        return collision.entity;
                    })
                    .uniq(function(entity) {
                        return entity.id;
                    })
                    .value();
            if (kb.keys[kb.A] && entities.length > 0) {
                // TODO: Handle multiple-entity interaction.
                entities[0].handle('interact', this);
            }

            // Move player.
            this.x += vx;
            this.y += vy;
        }
    });

    return Player;
});
