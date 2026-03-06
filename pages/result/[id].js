import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function ResultPage() {
  const router = useRouter()
  const { id } = router.query
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [closing, setClosing] = useState(false)

  function loadResult() {
    if (!id) return
    fetch(`/api/results/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setResult(data)
        setLoading(false)
      })
  }

  useEffect(() => { loadResult() }, [id])

  async function closePoll() {
    if (!confirm('투표를 종료하면 더 이상 참여할 수 없습니다. 종료하겠습니까?')) return
    setClosing(true)
    await fetch('/api/polls', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setClosing(false)
    loadResult()
  }

  if (loading) return <div className="container"><p>불러오는 중...</p></div>
  if (error) return <div className="container"><div className="msg msg-error">{error}</div></div>
  if (!result) return null

  const { poll, counts, total } = result

  return (
    <div className="container">
      <div className="nav">
        <Link href="/"><button className="btn-secondary">← 목록으로</button></Link>
        {poll.is_active && (
          <Link href={`/vote/${id}`}><button className="btn-primary">투표하기</button></Link>
        )}
        <button className="btn-secondary" onClick={loadResult}>새로고침</button>
      </div>
      <h1>{poll.question}</h1>
      {!poll.is_active && <div className="msg msg-error" style={{ marginBottom: 16 }}>종료된 투표</div>}
      <div className="card">
        <p style={{ marginBottom: 16, color: '#666', fontSize: '0.9rem' }}>총 {total}표</p>
        {poll.options.map((opt, i) => {
          const pct = total === 0 ? 0 : Math.round((counts[i] / total) * 100)
          return (
            <div className="bar-wrap" key={i}>
              <div className="bar-label">
                <span>{opt}</span>
                <span>{counts[i]}표 ({pct}%)</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      {poll.is_active && (
        <button className="btn-danger" onClick={closePoll} disabled={closing}>
          {closing ? '종료 중...' : '투표 종료'}
        </button>
      )}
    </div>
  )
}
