import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { question, options } = req.body

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: '질문과 선택지 2개 이상이 필요합니다.' })
    }

    const { data, error } = await supabase
      .from('polls')
      .insert({ question, options })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'PATCH') {
    const { id } = req.body

    if (!id) return res.status(400).json({ error: '투표 ID가 필요합니다.' })

    const { error } = await supabase
      .from('polls')
      .update({ is_active: false })
      .eq('id', id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body

    if (!id) return res.status(400).json({ error: '투표 ID가 필요합니다.' })

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', id)
      .eq('is_active', false)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE'])
  res.status(405).end()
}
