import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'
import { clsx, ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for Tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Safe Icon Component
const SafeIcon = ({ name, size = 24, className, color }) => {
  const icons = {
    'menu': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
    'x': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
    'arrow-right': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    'arrow-left': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M12 19l-7-7 7-7"/><path d="M19 12H5"/></svg>,
    'chevron-right': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="m9 18 6-6-6-6"/></svg>,
    'activity': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>,
    'zap': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    'circle': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><circle cx="12" cy="12" r="10"/></svg>,
    'triangle': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>,
    'diamond': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/></svg>,
    'hexagon': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    'external-link': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>,
  }

  return icons[name] || icons['circle']
}

// ============================================
// CUSTOM LIQUID CURSOR
// ============================================
const LiquidCursor = () => {
  const cursorRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const lastPos = useRef({ x: 0, y: 0 })
  const rafId = useRef(null)

  const springConfig = { damping: 25, stiffness: 300 }
  const cursorX = useSpring(0, springConfig)
  const cursorY = useSpring(0, springConfig)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const currentX = e.clientX
      const currentY = e.clientY

      // Calculate velocity for deformation
      const vx = currentX - lastPos.current.x
      const vy = currentY - lastPos.current.y
      const speed = Math.sqrt(vx * vx + vy * vy)

      setVelocity({ x: vx, y: vy, speed })
      lastPos.current = { x: currentX, y: currentY }

      cursorX.set(currentX)
      cursorY.set(currentY)
    }

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseout', handleMouseOut, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [cursorX, cursorY])

  const deformScale = Math.min(velocity.speed * 0.02, 1.5)
  const deformRotate = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)

  return (
    <motion.div
      ref={cursorRef}
      className="custom-cursor fixed top-0 left-0 pointer-events-none z-[10000] mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        className="relative"
        animate={{
          scale: isHovering ? 2 : 1 + deformScale * 0.3,
          rotate: deformRotate,
          width: isHovering ? 40 : 24 + deformScale * 10,
          height: isHovering ? 40 : 24 - deformScale * 5,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      >
        <div className="w-full h-full rounded-full bg-white/90 blur-[2px]" />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(200,200,200,0.8))',
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  )
}

