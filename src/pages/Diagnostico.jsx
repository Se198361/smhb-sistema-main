import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { checkTables, checkTableColumns, testConnection, refreshSchemaCache } from '../lib/supabaseDiagnostics'

export default function Diagnostico() {
  const [tables, setTables] = useState({})
  const [columns, setColumns] = useState({})
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Verificar tabelas
      const tableChecks = await checkTables()
      setTables(tableChecks)
      
      // Verificar colunas da tabela Usuario
      const usuarioColumns = await checkTableColumns('Usuario')
      setColumns({ Usuario: usuarioColumns })
      
      // Testar conexão
      const connectionTest = await testConnection()
      setTestResult(connectionTest)
    } catch (err) {
      setError(err.message)
      console.error('Erro nos diagnósticos:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshCache = async () => {
    setLoading(true)
    try {
      const result = await refreshSchemaCache()
      if (result.success) {
        alert('Cache de schema atualizado com sucesso!')
        // Recarregar diagnósticos
        await runDiagnostics()
      } else {
        setError(result.error?.message || 'Erro ao atualizar cache')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico do Supabase</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          {loading ? 'Executando...' : 'Executar Diagnósticos'}
        </button>
        
        <button
          onClick={refreshCache}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Atualizar Cache de Schema
        </button>
      </div>
      
      {testResult && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Teste de Conexão</h2>
          <div className={`p-4 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p><strong>Status:</strong> {testResult.success ? 'Conexão bem-sucedida' : 'Falha na conexão'}</p>
            {testResult.error && <p><strong>Erro:</strong> {testResult.error.message}</p>}
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
        <h2 className="text-2xl font-bold mb-4">Verificação de Tabelas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(tables).map(([tableName, check]) => (
            <div 
              key={tableName} 
              className={`p-4 rounded border ${check.exists ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}
            >
              <h3 className="font-bold text-lg">{tableName}</h3>
              <p className={check.exists ? 'text-green-700' : 'text-red-700'}>
                {check.exists ? 'Tabela encontrada' : 'Tabela não encontrada'}
              </p>
              {check.error && (
                <p className="text-red-600 text-sm mt-2">
                  Erro: {check.error.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {columns.Usuario && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-2xl font-bold mb-4">Colunas da Tabela Usuario</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-bold uppercase">Nome da Coluna</th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-bold uppercase">Tipo de Dado</th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-bold uppercase">Permite Nulo</th>
                </tr>
              </thead>
              <tbody>
                {columns.Usuario.map((column) => (
                  <tr key={column.column_name}>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm">{column.column_name}</td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm">{column.data_type}</td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm">{column.is_nullable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}