import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { TEMPORARY_AUTH_BYPASS } from '@/lib/auth-bypass';

// Cache admin status to avoid repeated Firestore calls during connection issues
let adminCache: { email: string; isAdmin: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function syncAdminRoleInLocalSession(isAdmin: boolean) {
  if (typeof window === 'undefined') return;
  if (!isAdmin) return;

  // For compatibility with current role model, admin maps to Clinico access.
  localStorage.setItem('userRole', 'Clinico');
}

export function useAdmin() {
  const [user, loadingAuth] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    if (TEMPORARY_AUTH_BYPASS) {
      setIsAdmin(true);
      setLoadingAdmin(false);
      return;
    }

    const checkAdminStatus = async () => {
      if (loadingAuth) return;

      if (!user?.email) {
        console.log('[useAdmin] No user email found');
        setIsAdmin(false);
        setLoadingAdmin(false);
        return;
      }

      const emailExact = user.email;
      console.log('[useAdmin] Checking admin status for:', emailExact);
      
      // Check cache first
      if (adminCache && 
          adminCache.email === emailExact && 
          Date.now() - adminCache.timestamp < CACHE_DURATION) {
        console.log('[useAdmin] Using cached admin status:', adminCache.isAdmin);
        setIsAdmin(adminCache.isAdmin);
        syncAdminRoleInLocalSession(adminCache.isAdmin);
        setLoadingAdmin(false);
        return;
      }
      
      try {
        const adminDoc = await getDoc(doc(db, 'admins', emailExact));
        console.log('[useAdmin] Admin doc exists:', adminDoc.exists());
        
        const adminStatus = adminDoc.exists();
        setIsAdmin(adminStatus);
        syncAdminRoleInLocalSession(adminStatus);
        
        // Update cache
        adminCache = {
          email: emailExact,
          isAdmin: adminStatus,
          timestamp: Date.now()
        };
        
      } catch (error: any) {
        console.error("[useAdmin] Error checking admin status:", error);
        
        // On Firestore error, check if we have a cached value
        if (adminCache && adminCache.email === emailExact) {
          console.log('[useAdmin] Using cached admin status due to error:', adminCache.isAdmin);
          setIsAdmin(adminCache.isAdmin);
          syncAdminRoleInLocalSession(adminCache.isAdmin);
        } else {
          // If no cache, assume not admin for safety
          setIsAdmin(false);
        }
      } finally {
        setLoadingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, loadingAuth]);

  return { isAdmin, loading: TEMPORARY_AUTH_BYPASS ? false : loadingAuth || loadingAdmin, user };
}