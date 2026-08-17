import { createContext, useContext, useEffect, useState } from 'react'
import {
  getCustomerToken,
  clearCustomerToken,
  getCurrentCustomer,
  loginCustomer,
  registerCustomer,
} from '../services/api'

const CustomerAuthContext = createContext(null)

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getCustomerToken()) {
      setLoading(false)
      return
    }
    getCurrentCustomer()
      .then(setCustomer)
      .catch(() => clearCustomerToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const c = await loginCustomer(email, password)
    setCustomer(c)
    return c
  }

  const register = async (payload) => {
    const c = await registerCustomer(payload)
    setCustomer(c)
    return c
  }

  const logout = () => {
    clearCustomerToken()
    setCustomer(null)
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  return ctx
}
