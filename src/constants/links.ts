import { 
    CpuIcon, 
    BarChart2, 
    ZapIcon, 
    SettingsIcon, 
    CreditCardIcon, 
    UsersIcon, 
    ShieldCheckIcon, 
    LogOut, 
    Headphones, 
    ChartPieIcon, 
    LucideIcon, 
    NetworkIcon, 
    TerminalSquareIcon, 
    BotIcon, 
    PlugZapIcon 
} from 'lucide-react';

type Link = {
    href: string;
    label: string;
    icon: LucideIcon;
}

export const SIDEBAR_LINKS: Link[] = [
    {
        href: "/app",
        label: "Dashboard",
        icon: ChartPieIcon,
    },
    {
        href: "/ai-agents",
        label: "AI Agents",
        icon: BotIcon
    },
    {
        href: "/dashboard/workflows",
        label: "Workflows",
        icon: PlugZapIcon
    },
    {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: BarChart2
    },
    {
        href: "/dashboard/integrations",
        label: "Integrations",
        icon: NetworkIcon
    },
    {
        href: "/dashboard/security",
        label: "Security",
        icon: ShieldCheckIcon
    },
    {
        href: "/dashboard/billing",
        label: "Billing",
        icon: CreditCardIcon
    },
    {
        href: "/settings",
        label: "Settings",
        icon: SettingsIcon
    },
];

export const FOOTER_LINKS = [
    {
        title: "Product",
        links: [
            { name: "Home", href: "/" },
            { name: "Features", href: "/features" },
            { name: "Pricing", href: "/pricing" },
            { name: "Contact", href: "/contact" },
            { name: "Demo", href: "/demo" },
        ],
    },
    {
        title: "Resources",
        links: [
            { name: "Blog", href: "/blog" },
            { name: "AI Knowledge Base", href: "/ai-knowledge" },
            { name: "Community", href: "/community" },
            { name: "Use Cases", href: "/use-cases" },
        ],
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
            { name: "Data Protection", href: "/data-protection" },
        ],
    },
    {
        title: "Developers",
        links: [
            { name: "API Docs", href: "/api-docs" },
            { name: "SDKs & Tools", href: "/sdk-tools" },
            { name: "Open Source", href: "/open-source" },
            { name: "Changelog", href: "/changelog" },
        ],
    },
];
