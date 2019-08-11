import Dep from 'Dep';

class Watcher {
    constructor(vm, directValue, fn) {// directValue data-bind属性的值
        this.fn = fn
        this.vm = vm
        this.directValue = directValue
        Dep.directValue = directValue
        Dep.target = this
        let arr = directValue.split('.')
        let val = vm
        arr.forEach(key => {
            val = val[key]
        })
        Dep.target = null
    }
    update() {
        let directValue = this.directValue
        let arr = directValue.split('.')
        let val = this.vm
        arr.forEach(key => {
            val = val[key]
        })
        this.fn(val)
    }
}

export default Watcher