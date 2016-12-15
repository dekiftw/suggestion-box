(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TemplateParser = function () {
    function TemplateParser(template, debug) {
        _classCallCheck(this, TemplateParser);

        this.debug = debug || false;
        this.template = template;
        this.nodes = [];
        this.conditionals = [];
        this.concats = [];
        this.getLasts = [];

        this._getNodes();
        //this._getConditionals();
        this._getCustomAttributes();
        this._getTemplateForListItem();
        this._removeListItemMarkup();
        this._removeRootElement();
    }

    _createClass(TemplateParser, [{
        key: '_getTemplateForListItem',
        value: function _getTemplateForListItem() {
            var listItem = "";

            var html = $.parseHTML($.trim(this.template));
            var el = html ? html[0] : [];

            if (html.length !== 1 && this.debug) {
                _util2.default.logger(this.debug, 'Unable to parse template. Template must have one root element.', 'error');
            }

            if ((el.id !== "" || el.class !== undefined) && this.debug) {
                _util2.default.logger(this.debug, 'Avoid adding style attributes such as "class", "id" or "style" to root element in template because these tags will be stripped.', 'warn');
            }

            if (el.childNodes.length > 0) {
                $.each(el.childNodes, function (i, el) {
                    if (el.id === "suggestion-list") {
                        $.each(el.childNodes, function (i, el) {
                            if (el.nodeName === "LI") {
                                listItem = el.innerHTML;
                            }
                        });
                    }
                });
            }

            this.listItem = listItem;
        }

        // returns an arroy of names for items that are inside handlebars

    }, {
        key: 'getTemplatedItems',
        value: function getTemplatedItems(str) {
            var regex = new RegExp("@?{{\\s?[a-z0-9_\\-\\[\\]\\.]+\\s?}}", "ig");
            var items = str.match(regex);

            var itemNames = [];

            items.forEach(function (item) {
                item = item.replace(new RegExp("@?{{\\s?"), "");
                item = item.replace(new RegExp("\\s?}}"), "");
                itemNames.push(item);
            });

            return itemNames;
        }
    }, {
        key: '_setId',
        value: function _setId(node) {
            var id = $(node).attr('id') || 'sb' + Math.floor(Math.random() * 10000000);

            // Add the id to the template
            this.template = this.template.replace($(node)[0].outerHTML, $(node).attr('id', id)[0].outerHTML);

            return id;
        }
    }, {
        key: '_getCustomAttributes',
        value: function _getCustomAttributes() {
            var _this = this;

            this.nodes.forEach(function (node) {
                if (node.attributes.length > 0) {
                    for (var i = 0; i < node.attributes.length; i++) {
                        switch (node.attributes[i].nodeName) {
                            case "sb-show":
                                _this.conditionals.push({ 'id': _this._setId(node) });
                                break;
                            case "sb-concat":
                                // not implemented
                                _this.concats.push({ 'id': _this._setId(node) });
                                break;
                            case "sb-last":
                                // not implemented
                                _this.lasts.push({ 'id': _this._setId(node) });
                                break;
                        }
                    }
                }
            });
        }
    }, {
        key: '_getLasts',
        value: function _getLasts() {
            var _this2 = this;

            this.nodes.forEach(function (node) {
                if (node.attributes.length > 0) {
                    for (var i = 0; i < node.attributes.length; i++) {
                        if (node.attributes[i].nodeName === "sb-last") {
                            var id = $(node).attr('id') || 'sb' + Math.floor(Math.random() * 10000000);
                            // Add the id to the template
                            _this2.template = _this2.template.replace($(node)[0].outerHTML, $(node).attr('id', id)[0].outerHTML);
                            _this2.lasts.push({ 'id': id });
                        }
                    }
                }
            });
        }
    }, {
        key: 'getConditional',
        value: function getConditional(id) {
            for (var key in this.conditionals) {
                if (this.conditionals[key].id === id) {
                    return this.conditionals[key];
                }
            }

            return false;
        }
    }, {
        key: 'getConditionals',
        value: function getConditionals() {
            return this.conditionals;
        }
    }, {
        key: '_getNodes',
        value: function _getNodes(node) {
            var _this3 = this;

            if (!node) {
                var html = $.parseHTML($.trim(this.template));
                var node = html ? html[0] : [];
            }

            $.each(node.childNodes, function (i, el) {
                if (el.childNodes.length > 0) {
                    _this3.nodes.push(el);
                    _this3._getNodes(el);
                }
            });
        }
    }, {
        key: '_removeRootElement',
        value: function _removeRootElement() {
            this.template = $(this.template).unwrap().html();
        }
    }, {
        key: '_removeListItemMarkup',
        value: function _removeListItemMarkup() {
            this.template = this.template.replace("<li>" + this.listItem + "</li>", "{{ suggestion_list }}");
        }
    }, {
        key: 'replaceHandlebars',
        value: function replaceHandlebars(str, name, replace) {
            // this should now be a UTIL
            name = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

            return str.replace(new RegExp("@?{{\\s?" + name + "\\s?}}", "gi"), replace);
        }
    }, {
        key: 'getParsedTemplate',
        value: function getParsedTemplate() {
            return this.template;
        }
    }, {
        key: 'getListItemMarkup',
        value: function getListItemMarkup() {
            return this.listItem;
        }
    }, {
        key: 'setDebug',
        value: function setDebug(debug) {
            this.debug = debug;
        }
    }]);

    return TemplateParser;
}();

exports.default = TemplateParser;

},{"./util.js":3}],2:[function(require,module,exports){
'use strict';

window.TemplateParser = require('../TemplateParser.js').default;

},{"../TemplateParser.js":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = function () {
    function Util() {
        _classCallCheck(this, Util);
    }

    _createClass(Util, null, [{
        key: 'getCssValue',
        value: function getCssValue(el, name) {
            var value = parseInt(el.css(name).replace('px', ''));
            return isNaN(value) ? 0 : value;
        }

        /** Calculates the padding for the given elements**/

    }, {
        key: 'calculateVerticalPadding',
        value: function calculateVerticalPadding(el) {
            return Util.getCssValue(el, 'padding-bottom') + Util.getCssValue(el, 'padding-top');
        }
    }, {
        key: 'calculateVerticalBorderWidth',
        value: function calculateVerticalBorderWidth(el) {
            return Util.getCssValue(el, 'border-bottom-width') + Util.getCssValue(el, 'border-top-width');
        }
    }, {
        key: 'calculateHorizontalBorders',
        value: function calculateHorizontalBorders(el) {
            return Util.getCssValue(el, 'border-left-width') + Util.getCssValue(el, 'border-right-width');
        }
    }, {
        key: 'copyArray',
        value: function copyArray(arr) {
            return arr.splice(0);
        }
    }, {
        key: 'logger',
        value: function logger(debug, message, type) {
            if (debug) {
                if (type === 'error') {
                    console.log('%c[Suggestion-Box Error] ' + message, 'color: #f00');
                } else {
                    console.log('[suggestion-box ' + type + '] ' + message);
                }
            }
        }

        /*
         * Applies the give border-radius to the search input, used when diosplaying suggestion list
         * with an input that has a border radius.
         */

    }, {
        key: 'applyBorderRadius',
        value: function applyBorderRadius(el, left, right) {
            el.css('border-bottom-left-radius', left);
            el.css('border-bottom-right-radius', right);
        }

        /*
         * Retuns the value at the given attribute. An attribute can look like: 'artists[0].name'
         * @param {string} attrs - The string attributes you want to get the value for.
         * @param {array} data - the data to search
         * @retun {array} - An array of results for the given query
         */

    }, {
        key: 'getValueByStringAttributes',
        value: function (_getValueByStringAttributes) {
            function getValueByStringAttributes(_x, _x2) {
                return _getValueByStringAttributes.apply(this, arguments);
            }

            getValueByStringAttributes.toString = function () {
                return _getValueByStringAttributes.toString();
            };

            return getValueByStringAttributes;
        }(function (attrs, data) {
            attrs = Array.isArray(attrs) ? attrs : attrs.split(".");
            if (data !== undefined) {
                for (var i = 0; i < attrs.length; i++) {
                    if (Array.isArray(data)) {
                        var vals = [];
                        for (var j = 0; j < data.length; j++) {
                            var value = data[j][attrs[i]]; // The value at the given array
                            if (attrs.length - 1 > i) {
                                // Recursively retrieve values at the next key and add them to the array
                                vals = vals.concat(getValueByStringAttributes(attrs[i + 1], value));
                            } else {
                                // We have no more keys for this object, so add this to the array
                                vals.push(data[j][attrs[i]]);
                            }
                        }
                        return vals;
                    } else {
                        var arrayItem = attrs[i].split('[');
                        if (arrayItem.length === 1) {
                            data = data[arrayItem[0]];
                        } else {
                            var index = arrayItem[1].replace(']', '');
                            var attr = arrayItem[0];

                            data = data[attr][index];
                        }
                    }
                }
            }

            return Array.isArray(data) ? data : [data];
        })

        /**
         * Returns true if the given search is found in the given object;
         */

    }, {
        key: 'inObject',
        value: function inObject(search, obj) {
            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) continue;

                if (obj[key] == search) {
                    return true;
                }
            }

            return false;
        }
    }, {
        key: 'isId',
        value: function isId(str) {
            return str.charAt(0) == "#";
        }
    }]);

    return Util;
}();

exports.default = Util;

},{}]},{},[2]);

//# sourceMappingURL=TemplateParser.js.map