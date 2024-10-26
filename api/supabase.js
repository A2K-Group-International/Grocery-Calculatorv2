import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ichhbkjxzwjrhmcovxbd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljaGhia2p4endqcmhtY292eGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5MTA2NzAsImV4cCI6MjA0NTQ4NjY3MH0.2ytl2QkjnyzhtvWDO8J-BaYrNOPhkrCGBBWOKGFOLuk";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
