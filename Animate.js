function Animate(c) {
    // version 1.1.0
    if (!gsap) return
    let sets;
    let onlyL = Array.from(arguments).some(a => /^(?:LS?|Landscape)$/i.test(a))
    let onlyP = Array.from(arguments).some(a => /^(?:P|Portrait)$/i.test(a))
    let paused = Array.from(arguments).some(a => /^paused?$/i.test(a))
    
    if (arguments.length > 1 && !Array.from(arguments).some(a => Array.isArray(a))) {
        let args = Array.from(arguments)
        c = getObject(arguments) || {}
        args.map(a => {
            if (typeof a === 'string' && !/^(?:l|p|paused|from|to|set|call)$/i.test(a)) {
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
        })
        if (args.filter(a => isObject(a)).length === 2) {
        	c.type = 'fromTo'
            let [f, t] = args.filter(a => isObject(a))
            c.from = f
            c.to = t       
        }
    }
    if (Array.from(arguments).some(a => a instanceof Array)) {
        let tweens = Array.from(arguments).filter(a => a instanceof Array)
        let pos = Array.from(arguments).find(a => typeof a === 'string' && /\+|\-|\<|\>|\=/.test(a))
        let dur = Array.from(arguments).find(a => typeof a === 'number')
        let common = getObject(arguments)
        sets = tweens.map(arr => {
          	let from, to;
            let tween = arr.find(a => isObject(a)) || {};
            if (common) tween = { ...tween, ...common };
            let duration = arr.includes('set') ? 0 : arr.find(a => typeof a === 'number') || dur;
            let position = arr.find(a => typeof a === 'string' && /\+|\-|\<|\>|\=/.test(a)) || pos;
            let target = arr.find(a => typeof a === 'string' && !/^(?:from|to|set)$/i.test(a) && /[a-zA-Z]/.test(a));
            let call = arr.find(a => isFunction(a));
            let params = arr.some(a => isFunction(a)) && arr.some(a => Array.isArray(a)) ? arr.find(a => Array.isArray(a)) :
            			 arr.some(a => isFunction(a)) && !arr.some(a => Array.isArray(a)) ? [] : null;
            let type = arr.includes('set') || arr.includes('to') ? 'to' : 'from';
            let { child, loop, easeInOut, easeIn, easeOut, ease, clip, shadow, perspective } = tween;
            if (child) delete tween.child;
            if (loop) { delete tween.loop; tween.yoyo = true, tween.repeat = loop };
            if (ease === 'none') tween.ease = Power0.easeNone;
            if (ease) { if (ease === 'none') tween.ease = Power0.easeNone };
            if (easeIn) { tween.ease = getEase(easeIn) };
            if (easeOut) { tween.ease = getEase(easeOut) };
            if (easeInOut) { tween.ease = getEase(easeInOut) };
            if (perspective) { delete tween.perspective; gsap.set('section', { perspective }) };
            if (shadow) {tween = generateShadow(shadow, tween)};
            if (clip) { delete tween.clip; tween = { ...tween, ...generateClipPath(clip) } };
            if (call) {  type = 'call', tween = null, target = null };
            if (arr.filter(a => isObject(a)).length === 2) {
                type = 'fromTo';
                let [f, t] = arr.filter(a => isObject(a));
                from = f;
                to = t;       
            };
            return { target, tween, child, duration, position, type, call, params, from, to };
        })
    }
  	if (arguments.length === 1 && isFunction(c)) {c = {call: c, params: [], position: '', type: 'call'}};

    let { duration, position, order, child, loop, easeInOut, easeIn, easeOut, rotateY, rotateX, rotateZ, perspective, ease, clip, shadow, include, exclude, timeline, type } = c || {}
    if (!order && !include) order = 'z-index'
    if (exclude && include) exclude = null
    if (include) order = include
    if (duration) delete c.duration
    if (position) delete c.position
    if (type) delete c.type
    if (loop) { delete c.loop; c.yoyo = true; c.repeat = loop }
    if (ease) { if (ease === 'none') c.ease = Power0.easeNone }
    if (easeIn) { delete c.easeIn; c.ease = getEase(easeIn) }
    if (easeOut) { delete c.easeOut; c.ease = getEase(easeOut) }
    if (easeInOut) { delete c.easeInOut; c.ease = getEase(easeInOut) }
    if (clip) { delete c.clip; c = { ...c, ...generateClipPath(clip) } }
    if (perspective) { delete c.perspective; gsap.set('section', { perspective }) }
  	if (shadow) {c = generateShadow(shadow, c)}
    if (timeline) delete c.timeline
    if (paused && !timeline) timeline = { paused: true }
    if (paused && timeline) timeline.paused = true;
    if (timeline && timeline.loop) { timeline.repeat = loop; timeline.yoyo = true }
    let timelineL = gsap.timeline(timeline)
    let timelineP = gsap.timeline(timeline)
    let elementsL = getAll('L')
    let elementsP = getAll('P')
    let particulars = {}
    Object.keys(c).forEach(k => {
        elementsL.forEach(e => handleParticulars(e, k, c))
        elementsP.forEach(e => handleParticulars(e, k, c))
    })
    Object.keys(c).forEach(k => {
        elementsL.forEach(e => {
            if (new RegExp('^' + k).test(e.id)) {
                delete c[k]
            }
        })
        elementsP.forEach(e => {
            if (new RegExp('^' + k).test(e.id)) {
                delete c[k]
            }
        })
    })
    if (!Object.keys(c).length) {
        elementsL = elementsL.filter(e => Object.keys(particulars).some(k => new RegExp(k).test(e.id)))
        elementsP = elementsP.filter(e => Object.keys(particulars).some(k => new RegExp(k).test(e.id)))
        for (const [k, v] of Object.entries(particulars)) {
            particulars[k] = { ...v, duration, position }
        }
    }
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
        elementsL = eL;
        elementsP = eP;
    }
    if (sets) {
        sets.map(set => {
            if (set.target) {
                elementsL = getByTarget(set.target, set.child)[0]
                elementsP = getByTarget(set.target, set.child)[1]
            }
            if (set.child) {
                if (!set.tween.perspective) elementsL.map(e => gsap.set(e, { overflow: 'hidden' }));
                if (!set.tween.perspective) elementsP.map(e => gsap.set(e, { overflow: 'hidden' }));
                if (elementsL[0]) elementsL = elementsL.map(e => document.querySelector(`#${e.id} img, #${e.id} span`))
                if (elementsP[0]) elementsP = elementsP.map(e => document.querySelector(`#${e.id} img, #${e.id} span`))
            }
			if (set.type === 'call') {
            	timelineL.call(set.call, set.params, set.position)
            }
          	else {
                 let d = set.duration >= 0 ? set.duration : 1;
                 let p = set.position ? set.position : '';
                 ['duration', 'position'].map(k => delete set[k])
             	 if (elementsL[0] && !onlyP && !(set.tween.P && !set.tween.L)) {
                    let tween = set.tween.L ? set.tween.L : set.tween;
                   	if (/fromTo/.test(set.type)) timelineL.fromTo(elementsL, d, set.from, set.to, p)
					else timelineL[set.type || 'from'](elementsL, d, { ...tween }, p)
              	 }
                 if (elementsP[0] && !onlyL && !(set.tween.L && !set.tween.P)) {
                    let tween = set.tween.P ? set.tween.P : set.tween;
                    if (/fromTo/.test(set.type)) timelineL.fromTo(elementsL, d, set.from, set.to, p)
					else timelineL[set.type || 'from'](elementsL, d, { ...tween }, p)
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
         	if (!onlyP && !(c.P && !c.L)) elementsL.map((e, i) => generateTweens(e, i, timelineL))
        	if (!onlyL && !(!c.P && c.L)) elementsP.map((e, i) => generateTweens(e, i, timelineP))
        }
    }
    function handleParticulars(e, k, c) {
        if (new RegExp('^' + k).test(e.id)) {
            let o = { ...c }
            let { order, loop, easeInOut, easeIn, easeOut, ease, clip, shadow, rotateY, rotateX, rotateZ, perspective, include, exclude, timeline } = c[k] || {}
            if (!order && !include) order = 'z-index'
            if (exclude && include) exclude = null
            if (include) order = include
            if (loop) { delete o.loop; o.yoyo = true; o.repeat = loop }
            if (ease) { if (ease === 'none') o.ease = Power0.easeNone }
            if (easeIn) { delete o.easeIn; o.ease = getEase(easeIn) }
            if (easeOut) { delete o.easeOut; o.ease = getEase(easeOut) }
            if (easeInOut) { delete o.easeInOut; o.ease = getEase(easeInOut) }
            if (perspective) { delete o.perspective; gsap.set(e, { perspective }); o.child = true }
            if ((rotateY || rotateX || rotateZ) && !perspective) { gsap.set(e, { z: 1000 }) }
            if (shadow) {o = generateShadow(shadow, o)}
            if (clip) { delete o.clip; o = { ...o, ...generateClipPath(clip) } }
            delete o[k]
            particulars[e.id] = { ...o, ...c[k] }
        }
    }
    function generateTweens(e, i, timeline) {
        if (!e) return
        let prt = particulars[e.id]
        let g = prt ? {} : c
        let p = prt && prt.position ? prt.position : position
        let d = prt && prt.duration ? prt.duration : duration >= 0 ? duration : 1
        let t = prt && prt.type ? prt.type : type ? type : 'from'
        if (rotateY || rotateZ || rotateX) g.z = $(e).width() * 2 * i
        let ovf = prt && prt.child ? prt.child : child
        if (prt) ['duration', 'position','child'].forEach(e => delete prt[e]);
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
              timeline[t](e, d, g.from, g.to, i > 0 ? p : '')
            } else {
            timeline[t](e, d, { ...g, ...prt }, i > 0 ? p : '')
        	}
        }
       
    }
    function getByTarget(target) {
        if (target) {
            let elementsL = []
            let elementsP = []
            let elements = []
            if (/\#|\./.test(target)) {
                elements = Array.prototype.slice.call(document.querySelectorAll(target))
                elements.map(e => {
                    if (document.querySelector('.landscape #' + e.id)) {
                        elementsL.unshift(e)
                    }
                    if (document.querySelector('.portrait #' + e.id)) {
                        elementsP.unshift(e)
                    }
                })
            } else {
                elementsL = getAll('L')
                elementsP = getAll('P')
                if (target !== 'all') {
                    target = target.split(',').map(i => i.trim())
                    let eL = []
                    let eP = []
                    target.map(t => {
                        let re = new RegExp(`^${t}`)
                      	const s = (a,b) => parseInt(a.id.replace(/[^0-9]|_1/g, '')) - parseInt(b.id.replace(/[^0-9]|_1/g, ''))
                        elementsL.filter(e => re.test(e.id)).sort(s).forEach(e => eL.push(e))
                        elementsP.filter(e => re.test(e.id)).sort(s).forEach(e => eP.push(e))
                    })
                    elementsL = eL
                    elementsP = eP
                }
            }
            if (isObject(c) && 'target' in c) delete c.target
            return [elementsL, elementsP]
        }
    }
    function generateClipPath(path) {
        let top = /top/.test(path)
        let center = /center/.test(path)
        let bottom = /bottom/.test(path)
        let left = /left/.test(path)
        let right = /right/.test(path)
        if (center) {
            return { webkitClipPath: `inset(50% 50% 50% 50%)`, clipPath: `inset(50% 50% 50% 50%)` }
        } else {
            return { webkitClipPath: `inset(${bottom ? '100%' : '0'} ${left ? '100%' : '0'} ${top ? '100%' : '0'} ${right ? '100%' : '0'})`, clipPath: `inset(${bottom ? '100%' : '0'} ${left ? '100%' : '0'} ${top ? '100%' : '0'} ${right ? '100%' : '0'})` }
        }
    }
    function generateShadow(shadow, tween) {
       if (shadow && tween && isObject(tween)) {
                let result;
              	if (Array.isArray(shadow)) result = `drop-shadow(0 0 ${shadow.find(s => s > 1)}px rgba(0,0,0,${shadow.find(s => s <= 1 && s > 0)}))`
                if (typeof shadow === 'number') result = `drop-shadow(0 0 8px rgba(0,0,0,${shadow}))`
                tween.webkitFilter = result
                tween.filter = result
                delete tween.shadow;
                return tween
            }
    }
    function getEase(ease) {
        return ease === 1 ? Power1[ease] :
               ease === 2 ? Power2[ease] :
               ease === 3 ? Power3[ease] :
               ease === 4 ? Power4[ease] :
                            Power2[ease]
    }
    function getObject(ar) {
        return Array.from(ar).find(a => isObject(a))
    }
   	function isObject(a) {
    	return typeof a === 'object' && !Array.isArray(a)
	}
   function isFunction(a) {
    	return typeof a === 'function'
	}
  	function isRequested(e) {
      	let r = false;
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