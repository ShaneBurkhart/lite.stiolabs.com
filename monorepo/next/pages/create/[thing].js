import { useState } from 'react'

const runtimeOptions = [
  { value: 'python', label: 'Python' },
  { value: 'next.js', label: 'Next.js' },
]

const PackageForm = () => {
  const [runtime, setRuntime] = useState('')
  const [packageName, setPackageName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/create/package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runtime, packageName }),
      })
      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      const response = await res.json()
      const { thingId, logFile } = response;
      window.open(`/logs/${thingId}`, '_blank')

      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      setError(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <label className="block font-bold mb-2">Runtime Environment</label>
      <select
        value={runtime}
        onChange={(e) => setRuntime(e.target.value)}
        className="block w-full border py-2 px-3 mb-4 rounded-md"
      >
        <option value="">Select an option</option>
        {runtimeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="block font-bold mb-2">Package Name</label>
      <input
        type="text"
        value={packageName}
        onChange={(e) => setPackageName(e.target.value)}
        className="block w-full border py-2 px-3 mb-4 rounded-md"
      />
      <button
        type="submit"
        disabled={!runtime || !packageName || isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400"
      >
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}

export default PackageForm