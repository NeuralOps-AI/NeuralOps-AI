type PLAN = {
    id: string;
    title: string;
    desc: string;
    monthlyPrice: number;
    yearlyPrice: number;
    badge?: string;
    buttonText: string;
    features: string[];
    link: string;
};

export const PLANS: PLAN[] = [
    {
        id: "free",
        title: "Free",
        desc: "Get started with essential NeuralOps AI tools for automation and monitoring.",
        monthlyPrice: 0,
        yearlyPrice: 0,
        buttonText: "Get Started",
        features: [
            "Basic AI automation",
            "Real-time monitoring",
            "Limited integrations",
            "Community support",
            "Single project",
            "Standard analytics"
        ],
        link: "https://stripe.com/free-plan-link"
    },
    {
        id: "pro",
        title: "Pro",
        desc: "Unlock advanced NeuralOps AI features for smarter, data-driven automation.",
        monthlyPrice: 10,
        yearlyPrice: 120,
        badge: "Most Popular",
        buttonText: "Upgrade to Pro",
        features: [
            "Advanced AI automation",
            "Enhanced real-time analytics",
            "Priority support",
            "Multiple project limits",
            "Custom workflow integrations",
            "Pro-level security",
            "Team collaboration tools"
        ],
        link: "https://stripe.com/pro-plan-link"
    },
    {
        id: "enterprise",
        title: "Enterprise",
        desc: "Tailored NeuralOps AI solutions for large organizations and high-demand operations.",
        monthlyPrice: 15,
        yearlyPrice: 180,
        badge: "Contact Sales",
        buttonText: "Upgrade to Enterprise",
        features: [
            "Unlimited AI automation",
            "Comprehensive system integrations",
            "Dedicated support team",
            "Unlimited projects",
            "Custom analytics & reporting",
            "Enterprise-grade security",
            "Bespoke AI workflow solutions"
        ],
        link: "https://stripe.com/enterprise-plan-link"
    }
];
