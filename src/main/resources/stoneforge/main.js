// =====================================================
// The imitation of jQuery
// =====================================================
const Mimic = function(query) {
  if (!Mimic.html) {
    let noop = () => {}
  
    Mimic.prototype = {
      each: self((e, action) => action(e)),
      
      contain: flat((e, selector) => e.querySelector(selector) ? [e] : [], 9),
      filter: flat((e, condition) => condition(e) ? [e] : [], 9),
      is: flat((e, selector) => e.matches(selector), 9),
      
      parent: flat(e => [e.parentNode]),
      parents: flat(e => all(e, x => x.parentElement)),
      closest: self((e, selector) => e.closest(selector)),
      children: flat(e => e.children),
      find: flat((e, selector) => e.querySelectorAll(selector), 9),
      first: flat(e => [e.firstElementChild]),
      last: flat(e => [e.lastElementChild]),
      prev: flat(e => [e.previousElementSibling]),
      prevs: flat(e => all(e, x => x.previousElementSibling)),
      prevUntil: flat((e, selectorOrElement) => all(e, x => x.previousElementSibling, selectorOrElement), 1),
      next: flat(e => [e.nextElementSibling]),
      nexts: flat(e => all(e, x => x.nextElementSibling)),
      nextUntil: flat((e, selectorOrElement) => all(e, x => x.nextElementSibling, selectorOrElement), 1),
      
      append: self((e, node) => nody(node, n => e.append(n))),
      appendTo: self((e, node) => nody(node, n => n.append(e))),
      prepend: self((e, node) => nody(node, n => e.prepend(n))),
      prependTo: self((e, node) => nody(node, n => n.prepend(e))),
      before: self((e, node) => nody(node, n => e.before(n))),
      insertBefore: self((e, node) => nody(node, n => n.before(e))),
      after: self((e, node) => nody(node, n => e.after(n))),
      insertAfter: self((e, node) => nody(node, n => n.after(e))),
      clone: self(e => e.cloneNode()),
      make: flat((e, name, items, action) => action ? items.map(item => {let dom = $(e).make(name).model(item);action(item, dom);return dom}).flatMap(e => e.nodes) : [e.appendChild(document.createElement(name))], 9),
      svg: flat((e, path) => [e.appendChild($(`<svg class='svg ${path.substring(path.indexOf("#")+1)}' viewBox='0 0 24 24'><use href='${path}'/></svg>`).nodes[0])], 9),
      
      empty: self(e => e.replaceChildren()),
      clear: self(e => e.parentNode.removeChild(e)),
      
      html : value((e, text) => text ? e.innerHTML = text : e.innerHTML), 
      text : value((e, text) => text ? e.textContent = text : e.textContent),
      attr : value((e, name, value) => value ? e.setAttribute(name, value) : e.getAttribute(name)),
      data : value((e, name, value) => value ? e.dataset[name] = value : e.dataset[name]),
      css  : self((e, style) => Mimic.isString(style) ? e.style.cssText = style : Object.keys(style).forEach(name => e.style[name] = style[name])),
      model: value((e, value) => value !== undefined ? e.model = value : e.model),
	  value: value((e, value) => value !== undefined ? e.value = value : e.value),
      toString: value(e => e.outerHTML),
      
      add: value((e, name) => e.classList.add(name)),
      remove: value((e, name) => e.classList.remove(name)),
      toggle: value((e, name, addAction=noop, removeAction=noop) => e.classList.toggle(name) ? addAction() : removeAction()),
      has: value((e, name) => e.classList.contains(name)),
      set: value((e, nameAndCondition) => Object.keys(nameAndCondition).forEach(name => e.classList[nameAndCondition[name] ? "add" : "remove"](name))),
      reset: value((e, name) => e.className = (name || "")),
      
      // In cases where event listeners are registered during event processing, we delay the registration of all event listeners
      // because it may cause an infinite loop or supplement the event at an unintended timing.
      on: value((e, type, listener, options) => {activatable(e, type); setTimeout(() => e.addEventListener(type, options?.where ? event => event.target.matches(options.where + "," + options.where + " *") ? listener(event) : null : listener, options), 0)}),
      off: value((e, type, listener) => e.removeEventListener(type, listener)),
	  dispatch: self((e, type) => e.dispatchEvent(new Event(type, {bubbles: true}))),

	  show: self((e, show) => e.style.display = show ? "" : "none"),
    }
    
    "blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change input select submit keydown keypress keyup contextmenu".split(" ").forEach(type => {
      Mimic.prototype[type] = function(listener, options) { return this.on(type, listener, options) }
    })
    "id title href placeholder label name src type".split(" ").forEach(type => {
      Mimic.prototype[type] = function(value) { return this.attr(type, value) }
    })
    
    function* all(e, action, stopper) {
      let stop = stopper ? Mimic.isString(stopper) ? e => e.matches(stopper) : e => e === stopper : e => false
      while((e = action(e)) && !stop(e)) yield e
    }
    
    function flat(traverser, filterIndex = 0) {
      return function(...arg) {
        let nodes = [...new Set(this.nodes.flatMap(n => [...traverser(n, ...arg)]))]
        return Mimic(!arg[filterIndex] ? nodes : nodes.filter(e => e.matches(arg[filterIndex])))
      }
    }
    
    function self(action) {
      return function(...arg) {
        return Mimic(this.nodes.map(n => action(n, ...arg) || n))
      }
    }
    
    function value(action) {
		return function(...arg) {
			if (typeof arg[0] == "function") {
				let component = this.closest(".mimic").nodes[0]
				if (component) {
					let info = component.mimic || (component.mimic = {})
					let renders = info.renders || (info.renders = [])
					renders.push(arg[0])
				}
				arg[0] = arg[0]()
			}
			let result = this.nodes.map(n => action(n, ...arg))[0]
			return result === undefined || result === arg[arg.length - 1] ? this : result
		}
    }
    
    function nody(v, action) {
      if (v instanceof Element || v instanceof Text || v instanceof ShadowRoot) {
        action(v)
      } else if (Array.isArray(v)) {
        v.forEach(i => nody(i, action))
      } else if (Mimic.isString(v)) {
        action(v.trim()[0] === "<" ? Mimic.html(v) : $(v))
      } else if (v instanceof Mimic) {
        nody(v.nodes, action)
      }
    }

	function activatable(element, type) {
		if (element.closest) {
			let component = element.closest(".mimic")
			if (component) {
				let info = component.mimic || (component.mimic = {})
				let count = ++info[type] || (info[type] = 1)
				if (count === 1) component.addEventListener(type, e => {
					console.log("need redraw ", component, e, info)
					info.renders?.forEach(render => render())
				})
			}
		}
	}
    
    Mimic.isString = v => typeof v === "string" || v instanceof String
    Mimic.html = text => {
      	let t = document.createElement("template")
      	t.innerHTML = text
		if (text.startsWith("<o-")) $(t.content).children().add("mimic")
    	return t.content
    }
  }
  
  let o = Object.create(this == window ? Mimic.prototype : this.constructor.prototype)
  o.nodes = Mimic.isString(query) ? [...(query.trim()[0] === "<" ? Mimic.html(query).children : document.querySelectorAll(query))]
          : Array.isArray(query) ? query
          : !query ? [document]
          : query instanceof Node ? [query]
          : query instanceof Mimic ? [...query.nodes]
          : /* query instanceof NodeList || query instanceof HTMLCollection ? */ [...query]
  return o
}

