<!-- Created by 何文林 on 2018-07-01. -->
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>简单版mvvm</title>
</head>
<body>
	<div id="app">
		<h1>开发语言：{{language}}</h1>
		<h2>组成部分：</h2>
		<ul>
			<li>{{makeUp.one}}</li>
			<li>{{makeUp.two}}</li>
			<li>{{makeUp.three}}</li>
		</ul>
		<h2>描述：</h2>
    <p>{{describe}}</p>
    <p>计算属性：{{sum}}</p>
    <input placeholder="123" v-module="language" />
	</div>
<script>
	function Mvvm(options = {}) {
		this.$options = options
		let data = this._data = this.$options.data
    let vm = initVm.call(this)
    initObserve.call(this, data)
    initComputed.call(this)
		new Compile(this.$options.el, vm)
		mounted.call(this._vm)
		return this._vm
	}

	function initVm () {
		this._vm = new Proxy(this, {
      get: (target, key, receiver) => {
        return this[key] || this._data[key] || this._computed[key]
      },
      set: (target, key, value) => {
        return Reflect.set(this._data, key, value)
      }
    })
    return this._vm
	}

	function initObserve(data) {
		this._data = observe(data)
	}

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

  class Compile{
    constructor (el, vm) {
      this.vm = vm
      this.element = document.querySelector(el)
      this.fragment = document.createDocumentFragment()
      this.init()
    }
    init() {
      let element = this.element
      this.fragment.append(element)
      this.replace(this.fragment)
      document.body.appendChild(this.fragment)
    }
    replace(frag) {
      let vm = this.vm
      Array.from(frag.childNodes).forEach(node => {
				let txt = node.textContent
        let reg = /\{\{(.*?)\}\}/g
        if (node.nodeType === 1) {
					let nodeAttr = node.attributes;
					Array.from(nodeAttr).forEach(attr => {
							let name = attr.name
							let exp = attr.value
							if (name.includes('v-')){
                node.value = vm[exp]
                node.addEventListener('input', e => {
                  let newVal = e.target.value
                  // 相当于给this.a赋了一个新值
                  // 而值的改变会调用set，set中又会调用notify，notify中调用watcher的update方法实现了更新
                  vm[exp] = newVal
                })
							}
					});
        } else if (node.nodeType === 3 && reg.test(txt)) {
					replaceTxt()
					function replaceTxt() {
						node.textContent = txt.replace(reg, (matched, placeholder) => {
							new Watcher(vm, placeholder, replaceTxt);   // 监听变化，进行匹配替换内容
							return placeholder.split('.').reduce((val, key) => {
								return val[key]
							}, vm)
						})
					}
				}
				if (node.childNodes && node.childNodes.length) {
					this.replace(node)
				}
			})
    }
  }

  class Dep {
    constructor() {
      this.subs = []
    }
    addSub(sub) {
			this.subs.push(sub)
		}
		notify() {
			this.subs.filter(item => typeof item !== 'string').forEach(sub => sub.update())
		}
  }

  class Watcher {
    constructor (vm, exp, fn) {
      this.fn = fn
      this.vm = vm
      this.exp = exp
      Dep.exp = exp
      Dep.target = this
      let arr = exp.split('.')
      let val = vm
      arr.forEach(key => {
        val = val[key]
      })
      Dep.target = null
    }
    update() {
      let exp = this.exp
			let arr = exp.split('.')
			let val = this.vm
			arr.forEach(key => {
				val = val[key]
			})
			this.fn(val)
		}
  }

	function initComputed() {
		let vm = this
		let computed = this.$options.computed
    vm._computed = {}
    if (!computed) return
		Object.keys(computed).forEach(key => {
      this._computed[key] = computed[key].call(this._vm)
      new Watcher(this._vm, key, val => {
        this._computed[key] = computed[key].call(this._vm)
      })
		})
	}

	function mounted() {
		let mounted = this.$options.mounted
		mounted && mounted.call(this)
	}

	// 写法和Vue一样
	let mvvm = new Mvvm({
		el: '#app',
		data: {
			language: 'Javascript',
			makeUp: {
				one: 'ECMAScript',
				two: '文档对象模型（DOM）',
				three: '浏览器对象模型（BOM）'
			},
			describe: '没什么产品是写不了的',
			a: 1,
			b: 2
		},
    computed: {
      sum() {
        return this.a + this.b
      }
		},
		mounted() {
			console.log('i am mounted', this.a)
		}
	})
</script>
</body>
</html>
