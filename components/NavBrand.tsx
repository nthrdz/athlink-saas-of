"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function NavBrand() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <Image
        src="/athlink-logo.png"
        alt="Athlink"
        width={32}
        height={32}
        className="w-8 h-8"
        priority
      />
      <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-black">
        ATHLINK
      </span>
    </motion.div>
  )
}


