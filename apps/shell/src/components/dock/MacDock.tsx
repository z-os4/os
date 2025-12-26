"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import * as ContextMenu from '@radix-ui/react-context-menu'

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

interface DockProps {
  className?: string
  children?: React.ReactNode
  magnification?: number
  distance?: number
}

interface DockItemProps {
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  tooltip?: string
  isActive?: boolean
  isRunning?: boolean
}

const DockContext = React.createContext<{
  magnification: number
  distance: number
  mouseX: any
}>({
  magnification: 60,
  distance: 140,
  mouseX: null,
})

const MacDock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className, children, magnification = 60, distance = 140 }, ref) => {
    const mouseX = useMotionValue(Infinity)

    return (
      <DockContext.Provider value={{ magnification, distance, mouseX }}>
        <motion.div
          ref={ref}
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className={cn(
            "mx-auto flex h-16 items-end gap-1 rounded-2xl border border-white/20 bg-white/10 px-2 pb-2 backdrop-blur-2xl",
            "shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_50px_-15px_rgba(0,0,0,0.5)]",
            className
          )}
        >
          {children}
        </motion.div>
      </DockContext.Provider>
    )
  }
)
MacDock.displayName = "MacDock"

const MacDockItem = React.forwardRef<HTMLButtonElement, DockItemProps>(
  ({ className, children, onClick, tooltip, isActive, isRunning }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const { magnification, distance, mouseX } = React.useContext(DockContext)
    const [isHovered, setIsHovered] = React.useState(false)
    const [isBouncing, setIsBouncing] = React.useState(false)

    const distanceCalc = useTransform(mouseX, (val: number) => {
      const bounds = buttonRef.current?.getBoundingClientRect() ?? {
        x: 0,
        width: 0,
      }
      return val - bounds.x - bounds.width / 2
    })

    const widthSync = useTransform(
      distanceCalc,
      [-distance, 0, distance],
      [48, 48 + magnification, 48]
    )

    const width = useSpring(widthSync, {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
    })

    const handleClick = () => {
      setIsBouncing(true)
      setTimeout(() => setIsBouncing(false), 600)
      onClick?.()
    }

    return (
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <motion.div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {tooltip && isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
              >
                {tooltip}
                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800/95" />
              </motion.div>
            )}
            <motion.button
              ref={buttonRef}
              style={{ width }}
              animate={isBouncing ? {
                y: [0, -15, 0, -8, 0, -4, 0]
              } : {}}
              transition={isBouncing ? {
                duration: 0.6,
                ease: "easeOut"
              } : {}}
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
              className={cn(
                "aspect-square w-12 rounded-xl transition-colors origin-bottom",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                "relative overflow-hidden",
                className
              )}
            >
              <div className="flex h-full w-full items-center justify-center">
                {children}
              </div>
            </motion.button>

            {/* Running indicator */}
            {(isActive || isRunning) && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80" />
            )}
          </motion.div>
        </ContextMenu.Trigger>

        <ContextMenu.Portal>
          <ContextMenu.Content
            className="min-w-[180px] bg-gray-800/95 backdrop-blur-xl rounded-lg border border-white/10 p-1 shadow-xl z-[9999]"
          >
            <ContextMenu.Item
              onClick={handleClick}
              className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 focus:bg-white/10 outline-none cursor-default"
            >
              Open {tooltip}
            </ContextMenu.Item>
            <ContextMenu.Separator className="h-px my-1 bg-white/10" />
            <ContextMenu.Item
              className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 focus:bg-white/10 outline-none cursor-default"
            >
              Options
            </ContextMenu.Item>
            <ContextMenu.Item
              className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 focus:bg-white/10 outline-none cursor-default"
            >
              Show in Finder
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    )
  }
)
MacDockItem.displayName = "MacDockItem"

const DockSeparator = () => (
  <div className="w-px h-10 bg-white/20 mx-1 self-center" />
)

export { MacDock, MacDockItem, DockSeparator }