// ============================================
// GRAVITY NAVIGATION
// ============================================
const GravityNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const navItems = ['PROTOCOL', 'VAULT', 'PULSE', 'ACCESS']

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            className="font-serif text-xl tracking-widest chrome-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            AETHER
          </motion.div>

          <div className="hidden md:flex items-center gap-12">
            {navItems.map((item, index) => (
              <GravityNavItem
                key={item}
                label={item}
                index={index}
                isHovered={hoveredItem === item}
                onHover={() => setHoveredItem(item)}
                onLeave={() => setHoveredItem(null)}
              />
            ))}
          </div>

          <motion.button
            className="md:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <SafeIcon name="x" size={24} /> : <SafeIcon name="menu" size={24} />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/95 backdrop-blur-xl z-40 flex items-center justify-center"
          >
            <div className="flex flex-col gap-8 text-center">
              {navItems.map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsOpen(false)}
                  className="font-serif text-4xl text-white hover:text-orange-500 transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const GravityNavItem = ({ label, index, isHovered, onHover, onLeave }) => {
  const itemRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!itemRef.current) return
    const rect = itemRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = e.clientX - centerX
    const distY = e.clientY - centerY

    // Magnetic pull effect
    setPosition({
      x: distX * 0.3,
      y: distY * 0.3,
    })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
    onLeave()
  }

  return (
    <motion.div
      ref={itemRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={onHover}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      <a
        href={`#${label.toLowerCase()}`}
        className="font-mono text-xs tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative block py-2"
      >
        <span className="relative z-10">{label}</span>

        {/* Distortion effect on hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -inset-4 bg-gradient-radial from-orange-500/10 to-transparent rounded-full blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.5, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-1/2 -translate-y-1/2 -left-6 w-4 h-[1px] bg-orange-500"
              />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.5, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-1/2 -translate-y-1/2 -right-6 w-4 h-[1px] bg-orange-500"
              />
            </>
          )}
        </AnimatePresence>
      </a>
    </motion.div>
  )
}

// ============================================
// LIQUID MERCURY SPHERE
// ============================================
const LiquidMercurySphere = () => {
  const sphereRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isNear, setIsNear] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [shattered, setShattered] = useState(false)

  const { scrollY } = useScroll()

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sphereRef.current) return
      const rect = sphereRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX * distX + distY * distY)

      setMousePos({ x: distX / 20, y: distY / 20 })
      setIsNear(distance < 300)
    }

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (window.innerHeight * 0.5)
      setScrollProgress(Math.min(scrollPercent, 1))

      if (scrollPercent > 0.8 && !shattered) {
        setShattered(true)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [shattered])

  const scale = useTransform(scrollY, [0, 500], [1, 0.5])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Shattered Droplets */}
      <AnimatePresence>
        {shattered && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 0.8
                }}
                animate={{
                  scale: Math.random() * 0.3 + 0.1,
                  x: (Math.random() - 0.5) * 800,
                  y: (Math.random() - 0.5) * 800 - 200,
                  opacity: 0
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: [0.23, 1, 0.32, 1]
                }}
                className="absolute w-32 h-32 rounded-full liquid-sphere"
                style={{
                  filter: 'blur(1px)',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Sphere */}
      <motion.div
        ref={sphereRef}
        className="relative"
        style={{ scale, opacity }}
      >
        <motion.div
          className="w-64 h-64 md:w-96 md:h-96 rounded-full liquid-sphere relative"
          animate={{
            scale: isNear ? [1, 1.05, 1] : 1,
            rotateX: mousePos.y,
            rotateY: mousePos.x,
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: isNear ? Infinity : 0,
              ease: 'easeInOut',
            },
            rotateX: { type: 'spring', stiffness: 100, damping: 20 },
            rotateY: { type: 'spring', stiffness: 100, damping: 20 },
          }}
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: isNear
              ? '0 0 100px rgba(255, 255, 255, 0.3), inset 0 0 60px rgba(255, 255, 255, 0.2)'
              : '0 0 60px rgba(255, 255, 255, 0.1), inset 0 0 40px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Inner glow */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />

          {/* Highlight reflection */}
          <motion.div
            className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/60 blur-md"
            animate={{
              x: mousePos.x * 2,
              y: mousePos.y * 2,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
        </motion.div>

        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-orange-500"
            animate={{
              x: [0, Math.cos(i * 2.09) * 200, 0],
              y: [0, Math.sin(i * 2.09) * 200, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
              ease: 'easeInOut',
            }}
            style={{
              translateX: '-50%',
              translateY: '-50%',
              boxShadow: '0 0 10px #FF4D00',
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

// ============================================
// HERO SECTION
// ============================================
const HeroSection = () => {
  return (
    <section id="protocol" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }} />
      </div>

      {/* Liquid Sphere */}
      <LiquidMercurySphere />

      {/* Headline with Chrome Masking Effect */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-center leading-none">
          <span className="block chrome-text" style={{
            backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #c0c0c0 25%, #ffffff 50%, #a0a0a0 75%, #ffffff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            WEALTH IN
          </span>
          <span className="block chrome-text" style={{
            backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #c0c0c0 25%, #ffffff 50%, #a0a0a0 75%, #ffffff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            FLUID MOTION
          </span>
        </h1>
      </motion.div>

      {/* Technical Data Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-12 left-8 font-mono text-[10px] text-gray-500 tracking-widest hidden md:block"
      >
        <div className="flex flex-col gap-1">
          <span>LIQUIDITY_DEPTH: 99.97%</span>
          <span>FLOW_RATE: OPTIMAL</span>
          <span>PROTOCOL_STATUS: ACTIVE</span>
          <span className="text-orange-500">AETHER_CORE: ONLINE</span>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-12 right-8 flex items-center gap-4"
      >
        <span className="font-mono text-[10px] text-gray-500 tracking-widest">SCROLL</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <SafeIcon name="chevron-right" size={16} className="text-gray-500 rotate-90" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ============================================
// ALCHEMICAL VAULT SECTION
// ============================================
const AlchemicalVault = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-50%'])
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 180, 360])

  const assets = [
    { symbol: 'AU', name: 'GOLD', color: 'from-yellow-400 to-yellow-600' },
    { symbol: 'BTC', name: 'BITCOIN', color: 'from-orange-400 to-orange-600' },
    { symbol: 'USD', name: 'DOLLAR', color: 'from-green-400 to-green-600' },
    { symbol: 'ETH', name: 'ETHEREUM', color: 'from-purple-400 to-purple-600' },
    { symbol: 'AU', name: 'GOLD', color: 'from-yellow-400 to-yellow-600' },
    { symbol: 'BTC', name: 'BITCOIN', color: 'from-orange-400 to-orange-600' },
  ]

  return (
    <section id="vault" className="relative py-32 overflow-hidden" ref={containerRef}>
      <div className="px-8 mb-16">
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="font-serif text-6xl md:text-8xl font-black chrome-text mb-4"
        >
          THE ALCHEMICAL
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif text-6xl md:text-8xl font-black text-orange-500"
        >
          VAULT
        </motion.h2>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative h-[600px] overflow-hidden">
        <motion.div
          className="absolute flex gap-8 px-8"
          style={{ x }}
        >
          {assets.map((asset, index) => (
            <GlassShard
              key={index}
              asset={asset}
              index={index}
              scrollProgress={scrollYProgress}
            />
          ))}
        </motion.div>

        {/* Liquid Stream Effect */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
          style={{
            opacity: useTransform(scrollYProgress, [0.3, 0.7], [0, 1]),
          }}
        />
      </div>

      {/* Technical specs */}
      <div className="px-8 mt-16 grid md:grid-cols-3 gap-8">
        {[
          { label: 'TOTAL_LOCKED', value: '$2.4B' },
          { label: 'YIELD_RATE', value: '12.8%' },
          { label: 'LIQUIDITY', value: 'INSTANT' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-800 p-6 hover:border-orange-500/50 transition-colors"
          >
            <div className="font-mono text-[10px] text-gray-500 mb-2">{stat.label}</div>
            <div className="font-serif text-4xl text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const GlassShard = ({ asset, index, scrollProgress }) => {
  const rotateY = useTransform(scrollProgress, [0, 1], [0, 360 + index * 60])
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [1, 1.2, 0.8])
  const melt = useTransform(scrollProgress, [0.3, 0.7], [0, 1])

  return (
    <motion.div
      className="relative w-72 h-96 flex-shrink-0"
      style={{
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {/* Glass shard effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
        {/* Inner gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-30",
          asset.color
        )} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-transparent border border-white/30 flex items-center justify-center mb-6"
            style={{
              boxShadow: `0 0 40px rgba(255, 77, 0, ${0.3})`,
            }}
          >
            <span className="font-mono text-2xl font-bold text-white">{asset.symbol}</span>
          </motion.div>

          <h3 className="font-serif text-2xl text-white mb-2">{asset.name}</h3>
          <div className="font-mono text-[10px] text-gray-400 tracking-widest">
            ASSET_CLASS_{index + 1}
          </div>
        </div>

        {/* Melting effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/20 to-orange-500/40"
          style={{ opacity: melt }}
        />
      </div>

      {/* Reflection */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-b from-white/10 to-transparent blur-xl rounded-full" />
    </motion.div>
  )
}

// ============================================
// PULSE DATA VISUALIZATION
// ============================================
const PulseVisualization = () => {
  const canvasRef = useRef(null)
  const [ripples, setRipples] = useState([])
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = canvas.width = window.innerWidth
    let height = canvas.height = 400

    const particles = []
    const particleCount = 50

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (width / particleCount) * i,
        y: height / 2,
        baseY: height / 2,
        speed: 0.02 + Math.random() * 0.02,
        offset: Math.random() * Math.PI * 2,
        amplitude: 20 + Math.random() * 30,
      })
    }

    let time = 0

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)'
      ctx.fillRect(0, 0, width, height)

      // Draw connecting line
      ctx.beginPath()
      ctx.strokeStyle = '#FF4D00'
      ctx.lineWidth = 2

      particles.forEach((particle, i) => {
        // Heartbeat wave pattern
        const wave = Math.sin(time * particle.speed + particle.offset) * particle.amplitude
        const heartbeat = Math.sin(time * 0.1) > 0.8 ? Math.sin(time * 0.5) * 20 : 0

        particle.y = particle.baseY + wave + heartbeat

        // Apply ripple effects
        ripples.forEach(ripple => {
          const dist = Math.abs(particle.x - ripple.x)
          if (dist < ripple.radius) {
            const rippleEffect = Math.sin((dist / ripple.radius) * Math.PI) * ripple.strength
            particle.y += rippleEffect * Math.sin(time * 0.2)
          }
        })

        if (i === 0) {
          ctx.moveTo(particle.x, particle.y)
        } else {
          const prevParticle = particles[i - 1]
          const cx = (prevParticle.x + particle.x) / 2
          const cy = (prevParticle.y + particle.y) / 2
          ctx.quadraticCurveTo(prevParticle.x, prevParticle.y, cx, cy)
        }
      })

      ctx.stroke()

      // Draw glow
      ctx.shadowColor = '#FF4D00'
      ctx.shadowBlur = 20
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw particles
      particles.forEach((particle, i) => {
        if (i % 3 === 0) { // Draw every 3rd particle
          ctx.beginPath()
          ctx.fillStyle = '#FF4D00'
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
          ctx.fill()

          // Glow
          ctx.shadowColor = '#FF4D00'
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      time += 1
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = 400
      // Reinitialize particles
      particles.length = 0
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: (width / particleCount) * i,
          y: height / 2,
          baseY: height / 2,
          speed: 0.02 + Math.random() * 0.02,
          offset: Math.random() * Math.PI * 2,
          amplitude: 20 + Math.random() * 30,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [ripples])

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left

    const newRipple = {
      x,
      radius: 0,
      strength: 50,
      id: Date.now(),
    }

    setRipples(prev => [...prev, newRipple])

    // Animate ripple
    const animateRipple = () => {
      setRipples(prev => prev.map(ripple => {
        if (ripple.id === newRipple.id) {
          return {
            ...ripple,
            radius: ripple.radius + 5,
            strength: Math.max(0, ripple.strength - 1),
          }
        }
        return ripple
      }).filter(ripple => ripple.strength > 0))
    }

    const interval = setInterval(animateRipple, 16)
    setTimeout(() => clearInterval(interval), 1000)
  }

  return (
    <section id="pulse" className="relative py-32 overflow-hidden">
      <div className="px-8 mb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-serif text-6xl md:text-8xl font-black text-center mb-4"
        >
          <span className="chrome-text">THE </span>
          <span className="text-orange-500">PULSE</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-mono text-xs text-gray-500 text-center tracking-widest"
        >
          CLICK TO DISTURB THE FLOW
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative"
      >
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="w-full h-[400px] cursor-crosshair"
        />

        {/* Overlay stats */}
        <div className="absolute top-4 left-8 font-mono text-[10px] text-gray-500">
          <div>HEART_RATE: 72 BPM</div>
          <div>FLOW_STABILITY: 98.4%</div>
          <div className="text-orange-500">NETWORK_STATUS: SYNCED</div>
        </div>
      </motion.div>

      {/* Data grid */}
      <div className="px-8 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'TRANSACTIONS', value: '1.2M' },
            { label: 'VOLUME_24H', value: '$890M' },
            { label: 'GAS_FEE', value: '0.001' },
            { label: 'BLOCK_TIME', value: '2.1s' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-800 p-4 text-center hover:border-orange-500/30 transition-colors"
            >
              <div className="font-mono text-[10px] text-gray-500 mb-1">{item.label}</div>
              <div className="font-serif text-2xl text-white">{item.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// ACCESS / CTA SECTION
// ============================================
const AccessSection = () => {
  return (
    <section id="access" className="relative py-32 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-5xl md:text-7xl font-black mb-8"
        >
          <span className="chrome-text">ACCESS THE </span>
          <span className="text-orange-500">PROTOCOL</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto"
        >
          Join the future of liquid wealth. Seamless, borderless, infinite liquidity at your command.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            className="group relative px-12 py-6 bg-white text-black font-mono text-sm tracking-widest overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">INITIATE_ACCESS</span>
            <motion.div
              className="absolute inset-0 bg-orange-500"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-black font-mono text-sm tracking-widest opacity-0 group-hover:opacity-100 transition-opacity z-20">
              INITIATE_ACCESS
            </span>
          </motion.button>

          <motion.button
            className="px-12 py-6 border border-gray-700 text-white font-mono text-sm tracking-widest hover:border-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            READ_DOCS
          </motion.button>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 flex justify-center gap-8 text-gray-600"
        >
          {['AUDITED', 'INSURED', 'DECENTRALIZED'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <SafeIcon name="zap" size={12} className="text-orange-500" />
              <span className="font-mono text-[10px] tracking-widest">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// FOOTER
// ============================================
const Footer = () => {
  return (
    <footer className="border-t border-gray-800 py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="font-serif text-2xl tracking-widest chrome-text">
          AETHER
        </div>

        <div className="flex gap-8">
          {['TERMS', 'PRIVACY', 'DOCS', 'GITHUB'].map((item) => (
            <a
              key={item}
              href="#"
              className="font-mono text-[10px] text-gray-500 hover:text-white transition-colors tracking-widest"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="font-mono text-[10px] text-gray-600">
          © 2024 AETHER PROTOCOL. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  )
}

// ============================================
// MAIN APP
// ============================================
function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Custom Cursor */}
      <LiquidCursor />

      {/* Navigation */}
      <GravityNav />

      {/* Main Content */}
      <main>
        <HeroSection />
        <AlchemicalVault />
        <PulseVisualization />
        <AccessSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App