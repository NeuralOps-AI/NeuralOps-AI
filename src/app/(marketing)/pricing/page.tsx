import AnimationContainer from "../../..//components/ui/animation-container"
import MaxWidthWrapper from "@/components/ui/max-width-wrapper"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { FAQ } from "@/constants/faq"
import PricingCards from "@/components/ui/pricingcard"

const PricingPage = () => {
  return (
    <>
      {/* Spacer to push content down */}
      <div className="h-32 md:h-40"></div>

      <MaxWidthWrapper className="mb-40">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center justify-center py-10 max-w-xl mx-auto">
            <Badge title="Pricing" className="mb-2" />
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold font-heading text-center mt-6 !leading-tight">
              Simple and transparent pricing
            </h1>
            <p className="text-base md:text-lg mt-6 text-center text-muted-foreground">
              Choose a plan that works for you. No hidden fees. No surprises.
            </p>
          </div>
        </AnimationContainer>

        <AnimationContainer delay={0.2}>
          <div className="py-8">
            <PricingCards />
          </div>
        </AnimationContainer>

        <AnimationContainer delay={0.3}>
          <div className="mt-24 w-full max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center w-full mb-16">
              <h2 className="text-2xl font-semibold text-center lg:text-3xl">Frequently Asked Questions</h2>
              <p className="max-w-lg mt-4 text-center text-muted-foreground">
                Here are some of the most common questions we get asked.
              </p>
            </div>
            <div className="w-full">
              <Accordion type="single" collapsible className="space-y-4">
                {FAQ.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border border-border rounded-lg px-1">
                    <AccordionTrigger className="text-base font-medium py-4 px-3 hover:no-underline hover:bg-muted/50 rounded-md data-[state=open]:rounded-b-none transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-1 text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>
    </>
  )
}

export default PricingPage
