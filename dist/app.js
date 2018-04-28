/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __webpack_require__(3);
var path = __webpack_require__(0);
function default_1() {
    return new Promise(function (resolve, reject) {
        fs.readFile(path.join(__dirname, "config.json"), "utf8", function (err, data) {
            if (err) {
                return reject(err);
            }
            var settings = JSON.parse(data);
            resolve(__assign({}, settings, { jsonDataDir: path.resolve(path.join(__dirname, settings.jsonDataDir)) }));
        });
    });
}
exports.default = default_1;
;

/* WEBPACK VAR INJECTION */}.call(exports, ""))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(9));


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var fs = __webpack_require__(3);
var path = __webpack_require__(0);
var config_1 = __webpack_require__(2);
var FileSysNodeService = (function () {
    function FileSysNodeService() {
        this.all = function () {
            return config_1.default().then(function (settings) {
                return new Promise(function (resolve, reject) {
                    fs.readdir(settings.jsonDataDir, function (err, files) {
                        if (err) {
                            return reject(err);
                        }
                        var nodes = files.map(function (file) { return path.parse(file); })
                            .map(function (fi) {
                            return ({
                                id: fi.base,
                                title: fi.name
                            });
                        });
                        resolve(nodes);
                    });
                });
            });
        };
    }
    FileSysNodeService.prototype.one = function (id) {
        if (!id) {
            throw new Error("ID is not defined.");
        }
        return config_1.default().then(function (settings) {
            return new Promise(function (resolve, reject) {
                var fullPath = path.join(settings.jsonDataDir, id);
                fs.readFile(fullPath, "utf8", function (err, content) {
                    if (err) {
                        if (err.code === "ENOENT") {
                            return resolve(null);
                        }
                        return reject(err);
                    }
                    var node = JSON.parse(content);
                    resolve(node);
                });
            });
        });
    };
    return FileSysNodeService;
}());
exports.FileSysNodeService = FileSysNodeService;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var sql = __webpack_require__(10);
var config_1 = __webpack_require__(2);
var SqlDb = (function () {
    function SqlDb() {
        var _this = this;
        this.query = function (sqlText, parameters) {
            if (parameters === void 0) { parameters = null; }
            return _this.connect()
                .then(function (connection) {
                var request = new sql.Request(connection);
                if (parameters) {
                    Object.keys(parameters)
                        .forEach(function (name) { return request.input(name, parameters[name]); });
                }
                return request.query(sqlText);
            });
        };
        this.connect = function () {
            return config_1.default().then(function (settings) {
                return new Promise(function (resolve, reject) {
                    var connection = new sql.Connection(settings.sqlServer, function (err) { return err
                        ? reject(err)
                        : resolve(connection); });
                });
            });
        };
    }
    return SqlDb;
}());
exports.SqlDb = SqlDb;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var SqlDb_1 = __webpack_require__(6);
var SqlNodeService = (function () {
    function SqlNodeService() {
        var _this = this;
        this.db = new SqlDb_1.SqlDb();
        this.all = function () {
            return _this.db.query("\n            select\n                n.Ego_Node_ID as id\n            from\n                Nodes as n\n            group by\n                n.Ego_Node_ID\n            order by\n                id")
                .then(function (records) {
                return records.map(function (r) { return ({
                    id: r.id,
                    title: "" + r.id
                }); });
            });
        };
        this.nodes = function (egoNodeId) {
            return _this.db.query("\n            select\n                n.*\n            from\n                Nodes as n\n            where\n                n.Ego_Node_ID = @id", { id: egoNodeId });
        };
        this.edges = function (egoNodeId) {
            return _this.db.query("\n            with n as (\n                select\n                    *\n                from\n                    Nodes as nd\n                where\n                    nd.Ego_Node_ID = @id\n            )\n            select\n                e.*\n            from\n                Graph_Edges as e\n            where\n                e.Source in (select n.Node_ID from n) and\n                e.Target in (select n.Node_ID from n)", { id: egoNodeId });
        };
        this.circles = function (egoNodeId) {
            return _this.db.query("\n            select\n                nc.Node_ID as node,\n                max(nc.Circle_ID) as circle\n            from\n                Nodes as n inner join\n                Nodes_Circles as nc on n.Node_ID = nc.Node_ID and n.Ego_Node_ID = nc.Ego_Node_ID\n            where\n                n.Ego_Node_ID = @id\n            group by\n                nc.Node_ID", { id: egoNodeId });
        };
        this.nodeAttributes = function (egoNodeId) {
            return _this.db.query("\n            select\n                na.Node_ID,\n                na.Ego_Node_ID,\n                na.Attr_ID,\n                a.Attr_Name,\n                a.Attr_Type\n            from\n                Node_Attr as na inner join\n                Attributes as a on na.Attr_ID = a.ID\n            where\n                na.Ego_Node_ID = @egoNodeId", { egoNodeId: egoNodeId })
                .then(function (result) { return result.map(function (r) { return (__assign({}, r)); }); });
        };
    }
    SqlNodeService.prototype.one = function (egoNodeId) {
        egoNodeId = parseInt(egoNodeId, 10);
        return Promise.all([
            this.nodes(egoNodeId),
            this.edges(egoNodeId),
            this.nodeAttributes(egoNodeId)
        ]).then(function (_a) {
            var nodes = _a[0], edges = _a[1], attrs = _a[2];
            return ({
                nodes: nodes.map(function (n) {
                    var nodeAttrs = attrs.filter(function (a) { return a.Node_ID === n.Node_ID; });
                    return {
                        id: n.Node_ID,
                        title: n.Node_ID + " " + n.First_Name + " " + n.Last_Name,
                        attributes: nodeAttrs.reduce(function (map, a) {
                            var attrArray = a.Attr_Type.split(";");
                            var attrType = attrArray[0] + "-" + attrArray[1];
                            var val = map[attrType] || [];
                            map[attrType] = val;
                            if (!val.includes(a.Attr_Name)) {
                                val.push(a.Attr_Name);
                            }
                            return map;
                        }, {})
                    };
                }),
                links: edges.map(function (e) { return ({
                    from: e.Source,
                    to: e.Target,
                    value: 1
                }); }).filter(function (l) { return nodes.some(function (n) { return n.Node_ID === l.from || n.Node_ID === l.to; }); })
            });
        });
    };
    return SqlNodeService;
}());
exports.SqlNodeService = SqlNodeService;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(5));
__export(__webpack_require__(7));


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __webpack_require__(1);
var business_1 = __webpack_require__(8);
exports.nodeRouter = express_1.Router();
function svc() {
    return new business_1.SqlNodeService();
}
exports.nodeRouter.get("/:id", function (req, res) {
    var id = req.params.id;
    if (!id) {
        return res.sendStatus(404);
    }
    var service = svc();
    service.one(id)
        .then(function (node) {
        if (!node) {
            res.sendStatus(404);
        }
        else {
            res.json(node);
        }
    }, function (err) {
        console.error("The error occured on processing request " + req.method + " " + req.path);
        console.error(err);
        res.sendStatus(500);
    });
});
exports.nodeRouter.get("/", function (req, res) {
    svc().all()
        .then(function (nodes) {
        res.json(nodes);
    }, function (err) {
        console.error("The error occured on processing request " + req.method + " " + req.path);
        console.error(err);
        res.sendStatus(500);
    });
});


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("mssql");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {
Object.defineProperty(exports, "__esModule", { value: true });
var path = __webpack_require__(0);
var express = __webpack_require__(1);
var web_1 = __webpack_require__(4);
process.on("uncaughtException", function (err) {
    console.error("Uncaught exception", err.stack);
});
process.on("unhandledRejection", function (err) {
    console.error("Unhandled rejection", err.stack);
});
process.on("rejectionHandled", function (err) {
    console.error("Rejection handled", err.stack);
});
var app = express();
var apiRouter = express.Router();
var staticFilesPath = path.resolve(path.join(__dirname, "dist/assets"));
apiRouter.use("/node", web_1.nodeRouter);
app.use("/api", apiRouter);
app.use("/", express.static(staticFilesPath, { index: "index.html" }));
app.use("/vendor", express.static(path.resolve(path.join(__dirname, "dist/vendor"))));
app.listen(3000, function () {
    console.log("\n        Static files directory: " + staticFilesPath + "\n        Server started at http://localhost:3000/\n    ");
});

/* WEBPACK VAR INJECTION */}.call(exports, ""))

/***/ })
/******/ ]);
//# sourceMappingURL=app.js.map