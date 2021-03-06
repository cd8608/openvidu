"use strict";
/*
 * (C) Copyright 2017-2018 OpenVidu (http://openvidu.io/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
var OpenViduRole_1 = require("./OpenViduRole");
var SessionProperties_1 = require("./SessionProperties");
var https = require('https');
var Session = /** @class */ (function () {
    function Session(hostname, port, basicAuth, properties) {
        this.hostname = hostname;
        this.port = port;
        this.basicAuth = basicAuth;
        this.sessionId = "";
        if (properties == null) {
            this.properties = new SessionProperties_1.SessionProperties.Builder().build();
        }
        else {
            this.properties = properties;
        }
    }
    Session.prototype.getSessionId = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.sessionId) {
                resolve(_this.sessionId);
            }
            var requestBody = JSON.stringify({
                'mediaMode': _this.properties.mediaMode(),
                'recordingMode': _this.properties.recordingMode(),
                'defaultRecordingLayout': _this.properties.defaultRecordingLayout(),
                'defaultCustomLayout': _this.properties.defaultCustomLayout()
            });
            var options = {
                hostname: _this.hostname,
                port: _this.port,
                path: Session.API_SESSIONS,
                method: 'POST',
                headers: {
                    'Authorization': _this.basicAuth,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };
            var req = https.request(options, function (res) {
                var body = '';
                res.on('data', function (d) {
                    // Continuously update stream with data
                    body += d;
                });
                res.on('end', function () {
                    if (res.statusCode === 200) {
                        // SUCCESS response from openvidu-server. Resolve sessionId
                        var parsed = JSON.parse(body);
                        _this.sessionId = parsed.id;
                        resolve(parsed.id);
                    }
                    else {
                        // ERROR response from openvidu-server. Resolve HTTP status
                        reject(new Error(res.statusCode));
                    }
                });
            });
            req.on('error', function (e) {
                reject(e);
            });
            req.write(requestBody);
            req.end();
        });
    };
    Session.prototype.generateToken = function (tokenOptions) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var requestBody;
            if (!!tokenOptions) {
                requestBody = JSON.stringify({
                    'session': _this.sessionId,
                    'role': tokenOptions.getRole(),
                    'data': tokenOptions.getData()
                });
            }
            else {
                requestBody = JSON.stringify({
                    'session': _this.sessionId,
                    'role': OpenViduRole_1.OpenViduRole.PUBLISHER,
                    'data': ''
                });
            }
            var options = {
                hostname: _this.hostname,
                port: _this.port,
                path: Session.API_TOKENS,
                method: 'POST',
                headers: {
                    'Authorization': _this.basicAuth,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };
            var req = https.request(options, function (res) {
                var body = '';
                res.on('data', function (d) {
                    // Continuously update stream with data
                    body += d;
                });
                res.on('end', function () {
                    if (res.statusCode === 200) {
                        // SUCCESS response from openvidu-server. Resolve token
                        var parsed = JSON.parse(body);
                        resolve(parsed.id);
                    }
                    else {
                        // ERROR response from openvidu-server. Resolve HTTP status
                        reject(new Error(res.statusCode));
                    }
                });
            });
            req.on('error', function (e) {
                reject(e);
            });
            req.write(requestBody);
            req.end();
        });
    };
    Session.prototype.getProperties = function () {
        return this.properties;
    };
    Session.API_SESSIONS = '/api/sessions';
    Session.API_TOKENS = '/api/tokens';
    return Session;
}());
exports.Session = Session;
//# sourceMappingURL=Session.js.map