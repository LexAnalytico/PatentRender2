"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { buildInvoiceWithFormsHtml } from '@/lib/quotation'
import { OrderChatPopup } from '@/components/OrderChatPopup'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, ShieldCheck, Package } from 'lucide-react'
// Reuse shared supabase client so we inherit existing auth state & subscriptions
import { supabase } from '@/lib/supabase'

// Light client-side admin page that calls our admin API route.
// All env parsing & gating moved to lib/adminConfig for easy extraction later.
import { getAdminConfig, isAdminEmail, isPrimaryAdmin, isSecondaryAdmin } from '@/lib/adminConfig'
const ADMIN_CFG = getAdminConfig()
const ADMIN_EMAILS = ADMIN_CFG.adminEmails
const SECONDARY_ADMINS = ADMIN_CFG.secondaryAdmins

import type { AdminOrderRow } from '@/types'
import { debugLog } from '@/lib/logger'

export default function AdminDashboardPage() {
	const router = useRouter()
	const [orders, setOrders] = useState<AdminOrderRow[]>([])
	const [chatOrderId, setChatOrderId] = useState<number | null>(null)
	const [assigningIds, setAssigningIds] = useState<Set<number>>(new Set())
	const [selectedAssignee, setSelectedAssignee] = useState<Record<number, string>>({})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [email, setEmail] = useState<string | null>(null)
	// Unread chat tracking: map of orderId -> { count, last_created_at }
	const [unreadMap, setUnreadMap] = useState<Record<number, { count: number; last_created_at: string | null }>>({})

	// Track whether we've attempted at least one session fetch (for improved messaging)
	const [sessionFetches, setSessionFetches] = useState(0)
	const [lastSessionMs, setLastSessionMs] = useState<number | null>(null)
	const [retrying, setRetrying] = useState(false)
	// Track if we've performed an explicit refreshSession attempt (Supabase) and a hard recovery attempt
	const [refreshTried, setRefreshTried] = useState(false)
	const [hardRecoveryCount, setHardRecoveryCount] = useState(0)
	// Flag when extended staged retries finished without a session
	const [exhaustedRetries, setExhaustedRetries] = useState(false)
	const emailRef = useRef<string | null>(null)
	emailRef.current = email

	// Robust session bootstrap with staged retries (helps after print() / popup flows that delay hydration)
	const runSessionFetch = useCallback(async (label: string) => {
		try {
			const started = performance.now()
			const { data } = await supabase.auth.getSession()
			setSessionFetches(f => f + 1)
			const userEmail = data?.session?.user?.email || null
			if (userEmail) setLastSessionMs(Date.now())
			setEmail(userEmail)
			debugLog('[AdminPage] session-fetch', { label, hasSession: !!data?.session, userEmail, durationMs: Math.round(performance.now() - started) })
			return !!data?.session
		} catch (e: any) {
			debugLog('[AdminPage] session-fetch-error', { label, message: e?.message })
			return false
		}
	}, [])

	// Attempt a more forceful session refresh (uses refreshSession API) once if normal fetch fails repeatedly
	const attemptRefreshSession = useCallback(async () => {
		if (refreshTried) return false
		setRefreshTried(true)
		try {
			debugLog('[AdminPage] refreshSession attempt')
			// @ts-ignore - supabase-js v2 has auth.refreshSession
			const { data, error } = await supabase.auth.refreshSession()
			if (error) {
				debugLog('[AdminPage] refreshSession error', { message: error.message })
				return false
			}
			const mail = data?.session?.user?.email || null
			if (mail) {
				setEmail(mail)
				setLastSessionMs(Date.now())
				debugLog('[AdminPage] refreshSession success', { mail })
				return true
			}
			return false
		} catch (e: any) {
			debugLog('[AdminPage] refreshSession exception', { message: e?.message })
			return false
		}
	}, [refreshTried])

	useEffect(() => {
		let cancelled = false
		;(async () => {
			if (cancelled) return
			// Immediate attempt
			let ok = await runSessionFetch('initial')
			if (cancelled || ok) return
			// Short staged retries with progressive backoff
			const shortDelays = [150, 400, 900]
			for (const d of shortDelays) {
				await new Promise(r => setTimeout(r, d))
				if (cancelled) return
				ok = await runSessionFetch('staged-' + d)
				if (ok) break
			}
			if (cancelled || ok) return
			// Extended retries (helps after intense print / popup flows) - spaced ~1s then 2s
			const extendedDelays = [1100, 2000]
			for (const d of extendedDelays) {
				await new Promise(r => setTimeout(r, d))
				if (cancelled) return
				ok = await runSessionFetch('extended-' + d)
				if (ok) break
			}
			if (!ok) {
				// Final attempt: refreshSession once
				const refreshed = await attemptRefreshSession()
				if (!refreshed) setExhaustedRetries(true)
			}
		})()
		const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
			if (cancelled) return
			const mail = session?.user?.email || null
			if (mail) setLastSessionMs(Date.now())
			setEmail(mail)
			debugLog('[AdminPage] auth-change', { event, hasSession: !!session, email: mail })
		})
		return () => { cancelled = true; sub?.subscription?.unsubscribe() }
	}, [runSessionFetch, attemptRefreshSession])

	// Visibility / window focus re-check (helps after user prints PDF in new tab then navigates here quickly)
	useEffect(() => {
		const onFocus = () => {
			if (emailRef.current) return
			runSessionFetch('focus-recheck')
		}
		window.addEventListener('focus', onFocus)
		return () => window.removeEventListener('focus', onFocus)
	}, [runSessionFetch])

	// Manual retry (UI button) handler
	const manualRetry = async () => {
		if (retrying) return
		setRetrying(true)
		const ok = await runSessionFetch('manual-retry')
		if (!ok) {
			await attemptRefreshSession()
		}
		setRetrying(false)
	}

	const hardRecovery = async () => {
		// Last resort: try to refreshSession then force reload if still no email
		await attemptRefreshSession()
		setHardRecoveryCount(c => c + 1)
		setTimeout(() => {
			if (!emailRef.current) {
				try { window.location.reload() } catch {}
			}
		}, 180)
	}

	const fetchAll = useCallback(async () => {
		if (!email) return
		if (!isAdminEmail(email)) return
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

	// Fetch chat summaries to compute unread counts (approximate: if last message after last view timestamp -> count=1; else 0)
	useEffect(() => {
		(async () => {
			if (!email) return
			if (!isAdminEmail(email)) return
			if (!orders.length) return
			try {
				const orderIds = orders.map(o => o.id).join(',')
				const res = await fetch(`/api/order-messages/summary?orderIds=${orderIds}`, { headers: { 'x-user-email': email } })
				if (!res.ok) return
				const json = await res.json()
				if (!json.summaries) return
				const next: Record<number, { count: number; last_created_at: string | null }> = {}
				for (const s of json.summaries as any[]) {
					const lastView = (typeof window !== 'undefined') ? localStorage.getItem(`order_chat_last_view_${s.order_id}`) : null
					let count = 0
					if (!lastView) {
						// Never viewed: show total messages (capped to 9 for badge clarity)
						count = Math.min(s.message_count || 0, 9)
					} else if (s.last_created_at && new Date(s.last_created_at) > new Date(lastView)) {
						count = 1 // At least one new since last view (we only know there's new activity)
					}
					next[s.order_id] = { count, last_created_at: s.last_created_at || null }
				}
				setUnreadMap(next)
			} catch {}
		})()
	}, [orders, email])

	const primaryAdmin = ADMIN_EMAILS[0]
	const otherAdmins = ADMIN_EMAILS.filter(e => e !== primaryAdmin)

	const isPrimary = useMemo(() => isPrimaryAdmin(email), [email])
	const isSecondary = useMemo(() => isSecondaryAdmin(email), [email])

	useEffect(() => {
		debugLog('[AdminPage] role-eval', { email, primaryAdmin, SECONDARY_ADMINS, isPrimary, isSecondary, totalOrders: orders.length })
	}, [email, primaryAdmin, isPrimary, isSecondary, orders.length])

	// Secondary admin view: only show orders where assigned_to or responsible matches them.
	const filteredOrders = useMemo(() => {
		if (isPrimary) return orders // primary sees all
		if (isSecondary) {
			const lower = (email || '').toLowerCase()
			return orders.filter(o => (
				(o.assigned_to && o.assigned_to.toLowerCase() === lower) ||
				(o.responsible && o.responsible.toLowerCase() === lower)
			))
		}
		// Non-primary but not recognized secondary (future roles) -> empty for safety
		return []
	}, [orders, isPrimary, isSecondary, email])

	// Aggregate metrics (extend easily later)
	const totalOrders = orders.length
	const visibleOrders = filteredOrders.length

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
	// Feature flag: allow full removal / disable
	if (!ADMIN_CFG.enabled) {
		return (
			<div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center text-sm text-gray-600">
				<span>Admin panel disabled.</span>
			</div>
		)
	}

	if (email && !isAdminEmail(email)) {
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
						<Button variant="ghost" onClick={() => router.push('/')}>\<ArrowLeft className="h-4 w-4 mr-1" /> Home</Button>
						<h1 className="text-xl font-semibold tracking-tight">
							{isPrimary ? 'Admin Orders Dashboard' : isSecondary ? 'My Assigned Orders' : 'Admin Orders'}
						</h1>
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
					<div className="text-sm text-gray-600 flex flex-col gap-2">
						<div className="flex items-center gap-3">
							<span>
								{exhaustedRetries
									? (refreshTried ? 'Session not found after retries.' : 'Attempting session refresh…')
									: (sessionFetches < 3 ? 'Detecting session…' : 'Still trying to establish session…')}
							</span>
							<Button size="sm" variant="outline" disabled={retrying} onClick={manualRetry}>{retrying ? 'Retrying…' : 'Retry'}</Button>
						</div>
						{exhaustedRetries && (
							<div className="flex items-center gap-3 text-xs text-gray-500">
								<span>Stuck? Use Hard Recovery (may reload page).</span>
								<Button size="sm" variant="outline" onClick={hardRecovery}>Hard Recovery</Button>
							</div>
						)}
						{lastSessionMs && <div className="text-[11px] text-gray-400">Last session seen: {new Date(lastSessionMs).toLocaleTimeString()}</div>}
						{hardRecoveryCount > 0 && !email && <div className="text-[11px] text-amber-600">Recovery attempt #{hardRecoveryCount}</div>}
					</div>
				)}
				{email && isAdminEmail(email) && (
					<>
						{/* Stats / KPI cards */}
						<div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="rounded-lg border bg-white p-4 flex items-center justify-between shadow-sm">
								<div>
									<p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Total Orders</p>
									<p className="mt-1 text-2xl font-semibold text-gray-900">{totalOrders}</p>
									{isPrimary ? (
										<p className="text-[11px] text-gray-500 mt-1">All orders in system</p>
									) : (
										<p className="text-[11px] text-gray-500 mt-1">You can see {visibleOrders}</p>
									)}
								</div>
								<div className="h-12 w-12 rounded-md bg-blue-50 flex items-center justify-center">
									<Package className="h-6 w-6 text-blue-600" />
								</div>
							</div>
						</div>
						{error && <div className="mb-4 text-sm text-red-600">{error}</div>}
						<Card className="bg-white">
							<CardContent className="p-0">
								<div className="overflow-x-auto">
									<table className="w-full text-sm border-collapse">
										<thead>
											<tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b">
												<th className="p-2">Order No.</th>
												<th className="p-2">User</th>
												<th className="p-2">Service</th>
												<th className="p-2">Category</th>
												<th className="p-2">Amount</th>
												<th className="p-2">Payment</th>
												<th className="p-2">Payment Status</th>
												<th className="p-2">Workflow</th>
												<th className="p-2">Created</th>
												<th className="p-2">Docs</th>
												<th className="p-2">Responsible</th>
												{isPrimary && <th className="p-2">Forward</th>}
											</tr>
										</thead>
										<tbody>
											{loading && (
												<tr><td className="p-4 text-gray-500" colSpan={isPrimary ? 10 : 9}>Loading…</td></tr>
											)}
											{!loading && filteredOrders.length === 0 && (
												<tr><td className="p-4 text-gray-500" colSpan={isPrimary ? 10 : 9}>{isSecondary ? 'No orders assigned to you yet.' : 'No orders found.'}</td></tr>
											)}
											{!loading && filteredOrders.map(o => {
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
														<td className="p-2 text-xs">
															{isPrimary ? (
																<div className="space-y-1">
																	<div className="flex items-center gap-1">
																		<select
																			className="border rounded px-1 py-0.5 text-xs bg-white"
																			value={(o.workflow_status ? o.workflow_status.replace(/ /g,'_') : 'in_progress')}
																			onChange={async e => {
																				const raw = e.target.value
																				const norm = raw.toLowerCase()
																				setOrders(prev => prev.map(r => r.id === o.id ? { ...r, workflow_status: norm } : r))
																				try {
																					await fetch('/api/admin/orders', {
																						method: 'PATCH',
																						headers: { 'Content-Type': 'application/json', 'x-user-email': email || '' },
																						body: JSON.stringify({ orderIds: [o.id], workflow_status: norm })
																					})
																				} catch (err) { console.error('workflow update failed', err) }
																			}}
																		>
																			<option value="in_progress">In Progress</option>
																			<option value="require_info">Require Info</option>
																			<option value="completed">Completed</option>
																		</select>
																		{(o.workflow_status === 'require_info') && (
																			<button
																																	title="Open chat"
																																	className="text-blue-600 hover:text-blue-800 relative"
																																	onClick={() => {
																																		setChatOrderId(o.id)
																																	}}
																																>💬{unreadMap[o.id] && unreadMap[o.id].count > 0 && (<span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none px-1 rounded">{unreadMap[o.id].count}</span>)}</button>
																		)}
																	</div>
																	{/* Chat replaces inline short message UI */}
																</div>
															) : (
																<span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
																	{(o.workflow_status === 'in_progress' && 'In Progress') || (o.workflow_status === 'require_info' && 'Require Info') || (o.workflow_status === 'completed' && 'Completed') || 'In Progress'}
																</span>
															)}
														</td>
														<td className="p-2 text-xs whitespace-nowrap">{o.created_at ? new Date(o.created_at).toLocaleString() : '—'}</td>
														<td className="p-2 text-xs whitespace-nowrap">
															<div className="flex items-center gap-1">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => {
																		try {
																			const html = `<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Invoice Order #${o.id}</title></head><body><h1 style='font:16px Arial'>Invoice (Single Order)</h1><p>Order ID: ${o.id}</p><p>Service: ${o.services?.name || '—'}</p><p>Category: ${o.categories?.name || '—'}</p><p>Amount: ${o.amount != null ? new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(o.amount)) : '—'}</p><button onclick='window.print()' style='margin-top:16px;'>Print</button></body></html>`
																			const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); }
																		} catch (e) { console.error('Single invoice open failed', e) }
																	}}
																	title="View printable invoice"
																>PDF</Button>
																<Button
																	variant="outline"
																	size="sm"
																	className="ml-1"
																	onClick={async () => {
																		try {
																			// Attempt to fetch form responses for this order (if not already present)
																			let enriched: any = o
																			if (!Array.isArray((o as any).formResponses)) {
																				try {
																					const res = await fetch(`/api/admin/forms?orderId=${o.id}`, { headers: { 'x-user-email': email || '' }, cache: 'no-store' })
																					if (res.ok) {
																						const j = await res.json(); if (Array.isArray(j.formResponses)) {
																							enriched = { ...(o as any), formResponses: j.formResponses }
																						}
																					}
																				} catch {}
																			}
																			const html = buildInvoiceWithFormsHtml({ bundle: { orders: [enriched], totalAmount: Number(o.amount || 0), paymentKey: (o.payments as any)?.razorpay_payment_id || `order-${o.id}` } })
																			const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); }
																		} catch (e) { console.error('Invoice+Forms open failed', e) }
																	}}
																	title="View printable invoice with form data"
																>PDF+Forms</Button>
															</div>
														</td>
														<td className="p-2 text-xs">{o.responsible || o.assigned_to || '—'}</td>
														{isPrimary && (
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
{chatOrderId != null && (
	<OrderChatPopup
		orderId={chatOrderId}
		open={chatOrderId != null}
		onClose={() => setChatOrderId(null)}
		userEmail={email}
		onViewedLatest={(oid) => setUnreadMap(m => ({ ...m, [oid]: { count: 0, last_created_at: m[oid]?.last_created_at || null } }))}
	/>
)}
		</div>
	)
}

