import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, logout as cognitoLogout, isAuthenticated } from "@/services/cognitoService";

export interface UserProfile {
  name: string;
  phone: string;
  landSize: string; // Acres
  state: string;
  district: string;
  village: string;
  mainCrop: string;
  joinedDate: string;
  isVerified: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Ramesh Ji",
  phone: "+91 98765 43210",
  landSize: "5",
  state: "Uttar Pradesh",
  district: "Meerut",
  village: "Mohiuddinpur",
  mainCrop: "Sugarcane",
  joinedDate: "Jan 2024",
  isVerified: true
};

interface AuthState {
  user: string | null;
  profile: UserProfile;
  loading: boolean;
  authenticated: boolean;
}

interface AuthContextValue extends AuthState {
  refreshUser: () => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ 
    user: null, 
    profile: DEFAULT_PROFILE,
    loading: true, 
    authenticated: false 
  });

  const refreshUser = () => {
    const user = getCurrentUser();
    // Load profile from local storage if available
    let profile = DEFAULT_PROFILE;
    try {
      const savedProfile = localStorage.getItem("farmer_profile");
      if (savedProfile) {
        profile = JSON.parse(savedProfile);
      }
    } catch (e) {
      console.error("Failed to parse farmer_profile:", e);
      localStorage.removeItem("farmer_profile");
    }
    
    setState(prev => ({ 
      ...prev, 
      user, 
      profile,
      loading: false, 
      authenticated: !!user 
    }));
  };

  const logout = () => {
    cognitoLogout();
    setState(prev => ({ ...prev, user: null, loading: false, authenticated: false }));
  };

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setState(prev => {
      const updated = { ...prev.profile, ...newProfile };
      localStorage.setItem("farmer_profile", JSON.stringify(updated));
      return { ...prev, profile: updated };
    });
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      setState(prev => ({ ...prev, user: null, loading: false, authenticated: false }));
    } else {
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, refreshUser, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
