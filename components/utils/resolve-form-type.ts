//components/utils/resolve-form-type.ts
export const resolveFormTypeFromOrderLike = (order: any): string => {
  if (!order) return "default"

  if (order.services?.form_type) return order.services.form_type
  if (order.services?.slug) return order.services.slug
  if (order.services?.type) return order.services.type
  if (order.services?.category) return order.services.category

  if (order.service_pricing_key) {
    const map: Record<string, string> = {
      basic: "basic-form",
      premium: "premium-form",
      enterprise: "enterprise-form",
    }
    return map[order.service_pricing_key] || order.service_pricing_key
  }
  return "service-form"
}