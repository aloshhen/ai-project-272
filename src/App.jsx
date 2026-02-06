import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for Tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Safe Icon Component - uses inline SVGs to avoid import issues
const SafeIcon = ({ name, size = 24, className, color }) => {
  const icons = {
    'menu': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
    'x': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
    'arrow-right': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    'chevron-right': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="m9 18 6-6-6-6"/></svg>,
    'activity': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>,
    'zap': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    'circle': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><circle cx="12" cy="12" r="10"/></svg>,
    'triangle': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>,
    'diamond': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/></svg>,
    'hexagon': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    'external-link': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>,
    'trending-up': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    'shield': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    'lock': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={color ? { color } : {}}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  }

  return icons[name] || icons['circle']
}

// ============================================
// ENHANCED CUSTOM LIQUID CURSOR
// ============================================
const LiquidCursor = () => {
  const cursorRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [velocity, setVelocity] = useState({ x: 0, y: 0, speed: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const rafId = useRef(null)

  const springConfig = { damping: 20, stiffness: 400 }
  const cursorX = useSpring(0, springConfig)
  const cursorY = useSpring(0, springConfig)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isVisible) setIsVisible(true)

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
      const target = e.target
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button') || target.closest('[data-cursor-hover]')) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = (e) => {
      const target = e.target
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button') || target.closest('[data-cursor-hover]')) {
        setIsHovering(false)
      }
    }

    // Check if device has fine pointer (mouse)
    const hasPointer = window.matchMedia('(pointer: fine)').matches
    if (!hasPointer) return

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseout', handleMouseOut, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [cursorX, cursorY, isVisible])

  const deformScale = Math.min(velocity.speed * 0.03, 1.8)
  const deformRotate = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)

  if (!isVisible) return null

  return (
    <motion.div
      ref={cursorRef}
      className="custom-cursor fixed top-0 left-0 pointer-events-none z-[10000]"
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
          scale: isHovering ? 2.5 : 1 + deformScale * 0.4,
          rotate: deformRotate,
        }}
        transition={{ type: 'spring', damping: 15, stiffness: 500 }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute -inset-4 rounded-full bg-white/20 blur-xl"
          animate={{
            scale: isHovering ? 1.5 : 1,
            opacity: isHovering ? 0.6 : 0.3,
          }}
        />

        {/* Main cursor body */}
        <motion.div
          className="relative w-6 h-6 rounded-full bg-white"
          animate={{
            width: isHovering ? 32 : 24 + deformScale * 8,
            height: isHovering ? 32 : 24 - deformScale * 4,
          }}
          style={{
            boxShadow: '0 0 20px rgba(255,255,255,0.5), inset 0 0 10px rgba(255,255,255,0.8)',
          }}
        >
          {/* Inner liquid effect */}
          <motion.div
            className="absolute inset-1 rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-300"
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

        {/* Trailing droplets for fast movement */}
        {velocity.speed > 15 && (
          <>
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-white/60"
              initial={{ scale: 1, x: 0, y: 0, opacity: 0.8 }}
              animate={{ scale: 0, x: -velocity.x * 2, y: -velocity.y * 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
              initial={{ scale: 1, x: 0, y: 0, opacity: 0.6 }}
              animate={{ scale: 0, x: -velocity.x * 3, y: -velocity.y * 3, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ============================================
// TRANSFORMING HEADER
// ============================================
const TransformingHeader = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  const navItems = ['PROTOCOL', 'VAULT', 'PULSE', 'ACCESS']

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = window.innerHeight * 0.8
      setIsScrolled(scrollY > heroHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out",
          isScrolled
            ? "w-[calc(100%-2rem)] max-w-6xl"
            : "w-[calc(100%-2rem)] max-w-[calc(100%-2rem)]"
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className={cn(
            "flex items-center justify-between px-6 py-4 backdrop-blur-xl transition-all duration-700",
            isScrolled
              ? "bg-black/60 border border-white/10 rounded-2xl shadow-2xl shadow-black/50"
              : "bg-transparent"
          )}
        >
          <motion.div
            className="font-sans text-xl font-bold tracking-tight chrome-text"
            whileHover={{ scale: 1.05 }}
          >
            AETHER
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <GravityNavItem
                key={item}
                label={item}
                index={index}
                isHovered={hoveredItem === item}
                onHover={() => setHoveredItem(item)}
                onLeave={() => setHoveredItem(null)}
                isScrolled={isScrolled}
              />
            ))}
          </div>

          <motion.button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <SafeIcon name="x" size={24} /> : <SafeIcon name="menu" size={24} />}
          </motion.button>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex items-center justify-center"
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
                  className="font-sans text-4xl font-bold text-white hover:text-orange-500 transition-colors"
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

const GravityNavItem = ({ label, index, isHovered, onHover, onLeave, isScrolled }) => {
  const itemRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!itemRef.current) return
    const rect = itemRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = e.clientX - centerX
    const distY = e.clientY - centerY

    setPosition({
      x: distX * 0.2,
      y: distY * 0.2,
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
        className="font-mono text-[11px] tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative block py-2 px-3"
      >
        <span className="relative z-10">{label}</span>

        <AnimatePresence>
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -inset-2 bg-orange-500/10 rounded-lg blur-md"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                exit={{ width: 0 }}
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent"
              />
            </>
          )}
        </AnimatePresence>
      </a>
    </motion.div>
  )
}

// ============================================
// ENHANCED 3D LIQUID MERCURY SPHERE
// ============================================
const LiquidMercurySphere = () => {
  const sphereRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isNear, setIsNear] = useState(false)
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

      setMousePos({ x: distX / 15, y: distY / 15 })
      setIsNear(distance < 400)
    }

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (window.innerHeight * 0.5)

      if (scrollPercent > 0.8 && !shattered) {
        setShattered(true)
      }
      if (scrollPercent < 0.3 && shattered) {
        setShattered(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [shattered])

  const scale = useTransform(scrollY, [0, 500], [1, 0.3])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div className="relative flex items-center justify-center min-h-screen perspective-[2000px]">
      {/* Shattered Droplets */}
      <AnimatePresence>
        {shattered && (
          <>
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * Math.PI * 2
              const distance = 300 + Math.random() * 200
              return (
                <motion.div
                  key={i}
                  initial={{
                    scale: 0.8,
                    x: 0,
                    y: 0,
                    opacity: 1
                  }}
                  animate={{
                    scale: Math.random() * 0.2 + 0.05,
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance - 100,
                    opacity: 0
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0
                  }}
                  transition={{
                    duration: 1.5 + Math.random() * 0.5,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                  className="absolute w-32 h-32 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(150,150,150,0.4), transparent)',
                    filter: 'blur(0.5px)',
                  }}
                />
              )
            })}
          </>
        )}
      </AnimatePresence>

      {/* Main Sphere Container */}
      <motion.div
        ref={sphereRef}
        className="relative"
        style={{
          scale,
          opacity,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Outer glow layer */}
        <motion.div
          className="absolute -inset-20 rounded-full pointer-events-none"
          animate={{
            background: isNear
              ? 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)',
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Main 3D Sphere with multiple layers */}
        <motion.div
          className="relative w-64 h-64 md:w-[28rem] md:h-[28rem] rounded-full"
          animate={{
            rotateX: -mousePos.y,
            rotateY: mousePos.x,
            scale: isNear ? [1, 1.03, 1] : 1,
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: isNear ? Infinity : 0,
              ease: 'easeInOut',
            },
            rotateX: { type: 'spring', stiffness: 80, damping: 15 },
            rotateY: { type: 'spring', stiffness: 80, damping: 15 },
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Layer 1: Base liquid */}
          <div className="absolute inset-0 rounded-full liquid-sphere" />

          {/* Layer 2: Inner depth shadow */}
          <div
            className="absolute inset-0 rounded-full sphere-layer-2"
            style={{ transform: 'translateZ(-10px)' }}
          />

          {/* Layer 3: Surface reflection */}
          <motion.div
            className="absolute inset-2 rounded-full sphere-layer-1"
            animate={{
              x: mousePos.x * 0.5,
              y: mousePos.y * 0.5,
            }}
            style={{ transform: 'translateZ(20px)' }}
          />

          {/* Layer 4: Chrome highlight */}
          <motion.div
            className="absolute top-4 left-4 w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/70 blur-md"
            animate={{
              x: mousePos.x * 3,
              y: mousePos.y * 3,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              transform: 'translateZ(40px)',
              filter: 'blur(8px)',
            }}
          />

          {/* Layer 5: Bottom reflection */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-white/10 blur-xl rounded-full"
            style={{ transform: 'translateZ(-30px)' }}
          />

          {/* Specular highlights */}
          <div className="absolute top-8 right-12 w-4 h-4 rounded-full bg-white/90 blur-[2px]" style={{ transform: 'translateZ(35px)' }} />
          <div className="absolute bottom-16 left-12 w-2 h-2 rounded-full bg-white/60 blur-[1px]" style={{ transform: 'translateZ(30px)' }} />
        </motion.div>

        {/* Orbiting particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            animate={{
              x: [0, Math.cos(i * 1.57) * 180, 0],
              y: [0, Math.sin(i * 1.57) * 180, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 1.25,
              ease: 'easeInOut',
            }}
            style={{
              translateX: '-50%',
              translateY: '-50%',
            }}
          >
            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
          </motion.div>
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

      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-white/5 to-transparent blur-3xl" />
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
        <h1 className="font-sans text-5xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter text-center leading-[0.9]">
          <span className="block chrome-text">
            WEALTH IN
          </span>
          <span className="block chrome-text">
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
// ALCHEMICAL VAULT SECTION - CENTERED TITLE
// ============================================
const AlchemicalVault = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 1], ['5%', '-45%'])

  // Predefined assets with Ethereum included
  const assets = [
    {
      symbol: 'ETH',
      name: 'ETHEREUM',
      fullName: 'Ethereum 2.0',
      color: 'from-purple-500 to-blue-600',
      price: '$3,247.82',
      change: '+12.4%',
      icon: 'diamond'
    },
    {
      symbol: 'BTC',
      name: 'BITCOIN',
      fullName: 'Bitcoin',
      color: 'from-orange-400 to-amber-600',
      price: '$67,432.18',
      change: '+8.2%',
      icon: 'circle'
    },
    {
      symbol: 'AU',
      name: 'GOLD',
      fullName: 'Digital Gold',
      color: 'from-yellow-300 to-yellow-600',
      price: '$2,145.30',
      change: '+3.1%',
      icon: 'hexagon'
    },
    {
      symbol: 'USD',
      name: 'DOLLAR',
      fullName: 'USDC Stable',
      color: 'from-green-400 to-emerald-600',
      price: '$1.00',
      change: '+0.01%',
      icon: 'triangle'
    },
    {
      symbol: 'SOL',
      name: 'SOLANA',
      fullName: 'Solana',
      color: 'from-purple-400 to-pink-600',
      price: '$178.45',
      change: '+24.7%',
      icon: 'zap'
    },
    {
      symbol: 'AVAX',
      name: 'AVALANCHE',
      fullName: 'Avalanche',
      color: 'from-red-400 to-red-600',
      price: '$42.18',
      change: '+15.3%',
      icon: 'activity'
    },
  ]

  return (
    <section id="vault" className="relative py-32 overflow-hidden" ref={containerRef}>
      {/* Centered Title */}
      <div className="px-8 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex flex-col items-center"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-gray-500 mb-4">SECTION_02</span>
          <h2 className="font-sans text-5xl md:text-7xl lg:text-8xl font-bold chrome-text mb-4">
            THE ALCHEMICAL
          </h2>
          <h2 className="font-sans text-5xl md:text-7xl lg:text-8xl font-bold text-orange-500">
            VAULT
          </h2>
          <div className="mt-6 w-24 h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        </motion.div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative h-[500px] overflow-hidden">
        <motion.div
          className="absolute flex gap-6 px-8 items-center h-full"
          style={{ x }}
        >
          {assets.map((asset, index) => (
            <ModernCard
              key={asset.symbol}
              asset={asset}
              index={index}
              scrollProgress={scrollYProgress}
            />
          ))}
        </motion.div>
      </div>

      {/* Technical specs */}
      <div className="px-8 mt-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'TOTAL_LOCKED', value: '$2.4B', subtext: 'Across all assets' },
            { label: 'YIELD_RATE', value: '12.8%', subtext: 'APY average' },
            { label: 'LIQUIDITY', value: 'INSTANT', subtext: 'Zero slippage' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-gradient-border p-6 rounded-xl hover:border-orange-500/30 transition-all duration-500 group"
            >
              <div className="font-mono text-[10px] text-gray-500 mb-2 tracking-widest">{stat.label}</div>
              <div className="font-sans text-4xl font-bold text-white mb-1 group-hover:text-orange-500 transition-colors">{stat.value}</div>
              <div className="font-mono text-[10px] text-gray-600">{stat.subtext}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// MODERN CARD DESIGN
// ============================================
const ModernCard = ({ asset, index, scrollProgress }) => {
  const rotateY = useTransform(scrollProgress, [0, 1], [-15, 15])
  const y = useTransform(scrollProgress, [0, 0.5, 1], [50, 0, 50])

  return (
    <motion.div
      className="relative w-80 h-[420px] flex-shrink-0 group"
      style={{
        rotateY,
        y,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {/* Card container with gradient border */}
      <div className="absolute inset-0 card-gradient-border rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02]">

        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity duration-500",
          asset.color
        )} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        {/* Glow effect on hover */}
        <div className={cn(
          "absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl",
          asset.color.replace('from-', 'bg-').split(' ')[0]
        )} />

        {/* Content */}
        <div className="relative h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                asset.color
              )}>
                <SafeIcon name={asset.icon} size={24} className="text-white" />
              </div>
              <div>
                <div className="font-sans text-lg font-bold text-white">{asset.symbol}</div>
                <div className="font-mono text-[10px] text-gray-500 tracking-wider">{asset.fullName}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <SafeIcon name="trending-up" size={14} />
              <span className="font-mono text-xs">{asset.change}</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="font-mono text-[10px] text-gray-500 mb-1 tracking-widest">CURRENT_PRICE</div>
            <div className="font-sans text-4xl font-bold text-white tracking-tight">{asset.price}</div>
          </div>

          {/* Chart placeholder */}
          <div className="flex-1 flex items-end">
            <div className="w-full h-24 flex items-end gap-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-sm bg-gradient-to-t opacity-60",
                    asset.color
                  )}
                  initial={{ height: '20%' }}
                  whileInView={{ height: `${20 + Math.random() * 60}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                />
              ))}
            </div>
          </div>

          {/* Action button */}
          <button className="mt-6 w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all font-mono text-xs tracking-widest text-gray-300 hover:text-white">
            TRADE_{asset.symbol}
          </button>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <div className={cn(
            "absolute top-0 right-0 w-full h-full bg-gradient-to-bl opacity-20",
            asset.color
          )} />
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// PULSE DATA VISUALIZATION
// ============================================
const PulseVisualization = () => {
  const canvasRef = useRef(null)
  const [ripples, setRipples] = useState([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = canvas.width = window.innerWidth
    let height = canvas.height = 400
    let animationId

    const particles = []
    const particleCount = 60

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (width / particleCount) * i,
        y: height / 2,
        baseY: height / 2,
        speed: 0.02 + Math.random() * 0.02,
        offset: Math.random() * Math.PI * 2,
        amplitude: 30 + Math.random() * 40,
      })
    }

    let time = 0

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.08)'
      ctx.fillRect(0, 0, width, height)

      ctx.beginPath()
      ctx.strokeStyle = '#FF4D00'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'

      particles.forEach((particle, i) => {
        const wave = Math.sin(time * particle.speed + particle.offset) * particle.amplitude
        const heartbeat = Math.sin(time * 0.08) > 0.85 ? Math.sin(time * 0.4) * 30 : 0

        let finalY = particle.baseY + wave + heartbeat

        ripples.forEach(ripple => {
          const dist = Math.abs(particle.x - ripple.x)
          if (dist < ripple.radius) {
            const rippleEffect = Math.sin((dist / ripple.radius) * Math.PI) * ripple.strength
            finalY += rippleEffect * Math.sin(time * 0.15)
          }
        })

        particle.y = finalY

        if (i === 0) {
          ctx.moveTo(particle.x, particle.y)
        } else {
          const prevParticle = particles[i - 1]
          const cx = (prevParticle.x + particle.x) / 2
          const cy = (prevParticle.y + particle.y) / 2
          ctx.quadraticCurveTo(prevParticle.x, prevParticle.y, cx, cy)
        }
      })

      ctx.shadowColor = '#FF4D00'
      ctx.shadowBlur = 20
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw glow particles
      particles.forEach((particle, i) => {
        if (i % 4 === 0) {
          ctx.beginPath()
          ctx.fillStyle = '#FF4D00'
          ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2)
          ctx.fill()

          ctx.shadowColor = '#FF4D00'
          ctx.shadowBlur = 15
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      time += 1
      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = 400
      particles.length = 0
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: (width / particleCount) * i,
          y: height / 2,
          baseY: height / 2,
          speed: 0.02 + Math.random() * 0.02,
          offset: Math.random() * Math.PI * 2,
          amplitude: 30 + Math.random() * 40,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [ripples])

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left

    const newRipple = {
      x,
      radius: 0,
      strength: 60,
      id: Date.now(),
    }

    setRipples(prev => [...prev, newRipple])

    const animateRipple = () => {
      setRipples(prev => prev.map(ripple => {
        if (ripple.id === newRipple.id) {
          return {
            ...ripple,
            radius: ripple.radius + 8,
            strength: Math.max(0, ripple.strength - 1.5),
          }
        }
        return ripple
      }).filter(ripple => ripple.strength > 0))
    }

    const interval = setInterval(animateRipple, 16)
    setTimeout(() => clearInterval(interval), 800)
  }

  return (
    <section id="pulse" className="relative py-32 overflow-hidden">
      <div className="px-8 mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-sans text-5xl md:text-7xl lg:text-8xl font-bold mb-4"
        >
          <span className="chrome-text">THE </span>
          <span className="text-orange-500">PULSE</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-mono text-xs text-gray-500 tracking-widest"
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

        <div className="absolute top-4 left-8 font-mono text-[10px] text-gray-500">
          <div>HEART_RATE: 72 BPM</div>
          <div>FLOW_STABILITY: 98.4%</div>
          <div className="text-orange-500">NETWORK_STATUS: SYNCED</div>
        </div>
      </motion.div>

      <div className="px-8 mt-16 max-w-6xl mx-auto">
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
              className="card-gradient-border p-4 text-center hover:border-orange-500/30 transition-colors"
            >
              <div className="font-mono text-[10px] text-gray-500 mb-1">{item.label}</div>
              <div className="font-sans text-2xl font-bold text-white">{item.value}</div>
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
          className="font-sans text-5xl md:text-7xl font-bold mb-8"
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
            className="group relative px-12 py-5 bg-white text-black font-mono text-sm tracking-widest overflow-hidden rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 group-hover:text-white transition-colors">INITIATE_ACCESS</span>
            <motion.div
              className="absolute inset-0 bg-orange-500"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            className="px-12 py-5 border border-gray-700 text-white font-mono text-sm tracking-widest hover:border-white transition-colors rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            READ_DOCS
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 flex justify-center gap-8 text-gray-600"
        >
          {[
            { icon: 'shield', text: 'AUDITED' },
            { icon: 'lock', text: 'INSURED' },
            { icon: 'zap', text: 'DECENTRALIZED' }
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <SafeIcon name={item.icon} size={14} className="text-orange-500" />
              <span className="font-mono text-[10px] tracking-widest">{item.text}</span>
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
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="font-sans text-2xl font-bold tracking-tight chrome-text">
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
          2024 AETHER PROTOCOL. ALL RIGHTS RESERVED.
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

      {/* Custom Cursor - Now More Visible */}
      <LiquidCursor />

      {/* Transforming Navigation */}
      <TransformingHeader />

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