import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useApi } from '../lib/api.js';
import { nowInCameroon, storeStatus } from '../lib/hours.js';

const StoresContext = createContext(null);

export function StoresProvider({ children }) {
  const { data, error, loading, retry } = useApi('/stores');
  const [now, setNow] = useState(nowInCameroon);

  // Opening status is time-sensitive, so re-evaluate every minute.
  useEffect(() => {
    const timer = setInterval(() => setNow(nowInCameroon()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => {
    const stores = (data?.stores ?? []).map((store) => ({
      ...store,
      status: storeStatus(store.hours, now),
    }));
    return { stores, today: now.day, error, loading, retry };
  }, [data, now, error, loading, retry]);

  return <StoresContext.Provider value={value}>{children}</StoresContext.Provider>;
}

export function useStores() {
  return useContext(StoresContext);
}
