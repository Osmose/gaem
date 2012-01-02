define(['underscore', 'jquery'], function(_, $) {
    // Loads resources and handles callbacks to trigger when loading is
    // complete.
    function Loader(path) {
        this.resources = {};
        this.loadingCallback = false;
        this.path = path || '';
    }

    _.extend(Loader.prototype, {
        // Assign a callback to run when all resources are loaded.
        onload: function(callback) {
            if (this.isLoadingComplete()) {
                callback();
            } else {
                this.loadingCallback = callback;
            }
        },

        // Load a plain image file.
        loadImage: function(url, id) {
            var img = new Image();
            this.resources[id] = {res: img, loaded: false};
            img.onload = this._done_loading(id);
            img.src = this._path(url);
        },

        // Load a tileset. tileset is an object with configuration info.
        loadTileset: function(tileset, id) {
            var img = new Image(),
                self = this;

            this.resources[id] = {res: null, loaded: false};
            img.onload = function() {
                self.resources[id].res = new Tileset(
                    img, tileset.tileWidth, tileset.tileHeight, tileset.xGap,
                    tileset.yGap, tileset.anim);
                self._done_loading(id)();
            };
            img.src = this._path(tileset.path);
        },

        // Load a JSON file.
        loadJSON: function(url, id) {
            var self = this;

            this.resources[id] = {res: null, loaded: false};
            $.getJSON(this._path(url), function(data) {
                self.resources[id].res = data;
                self._done_loading(id)();
            });
        },

        // Load a JSON file that lists other resources to load.
        loadResources: function(url) {
            var self = this;

            this.resources[url] = {res: undefined, loaded: false};
            $.getJSON(this._path(url), function(data) {
                if (data.hasOwnProperty('tilesets')) {
                    _.each(data.tilesets, self.loadTileset.bind(self));
                }

                if (data.hasOwnProperty('images')) {
                    _.each(data.images, self.loadImage.bind(self));
                }

                if (data.hasOwnProperty('json')) {
                    _.each(data.json, self.loadJSON.bind(self));
                }

                self._done_loading(url)();
                delete self.resources[url];
            });
        },

        // Generate a path based on the prefix passed into the constructor.
        _path: function(url) {
            return this.path + url;
        },

        // Utility that handles triggering the onload callback.
        _done_loading: function(id) {
            var self = this;
            return function() {
                self.resources[id].loaded = true;
                if (self.loadingCallback && self.isLoadingComplete()) {
                    self.loadingCallback();
                }
            };
        },

        // Check if all resources are loaded.
        isLoadingComplete: function() {
            for (var k in this.resources) {
                if (this.resources.hasOwnProperty(k) &&
                    !this.resources[k].loaded){
                    return false;
                }
            }

            return true;
        },

        // Get a single loaded resource.
        get: function(id) {
            if (this.resources.hasOwnProperty(id)) {
                return this.resources[id].res;
            }

            return undefined;
        }
    });

    // Handles grabbing specific tiles from a tileset
    function Tileset(img, tileWidth, tileHeight, xGap, yGap, anim) {
        _.extend(this, {
            img: img,
            tw: tileWidth,
            th: tileHeight,
            xGap: xGap,
            yGap: yGap,
            img_tw: Math.floor(img.width / (tileWidth + xGap)),
            img_th: Math.floor(img.height / (tileHeight + yGap)),
            anim: anim
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

    // TODO: Figure out a better place for the asset path
    return new Loader('assets/');
});
