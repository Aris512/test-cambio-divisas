import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Estados para manejar las monedas y las selecciones
  const [currencies, setCurrencies] = useState<string[]>([])
  const [currencyRates, setCurrencyRates] = useState<{[key: string]: number}>({})
  const [selectedCurrency1, setSelectedCurrency1] = useState<string>('')
  const [selectedCurrency2, setSelectedCurrency2] = useState<string>('')
  const [inputAmount, setInputAmount] = useState<number>(0)
  const [conversionResult, setConversionResult] = useState<number>(0)

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
      const currencyCodes = Object.keys(data.rates)
      setCurrencies(currencyCodes)
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
  }, [selectedCurrency1, selectedCurrency2, inputAmount, currencyRates])


  // Función para calcular la conversión de divisas
  const calculateConversion = () => {
    if (!selectedCurrency1 || !selectedCurrency2 || inputAmount <= 0 || Object.keys(currencyRates).length === 0) {
      setConversionResult(0)
      return
    }

    // La API devuelve tasas basadas en USD como moneda base
    // Para convertir de moneda1 a moneda2:
    // 1. Convertir de moneda1 a USD: amount / rate1
    // 2. Convertir de USD a moneda2: (amount / rate1) * rate2
    
    const rate1 = currencyRates[selectedCurrency1] // Valor de la moneda origen respecto a USD
    const rate2 = currencyRates[selectedCurrency2] // Valor de la moneda destino respecto a USD
    
    if (!rate1 || !rate2) {
      setConversionResult(0)
      return
    }
    
    const usdAmount = inputAmount / rate1 // Convertir a USD
    const result = usdAmount * rate2 // Convertir de USD a moneda destino
    
    console.log(`Conversión: ${inputAmount} ${selectedCurrency1} = ${result.toFixed(2)} ${selectedCurrency2}`)
    setConversionResult(result)
  }

  // Manejar el cambio de selección del primer menú
  const handleCurrency1Change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = event.target.value
    console.log('Moneda seleccionada (1):', selectedCurrency)
    setSelectedCurrency1(selectedCurrency)
  }

  // Manejar el cambio de selección del segundo menú
  const handleCurrency2Change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = event.target.value
    console.log('Moneda seleccionada (2):', selectedCurrency)
    setSelectedCurrency2(selectedCurrency)
  }

  // Manejar el cambio del input de cantidad
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    
    // Si está vacío, establecer como 0
    if (inputValue === '') {
      setInputAmount(0)
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
    
    console.log('Cantidad ingresada:', value)
    setInputAmount(value)
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
              value={selectedCurrency1} 
              onChange={handleCurrency1Change}
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
              value={selectedCurrency2} 
              onChange={handleCurrency2Change}
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
            value={inputAmount === 0 ? '' : inputAmount}
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
        
        {conversionResult > 0 && selectedCurrency1 && selectedCurrency2 && (
          <div className="conversion-result-text">
            Resultado: <strong>{conversionResult.toFixed(2)} {selectedCurrency2}</strong>
          </div>
        )}
          </div>
      </div>
  )
}

export default App
