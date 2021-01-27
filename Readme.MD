# Animate
A GSAP addon for Sparkflow
  - Less code
  - Additional properties
  - Compatability improved
  - More flexibility

# [CDN](https://cdn.jsdelivr.net/gh/khudiiash/animate/Animate.js) | [Documentation](https://docs.google.com/document/d/1dgcEFdc2rYj9XGm4GVx2okL93PnzunKSXikvOr7ADTg/edit?usp=sharing)

# All at once
    gsap.timeline()
        .from('#headline', { y: 15, opacity: 0})
        .from('#copy', { y: 15, opacity: 0}, "<.2")
        .from('#logo', {y: 15, opacity: 0}, "<.2")
        .from('#copy1', {y: -15, opacity: 0}, "<.2")
        .from('#copy2', {scale: 0}, "<.2")
    gsap.timeline()
        .from('#headline_1', { y: 15, opacity: 0})
        .from('#copy_1', { y: 15, opacity: 0}, "<.2")
        .from('#logo_1', {y: 15, opacity: 0}, "<.2")
        .from('#copy1_1', {y: -15, opacity: 0}, "<.2")
        .from('#copy2_1', {scale: 0}, "<.2")

    // equals

    Animate({y: 15, opacity: 0, copy2: {scale: 0}})


# Less code - better code
    gsap.timeline()
        .from('#headline', { webkitClipPath: 'inset(0 0 100% 0)', clipPath: 'inset(0 0 100% 0)', opacity: 0, repeat: 1, yoyo: true})
        .from('#subheader', { webkitClipPath: 'inset(0 0 100% 0)', clipPath: 'inset(0 0 100% 0)', opacity: 0, repeat: 1, yoyo: true}, '<.2')
        .staggerFrom(['#copyl', '#copy2', '#copy3', '#copy4'], {y: 15, opacity: 0}, .1, "<.2")
        .staggerTo('#copy1', '#copy2', '#copy3', '#copy4', {y: -15, opacity: 0}, .1, "+=1")
        .from('#product img', {yPercent: 100, opacity: 0}, "]-1") .from('#cta', {x: -25, opacity: 0,}, .1, "+=1")
    gsap.timeline()
        .from('#headline_1', {webkitClipPath: 'inset(0 0 100 % 0)', clipPath: 'inset(0 0 100 % 0)', repeat: 1, yoyo: true})
        .from('#subheader_1', {webkitClipPath: 'inset(0 0 100 % 0)', clipPath: 'inset(0 0 100 % 0)', repeat: 1, yoyo: true}, '<.2')
        .staggerFrom('#copy1_1', '#copy2_1', '#copy3_1', '#copy4_1', {y: 15, opacity: 0}, .1, "<.2")
        .to('#copy1_1', '#copy2_1', '#copy3_1', '#copy4', {y: -15, opacity: 0}, "+=1")
        .from('#product_1 img', {yPercent: 100}, "<.2") .from('#cta_1', {y: 25}, .1, "<.2") 

    // equals

    Animate(
        ['headline', {clip: 'top', loop: 1}],
        ['subheader', {clip: 'top', loop: 1}],
        ['copy, copy2, copy3, copy4', { y: 15, stagger: .1 }],
        ['copy, copy2, copy3, copy4', 'to', {y: 15, stagger: .1}, '+=1'],
        ['product', { child: true, yPercent: 100 }],
        ['cta', { L: { x: -25 }, P: { y: 25 }}],
        { opacity: 0 }, '<.2'
    )

# Setting properties faster

    gsap.set('#logo_1, #copy_1, #cta_1, #legal_1, #headline_1', {scale: .8})
    gsap.set('#cta_1', {x: 15})
    gsap.set('#legal_1', {x: 35}) 

    // equals

    Animate('P', 'set', {scale: .8, cta: {x: 15}, legal: {x: 35}})

# Compatability issues solved
    // 3D rotate with no perspective (Safari friendly)
    
    gsap.set('#element', {z: 200})
    gsap.to('#element', {rotateY: 360}) 
    
    // equals
    
    Animate('#element', 'to', {rotateY: 360}) 
    
    // 3D rotate with perspective (Safari friendly)
    
    gsap.set('#element', {perspective: 1000})
    gsap.to('#element img', {rotateY: 360}) 

    // equals

    Animate('#element', 'to', {rotateY: 360, perspective: 1000}) 

# Short parameters

    gsap.from('#element', 1.2, {
        webkitClipPath: 'inset(0 0 100% 0)',
        clipPath:  'inset(0 0 100% 0)',
        yoyo: true,
        repeat: 1,
        ease: Power2.easeInOut
    })

    // equals

    Animate('#element', 1.2, {clip: 'top', loop: 1, easeInOut: 2})