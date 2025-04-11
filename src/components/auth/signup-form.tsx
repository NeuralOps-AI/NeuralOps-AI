"use client"

import React from "react"
import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import type { OAuthStrategy } from "@clerk/types"
import { toast, Toaster } from "sonner"
import Link from "next/link"
import { ArrowLeftIcon, MailIcon, CheckIcon, LockIcon, Apple, ChromeIcon, InboxIcon } from "lucide-react"
import Image from "next/image"
import { syncUserWithDatabase } from "@/actions/user-sync"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Icons component
const Icons = {
  apple: Apple,
  google: ChromeIcon,
  gmail: MailIcon,
  outlook: InboxIcon,
}

// Animation variants
const FADE_IN_VARIANTS = {
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

const FADE_UP = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
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

// Loading skeleton for better UX during transitions
const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse py-8">
    <div className="h-10 bg-zinc-800/50 rounded-md w-full"></div>
    <div className="h-10 bg-zinc-800/50 rounded-md w-full"></div>
    <div className="h-10 bg-zinc-800/50 rounded-md w-full"></div>
  </div>
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
const FloatingParticles = React.memo(() => {
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      size: i % 3 === 0 ? "4px" : "2px",
      opacity: i % 2 === 0 ? 0.2 : 0.15,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 2,
    }))
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            background: `rgba(var(--primary-rgb), ${particle.opacity})`,
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
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  )
})
FloatingParticles.displayName = "FloatingParticles"

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

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
    },
    [length, onChange, value],
  )

  // Handle backspace
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
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
    },
    [length, onChange, value],
  )

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
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
    },
    [length, onChange, value],
  )

  // Initialize refs array with useMemo
  const inputs = useMemo(() => {
    return Array(length)
      .fill(null)
      .map((_, index) => (
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
              rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]
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
      ))
  }, [length, value, disabled, handleChange, handleKeyDown, handlePaste])

  return <div className="flex justify-between gap-2 w-full">{inputs}</div>
}

// Toast configuration to prevent duplicates
const toastConfig = {
  position: "top-center" as const,
  closeButton: true,
  richColors: true,
  theme: "dark" as const,
}

const SignUpForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get("from")
  const { signIn } = useSignIn()
  const { isLoaded, signUp, setActive } = useSignUp()

  const [email, setEmail] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isEmailOpen, setIsEmailOpen] = useState<boolean>(true)
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false)
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false)
  const [isCodeLoading, setIsCodeLoading] = useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)
  const [isAppleLoading, setIsAppleLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Unified toast function to prevent duplicate notifications
  const showToast = useCallback((message: string, type: "success" | "error" | "loading" = "success", options = {}) => {
    toast.dismiss() // Dismiss any existing toasts

    switch (type) {
      case "success":
        toast.success(message, {
          duration: 5000,
          className: "border-l-4 border-l-green-500 bg-zinc-900",
          icon: <CheckIcon className="h-4 w-4 text-green-500" />,
          ...options,
        })
        break
      case "error":
        toast.error(message, {
          ...options,
        })
        break
      case "loading":
        toast.loading(message, {
          duration: 5000,
          ...options,
        })
        break
    }
  }, [])

  const handleOAuth = useCallback(
    async (strategy: OAuthStrategy) => {
      if (!isLoaded || !signIn) return

      if (strategy === "oauth_google") {
        setIsGoogleLoading(true)
      } else {
        setIsAppleLoading(true)
      }

      try {
        // Show loading toast with better UI
        showToast(`Connecting to ${strategy === "oauth_google" ? "Google" : "Apple"}...`, "loading")

        // Start authentication with a small delay to allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 100))

        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/auth/signup/sso-callback",
          redirectUrlComplete: "/auth/callback",
        })
      } catch (error) {
        console.error(error)
        showToast("An error occurred. Please try again.", "error")

        // Reset loading state
        if (strategy === "oauth_google") {
          setIsGoogleLoading(false)
        } else {
          setIsAppleLoading(false)
        }
      }
    },
    [isLoaded, signIn, showToast],
  )

  const handleEmail = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!isLoaded || !signUp) return

      if (!email) {
        showToast("Please enter your email address", "error")
        return
      }

      setIsEmailLoading(true)

      try {
        await signUp.create({
          emailAddress: email,
        })

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        })

        setIsCodeSent(true)
        showToast("Verification code sent", "success", {
          description: "Please check your email inbox",
          id: "verification-toast",
        })
      } catch (error: any) {
        console.error(JSON.stringify(error, null, 2))
        switch (error.errors?.[0]?.code) {
          case "form_identifier_exists":
            showToast("This email is already registered. Please sign in.", "error")
            router.push("/auth/signin?from=signup")
            break
          case "form_password_pwned":
            showToast("The password is too common. Please choose a stronger password.", "error")
            break
          case "form_param_format_invalid":
            showToast("Invalid email address. Please enter a valid email address.", "error")
            break
          case "form_password_length_too_short":
            showToast("Password is too short. Please choose a longer password.", "error")
            break
          default:
            showToast("An error occurred. Please try again", "error")
            break
        }
      } finally {
        setIsEmailLoading(false)
      }
    },
    [email, isLoaded, router, showToast, signUp],
  )

  const handleVerifyCode = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!isLoaded || !signUp) return

      if (!code || code.length < 6) {
        showToast("Please enter the complete 6-digit code", "error")
        return
      }

      setIsCodeLoading(true)

      try {
        const completeSignup = await signUp.attemptEmailAddressVerification({
          code,
        })

        if (completeSignup.status === "complete") {
          setIsSuccess(true)
          showToast("Account created successfully!", "success", {
            description: "Redirecting you to your dashboard",
            id: "signup-success-toast",
          })

          // Small delay for animation
          setTimeout(async () => {
            if (setActive) {
              await setActive({ session: completeSignup.createdSessionId })
              router.push("/auth/callback")
            }
          }, 1000)
        } else {
          console.error(JSON.stringify(completeSignup, null, 2))
          showToast("Invalid verification code. Please try again.", "error")
        }
      } catch (error: any) {
        console.error(JSON.stringify(error, null, 2))
        switch (error.errors?.[0]?.code) {
          case "form_code_incorrect":
            showToast("Incorrect code. Please enter valid code.", "error")
            break
          case "verification_failed":
            showToast("Verification failed. Please try after some time.", "error")
            break
          case "too_many_attempts":
            showToast("Too many attempts. Please try again later.", "error")
            break
          default:
            showToast("An error occurred. Please try again", "error")
            break
        }
      } finally {
        setIsCodeLoading(false)
      }
    },
    [code, isLoaded, router, showToast, signUp, setActive],
  )

  // Handle form submission for final sign up
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      // Basic validation
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long")
        setIsLoading(false)
        return
      }

      if (!signUp) {
        throw new Error("signUp is undefined");
      }

      // Complete the sign-up process
      await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUp.status === "complete") {
        // Sign up successful
        try {
          // Sync user to database immediately after sign-up
          await syncUserWithDatabase();
          toast.success("Account created successfully!");
        } catch (syncError) {
          console.error("User sync error:", syncError);
          // Continue anyway, as the AuthSync component will retry
        }

        setIsSuccess(true)
        // Redirect to the app after a short delay to show success message
        setTimeout(() => {
          router.push("/app")
        }, 1000)
      } else {
        toast.error("Failed to create account")
      }
    } catch (err: any) {
      console.error("Error signing up:", err)
      toast.error(err.errors?.[0]?.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (from) {
      setIsEmailOpen(false)
    }
  }, [from])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-black to-zinc-900 text-white">
   

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
                <Link href="/" className="block relative z-10">
                  <Image
                    src="/icons/logo.png"
                    alt="Neural-Ops Logo"
                    width={40}
                    height={40}
                    className="object-contain cursor-pointer"
                    priority
                  />
                </Link>
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
                ? "Create your account"
                : isCodeSent
                  ? isSuccess
                    ? "Account Created!"
                    : "Verify your email"
                  : "Welcome to Neural-Ops"}
            </motion.h1>

            <motion.p className="text-xs text-zinc-400 mt-1 text-center max-w-[200px]" variants={FADE_UP}>
              {isEmailOpen
                ? "Create an account to start using Neural-Ops"
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
                    className="w-full bg-primary hover:bg-primary/90 h-9 rounded-md transition-all duration-200 shadow-sm hover:shadow-md hover:translate-y-[-1px]"
                  >
                    <MailIcon className="w-3.5 h-3.5 mr-2" aria-hidden="true" />
                    <span className="text-xs">Continue with email</span>
                  </Button>
                </motion.div>

                <motion.div
                  variants={ITEM}
                  className="mt-6 p-3 rounded-md border border-zinc-800 bg-zinc-900/50 h-[110px] flex flex-col justify-between"
                >
                  <p className="text-xs text-zinc-400 italic">
                    <TypeWriter text="Join thousands of teams using Neural-Ops to build AI-powered workflows that transform their business." />
                  </p>
                  <p className="text-xs font-medium text-zinc-300 mt-2 flex items-center">
                    <span className="w-4 h-0.5 bg-primary/50 mr-4"></span>
                    Likhit Tanishq, Founder
                  </p>
                </motion.div>

                <motion.div variants={ITEM} className="pt-6 text-muted-foreground text-sm text-center">
                  <span className="text-zinc-400">Already have an account?</span>{" "}
                  <Link href="/auth/signin" className="text-white hover:underline">
                    Login
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <>
                {isCodeSent ? (
                  isCodeLoading ? (
                    <LoadingSkeleton />
                  ) : (
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
                          className="w-full bg-primary hover:bg-primary/90 h-9 rounded-md transition-all duration-200 shadow-sm hover:shadow-md hover:translate-y-[-1px]"
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
                          <span className="text-xs">Back to sign up options</span>
                        </Button>
                      </motion.div>
                    </motion.form>
                  )
                ) : isEmailLoading ? (
                  <LoadingSkeleton />
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
                        className="w-full bg-primary hover:bg-primary/90 h-9 rounded-md transition-all duration-200 shadow-sm hover:shadow-md hover:translate-y-[-1px]"
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
                        <span className="text-xs">Back</span>
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

export default SignUpForm
