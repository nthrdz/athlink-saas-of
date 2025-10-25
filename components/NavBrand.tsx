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
      <img
        src="/athlink-logo-clean.svg"
        alt="Athlink"
        width="45"
        height="20"
        className="h-8 w-auto object-contain"
      />
      <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-black">
        ATHLINK
      </span>
    </motion.div>
  )
}


