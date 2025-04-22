"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AIChatDialog from "@/components/chat/AIChatDialog"

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-red-600 hover:bg-red-700"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <AIChatDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
