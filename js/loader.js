define(['underscore', 'jquery'], function(_, $) {
    function Loader(path) {
        this.resources = {};
        this.loadingCallback = false;
        this.path = path || '';
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
            img.src = this._path(url);
        },
        loadTileset: function(url, id, tileWidth, tileHeight, xGap, yGap) {
            var img = new Image(),
                self = this;
            yGap = yGap || 0;
            xGap = xGap || 0;

            this.resources[id] = {res: null, loaded: false};
            img.onload = function() {
                self.resources[id].res = new Tileset(img, tileWidth,
                                                     tileHeight, xGap, yGap);
                self._done_loading(id)();
            };
            img.src = this._path(url);
        },
        loadJSON: function(url, id) {
            var self = this;

            this.resources[id] = {res: null, loaded: false};
            $.getJSON(this._path(url), function(data) {
                self.resources[id].res = data;
                self._done_loading(id)();
            });
        },
        _path: function(url) {
            return this.path + url;
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
    function Tileset(img, tileWidth, tileHeight, xGap, yGap) {
        _.extend(this, {
            img: img,
            tw: tileWidth,
            th: tileHeight,
            xGap: xGap,
            yGap: yGap,
            img_tw: Math.floor(img.width / (tileWidth + xGap)),
            img_th: Math.floor(img.height / (tileHeight + yGap))
        });
    }

    _.extend(Tileset.prototype, {
        drawTile: function(ctx, tilenum, x, y) {
            var ty = Math.floor(tilenum / this.img_tw),
                tx = tilenum % this.img_tw;

            ctx.drawImage(this.img,
                          (tx * this.tw) + (tx * this.xGap),
                          (ty * this.th) + (ty * this.yGap),
                          this.tw, this.th, x, y, this.tw, this.th);
        }
    });

    return Loader;
});
