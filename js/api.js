// ============================================================
// YorFix data layer.
// Bookings and messages are saved to Supabase (Postgres) via its
// REST API. The publishable key can only INSERT into these tables,
// row level security blocks all reads, so customer data stays private.
// If the network call fails, we keep a local copy in the browser so
// nothing is silently lost, and tell the user to phone instead.
// ============================================================

const YorFixAPI = (function () {
  const cfg = YORFIX_CONFIG;

  // Shared request helper for the Supabase REST API.
  async function sbInsert(table, row) {
    const res = await fetch(cfg.SUPABASE_URL + "/rest/v1/" + table, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": cfg.SUPABASE_ANON_KEY,
        // return=minimal means Supabase does not try to read the row
        // back to us, which our security rules would (rightly) block.
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(row)
    });
    if (!res.ok) {
      const text = await res.text().catch(function () { return ""; });
      throw new Error("Supabase insert failed (" + res.status + "): " + text);
    }
  }

  // Short human-friendly reference like YF-K3X9TQ.
  function makeReference() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 6; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return "YF-" + out;
  }

  // Keep a safety copy in the browser in case the network call fails.
  function localBackup(key, entry) {
    try {
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push(entry);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) { /* storage full or blocked, nothing more we can do */ }
  }

  return {
    makeReference: makeReference,

    async createBooking(data) {
      const row = {
        reference: data.reference,
        service: data.service,
        area: data.area,
        preferred_date: data.preferred_date || null,
        preferred_time: data.preferred_time || null,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        description: data.description || null,
        client_type: data.client_type
      };
      try {
        await sbInsert("yorfix_bookings", row);
        return { ok: true };
      } catch (err) {
        localBackup("yorfix-pending-bookings", row);
        return { ok: false, error: err.message };
      }
    },

    async createMessage(data) {
      const row = {
        name: data.name,
        contact: data.contact,
        message: data.message
      };
      try {
        await sbInsert("yorfix_messages", row);
        return { ok: true };
      } catch (err) {
        localBackup("yorfix-pending-messages", row);
        return { ok: false, error: err.message };
      }
    }
  };
})();
