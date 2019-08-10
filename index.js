import deepProxy, { setValue } from './deepProxy';

class Databind {
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
            this.refreshDom(ele, arrKey.reduce((val, item) => val[item], this.data), this.data[key]);
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
            const arrKey = key.split('.');// 'a.b.c' => ['a', 'b', 'c']
            if (ele.nodeType === 1) {
                ele.addEventListener('input', (e) => {
                    setValue(() => {
                        eval(`this.proxy.${key} = e.target.value`);// this.proxy.a.b.c = value;
                    });
                });
            }
        });
    }
    refreshDom(ele, value) {
        if (ele.nodeType === 1) {
            ele.value = value;
        } else if (node.nodeType === 3) {
            ele.textContent = value;
        }
    }
}

export default Databind;