import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function VotePage() {
  const router = useRouter()
  const { id } = router.query
  const [poll, setPoll] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const voted = localStorage.getItem(`voted_${id}`)
    if (voted) { setDone(true) }

    fetch('/api/polls')
      .then(r => r.json())
      .then(polls => {
        const found = polls.find(p => p.id === id)
        if (!found) setError('투표를 찾을 수 없습니다.')
        else setPoll(found)
        setLoading(false)
      })
  }, [id])

  async function handleVote() {
    if (selected === null) return
    setSubmitting(true)
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poll_id: id, option_index: selected }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) return setError(data.error)
    localStorage.setItem(`voted_${id}`, '1')
    setDone(true)
  }

  if (loading) return <div className="container"><p>불러오는 중...</p></div>
  if (error) return <div className="container"><div className="msg msg-error">{error}</div></div>
  if (!poll) return null

  return (
    <div className="container">
      <div className="nav">
        <Link href="/"><button className="btn-secondary">← 목록으로</button></Link>
        <Link href={`/result/${id}`}><button className="btn-secondary">결과 보기</button></Link>
      </div>
      <h1>{poll.question}</h1>
      {!poll.is_active && (
        <div className="msg msg-error">종료된 투표입니다.</div>
      )}
      {done ? (
        <div className="card">
          <div className="msg msg-success">투표가 완료됐습니다.</div>
          <Link href={`/result/${id}`}><button className="btn-primary">결과 보기 →</button></Link>
        </div>
      ) : (
        <div className="card">
          {poll.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn${selected === i ? ' selected' : ''}`}
              onClick={() => setSelected(i)}
              disabled={!poll.is_active}
            >
              {opt}
            </button>
          ))}
          {error && <div className="msg msg-error" style={{ marginTop: 10 }}>{error}</div>}
          <button
            className="btn-primary"
            style={{ marginTop: 8, width: '100%' }}
            onClick={handleVote}
            disabled={selected === null || submitting || !poll.is_active}
          >
            {submitting ? '제출 중...' : '투표하기'}
          </button>
        </div>
      )}
    </div>
  )
}
