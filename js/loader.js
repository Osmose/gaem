define(['underscore'], function(_) {
    function Loader() {
        this.resources = {};
        this.loadingCallback = false;
    }

    _.extend(Loader.prototype, {
        onload: function(callback) {
            if (this.loadingComplete()) {
                callback();
            } else {
                this.loadingCallback = callback;
            }
        },
        loadImage: function(url, id) {
            var img = new Image();
            this.resources[id] = {res: img, loaded: false};
            img.onload = this._done_loading(id);
            img.src = url;
        },
        loadTileset: function(url, id, tileWidth, tileHeight) {
            var img = new Image(),
                self = this;
            this.resources[id] = {res: null, loaded: false};
            img.onload = function() {
                self.resources[id].res = new Tileset(img, tileWidth,
                                                     tileHeight);
                self._done_loading(id)();
            };
            img.src = url;
        },
        _done_loading: function(id) {
            var self = this;
            return function() {
                self.resources[id].loaded = true;
                if (self.loadingCallback && self.loadingComplete()) {
                    self.loadingCallback();
                }
            };
        },
        loadingComplete: function() {
            for (var k in this.resources) {
                if (this.resources.hasOwnProperty(k) &&
                    !this.resources[k].loaded){
                    return false;
                }
            }

            return true;
        },
        get: function(id) {
            if (this.resources.hasOwnProperty(id)) {
                return this.resources[id].res;
            }

            return undefined;
        }
    });

    // Handles grabbing specific tiles from a tileset
    function Tileset(img, tileWidth, tileHeight) {
        this.img = img;
        this.tw = tileWidth;
        this.th = tileHeight;

        this.img_tw = Math.floor(img.width / tileWidth);
        this.img_th = Math.floor(img.height / tileHeight);
    }

    _.extend(Tileset.prototype, {
        drawTile: function(ctx, tilenum, x, y) {
            var ty = Math.floor(tilenum / this.img_tw),
                tx = tilenum % this.img_tw;

            ctx.drawImage(this.img, tx * this.tw, ty * this.th, this.tw,
                          this.th, x, y, this.tw, this.th);
        }
    });

    return Loader;
});
