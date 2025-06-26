"use client"

import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Option {
  value: string
  label: string
  price: string
}

interface ProfessionalSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function ProfessionalSelect({
  options,
  value,
  onValueChange,
  placeholder = "اختر خياراً",
}: ProfessionalSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 justify-between text-right bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 focus:border-pink-900 transition-all duration-200 shadow-sm"
        dir="rtl"
      >
        <div className="flex flex-col items-end">
          {selectedOption ? (
            <>
              <span className="font-medium">{selectedOption.label}</span>
              <span className="text-sm text-pink-600 font-bold">{selectedOption.price}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 border-2 border-gray-200 shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onValueChange(option.value)
                    setIsOpen(false)
                  }}
                  className="w-full text-right hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                >
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-gray-800">{option.label}</span>
                    <span className="text-sm text-pink-600 font-bold">{option.price}</span>
                  </div>
                  {value === option.value && <Check className="w-4 h-4 text-pink-600" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