const $ = Mimic

// =====================================================
// User Settings
// =====================================================
const
user = JSON.parse(localStorage.getItem("user")) || {},
save = () => localStorage.setItem("user", JSON.stringify(user))

// =====================================================
// View Mode
// =====================================================
$("html").add(user.theme)
$("#light,#dark").on("click", e => save($("html").reset(user.theme = e.currentTarget.id)))


// =====================================================
// Dynamic Navigation Indicator
// =====================================================
const navi = new IntersectionObserver(e => {
  e = e.filter(i => i.isIntersecting);
  if (0 < e.length) {
    const i = e.reduce((a,b) => a.intersectionRation > b.intersectionRatio ? a : b);
    if (i) {
      console.log(i.target.id, i.intersectionRatio);
      $("#DocNavi .now").remove("now");
      $(`#DocNavi a[href$='#${i.target.id}']`).add("now");
    }
  }
}, {root: null, rootMargin: "-40% 0px -60% 0px", threshold: 0})

// =====================================================
// Lightning Fast Viewer
// =====================================================
function FlashMan({paged, cacheSize=20, preload="mouseover", preview="section", ...previews}) { 
  var path = location.pathname, hash = location.hash;
  const cache = new Map(), loading = new Set(), observer = new IntersectionObserver(set => {
    set.filter(x => x.isIntersecting && !x.target.init && (x.target.init = true)).forEach(x => {
      for (let q in previews) x.target.querySelectorAll(q).forEach(e => previews[q](e))
    })
  }, {rootMargin: "80px", threshold: 0.3});
  
  // This is the state immediately after a page change has been requested by a user operation.
  function changed() {
    if (path == location.pathname) {
      if (hash != location.hash) {
        hash = location.hash;
        hashed();
      }
    } else {
      path = location.pathname;
      hash = location.hash;
      load(path);
    }
  }
  
  // Reads the contents of the specified path into the cache. If it is already cached or currently being read, it will be ignored.
  function load(p) {
    if (cache.has(p)) {
      if (path == p) update(cache.get(p))
    } else if (!loading.has(p)) {
      loading.add(p)
      fetch(p)
        .then(response =>  response.text())
        .then(html => {
          loading.delete(p)
          cache.set(p, html)
          if (path == p) update(html)
          if (cacheSize < cache.size) cache.delete(cache.keys().next().value)
        })
    }
  }
  
  function update(text) {
    if (text) {
      $("article").html(text.substring(text.indexOf(">", text.indexOf("<article")) + 1, text.lastIndexOf("</article>")));
      $("aside").html(text.substring(text.indexOf(">", text.indexOf("<aside")) + 1, text.lastIndexOf("</aside>")));
    }
    paged();
    $(preview).each(e => observer.observe(e));
    hashed();
  }
  
  function hashed() {
    // scroll to top or #hash
    if (location.hash == "") {
      setTimeout(() => window.scrollTo(0,0), 200); // wait rendering
    } else {
      location.replace(location.hash);
    }
  }

  // Detect all URL changes
  window.addEventListener("popstate", v => changed())
  document.addEventListener("DOMContentLoaded", v => {update(); cache.set(location.pathname, document.documentElement.outerHTML)})
  document.addEventListener("click", v => {
    let e = v.target.closest("a");
    if (e != null && location.origin == e.origin) {
      if (location.href != e.href) {
        history.pushState(null, null, e.href)
        changed()
      }
      v.preventDefault()
    }
  })
  // Preloader
  document.addEventListener(preload, v => {
    let e = v.target, key = e.pathname;
    if (e.tagName === "A" && e.origin == location.origin && key != location.pathname && !cache.has(key)) load(key)
  })
}

