import Dep from './Dep';

function observe(data) {
    if (!data || typeof data !== 'object') return data
    return new Observe(data)
}

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

export default Observe