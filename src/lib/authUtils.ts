
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

  // Clear any cached application data that might persist between sessions
  const appDataKeys = ['budget-cache', 'user-data', 'expense-cache'];
  appDataKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// Add a function to completely reset application state
export const resetApplicationState = () => {
  cleanupAuthState();
  
  // Force clear any lingering React Query cache or other state
  if (typeof window !== 'undefined') {
    // Clear any potential React Query cache
    localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
    
    // Clear any other potential cached data
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('budget') || 
      key.includes('expense') || 
      key.includes('user') ||
      key.includes('auth')
    );
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared cached data: ${key}`);
    });
  }
};
