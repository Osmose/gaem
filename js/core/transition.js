define(['underscore', 'util'], function(_, util) {
    var types = {
        instant: {
            length: 1,
            renderStep: function(ctx, step, engine, from, to, params) {
                engine.player.x = params.player_x;
                engine.player.y = params.player_y;

                to.render(ctx, 0, 0);
                engine.player.render(ctx);
            }
        },
        slide: {
            length: 32,
            renderStep: function(ctx, step, engine, from, to, params) {
                var len = types.slide.length;
                // TODO: Improve this code
                if (step === len) {
                    var pdx = (engine.WIDTH - 16) / len,
                        pdy = (engine.HEIGHT - 32) / len,
                        mdx = engine.WIDTH / len,
                        mdy = (engine.HEIGHT - 16) / len;

                    this.from_x = 0;
                    this.from_y = 0;

                    switch (params.direction) {
                    case util.WEST:
                        pdy = 0; mdy = 0;
                        this.to_x = -engine.WIDTH;
                        this.to_y = 0;
                        break;
                    case util.EAST:
                        pdy = 0; pdx = -pdx;
                        mdy = 0; mdx = -mdx;
                        this.to_x = engine.WIDTH;
                        this.to_y = 0;
                        break;
                    case util.NORTH:
                        pdx = 0;
                        mdx = 0;
                        this.to_x = 0;
                        this.to_y = -(engine.HEIGHT - 16);
                        break;
                    case util.SOUTH:
                        pdx = 0; pdy = -pdy;
                        mdx = 0; mdy = -mdy;
                        this.to_x = 0;
                        this.to_y = engine.HEIGHT - 16;
                        break;
                    }

                    this.pdy = pdy;
                    this.pdx = pdx;
                    this.mdy = mdy;
                    this.mdx = mdx;
                }

                engine.player.x += this.pdx;
                engine.player.y += this.pdy;

                this.to_x += this.mdx;
                this.to_y += this.mdy;
                this.from_x += this.mdx;
                this.from_y += this.mdy;

                to.render(ctx, this.to_x, this.to_y);
                from.render(ctx, this.from_x, this.from_y);
                engine.player.render(ctx);
            }
        },
        fade: {
            length: 64,
            renderStep: function(ctx, step, engine, from, to, params) {
                var alpha;
                if (step > 48) {
                    alpha = (64 - step) / 16;
                    from.render(ctx, 0, 0);
                } else if (step > 16) {
                    alpha = 1;
                } else {
                    if (step > 1) {
                        alpha = step / 16;
                    } else {
                        alpha = 0;
                    }

                    to.render(ctx, 0, 0);
                }

                if (step == 32) {
                    engine.player.x = params.player_x;
                    engine.player.y = params.player_y;
                }
                engine.player.render(ctx);

                ctx.save();
                ctx.fillStyle = 'rgba(255,255,255,'+alpha+')';
                ctx.fillRect(0, 0, engine.WIDTH, engine.HEIGHT);
                ctx.restore();
            }
        }
    };

    function Transition(type, engine, mapFrom, mapTo, params) {
        _.extend(this, {
            engine: engine,
            from: mapFrom,
            to: mapTo,
            params: params,
            type: types[type]
        });

        this.step = types[type].length;
    }

    _.extend(Transition.prototype, {
        renderStep: function(ctx) {
            this.type.renderStep(ctx, this.step, this.engine, this.from,
                                 this.to, this.params);
            this.step--;
        },
        isComplete: function() {
            return this.step <= 0;
        }
    });

    return Transition;
});
