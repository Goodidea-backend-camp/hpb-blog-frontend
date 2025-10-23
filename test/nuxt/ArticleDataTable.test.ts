import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { ColumnDef } from '@tanstack/vue-table'
import ArticleDataTable from '@/components/article-list/ArticleDataTable.vue'
import { columns } from '@/components/article-list/columns'
import { createMockArticle, createMockArticlesList } from '../unit/api-mock-data'
import { ApiError } from '@/utils/errors'

// Mock UI Table components
vi.mock('@/components/ui/table', () => ({
  Table: {
    template: '<table><slot /></table>'
  },
  TableHeader: {
    template: '<thead><slot /></thead>'
  },
  TableBody: {
    template: '<tbody><slot /></tbody>'
  },
  TableRow: {
    props: ['dataState'],
    template: '<tr :data-state="dataState"><slot /></tr>'
  },
  TableHead: {
    template: '<th><slot /></th>'
  },
  TableCell: {
    props: ['colspan'],
    template: '<td :colspan="colspan"><slot /></td>'
  }
}))

// Mock Skeleton component
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: {
    name: 'Skeleton',
    props: ['class'],
    template: '<div class="skeleton" :class="class"></div>'
  }
}))

// Mock ArticleTableSkeleton component
vi.mock('@/components/article-list/ArticleTableSkeleton.vue', () => ({
  default: {
    name: 'ArticleTableSkeleton',
    template: '<div data-testid="article-table-skeleton">Loading...</div>'
  }
}))

// Mock Button component
vi.mock('@/components/ui/button/Button.vue', () => ({
  default: {
    name: 'Button',
    props: ['variant', 'size'],
    template: '<button :class="variant"><slot /></button>'
  }
}))

// Mock Dropdown Menu components
vi.mock('@/components/ui/dropdown-menu/DropdownMenu.vue', () => ({
  default: {
    name: 'DropdownMenu',
    template: '<div class="dropdown-menu"><slot /></div>'
  }
}))

vi.mock('@/components/ui/dropdown-menu/DropdownMenuTrigger.vue', () => ({
  default: {
    name: 'DropdownMenuTrigger',
    props: ['asChild'],
    template: '<div class="dropdown-trigger"><slot /></div>'
  }
}))

vi.mock('@/components/ui/dropdown-menu/DropdownMenuContent.vue', () => ({
  default: {
    name: 'DropdownMenuContent',
    props: ['align'],
    template: '<div class="dropdown-content"><slot /></div>'
  }
}))

vi.mock('@/components/ui/dropdown-menu/DropdownMenuItem.vue', () => ({
  default: {
    name: 'DropdownMenuItem',
    props: ['variant'],
    template: '<div class="dropdown-item"><slot /></div>'
  }
}))

vi.mock('@/components/ui/dropdown-menu/DropdownMenuSeparator.vue', () => ({
  default: {
    name: 'DropdownMenuSeparator',
    template: '<div class="dropdown-separator"></div>'
  }
}))

