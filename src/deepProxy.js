const arr = [];// 这个数组存放'a.b.c'中的a,b,c
let flag = false;
function setValue(fn) {//设置值必须调用这个方法才能正确生成对应data-bind属性值的arr值
    flag = true;
    fn();
    flag = false;
}
function _proxy(obj, callback = () => { }) {
    return new Proxy(obj, {
        get(target, key) {
            if (flag) {
                arr.push(key);
            }
            return Reflect.get(target, key);
        },
        set(targte, key, value) {
            const result = Reflect.set(targte, key, value);
            arr.push(key);
            callback(arr.join('.'), value);
            arr.length = 0;
            return result;
        }
    });
}
function _proxies(proxy, obj) {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (typeof value == 'object') {
            proxy[key] = _proxy(value);
            _proxies(proxy[key], value, key);
        }
    });
}
function deepProxy(obj, callback) {
    const proxy = _proxy(obj, callback);
    _proxies(proxy, obj);
    return proxy;
}

module.exports = {
    deepProxy,
    setValue
};
