'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/contexts/cart-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { getBranches, createOrder } from '@/app/actions/admin-actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2 } from 'lucide-react'

interface Branch {
  id: string
  name: string
  nameAr: string
  city: string
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchesLoading, setBranchesLoading] = useState(true)
  const isOrderCompletedRef = useRef(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    branch: '',
    paymentMethod: 'cash',
    notes: '',
  })

  // Wait for cart to load before checking if empty
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
      if (items.length === 0 && !isOrderCompletedRef.current) {
        router.push('/cart')
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [items.length, router])

  // Fetch branches dynamically from Supabase
  useEffect(() => {
    async function fetchBranches() {
      setBranchesLoading(true)
      const result = await getBranches()
      if (result.branches) {
        setBranches(result.branches)
      } else {
        toast({
          title: 'تحذير',
          description: 'تعذّر تحميل الفروع، حاول تحديث الصفحة',
          variant: 'destructive',
        })
      }
      setBranchesLoading(false)
    }
    fetchBranches()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.address || !formData.branch) {
      toast({
        title: 'خطأ',
        description: 'الرجاء ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Find the selected branch ID
      const selectedBranch = branches.find((b: Branch) => b.id === formData.branch)
      if (!selectedBranch) {
        throw new Error('الفرع غير صحيح')
      }

      // Prepare order items
      const orderItems = items.map(item => ({
        productName: item.name,
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      // Create order in database
      const result = await createOrder(
        selectedBranch.id,
        formData.name,
        formData.phone,
        '',
        formData.address,
        totalPrice,
        orderItems,
        formData.notes
      )

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'تم إرسال طلبك بنجاح!',
        description: 'سيتم التواصل معك قريبًا لتأكيد الطلب',
      })

      isOrderCompletedRef.current = true
      clearCart()
      router.push('/order-success')
    } catch (error) {
      console.error('Order submission error:', error)
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل إرسال الطلب',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while cart is loading
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (items.length === 0 && !isOrderCompletedRef.current) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center">
              إتمام الطلب
            </h1>
          </div>
        </section>

        {/* Checkout Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">معلومات التواصل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            الاسم الكامل <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="أدخل اسمك" 
                            className="text-primary placeholder:opacity-50"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            رقم الهاتف <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="01234567890"
                            className="text-primary placeholder:opacity-50"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">معلومات التوصيل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          العنوان <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="أدخل عنوانك بالتفصيل"
                          rows={3}
                          className="text-primary placeholder:opacity-50"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="branch" >
                          الفرع الأقرب <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.branch}
                          onValueChange={(value) =>
                            setFormData({ ...formData, branch: value })
                          }
                          required
                        >
                          <SelectTrigger className="text-primary data-[placeholder]:opacity-50">
                            <SelectValue placeholder={branchesLoading ? 'جاري تحميل الفروع...' : 'اختر الفرع'} />
                          </SelectTrigger>
                          <SelectContent>
                            {branchesLoading ? (
                              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                                جاري تحميل الفروع...
                              </div>
                            ) : branches.length === 0 ? (
                              <div className="p-4 text-sm text-center text-muted-foreground">لا توجد فروع متاحة</div>
                            ) : (
                              branches.map((branch: Branch) => (
                                <SelectItem key={branch.id} value={branch.id} className="bg-red-700 text-yellow-400 focus:bg-red-800 focus:text-yellow-400 data-[highlighted]:bg-red-800 data-[highlighted]:text-yellow-400">
                                  {branch.nameAr}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="أ�� ملاحظات أو طلبات خاصة"
                          className="text-primary placeholder:opacity-50"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">طريقة الدفع</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value) =>
                          setFormData({ ...formData, paymentMethod: value })
                        }
                      >
                        <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="flex-1 cursor-pointer">
                            <div className="font-semibold text-primary">الدفع عند الاستلام</div>
                            <div className="text-sm text-primary">
                              ادفع نقدًا عند استلام الطلب
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-20">
                    <CardHeader>
                      <CardTitle className="text-2xl">ملخص الطلب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Order Items */}
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="flex-1">
                              {item.nameAr} × {item.quantity}
                            </span>
                            <span className="font-semibold">
                              {(item.price * item.quantity).toFixed(0)} جنيه
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between text-lg">
                          <span className="text-muted-foreground">
                            المجموع الفرعي
                          </span>
                          <span className="font-semibold">
                            {totalPrice.toFixed(0)} جنيه
                          </span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="text-muted-foreground">
                            رسوم التوصيل
                          </span>
                          <span className="font-semibold text-green-600">
                            مجانًا
                          </span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between text-2xl font-bold">
                            <span>الإجمالي</span>
                            <span className="text-primary">
                              {totalPrice.toFixed(0)} جنيه
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full text-lg cursor-pointer"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
