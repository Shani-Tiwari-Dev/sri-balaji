/* Independent "General Enquiry" system.
   Lets a customer send a query without picking any slabs first — no cart
   involved. It posts to the same /api/queries endpoint the slab-cart
   enquiry uses, so it shows up in the staff Queries tab exactly like any
   other enquiry (order number, Pending status, same table). */
(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const overlay = $("#queryOverlay");
  if (!overlay) return; // page doesn't include the enquiry modal

  let godowns = [];
  let godownsLoaded = false;

  function showToast(msg) {
    const toastEl = $("#toast");
    if (!toastEl) { window.alert(msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function ensureGodowns() {
    if (godownsLoaded || typeof api === "undefined") return;
    try {
      godowns = await api.getGodowns();
    } catch (e) { /* falls back to "Any" only */ }
    godownsLoaded = true;
  }

  function godownOptionsHtml() {
    const opts = ['<option value="any">Any yard</option>'];
    godowns.forEach((g) => opts.push(`<option value="${g.id}">${escapeHtml(g.name)}</option>`));
    return opts.join("");
  }

  function renderForm() {
    const content = $("#queryModalContent");
    content.innerHTML = `
      <div class="modal-body">
        <div class="modal-eyebrow">General Enquiry</div>
        <h2 class="modal-title">Ask us anything</h2>
        <p class="modal-godown">Not looking at a specific slab? Tell us what you need — this reaches our team the same way any catalog enquiry does.</p>
        <form id="generalQueryForm">
          <div class="form-grid">
            <div class="field full"><label for="gqName">Full Name</label><input id="gqName" required /></div>
            <div class="field full"><label for="gqMobile">Mobile Number</label><input id="gqMobile" type="tel" required /></div>
            <div class="field full"><label for="gqGodown">Preferred Yard</label><select id="gqGodown">${godownOptionsHtml()}</select></div>
            <div class="field full"><label for="gqMessage">What do you need?</label><textarea id="gqMessage" required placeholder="e.g. Looking for black granite for a kitchen countertop, roughly 40 sq.ft"></textarea></div>
          </div>
        </form>
        <div class="modal-actions" style="margin-top:6px;">
          <button class="btn btn-block" id="gqSubmit" form="generalQueryForm" type="submit">Send Enquiry</button>
        </div>
      </div>`;
    $("#generalQueryForm").addEventListener("submit", handleSubmit);
  }

  function renderConfirmation(result) {
    const content = $("#queryModalContent");
    content.innerHTML = `
      <div class="modal-body">
        <div class="confirmation">
          <svg class="ok-mark" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="1.6"/><path d="M15 24l6 6 12-13" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          <h3>Enquiry received</h3>
          <p>We'll reach out shortly.</p>
          <p class="order-no">Reference ${escapeHtml(result.orderNumber || "")}</p>
        </div>
        <div class="modal-actions" style="justify-content:center;">
          <button class="btn btn-outline" id="gqDone" type="button">Done</button>
        </div>
      </div>`;
    $("#gqDone").addEventListener("click", closeModal);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      clientName: $("#gqName").value.trim(),
      mobileNumber: $("#gqMobile").value.trim(),
      preferredGodown: $("#gqGodown").value,
      requirement: $("#gqMessage").value.trim(),
    };
    if (!payload.clientName || !payload.mobileNumber) { showToast("Name and mobile number are required"); return; }

    const btn = $("#gqSubmit");
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      const result = await api.submitQuery(payload);
      renderConfirmation(result);
    } catch (err) {
      showToast(err.message);
      btn.disabled = false; btn.textContent = "Send Enquiry";
    }
  }

  async function openModal() {
    await ensureGodowns();
    renderForm();
    overlay.classList.add("open");
  }

  function closeModal() { overlay.classList.remove("open"); }

  function bind() {
    document.querySelectorAll("[data-open-enquiry]").forEach((btn) => {
      btn.addEventListener("click", openModal);
    });
    $("#closeQueryModal").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => { if (e.target.id === "queryOverlay") closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  document.addEventListener("DOMContentLoaded", bind);
})();
