// Utility to reset database with fresh data
export const resetDatabase = () => {
  localStorage.removeItem('medischedule_patients');
  localStorage.removeItem('medischedule_appointments');
  localStorage.removeItem('medischedule_calls');
  
  // Force reload to regenerate data
  window.location.reload();
};

// Add this to browser console to reset: resetDatabase()
(window as any).resetDatabase = resetDatabase;