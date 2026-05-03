import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// O código "puxa" do cofre (.env) as variáveis de ambiente necessárias para a conexão com o Supabase.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);