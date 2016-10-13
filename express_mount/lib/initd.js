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

    const Eventify = require('katana-kit').Eventify;

    const EVENT_UPDATE_APP = "emount.boot.update.app";
    const EVENT_APP_ON = "emount.boot.event.add";

    class Initd extends Eventify {

        constructor() {
            super();
        }

        init() {
            throw new Error("Classes that extend Initd must implement Init");
        }

        isInit() {
            return true;
        }

        app() {

            let send = (cmd) => {
                let args = Array.prototype.slice.call(arguments);
                args.unshift();
                this.trigger(cmd, args);
            };

            return {
                set: (key,value) => send("set", key, value),
                use: (cb) => send("use" , cb),
                on: (event,cb) => this.trigger(EVENT_APP_ON, [event, cb, false]),
                once: (event,cb) => this.trigger(EVENT_APP_ON, [event, cb, true])
            };
        }

    }

    module.exports = Initd;

})();