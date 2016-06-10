'use strict';

var wrapper = function wrapper(fn) {
    return function () {
        if (arguments[1] === Object(arguments[1]) && !Array.isArray(arguments[1])) {
            for (var attr in arguments[1]) {
                fn.call(null, arguments[0], attr, arguments[1][attr]);
            }
        } else if (Array.isArray(arguments[1])) {
            var el = arguments[0];
            arguments[1].forEach(function (a) {
                fn.call(null, el, a);
            });
        } else {
            fn.apply(null, arguments);
        }
    };
};

var attributelist = {
    set: function set(el, attr) {
        wrapper(function (e, a, v) {
            e.setAttribute(a, v);
        })(el, attr);
    },
    toggle: function toggle(el, attr) {
        wrapper(function (e, a) {
            e.setAttribute(a, e.getAttribute(a) === 'false' ? true : false);
        })(el, attr);
    }
};

var KEY_CODES = {
    RETURN: 13,
    TAB: 9
};
var triggerEvents = ['click', 'keydown', 'touchstart'];
var instances = [];
var defaults = {
    tabClass: '.js-tab-accordion-tab',
    titleClass: '.js-tab-accordion-title',
    currentClass: 'active',
    active: 0
};
var StormTabAccordion = {
    init: function init() {
        this.tabs = [].slice.call(this.DOMElement.querySelectorAll(this.settings.tabClass));
        this.titles = [].slice.call(this.DOMElement.querySelectorAll(this.settings.titleClass));
        this.triggers = this.titles.concat(this.tabs);
        this.targets = this.tabs.map(function (el) {
            return document.getElementById(el.getAttribute('href').substr(1)) || console.error('Tab target not found');
        });

        this.current = this.settings.active;
        this.initAria();
        this.initTriggers(this.tabs);
        this.initTriggers(this.titles);
        this.open(this.current);
    },
    initAria: function initAria() {
        this.triggers.forEach(function (el) {
            attributelist.set(el, {
                'role': 'tab',
                'tabIndex': 0,
                'aria-expanded': false,
                'aria-selected': false,
                'aria-controls': el.getAttribute('href') ? el.getAttribute('href').substr(1) : el.parentNode.getAttribute('id')
            });
        });
        this.targets.forEach(function (el) {
            attributelist.set(el, {
                'role': 'tabpanel',
                'aria-hidden': true,
                'tabIndex': '-1'
            });
        });
        return this;
    },
    initTriggers: function initTriggers(triggers) {
        var _this = this;

        var handler = function handler(i) {
            _this.toggle(i);
        };

        triggers.forEach(function (el, i) {
            triggerEvents.forEach(function (ev) {
                el.addEventListener(ev, function (e) {
                    if (!!e.keyCode && e.keyCode === KEY_CODES.TAB) {
                        return;
                    }
                    if (!!!e.keyCode || e.keyCode === KEY_CODES.RETURN) {
                        e.preventDefault();
                        handler.call(_this, i);
                    }
                }, false);
            });
        });

        return this;
    },
    change: function change(type, i) {
        var methods = {
            open: {
                classlist: 'add',
                tabIndex: {
                    target: this.targets[i],
                    value: '0'
                }
            },
            close: {
                classlist: 'remove',
                tabIndex: {
                    target: this.targets[this.current],
                    value: '-1'
                }
            }
        };

        this.tabs[i].classList[methods[type].classlist](this.settings.currentClass);
        this.titles[i].classList[methods[type].classlist](this.settings.currentClass);
        this.targets[i].classList[methods[type].classlist](this.settings.currentClass);
        attributelist.toggle(this.targets[i], 'aria-hidden');
        attributelist.toggle(this.tabs[i], ['aria-selected', 'aria-expanded']);
        attributelist.toggle(this.titles[i], ['aria-selected', 'aria-expanded']);
        attributelist.set(methods[type].tabIndex.target, {
            'tabIndex': methods[type].tabIndex.value
        });
    },
    open: function open(i) {
        this.change('open', i);
        this.current = i;
        return this;
    },
    close: function close(i) {
        this.change('close', i);
        return this;
    },
    toggle: function toggle(i) {
        if (this.current === i) {
            return;
        }
        if (this.current === null) {
            this.open(i);
            return this;
        }
        this.close(this.current).open(i);
        return this;
    }
};
var create = function create(el, i, opts) {
    instances[i] = Object.assign(Object.create(StormTabAccordion), {
        DOMElement: el,
        settings: Object.assign({}, defaults, opts)
    });
    instances[i].init();
};

var init = function init(sel, opts) {
    var els = [].slice.call(document.querySelectorAll(sel));

    if (els.length === 0) {
        throw new Error('TabAccordion cannot be initialised, no augmentable elements found');
    }

    els.forEach(function (el, i) {
        create(el, i, opts);
    });
    return instances;
};

var reload = function reload(sel, opts) {
    [].slice.call(document.querySelectorAll(sel)).forEach(function (el, i) {
        if (!instances.filter(function (instance) {
            return instance.btn === el;
        }).length) {
            create(el, instances.length, opts);
        }
    });
};

var destroy = function destroy() {
    instances = [];
};

var TabAccordion = { init: init, reload: reload, destroy: destroy };

TabAccordion.init('.js-tab-accordion');
//# sourceMappingURL=app.js.map
