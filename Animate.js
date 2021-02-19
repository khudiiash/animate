function Animate(c) {
    // version 1.1.3
    if (!gsap) return
    let sets;
    let onlyL = Array.from(arguments).some(a => /^(?:L|LS|Landscape)$/i.test(a))
    let onlyP = Array.from(arguments).some(a => /^(?:P|Portrait)$/i.test(a))
    let paused = Array.from(arguments).some(a => /^paused?$/i.test(a))
    if (arguments.length > 1 && !Array.from(arguments).some(a => Array.isArray(a))) {
        let args = Array.from(arguments)
        c = getObject(arguments) || {}
        args.map(a => {
            if (typeof a === 'string' && !/^(?:l|p|paused|from|to|set|call)$/i.test(a) && !(a instanceof HTMLElement)) {
                if (/\+|\-|\<|\>|\=/.test(a)) c.position = a
                if (/[a-zA-Z]/.test(a)) c.target = a
            }
            if (typeof a === 'string' && /^(?:from|to)$/i.test(a)) {
                c.type = a
            }
            if (typeof a === 'number') {
                c.duration = a
            }
            if (typeof a === 'string' && /^set$/i.test(a)) {
                c.type = 'to'
                c.duration = 0
            }
          	if (isFunction(a)) {
            	c.type = 'call'
                c.call = a
                c.params = args.find(a => Array.isArray(a)) || []
            }
        	if (Array.isArray(a) && args.some(f => isFunction(f))) {
            	c.params = a
            }
          	if (isHTML(a) || a instanceof jQuery) {
            	c.target = a
            }
        })
        if (args.filter(a => isObject(a)).length === 2) {
        	c.type = 'fromTo'
            let [f, t] = args.filter(a => isObject(a))
            c.from = f
            c.to = t       
        }
    }
    if (Array.from(arguments).some(a => a instanceof Array)) {
        let tweens = Array.from(arguments).filter(a => a instanceof Array && !isHTML(a) && !(a instanceof jQuery))
        let pos = Array.from(arguments).find(a => typeof a === 'string' && /\+|\-|\<|\>|\=/.test(a))
        let dur = Array.from(arguments).find(a => typeof a === 'number')        
        let common = getObject(arguments)
        sets = tweens.map(arr => {
          	let from, to;
            let type = arr.includes('set') || arr.includes('to') ? 'to' : 'from';
            let tween = arr.find(a => isObject(a)) || {}
            let particulars = getParticulars(tween)
            let target = arr.find(a => typeof a === 'string' && !/^(?:from|to|set)$/i.test(a) && /[a-zA-Z]/.test(a))
    		if (!target && Object.keys(particulars).length) target = targetFromParticulars(tween, particulars) 
    		tween = removeParticulars(tween, particulars)
            tween = getCustomProps(tween, type)
            if (tween.L) tween.L = getCustomProps(tween.L, type)
            if (tween.P) tween.P = getCustomProps(tween.P, type)
            let {child} = tween
            if (common) tween = { ...tween, ...common }
            let duration = arr.includes('set') ? 0 : arr.find(a => typeof a === 'number') || dur
            let position = arr.find(a => typeof a === 'string' && /\+|\-|\<|\>|\=/.test(a)) || pos
            let call = arr.find(a => isFunction(a))
            let params = arr.some(a => isFunction(a)) && arr.some(a => Array.isArray(a)) ? arr.find(a => Array.isArray(a)) :
            			 arr.some(a => isFunction(a)) && !arr.some(a => Array.isArray(a)) ? [] : null
          	let onlyL = arr.find(a => /^(?:L|LS|Landscape)$/.test(a))
            let onlyP = arr.find(a => /^(?:P|Portrait)$/.test(a))
          	if (child) delete tween.child
            if (call) {  type = 'call', tween = null, target = null }
          	if (arr.some(a => isHTML(a))) target = arr.find(a => isHTML(a))
            if (arr.some(a => a instanceof jQuery)) target = arr.find(a => a instanceof jQuery)
            if (tween == null) tween = {}
            if (arr.filter(a => isObject(a)).length === 2 || tween.type === 'fromTo') {
                type = 'fromTo'
                if ('from' in tween) {
                  from = tween.from
                  to = tween.to;
                  ['from', 'to'].map(a => delete tween[a])
                } else {
                	let [f, t] = arr.filter(a => isObject(a))
                	from = f
                	to = t    
                }
            }
            return { target, tween, child, duration, position, type, call, params, from, to, onlyL, onlyP, particulars }
        })
    }
  	if (arguments.length === 1 && isFunction(c)) {c = {call: c, params: [], position: '', type: 'call'}}
    let { duration, position, order, child, include, exclude, timeline, type } = c || {}
    if (!order && !include) order = 'z-index'
    if (exclude && include) exclude = null
    if (include) order = include
    if (duration) delete c.duration
    if (position) delete c.position
    if (!type) {delete c.type; type = 'from'}
    if (timeline) delete c.timeline
    if (paused && !timeline) timeline = { paused: true }
    if (paused && timeline) timeline.paused = true
    if (timeline && timeline.loop) { timeline.repeat = loop; timeline.yoyo = true }
  	c = getCustomProps(c, type)
    type = c.type || 'from'
    if (c.L) c.L = getCustomProps(c.L, type)
    if (c.P) c.P = getCustomProps(c.P, type)
    let timelineL = gsap.timeline(timeline)
    let timelineP = gsap.timeline(timeline)
    let elementsL = getAll('L')
    let elementsP = getAll('P')
  	let particulars = getParticulars(c)
    c = removeParticulars(c, particulars)
    if (include && include.length) {
        if (!Array.isArray(include) && typeof include === 'string') {
            include = include.includes(',') ? include.split(',').map(i => i.trim()) : [include]
        }
        let re = new RegExp('^' + include.join('(?:_1|P|L|LS|Landscape|Portrait)?$|^'))
        elementsL = elementsL.filter(e => re.test(e.id))
        elementsP = elementsP.filter(e => re.test(e.id))
    }
    if (exclude && exclude.length) {
        if (!Array.isArray(exclude) && typeof exclude === 'string') {
            exclude = exclude.includes(',') ? exclude.split(',').map(i => i.trim()) : [exclude]
        }
        let re = new RegExp('^' + exclude.join('(?:_1|P|L|LS|Landscape|Portrait)?$|^'))
        elementsL = elementsL.filter(e => !re.test(e.id))
        elementsP = elementsP.filter(e => !re.test(e.id))
    }
    if (typeof order === 'string') {
        elementsL.sort((a, b) => parseInt(a.style[order]) - parseInt(b.style[order]))
        elementsP.sort((a, b) => parseInt(a.style[order]) - parseInt(b.style[order]))
    }
    if (Array.isArray(order)) {
        let eL = order.map(oi => {
            oi = oi.replace(/_1$|P$|L$|LS$|Landscape$|Portrait$/, '')
            return elementsL.find(i => new RegExp('^' + oi + '(?:_1|P|L|LS|Landscape|Portrait)?$').test(i.id))
        })
        let eP = order.map(oi => {
            oi = oi.replace(/_1$|P$|L$|LS$|Landscape$|Portrait$/, '')
            return elementsP.find(i => new RegExp('^' + oi + '(?:_1|P|L|LS|Landscape|Portrait)?$').test(i.id))
        })
        elementsL = eL
        elementsP = eP
    }
    if (sets) {
        sets.map(set => {
            if (set.target) {
                elementsL = getByTarget(set.target, set.child)[0]
                elementsP = getByTarget(set.target, set.child)[1]
            }
            if (set.child) {
                if (!set.tween.perspective) elementsL.map(e => gsap.set(e, { overflow: 'hidden' }))
                if (!set.tween.perspective) elementsP.map(e => gsap.set(e, { overflow: 'hidden' }))
                if (elementsL[0]) elementsL = elementsL.map(e => document.querySelector(`#${e.id} img, #${e.id} span`))
                if (elementsP[0]) elementsP = elementsP.map(e => document.querySelector(`#${e.id} img, #${e.id} span`))
            }
			if (set.type === 'call') {
            	timelineL.call(set.call, set.params, set.position)
            }
          	else {
                 let d = set.duration >= 0 ? set.duration : 1
                 let p = set.position ? set.position : '-=0';
                 ['duration', 'position'].map(k => delete set[k])
             	 if (elementsL[0] && !onlyP && !set.onlyP && !(set.tween.P && !set.tween.L)) {
                    let tween = set.tween.L ? set.tween.L : set.tween
                    if (tween.type) set.type = tween.type
                    if (tween.from) {set.from = tween.from; set.to = tween.to}
                    let g;
                    elementsL.map((e, i) => {
                        if (e.id in set.particulars && set.particulars[e.id].child) {
                          	gsap.set(e, {overflow: 'hidden'})
                            let {id} = e
                        	e = document.querySelector(`#${e.id} img, #${e.id} span`)
                            delete set.particulars[id].child
                        }
                        let partChild = Object.keys(set.particulars).find(p => $(e).parents('#'+p).length == 1)
                        if (e.id in set.particulars) {
                            g = {...set.particulars[e.id]}
                        } else if (partChild) {
                        	g = {...set.particulars[partChild]}
                        } else {
                          g = {...tween}
                        }
                        if (i > 0) p = '<'+g.stagger
                        if (/fromTo/.test(set.type)) timelineL.fromTo(e, d, set.from, set.to, p)
                        else timelineL[set.type || 'from'](e, d, { ...g }, p)
                      })
                    }
                 if (elementsP[0] && !onlyL && !set.onlyL && !(!set.tween.P && set.tween.L)) {
                    let tween = set.tween.P ? set.tween.P : set.tween
                    if (tween.type) set.type = tween.type
                    if (tween.from) {set.from = tween.from; set.to = tween.to}
                    let g;
                    elementsP.map((e, i) => {
                        if (e.id in set.particulars && set.particulars[e.id].child) {
                          	gsap.set(e, {overflow: 'hidden'});
                            let {id} = e;
                        	e = document.querySelector(`#${e.id} img, #${e.id} span`)
                            delete set.particulars[id].child
                        }
                        let partChild = Object.keys(set.particulars).find(p => $(e).parents('#'+p).length == 1)
                        if (e.id in set.particulars) {
                            g = {...set.particulars[e.id]}
                        } else if (partChild) {
                        	g = {...set.particulars[partChild]}
                        } else {
                          g = {...tween}
                        }
                        if (i > 0) p = '<'+g.stagger
                        if (/fromTo/.test(set.type)) timelineP.fromTo(e, d, set.from, set.to, p)
                        else timelineP[set.type || 'from'](e, d, { ...g }, p)
                      })
              	 }
            }
        })
    } else {
        if (c && c.target) {
            let els = getByTarget(c.target)
            elementsL = els[0]
            elementsP = els[1]
        }

      	if (c.call) {
        	timelineL.call(c.call, c.params, c.position)
            timelineP.call(c.call, c.params, c.position)
        } else {
         	if (elementsL.length && !onlyP && !(c.P && !c.L)) elementsL.map((e, i) => generateTweens(e, i, timelineL))
        	if (elementsP.length && !onlyL && !(!c.P && c.L)) elementsP.map((e, i) => generateTweens(e, i, timelineP))
        }
    }
  	function getParticulars(tween) {
      	let o = {...tween}
      	let elementsL = getAll('L')
    	let elementsP = getAll('P')
        let particulars = {}
        Object.keys(o).forEach(k => {
            elementsL.forEach(e => handleParticulars(e, k, o))
            elementsP.forEach(e => handleParticulars(e, k, o))
        })
        if (!Object.keys(o).length) {
            elementsL = elementsL.filter(e => Object.keys(particulars).some(k => new RegExp(k).test(e.id)))
            elementsP = elementsP.filter(e => Object.keys(particulars).some(k => new RegExp(k).test(e.id)))
            for (const [k, v] of Object.entries(particulars)) {
                particulars[k] = { ...v, duration: o.duration, position: o.position }
            }
        }
      	function handleParticulars(e, k, c) {
          if (new RegExp('^' + k).test(e.id)) {
              let o = { ...c }
              let { type, order, rotateY, rotateX, rotateZ, perspective, include, exclude, timeline } = c[k] || {}
              if (!type) type = 'from'
              if (!order && !include) order = 'z-index'
              if (exclude && include) exclude = null
              if (include) order = include
              o = getCustomProps(o, type)
              if (o.L) o.L = getCustomProps(o.L, type)
              if (o.P) o.P = getCustomProps(o.P, type)
              if (o[k]) o[k] = getCustomProps(o[k], type)
              if (perspective) { delete o.perspective; gsap.set(e, { perspective }); o.child = true }
              if ((rotateY || rotateX || rotateZ) && !perspective) { gsap.set(e, { z: 1000 }) }
              delete o[k]
              particulars[e.id] = { ...o, ...c[k] }
        	}
    	}
      	return particulars
    }
  	function targetFromParticulars(tween, particulars) {
      	 let target = Object.keys(tween).find(k => {
         	if (Object.keys(particulars).some(p => new RegExp(`^${k}`).test(p)))
              return k
         })
         return target
    }
  	function removeParticulars(tween, particulars) {
    	  Object.keys(tween).forEach(k => {
         	if (Object.keys(particulars).some(p => new RegExp(`^${k}`).test(p)))
              delete tween[k]
         })
        return tween
    }
    function generateTweens(e, i, timeline) {
        if (!e) return
        let prt = particulars[e.id]
        let g = prt ? {} : c;
        let gL = g.L;
        let gP = g.P;
      	if (elementsL.includes(e) && gL) g = g.L
        if (elementsP.includes(e) && gP) g = g.P
        
        let p = prt && prt.position ? prt.position : position ? position : '-=0'
        let d = prt && prt.duration ? prt.duration : duration >= 0 ? duration : 1
        let t = prt && prt.type ? prt.type : g.type ? g.type : type ? type : 'from'
        if (g.rotateY || g.rotateZ || g.rotateX) g.z = $(e).width() * 2 * i
        let ovf = prt && prt.child ? prt.child : child
        if (prt) ['duration','position','child'].forEach(e => delete prt[e])
        
        if (ovf) {
            if (!c.perspective && !(prt && prt.perspective)) gsap.set(e, { overflow: 'hidden' })
            let child = document.querySelector(`#${e.id} img, #${e.id} span`)
            if (/fromTo/.test(t)) {
              	timeline[t](child, d, g.from, g.to, i > 0 ? p : '')
            } else {
            	timeline[t](child, d, { ...g, ...prt }, i > 0 ? p : '')
            }
        } else {
            if (/fromTo/.test(t)) {
              	timeline[t](e, d, g.from || prt.from, g.to || prt.to, i > 0 ? p : '')
            } else {
                timeline[t](e, d, { ...g, ...prt }, i > 0 ? p : '')
        	}
        }
    }
  	function isHTML(a) {
    	return a instanceof HTMLElement || a instanceof HTMLCollection
    }
    function getByTarget(target) {
        if (target) {
            let elementsL = []
            let elementsP = []
            let elements = []
            if (isHTML(target)) {
            	if (target instanceof HTMLElement) {
                	if (document.querySelector('.landscape #' + target.id)) {
                        elementsL.unshift(target)
                    }
                    if (document.querySelector('.portrait #' + target.id)) {
                        elementsP.unshift(target)
                    }
                }
                if (target instanceof HTMLCollection) {
                  	for (e of target) {
                      if (document.querySelector('.landscape #' + e.id)) {
                          elementsL.unshift(e)
                      }
                      if (document.querySelector('.portrait #' + e.id)) {
                          elementsP.unshift(e)
                      }
                    }
                }
            }
            else if (target instanceof jQuery) {
                if (document.querySelector('.landscape #' + target[0].id)) {
                    elementsL.unshift(target)
                }
                if (document.querySelector('.portrait #' + target[0].id)) {
                    elementsP.unshift(target)
                }
           }
           else if (/\#|\./.test(target) && !/\s\d+/.test(target)) {
                elements = Array.prototype.slice.call(document.querySelectorAll(target))
                elements.map(e => {
                    if (document.querySelector('.landscape #' + e.id)) {
                        elementsL.unshift(e)
                    }
                    if (document.querySelector('.portrait #' + e.id)) {
                        elementsP.unshift(e)
                    }
                })
           }
           else {
                elementsL = getAll('L')
                elementsP = getAll('P')
                if (target !== 'all') {
                    target = target.split(',').map(i => i.trim())
                    let eL = []
                    let eP = []
                    target.map(t => {
                      	let nChild
                      	if (/[a-zA-Z\-\_]+\s\d+/.test(t)) {nChild = parseInt(t.split(' ')[1]) - 1; t = t.split(' ')[0]}
                      	let rs = `^${t}${/[0-9]/.test(t) ? '' : '(\\d+)?'}(?:_1|P|Portrait|L|LS|Landscape)?$`
                        if (/\*/.test(t)) {
                          t = t.replace(/\*/, '');
                          rs = `^${t}`
                        }
                        let re = new RegExp(rs)
                      	const s = (a,b) => parseInt(a.id.replace(/[^0-9]|_1/g, '')) - parseInt(b.id.replace(/[^0-9]|_1/g, ''))
                        elementsL.filter(e => re.test(e.id)).sort(s).forEach(e => eL.push(e))
                        elementsP.filter(e => re.test(e.id)).sort(s).forEach(e => eP.push(e))
                        if (nChild && eL.length > nChild) {
                        	eL = [eL[nChild]]
                            eP = [eP[nChild]]
                        }
                    })
                    elementsL = eL
                    elementsP = eP
                }
            }
            if (isObject(c) && 'target' in c) delete c.target
            return [elementsL, elementsP]
        }
    }
    function generateClipPath(path, tween, type) {
        let top = /top/.test(path)
        let bottom = /bottom/.test(path)
        let left = /left/.test(path)
        let right = /right/.test(path)
        let result
        if (/circle/.test(path)) {
            let f = type === 'from'?'circle(0%)':'circle(100%)'
            let t = type === 'from'?'circle(100%)':'circle(0%)'
            tween.from = {...tween, webkitClipPath: f, clipPath: f}
            tween.to = {webkitClipPath: t, clipPath: t}
            tween.type = 'fromTo'
            return tween
        }
        else if (/center/.test(path)) {
           result = 'inset(50% 50% 50% 50%)'
        }
        else {
           result = `inset(${bottom ? '100%' : '0'} ${left ? '100%' : '0'} ${top ? '100%' : '0'} ${right ? '100%' : '0'})`
        }
      	tween.webkitClipPath = result
        tween.clipPath = result
        delete tween.clip
        return tween
    }
    function generateShadow(shadow, tween) {
       if (shadow && tween && isObject(tween)) {
                let result
              	if (Array.isArray(shadow)) result = `drop-shadow(0 0 ${shadow.find(s => s > 1)}px rgba(0,0,0,${shadow.find(s => s <= 1 && s > 0)}))`
                if (typeof shadow === 'number') result = `drop-shadow(0 0 8px rgba(0,0,0,${shadow}))`
                tween.webkitFilter = result
                tween.filter = result
                delete tween.shadow
                return tween
            }
    }
  	function generateMask(mask, tween, type) {
       if (mask && tween && isObject(tween)) {
          		let result;
         		let radial = /radial/.test(mask)
        		let left = /left/.test(mask), right = /right/.test(mask), top = /top/.test(mask), bottom = /bottom/.test(mask);
         		let full = [left,right,top,bottom].filter(m => m).length === 1
                let f = `linear-gradient(${left || right ? 90 : 0}deg, rgba(0,0,0,${full ? 1 : 0}) 0%`;
                let t = f;
         		let s = /[0-9]/.test(mask) ? ',' : ' '
                if (radial) {
                	 let percent = /\s\d+/.test(mask) ? parseInt(mask.match(/\s\d+/)[0].trim()) : 0;
                     let blur = /\.\d+/.test(mask) ? parseFloat(mask.match(/\.\d+/)[0].trim()) * 100 : 20;
 					 f = `radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${percent}%, rgba(0,0,0,0) ${percent + blur}%, rgba(0,0,0,0) 100%)`;
                     t = `radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%, rgba(0,0,0,0) 100%, rgba(0,0,0,0) 100%)`;
                }
                else {
                    if (full) {
                     let m = mask.match(/\w+/)[0];
                     let first = /left|top/.test(m) ? 1 : 0;
                     let last = first ? 0 : 1;
                     let midf = first ? 0 : 100;
                     let midt = midf ? 0 : 100;
                     let percent = /\.?\d+/.test(m) ? parseInt(m.match(/\.?\d+/)[0]) : 100;
                     f = `linear-gradient(${left || right ? 90 : 0}deg, rgba(0,0,0,${first}) 0%, rgba(0,0,0,1) ${midf}%, rgba(0,0,0,${last}) 100%)`;
                     t = `linear-gradient(${left || right ? 90 : 0}deg, rgba(0,0,0,${first}) 0%, rgba(0,0,0,1) ${midt}%, rgba(0,0,0,${last}) 100%)`;
                  	} else {
                      mask.split(s).map((m,i) => {
                        let left = /left/.test(m), right = /right/.test(m), top = /top/.test(m), bottom = /bottom/.test(m);
                        let percent = /\.?\d+/.test(m) ? parseInt(m.match(/\.?\d+/)[0]) : 50;
                        let end =  ', rgba(0,0,0,0) 100%)'
                        if (percent < 1 && percent > 0) percent *= 10;
                        f += `, rgba(0,0,0,1) ${left || top ? percent : (100 - percent)}%${i <  mask.split(s).length - 1 ? '' : end}`
                        t += `, rgba(0,0,0,1) ${left || top ? 0 : 100}%${i < mask.split(s).length - 1 ? '' : end}`
                      })
                  	}
                }
                if (type === 'set') {
                	result = f;
                    tween = {...tween, maskImage: result}
                }
                else if (type === 'from') {
                  tween.from = { maskImage: f }
                  tween.to = { maskImage: t}
                  tween.type = 'fromTo'
                }
         		else if (type === 'to') {
                  tween.from = { maskImage: t }
                  tween.to = { maskImage: f }
                  tween.type = 'fromTo'
                }
                delete tween.mask
                return tween
            }
    }
  	function getCustomProps(tween, type) {
      
        let { loop, easeInOut, easeIn, easeOut, ease, rotateY, rotateX, rotateZ, perspective, mask, clip, shadow } = tween || {}
        if (loop) { delete tween.loop; tween.yoyo = true; tween.repeat = loop }
        if (ease === 'none') tween.ease = Power0.easeNone
        if (easeIn) { tween = getEase(easeIn, 'easeIn', tween) }
        if (easeOut) { tween = getEase(easeOut, 'easeOut', tween)}
        if (easeInOut) { tween = getEase(easeInOut, 'easeInOut', tween)}
        if (clip) { tween = generateClipPath(clip, tween, type) }
        if (perspective) { delete tween.perspective; gsap.set('section', { perspective }) }
        if (shadow) {tween = generateShadow(shadow, tween)}
        if (mask) {tween = generateMask(mask, tween, type)}
    	return tween
    }
    function getEase(ease, name, tween) {
        let result = ease === 1 ? Power1[name] :
                     ease === 2 ? Power2[name] :
                     ease === 3 ? Power3[name] :
                     ease === 4 ? Power4[name] :
                                  Power2[name]
        tween.ease = result
        delete tween[name]
        return tween
    }
    function getObject(ar) {
        return Array.from(ar).find(a => isObject(a))
    }
   	function isObject(a) {
    	return typeof a === 'object' && !Array.isArray(a) && !(a instanceof HTMLCollection) && !(a instanceof HTMLElement) && !(a instanceof jQuery)
	}
    function isFunction(a) {
    	return typeof a === 'function'
	}
  	function isRequested(e) {
      	let r = false
      	if (sets && Array.isArray(sets)) {
        	r = sets.some(s => new RegExp('^' + s.target).test(e.id))
        } 
      	if (c && isObject(c)){
          	r = Object.keys(c).some(i => i && new RegExp('^' + i).test(e.id))
        }
      	if (c && c.target) {
        	r = new RegExp(e.id.replace(/(?:_1|P|L|LS|Landscape|Portrait)$/, '')).test(c.target)
        }
        return r
    }
    function getAll(r) {
        let elements = Array.prototype.slice.call(document.querySelectorAll(r === 'L' ? '.landscape div' : '.portrait div'))
        return elements.filter(e =>
            !(($(e).width() >= (r === 'L' ? 1424 : 1040) && $(e).height() >= (r === 'L' ? 1000 : 1360)) && !isRequested(e))
        ).filter(e =>
            !(/hitarea/.test(e.getAttribute('data-type')) && !isRequested(e))
        ).filter(e =>
            !(/background/.test(e.getAttribute('data-type')))
        ).filter(e => !(e.id === 'container' && !e.getAttribute('data-type')))
            .filter(e => !$(e).parent().hasClass('vp-container') && !$(e).hasClass('vp-clickmask'))
            .filter(e => e.id)
        
    }
    if (!onlyL && !onlyP)
        return [timelineL, timelineP]
    if (onlyL)
        return timelineL
    if (onlyP)
        return timelineP
}