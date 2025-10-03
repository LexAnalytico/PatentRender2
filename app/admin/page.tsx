"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Light client-side admin page that calls our admin API route.
// Access is gated both via UI (admin email list) and server route header check / RLS.

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

import type { AdminOrderRow } from '@/types'

export default function AdminDashboardPage() {
	const router = useRouter()
	const [orders, setOrders] = useState<AdminOrderRow[]>([])
	const [assigningIds, setAssigningIds] = useState<Set<number>>(new Set())
	const [selectedAssignee, setSelectedAssignee] = useState<Record<number, string>>({})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [email, setEmail] = useState<string | null>(null)

	// Minimal Supabase client to read the current session for email only
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
	)

	useEffect(() => {
		let active = true
		;(async () => {
			const { data } = await supabase.auth.getSession()
			const userEmail = data?.session?.user?.email || null
			if (active) setEmail(userEmail)
		})()
		return () => { active = false }
	}, [])

	const fetchAll = useCallback(async () => {
		if (!email) return
		if (!ADMIN_EMAILS.includes(email.toLowerCase())) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch('/api/admin/orders', { headers: { 'x-user-email': email } })
			if (!res.ok) {
				setError(`Failed to load orders (${res.status})`)
				setLoading(false)
				return
			}
			const json = await res.json()
			setOrders(json.orders || [])
		} catch (e: any) {
			setError('Unexpected error loading admin orders')
		} finally {
			setLoading(false)
		}
	}, [email])

	const primaryAdmin = ADMIN_EMAILS[0]
	const otherAdmins = ADMIN_EMAILS.filter(e => e !== primaryAdmin)

	const handleAssign = async (orderId: number) => {
		const assignee = selectedAssignee[orderId]
		if (!assignee) return
		setAssigningIds(prev => new Set([...prev, orderId]))
		try {
			const res = await fetch('/api/admin/orders', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', 'x-user-email': email || '' },
				body: JSON.stringify({ orderIds: [orderId], assigned_to: assignee })
			})
			if (!res.ok) {
				console.error('Assign failed', await res.text())
				return
			}
			// optimistic update
			setOrders(o => o.map(row => row.id === orderId ? { ...row, assigned_to: assignee, responsible: assignee } : row))
		} finally {
			setAssigningIds(prev => { const n = new Set(prev); n.delete(orderId); return n })
		}
	}

	useEffect(() => { fetchAll() }, [fetchAll])

	// Gate: if not admin show gentle message
	if (email && !ADMIN_EMAILS.includes(email.toLowerCase())) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<Button variant="ghost" onClick={() => router.push('/')}> <ArrowLeft className="h-4 w-4 mr-1" /> Back Home</Button>
					</div>
					<Card className="bg-white">
						<CardContent className="p-8 text-center space-y-4">
							<ShieldCheck className="h-12 w-12 text-blue-600 mx-auto" />
							<h1 className="text-2xl font-semibold">Access Restricted</h1>
							<p className="text-gray-600 text-sm">You are signed in as {email}. This area is for administrators only.</p>
							<Button onClick={() => router.push('/')}>Return to Home</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" onClick={() => router.push('/')}><ArrowLeft className="h-4 w-4 mr-1" /> Home</Button>
						<h1 className="text-xl font-semibold tracking-tight">Admin Orders Dashboard</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
							<RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
					</div>
				</div>
			</header>
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{!email && (
					<div className="text-sm text-gray-500">Detecting session…</div>
				)}
				{email && ADMIN_EMAILS.includes(email.toLowerCase()) && (
					<>
						{error && <div className="mb-4 text-sm text-red-600">{error}</div>}
						<Card className="bg-white">
							<CardContent className="p-0">
								<div className="overflow-x-auto">
									<table className="w-full text-sm border-collapse">
										<thead>
											<tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b">
												<th className="p-2">Order ID</th>
												<th className="p-2">User</th>
												<th className="p-2">Service</th>
												<th className="p-2">Category</th>
												<th className="p-2">Amount</th>
												<th className="p-2">Payment</th>
												<th className="p-2">Status</th>
												<th className="p-2">Responsible</th>
												{email && email.toLowerCase() === primaryAdmin && <th className="p-2">Forward</th>}
												<th className="p-2">Created</th>
											</tr>
										</thead>
										<tbody>
											{loading && (
												<tr><td className="p-4 text-gray-500" colSpan={8}>Loading…</td></tr>
											)}
											{!loading && orders.length === 0 && (
												<tr><td className="p-4 text-gray-500" colSpan={8}>No orders found.</td></tr>
											)}
											{!loading && orders.map(o => {
												const userName = o.user ? ([o.user.first_name, o.user.last_name].filter(Boolean).join(' ') || o.user.email) : '—'
												return (
													<tr key={o.id} className="border-b last:border-b-0 hover:bg-slate-50">
														<td className="p-2 font-medium">#{o.id}</td>
														<td className="p-2 text-gray-700 max-w-[180px] truncate" title={o.user?.email || ''}>{userName}</td>
														<td className="p-2">{o.services?.name || '—'}</td>
														<td className="p-2">{o.categories?.name || '—'}</td>
														<td className="p-2 font-medium">{o.amount != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(o.amount)) : '—'}</td>
														<td className="p-2 text-xs">{o.payments?.razorpay_payment_id || '—'}</td>
														<td className="p-2 text-xs">{o.payments?.payment_status || '—'}</td>
														<td className="p-2 text-xs whitespace-nowrap">{o.created_at ? new Date(o.created_at).toLocaleString() : '—'}</td>
														<td className="p-2 text-xs">{o.responsible || o.assigned_to || '—'}</td>
														{email && email.toLowerCase() === primaryAdmin && (
															<td className="p-2 text-xs">
																<div className="flex items-center gap-1">
																	<select
																		className="border rounded px-1 py-0.5 text-xs"
																		value={selectedAssignee[o.id] || ''}
																		onChange={e => setSelectedAssignee(s => ({ ...s, [o.id]: e.target.value }))}
																	>
																		<option value="">--select--</option>
																		{otherAdmins.map(a => <option key={a} value={a}>{a}</option>)}
																	</select>
																	<Button size="sm" variant="outline" disabled={!selectedAssignee[o.id] || assigningIds.has(o.id)} onClick={() => handleAssign(o.id)}>
																		{assigningIds.has(o.id) ? '...' : 'Go'}
																	</Button>
																</div>
															</td>
														)}
													</tr>
												)
											})}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</main>
		</div>
	)
}

