"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeftIcon, MailIcon, CheckIcon, LockIcon } from "lucide-react"
import { Toaster, toast } from "sonner"
import { useSignIn } from "@clerk/nextjs"
import type { OAuthStrategy } from "@clerk/types"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Animation variants
const FADE_UP = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

const STAGGER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const ITEM = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

const SCALE = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
}

// Icons components
const Icons = {
  google: (props: any) => (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  ),
  apple: (props: any) => (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" {...props}>
      <path
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"
        fill="currentColor"
      />
    </svg>
  ),
  gmail: (props: any) => (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" {...props}>
      <path
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
        fill="currentColor"
      />
    </svg>
  ),
  outlook: (props: any) => (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" {...props}>
      <path
        d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"
        fill="currentColor"
      />
    </svg>
  ),
}

// Loading spinner
const Spinner = ({ className = "" }: { className?: string }) => (
  <svg
    className={`animate-spin h-3.5 w-3.5 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)

// Typing animation component
const TypeWriter = ({ text, speed = 25 }: { text: string; speed?: number }) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else {
      setIsComplete(true)

      // Blink cursor after typing is complete
      const interval = setInterval(() => {
        setCursorVisible((prev) => !prev)
      }, 500)

      return () => clearInterval(interval)
    }
  }, [currentIndex, speed, text])

  return (
    <span className="inline-block">
      {displayText}
      {(cursorVisible || !isComplete) && <span className={`${isComplete ? "" : "animate-pulse"} text-primary`}>|</span>}
    </span>
  )
}

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: i % 3 === 0 ? "4px" : "2px",
            height: i % 3 === 0 ? "4px" : "2px",
            background: `rgba(var(--primary-rgb), ${i % 2 === 0 ? 0.2 : 0.15})`,
          }}
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

// OTP Input component
const OtpInput = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}: {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value
    if (val.length > 1) {
      // If pasted multiple digits
      const digits = val.split("").slice(0, length - index)
      let newValue = value.slice(0, index) + digits.join("")
      if (newValue.length > length) newValue = newValue.slice(0, length)
      onChange(newValue)

      // Focus on next empty input or last input
      const nextIndex = Math.min(index + digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    } else if (val.length === 1) {
      // Single digit entered
      const newValue = value.slice(0, index) + val + value.slice(index + 1)
      onChange(newValue)

      // Focus next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  // Handle backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      // If current input is empty and backspace is pressed, focus previous input
      const newValue = value.slice(0, index - 1) + value.slice(index)
      onChange(newValue)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()
    if (!pastedData) return

    // Only use digits from pasted content
    const digits = pastedData
      .split("")
      .filter((char) => /\d/.test(char))
      .slice(0, length - index)
    if (digits.length === 0) return

    let newValue = value.slice(0, index) + digits.join("")
    if (newValue.length > length) newValue = newValue.slice(0, length)
    onChange(newValue)

    // Focus on next empty input or last input
    const nextIndex = Math.min(index + digits.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex justify-between gap-2 w-full">
      {[...Array(length)].map((_, index) => (
        <motion.div
          key={index}
          variants={SCALE}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ""}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            className={`
              w-10 h-12 text-center font-medium text-white bg-zinc-900/80 
              border-2 ${value[index] ? "border-primary" : "border-zinc-800"} 
              rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              transition-all duration-200 shadow-md
            `}
            aria-label={`Digit ${index + 1}`}
          />
          {index < length - 1 && (
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 pointer-events-none">
              <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

const SignInForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get("from")
  const { isLoaded, signIn, setActive } = useSignIn()

  const [email, setEmail] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [isEmailOpen, setIsEmailOpen] = useState<boolean>(true)
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false)
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false)
  const [isCodeLoading, setIsCodeLoading] = useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)
  const [isAppleLoading, setIsAppleLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleOAuth = async (strategy: OAuthStrategy) => {
    if (strategy === "oauth_google") {
      setIsGoogleLoading(true)
    } else {
      setIsAppleLoading(true)
    }

    try {
      await signIn?.authenticateWithRedirect({
        strategy,
        redirectUrl: "/auth/signup/sso-callback",
        redirectUrlComplete: "/auth/callback",
      })

      toast.loading(`Redirecting to ${strategy === "oauth_google" ? "Google" : "Apple"}...`, {
        duration: 5000,
      })
    } catch (error) {
      console.error(error)
      toast.error("An error occurred. Please try again.")
    } finally {
      if (strategy === "oauth_google") {
        setIsGoogleLoading(false)
      } else {
        setIsAppleLoading(false)
      }
    }
  }

  const handleEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isLoaded) return

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsEmailLoading(true)

    try {
      await signIn.create({
        identifier: email,
      })

      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: signIn.supportedFirstFactors!.find((factor) => factor.strategy === "email_code")!
          .emailAddressId,
      })

      setIsCodeSent(true)
      toast.success("Verification code sent", {
        description: "Please check your email inbox",
        duration: 5000,
        className: "border-l-4 border-l-green-500 bg-zinc-900",
        icon: <MailIcon className="h-4 w-4 text-green-500" />,
      })
    } catch (error: any) {
      console.error(JSON.stringify(error, null, 2))
      switch (error.errors?.[0]?.code) {
        case "form_identifier_not_found":
          toast.error("This email is not registered. Please sign up first.")
          router.push("/auth/signup?from=signin")
          break
        case "too_many_attempts":
          toast.error("Too many attempts. Please try again later.")
          break
        default:
          toast.error("An error occurred. Please try again")
          break
      }
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isLoaded) return

    if (!code || code.length < 6) {
      toast.error("Please enter the complete 6-digit code")
      return
    }

    setIsCodeLoading(true)

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      })

      if (signInAttempt.status === "complete") {
        setIsSuccess(true)
        toast.success("Login successful!", {
          description: "Redirecting you to your dashboard",
          duration: 3000,
          className: "border-l-4 border-l-green-500 bg-zinc-900",
          icon: <CheckIcon className="h-4 w-4 text-green-500" />,
        })

        // Small delay for animation
        setTimeout(async () => {
          await setActive({ session: signInAttempt.createdSessionId })
          router.push("/auth/callback")
        }, 1000)
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
        toast.error("Invalid code. Please try again.")
      }
    } catch (error: any) {
      console.error(JSON.stringify(error, null, 2))
      switch (error.errors?.[0]?.code) {
        case "form_code_incorrect":
          toast.error("Incorrect code. Please enter valid code.")
          break
        case "verification_failed":
          toast.error("Verification failed. Please try after some time.")
          break
        case "too_many_attempts":
          toast.error("Too many attempts. Please try again later.")
          break
        default:
          toast.error("An error occurred. Please try again")
          break
      }
    } finally {
      setIsCodeLoading(false)
    }
  }

  useEffect(() => {
    if (from) {
      setIsEmailOpen(false)
    }
  }, [from])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-black to-zinc-900 text-white">
      <Toaster
        position="top-center"
        closeButton
        richColors
        theme="dark"
        toastOptions={{
          duration: 4000,
        }}
      />

      <FloatingParticles />

      <div className="w-full max-w-xs mx-auto z-10">
        <div className="flex flex-col">
          <motion.div
            className="flex flex-col items-center justify-center mb-6"
            initial="hidden"
            animate="visible"
            variants={FADE_UP}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 15,
                delay: 0.1,
              }}
              className="relative mb-4"
            >
              {/* Logo with glow effect */}
              <div className="w-10 h-10 relative">
                <Image src="/icons/logo.png" alt="Neural-Ops Logo" width={40} height={40} className="object-contain" />
                <motion.div
                  className="absolute -inset-1.5 rounded-full bg-primary/5 blur-sm"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-full bg-primary/10"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </motion.div>

            <motion.h1
              className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
              variants={FADE_UP}
            >
              {isEmailOpen
                ? "Login to Neural-Ops"
                : isCodeSent
                  ? isSuccess
                    ? "Login Successful"
                    : "Verify your email"
                  : "Welcome to Neural-Ops"}
            </motion.h1>

            <motion.p className="text-xs text-zinc-400 mt-1 text-center max-w-[200px]" variants={FADE_UP}>
              {isEmailOpen
                ? "Choose a method to login"
                : isCodeSent
                  ? isSuccess
                    ? "Redirecting you to your dashboard..."
                    : "Enter the 6-digit code sent to your email"
                  : "Enter your email address to get started"}
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                >
                  <CheckIcon className="h-6 w-6 text-primary" />
                </motion.div>
                <Spinner className="mt-2 text-primary" />
              </motion.div>
            ) : isEmailOpen ? (
              <motion.div
                key="oauth-options"
                variants={STAGGER}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                className="space-y-2.5"
              >
                <motion.div variants={ITEM}>
                  <Button
                    type="button"
                    disabled={isGoogleLoading || isAppleLoading}
                    onClick={() => handleOAuth("oauth_google")}
                    variant="outline"
                    size="sm"
                    className="w-full relative border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-white h-9 rounded-md"
                  >
                    {isGoogleLoading ? <Spinner className="mr-2" /> : <Icons.google className="w-3.5 h-3.5 mr-2" />}
                    <span className="text-xs">Continue with Google</span>
                  </Button>
                </motion.div>

                <motion.div variants={ITEM}>
                  <Button
                    type="button"
                    disabled={isGoogleLoading || isAppleLoading}
                    onClick={() => handleOAuth("oauth_apple")}
                    variant="outline"
                    size="sm"
                    className="w-full relative border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-white h-9 rounded-md"
                  >
                    {isAppleLoading ? <Spinner className="mr-2" /> : <Icons.apple className="w-3.5 h-3.5 mr-2" />}
                    <span className="text-xs">Continue with Apple</span>
                  </Button>
                </motion.div>

                <motion.div variants={ITEM} className="relative my-3 flex items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="mx-3 flex-shrink text-xs text-zinc-500 uppercase">Or</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </motion.div>

                <motion.div variants={ITEM}>
                  <Button
                    type="button"
                    disabled={isGoogleLoading || isAppleLoading}
                    onClick={() => setIsEmailOpen(false)}
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 h-9 rounded-md"
                  >
                    <MailIcon className="w-3.5 h-3.5 mr-2" aria-hidden="true" />
                    <span className="text-xs">Continue with email</span>
                  </Button>
                </motion.div>

                <motion.div variants={ITEM} className="mt-6 p-3 rounded-md border border-zinc-800 bg-zinc-900/50">
                  <p className="text-xs text-zinc-400 italic">
                    <span className="text-primary">&quot;</span>
                    <TypeWriter text="We built Neural-Ops to help teams unlock their full potential through AI-powered workflows." />
                  </p>
                  <p className="text-xs font-medium text-zinc-300 mt-2">— Likhit Tanishq, Founder</p>
                </motion.div>
              </motion.div>
            ) : (
              <>
                {isCodeSent ? (
                  <motion.form
                    key="code-form"
                    variants={STAGGER}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                    onSubmit={handleVerifyCode}
                    className="space-y-4"
                  >
                    <motion.div variants={ITEM} className="space-y-3">
                      <div className="flex items-center justify-center mb-1">
                        <LockIcon className="w-3.5 h-3.5 text-primary/70 mr-1.5" />
                        <span className="text-xs font-medium text-zinc-400">Verification Code</span>
                      </div>

                      <OtpInput length={6} value={code} onChange={setCode} disabled={isCodeLoading} />

                      <p className="text-xs text-zinc-500 text-center mt-1">
                        Enter the 6-digit code sent to <span className="text-zinc-300">{email}</span>
                      </p>
                    </motion.div>

                    <motion.div variants={ITEM}>
                      <Button
                        type="submit"
                        disabled={isCodeLoading || code.length < 6}
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 h-9 rounded-md transition-all duration-200"
                      >
                        {isCodeLoading ? (
                          <>
                            <Spinner className="mr-2" />
                            <span className="text-xs">Verifying...</span>
                          </>
                        ) : (
                          <span className="text-xs">Verify code</span>
                        )}
                      </Button>
                    </motion.div>

                    <motion.div variants={ITEM} className="flex items-center gap-2">
                      <Button
                        asChild
                        type="button"
                        disabled={isCodeLoading}
                        variant="outline"
                        size="sm"
                        className="w-full border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-white h-9 rounded-md"
                      >
                        <Link href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                          <Icons.gmail className="w-3.5 h-3.5 mr-1.5" />
                          <span className="text-xs">Gmail</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        type="button"
                        disabled={isCodeLoading}
                        variant="outline"
                        size="sm"
                        className="w-full border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-white h-9 rounded-md"
                      >
                        <Link href="https://outlook.live.com" target="_blank" rel="noopener noreferrer">
                          <Icons.outlook className="w-3.5 h-3.5 mr-1.5" />
                          <span className="text-xs">Outlook</span>
                        </Link>
                      </Button>
                    </motion.div>

                    <motion.div variants={ITEM}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isCodeLoading}
                        onClick={() => setIsEmailOpen(true)}
                        className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 rounded-md"
                      >
                        <ArrowLeftIcon className="w-3 h-3 mr-1.5" />
                        <span className="text-xs">Back to login options</span>
                      </Button>
                    </motion.div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="email-form"
                    variants={STAGGER}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                    onSubmit={handleEmail}
                    className="space-y-3"
                  >
                    <motion.div variants={ITEM}>
                      <Input
                        autoFocus={true}
                        name="email"
                        type="email"
                        value={email}
                        disabled={isEmailLoading}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-500 h-9 text-sm rounded-md"
                        required
                      />
                    </motion.div>

                    <motion.div variants={ITEM}>
                      <Button
                        type="submit"
                        disabled={isEmailLoading}
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 h-9 rounded-md"
                      >
                        {isEmailLoading ? (
                          <>
                            <Spinner className="mr-2" />
                            <span className="text-xs">Sending code...</span>
                          </>
                        ) : (
                          <span className="text-xs">Continue</span>
                        )}
                      </Button>
                    </motion.div>

                    <motion.div variants={ITEM}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isEmailLoading}
                        onClick={() => setIsEmailOpen(true)}
                        className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 rounded-md"
                      >
                        <ArrowLeftIcon className="w-3 h-3 mr-1.5" />
                        <span className="text-xs">Back to login options</span>
                      </Button>
                    </motion.div>
                  </motion.form>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SignInForm

