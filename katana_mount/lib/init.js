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

    const Logger = require('katana-kit').Logger;
    const Eventify = require('katana-kit').Eventify;


    class Init extends Eventify {
        constructor (inits) {
            super();
            if ( !(inits || false) ) {
                throw new Error("No initializers where passed");
            }

            this._inits = inits;

        }

        init() {
            this._inits.forEach((initFile) => {

                Logger.info(`Initializing ${initFile}`);

                let InitKlass = require(initFile);
                let init = new InitKlass();

                if ( typeof(init.isInit) === "function" && init.isInit()) {
                    this.bond(init);
                    init.init();
                } else {
                    throw new Error(`${initFile} is not an initializer`);
                }

            });
        }
    }

    module.exports = Init;

})();