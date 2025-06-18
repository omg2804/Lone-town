import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CompatibilityData {
  values: string[];
  emotionalIntelligence: number;
  relationshipGoals: string;
  lifestyle: string[];
  personalityTraits: Record<string, number>;
  dealBreakers: string[];
  interests: string[];
}

interface Match {
  id: string;
  userId: string;
  partnerId: string;
  compatibilityScore: number;
  status: 'active' | 'pinned' | 'expired';
  createdAt: string;
  expiresAt: string;
  messageCount: number;
  lastMessageAt?: string;
  pinnedBy?: string[];
  canVideoCall: boolean;
}

interface UserContextType {
  compatibilityData: CompatibilityData | null;
  currentMatch: Match | null;
  loading: boolean;
  saveCompatibilityData: (data: CompatibilityData) => Promise<void>;
  getCurrentMatch: () => Promise<void>;
  pinMatch: () => Promise<void>;
  unpinMatch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [compatibilityData, setCompatibilityData] = useState<CompatibilityData | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.isOnboarded) {
      getCurrentMatch();
    }
  }, [user]);

  const saveCompatibilityData = async (data: CompatibilityData) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/compatibility`, data);
      setCompatibilityData(data);
    } catch (error) {
      console.error('Failed to save compatibility data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMatch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/matches/current`);
      setCurrentMatch(response.data);
    } catch (error) {
      console.error('Failed to get current match:', error);
    } finally {
      setLoading(false);
    }
  };

  const pinMatch = async () => {
    if (!currentMatch) return;
    
    try {
      const response = await axios.post(`${API_URL}/matches/${currentMatch.id}/pin`);
      setCurrentMatch(response.data);
    } catch (error) {
      console.error('Failed to pin match:', error);
      throw error;
    }
  };

  const unpinMatch = async () => {
    if (!currentMatch) return;
    
    try {
      const response = await axios.post(`${API_URL}/matches/${currentMatch.id}/unpin`);
      setCurrentMatch(response.data);
    } catch (error) {
      console.error('Failed to unpin match:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{
      compatibilityData,
      currentMatch,
      loading,
      saveCompatibilityData,
      getCurrentMatch,
      pinMatch,
      unpinMatch
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};