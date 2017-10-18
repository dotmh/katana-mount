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
    const EVENT_BOOT_APP_UPDATE = "emount.app.update";
    const EVENT_BOOT_APP_EVENT_ADD = "emount.app.event.add";

    class ExpressProxy {
        constructor(app) {
            this._app = app;
        }

        send(cmd) {
            let args = Array.prototype.slice.call(arguments);
            args.shift();
            this._app.trigger(EVENT_BOOT_APP_UPDATE, [cmd, args]);
        }

        set(key, value) {
            this.send("set", key, value);
        }

        use(cb) {
            this.send("use", cb);
        }

        on(event, handler) {
            this._app.trigger(EVENT_BOOT_APP_EVENT_ADD, [event, handler, "on"]);
        }

        once(event, handler) {
            this._app.trigger(EVENT_BOOT_APP_EVENT_ADD, [event, handler, "once"]);
        }
    }

    module.exports = ExpressProxy;

})();