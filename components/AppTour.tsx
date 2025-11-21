"use client"

import React, { useState, useEffect } from 'react'
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride'

interface AppTourProps {
  run: boolean
  onComplete: () => void
  tourType?: 'main' | 'dashboard' | 'orders' | 'payment' | 'services' | 'forms'
}

export function AppTour({ run, onComplete, tourType = 'main' }: AppTourProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration errors by only rendering on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Main screen tour steps
  const mainScreenSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Welcome to IP Protection India! 🎉</h3>
          <p>Let's take a quick tour to help you get started with our patent services.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="hero-section"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Patent Journey Starts Here</h3>
          <p>This is our main hero section where you can explore our comprehensive patent services and solutions.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="services-grid"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Patent Services</h3>
          <p>Browse through our range of patent services including patent drafting, searches, filing, and more. Click on any service to get detailed information and pricing.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="get-quote-button"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Get Started with a Quote</h3>
          <p>Click here to get instant pricing for any patent service. Our intelligent pricing system provides transparent, upfront costs.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="login-button"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Account Menu</h3>
          <p>Click this profile icon to sign in, access your dashboard, track orders, and manage your patent applications. New users can also sign up here!</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="features-section"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Company Info & Contact</h3>
          <p>Find our contact details, office address, and links to our services here. You can also access our Privacy Policy and other important company information.</p>
        </div>
      ),
      placement: 'top',
    },
  ]

  // Dashboard tour steps (for future expansion)
  const dashboardSteps: Step[] = [
    {
      target: '[data-tour="dashboard-nav"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Dashboard Navigation</h3>
          <p>Use these tabs to navigate between Services, Orders, and your Profile.</p>
        </div>
      ),
      placement: 'bottom',
    },
  ]

  // Orders screen tour steps
  const ordersSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Orders Dashboard 📋</h3>
          <p>Welcome to your orders! Here you can track all your patent services, fill application forms, and download invoices.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="orders-table"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Orders Overview</h3>
          <p>This table shows all your orders with details like Order ID, Category, Service, Amount, Payment Mode, Status, and Date. You can track each order's progress here.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Understanding Order Status 🔄</h3>
          <p className="mb-3">Each order goes through the following stages:</p>
          <ul className="space-y-2 text-sm">
            <li><strong className="text-yellow-600">Pending:</strong> Payment received, awaiting form submission</li>
            <li><strong className="text-blue-600">Processing:</strong> Forms submitted, under review by our team. If you see a chat icon 💬, click it to read and respond to messages</li>
            <li><strong className="text-purple-600">In Progress:</strong> Application filed, awaiting official response</li>
            <li><strong className="text-green-600">Completed:</strong> Process finished successfully</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            <strong>Actions:</strong> Click "Open Form" to submit application details. Use "Download Invoice" to get your payment receipt.
          </p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '[data-tour="forms-button"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Fill Application Forms 📝</h3>
          <p>Click <strong>Open Form</strong> to fill in your patent application details. You'll need to provide information about your invention. Once confirmed, this button will be disabled.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="download-invoice"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Download Invoice & Forms 💾</h3>
          <p>Click <strong>PDF + Forms</strong> to download a comprehensive document that includes your invoice and all submitted form responses in a single PDF file.</p>
        </div>
      ),
      placement: 'left',
    },
  ]

  // Payment/Checkout screen tour steps
  const paymentSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Payment Successful! 🎉</h3>
          <p>Your payment has been confirmed. Let's quickly walk you through what happens next.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="payment-details"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
          <p>Here you can see your Payment ID, date, amount, and status. Save your Payment ID for future reference.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="application-type"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Application Type</h3>
          <p>This shows the type of patent service you've purchased (e.g., Patentability Search, Drafting, Filing).</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="proceed-button"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Next Step: Fill Your Form</h3>
          <p>Click this button to open your application form in a new tab. Complete the form with your invention details to proceed with your patent service.</p>
        </div>
      ),
      placement: 'top',
    },
  ]

  // Forms screen tour steps
  const formsSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Application Forms 📝</h3>
          <p>Fill in your patent application details carefully. Let's walk through the key features and buttons.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="save-button"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Save Button 💾</h3>
          <p>Click <strong>Save</strong> to save your progress at any time. Your data is stored securely and you can come back later to complete the form.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="refill-button"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Refill Button 🔄</h3>
          <p>Click <strong>Refill</strong> or <strong>Prefill Saved Data</strong> to clear all fields or restore previously saved data. Useful if you want to start over or reload your draft.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="submit-button"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Submit Button ✉️</h3>
          <p>Once you've filled all required fields, click <strong>Submit</strong> to review your information. This enters confirmation mode where you can verify everything before final submission.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Submit → Confirm Workflow ✔️</h3>
          <div className="space-y-2 text-sm">
            <p>After clicking Submit, you'll see a <strong>Confirm</strong> button. Review your details carefully, then click Confirm to finalize your submission.</p>
            <p>If you need to make changes, click the <strong>Edit</strong> button to return to editing mode.</p>
          </div>
        </div>
      ),
      placement: 'center',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">⚠️ Important Field Requirements</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Mandatory Fields:</strong> Fields marked with <strong>*</strong> are required. You'll see a warning message until all required fields are filled.</p>
            <p><strong>Character Limits:</strong> Text fields show remaining characters like <code>* 0/200</code>. Stay within the limit for each field.</p>
            <p><strong>Uploads & Comments:</strong> These are optional but helpful for providing additional context.</p>
          </div>
        </div>
      ),
      placement: 'center',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">📎 File Upload Guidelines</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Allowed Formats:</strong> PDF, PNG, JPG, SVG</p>
            <p><strong>File Size Limit:</strong> Up to <strong>15MB</strong> per file</p>
            <p><strong>What to Upload:</strong> Supporting documents, figures, diagrams, drawings, or any files that help explain your patent application.</p>
            <p className="text-xs text-gray-600 mt-2">Tip: Make sure your files are clear and properly named for easy reference.</p>
          </div>
        </div>
      ),
      placement: 'center',
    },
  ]

  // Services/Cart screen tour steps
  const servicesSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Services Cart 🛒</h3>
          <p>This is where you review and manage your selected patent services before making payment.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="cart-items"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Selected Services</h3>
          <p>Review each service you've added. You can see the service category, pricing, details, and remove items if needed.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="make-payment-button"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Make Payment</h3>
          <p>Click here when you're ready to proceed with payment. This will open the secure Razorpay payment gateway.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="payment-warning"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">⚠️ Important Warning</h3>
          <p><strong>Do not switch tabs, minimize, or leave this screen</strong> during payment. Doing so will interrupt the payment process and sign you out.</p>
        </div>
      ),
      placement: 'top',
    },
  ]

  const getSteps = (): Step[] => {
    switch (tourType) {
      case 'dashboard':
        return dashboardSteps
      case 'orders':
        return ordersSteps
      case 'payment':
        return paymentSteps
      case 'services':
        return servicesSteps
      case 'forms':
        return formsSteps
      default:
        return mainScreenSteps
    }
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0))
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setStepIndex(0)
      onComplete()
    }
  }

  // Don't render during SSR to prevent hydration errors
  if (!isMounted) {
    return null
  }

  return (
    <Joyride
      steps={getSteps()}
      run={run}
      continuous
      showProgress
      showSkipButton
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          borderRadius: 6,
          padding: '8px 16px',
        },
        buttonBack: {
          marginRight: 10,
          color: '#6b7280',
        },
        buttonSkip: {
          color: '#6b7280',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  )
}
