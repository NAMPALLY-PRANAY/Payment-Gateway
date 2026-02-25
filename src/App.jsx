import { useEffect, useMemo, useRef, useState } from 'react'

const tabs = [
  { id: 'card', label: 'Card Payment' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'bank', label: 'Bank Transfer' },
  { id: 'upi', label: 'UPI' },
]

const product = {
  name: 'FinFlow Enterprise Plan',
  subtotal: 229,
  tax: 15,
  fee: 5,
}

const banks = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'HSBC',
  'Bank of America',
]

const money = (value) => `$${value.toFixed(2)}`

const getCardBrand = (digits) => {
  if (digits.startsWith('4')) return 'VISA'
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01])/.test(digits)) return 'MC'
  return 'CARD'
}

function App() {
  const [activeTab, setActiveTab] = useState('card')
  const [paymentState, setPaymentState] = useState('idle')
  const [checkoutStage, setCheckoutStage] = useState('checkout')
  const [statusLabel, setStatusLabel] = useState('Idle')
  const [show3DS, setShow3DS] = useState(false)
  const [errorShake, setErrorShake] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [receiptMethod, setReceiptMethod] = useState('Card Payment')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)

  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 })
  const [cvvFocused, setCvvFocused] = useState(false)
  const [cardBounce, setCardBounce] = useState(false)
  const cardLenRef = useRef(0)

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholder: '',
    email: '',
  })
  const [cardTouched, setCardTouched] = useState({})

  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    swift: '',
  })
  const [bankError, setBankError] = useState('')

  const [upiId, setUpiId] = useState('')
  const [upiVerified, setUpiVerified] = useState(false)
  const [upiMessage, setUpiMessage] = useState('')

  const cardDigits = cardForm.cardNumber.replace(/\D/g, '')
  const cardBrand = getCardBrand(cardDigits)

  const discountAmount = discountApplied ? 20 : 0
  const totalAmount = product.subtotal + product.tax + product.fee - discountAmount

  const cardErrors = useMemo(() => {
    const month = Number(cardForm.expiry.slice(0, 2))
    return {
      cardNumber: cardDigits.length === 16 ? '' : 'Enter a valid 16-digit card number',
      expiry:
        /^\d{2}\/\d{2}$/.test(cardForm.expiry) && month >= 1 && month <= 12
          ? ''
          : 'Use a valid MM/YY format',
      cvv: /^\d{3,4}$/.test(cardForm.cvv) ? '' : 'CVV must be 3-4 digits',
      cardholder: cardForm.cardholder.trim().length >= 3 ? '' : 'Cardholder name is required',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardForm.email) ? '' : 'Enter a valid email',
    }
  }, [cardDigits.length, cardForm.cardholder, cardForm.cvv, cardForm.email, cardForm.expiry])

  const cardValid =
    Object.values(cardErrors).every((value) => value === '') &&
    Object.values(cardForm).every((value) => value.trim() !== '')

  useEffect(() => {
    if (cardDigits.length === 16 && cardLenRef.current !== 16) {
      setCardBounce(true)
      const timer = setTimeout(() => setCardBounce(false), 520)
      return () => clearTimeout(timer)
    }
    cardLenRef.current = cardDigits.length
  }, [cardDigits.length])

  const updateCard = (key, value) => {
    setCardForm((prev) => ({ ...prev, [key]: value }))
  }

  const markCardTouched = (key) => {
    setCardTouched((prev) => ({ ...prev, [key]: true }))
  }

  const onCardNumberChange = (value) => {
    const formatted = value
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim()
    updateCard('cardNumber', formatted)
  }

  const onCardExpiryChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) {
      updateCard('expiry', digits)
      return
    }
    updateCard('expiry', `${digits.slice(0, 2)}/${digits.slice(2)}`)
  }

  const runStateMachine = (methodLabel, failMessage = 'Payment authorization failed') => {
    setReceiptMethod(methodLabel)
    setPaymentState('validating')
    setStatusLabel('Validating')

    setTimeout(() => {
      setPaymentState('authorizing')
      setStatusLabel('Authorizing')

      setTimeout(() => {
        setPaymentState('processing')
        setStatusLabel('Processing')

        setTimeout(() => {
          const success = Math.random() > 0.18
          if (success) {
            setPaymentState('success')
            setStatusLabel('Success')
            setTransactionId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`)

            setTimeout(() => {
              setCheckoutStage('completed')
              setShowConfetti(true)
              setTimeout(() => setShowConfetti(false), 3000)
            }, 700)
            return
          }

          setPaymentState('failed')
          setStatusLabel('Failed')
          setErrorShake(true)
          setUpiMessage(failMessage)
          setTimeout(() => setErrorShake(false), 450)
        }, 1200)
      }, 900)
    }, 650)
  }

  const resetStateMachine = () => {
    setPaymentState('idle')
    setStatusLabel('Idle')
    setUpiMessage('')
  }

  const stateSteps = ['idle', 'validating', 'authorizing', 'processing', 'success', 'failed']

  const applyDiscount = () => {
    setDiscountApplied(discountCode.trim().toUpperCase() === 'SAVE20')
  }

  const resetAll = () => {
    setCheckoutStage('checkout')
    setPaymentState('idle')
    setStatusLabel('Idle')
    setCardTouched({})
    setCardForm({ cardNumber: '', expiry: '', cvv: '', cardholder: '', email: '' })
    setBankForm({ bankName: '', accountName: '', accountNumber: '', swift: '' })
    setBankError('')
    setUpiId('')
    setUpiVerified(false)
    setUpiMessage('')
  }

  if (checkoutStage === 'completed') {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-900 px-4 py-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.25),transparent_46%)]" />

        {showConfetti && (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 34 }).map((_, index) => (
              <span
                key={index}
                className="confetti-piece"
                style={{
                  left: `${(index * 2.9) % 100}%`,
                  animationDelay: `${(index % 10) * 0.06}s`,
                }}
              />
            ))}
          </div>
        )}

        <section className="relative mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-400">Completed</p>
              <h2 className="mt-2 text-3xl font-semibold">Payment Successful</h2>
              <p className="mt-1 text-sm text-slate-300">Your checkout has been confirmed with enterprise-grade security.</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-emerald-500/20 p-3 animate-[softBounce_0.6s_ease]">
              <svg viewBox="0 0 24 24" className="h-full w-full text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.8">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-slate-900/55 p-5 text-sm md:grid-cols-2">
            <div>
              <p className="text-slate-400">Transaction ID</p>
              <p className="mt-1 font-medium">{transactionId}</p>
            </div>
            <div>
              <p className="text-slate-400">Payment Method</p>
              <p className="mt-1 font-medium">{receiptMethod}</p>
            </div>
            <div>
              <p className="text-slate-400">Product</p>
              <p className="mt-1 font-medium">{product.name}</p>
            </div>
            <div>
              <p className="text-slate-400">Amount Paid</p>
              <p className="mt-1 text-lg font-bold text-emerald-400">{money(totalAmount)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print flex-1 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-5 py-3 font-medium text-emerald-300 transition hover:bg-emerald-500/25"
            >
              Print Receipt
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="no-print flex-1 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/10"
            >
              Back to Checkout
            </button>
          </div>
        </section>
      </main>
    )
  }

  const renderCardTab = () => {
    const maskedCardPreview = cardDigits.length
      ? cardDigits.padEnd(16, '•').match(/.{1,4}/g).join(' ')
      : '•••• •••• •••• ••••'

    return (
      <div className="animate-[tabIn_0.25s_ease]">
        <div
          className={`group card-tilt ${cardBounce ? 'animate-[softBounce_0.55s_ease]' : ''}`}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            setCardTilt({
              x: ((centerY - event.clientY) / rect.height) * 8,
              y: ((event.clientX - centerX) / rect.width) * 10,
            })
          }}
          onMouseLeave={() => setCardTilt({ x: 0, y: 0 })}
        >
          <div
            className="card-3d-inner relative h-52 w-full"
            style={{ transform: `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)` }}
          >
            <div
              className={`card-3d-face absolute inset-0 rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-600/85 via-indigo-500/70 to-blue-500/70 p-6 shadow-xl transition-transform duration-700 ${
                cvvFocused ? 'rotate-y-180' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/80">
                <span>3D Secure Card</span>
                <span className="rounded-full border border-white/30 px-2 py-0.5 text-[10px]">{cardBrand}</span>
              </div>
              <p className="mt-8 text-2xl font-medium tracking-[0.16em]">{maskedCardPreview}</p>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase text-white/75">Cardholder</p>
                  <p className="mt-1 text-sm font-medium uppercase">{cardForm.cardholder || 'YOUR NAME'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/75">Expires</p>
                  <p className="mt-1 text-sm font-medium">{cardForm.expiry || 'MM/YY'}</p>
                </div>
              </div>
            </div>

            <div
              className={`card-3d-face absolute inset-0 rounded-3xl border border-white/20 bg-gradient-to-br from-slate-800/95 to-indigo-950/90 p-6 transition-transform duration-700 ${
                cvvFocused ? '' : 'rotate-y-180'
              }`}
            >
              <div className="mt-2 h-10 rounded bg-black/60" />
              <div className="mt-6 rounded bg-white/90 px-3 py-2 text-right text-sm font-semibold text-slate-900">
                {cardForm.cvv || '***'}
              </div>
              <p className="mt-5 text-xs text-slate-300">Card flips when CVV is focused</p>
            </div>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            setCardTouched({
              cardNumber: true,
              expiry: true,
              cvv: true,
              cardholder: true,
              email: true,
            })
            if (!cardValid) {
              setPaymentState('failed')
              setStatusLabel('Failed')
              setErrorShake(true)
              setTimeout(() => setErrorShake(false), 450)
              return
            }
            resetStateMachine()
            setShow3DS(true)
          }}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="relative block">
                <input
                  className="peer w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 pb-2.5 pt-6 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
                  placeholder=" "
                  inputMode="numeric"
                  value={cardForm.cardNumber}
                  onBlur={() => markCardTouched('cardNumber')}
                  onChange={(event) => onCardNumberChange(event.target.value)}
                />
                <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-indigo-300">
                  Card Number
                </span>
                {cardTouched.cardNumber && !cardErrors.cardNumber && (
                  <span className="absolute right-4 top-4 text-emerald-400">✓</span>
                )}
              </label>
              {cardTouched.cardNumber && cardErrors.cardNumber && (
                <p className="mt-1 text-xs text-red-400">{cardErrors.cardNumber}</p>
              )}
            </div>

            <div>
              <label className="relative block">
                <input
                  className="peer w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 pb-2.5 pt-6 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
                  placeholder=" "
                  inputMode="numeric"
                  value={cardForm.expiry}
                  onBlur={() => markCardTouched('expiry')}
                  onChange={(event) => onCardExpiryChange(event.target.value)}
                />
                <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-indigo-300">
                  Expiry Date
                </span>
                {cardTouched.expiry && !cardErrors.expiry && (
                  <span className="absolute right-4 top-4 text-emerald-400">✓</span>
                )}
              </label>
              {cardTouched.expiry && cardErrors.expiry && <p className="mt-1 text-xs text-red-400">{cardErrors.expiry}</p>}
            </div>

            <div>
              <label className="relative block">
                <input
                  className="peer w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 pb-2.5 pt-6 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
                  placeholder=" "
                  inputMode="numeric"
                  maxLength={4}
                  value={cardForm.cvv}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => {
                    setCvvFocused(false)
                    markCardTouched('cvv')
                  }}
                  onChange={(event) => updateCard('cvv', event.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-indigo-300">
                  CVV
                </span>
                {cardTouched.cvv && !cardErrors.cvv && <span className="absolute right-4 top-4 text-emerald-400">✓</span>}
              </label>
              {cardTouched.cvv && cardErrors.cvv && <p className="mt-1 text-xs text-red-400">{cardErrors.cvv}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="relative block">
                <input
                  className="peer w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 pb-2.5 pt-6 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
                  placeholder=" "
                  value={cardForm.cardholder}
                  onBlur={() => markCardTouched('cardholder')}
                  onChange={(event) => updateCard('cardholder', event.target.value)}
                />
                <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-indigo-300">
                  Cardholder Name
                </span>
                {cardTouched.cardholder && !cardErrors.cardholder && (
                  <span className="absolute right-4 top-4 text-emerald-400">✓</span>
                )}
              </label>
              {cardTouched.cardholder && cardErrors.cardholder && (
                <p className="mt-1 text-xs text-red-400">{cardErrors.cardholder}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="relative block">
                <input
                  className="peer w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 pb-2.5 pt-6 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
                  placeholder=" "
                  type="email"
                  value={cardForm.email}
                  onBlur={() => markCardTouched('email')}
                  onChange={(event) => updateCard('email', event.target.value)}
                />
                <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-indigo-300">
                  Email
                </span>
                {cardTouched.email && !cardErrors.email && <span className="absolute right-4 top-4 text-emerald-400">✓</span>}
              </label>
              {cardTouched.email && cardErrors.email && <p className="mt-1 text-xs text-red-400">{cardErrors.email}</p>}
            </div>
          </div>

          <button
            type="submit"
            className={`relative mt-2 w-full overflow-hidden rounded-2xl px-4 py-4 text-base font-semibold text-white transition focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${
              cardValid ? 'animate-[buttonPulse_1.7s_ease-in-out_infinite]' : 'opacity-80'
            } bg-gradient-to-r from-indigo-600 to-blue-500`}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition hover:opacity-100 hover:animate-[shimmer_1.1s_linear_infinite]" />
            <span className="relative">Pay $249.00</span>
          </button>
        </form>
      </div>
    )
  }

  const renderPaypalTab = () => (
    <div className="animate-[tabIn_0.25s_ease]">
      <button
        type="button"
        className="w-full rounded-2xl bg-[#0070BA] px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:brightness-110"
        onClick={() => {
          resetStateMachine()
          setUpiMessage('Secure checkout via PayPal')
          runStateMachine('PayPal', 'PayPal authorization declined, please retry')
        }}
      >
        Pay with PayPal
      </button>
      <p className="mt-3 text-sm text-slate-300">Secure checkout via PayPal. Redirect simulation is enabled.</p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-300">
        Simulated redirect → authorization → return success state.
      </div>
    </div>
  )

  const renderBankTab = () => (
    <form
      className="animate-[tabIn_0.25s_ease] space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (
          bankForm.bankName.trim().length < 2 ||
          bankForm.accountName.trim().length < 3 ||
          bankForm.accountNumber.trim().length < 8 ||
          bankForm.swift.trim().length < 6
        ) {
          setBankError('Please complete all bank transfer details')
          setPaymentState('failed')
          setStatusLabel('Failed')
          setErrorShake(true)
          setTimeout(() => setErrorShake(false), 450)
          return
        }
        setBankError('')
        resetStateMachine()
        setUpiMessage('Waiting for bank authorization...')
        runStateMachine('Bank Transfer', 'Bank authorization timed out, please retry')
      }}
    >
      <label className="block text-sm font-medium text-slate-200">Select Bank</label>
      <input
        list="bank-list"
        className="w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
        placeholder="Search bank"
        value={bankForm.bankName}
        onChange={(event) => setBankForm((prev) => ({ ...prev, bankName: event.target.value }))}
      />
      <datalist id="bank-list">
        {banks.map((bank) => (
          <option key={bank} value={bank} />
        ))}
      </datalist>

      <input
        className="w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
        placeholder="Account holder name"
        value={bankForm.accountName}
        onChange={(event) => setBankForm((prev) => ({ ...prev, accountName: event.target.value }))}
      />
      <input
        className="w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
        placeholder="Account number"
        inputMode="numeric"
        value={bankForm.accountNumber}
        onChange={(event) =>
          setBankForm((prev) => ({ ...prev, accountNumber: event.target.value.replace(/\D/g, '').slice(0, 18) }))
        }
      />
      <input
        className="w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
        placeholder="IFSC / SWIFT"
        value={bankForm.swift}
        onChange={(event) => setBankForm((prev) => ({ ...prev, swift: event.target.value.toUpperCase() }))}
      />

      {bankError && <p className="text-xs text-red-400">{bankError}</p>}

      <button
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-4 font-semibold text-white transition hover:brightness-110"
      >
        Proceed to Bank
      </button>

      <p className="text-sm text-slate-300">Payment processing state: Waiting for bank authorization...</p>
    </form>
  )

  const renderUpiTab = () => {
    const upiValid = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId)
    return (
      <div className="animate-[tabIn_0.25s_ease] space-y-4">
        <input
          className="w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
          placeholder="example@upi"
          value={upiId}
          onChange={(event) => {
            setUpiId(event.target.value)
            setUpiVerified(false)
          }}
        />

        <div className="rounded-2xl border border-white/10 bg-slate-900/45 p-5 text-center">
          <div className="mx-auto h-40 w-40 rounded-xl border border-dashed border-slate-500 bg-[conic-gradient(from_0deg,_#475569,_#64748b,_#334155,_#64748b)] p-2">
            <div className="flex h-full items-center justify-center rounded-lg bg-slate-900 text-xs text-slate-300">QR CODE</div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Scan with any UPI app</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (!upiValid) {
                setUpiMessage('Enter a valid UPI ID')
                setPaymentState('failed')
                setStatusLabel('Failed')
                return
              }
              setUpiVerified(true)
              setUpiMessage('UPI ID verified')
            }}
            className="flex-1 rounded-2xl border border-indigo-400/45 bg-indigo-500/15 px-4 py-3 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/25"
          >
            Verify UPI ID
          </button>
          <button
            type="button"
            onClick={() => {
              if (!upiVerified) {
                setUpiMessage('Verify UPI ID before sending request')
                setPaymentState('failed')
                setStatusLabel('Failed')
                return
              }
              resetStateMachine()
              setUpiMessage('Request Sent to UPI App...')
              runStateMachine('UPI', 'UPI collect request failed, try again')
            }}
            className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Send Collect Request
          </button>
        </div>

        {upiMessage && (
          <p className={`text-sm ${paymentState === 'failed' ? 'text-red-400' : 'text-emerald-400'}`}>{upiMessage}</p>
        )}
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-900 px-4 py-8 font-[Inter] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(79,70,229,0.35),transparent_45%),radial-gradient(circle_at_82%_20%,rgba(16,185,129,0.2),transparent_40%)]" />
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

      <section
        className={`relative mx-auto w-full max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.08] p-4 shadow-[0_25px_80px_rgba(2,6,23,0.75)] backdrop-blur-xl md:p-8 ${
          errorShake ? 'animate-[errorShake_0.38s_ease]' : ''
        }`}
      >
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="mb-5 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    resetStateMachine()
                  }}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'card' && renderCardTab()}
            {activeTab === 'paypal' && renderPaypalTab()}
            {activeTab === 'bank' && renderBankTab()}
            {activeTab === 'upi' && renderUpiTab()}

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 10V7a6 6 0 0112 0v3" />
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                </svg>
                SSL Encrypted & Secure Payment
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-white/15 px-2 py-1">PCI DSS</span>
                <span className="rounded-full border border-white/15 px-2 py-1">ISO 27001</span>
                <span className="rounded-full border border-white/15 px-2 py-1">3D Secure 2.0</span>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5 shadow-xl">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <p className="mt-1 text-sm text-slate-400">Premium SaaS checkout details</p>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Product</span>
                  <span>{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span>{money(product.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax</span>
                  <span>{money(product.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Processing Fee</span>
                  <span>{money(product.fee)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{money(discountAmount)}</span>
                  </div>
                )}
                <div className="mt-3 border-t border-white/10 pt-3">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-emerald-400">{money(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">Discount code</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                    placeholder="SAVE20"
                    value={discountCode}
                    onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                  />
                  <button
                    type="button"
                    onClick={applyDiscount}
                    className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/15"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-slate-400">Use SAVE20 to apply a $20 discount.</p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Payment State Machine</p>
                <p className="mt-1 text-sm font-medium">Current: {statusLabel}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {stateSteps.map((step) => {
                    const active = paymentState === step
                    const completed =
                      stateSteps.indexOf(step) <= stateSteps.indexOf(paymentState) &&
                      !['failed', 'idle'].includes(paymentState)

                    return (
                      <div
                        key={step}
                        className={`rounded-lg border px-2 py-1.5 text-center text-[11px] capitalize transition ${
                          active
                            ? 'border-indigo-400 bg-indigo-500/25 text-indigo-100'
                            : completed
                              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                              : 'border-white/10 bg-slate-900/60 text-slate-400'
                        }`}
                      >
                        {step}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {show3DS && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">3D Secure</p>
            <h3 className="mt-2 text-xl font-semibold">Verify your card</h3>
            <p className="mt-2 text-sm text-slate-300">Enter OTP sent to your registered mobile number.</p>
            <input
              className="mt-4 w-full rounded-2xl border border-white/15 bg-slate-800/60 px-4 py-3 text-center tracking-[0.35em] outline-none focus:border-indigo-400"
              defaultValue="123456"
              readOnly
            />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-medium text-slate-200 transition hover:bg-white/10"
                onClick={() => setShow3DS(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3 font-semibold text-white"
                onClick={() => {
                  setShow3DS(false)
                  runStateMachine('Card Payment', '3D Secure verification failed')
                }}
              >
                Verify & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
