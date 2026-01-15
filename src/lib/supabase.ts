import { createClient } from '@supabase/supabase-js'

// 1. Leemos las variables del .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string);

let supabase: any;

// 2. Validamos que existan. Si no existen, mostramos error y creamos un "stub" (cliente falso)
// para que la app no se rompa totalmente al iniciar, pero avise en consola.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Faltan las credenciales de Supabase en el archivo .env (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).'
  );

  // Stub mínimo para evitar crash inmediato
  supabase = {
    from: (_table: string) => ({
      select: async () => ({ data: null, error: { message: "No connection" } }),
      insert: async () => ({ data: null, error: { message: "No connection" } }),
      update: async () => ({ data: null, error: { message: "No connection" } }),
    }),
    storage: {
      from: (_bucket: string) => ({
        getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } })
      })
    },
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
    }
  };
} else {
  // 3. Si todo está bien, creamos el cliente real
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export default supabase;