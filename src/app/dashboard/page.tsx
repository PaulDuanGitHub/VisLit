'use client'

import Image from "next/image";
import { Button } from '@headlessui/react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/dashboard/Dashboard'
import { useState } from 'react';
import Link from "next/link";
import Hero from "@/components/hero/Hero";
import Footer from "@/components/Footer";

export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <header className="sticky top-0 z-50">
                <Header toggleSidebar={toggleSidebar}></Header>
            </header>
            <main className="relative bg-white overflow-auto">
                <Hero />
                <Dashboard />
                <Footer />
            </main>
        </div>
    );
}
