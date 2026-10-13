import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'citysport.selection';
const MAX_QUANTITY = 10;

const SelectionContext = createContext(null);

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.filter((item) => item?.slug && item?.name) : [];
  } catch {
    return [];
  }
}

const lineKey = (slug, size) => `${slug}::${size}`;

// The "selection" is a shortlist a visitor sends to a store to check stock.
// It is kept in the browser; nothing is reserved or paid for online.
export function SelectionProvider({ children }) {
  const [items, setItems] = useState(loadItems);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The list still works for this visit without storage.
    }
  }, [items]);

  const add = useCallback((product, size) => {
    const key = lineKey(product.slug, size);
    setItems((current) => {
      if (current.some((item) => item.key === key)) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item
        );
      }
      return [
        ...current,
        {
          key,
          slug: product.slug,
          size,
          quantity: 1,
          brand: product.brand,
          name: product.name,
          price: product.price,
          image: product.image,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((key, quantity) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY) }
          : item
      )
    );
  }, []);

  const remove = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      maxQuantity: MAX_QUANTITY,
      add,
      setQuantity,
      remove,
      clear,
      isOpen,
      open,
      close,
    }),
    [items, add, setQuantity, remove, clear, isOpen, open, close]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  return useContext(SelectionContext);
}
