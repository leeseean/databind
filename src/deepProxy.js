let flag = false;
const arrOfStoreKey = [];
function setValue(fn) {//设置值必须调用这个方法才能正确生成对应data-bind属性值的arrOfStoreKey值
    flag = true;
    fn();
    flag = false;
}
function _proxy(obj, callback = () => { }) {
    return new Proxy(obj, {
        get(target, key) {
            if (flag) {
                arrOfStoreKey.push(key);
            }
            return Reflect.get(target, key);
        },
        set(targte, key, value) {
            const result = Reflect.set(targte, key, value);
            if (flag) {
                arrOfStoreKey.push(key);
            }
            if (arrOfStoreKey.length > 0) {
                callback(arrOfStoreKey.join('.'), value);
            }
            arrOfStoreKey.length = 0;
            return result;
        }
    });
}
function _proxies(proxy, obj, callback) {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (typeof value == 'object') {
            proxy[key] = _proxy(value, callback);
            _proxies(proxy[key], value, callback);
        }
    });
}
function deepProxy(obj, callback) {
    const proxy = _proxy(obj, callback);
    _proxies(proxy, obj, callback);
    return proxy;
}

module.exports = {
    deepProxy,
    setValue,
};
