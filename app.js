const state = { transactions: [], sortKey: "date", sortDirection: "desc" };
const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
const fullMoney = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
const shortDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

async function loadData() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error("Could not load dashboard data");
    const data = await response.json();
    state.transactions = data.transactions;
    renderDashboard();
  } catch (error) {
    $("#transaction-body").innerHTML = '<tr><td colspan="5">Could not load data. Please run this project using a local static server instead of opening the file directly.</td></tr>';
    $("#table-status").textContent = "Data unavailable";
    $("#chart-summary").textContent = "Chart data could not be loaded.";
  }
}
function periodTransactions() {
  const period = $("#period-filter").value;
  return state.transactions.filter((item) => period === "all" || (period === "q3" && [7,8,9].includes(item.month)) || (period === "q4" && [10,11,12].includes(item.month)));
}
function renderMetrics(data) {
  const revenue = data.filter((item) => item.status === "Completed").reduce((sum, item) => sum + item.amount, 0);
  $("#metric-revenue").textContent = money(revenue);
  $("#metric-orders").textContent = data.length.toLocaleString();
  $("#metric-customers").textContent = new Set(data.map((item) => item.customer)).size.toLocaleString();
  const average = data.length ? data.reduce((sum, item) => sum + item.conversion, 0) / data.length : 0;
  $("#metric-conversion").textContent = `${average.toFixed(1)}%`;
}
function renderChart(data) {
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sums = new Map();
  data.filter((item) => item.status === "Completed").forEach((item) => sums.set(item.month, (sums.get(item.month) || 0) + item.amount));
  const labels = [...sums.keys()].sort((a,b) => a-b);
  const values = labels.map((month) => sums.get(month));
  const max = Math.max(1, ...values) * 1.15;
  const x0 = 44, x1 = 600, y0 = 20, y1 = 205;
  const points = values.map((value, i) => {
    const x = labels.length === 1 ? (x0+x1)/2 : x0 + (x1-x0) * i / (labels.length-1);
    const y = y1 - value/max*(y1-y0);
    return { x, y, value, label: monthNames[labels[i]-1] };
  });
  $("#chart-grid").innerHTML = [0,1,2,3].map((i) => {
    const y = y0 + (y1-y0)*i/3;
    return `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#edf0f6" stroke-dasharray="4 5"/>`;
  }).join("");
  $("#chart-line").setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
  $("#chart-points").innerHTML = points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#fff" stroke="#6658e8" stroke-width="3"><title>${p.label}: ${fullMoney(p.value)}</title></circle>`).join("");
  $("#chart-labels").innerHTML = points.map((p) => `<text x="${p.x}" y="233" text-anchor="middle" fill="#8c93a7" font-size="11">${p.label}</text>`).join("");
  $("#chart-summary").textContent = `${points.length} month${points.length === 1 ? "" : "s"} shown. Completed-order revenue is used for this chart.`;
  $("#chart-desc").textContent = `Completed-order revenue chart for ${points.map((p) => `${p.label} ${fullMoney(p.value)}`).join(", ")}.`;
}
function filteredTransactions() {
  const query = $("#search-input").value.trim().toLowerCase();
  const status = $("#status-filter").value;
  return periodTransactions().filter((item) => item.customer.toLowerCase().includes(query) && (status === "all" || item.status === status)).sort((a,b) => {
    const av = a[state.sortKey], bv = b[state.sortKey];
    const comparison = typeof av === "number" ? av-bv : String(av).localeCompare(String(bv));
    return comparison * (state.sortDirection === "asc" ? 1 : -1);
  });
}
function renderTable() {
  const rows = filteredTransactions();
  $("#transaction-body").innerHTML = rows.length ? rows.map((item) => {
    const initials = item.customer.split(" ").map((part) => part[0]).slice(0,2).join("");
    return `<tr><td>${item.id}</td><td><span class="customer-cell"><span class="customer-initial" aria-hidden="true">${initials}</span>${item.customer}</span></td><td>${shortDate(item.date)}</td><td>${fullMoney(item.amount)}</td><td><span class="status-pill ${item.status}">${item.status}</span></td></tr>`;
  }).join("") : '<tr><td colspan="5">No transactions match these filters.</td></tr>';
  $("#table-status").textContent = `Showing ${rows.length} of ${periodTransactions().length} transactions`;
}
function renderDashboard() {
  const data = periodTransactions();
  renderMetrics(data);
  renderChart(data);
  renderTable();
}
$("#period-filter").addEventListener("change", renderDashboard);
$("#search-input").addEventListener("input", renderTable);
$("#status-filter").addEventListener("change", renderTable);
document.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => {
  const key = button.dataset.sort;
  state.sortDirection = state.sortKey === key && state.sortDirection === "desc" ? "asc" : "desc";
  state.sortKey = key;
  renderTable();
}));
$("#reset-button").addEventListener("click", () => {
  $("#period-filter").value = "all";
  $("#search-input").value = "";
  $("#status-filter").value = "all";
  state.sortKey = "date";
  state.sortDirection = "desc";
  renderDashboard();
});
loadData();
