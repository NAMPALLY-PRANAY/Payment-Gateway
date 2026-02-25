import upiQrImage from '../assets/qr.jpg'

function UpiTab({ upiId, setUpiId, setUpiVerified, upiMessage, paymentState, onVerify, onSend }) {
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
        <img src={upiQrImage} alt="UPI QR" className="mx-auto h-40 w-40 rounded-xl border border-white/10 object-cover" />
        <p className="mt-3 text-xs text-slate-400">Scan with any UPI app</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onVerify}
          className="flex-1 rounded-2xl border border-indigo-400/45 bg-indigo-500/15 px-4 py-3 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/25"
        >
          Verify UPI ID
        </button>
        <button
          type="button"
          onClick={onSend}
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

export default UpiTab
