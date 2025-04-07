"use client"

import { useCallback, useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PLANS } from "@/constants"
import { cn } from "@/functions"
import { AnimatePresence, motion } from "framer-motion"
import { CheckIcon, SparklesIcon } from "lucide-react"
import Link from "next/link"
import Container from "../global/container"
import { Button } from "../ui/button"
import NumberTicker from "../ui/number-ticker"
import { SectionBadge } from "../ui/section-bade"

type PlanType = "monthly" | "yearly"

type PlanProps = {
  id: string
  title: string
  desc: string
  monthlyPrice: number
  yearlyPrice: number
  buttonText: string
  features: string[]
  index: number
  plan: PlanType
}

// Animation variants
const FADE_IN_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const SCALE_IN = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// Extracted Plan component for better organization
const PricingPlan = ({ id, title, desc, monthlyPrice, yearlyPrice, buttonText, features, index, plan }: PlanProps) => {
  // Calculate displayed price with memoization
  const displayedPrice = useMemo(() => {
    if (plan === "monthly") {
      return monthlyPrice
    } else {
      // Apply 20% discount for yearly plans
      return monthlyPrice === 0 ? 0 : Math.round((yearlyPrice * 0.8) / 12)
    }
  }, [monthlyPrice, yearlyPrice, plan])

  // Calculate savings amount for yearly plans
  const yearlySavings = useMemo(() => {
    if (plan === "yearly" && monthlyPrice > 0) {
      return Math.round(monthlyPrice * 12 * 0.2)
    }
    return 0
  }, [monthlyPrice, plan])

  const isPro = id === "pro"
  const isFree = id === "free"

  return (
    <motion.div
      custom={index}
      variants={FADE_IN_UP}
      initial="hidden"
      animate="visible"
      className="w-full relative flex flex-col saturate-150 rounded-2xl"
    >
      <div
        className={cn(
          "flex flex-col size-full border rounded-2xl relative p-3 transition-all duration-300 hover:shadow-lg",
          isPro
            ? "border-primary/80 [background-image:linear-gradient(345deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.05)_100%)]"
            : "border-border/60 [background-image:linear-gradient(345deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0.03)_100%)]",
          isPro && "shadow-[0_0_30px_-5px_rgba(var(--primary),0.2)]",
        )}
      >
        {isPro && (
          <div className="max-w-fit min-w-min inline-flex items-center whitespace-nowrap px-1 h-7 rounded-full bg-gradient-to-r from-primary to-violet-500 absolute -top-3 left-1/2 -translate-x-1/2 select-none shadow-md">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex-1 text-sm px-2 font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent bg-[length:250%_100%] animate-background-shine flex items-center gap-1"
            >
              <SparklesIcon className="w-3 h-3" />
              Most Popular
            </motion.span>
          </div>
        )}

        <div className="flex flex-col p-3 w-full">
          <h3 className={cn("text-xl font-medium", isPro && "text-primary")}>{title}</h3>
          <p className="text-sm mt-2 text-muted-foreground break-words">{desc}</p>
        </div>

        <hr className="shrink-0 border-none w-full h-px bg-border" role="separator" />

        <div className="relative flex flex-col flex-1 align-top w-full p-3 h-full break-words text-left gap-4">
          <div className="flex items-end gap-2">
            <div className="flex items-end gap-1">
              <span className={cn("text-3xl md:text-4xl font-bold", isPro && "text-primary")}>
                ${displayedPrice === 0 ? 0 : <NumberTicker value={displayedPrice} />}
              </span>
              <span className="text-lg text-muted-foreground font-medium">per month</span>
            </div>

            <AnimatePresence>
              {!isFree && plan === "yearly" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <span className="text-xs px-2 py-0.5 rounded mb-1 text-foreground bg-primary font-medium">
                    Save ${yearlySavings}/yr
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {plan === "yearly" && !isFree && (
            <p className="text-xs text-muted-foreground -mt-2">
              Billed annually (${Math.round(yearlyPrice * 0.8)}/year)
            </p>
          )}

          <ul className="flex flex-col gap-3 mt-2">
            {features.map((feature, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="flex items-start gap-2"
              >
                <CheckIcon
                  aria-hidden="true"
                  className={cn("w-5 h-5 mt-0.5", isPro ? "text-primary" : "text-green-500")}
                />
                <p className="text-sm md:text-base text-muted-foreground">{feature}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="p-3 mt-auto h-auto flex w-full items-center">
          <Button
            asChild
            variant={isPro ? "default" : "tertiary"}
            size="lg"
            className={cn(
              "w-full transition-all duration-300",
              isPro ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary/80",
            )}
          >
            <Link href="" aria-label={`Select ${title} plan`}>
              {buttonText}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

const Pricing = () => {
  const [activePlan, setActivePlan] = useState<PlanType>("monthly")

  const handleTabChange = useCallback((value: string) => {
    setActivePlan(value as PlanType)
  }, [])

  return (
    <section
      className="flex flex-col items-center justify-center py-12 md:py-20 lg:py-28 w-full relative overflow-hidden"
      id="pricing"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center max-w-2xl mx-auto"
        >
          <SectionBadge title="Choose your plan" />
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6">
            Simple and transparent pricing
          </h2>
          <p className="text-base md:text-lg text-center text-accent-foreground/80 mt-6">
            Choose the plan that suits your needs. No hidden fees, no surprises.
          </p>
        </motion.div>
      </Container>

      <div className="mt-12 w-full relative flex flex-col items-center justify-center">
        {/* Gradient blobs */}
        <div className="absolute hidden lg:block top-1/2 right-2/3 translate-x-1/4 -translate-y-1/2 w-96 h-96 bg-primary/15 blur-[10rem] -z-10 animate-pulse"></div>
        <div
          className="absolute hidden lg:block top-1/2 left-2/3 -translate-x-1/4 -translate-y-1/2 w-96 h-96 bg-violet-500/15 blur-[10rem] -z-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <Container>
          <Tabs
            defaultValue="monthly"
            value={activePlan}
            onValueChange={handleTabChange}
            className="w-full flex flex-col items-center justify-center"
          >
            <TabsList className="mb-8 shadow-md">
              <TabsTrigger value="monthly" className="relative px-6 py-2 data-[state=active]:text-primary">
                Monthly
                {activePlan === "monthly" && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </TabsTrigger>
              <TabsTrigger value="yearly" className="relative px-6 py-2 data-[state=active]:text-primary">
                Yearly
                <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white font-medium">
                  -20%
                </span>
                {activePlan === "yearly" && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activePlan}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
                  {PLANS.map((plan, index) => (
                    <PricingPlan key={`${plan.id}-${activePlan}`} index={index} {...plan} plan={activePlan} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Need a custom plan?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact us
              </Link>{" "}
              for enterprise pricing.
            </p>
          </div>
        </Container>
      </div>
    </section>
  )
}

export default Pricing

