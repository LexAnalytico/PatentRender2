"use client"

import React from 'react'
import OrdersScreen from '@/components/screens/OrdersScreen'
import DashboardSidebar from '@/components/layout/DashboardSidebar'

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <DashboardSidebar active="orders" />
        <div className="flex-1">
          <OrdersScreen />
        </div>
      </div>
    </div>
  )
}

