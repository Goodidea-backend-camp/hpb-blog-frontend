import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { ColumnDef } from '@tanstack/vue-table'
import ArticleDataTable from '@/components/article/ArticleDataTable.vue'
import { columns } from '@/components/article/columns'
import { createMockArticle, createMockArticlesList } from '../unit/api-mock-data'

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

// Mock Button component
vi.mock('@/components/ui/button/Button.vue', () => ({
  default: {
    name: 'Button',
    props: ['variant', 'size'],
    template: '<button :class="variant"><slot /></button>'
  }
}))

describe('ArticleDataTable', () => {
  describe('basic rendering', () => {
    it('should render table structure with data', async () => {
      const mockData = createMockArticlesList(3)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData
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
          data: mockData
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
          data: mockData
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
          data: []
        }
      })

      const emptyMessage = component.text()
      expect(emptyMessage).toContain('No articles found.')
    })

    it('should render single row with colspan when empty', async () => {
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: []
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
          data: mockData
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
          data: mockData
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
          data: mockData
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
          data: mockData
        }
      })

      const text = component.text()
      // Should contain formatted date
      expect(text).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
    })

    it('should display Edit and Delete buttons', async () => {
      const mockData = createMockArticlesList(1)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData
        }
      })

      const buttons = component.findAll('button')
      const buttonTexts = buttons.map((b) => b.text())

      expect(buttonTexts).toContain('Edit')
      expect(buttonTexts).toContain('Delete')
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
          data: mockData
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

    it('should render correct number of action buttons for multiple articles', async () => {
      const mockData = createMockArticlesList(3)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData
        }
      })

      const buttons = component.findAll('button')
      // Each article should have Edit and Delete buttons (2 buttons × 3 articles = 6)
      expect(buttons.length).toBe(6)

      const editButtons = buttons.filter((b) => b.text() === 'Edit')
      const deleteButtons = buttons.filter((b) => b.text() === 'Delete')

      expect(editButtons.length).toBe(3)
      expect(deleteButtons.length).toBe(3)
    })
  })

  describe('props validation', () => {
    it('should accept columns and data props', async () => {
      const mockData = createMockArticlesList(2)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: mockData
        }
      })

      expect(component.props('columns')).toBeDefined()
      expect(component.props('data')).toBeDefined()
      expect(component.props('data').length).toBe(2)
    })

    it('should handle data prop updates', async () => {
      const initialData = createMockArticlesList(1)
      const component = await mountSuspended(ArticleDataTable, {
        props: {
          columns: columns as ColumnDef<unknown, unknown>[],
          data: initialData
        }
      })

      expect(component.findAll('tbody tr').length).toBe(1)

      // Update data
      const newData = createMockArticlesList(3)
      await component.setProps({ data: newData })

      expect(component.findAll('tbody tr').length).toBe(3)
    })
  })
})
