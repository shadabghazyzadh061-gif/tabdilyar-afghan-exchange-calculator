const currencies = ["USD", "AFN", "IRR", "PKR", "EUR", "AED"];
const els = Object.fromEntries(["amount", "from-currency", "to-currency", "rate", "commission", "from-code", "to-code", "rate-label", "result", "gross-result", "fee-result", "feedback", "calculate-button", "swap-button", "reset-button", "copy-button"].map(id => [id, document.getElementById(id)]));
const formatNumber = value => new Intl.NumberFormat("fa-AF", { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const key = "tabdilyar.preferences.v1";

function syncLabels() {
  els["from-code"].textContent = els["from-currency"].value;
  els["to-code"].textContent = els["to-currency"].value;
  els["rate-label"].textContent = `${els["from-currency"].value} به ${els["to-currency"].value}`;
}

function calculate() {
  const amount = Number(els.amount.value);
  const rate = Number(els.rate.value);
  const commission = Number(els.commission.value || 0);
  const valid = Number.isFinite(amount) && amount >= 0 && Number.isFinite(rate) && rate > 0 && commission >= 0 && commission <= 100;
  if (!valid) {
    els.feedback.textContent = "مبلغ و نرخ معتبر را وارد کن؛ کمیشن باید بین ۰ و ۱۰۰ باشد.";
    els.result.textContent = "—";
    els["gross-result"].textContent = `— ${els["to-currency"].value}`;
    els["fee-result"].textContent = `— ${els["to-currency"].value}`;
    return;
  }
  const gross = amount * rate;
  const fee = gross * commission / 100;
  const net = gross - fee;
  els.result.textContent = formatNumber(net);
  els["gross-result"].textContent = `${formatNumber(gross)} ${els["to-currency"].value}`;
  els["fee-result"].textContent = `${formatNumber(fee)} ${els["to-currency"].value}`;
  els.feedback.textContent = "محاسبه شد.";
  localStorage.setItem(key, JSON.stringify({ from: els["from-currency"].value, to: els["to-currency"].value, rate: els.rate.value, commission: els.commission.value }));
}

function swapCurrencies() {
  const previousRate = Number(els.rate.value);
  [els["from-currency"].value, els["to-currency"].value] = [els["to-currency"].value, els["from-currency"].value];
  if (previousRate > 0) els.rate.value = (1 / previousRate).toPrecision(8).replace(/\.?0+$/, "");
  syncLabels();
  calculate();
}

function reset() {
  els.amount.value = "";
  els.rate.value = "";
  els.commission.value = "0";
  els.result.textContent = "۰";
  els["gross-result"].textContent = `۰ ${els["to-currency"].value}`;
  els["fee-result"].textContent = `۰ ${els["to-currency"].value}`;
  els.feedback.textContent = "";
  localStorage.removeItem(key);
}

els["from-currency"].addEventListener("change", syncLabels);
els["to-currency"].addEventListener("change", syncLabels);
els["calculate-button"].addEventListener("click", calculate);
els["swap-button"].addEventListener("click", swapCurrencies);
els["reset-button"].addEventListener("click", reset);
els.amount.addEventListener("input", () => { if (els.rate.value) calculate(); });
els.rate.addEventListener("input", () => { if (els.amount.value) calculate(); });
els.commission.addEventListener("input", () => { if (els.amount.value && els.rate.value) calculate(); });
els["copy-button"].addEventListener("click", async () => {
  const text = `${els.result.textContent} ${els["to-currency"].value}`;
  try { await navigator.clipboard.writeText(text); els.feedback.textContent = "نتیجه کاپی شد."; }
  catch { els.feedback.textContent = text; }
});

try {
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  if (saved && currencies.includes(saved.from) && currencies.includes(saved.to)) {
    els["from-currency"].value = saved.from;
    els["to-currency"].value = saved.to;
    els.rate.value = saved.rate || "";
    els.commission.value = saved.commission || "0";
  }
} catch { localStorage.removeItem(key); }
syncLabels();
