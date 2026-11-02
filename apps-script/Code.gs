/**
 * Wysyłka linku do edycji odpowiedzi formularza „Zapisy – pielgrzymka KOREA”.
 *
 * Wdrożenie: patrz apps-script/README.md.
 * Skrypt czyta arkusz odpowiedzi (kolumny: „Adres e-mail”, „PESEL”,
 * „Link do edycji odpowiedzi”) i wysyła link na adres z tego samego wiersza.
 */

const SHEET_ID = "1NndgiE1943NrJiKgdTCU_h6-KJqQa6Y-f1lyMSJOtDI";
const SHEET_NAME = "Liczba odpowiedzi: 1";
const COL_EMAIL = "Adres e-mail";
const COL_PESEL = "PESEL";
const COL_EDIT_LINK = "Link do edycji odpowiedzi";

// Czy w komunikacie na stronie pokazać pełny adres e-mail (true) czy zamaskowany (false).
const SHOW_FULL_EMAIL = false;
// Minimalny odstęp między kolejnymi wysyłkami na ten sam PESEL (sekundy).
const THROTTLE_SECONDS = 600;

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const pesel = String(body.pesel || "").replace(/\D/g, "");
    if (!/^\d{11}$/.test(pesel)) return json_({ ok: false, error: "bad_pesel" });
    return json_(sendEditLink_(pesel));
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server" });
  }
}

function sendEditLink_(pesel) {
  const cache = CacheService.getScriptCache();
  const key = "sent_" + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pesel));
  if (cache.get(key)) return { ok: false, error: "throttled" };

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const head = values[0].map(String);
  const iEmail = head.indexOf(COL_EMAIL);
  const iPesel = head.indexOf(COL_PESEL);
  const iLink = head.indexOf(COL_EDIT_LINK);
  if (iEmail < 0 || iPesel < 0 || iLink < 0) throw new Error("Brak wymaganych kolumn");

  for (let r = 1; r < values.length; r++) {
    const rowPesel = String(values[r][iPesel]).replace(/\D/g, "").padStart(11, "0");
    if (rowPesel !== pesel) continue;

    const email = String(values[r][iEmail]).trim();
    const link = String(values[r][iLink]).trim();
    if (!email) return { ok: false, error: "no_email" };
    if (!/^https:\/\/docs\.google\.com\/forms\//.test(link)) {
      return { ok: false, error: "no_link" };
    }

    MailApp.sendEmail({
      to: email,
      subject: "Link do edycji zgłoszenia – pielgrzymka KOREA",
      htmlBody:
        "<p>Dzień dobry,</p>" +
        "<p>na Twoją prośbę przesyłamy link do edycji odpowiedzi w formularzu zapisów na pielgrzymkę do Korei:</p>" +
        '<p><a href="' + link + '">Edytuj odpowiedzi</a></p>' +
        "<p>Jeśli to nie Ty prosiłeś o ten link, zignoruj tę wiadomość.</p>",
      body: "Link do edycji odpowiedzi: " + link,
      name: "Pielgrzymka KOREA",
    });
    cache.put(key, "1", THROTTLE_SECONDS);
    return { ok: true, email: SHOW_FULL_EMAIL ? email : maskEmail_(email) };
  }
  return { ok: false, error: "not_found" };
}

function maskEmail_(email) {
  const at = email.indexOf("@");
  if (at < 1) return email;
  const local = email.slice(0, at);
  const shown = local.slice(0, Math.min(2, local.length));
  return shown + "***" + email.slice(at);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
