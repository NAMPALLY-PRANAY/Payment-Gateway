function BankTransferTab({ bankForm, setBankForm, banks, bankError, onSubmit }) {
  return (
    <form className="animate-[tabIn_0.25s_ease] space-y-4" onSubmit={onSubmit}>
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
}

export default BankTransferTab
