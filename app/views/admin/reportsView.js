import { db } from '../../services/db.js';

const ranges = [
  ['2w', 14], ['1m', 30], ['3m', 90], ['6m', 180], ['9m', 270], ['1y', 365], ['2y', 730], ['3y', 1095], ['4y', 1460]
];

export function renderAdminReports() {
  const root = document.getElementById('app');
  const now = Date.now();
  const opts = ranges.map(([k, d]) => `<option value="${d}">${k}</option>`).join('');
  root.innerHTML = `
    <article>
      <h2>Reports</h2>
      <form id="range-form" class="toolbar">
        <label>Range (to now)
          <select name="days">${opts}</select>
        </label>
        <button type="submit">Run</button>
      </form>
      <div id="report-out"></div>
    </article>
  `;
  const out = document.getElementById('report-out');
  const form = document.getElementById('range-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const days = Number(new FormData(form).get('days'));
    const start = now - days*86400000;
    const r = db.report(start, now);
    out.innerHTML = `
      <section>
        <h3>Summary</h3>
        <ul>
          <li>Added: ${r.counts.added}</li>
          <li>Edited: ${r.counts.edited}</li>
          <li>Deleted: ${r.counts.deleted}</li>
          <li>Issued: ${r.counts.issued}</li>
          <li>Returned: ${r.counts.returned}</li>
          <li>Missing: ${r.counts.missing}</li>
          <li><strong>Fines Collected:</strong> ₹${r.finesCollected}</li>
        </ul>
        <div class="toolbar">
          <button id="pdf-issued" class="secondary">Download Issued PDF</button>
          <button id="pdf-added" class="secondary">Download Added PDF</button>
          <button id="pdf-deleted" class="secondary">Download Deleted PDF</button>
        </div>
      </section>
    `;
    const { jsPDF } = window.jspdf || {};
    function ensure() { if (!jsPDF) { alert('PDF library not loaded.'); return false; } return true; }
    document.getElementById('pdf-issued').onclick = () => {
      if (!ensure()) return;
      const doc = new jsPDF();
      doc.text('Issued Transactions', 10, 10);
      let y = 20;
      r.txs.filter(t => t.status === 'issued' || t.status === 'returned' || t.status === 'missing').forEach(t => {
        doc.text(`Tx ${t.id.substring(0,8)} • Book ${t.bookId} • User ${t.userId} • Issued ${new Date(t.issuedAt).toLocaleDateString()}`, 10, y);
        y += 8; if (y > 280) { doc.addPage(); y = 10; }
      });
      doc.save('issued.pdf');
    };
    document.getElementById('pdf-added').onclick = () => {
      if (!ensure()) return;
      const doc = new jsPDF();
      doc.text('Books Added', 10, 10);
      let y = 20;
      r.audit.filter(a => a.type === 'book.add').forEach(a => { doc.text(`${a.refId} • ${new Date(a.at).toLocaleDateString()}`, 10, y); y += 8; if (y>280){doc.addPage(); y=10;} });
      doc.save('books_added.pdf');
    };
    document.getElementById('pdf-deleted').onclick = () => {
      if (!ensure()) return;
      const doc = new jsPDF();
      doc.text('Books Deleted', 10, 10);
      let y = 20;
      r.audit.filter(a => a.type === 'book.delete').forEach(a => { doc.text(`${a.refId} • ${new Date(a.at).toLocaleDateString()}`, 10, y); y += 8; if (y>280){doc.addPage(); y=10;} });
      doc.save('books_deleted.pdf');
    };
  });
}


