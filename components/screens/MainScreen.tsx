"use client"

import React from 'react'

export type MainScreenProps = {
  // future props (filters, callbacks) can be added here
}

export default function MainScreen(_props: MainScreenProps) {
  return (
    <div>
      <h1 id="page-heading" tabIndex={-1}>Main Screen</h1>
      <section>
        <p>Welcome to the Main screen. This component is intended to be mounted as a single active screen so global focus control can work.</p>
        <p>When you navigate here the FocusProvider will move focus to the heading.</p>
      </section>
    </div>
  )
}
