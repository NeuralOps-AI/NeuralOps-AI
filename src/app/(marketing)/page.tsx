import { Background, Companies, Connect, Container, CTA, Features, Hero, Images, Perks, Pricing, Reviews, Wrapper } from "@/components";
import { Particles } from "@/components/ui/particles";
import { SectionBadge } from "@/components/ui/section-bade";
import { ArrowRightIcon } from "lucide-react";
import React from 'react'
import { Spotlight } from "@/components/ui/spotlight";

const HomePage = () => {
    return (
        <Background>
            <Wrapper className="py-20 relative">
                <Container className="relative">
                    <Spotlight
                        className="-top-40 left-0 md:left-60 md:-top-20"
                        fill="rgba(255, 255, 255, 0.5)"
                    />
                    <Hero />
                </Container>
                <Container className="py-8 lg:py-20">
                    <Companies />
                </Container>
                <Connect />
                {/* <Container className="py-8 lg:py-20">
                </Container> */}
                <Features />
                {/* <Container className="py-8 lg:py-20">
                </Container> */}
                <Perks />
                {/* <Container className="py-8 lg:py-20">
                </Container> */}
                <Pricing />
                {/* <Container className="py-8 lg:py-20">
                </Container> */}
                <Reviews />
                {/* <Container className="py-8 lg:py-20">
                </Container> */}
                <CTA />
                {/* <Container className="py-8 lg:py-20">
                </Container> */}
            </Wrapper>
        </Background>
    )
};

export default HomePage
