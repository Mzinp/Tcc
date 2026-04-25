import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// 👇 Adicione estas duas linhas para descobrirmos a verdade!
console.log("A URL que chegou foi:", supabaseUrl);
console.log("A Chave que chegou foi:", supabaseKey);

export const supabase = createClient(supabaseUrl, supabaseKey);
