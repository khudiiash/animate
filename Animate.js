function Animate(c) {
    if (!gsap) return
    let sets;
    let onlyL = Array.from(arguments).some(a => /^(?:LS?|Landscape)$/i.test(a))
    let onlyP = Array.from(arguments).some(a => /^(?:P|Portrait)$/i.test(a))
    let paused = Array.from(arguments).some(a => /^paused?$/i.test(a))
    if (arguments.length > 1 && !Array.from(arguments).some(a => Array.isArray(a))) {
        let args = Array.from(arguments)
        c = getObject(arguments)
        args.map(a => {
            if (typeof a === 'string' && !/^(?:l|p|paused|from|to|set)$/i.test(a)) {
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
        })
    }
    if (Array.from(arguments).some(a => a instanceof Array)) {
        let tweens = Array.from(arguments).filter(a => a instanceof Array)
        let pos = Array.from(arguments).find(a => typeof a === 'string' && /\+|\-|\<|\>|\=/.test(a))
        let dur = Array.from(arguments).find(a => typeof a === 'number')
        let common = getObject(arguments)
        sets = tweens.map(arr => {
            let tween = arr.find(a => a instanceof Object)
            if (common) tween = { ...tween, ...common }
            let duration = arr.includes('set') ? 0 : arr.find(a => typeof a === 'number') || dur
            let position = arr.find(a => /\+|\-|\<|\>|\=/.test(a)) || pos
            let target = arr.find(a => typeof a === 'string' && !/^(?:from|to|set)$/i.test(a) && /[a-zA-Z]/.test(a)) || 'all'
            let type = arr.includes('set') || arr.includes('to') ? 'to' : 'from'
            let { child, loop, easeInOut, easeIn, easeOut, ease, clip, perspective } = tween
            if (child) delete tween.child
            if (loop) { delete tween.loop; tween.yoyo = true, tween.repeat = loop }
            if (ease === 'none') tween.ease = Power0.easeNone
            if (ease) { if (ease === 'none') tween.ease = Power0.easeNone }
            if (easeIn) { tween.ease = getEase(easeIn) }
            if (easeOut) { tween.ease = getEase(easeOut) }
            if (easeInOut) { tween.ease = getEase(easeInOut) }
            if (perspective) { delete tween.perspective; gsap.set('section', { perspective }) }
            if (clip) { delete tween.clip; tween = { ...tween, ...generateClipPath(clip) } }
            return { target, tween, child, duration, position, type }
        })
    }
    let { duration, position, order, child, loop, easeInOut, easeIn, easeOut, rotateY, rotateX, rotateZ, perspective, ease, clip, include, exclude, timeline, type } = c || {}
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
    if (timeline) delete c.timeline
    if (paused && !timeline) timeline = { paused: true }
    if (paused && timeline) timeline.paused = true;
    if (timeline && timeline.loop) { timeline.repeat = loop; timeline.yoyo = true }
    let timelineL = gsap.timeline(timeline)
    let timelineP = gsap.timeline(timeline)
    let elementsL = getAll(c, 'L')
    let elementsP = getAll(c, 'P')
    
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
            if ('target' in set) {
                elementsL = getByTarget(set.target, set.child)[0]
                elementsP = getByTarget(set.target, set.child)[1]
            }
            if (set.child) {
                if (!set.tween.perspective) elementsL.map(e => gsap.set(e, { overflow: 'hidden' }));
                if (!set.tween.perspective) elementsP.map(e => gsap.set(e, { overflow: 'hidden' }));
                if (elementsL[0]) elementsL = elementsL.map(e => document.querySelector(`#${e.id} img, #${e.id} span`))
                if (elementsP[0]) elementsP = elementsP.map(e => document.querySelector(`#${e.id} img, #${e.id} span`))
            }

            if (elementsL[0] && !onlyP && !(set.tween.P && !set.tween.L)) {
                let tween = set.tween.L ? set.tween.L : set.tween;
                timelineL[set.type || 'from'](elementsL, { ...tween, duration: set.duration >= 0 ? set.duration : 1 }, set.position)
            }
            if (elementsP[0] && !onlyL && !(set.tween.L && !set.tween.P)) {
                let tween = set.tween.P ? set.tween.P : set.tween;
                timelineP[set.type || 'from'](elementsP, { ...tween, duration: set.duration >= 0 ? set.duration : 1 }, set.position)
            }
        })
    } else {
        if ('target' in c) {
            let els = getByTarget(c.target)
            elementsL = els[0]
            elementsP = els[1]
        }
        if (!onlyP && !(c.P && !c.L)) elementsL.map((e, i) => generateTweens(e, i, timelineL))
        if (!onlyL && !(!c.P && c.L)) elementsP.map((e, i) => generateTweens(e, i, timelineP))
    }

    function handleParticulars(e, k, c) {
        if (new RegExp('^' + k).test(e.id)) {
            let o = { ...c }
            let { order, loop, easeInOut, easeIn, easeOut, ease, clip, rotateY, rotateX, rotateZ, perspective, include, exclude, timeline } = c[k] || {}
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
            if (clip) { delete o.clip; o = { ...o, ...generateClipPath(clip) } }
            delete o[k]
            particulars[e.id] = { ...o, ...c[k] }
        }
    }
    function generateTweens(e, i, timeline) {
        if (!e) return
        let prt = particulars[e.id]
        let g = prt ? {} : c
        let p = prt && 'position' in prt ? prt.position : position
        let d = prt && 'duration' in prt ? prt.duration : duration >= 0 ? duration : 1
        let t = prt && 'type' in prt ? prt.type : type ? type : 'from'
        if (rotateY || rotateZ || rotateX) g.z = $(e).width() * 2 * i
        let ovf = prt && 'child' in prt ? prt.child : child
        if (prt) delete prt.child
        if (ovf) {
            if (!c.perspective && !(prt && prt.perspective)) gsap.set(e, { overflow: 'hidden' })
            let child = document.querySelector(`#${e.id} img, #${e.id} span`)
            timeline[t](child, d, { ...g, ...prt }, i > 0 ? p : '')
        } else {
            timeline[t](e, d, { ...g, ...prt }, i > 0 ? p : '')
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

                elementsL = getAll(c, 'L')
                elementsP = getAll(c, 'P')

                if (target !== 'all') {
                    target = target.split(',').map(i => i.trim())
                    let eL = []
                    let eP = []
                    
                    target.map(t => {
                        let re = new RegExp(`^${t}(?:_1|P|L|LS|Landscape|Portrait)?$`)
                        eL.push(elementsL.find(e => re.test(e.id)))
                        eP.push(elementsP.find(e => re.test(e.id)))
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
    function getEase(ease) {
        return ease === 1 ? Power1[ease] :
            ease === 2 ? Power2[ease] :
                ease === 3 ? Power3[ease] :
                    ease === 4 ? Power4[ease] :
                        Power2[ease]
    }
    function getObject(ar) {
        return Array.from(ar).find(a => !Array.isArray(a) && typeof a !== 'string' && typeof a !== 'number')
    }
    function isObject(a) {
        return !Array.isArray(a) && typeof a !== 'string' && typeof a !== 'number' && typeof a !== 'number'
    }
  	function isRequested(e) {
    	return Object.keys(c).some(i => i && new RegExp('^' + i, 'i').test(e.id)) || (sets && sets.some(s => new RegExp('^' + s.target, 'i').test(e.id))) 
    }
    function getAll(c, r) {
        if (r === 'L') {
            let elementsL = Array.prototype.slice.call(document.querySelectorAll('.landscape div'))
            return elementsL.filter(e =>
                !(($(e).width() >= 1424 && $(e).height() >= 1000) && !isRequested(e))
            ).filter(e =>
                !(/hitarea|background/.test(e.getAttribute('data-type')) && !isRequested(e))
            ).filter(e => !(e.id === 'container' && !e.getAttribute('data-type')))
                .filter(e => !$(e).parent().hasClass('vp-container') && !$(e).hasClass('vp-clickmask'))
                .filter(e => e.id)

        }
        if (r === 'P') {
            let elementsP = Array.prototype.slice.call(document.querySelectorAll('.portrait div'))
            return elementsP.filter(e =>
                !(($(e).width() >= 1040 && $(e).height() >= 1360) && !!isRequested(e))
            ).filter(e =>
                !(/hitarea|background/.test(e.getAttribute('data-type')) && !isRequested(e))
            ).filter(e => !(e.id === 'container' && !e.getAttribute('data-type')))
                .filter(e => !$(e).parent().hasClass('vp-container') && !$(e).hasClass('vp-clickmask'))
                .filter(e => e.id)
        }
    }
    if (!onlyL && !onlyP)
        return [timelineL, timelineP]
    if (onlyL)
        return timelineL
    if (onlyP)
        return timelineP
}