function CardPaymentTab({
  cardDigits,
  cardBrand,
  cardBounce,
  cardTilt,
  setCardTilt,
  cvvFocused,
  setCvvFocused,
  cardForm,
  cardTouched,
  cardErrors,
  cardValid,
  markCardTouched,
  onCardNumberChange,
  onCardExpiryChange,
  updateCard,
  onSubmit,
}) {
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

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
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
              {cardTouched.cardNumber && !cardErrors.cardNumber && <span className="absolute right-4 top-4 text-emerald-400">✓</span>}
            </label>
            {cardTouched.cardNumber && cardErrors.cardNumber && <p className="mt-1 text-xs text-red-400">{cardErrors.cardNumber}</p>}
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
              {cardTouched.expiry && !cardErrors.expiry && <span className="absolute right-4 top-4 text-emerald-400">✓</span>}
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
              {cardTouched.cardholder && !cardErrors.cardholder && <span className="absolute right-4 top-4 text-emerald-400">✓</span>}
            </label>
            {cardTouched.cardholder && cardErrors.cardholder && <p className="mt-1 text-xs text-red-400">{cardErrors.cardholder}</p>}
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

export default CardPaymentTab
