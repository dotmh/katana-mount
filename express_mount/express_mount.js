(function(){

    'use strict';

    const Eventify = require('katana-kit').Eventify;

    const APP = "app";
    const API = "api";

    class ExpressMount extends Eventify {
        constructor(app) {
            this._env = null;
            this._app = app || null;
        }

        app() {
           return this._createExpress(APP);
        }

        api() {
            return this._createExpress(API);
        }

        _createExpress(on) {
            if(null === this[on]) {
                const express = require('express');
                this[on] = express();

                if (on === APP ) {
                    this._env = this[on].get('env');
                }

                this.trigger(`emount.${on}.created`, [this[on]]);
            }

            return this[on];
        }
    }

    module.exports = function (app) {
        return new ExpressMount(app);
    }

})();