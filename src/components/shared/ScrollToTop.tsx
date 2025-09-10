import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    
    // Also scroll any scrollable containers to top
    const scrollableElements = document.querySelectorAll('.mobile-scroll, .overflow-y-auto');
    scrollableElements.forEach(element => {
      element.scrollTop = 0;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;