"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, FileText } from 'lucide-react'

export interface ServiceCartItem {
  id: string
  name: string
  price: number
  category: string
  details?: string
}

interface ServicesPanelProps {
  cartItems: ServiceCartItem[]
  onRemove: (id: string) => void
  onMakePayment: () => void
  onBrowseServices: () => void
  formatAmount: (n: number) => string
}

function ServicesPanelComponent({
  cartItems,
  onRemove,
  onMakePayment,
  onBrowseServices,
  formatAmount,
}: ServicesPanelProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Selected Services</h1>
        <p className="text-gray-600">Review your selected IP protection services and customize your quote</p>
      </div>
      <div className="space-y-6">
        {cartItems.map((item) => (
          <Card key={item.id} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-3">{item.category}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Professional {item.category.toLowerCase()} service with comprehensive coverage and expert guidance.</p>
                  {item.details && (<p className="text-xs text-gray-500 mb-2">Details: {item.details}</p>)}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{formatAmount(item.price)}</span>
                    <Button onClick={() => onRemove(item.id)} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {cartItems.length === 0 && (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services selected</h3>
              <p className="text-gray-600 mb-4">Add some services to create your quote</p>
              <Button onClick={onBrowseServices} className="bg-blue-600 hover:bg-blue-700">Browse Services</Button>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="flex flex-col items-center mt-8 space-y-3">
        <Button className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white" onClick={onMakePayment} disabled={cartItems.length === 0}>
          <FileText className="h-4 w-4 mr-2" />
          Make Payment
        </Button>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 max-w-lg text-center leading-snug">
          Clicking on <span className="font-semibold">Make Payment</span> will open the secure Razorpay window. <strong>Do not switch tabs, minimize, or leave this screen until the payment is completed</strong> or you will be signed out and need to sign in again to retry.
        </p>
      </div>
    </>
  )
}

// Custom comparator ignores function identity so parent re-renders (due to new handler references) don't force re-render unless cart changed.
function areEqual(prev: ServicesPanelProps, next: ServicesPanelProps) {
  if (prev.cartItems.length !== next.cartItems.length) return false
  for (let i = 0; i < prev.cartItems.length; i++) {
    const a = prev.cartItems[i]
    const b = next.cartItems[i]
    if (a.id !== b.id || a.price !== b.price || a.category !== b.category || a.name !== b.name || a.details !== b.details) {
      return false
    }
  }
  return true
}

const ServicesPanel = React.memo(ServicesPanelComponent, areEqual)
export default ServicesPanel
