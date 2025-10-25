"use client"

import { motion } from "framer-motion"

export function NavBrand() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-black">
        ATHLINK
      </span>
    </motion.div>
  )
}