FlashMan({
  paged: () => {
    $("#APINavi").each(e => e.hidden = !location.pathname.startsWith("/api/"));
    $("#DocNavi").each(e => e.hidden = !location.pathname.startsWith("/doc/"));
    $("#DocNavi>div").each(e => {
      const sub = e.lastElementChild;
      
      if (e.id == location.pathname) {
        e.classList.add("active");
        sub.style.height = sub.scrollHeight + "px";
      } else {
        e.classList.remove("active");
        sub.style.height = 0;
      }
    });
    
    $("#Article section").each(e => navi.observe(e));
  },
  
  preview: "#Article>section",
  /* Enahnce code highlight */
  "pre": e => { 
    hljs.highlightElement(e);
    e.lang = e.classList[0].substring(5).toUpperCase();
	$(e).make("a").title("Copy this code").click(v => navigator.clipboard.writeText(e.textContent)).svg("/main.svg#copy")
  },
  /* Enahnce meta icons */
  ".perp": e => {
    e.title = "Copy the permanent link";
    e.onclick = () => navigator.clipboard.writeText(location.origin + location.pathname + "#" + e.closest("section").id);
  }, ".tweet": e => {
    e.title = "Post this article to Twitter";
    e.href = "https://twitter.com/intent/tweet?url=" + encodeURIComponent(location.origin + location.pathname + "#" + e.closest("section").id) + "&text=" + encodeURIComponent(e.closest("header").firstElementChild.textContent);
    e.target = "_blank";
    e.rel = "noopener noreferrer";
  }, ".edit": e => {
    e.title = "Edit this article";
    e.target = "_blank";
    e.rel = "noopener noreferrer";
}});
  

/**
 * Selection UI
 */
class Select extends Mimic {
	
	/** The assosiated model. */
	model = []
	
	/** The selected model */
	selected = new Set()

	/** The label builder for each model' */
	label = item => item.toString()
	
	/** The label builder for the selected values. */
	selectionLabel = selected => selected.map(this.label).join(", ")
	
	/** The flag to enable multiple selection. */
	multiple
	
	/** The default message */
	placeholder = "Select Item"
	
	/**
	 * Initialize by user configuration.
	 */
 	constructor(config) {
		super("<o-select/>")
		Object.assign(this, config)

		this.set({disabled: !this.model.length})
			.make("view").click(e => this.find("ol").has("active") ? this.close() : this.open())
				.make("now").text(this.placeholder).parent()
				.svg("/main.svg#chevron").parent().parent()
			.svg("/main.svg#x").click(e => this.deselect())
		this
			.make("ol").click(e => this.select(e.target.model, $(e.target)), {where: "li"})
				.make("li", this.model, (item, li) => li.text(this.label(item)))

		this.closer = e => {
			if (!this.nodes[0].contains(e.target)) this.close()
		}
	}

