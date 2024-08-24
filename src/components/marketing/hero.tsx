import React from 'react'
import { Wrapper } from "@/components";
import { SectionBadge } from "@/components/ui/section-bade";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Spotlight } from "../ui/spotlight";
import { BlurText } from "../ui/blur-text";

const Hero = () => {
    return (
        <div className="flex flex-col items-center text-center w-full max-w-5xl my-24 mx-auto z-40 relative">
            <div className="pl-2 pr-1 py-1 rounded-full border border-foreground/10 hover:border-foreground/15 backdrop-blur-lg cursor-pointer flex items-center gap-2.5 select-none">
                <div className="w-3.5 h-3.5 rounded-full bg-primary/40 flex items-center justify-center relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping"></div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    </div>
                </div>
                <span className="inline-flex items-center justify-center gap-2 animate-text-gradient animate-background-shine bg-gradient-to-r from-[#b2a8fd] via-[#8678f9] to-[#c7d2fe] bg-[200%_auto] bg-clip-text text-sm text-transparent">
                    Build for the future
                    <span className="text-xs text-secondary-foreground px-1.5 py-0.5 rounded-full bg-gradient-to-b from-foreground/20 to-foreground/10 flex items-center justify-center">
                        What's new
                        <ArrowRightIcon className="w-3.5 h-3.5 ml-1 text-foreground/50" />
                    </span>
                </span>
            </div>
            {/* <h1 className="mt-6 text-3xl md:text-5xl lg:text-6xl xl:text-6xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent !leading-snug font-medium tracking-[-0.0125em] font-headin">
                Your ultimate social media
                <br className="hidden md:block" />
                marketing tool
            </h1> */}
            <BlurText
                word={"Your ultimate social media\n marketing tool"}
                className="text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-2 md:py-0 lg:!leading-snug font-medium tracking-[-0.0125em] mt-6 font-heading"
            />
            <p className="text-sm sm:text-base lg:text-lg mt-4 text-accent-foreground/60 max-w-2xl mx-auto">
                Elevate your social media presense with AI-powered content creation and scheduling. Luro is the all-in-one solution for your social media marketing needs.
            </p>
            <div className="flex items-center justify-center md:gap-x-6 mt-8">
                <Button asChild size="lg">
                    <Link href="#">
                        Start for free
                    </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="hidden md:flex">
                    <Link href="#">
                        How it works
                    </Link>
                </Button>
            </div>
        </div>
    )
};

export default Hero
