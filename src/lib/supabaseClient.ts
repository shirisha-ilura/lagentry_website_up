// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================
// This file initializes the Supabase client for use throughout the app

// Debug logs to verify environment variables are loading
console.log("Loaded URL:", process.env.REACT_APP_SUPABASE_URL);
console.log("Loaded KEY:", process.env.REACT_APP_SUPABASE_ANON_KEY);

// @ts-ignore - TypeScript sometimes has cache issues with this package
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// In React, environment variables must start with REACT_APP_ to be accessible in the browser
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  'https://zlcijmyouoasydkamyeb.supabase.co';

// If the key is missing, we still provide a non-empty placeholder string so that
// Supabase doesn't throw at import time. Real projects should override this via .env.
const supabaseKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_KEY ||
  'supabase-public-anon-key-not-configured';

// Validate that we have the required credentials
if (
  !process.env.REACT_APP_SUPABASE_ANON_KEY &&
  !process.env.REACT_APP_SUPABASE_KEY
) {
  console.error(
    '⚠️ Supabase API key is missing!\n' +
    'Please add REACT_APP_SUPABASE_ANON_KEY to your .env file\n' +
    'Get it from: https://app.supabase.com > Project Settings > API > anon public key'
  );
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      user_submissions: {
        Row: {
          id: string;
          full_name: string;
          work_email: string;
          contact_number: string;
          company_name: string;
          company_size: string;
          demo_request_message: string | null;
          terms_accepted: boolean;
          selected_date: string | null;
          selected_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          work_email: string;
          contact_number: string;
          company_name: string;
          company_size: string;
          demo_request_message?: string | null;
          terms_accepted: boolean;
          selected_date?: string | null;
          selected_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          work_email?: string;
          contact_number?: string;
          company_name?: string;
          company_size?: string;
          demo_request_message?: string | null;
          terms_accepted?: boolean;
          selected_date?: string | null;
          selected_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
