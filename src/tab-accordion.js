'use strict';

import attributelist from './attributelist'

let KEY_CODES = {
        RETURN: 13,
        TAB: 9
    },
    triggerEvents = ['click', 'keydown', 'touchstart'],
    instances = [],
    defaults = {
        tabClass: '.js-tab-accordion-tab',
        titleClass: '.js-tab-accordion-title',
        currentClass: 'active',
        active: 0
    },
    StormTabAccordion = {
        init() {
            this.tabs = [].slice.call(this.DOMElement.querySelectorAll(this.settings.tabClass));
            this.titles = [].slice.call(this.DOMElement.querySelectorAll(this.settings.titleClass));
            this.triggers = this.titles.concat(this.tabs);
            this.targets = this.tabs.map(el => {
                return document.getElementById(el.getAttribute('href').substr(1)) || console.error('Tab target not found');
            });
                
            this.current = this.settings.active;
            this.initAria();
            this.initTriggers(this.tabs);
            this.initTriggers(this.titles);
            this.open(this.current);
        },
        initAria() {
            this.triggers.forEach(el => {
                attributelist.set(el, {
                    'role' : 'tab',
                    'tabIndex' : 0,
                    'aria-expanded' : false,
                    'aria-selected' : false,
                    'aria-controls' : el.getAttribute('href') ? el.getAttribute('href').substr(1) : el.parentNode.getAttribute('id')
                });
            });
            this.targets.forEach(el => {
                attributelist.set(el, {
                    'role' : 'tabpanel',
                    'aria-hidden' : true,
                    'tabIndex': '-1'
                });
            });
            return this;
        },
        initTriggers(triggers) {
            let handler = i => {
                this.toggle(i);
            };

            triggers.forEach((el, i) => {
                triggerEvents.forEach(ev => {
                    el.addEventListener(ev, e => {
                        if(!!e.keyCode && e.keyCode === KEY_CODES.TAB) { return; }
                        if(!!!e.keyCode || e.keyCode === KEY_CODES.RETURN){
                            e.preventDefault();
                            handler.call(this, i);
                        }
                    }, false);
                });
            });

            return this;
        },
        change(type, i) {
            let methods = {
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
        open(i) {
            this.change('open', i);
            this.current = i;
            return this;
        },
        close(i) {
            this.change('close', i);
            return this;
        },
        toggle(i) {
            if(this.current === i) { return; }
            if(this.current === null) { 
                this.open(i);
                return this;
            }
                this.close(this.current)
                .open(i);
            return this;
        }
    };

	
let create = (el, i, opts) => {
    instances[i] = Object.assign(Object.create(StormTabAccordion), {
        DOMElement: el,
        settings: Object.assign({}, defaults, opts)
    });
    instances[i].init();
}

let init = (sel, opts) => {
    var els = [].slice.call(document.querySelectorAll(sel));
    
    if(els.length === 0) {
        throw new Error('TabAccordion cannot be initialised, no augmentable elements found');
    }
    
    els.forEach((el, i) => {
        create(el, i, opts);
    });
    return instances;
    
}

let reload = (sel, opts) => {
    [].slice.call(document.querySelectorAll(sel)).forEach((el, i) => {
        if(!instances.filter(instance => { return (instance.btn === el); }).length) {
            create(el, instances.length, opts);
        }
    });
}

let destroy = () => {
    instances = [];  
}

let TabAccordion = { init, reload, destroy }

export { TabAccordion };