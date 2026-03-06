import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/polls')
      .then(r => r.json())
      .then(data => { setPolls(data); setLoading(false) })
  }, [])

  return (
    <div className="container">
      <div className="nav">
        <Link href="/admin"><button className="btn-primary">+ 투표 만들기</button></Link>
      </div>
      <h1>투표 목록</h1>
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
          </div>
        </div>
      ))}
    </div>
  )
}
