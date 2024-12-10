export const setupInactivityTimer = (onInactivity: () => void) => {
    let inactivityTimer: NodeJS.Timeout;
  
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(onInactivity, 30 * 1000);
    };
  
    window.addEventListener("mousemove", resetTimer);
  
    resetTimer();
  
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  };
  