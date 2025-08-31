'use client'

import { Popover, PopoverButton, PopoverPanel, Transition, Button } from '@headlessui/react'
import {
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState } from 'react';
import Sidebar from '@/components/Sidebar'

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
]

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    return (
        <div className='px-10 h-15 bg-white shadow flex items-center justify-between'>
            <div className="flex-1 flex justify-start items-center text-3xl font-semibold">
                <Link href="/" className="text-black hover:text-gray-700">
                    CanLit Vis
                </Link>
            </div>
            <div className="justify-end items-center">
                <nav className="flex space-x-10">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-base font-medium text-gray-500 hover:text-gray-900"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}

export default Header;