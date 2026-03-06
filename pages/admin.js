import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Admin() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateOption(i, value) {
    setOptions(prev => prev.map((o, idx) => idx === i ? value : o))
  }

  function addOption() {
    setOptions(prev => [...prev, ''])
  }

  function removeOption(i) {
    if (options.length <= 2) return
    setOptions(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const filtered = options.map(o => o.trim()).filter(Boolean)
    if (!question.trim()) return setError('질문을 입력하세요.')
    if (filtered.length < 2) return setError('선택지를 2개 이상 입력하세요.')

    setLoading(true)
    const res = await fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim(), options: filtered }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) return setError(data.error)
    router.push(`/vote/${data.id}`)
  }

  return (
    <div className="container">
      <div className="nav">
        <Link href="/"><button className="btn-secondary">← 목록으로</button></Link>
      </div>
      <h1>투표 만들기</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && <div className="msg msg-error">{error}</div>}
          <h2>질문</h2>
          <input
            type="text"
            placeholder="예: 점심 메뉴를 골라주세요"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
          <h2 style={{ marginTop: 16 }}>선택지</h2>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder={`선택지 ${i + 1}`}
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => removeOption(i)}
                  style={{ flexShrink: 0, marginBottom: 10 }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addOption} style={{ marginBottom: 20 }}>
            + 선택지 추가
          </button>
          <div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '생성 중...' : '투표 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
