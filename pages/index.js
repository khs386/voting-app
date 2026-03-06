import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function loadPolls() {
    fetch('/api/polls')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPolls(data)
        else setError(data.error || '데이터를 불러오지 못했습니다.')
        setLoading(false)
      })
      .catch(() => { setError('서버에 연결할 수 없습니다.'); setLoading(false) })
  }

  useEffect(() => { loadPolls() }, [])

  async function deletePoll(id) {
    if (!confirm('이 투표를 삭제하겠습니까?')) return
    await fetch('/api/polls', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadPolls()
  }

  return (
    <div className="container">
      <div className="nav">
        <Link href="/admin"><button className="btn-primary">+ 투표 만들기</button></Link>
      </div>
      <h1>투표 목록</h1>
      {error && <div className="msg msg-error">{error}</div>}
      {loading && <p>불러오는 중...</p>}
      {!loading && polls.length === 0 && (
        <div className="card"><p>아직 투표가 없습니다.</p></div>
      )}
      {polls.map(poll => (
        <div className="card" key={poll.id}>
          <div>
            <span style={{ fontWeight: 600 }}>{poll.question}</span>
            {poll.is_active
              ? <span className="tag-active">진행 중</span>
              : <span className="tag-closed">종료</span>
            }
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {poll.is_active && (
              <Link href={`/vote/${poll.id}`}>
                <button className="btn-primary">투표하기</button>
              </Link>
            )}
            <Link href={`/result/${poll.id}`}>
              <button className="btn-secondary">결과 보기</button>
            </Link>
            {!poll.is_active && (
              <button className="btn-danger" onClick={() => deletePoll(poll.id)}>삭제</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
