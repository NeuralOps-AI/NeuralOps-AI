import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { AuthSync } from "@/components/auth/auth-sync";
import React from 'react';
import { ThemeProvider } from "@/components/ui/ThemeProvider";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-black text-white">
      <AuthSync />
      <DashboardNavbar />
      <main className="flex flex-col lg:flex-row flex-1 size-full">
        <DashboardSidebar />
        <div className="w-full pt-20 lg:ml-72 px-4 lg:px-12">
          <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
            <div className="max-w-5xl mx-auto w-full">
              {children}
            </div>
          </ThemeProvider>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
