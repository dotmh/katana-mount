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

    const path = require("path");
    const JsonFile = require('katana-kit').JsonFile;
    const Logger = require('katana-kit').Logger;

    const MOUNT_FILE = "mount.json";
    const MOUNT_SCHEMA = path.resolve(__dirname+"/../schema/mount.json");

    /**
     * A Class for handling Titan Configuration files
     *
     * @class MountFiles
     * @extends katana-kit/JsonFile
     * @module Lib
     *
     * @author Martin Haynes
     */
    class MountFile extends JsonFile {
        constructor(configPath) {

            if (!configPath) {
                throw new Error("MountFile - Requires a configuration path");
            }

            super(null, MOUNT_SCHEMA);
            this.path(configPath);
        }

        /**
         * Set the path to look for a configuration file in
         *
         * @param path = false {String|Boolean} the path to set
         *
         * @returns {string|null} returns the path or if its never been set null
         */

        path(path) {
            if (path || false ) {
                this._path = path;
            }

            return this._path;
        }

        /**
         * Return the calculated path to the config file
         *
         * @returns {*|string} The calculated Path
         *
         * @author Martin Haynes
         */
        configFile() {
            return path.join(this.path() , MOUNT_FILE);
        }

        /**
         * Populates the collection with the data from the configuration file
         *
         * @author Martin Haynes
         */
        loadConfig() {
            this.filename(this.configFile());
            this.loadSync();

            this.on("schema.invalid" , (err) => {
                Logger.error(err);
            });

            if ( this.invalid() ) {
                throw new Error(`The config file ${ this.configFile() } isn't a valid Mount File`);
            }
        }


        /**
         * Find data within Titan config using a path
         *
         * @see Collection::find
         *
         * @param path = false {String|Boolean} the path to the value you want
         * @returns {*} returns the value of the variable at the path or false
         *
         * @author Martin Haynes
         */
        find(path) {
            if ( !this._loaded ) {
                this.loadConfig();
            }

            return super.find(path);
        }

    }

    module.exports = MountFile;

})();