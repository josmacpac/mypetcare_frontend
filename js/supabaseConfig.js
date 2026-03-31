import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://yedotxfgqjzmoaxnfhqw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZG90eGZncWp6bW9heG5maHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTI0MjcsImV4cCI6MjA4ODE2ODQyN30.FNFazTjkpT4FHCTHELNaJd5V_Uc-wP59NTlGeh5pTAs'

export const supabase = createClient(supabaseUrl, supabaseKey);