	/**
	 * Initialize by user configuration.
	 */
	select(item, dom) {
		if (this.multiple) {
			dom.toggle("select", () => this.selected.add(item), () => this.selected.delete(item)) 
		} else {
			if (this.selected.has(item)) {
				this.close()
				return
			}
			this.deselect(true)
			dom.add("select")
			this.selected.add(item)
		}
		this.update()
	}
	
	/**
	 * Initialize by user configuration.
	 */
	deselect(skipUpdate) {
		this.find("li").remove("select")
		this.selected.clear()
		this.close()

		if (!skipUpdate) this.update()
	}
	
	/**
	 * Initialize by user configuration.
	 */
	update() {
		this.find("now").set({select: this.selected.size}).text(this.selectionLabel([...this.selected.keys()]) || this.placeholder)
		this.find(".x").set({active: this.selected.size})
		this.dispatch("change")
	}

	/**
	 * Initialize by user configuration.
	 */
	open() {
		this.find("ol, .chevron").add("active")
		$(document).click(this.closer)
	}

	/**
	 * Initialize by user configuration.
	 */
	close() {
		this.find("ol, .chevron").remove("active")
		$(document).off("click",this.closer)
	}
}

/**
 * Selection UI
 */
class APITree extends Mimic {
	
	/** The assosiated model. */
	model = []

	/**
	 * Initialize by user configuration.
	 */
	constructor(items) {
		super("<o-tree>")
		
		let map = new Map()
		items.packages.forEach(item => {
			map.set(item, {
				name: item,
				children: [],
				open: false
			})
		})

		items.types.forEach(item => {
			map.get(item.packageName).children.push(item)
		})
		this.model = Array.from(map.values())
		
		this.moduleFilter = new Select({placeholder: "Select Module", model: root.modules})
		this.packageFilter = new Select({placeholder: "Select Package", model: root.packages})
		this.typeFilter = new Select({placeholder: "Select Type", multiple: true, model: ['Interface','Functional','AbstractClass','Class','Enum','Annotation','Exception']})
		this.nameFilter = $("<input>").id("NameFilter").placeholder("Search by Name")
		
		this.id("APINavi").attr("hidden", true).change(e => this.update()).input(e => this.update())
			.append(this.moduleFilter)
			.append(this.packageFilter)
			.append(this.typeFilter)
			.append(this.nameFilter)
			.make("div").add("tree")
				.make("dl", this.model, (pack, dl) => {
					dl.make("dt").click(e => this.toggle())
						.make("code").text(pack.name)
					dl.make("dd", pack.children, (type, dd) => {
						dd.add(type.type).make("code").make("a").href("/api/" + type.packageName + "." + type.name + ".html").text(type.name)
		      })
		    })
		
	}

	/**
	 * Initialize by user configuration.
	 */
	toggle(e) {
		$(e.target).parent().toggle("show")
	}
	
	update() {
		let filter = this.filter()
		
		this.find("dd").each(e => {
			$(e).show(filter(e.model))
		})
	}

	/**
	 * Initialize by user configuration.
	 */
	filter() {
		this.find("dl").set({expand: this.typeFilter.selected.size != 0 || this.packageFilter.selected.size != 0 || this.nameFilter.value != ""})

		return item => {
			if (this.typeFilter.selected.size != 0 && !this.typeFilter.selected.has(item.type)) return false
			if (this.packageFilter.selected.size != 0 && !this.packageFilter.selected.has(item.packageName)) return false
			if (this.nameFilter.value() != "" && (item.packageName + "." + item.name).toLowerCase().indexOf(this.nameFilter.value().toLowerCase()) == -1) return false
			return true
		}
	}
}

$("main>nav")
	.append(new APITree(root))
	.make("div").id("DocNavi").attr("hidden", true)
	.make("div", root.docs, (doc, div) => {
		div.add("doc").id(doc.path)
			.make("a").href(doc.path).text(doc.title).parent()
			.make("ol").add("sub")
				.make("li", doc.subs, (sub, li) => {
					li.make("a").href(sub.path).svg("/main.svg#chevrons").parent()
						.make("span").text(sub.title)
					li.make("a", sub.subs, (foot, a) => {
						a.href(foot.path).svg("/main.svg#chevrons").parent()
							.make("span").add("foot").text(foot.title)
					})
				})
	})

// =====================================================
// Live Reload
// =====================================================
if (location.hostname == "localhost") setInterval(() => fetch("http://localhost:9321/live").then(res => {
  if(res.status == 200) location.reload();
}), 3000);