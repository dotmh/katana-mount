(function(){

    'use strict';

    const path = require('path');

    const Eventify = require('katana-kit').Eventify;
    const _ = require('lodash');
    const express = require('express');

    const APP    = "app";
    const API    = "api";
    const STATIC = "static";

    const PREFIX_DEFAULT_API = "api";
    const PREFIX_DEFAULT_ASSETS = "assets";
    const PREFIX_DEFAULT_GLOBAL_ASSETS = "all";

    const EVENT_BOOT_APP_UPDATE = "emount.app.update";
    const EVENT_BOOT_APP_EVENT_ADD = "emount.app.event.add";

    class ExpressMount extends Eventify {
        constructor(root, app, options) {

            if(!(root||false)) {
                throw new Error("Express Mount Requires a Root path to use.");
            }

            this._root = root;
            this._env = null;
            this._app = app || null;

            this.__config = null;
            this.__attachedRoutes = false;
            this.__attachedStatics = false;
            this.__initRan = false;

            this._options = _.extend({} , {

            }, options);
        }

        app() {
           return this._createExpress(APP);
        }

        api() {
            return this._createExpress(API);
        }

        appStatic() {
            return this._createExpress(STATIC);
        }

        mount() {
            this._init();
            this._attachRoutes();
            this._attachStatic();

            return this.app();
        }

        _createExpress(on) {
            if(null === this[`_${on}`]) {

                this[on] = express();

                if (on === APP ) {
                    this._env = this[on].get('env');
                }

                this.trigger(`emount.${on}.created`, [this[on]]);
            }

            return this[on];
        }

        _attachRoutes() {
            if(false === this.__attachedRoutes) {
                this._config().routers().forEach((route) => this._attachRoute(APP, route));
                this._config().api().forEach((route) => this._attachRoute(API, route));

                let apiMountPoint = this._config().application().has("api_prefix") ?
                    this._config().application().find("api_prefix") : PREFIX_DEFAULT_API;

                this.app().use(apiMountPoint, this.api());

                this.__attachedRoutes = true;
            }
        }

        _attachStatic() {
            if(false === this.__attachedStatics) {
                let globalStaticMountPoint = this._config().application().has("global_assets_prefix") ?
                    this._config().application().find('global_assets_prefix') : PREFIX_DEFAULT_GLOBAL_ASSETS;

                let staticMountPoint = this._config().application().has("assets_prefix") ?
                    this._config().application().find('assets_prefix') : PREFIX_DEFAULT_ASSETS;

                this.appStatic().use(
                    express.static(
                        globalStaticMountPoint,
                        path.join(this._root, this._config().application().find("static"))
                    )
                );

                this._config().staticPaths().forEach((route) => {
                    this.appStatic().use(route.mount, express.static(route.path));
                });

                this.app().use(staticMountPoint, this.appStatic());

                this.__attachedStatics = true;
            }
        }

        _init() {
            if(!this.__initRan) {
                let init = new require("./init")(this._config().inits());

                init.on(EVENT_BOOT_APP_UPDATE, (cmd, args) => this.app()[cmd].apply(this.app(), args));
                init.on(EVENT_BOOT_APP_EVENT_ADD, (event, handler, type) => {
                    this[(type === "once" ? "once" : "on")](event, handler);
                });

                init.init();

                this.__initRan = true;
            }
        }

        _attachRoute(to, route) {
            let _app = null;
            switch(to) {
                case STATIC:
                    _app = this.appStatic();
                    break;
                case API:
                    _app = this.api();
                    break;
                case APP:
                default:
                    _app = this.app();
                    break;
            }

            _app.use(route.mount, require(route.router));
        }

        _config() {
            if(null === this.__config ) {
                this.__config = new require('./modules')(this._root, (this._options.modulePath || this._root));
            }

            return this.__config;
        }
    }

    module.exports = function (app) {
        return new ExpressMount(app);
    }

})();