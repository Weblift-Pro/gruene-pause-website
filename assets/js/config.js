/* =========================================================
   Grüne Pause · ZENTRALE EINSTELLUNGEN
   Hier lassen sich alle veränderlichen Daten an EINER Stelle
   pflegen. Änderungen wirken automatisch auf allen Seiten.
   ========================================================= */
window.GP_CONFIG = {

  /* ---------- Öffnungszeiten ----------
     Solange `hours` auf null steht, zeigt die Website KEINE Zeiten
     an, sondern einen freundlichen Hinweis „bitte kurz anrufen“.
     (Online existieren widersprüchliche Angaben.)

     Zum Aktivieren einfach ersetzen, z. B.:
       hours: {
         mo: [["11:00","15:00"]],
         di: [["11:00","15:00"]],
         mi: [["11:00","15:00"]],
         do: [["11:00","15:00"]],
         fr: [["11:00","15:00"]],
         sa: [["11:00","14:00"]],
         so: null                       // null = Ruhetag
       },
     Mehrere Zeitfenster pro Tag: [["08:00","11:00"],["12:00","18:00"]]
  */
  hours: {
    mo: [["10:00","18:00"]],
    di: [["10:00","18:00"]],
    mi: [["10:00","18:00"]],
    do: [["10:00","18:00"]],
    fr: [["10:00","18:00"]],
    sa: null,
    so: null
  },

  /* Hinweistext unter den Öffnungszeiten (optional) */
  hoursNote: "",

  /* ---------- Google ----------
     googleReviewsUrl: direkte Link-Adresse zur Google-Bewertungsseite.
     Solange leer, führt der Button zur Google-Maps-Suche nach
     „Grüne Pause, Marktplatz 10/1, Biberach“ (funktioniert immer). */
  googleReviewsUrl: "",
  rating: { value: 4.8, count: 56, source: "Google", asOf: "Stand der letzten Recherche" },

  /* ---------- Echte Kundenstimmen ----------
     NUR echte Zitate eintragen, deren Verwendung erlaubt ist.
     Leer = Bereich wird automatisch ausgeblendet.
     Beispiel-Format:
       { text: "…", author: "Vorname N.", source: "Google" }  */
  reviews: [],

  /* ---------- Kontakt ---------- */
  phoneDisplay: "+49 7351 447722",
  phoneHref: "tel:+497351447722",
  addressLine: "Marktplatz 10/1, 88400 Biberach an der Riß"
};
