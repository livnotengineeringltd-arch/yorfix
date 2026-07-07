// YorFix site configuration.
// The Supabase anon key below is PUBLIC by design (it ships in the browser).
// Data safety comes from row level security: this key can only SUBMIT
// bookings and messages, it can never read them back.
const YORFIX_CONFIG = {
  SUPABASE_URL: "https://afoxfjyvizefcfwvsuim.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_pcrI16SXQ3QV3oi-5JG-6A_3zwGxxkG",
  PHONE_DISPLAY: "07757 807529",
  PHONE_TEL: "+447757807529",
  PHONE_SMS: "+447757807529",
  WHATSAPP: "447757807529",
  EMAIL: "hello@yorfix.co.uk"
};
