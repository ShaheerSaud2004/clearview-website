/*
  ClearView site settings — edit this one file to update contact info and links
  everywhere on the site. Leave a value as "" until you have it.
*/
window.CLEARVIEW = {
  // Phone shown on every page (display format) and the dialable version (+1 and digits only)
  phoneDisplay: "(908) 319-1016",
  phoneDial: "+19083191016",

  email: "info@clearviewpropertyinspectors.com", // TODO: real email

  // Spectora online scheduler link.
  // In Spectora: Settings → Online Scheduler → copy your scheduler URL.
  // Every "Schedule an Inspection" button uses this. Empty = buttons scroll to the contact form.
  scheduleUrl: "https://app.spectora.com/home-inspectors/my-inspection-company-a519c0d06f/schedule",

  // Link to a sample report (a Spectora sample report link or a PDF in /assets).
  sampleReportUrl: "",

  // Where the quote form sends submissions (e.g. a Formspree endpoint: https://formspree.io/f/xxxxxx).
  // Empty = the form shows a "not connected yet" message instead of sending.
  formEndpoint: "",

  // Google Business Profile review link (used once reviews are live).
  googleReviewsUrl: "",

  // Floating style picker for reviewing designs (only Drafted is left).
  showStyleSwitcher: false,

  // Floating colour picker for comparing palettes. Set false once you pick one
  // (and set the default in each page's <head> script).
  showPalettePicker: false
};
