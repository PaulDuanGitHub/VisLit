'use client';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { motion, AnimatePresence } from "motion/react";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ModalTemplateProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
  }
  
  const ModalTemplate: React.FC<ModalTemplateProps> = ({ children, title, subtitle }) => {
    const router = useRouter();
    const handleClose = () => router.back();
  
    return (
      <AnimatePresence>
        <Dialog static={true} open={true} onClose={() => { }} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
          />
          <div className="fixed inset-0 flex w-screen items-center justify-center">
            <DialogPanel
              as={motion.div}
              initial={{ bottom: -100 }}
              animate={{ bottom: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full md:w-[70%] h-[90%] bg-white pb-12 pt-6 rounded-2xl shadow-xl"
            >
              <button
                onClick={handleClose}
                className="absolute h-10 w-10 top-4 right-4 flex"
              >
                <XMarkIcon className="p-[5px] text-white hover:bg-gray-500 rounded-full bg-gray-700 transition-colors duration-100" />
              </button>
  
              {(title || subtitle) && (
                <div className="px-6 md:px-12 mb-6 border-b border-gray-200 pb-4">
                  <DialogTitle className="text-xl md:text-2xl font-semibold text-gray-800">
                    {title}
                  </DialogTitle>
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                  )}
                </div>
              )}
  
              <div className="overflow-y-auto w-full h-[calc(100%-80px)] px-6 md:px-12">
                {children}
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </AnimatePresence>
    );
  };

export default ModalTemplate;