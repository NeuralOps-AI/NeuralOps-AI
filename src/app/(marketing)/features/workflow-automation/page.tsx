import AnimationContainer from "../../../../components/ui/animation-container"
import MaxWidthWrapper from "@/components/ui/max-width-wrapper"
import { Button } from "@/components/ui/button"
import { LampContainer } from "@/components/ui/lamp"
import { Badge } from "@/components/ui/badge"
import { COMPANIES } from "../../../../constants/misc"
import { ArrowRightIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const AnalyticsPage = () => {
  return (
    <>
      {/* Spacer to push content down - slightly reduced height */}
      <div className="h-32 md:h-40"></div>

      <MaxWidthWrapper>
        <AnimationContainer delay={0.1} className="w-full">
          <div className="flex flex-col items-center justify-center py-10 max-w-lg mx-auto">
            <Badge title="New" />
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold font-heading text-center mt-6 !leading-tight">
              Advanced analytics for your business
            </h1>
            <p className="text-base md:text-lg mt-6 text-center text-muted-foreground">
              Gain deep insights into your link performance with real-time analytics. Track clicks, device usage, and
              more to optimize your strategy.
            </p>
            <div className="flex items-center justify-center gap-x-4 mt-8">
              <Button asChild>
                <Link href="/app">Get started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/blog">Learn more</Link>
              </Button>
            </div>
          </div>
        </AnimationContainer>
        <AnimationContainer delay={0.2} className="w-full">
          <div className="w-full flex max-w-4xl py-10 mx-auto">
            <Image
              src="/assets/analytics.svg"
              alt="Advanced analytics for your business"
              width={80}
              height={80}
              className="w-full h-auto"
              priority // Improve loading speed by prioritizing this image
            />
          </div>
        </AnimationContainer>
        <AnimationContainer delay={0.3} className="w-full">
          <div className="py-14">
            <div className="mx-auto px-4 md:px-8">
              <h2 className="text-center text-sm font-medium font-heading text-neutral-400 uppercase">
                Trusted by the best in the industry
              </h2>
              <div className="mt-8">
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-6 md:gap-x-16 justify-center py-8">
                  {COMPANIES.map((company) => (
                    <li key={company.name}>
                      <Image
                        src={company.logo || "/placeholder.svg"}
                        alt={company.name}
                        width={80}
                        height={80}
                        quality={100}
                        className="w-28 h-auto"
                        loading="lazy" // Improve loading speed with lazy loading for non-critical images
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>
      <MaxWidthWrapper className="pt-20">
        <AnimationContainer delay={0.4} className="w-full">
          <LampContainer className="max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center relative w-full text-center">
              <h2 className="bg-gradient-to-br from-neutral-300 to-neutral-500 py-4 bg-clip-text text-center text-4xl font-semibold font-heading tracking-tight text-transparent md:text-7xl mt-8">
                Powerup your link strategy
              </h2>
              <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-base md:text-lg">
                Take control of your links with advanced features and real-time insights. Simplify your workflow and
                achieve more.
              </p>
              <div className="mt-6">
                <Button size="lg" asChild>
                  <Link href="/app" className="flex items-center">
                    Get started for free
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </LampContainer>
        </AnimationContainer>
      </MaxWidthWrapper>
    </>
  )
}

export default AnalyticsPage
