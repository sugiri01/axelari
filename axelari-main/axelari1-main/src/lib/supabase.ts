// Supabase has been removed from this project
// This file is kept for backwards compatibility but exports dummy objects
// All authentication and data access now goes through the FastAPI backend

console.warn('Supabase client is deprecated. Use FastAPI backend services instead.');

export const supabase = {
  auth: {
    signUp: () => Promise.reject(new Error('Supabase is not configured')),
    signIn: () => Promise.reject(new Error('Supabase is not configured')),
    signOut: () => Promise.reject(new Error('Supabase is not configured')),
    setSession: () => Promise.reject(new Error('Supabase is not configured')),
    getSession: () => Promise.reject(new Error('Supabase is not configured')),
  },
  from: () => ({
    select: () => Promise.reject(new Error('Supabase is not configured')),
    insert: () => Promise.reject(new Error('Supabase is not configured')),
    update: () => Promise.reject(new Error('Supabase is not configured')),
    delete: () => Promise.reject(new Error('Supabase is not configured')),
  }),
};
