import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Estados para manejar las monedas y las selecciones
  const [currencies, setCurrencies] = useState<string[]>([])
  const [currencyRates, setCurrencyRates] = useState<{[key: string]: number}>({})
  const [fromCurrency, setFromCurrency] = useState<string>('')
  const [toCurrency, setToCurrency] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [result, setResult] = useState<number>(0)

  // Función para obtener los datos de la API
  const fetchCurrencies = async () => {
    try {
      const response = await fetch('https://api.fxratesapi.com/latest')
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Verificar que data.rates existe
      if (!data.rates) {
        throw new Error('No se encontró el objeto rates en la respuesta')
      }
      
      // Extraer los códigos de las monedas y sus valores
      setCurrencies(Object.keys(data.rates))
      setCurrencyRates(data.rates)
      
    } catch (err) {
      console.error('Error al cargar monedas:', err)
    }
  }

  // Cargar las monedas cuando el componente se monta
  useEffect(() => {
    fetchCurrencies()
  }, [])

  // Calcular conversión automáticamente cuando cambien los valores
  useEffect(() => {
    calculateConversion()
  }, [fromCurrency, toCurrency, amount, currencyRates])

  // Función para calcular la conversión de divisas
  const calculateConversion = () => {
    if (!fromCurrency || !toCurrency || amount <= 0 || Object.keys(currencyRates).length === 0) {
      setResult(0)
      return
    }

    // La API devuelve tasas basadas en USD como moneda base
    // Para convertir de moneda1 a moneda2:
    // 1. Convertir de moneda1 a USD: amount / rate1
    // 2. Convertir de USD a moneda2: (amount / rate1) * rate2
    
    const fromRate = currencyRates[fromCurrency]
    const toRate = currencyRates[toCurrency]
    
    if (!fromRate || !toRate) {
      setResult(0)
      return
    }
    
    const usdAmount = amount / fromRate // Convertir a USD
    const convertedAmount = usdAmount * toRate // Convertir de USD a moneda destino
    
    setResult(convertedAmount)
  }

  // Manejar el cambio de selección de monedas
  const handleFromCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFromCurrency(event.target.value)
  }

  const handleToCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setToCurrency(event.target.value)
  }

  // Manejar el cambio del input de cantidad
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    
    // Si está vacío, establecer como 0
    if (inputValue === '') {
      setAmount(0)
      return
    }
    
    // Eliminar ceros iniciales y caracteres no numéricos
    const cleanValue = inputValue.replace(/^0+/, '') || '0'
    
    // Convertir a número entero
    const value = parseInt(cleanValue, 10)
    
    // Si no es un número válido o es negativo, mantener el valor anterior
    if (isNaN(value) || value < 0) {
      return
    }
    
    setAmount(value)
  }

  return (
    <div className="app">
      <h1>Conversor de Monedas</h1>
      
      <div className="currency-selector">
        <div className="currency-row">
          <div className="currency-group">
            <label htmlFor="currency-select-1">
              Moneda origen:
            </label>
            <select 
              id="currency-select-1"
              value={fromCurrency} 
              onChange={handleFromCurrencyChange}
              className="currency-dropdown"
            >
              <option value="">-- Selecciona moneda origen --</option>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div className="currency-group">
            <label htmlFor="currency-select-2">
              Moneda destino:
            </label>
            <select 
              id="currency-select-2"
              value={toCurrency} 
              onChange={handleToCurrencyChange}
              className="currency-dropdown"
            >
              <option value="">-- Selecciona moneda destino --</option>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="amount-input">
          <label htmlFor="amount-input">
            Cantidad a convertir:
          </label>
          <input
            id="amount-input"
            type="number"
            min="0"
            step="1"
            value={amount === 0 ? '' : amount}
            onChange={handleAmountChange}
            className="amount-field"
            placeholder="Ingresa un número entero"
          />
        </div>
        
        {currencies.length === 0 && (
          <p style={{color: 'red', marginTop: '10px'}}>
            No se pudieron cargar las monedas. Revisa la consola para más detalles.
          </p>
        )}
        
        {result > 0 && fromCurrency && toCurrency && (
          <div className="conversion-result-text">
            Resultado: <strong>{result.toFixed(2)} {toCurrency}</strong>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
