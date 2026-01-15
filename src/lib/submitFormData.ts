// ============================================
// FORM SUBMISSION FUNCTION
// ============================================
// This function handles form data validation and submission to Supabase

import { supabase } from './supabaseClient';

export interface FormSubmissionData {
  full_name: string;
  work_email: string;
  contact_number: string;
  company_name: string;
  company_size: string;
  demo_request_message?: string;
  terms_accepted: boolean;
  selected_date: string | Date | null;
  selected_time: string | null;
}

export interface SubmissionResult {
  success: boolean;
  message: string;
  error?: any;
}

/**
 * Validates form data before submission
 */
function validateFormData(data: FormSubmissionData): { valid: boolean; error?: string } {
  // Required fields validation
  if (!data.full_name?.trim()) {
    return { valid: false, error: 'Full name is required' };
  }
  if (!data.work_email?.trim()) {
    return { valid: false, error: 'Work email is required' };
  }
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.work_email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  if (!data.contact_number?.trim()) {
    return { valid: false, error: 'Contact number is required' };
  }
  if (!data.company_name?.trim()) {
    return { valid: false, error: 'Company name is required' };
  }
  if (!data.company_size?.trim()) {
    return { valid: false, error: 'Company size is required' };
  }
  if (!data.terms_accepted) {
    return { valid: false, error: 'You must accept the terms and conditions' };
  }
  if (!data.selected_date) {
    return { valid: false, error: 'Please select a date for your demo' };
  }
  if (!data.selected_time) {
    return { valid: false, error: 'Please select a time for your demo' };
  }

  return { valid: true };
}

/**
 * Submits form data to Supabase
 * @param formData - The form data to submit
 * @returns Promise with submission result
 */
export async function submitFormData(
  formData: FormSubmissionData
): Promise<SubmissionResult> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
    
    // Check for placeholder values (but allow the new sb_publishable_ format)
    const hasPlaceholderUrl = supabaseUrl.includes('your-project-id') || 
                              supabaseUrl.includes('placeholder') ||
                              supabaseUrl === '';
    const hasPlaceholderKey = supabaseAnonKey.includes('your-anon-key') || 
                             (supabaseAnonKey.includes('placeholder') && !supabaseAnonKey.startsWith('sb_publishable_')) ||
                             supabaseAnonKey === '';
    
    if (hasPlaceholderUrl || hasPlaceholderKey) {
      console.error('Supabase config check:', {
        url: supabaseUrl ? 'Set' : 'Missing',
        key: supabaseAnonKey ? 'Set' : 'Missing',
        urlValue: supabaseUrl.substring(0, 30) + '...',
        keyValue: supabaseAnonKey.substring(0, 20) + '...'
      });
      return {
        success: false,
        message: 'Supabase is not configured. Please add your Supabase credentials to the .env file and restart your dev server. See SUPABASE_SETUP_INSTRUCTIONS.md for details.',
      };
    }

    // Validate form data
    const validation = validateFormData(formData);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Validation failed',
      };
    }

    // Format date to YYYY-MM-DD
    let formattedDate: string | null = null;
    if (formData.selected_date) {
      if (formData.selected_date instanceof Date) {
        formattedDate = formData.selected_date.toISOString().split('T')[0];
      } else if (typeof formData.selected_date === 'string') {
        formattedDate = formData.selected_date;
      }
    }

    // Prepare data for Supabase
    const submissionData = {
      full_name: formData.full_name.trim(),
      work_email: formData.work_email.trim().toLowerCase(),
      contact_number: formData.contact_number.trim(),
      company_name: formData.company_name.trim(),
      company_size: formData.company_size.trim(),
      demo_request_message: formData.demo_request_message?.trim() || null,
      terms_accepted: formData.terms_accepted,
      selected_date: formattedDate,
      selected_time: formData.selected_time,
    };

    // Debug logging (using variables already declared above)
    console.log('Submitting to Supabase:', { 
      url: supabaseUrl, 
      table: 'user_submissions',
      hasKey: !!supabaseAnonKey,
      keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'missing'
    });

    // Insert into Supabase
    // Make sure we're using the anon key (not service_role)
    const { data: insertedData, error } = await supabase
      .from('user_submissions')
      .insert([submissionData])
      .select()
      .single();
    
    // Debug: Check what role we're using
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user role:', user ? 'authenticated' : 'anon');

    if (error) {
      console.error('Supabase insertion error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit form. Please try again.';
      
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        errorMessage = 'Database table not found. Please run the SQL setup script in Supabase. See supabase_setup.sql';
      } else if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('RLS') || error.message.includes('policy')) {
        errorMessage = `Permission denied (Error: ${error.code || 'RLS'}). Please run this SQL in Supabase:\n\nALTER TABLE user_submissions DISABLE ROW LEVEL SECURITY;\n\nOr create an INSERT policy:\n\nCREATE POLICY "insert_anyone" ON user_submissions FOR INSERT WITH CHECK (true);`;
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection and Supabase URL.';
      } else {
        errorMessage = `${error.message || errorMessage} (Code: ${error.code || 'unknown'})`;
      }
      
      return {
        success: false,
        message: errorMessage,
        error,
      };
    }

    return {
      success: true,
      message: `Thank you! Your demo request has been submitted successfully. We'll contact you at ${formData.work_email} to confirm your appointment.`,
    };
  } catch (error: any) {
    console.error('Form submission error:', error);
    
    let errorMessage = 'An unexpected error occurred. Please try again later.';
    
    if (error.message && error.message.includes('Failed to fetch')) {
      errorMessage = 'Failed to connect to Supabase. Please check:\n1. Your Supabase URL is correct in .env file\n2. Your Supabase project is active\n3. Your internet connection is working';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage,
      error,
    };
  }
}

