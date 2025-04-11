"use client"

import React from 'react'
import { ArrowDownIcon, MessageSquareIcon, ArrowUpIcon, BarChart3Icon, Share2Icon, UsersIcon } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { NEURAL_OPS_DATA, RECENT_ACTIVITY } from "@/constants/dashboard"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Container } from "@/components"

const chartConfig = {
    processingSpeed: {
        label: "Processing Speed",
        color: "hsl(var(--chart-1))",
    },
    efficiency: {
        label: "Efficiency",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const Page = () => {
    return (
        <div className="p-4 w-full bg-black text-white">
            <div className="flex flex-col w-full">
                {/* Demo Dashboard Cards */}
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Container>
                        <Card className="bg-black border border-gray-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white">
                                    AI Ops Processing
                                </CardTitle>
                                <BarChart3Icon className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">1.8K Ops</div>
                                <p className="text-xs text-gray-400">
                                    +15.2% from last cycle
                                    <ArrowUpIcon className="ml-1 h-4 w-4 text-green-500 inline" />
                                </p>
                            </CardContent>
                        </Card>
                    </Container>
                    <Container delay={0.1}>
                        <Card className="bg-black border border-gray-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white">
                                    Neural Network Accuracy
                                </CardTitle>
                                <Share2Icon className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">98.7%</div>
                                <p className="text-xs text-gray-400">
                                    +0.8% improvement
                                    <ArrowUpIcon className="ml-1 h-4 w-4 text-green-500 inline" />
                                </p>
                            </CardContent>
                        </Card>
                    </Container>
                    <Container delay={0.2}>
                        <Card className="bg-black border border-gray-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white">
                                    Active IA Agents
                                </CardTitle>
                                <UsersIcon className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">24</div>
                                <p className="text-xs text-gray-400">
                                    -1 from last cycle
                                    <ArrowDownIcon className="ml-1 h-4 w-4 text-red-500 inline" />
                                </p>
                            </CardContent>
                        </Card>
                    </Container>
                    <Container delay={0.3}>
                        <Card className="bg-black border border-gray-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white">
                                    Processed Data Points
                                </CardTitle>
                                <MessageSquareIcon className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">4.2M</div>
                                <p className="text-xs text-gray-400">
                                    +320K since last update
                                    <ArrowUpIcon className="ml-1 h-4 w-4 text-green-500 inline" />
                                </p>
                            </CardContent>
                        </Card>
                    </Container>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mt-8">
                    {/* Performance Chart */}
                    <Container delay={0.2} className="col-span-4">
                        <Card className="bg-black border border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white">Neural Ops Performance</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 w-full">
                                <ChartContainer config={chartConfig}>
                                    <AreaChart
                                        data={NEURAL_OPS_DATA}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} stroke="#444" />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            stroke="#aaa"
                                        />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <defs>
                                            <linearGradient id="fillProcessingSpeed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="fillEfficiency" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            dataKey="efficiencyGain"
                                            type="natural"
                                            fill="url(#fillEfficiency)"
                                            fillOpacity={0.4}
                                            stroke="hsl(var(--chart-2))"
                                            stackId="a"
                                        />
                                        <Area
                                            dataKey="automations"
                                            type="natural"
                                            fill="url(#fillProcessingSpeed)"
                                            fillOpacity={0.4}
                                            stroke="hsl(var(--chart-1))"
                                            stackId="a"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </Container>

                    {/* Recent Activity */}
                    <Container delay={0.3} className="col-span-2">
                        <Card className="bg-black border border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white">Recent AI Activity</CardTitle>
                                <p className="text-sm text-gray-400">
                                    Total operations: 1,680 this cycle.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {RECENT_ACTIVITY.map((activity) => (
                                        <div key={activity.id} className="flex items-center">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-white leading-none">
                                                    {activity.text}
                                                </p>
                                                <p className="text-sm text-gray-400">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </Container>
                </div>
            </div>
        </div>
    )
};

export default Page
