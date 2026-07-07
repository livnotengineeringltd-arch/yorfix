// YorFix site configuration.
// The Supabase anon key below is PUBLIC by design (it ships in the browser).
// Data safety comes from row level security: this key can only SUBMIT
// bookings and messages, it can never read them back.
const YORFIX_CONFIG = {
  SUPABASE_URL: "https://afoxfjyvizefcfwvsuim.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_pcrI16SXQ3QV3oi-5JG-6A_3zwGxxkG",
  PHONE_DISPLAY: "0114 496 0123",
  PHONE_TEL: "+441144960123",
  PHONE_SMS: "+441144960123",
  WHATSAPP: "447700900123",
  EMAIL: "hello@yorfix.co.uk"
};
