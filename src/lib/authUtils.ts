
export const cleanupAuthState = () => {
  console.log("Cleaning up auth state from localStorage...");
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) {
      localStorage.removeItem(key);
      console.log(`Removed key from localStorage: ${key}`);
    }
  });

  // Also clear from sessionStorage if it's being used
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) {
        sessionStorage.removeItem(key);
        console.log(`Removed key from sessionStorage: ${key}`);
      }
    });
  }
};
