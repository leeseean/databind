const {
    deepProxy, setValue
} = require('./deepProxy');
const eventTypeConfig = require('./eventTypeConfig');
const isInputNodes = require('./isInputNodes');

class CreateProxy {
    constructor(el, data) {
        if (!el) throw '找不到挂载的dom';
        this.el = el;
        this.data = data || {};
        this.init();
        this.register();
        return this.proxy;
    }
    init() {
        this.el.querySelectorAll('[data-bind]').forEach((ele, index) => {
            const key = ele.getAttribute('data-bind');
            const arrKey = key.split('.');// 'a.b.c' => ['a', 'b', 'c']
            this.refreshDom(ele, arrKey.reduce((val, item) => val[item], this.data));
        });
    }
    register() {
        this.proxy = deepProxy(this.data, (directAttrValue, value) => {
            this.el.querySelectorAll('[data-bind]').forEach(ele => {
                const key = ele.getAttribute('data-bind');
                if (directAttrValue === key) {
                    this.refreshDom(ele, value);
                }
            });
        });
        this.inputBind();
    }
    inputBind() { // 输入框值变化更新对象值
        this.el.querySelectorAll('[data-bind]').forEach((ele, index) => {
            const key = ele.getAttribute('data-bind');
            if (isInputNodes(ele.nodeName)) {
                ele.addEventListener(eventTypeConfig[ele.nodeName], (e) => {
                    setValue(() => {
                        const func = new Function('context', 'evt', `context.proxy.${key} = evt.target.value`);
                        func(this, e);
                    });
                });
            }
        });
    }
    refreshDom(ele, value) {
        if (isInputNodes(ele.nodeName)) {
            ele.value = value;
        } else {
            ele.textContent = value;
        }
    }
}

module.exports = { CreateProxy };