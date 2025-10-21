import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Ref } from 'vue'
import AdminIndexPage from '@/pages/admin/index.vue'
import { createMockArticlesList } from '../unit/api-mock-data'
import type { Article } from '@/types/api'

// Type for mock useArticle
type MockUseArticle = {
  articles: Ref<Article[]>
  list: ReturnType<typeof vi.fn>
  loading: Ref<boolean>
  error: Ref<null>
}

// Mock ArticleDataTable component
vi.mock('@/components/article/ArticleDataTable.vue', () => ({
  default: {
    name: 'ArticleDataTable',
    props: ['columns', 'data'],
    template: '<div class="article-data-table" data-testid="article-data-table"></div>'
  }
}))

// Mock columns
vi.mock('@/components/article/columns', () => ({
  columns: [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'published_at', header: 'Published At' },
    { accessorKey: 'created_at', header: 'Created At' },
    { id: 'actions', header: 'Actions' }
  ]
}))

// Mock useArticle composable
vi.mock('@/composables/useArticle', () => ({
  useArticle: vi.fn()
}))

// Mock #imports
vi.mock('#imports', () => ({
  definePageMeta: vi.fn()
}))

describe('Admin Index Page', () => {
  let mockUseArticle: MockUseArticle

  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks()

    const { ref } = await import('vue')
    const { useArticle } = await import('@/composables/useArticle')

    // Create mock useArticle
    mockUseArticle = {
      articles: ref(createMockArticlesList(3)),
      list: vi.fn().mockResolvedValue(undefined),
      loading: ref(false),
      error: ref(null)
    }

    vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
  })

  it('should render the main content area of the admin panel', async () => {
    const component = await mountSuspended(AdminIndexPage)
    const mainContent = component.find('[data-testid="admin-main-content"]')
    expect(mainContent.exists()).toBe(true)
  })

  it('should render page title "Articles"', async () => {
    const component = await mountSuspended(AdminIndexPage)
    expect(component.text()).toContain('Articles')
  })

  it('should render ArticleDataTable component', async () => {
    const component = await mountSuspended(AdminIndexPage)
    const dataTable = component.find('[data-testid="article-data-table"]')
    expect(dataTable.exists()).toBe(true)
  })

  it('should call list() on mount to fetch articles', async () => {
    await mountSuspended(AdminIndexPage)

    expect(mockUseArticle.list).toHaveBeenCalledTimes(1)
  })

  describe('integration with ArticleDataTable', () => {
    it('should pass columns prop to ArticleDataTable', async () => {
      const component = await mountSuspended(AdminIndexPage)
      const dataTable = component.findComponent({ name: 'ArticleDataTable' })

      expect(dataTable.props('columns')).toBeDefined()
    })

    it('should pass sorted articles data to ArticleDataTable', async () => {
      const component = await mountSuspended(AdminIndexPage)
      const dataTable = component.findComponent({ name: 'ArticleDataTable' })

      expect(dataTable.props('data')).toBeDefined()
      expect(Array.isArray(dataTable.props('data'))).toBe(true)
    })
  })

  describe('data sorting', () => {
    it('should sort articles by created_at in descending order', async () => {
      const { ref } = await import('vue')
      const { useArticle } = await import('@/composables/useArticle')

      const unsortedArticles = [
        {
          ...createMockArticlesList(1)[0],
          id: 1,
          created_at: '2023-01-15T10:00:00Z',
          title: 'Middle'
        },
        {
          ...createMockArticlesList(1)[0],
          id: 2,
          created_at: '2023-01-20T10:00:00Z',
          title: 'Newest'
        },
        {
          ...createMockArticlesList(1)[0],
          id: 3,
          created_at: '2023-01-10T10:00:00Z',
          title: 'Oldest'
        }
      ]

      const mockSortingArticle = {
        articles: ref(unsortedArticles),
        list: vi.fn().mockResolvedValue(undefined),
        loading: ref(false),
        error: ref(null)
      }

      vi.mocked(useArticle).mockReturnValue(mockSortingArticle as never)

      const component = await mountSuspended(AdminIndexPage)
      const dataTable = component.findComponent({ name: 'ArticleDataTable' })

      const sortedData = dataTable.props('data') as Article[]
      // Verify sorted in DESC order by created_at
      expect(sortedData[0]?.title).toBe('Newest')
      expect(sortedData[1]?.title).toBe('Middle')
      expect(sortedData[2]?.title).toBe('Oldest')
    })
  })
})
