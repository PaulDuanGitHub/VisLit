'use client'

import Header from '@/components/Header'
import Dashboard from '@/components/dashboard/Dashboard'
import Hero from "@/components/hero/Hero";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <header className="sticky top-0 z-50">
                <Header></Header>
            </header>
            <main className="relative bg-white overflow-auto">
                <Hero />
                <Dashboard />
                <Footer />
            </main>
        </div>
    );
}
