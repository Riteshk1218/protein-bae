import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

// A cart line is identified by product id + its customization text, so
// "Salad, no onions" and "Salad, no olives" stay as separate lines instead
// of merging into one with a confused quantity.
function lineKey(id, customization) {
  return `${id}::${customization || ''}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // [{ key, id, name, price, qty, customization }]
  const [isOpen, setIsOpen] = useState(false)

  const addItem = (menuItem, customization = '') => {
    const key = lineKey(menuItem.id, customization)
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
      }
      return [
        ...prev,
        { key, id: menuItem.id, name: menuItem.name, price: menuItem.price, qty: 1, customization: customization || '' },
      ]
    })
    setIsOpen(true)
  }

  const updateQty = (key, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key))
      return
    }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)))
  }

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key))
  const clearCart = () => setItems([])
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
  const total = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.price, 0), [items])

  const value = { items, addItem, updateQty, removeItem, clearCart, count, total, isOpen, openCart, closeCart }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
