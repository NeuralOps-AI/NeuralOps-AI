import { ReactNode } from "react";

export interface AnalyticsData {
    name: string;
    automations: number;
    efficiencyGain: number;
  }
  
  export interface Activity {
    description: ReactNode;
    detail: ReactNode;
    value: ReactNode;
    id: number;
    text: string;
    time: string;
  }
  
  export interface RecentSale {
    name: string;
    email: string;
    amount: string;
  }
  
  export const NEURAL_OPS_DATA: AnalyticsData[] = [
    { name: 'Jan', automations: 120, efficiencyGain: 15 },
    { name: 'Feb', automations: 150, efficiencyGain: 18 },
    { name: 'Mar', automations: 110, efficiencyGain: 12 },
    { name: 'Apr', automations: 140, efficiencyGain: 20 },
    { name: 'May', automations: 180, efficiencyGain: 25 },
    { name: 'Jun', automations: 200, efficiencyGain: 30 },
    { name: 'Jul', automations: 220, efficiencyGain: 35 },
    { name: 'Aug', automations: 210, efficiencyGain: 33 },
    { name: 'Sep', automations: 230, efficiencyGain: 37 },
    { name: 'Oct', automations: 250, efficiencyGain: 40 },
    { name: 'Nov', automations: 270, efficiencyGain: 42 },
    { name: 'Dec', automations: 290, efficiencyGain: 45 },
  ];
  
  export const RECENT_ACTIVITY: Activity[] = [
    {
        id: 1, text: 'NeuralOps AI agent deployed for intelligent workflow automation', time: '1 hour ago',
        description: undefined,
        detail: undefined,
        value: undefined
    },
    {
        id: 2, text: 'Workflow "Sales Funnel" fine-tuned for higher conversion rates', time: '3 hours ago',
        description: undefined,
        detail: undefined,
        value: undefined
    },
    {
        id: 3, text: 'NeuralOps AI dashboard updated with real-time operational insights', time: '6 hours ago',
        description: undefined,
        detail: undefined,
        value: undefined
    },
  ];
  
  export const RECENT_SALES: RecentSale[] = [
    {
      name: "Ava Johnson",
      email: "ava.johnson@email.com",
      amount: "+$2,499.00"
    },
    {
      name: "Noah Patel",
      email: "noah.patel@email.com",
      amount: "+$59.00"
    },
    {
      name: "Emma Rodriguez",
      email: "emma.rodriguez@email.com",
      amount: "+$349.00"
    },
    {
      name: "Liam Wilson",
      email: "liam.wilson@email.com",
      amount: "+$129.00"
    },
    {
      name: "Sophia Miller",
      email: "sophia.miller@email.com",
      amount: "+$49.00"
    },
    {
      name: "Benjamin Carter",
      email: "benjamin.carter@email.com",
      amount: "+$219.00"
    }
  ];
  