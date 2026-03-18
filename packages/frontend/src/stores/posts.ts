import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsApi, type PostQuery } from '../api/posts'

const MOCK_POSTS = [
  {
    id: 1, title: '京都秋日：枫叶与寺庙的对话', slug: 'kyoto-autumn',
    excerpt: '十一月的京都，银阁寺的枫叶染红了整片山坡。晨雾中，游人还未涌入，只有落叶的声音和远处寺钟的回响。',
    cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    category: 'travel', status: 'published', view_count: 1283,
    published_at: '2024-11-15T08:00:00Z',
    tags: [{ name: '旅行', slug: 'travel' }, { name: '日本', slug: 'japan' }],
    author_name: 'sh', content: '<p>十一月的京都，银阁寺的枫叶染红了整片山坡。</p>',
  },
  {
    id: 2, title: '一个人的清晨', slug: 'morning-alone',
    excerpt: '早起的城市是另一个世界。咖啡馆还没开门，街道属于送报人和跑步者。这样的清晨，思绪格外清澈。',
    cover_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    category: 'diary', status: 'published', view_count: 876,
    published_at: '2024-12-03T06:30:00Z',
    tags: [{ name: '日记', slug: 'diary' }, { name: '生活', slug: 'life' }],
    author_name: 'sh', content: '<p>早起的城市是另一个世界。</p>',
  },
  {
    id: 3, title: '大理古城的慢时光', slug: 'dali-slow-life',
    excerpt: '苍山脚下，洱海边上，大理的时间流速像是被调慢了半拍。在这里，连阳光都显得格外有耐心。',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    category: 'travel', status: 'published', view_count: 2041,
    published_at: '2024-10-20T10:00:00Z',
    tags: [{ name: '旅行', slug: 'travel' }, { name: '云南', slug: 'yunnan' }],
    author_name: 'sh', content: '<p>苍山脚下，洱海边上。</p>',
  },
  {
    id: 4, title: '光与影的构图练习', slug: 'light-shadow-composition',
    excerpt: '摄影的本质是捕捉光。学会观察光的方向、质感和温度，比任何器材升级都更重要。',
    cover_image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80',
    category: 'photo', status: 'published', view_count: 654,
    published_at: '2024-09-08T14:00:00Z',
    tags: [{ name: '摄影', slug: 'photography' }, { name: '技巧', slug: 'tips' }],
    author_name: 'sh', content: '<p>摄影的本质是捕捉光。</p>',
  },
  {
    id: 5, title: '关于孤独这件事', slug: 'about-loneliness',
    excerpt: '孤独和寂寞是两回事。寂寞是渴望陪伴，孤独是享受独处。我花了很长时间才学会分辨这两种感受。',
    cover_image: 'https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=800&q=80',
    category: 'essay', status: 'published', view_count: 3120,
    published_at: '2024-08-22T20:00:00Z',
    tags: [{ name: '随笔', slug: 'essay' }, { name: '思考', slug: 'thinking' }],
    author_name: 'sh', content: '<p>孤独和寂寞是两回事。</p>',
  },
  {
    id: 6, title: '西藏：离天空最近的地方', slug: 'tibet-sky',
    excerpt: '布达拉宫在暮色中发光，玛尼堆上的经幡在风中飘动。在这片高原上，人显得渺小，心却变得辽阔。',
    cover_image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
    category: 'travel', status: 'published', view_count: 4567,
    published_at: '2024-07-10T12:00:00Z',
    tags: [{ name: '旅行', slug: 'travel' }, { name: '西藏', slug: 'tibet' }],
    author_name: 'sh', content: '<p>布达拉宫在暮色中发光。</p>',
  },
]

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<any[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPost = ref<any>(null)

  async function fetchPosts(params?: PostQuery) {
    loading.value = true
    try {
      const res = await postsApi.list(params)
      const fetched = res.data.data.posts
      if (fetched && fetched.length > 0) {
        posts.value = fetched
        total.value = res.data.data.total
      } else {
        posts.value = MOCK_POSTS
        total.value = MOCK_POSTS.length
      }
    } catch {
      posts.value = MOCK_POSTS
      total.value = MOCK_POSTS.length
    } finally {
      loading.value = false
    }
  }

  async function fetchPost(slug: string) {
    loading.value = true
    try {
      const res = await postsApi.get(slug)
      currentPost.value = res.data.data
      return currentPost.value
    } catch {
      currentPost.value = MOCK_POSTS.find(p => p.slug === slug) || null
      return currentPost.value
    } finally {
      loading.value = false
    }
  }

  return { posts, total, loading, currentPost, fetchPosts, fetchPost }
})
