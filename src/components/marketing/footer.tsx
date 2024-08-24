import React from 'react'
import Wrapper from "../global/wrapper";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { FOOTER_LINKS } from "@/constants";
import Container from "../global/animation";
import { Particles } from "../ui/particles";

const Footer = () => {
    return (
        <footer className="w-full py-10 relative">
            <Container>
                <Wrapper className="relative flex flex-col md:flex-row justify-between pb-40 overflow-hidden footer">
                    <Particles
                        className="absolute inset-0 w-full -z-10"
                        quantity={40}
                        ease={10}
                        color="#d4d4d8"
                        refresh
                    />
                    <div className="flex flex-col items-start max-w-48">
                        <div className="flex items-center gap-2">
                            <Icons.icon className="w-5 h-5" />
                            <span className="text-xl font-medium">
                                Luro
                            </span>
                        </div>
                        <p className="text-base max-w mt-4">
                            Empower your business with our AI tools.
                        </p>
                        <Button className="mt-8">
                            Start for free
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-lg mt-10 md:mt-0">
                        {FOOTER_LINKS?.map((section, index) => (
                            <div key={index} className="flex flex-col gap-4">
                                <h4 className="text-sm font-medium">
                                    {section.title}
                                </h4>
                                <ul className="space-y-4 w-full">
                                    {section.links.map((link, index) => (
                                        <li key={index} className="text-sm text-muted-foreground hover:text-foreground transition-all w-full">
                                            <Link href={link.href} className="w-full">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Wrapper>
            </Container>
            <Container>
                <Wrapper className="pt-10 flex items-center justify-between relative">
                    <p className="text-sm text-secondary-foreground">
                        &copy; {new Date().getFullYear()} Luro. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="p-1">
                            <Icons.instagram className="w-5 h-5 text-muted-foreground hover:text-secondary-foreground" />
                        </Link>
                        <Link href="#" className="p-1">
                            <Icons.twitter className="w-5 h-5 text-muted-foreground hover:text-secondary-foreground" />
                        </Link>
                        <Link href="#" className="p-1">
                            <Icons.discord className="w-5 h-5 text-muted-foreground hover:text-secondary-foreground" />
                        </Link>
                    </div>
                    {/* <div className="absolute hidden lg:block bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-10 bg-primary -z-20 blur-[6rem]"></div> */}
                </Wrapper>
            </Container>
        </footer>
    )
};

export default Footer
