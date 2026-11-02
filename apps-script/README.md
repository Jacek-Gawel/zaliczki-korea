# Wysyłka linku do edycji (Google Apps Script)

Strona na GitHub Pages nie może sama wysyłać maili ani czytać arkusza odpowiedzi
(zawiera adresy e-mail i PESEL), dlatego robi to skrypt uruchomiony na koncie
właściciela arkusza.

1. Otwórz arkusz „Zapisy - pielgrzymka KOREA (Odpowiedzi)” → Rozszerzenia → Apps Script.
2. Wklej zawartość `Code.gs`, zapisz.
3. Wdróż → Nowe wdrożenie → typ „Aplikacja internetowa”:
   - Wykonuj jako: **Ja**
   - Kto ma dostęp: **Każdy**
4. Zatwierdź uprawnienia (arkusz + wysyłanie maili).
5. Skopiuj adres URL wdrożenia (`https://script.google.com/macros/s/.../exec`)
   i wklej go do stałej `LINK_API_URL` w `index.html`.

Zabezpieczenia: ograniczenie do 1 maila na PESEL / 10 min, ogólny komunikat
przy braku PESELu, domyślnie zamaskowany adres e-mail (`SHOW_FULL_EMAIL`).