describe('ArticleDataTable', () => {
  describe('basic rendering', () => {
    it('should render table structure with data', async () => {
      const mockData = createMockArticlesList(3)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const table = component.find('table')
      expect(table.exists()).toBe(true)
    })

    it('should render table headers correctly', async () => {
      const mockData = createMockArticlesList(1)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const headers = component.findAll('th')
      expect(headers.length).toBeGreaterThan(0)

      // Check header text content
      const headerTexts = headers.map((h) => h.text())
      expect(headerTexts).toContain('Title')
      expect(headerTexts).toContain('Published At')
      expect(headerTexts).toContain('Created At')
      expect(headerTexts).toContain('Actions')
    })

    it('should render table body with data rows', async () => {
      const mockData = createMockArticlesList(3)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const tbody = component.find('tbody')
      expect(tbody.exists()).toBe(true)

      const rows = component.findAll('tbody tr')
      expect(rows.length).toBe(3)
    })
  })

  describe('empty state', () => {
    it('should display "No articles found." when data is empty', async () => {
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: false,
          error: null
        }
      })

      const emptyMessage = component.text()
      expect(emptyMessage).toContain('No articles found.')
    })

    it('should render single row with colspan when empty', async () => {
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: false,
          error: null
        }
      })

      const rows = component.findAll('tbody tr')
      expect(rows.length).toBe(1)

      const cell = component.find('tbody td')
      expect(cell.attributes('colspan')).toBe(String(columns.length))
    })
  })

  describe('data display', () => {
    it('should display article title', async () => {
      const mockData = [createMockArticle({ title: 'Test Article Title', slug: 'test-article' })]
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      expect(component.text()).toContain('Test Article Title')
    })

    it('should display "Draft" for unpublished articles', async () => {
      const mockData = [
        createMockArticle({
          title: 'Draft Article',
          published_at: null
        })
      ]
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      expect(component.text()).toContain('Draft')
    })

    it('should display formatted published date for published articles', async () => {
      const mockData = [
        createMockArticle({
          title: 'Published Article',
          published_at: '2023-10-27T10:00:00Z'
        })
      ]
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const text = component.text()
      // Should contain formatted date (format: yyyy-MM-dd HH:mm)
      expect(text).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
    })

    it('should display formatted created_at date', async () => {
      const mockData = [
        createMockArticle({
          created_at: '2023-10-27T09:00:00Z'
        })
      ]
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const text = component.text()
      // Should contain formatted date
      expect(text).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
    })

    it('should display dropdown menu with Edit and Delete options', async () => {
      const mockData = createMockArticlesList(1)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      // Should have one dropdown trigger button per article
      const buttons = component.findAll('button')
      expect(buttons.length).toBe(1)

      // The component text should contain Edit and Delete (in dropdown menu items)
      const text = component.text()
      expect(text).toContain('Edit')
      expect(text).toContain('Delete')
    })
  })

  describe('multiple articles', () => {
    it('should render multiple articles correctly', async () => {
      const mockData = [
        createMockArticle({
          id: 1,
          title: 'First Article',
          slug: 'first-article',
          published_at: '2023-10-27T10:00:00Z'
        }),
        createMockArticle({
          id: 2,
          title: 'Second Article',
          slug: 'second-article',
          published_at: null
        }),
        createMockArticle({
          id: 3,
          title: 'Third Article',
          slug: 'third-article',
          published_at: '2023-10-28T12:00:00Z'
        })
      ]
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const text = component.text()
      expect(text).toContain('First Article')
      expect(text).toContain('Second Article')
      expect(text).toContain('Third Article')
      expect(text).toContain('Draft') // For Second Article

      const rows = component.findAll('tbody tr')
      expect(rows.length).toBe(3)
    })

    it('should render correct number of dropdown menus for multiple articles', async () => {
      const mockData = createMockArticlesList(3)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const buttons = component.findAll('button')
      // Each article should have one dropdown trigger button (1 button × 3 articles = 3)
      expect(buttons.length).toBe(3)

      // The component text should contain Edit and Delete options for each article
      const text = component.text()
      // Count occurrences of Edit and Delete in the text
      const editCount = (text.match(/Edit/g) || []).length
      const deleteCount = (text.match(/Delete/g) || []).length

      expect(editCount).toBe(3)
      expect(deleteCount).toBe(3)
    })
  })

  describe('props validation', () => {
    it('should accept columns, data, loading, and error props', async () => {
      const mockData = createMockArticlesList(2)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      expect(component.props('columns')).toBeDefined()
      expect(component.props('data')).toBeDefined()
      expect(component.props('data').length).toBe(2)
      expect(component.props('loading')).toBe(false)
      expect(component.props('error')).toBe(null)
    })

    it('should handle data prop updates', async () => {
      const initialData = createMockArticlesList(1)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: initialData,
          loading: false,
          error: null
        }
      })

      expect(component.findAll('tbody tr').length).toBe(1)

      // Update data
      const newData = createMockArticlesList(3)
      await component.setProps({ data: newData })

      expect(component.findAll('tbody tr').length).toBe(3)
    })
  })

  describe('loading state', () => {
    it('should show skeleton when loading is true', async () => {
      const mockData = createMockArticlesList(2)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: true,
          error: null
        }
      })

      const skeleton = component.find('[data-testid="article-table-skeleton"]')
      expect(skeleton.exists()).toBe(true)
      expect(skeleton.text()).toContain('Loading...')
    })

    it('should not show skeleton when loading is false', async () => {
      const mockData = createMockArticlesList(2)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const skeleton = component.find('[data-testid="article-table-skeleton"]')
      expect(skeleton.exists()).toBe(false)

      // Should show actual table
      const table = component.find('table')
      expect(table.exists()).toBe(true)
    })

    it('should show empty state when not loading and data is empty', async () => {
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: false,
          error: null
        }
      })

      const skeleton = component.find('[data-testid="article-table-skeleton"]')
      expect(skeleton.exists()).toBe(false)

      const emptyMessage = component.text()
      expect(emptyMessage).toContain('No articles found.')
    })

    it('should show data table when not loading and data exists', async () => {
      const mockData = createMockArticlesList(2)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: null
        }
      })

      const skeleton = component.find('[data-testid="article-table-skeleton"]')
      expect(skeleton.exists()).toBe(false)

      const rows = component.findAll('tbody tr')
      expect(rows.length).toBe(2)

      const emptyMessage = component.text()
      expect(emptyMessage).not.toContain('No articles found.')
    })

    it('should toggle between loading and data states', async () => {
      const mockData = createMockArticlesList(2)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: true,
          error: null
        }
      })

      // Initially loading
      let skeleton = component.find('[data-testid="article-table-skeleton"]')
      expect(skeleton.exists()).toBe(true)

      // Update to not loading
      await component.setProps({ loading: false })

      skeleton = component.find('[data-testid="article-table-skeleton"]')
      expect(skeleton.exists()).toBe(false)

      const table = component.find('table')
      expect(table.exists()).toBe(true)

      const rows = component.findAll('tbody tr')
      expect(rows.length).toBe(2)
    })
  })

  describe('error state', () => {
    it('should display error state when error prop is provided', async () => {
      const mockError = new ApiError('Network connection failed', 500)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: false,
          error: mockError
        }
      })

      const errorState = component.find('[data-testid="error-state"]')
      expect(errorState.exists()).toBe(true)

      const text = component.text()
      expect(text).toContain('Failed to load articles')
      expect(text).toContain('Network connection failed')
    })

    it('should display retry button in error state', async () => {
      const mockError = new ApiError('Failed to fetch', 500)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: false,
          error: mockError
        }
      })

      const retryButton = component.find('[data-testid="retry-button"]')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('Retry')
    })

    it('should emit retry event when retry button is clicked', async () => {
      const mockError = new ApiError('Connection timeout', 408)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: false,
          error: mockError
        }
      })

      const retryButton = component.find('[data-testid="retry-button"]')
      await retryButton.trigger('click')

      expect(component.emitted('retry')).toBeTruthy()
      expect(component.emitted('retry')?.length).toBe(1)
    })

    it('should prioritize error state over empty state', async () => {
      const mockError = new ApiError('Server error', 500)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: false,
          error: mockError
        }
      })

      const errorState = component.find('[data-testid="error-state"]')
      expect(errorState.exists()).toBe(true)

      const text = component.text()
      expect(text).toContain('Failed to load articles')
      expect(text).not.toContain('No articles found.')
    })

    it('should not display table when in error state', async () => {
      const mockError = new ApiError('API error', 500)
      const mockData = createMockArticlesList(3)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData,
          loading: false,
          error: mockError
        }
      })

      const errorState = component.find('[data-testid="error-state"]')
      expect(errorState.exists()).toBe(true)

      const table = component.find('table')
      expect(table.exists()).toBe(false)
    })

    it('should not display error state when error is null', async () => {
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: false,
          error: null
        }
      })

      const errorState = component.find('[data-testid="error-state"]')
      expect(errorState.exists()).toBe(false)

      const emptyMessage = component.text()
      expect(emptyMessage).toContain('No articles found.')
    })

    it('should prioritize loading state over error state', async () => {
      const mockError = new ApiError('Test error', 500)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: [],
          loading: true,
          error: mockError
        }
      })

      const skeleton = component.find('[data-testid="article-table-skeleton"]')
      expect(skeleton.exists()).toBe(true)

      const errorState = component.find('[data-testid="error-state"]')
      expect(errorState.exists()).toBe(false)
    })
  })
})
