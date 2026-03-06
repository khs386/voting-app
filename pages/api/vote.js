import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }

  const { poll_id, option_index } = req.body

  if (!poll_id || option_index === undefined) {
    return res.status(400).json({ error: '잘못된 요청입니다.' })
  }

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('is_active, options')
    .eq('id', poll_id)
    .single()

  if (pollError || !poll) return res.status(404).json({ error: '투표를 찾을 수 없습니다.' })
  if (!poll.is_active) return res.status(400).json({ error: '종료된 투표입니다.' })
  if (option_index < 0 || option_index >= poll.options.length) {
    return res.status(400).json({ error: '유효하지 않은 선택지입니다.' })
  }

  const { error } = await supabase
    .from('votes')
    .insert({ poll_id, option_index })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ success: true })
}
