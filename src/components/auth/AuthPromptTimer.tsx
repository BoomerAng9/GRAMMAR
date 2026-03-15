'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@nextui-org/react';
import Link from 'next/link';

export function AuthPromptTimer() {
  const { session, loading } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    // Only set the timer if we are sure there is no session
    if (!loading && !session) {
      const timer = setTimeout(() => {
        onOpen();
      }, 45000); // 45 seconds

      return () => clearTimeout(timer);
    }
  }, [session, loading, onOpen]);

  if (session || loading) {
    return null;
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
      isDismissable={false} // Force them to interact or close via X
    >
      <ModalContent className="bg-white border border-slate-200 text-slate-900">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl border-b border-slate-100 pb-4 font-sans font-bold tracking-tight">
              Unlock the Full <span className="font-script text-2xl text-[#00A3FF]">Grammar</span> Ecosystem
            </ModalHeader>
            <ModalBody className="py-6">
              <p className="text-slate-500 font-sans text-sm font-medium leading-relaxed">
                You&apos;ve been exploring for a while! To dive deeper, customize your technical context, and leverage the full power of our autonomous engine across Claude, OpenAI, and VS Code, create a free account today.
              </p>
            </ModalBody>
            <ModalFooter className="border-t border-slate-100 pt-4">
              <Button color="default" variant="light" onPress={onClose} className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                Continue Browsing
              </Button>
              <Button 
                as={Link} 
                href="/auth/login" 
                className="bg-[#00A3FF] text-white font-bold rounded-xl shadow-lg shadow-[#00A3FF33] hover:bg-[#0089D9]"
              >
                Sign Up / Login
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
