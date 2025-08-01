import type { CartItem, CalculatorFields } from "@/types"

export const getTotalPrice = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + item.price, 0)
}

export const getTaxAmount = (cartItems: CartItem[]): number => {
  return getTotalPrice(cartItems) * 0.08 // 8% tax
}

export const getProcessingFee = (): number => {
  return 25 // Fixed $25 processing fee
}

export const getGrandTotal = (cartItems: CartItem[]): number => {
  return getTotalPrice(cartItems) + getTaxAmount(cartItems) + getProcessingFee()
}

export const calculateAdjustedTotal = (cartItems: CartItem[], calculatorFields: CalculatorFields): number => {
  let baseTotal = getTotalPrice(cartItems)

  // Urgency multiplier
  const urgencyMultipliers = {
    standard: 1,
    urgent: 1.25,
    rush: 1.5,
  }

  // Complexity multiplier
  const complexityMultipliers = {
    simple: 0.9,
    medium: 1,
    complex: 1.3,
  }

  baseTotal *= urgencyMultipliers[calculatorFields.urgency as keyof typeof urgencyMultipliers]
  baseTotal *= complexityMultipliers[calculatorFields.complexity as keyof typeof complexityMultipliers]

  // Additional services
  if (calculatorFields.additionalServices) {
    baseTotal += 500
  }

  // Consultation hours
  baseTotal += (calculatorFields.consultationHours - 1) * 150

  return Math.max(0, baseTotal)
}
