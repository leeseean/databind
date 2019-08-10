class Observe {
    constructor(data) {
        this.dep = new Dep()
        for (let key in data) {
            data[key] = observe(data[key])
        }
        return this.proxy(data)
    }
    proxy(data) {
        let dep = this.dep
        return new Proxy(data, {
            get: (target, prop, receiver) => {
                if (Dep.target) {
                    dep.addSub(Dep.target)
                }
                return Reflect.get(target, prop, receiver)
            },
            set: (target, prop, value) => {
                const result = Reflect.set(target, prop, observe(value))
                dep.notify()
                return result
            }
        })
    }
}

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
            this.refreshDom(ele, this.data[key]);
        });
    }
    register() {
        const that = this;
        this.proxy = data => new Proxy(data, {
            get(target, key, receiver) {
                return Reflect.get(target, key, receiver);
            },
            set(target, key, value, receiver) {
                that.el.querySelectorAll('[data-bind]').forEach((ele, index) => {
                    if (ele.getAttribute('data-bind') === key && target[key] !== value) {
                        that.refreshDom(ele, value);
                    }
                });
                return Reflect.set(target, key, value, receiver);
            },
            deleteProperty(target, key) {
                return Reflect.deleteProperty(target, key);
            }
        });
        this.inputBind();
    }
    inputBind() { // 输入框值变化更新对象值
        this.el.querySelectorAll('[data-bind]').forEach((ele, index) => {
            const key = ele.getAttribute('data-bind');
            if (ele.nodeName === 'INPUT' || ele.nodeName === 'TEXTAREA' || ele.nodeName === 'SELECT') {
                ele.addEventListener('input', (e) => {
                    this.proxy[key] = e.target.value;
                });
            }
        });
    }
    refreshDom(ele, value) {
        if (ele.nodeName === 'INPUT' || ele.nodeName === 'TEXTAREA' || ele.nodeName === 'SELECT') {
            ele.value = value;
        } else {
            ele.innerText = value;
        }
    }
}

//是不是一个pure object,意思就是object里面没有再嵌套object了
function isPureObject(object) {
    if (typeof object !== 'object') {
        return false;
    } else {
        for (let prop in object) {
            if (typeof object[prop] == 'object') {
                return false;
            }
        }
    }
    return true;
}

const proxy = new Proxy({ a: 1, o: { aa: 1, bb: 2 } }, {
    get(target, key, receiver) {
        return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
        console.log(3333);
        return Reflect.set(target, key, value, receiver);
    },
})