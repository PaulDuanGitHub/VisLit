'use client'

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    return (
        <>
            <aside 
            className={`
                left-0 h-full bg-gray-800 text-white z-40 overflow-hidden sticky top-0
                ${isOpen ? "w-64" : "w-0"}
                transition-all duration-300 ease-in-out`}>
                <div className="p-6 text-lg font-semibold border-b border-gray-700 text-nowrap">
                    Sidebar Menu
                </div>
                <ul className="p-4 space-y-4">
                    <li><a href="#" className="hover:underline">Dashboard</a></li>
                    <li><a href="#" className="hover:underline">Settings</a></li>
                    <li><a href="#" className="hover:underline">Profile</a></li>
                </ul>
            </aside>
        </>
    );
};

export default Sidebar;