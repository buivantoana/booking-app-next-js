// src/lib/context.ts
'use client'; // Vì dùng useReducer, useContext

import ThemeRegistry from '@/components/ThemeRegistry';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface State {
  user: any;
  history: any;
  tts_text: string;
  tts_story: string;
}

type Action =
  | { type: 'LOGIN'; payload: { user: any } }
  | { type: 'UPDATE_USER'; payload: { user: any } }
  | { type: 'LOGOUT' };

const initialState: State = {
  user: {},
  history: {},
  tts_text: '',
  tts_story: '',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('first_time_logged_in', JSON.stringify(true));
      return { ...state, user: action.payload.user };
    case 'UPDATE_USER':
      return { ...state, user: action.payload.user };
    case 'LOGOUT':
      return { ...state, user: {} };
    default:
      return state;
  }
};

const BookingContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load user từ localStorage khi mount
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      dispatch({
        type: 'LOGIN',
        payload: { user: JSON.parse(user) },
      });
    }
  }, []);

  return (
    <ThemeRegistry>
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
      </BookingContext.Provider>
      </ThemeRegistry>
  );
}

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext phải dùng trong BookingProvider');
  }
  return context;
};