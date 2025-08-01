import { Scale, Shield, Copyright, Palette, Award, Clock } from "lucide-react"

export const getServiceIcon = (serviceName: string, category: string) => {
  const iconClass =
    category === "Patent"
      ? "h-8 w-8 text-blue-600"
      : category === "Trademark"
        ? "h-8 w-8 text-green-600"
        : category === "Copyright"
          ? "h-8 w-8 text-purple-600"
          : "h-8 w-8 text-orange-600"

  switch (serviceName) {
    case "Patent Search & Analysis":
    case "Trademark Search":
    case "Design Search":
      return <Scale className={iconClass} />

    case "Patent Application Filing":
    case "Trademark Registration":
    case "DMCA Services":
      return <Shield className={iconClass} />

    case "Patent Portfolio Management":
    case "Copyright Licensing":
    case "Design Portfolio":
      return <Award className={iconClass} />

    case "Copyright Registration":
      return <Copyright className={iconClass} />

    case "Trademark Monitoring":
      return <Clock className={iconClass} />

    case "Design Registration":
      return <Palette className={iconClass} />

    default:
      return <Scale className={iconClass} />
  }
}
