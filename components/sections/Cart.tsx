"use client"

import { Scale, ShoppingCart, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTotalPrice, getTaxAmount, getProcessingFee, getGrandTotal } from "@/utils/calculations"
import type { CartItem } from "@/types"

interface CartProps {
  cartItems: CartItem[]
  removeFromCart: (id: string) => void
  clearCart: () => void
  goToQuotePage: () => void
  downloadQuotationPDF: () => void
}

export function Cart({ cartItems, removeFromCart, clearCart, goToQuotePage, downloadQuotationPDF }: CartProps) {
  return (
    <div className="w-full lg:w-80 bg-gray-50 border border-gray-200 rounded-lg p-4 flex-shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <div className="pb-4 border-b mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Scale className="h-5 w-5 mr-2 text-blue-600" />
          Service Cart
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            </div>
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">Add services to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.category}</p>
                  <p className="text-sm font-semibold text-blue-600">${item.price.toLocaleString()}</p>
                </div>
                <Button
                  onClick={() => removeFromCart(item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t mt-4 bg-gray-50">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="text-sm font-medium text-gray-900">${getTotalPrice(cartItems).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tax (8%):</span>
            <span className="text-sm font-medium text-gray-900">${getTaxAmount(cartItems).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Processing Fee:</span>
            <span className="text-sm font-medium text-gray-900">${getProcessingFee().toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-blue-600">${getGrandTotal(cartItems).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={goToQuotePage}>
            Get Quote
          </Button>
          <Button
            onClick={downloadQuotationPDF}
            className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Quotation PDF
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">*Prices are estimates. Final costs may vary.</p>
      </div>
    </div>
  )
}
