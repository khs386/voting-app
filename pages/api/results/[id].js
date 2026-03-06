import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end()
  }

  const { id } = req.query

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', id)
    .single()

  if (pollError || !poll) return res.status(404).json({ error: '투표를 찾을 수 없습니다.' })

  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('option_index')
    .eq('poll_id', id)

  if (votesError) return res.status(500).json({ error: votesError.message })

  const counts = poll.options.map((_, i) =>
    votes.filter(v => v.option_index === i).length
  )

  return res.status(200).json({
    poll,
    counts,
    total: votes.length,
  })
}
