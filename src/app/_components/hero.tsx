"use client"

import { motion } from "framer-motion"

const Hero = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8
            }
        }
    }

    const buttonVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.6
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                duration: 0.2
            }
        },
        tap: {
            scale: 0.95
        }
    }

    return (
        <div className="hero min-h-[80vh] bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden pt-20">
            <motion.div
                className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
                animate={{
                    y: [0, -15, 0],
                    x: [0, 10, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity
                }}
            />
            <motion.div
                className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-xl"
                animate={{
                    y: [0, -15, 0],
                    x: [0, 10, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 1
                }}
            />
            <motion.div
                className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/10 rounded-full blur-xl"
                animate={{
                    y: [0, -15, 0],
                    x: [0, 10, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 2
                }}
            />

            <motion.div
                className="absolute bottom-0 left-0 w-full opacity-30"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 0.3 }}
                transition={{ duration: 1.5 }}
            >
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24">
                    <motion.path
                        d="M0,60L48,65C96,70,192,80,288,75C384,70,480,50,576,45C672,40,768,50,864,60C960,70,1056,80,1152,75L1200,70V120H1152C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V60Z"
                        fill="currentColor"
                        className="text-primary/30"
                        animate={{
                            d: [
                                "M0,60L48,65C96,70,192,80,288,75C384,70,480,50,576,45C672,40,768,50,864,60C960,70,1056,80,1152,75L1200,70V120H1152C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V60Z",
                                "M0,70L48,75C96,80,192,90,288,85C384,80,480,60,576,55C672,50,768,60,864,70C960,80,1056,90,1152,85L1200,80V120H1152C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V70Z",
                                "M0,60L48,65C96,70,192,80,288,75C384,70,480,50,576,45C672,40,768,50,864,60C960,70,1056,80,1152,75L1200,70V120H1152C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V60Z"
                            ]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                </svg>
            </motion.div>

            <motion.div 
                className="hero-content text-center relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-4xl">
                    <motion.h1 
                        className="text-5xl font-bold text-base-content mb-6"
                        variants={itemVariants}
                    >
                        <motion.span
                            className="inline-block"
                            whileHover={{ scale: 1.05, color: "var(--color-primary)" }}
                            transition={{ duration: 0.3 }}
                        >
                            Sistem Pencatatan Pelanggaran
                        </motion.span>
                        <motion.span 
                            className="text-primary block mt-2"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                        >
                            SMK Taman Siswa 2 Jakarta
                        </motion.span>
                    </motion.h1>
                    
                    <motion.p 
                        className="text-xl text-base-content/80 mb-8 max-w-2xl mx-auto"
                        variants={itemVariants}
                    >
                        Platform digital yang cepat, transparan, dan terintegrasi untuk mencatat dan mengelola pelanggaran siswa dengan dashboard interaktif, verifikasi BK, dan laporan otomatis.
                    </motion.p>
                    
                    <motion.div 
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        variants={itemVariants}
                    >
                        {/* <motion.button 
                            className="btn btn-primary btn-lg rounded-lg text-white"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <motion.svg 
                                className="w-5 h-5 mr-2" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.3 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </motion.svg>
                            Mulai Sekarang
                        </motion.button> */}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

export default Hero