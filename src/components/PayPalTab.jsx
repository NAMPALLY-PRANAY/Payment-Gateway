function PayPalTab({ paypalPhone, setPaypalPhone, onSubmit, message, paymentState }) {
  return (
    <div className="animate-[tabIn_0.25s_ease] space-y-4">
      <label className="block text-sm font-medium text-slate-200">PayPal Phone Number</label>
      <input
        className="w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
        placeholder="Enter phone number with country code"
        value={paypalPhone}
        onChange={(event) => setPaypalPhone(event.target.value)}
      />

      <button
        type="button"
        className="w-full rounded-2xl bg-[#0070BA] px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:brightness-110"
        onClick={onSubmit}
      >
        Send PayPal Payment Request
      </button>

      <p className="text-sm text-slate-300">Phone-based request simulation is enabled for this demo.</p>
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-300">
        Simulated phone request → authorization → return success state.
      </div>

      {message && <p className={`text-sm ${paymentState === 'failed' ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>}
    </div>
  )
}

export default PayPalTab
