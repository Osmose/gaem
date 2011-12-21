function Loader() {
    this.resources = {};
    this.loadingCallback = false;
}

Loader.prototype.onload = function(callback) {
    if (this.loadingComplete()) {
        callback();
    } else {
        this.loadingCallback = callback;
    }
};

Loader.prototype.loadImage = function(url, id) {
    var img = new Image();
    this.resources[id] = {res: img, loaded: false};
    img.onload = this._done_loading(id);
    img.url = url;
};

Loader.prototype._done_loading = function(id) {
    var self = this;
    return function() {
        self.resources[id].loaded = true;
        if (self.loadingCallback && self.loadingComplete()) {
            self.loadingCallback();
        }
    };
};

Loader.prototype.loadingComplete = function() {
    for (var k in this.resources) {
        if (this.resources.hasOwnProperty(k) && !this.resources[k].loaded){
            return false;
        }
    }

    return true;
};

Loader.prototype.get = function(id) {
    if (this.resources.hasOwnProperty(id)) {
        return this.resources[id].res;
    }

    return undefined;
};
