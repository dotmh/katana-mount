/***
 *  Copyright 2016 DotMH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function(){
    "use strict";

    let path = require("path");
    let _ = require("lodash");

    const Eventify = require('katana-kit').Eventify;
    const Logger = require('katana-kit').Logger;

    const MountFiles = require("./mountfiles");

    const TYPE_ROUTER   = "router";
    const TYPE_API      = "api";
    const TYPE_ASSETS   = "assets";


    class Modules extends Eventify {

        /**
         * Initializes the Module
         *
         * @param rootMount {string} The file to use as the root titan file
         * @param moduleBase = process.cwd {string} The base to hunt for the modules defined in rootTitan
         */
        constructor(rootMount, moduleBase) {

            if ( !(rootMount || false) ) {
                throw new Error("Can not load root Mount file");
            }

            super();

            this._rootMount     = rootMount;
            this._moduleBase    = moduleBase || process.cwd();
            this._application   = null;
            this._modules       = null;
            this._routers       = null;
            this._inits         = null;
            this._apis          = null;
            this._modulePaths   = null;
            this._staticPaths   = null;
            this._requires      = null;
        }

        /**
         * Returns or Loads and Returns the main application config , all Titan servers use this as the base
         *
         * @returns {MountFiles} The main Titan Config.
         *
         * @author Martin Haynes
         */
        application() {
            if ( this._application === null ) {
                this._application = new MountFiles( this._rootMount );
                this._application.loadConfig();
            }

            return this._application;
        }

        /**
         * Returns or Loads and Returns the module config for modules defined in application config.
         *
         * @returns {Array<MountFiles>} An array containing each modules Mount File.
         *
         * @author Martin Haynes
         */
        modules() {
            if ( this._modules === null ) {
                this._modules = {};
                if ( this.application().has("modules") ) {
                    this.application().find("modules").forEach((module) => {
                        let modulePath = path.join(this._moduleBase , module);
                        let moduleInstance = new MountFiles(modulePath);

                        moduleInstance.loadConfig();

                        Logger.info(`Loading ${moduleInstance.name}`);

                        if(this._modules[moduleInstance.name] || false ) {

                            const NAME = moduleInstance.name;
                            const PATH = moduleInstance.path();
                            const CURRENT = this._modules[moduleInstance.name];
                            const CURRENT_PATH = CURRENT.path();
                            const MSG = `Module Name Conflict: Module ${NAME} as ${PATH} conflicts with ${CURRENT_PATH}`;

                            Logger.error(MSG);
                            throw new Error(MSG);
                        }

                        this._modules[moduleInstance.name] = moduleInstance;

                        Logger.debug(`Adding Module ${moduleInstance.name}`);
                    });
                }

                this.required();
            }

            return this._modules;
        }

        /**
         * Returns or Loads and Returns the module config for modules defined in application config.
         *
         * @returns {Array<Modules>} An array containing each modules Titan Config.
         *
         * @author Martin Haynes
         */
        module(moduleName) {
            if (!(moduleName || false)) {
                throw new Error("moduleName is required");
            }

            return this.modules()[moduleName] || null;
        }

        /**
         * Gets all the module requirements by module
         *
         * @returns {{}} an object of modules with an array of their depends as <moduleName> => [<Requires>]
         *
         * @author Martin Haynes
         */
        requires() {

            if(this._requires === null ) {
                this._requires = {};
                _.each(this.modules(), (module) => {
                    if(module.has("requires")) {
                        this._requires[module.name] = module.requires;
                    }
                });
            }

            return this._requires;
        }

        /**
         * Checks that all the module requirements are met, if not throws an error
         *
         * @throws {Error} on a module requirement that is missing , the module name , and the missing requirement name
         *
         * @author Martin Haynes
         */
        required() {
            _.each(this.requires(), (requirements, module) => {
                requirements.forEach((requirement) => {
                    if(this.module(requirement) === null ) {
                        throw new Error(`Module ${module} requirement ${requirement} is missing`);
                    }
                });
            });
        }

        /**
         * Gets all the modules that have been set as a certain type.
         *
         * @param type {String} The type that you wish to get
         *
         * @returns {{}} An Object containing a list of all the modules of a set type.
         *
         * @author Martin Haynes
         */
        of(type) {
            let found = {};
            _.each(this.modules(), (module, modulename) => {
                const moduleType = module.type || DEFAULT_TYPE;
                if(type === moduleType) {
                    found[modulename] = module;
                }
            });

            return found;
        }

        /**
         * Return all the module routers
         *
         * @returns {Array<{mount string, router string}>} An array of router objects
         *
         * @see Modules::allroutes
         *
         * @author Martin Haynes
         */
        routers() {
            return this.allroutes(TYPE_ROUTER);
        }

        /**
         * Return all the module API routers
         *
         * @returns {Array<{mount string, router string}>} An array of router objects
         *
         * @see Modules::allroutes
         *
         * @author Martin Haynes
         */
        api() {
            return this.allroutes(TYPE_API);
        }

        /**
         * Return all the initializers for the modules
         *
         * @returns {Array<string>} An array of initializers
         *
         * @author Martin Haynes
         */
        inits() {
            if ( this._inits === null ) {
                this._inits = [];

                _.each(this.modules() , (module) => {
                    if ( module.has("init") ) {
                        this._inits.push(path.join(module.path(), module.find("init")));
                    }
                });
            }

            return this._inits;
        }

        /**
         * Return all the modules static path locations
         *
         * @returns {Array<{mount: string, path: string}>} An array of static file locations
         *
         * @author Martin Haynes
         */
        staticPaths() {
            if ( this._staticPaths === null ) {
                this._staticPaths = [];
                _.each(this.modules() , (module) => {
                    if ( module.has("static") ) {
                        this._staticPaths.push({
                            "mount" : `${ module.mount }`,
                            "path" : path.join(module.path() , module.find("static"))
                        });
                    }
                });
            }

            return this._staticPaths;
        }

        /**
         * Gets all the routers from all the modules for a certain type and returns a router objects
         *
         * @param type {string} The type of router you want to get
         *
         * @returns {Array<{mount string, router string}>} An array of router objects
         *
         * @author Martin Haynes
         */
        allroutes(type) {

            let attachedTo = this[`_${ type }s`];

            if ( attachedTo === null ) {
                attachedTo = [];

                _.each(this.modules(), (module) => {

                    if ( module.has("mount") && module.has(type) ) {
                        attachedTo.push({
                            "mount" : `${module.mount}`,
                            "router" : path.join(module.path() , module.find(type))
                        });

                    }

                });
            }

            return attachedTo;
        }

    }

    module.exports = Modules;

})();