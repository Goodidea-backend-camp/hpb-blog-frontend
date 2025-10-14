// Polyfill for requestAnimationFrame
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, type Ref } from 'vue'
import NewArticlePage from '@/pages/admin/new-article.vue'
import type { ArticleFormValues } from '@/types/form'
import type { NewArticle } from '@/types/api'

if (typeof window === 'undefined') {
  global.requestAnimationFrame = (cb) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return setTimeout(cb, 0)
  }
  global.cancelAnimationFrame = (id) => {
    clearTimeout(id)
  }
}

// Type definitions for mocks
type MockRouter = {
  push: ReturnType<typeof vi.fn>
}

type MockUseArticle = {
  create: ReturnType<typeof vi.fn>
  loading: Ref<boolean>
}

// Mock dependencies
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

vi.mock('@/composables/useArticle', () => ({
  useArticle: vi.fn()
}))

vi.mock('@/composables/useArticlePayload', () => ({
  buildNewArticlePayload: vi.fn()
}))

vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('#imports', () => ({
  definePageMeta: vi.fn()
}))

// Mock ArticleForm component
vi.mock('@/components/article/ArticleForm.vue', () => ({
  default: defineComponent({
    name: 'ArticleForm',
    props: ['loading'],
    emits: ['submit'],
    template: '<div class="article-form-mock"></div>'
  })
}))

describe('new-article.vue', () => {
  let mockRouter: MockRouter
  let mockUseArticle: MockUseArticle

  beforeEach(async () => {
    vi.clearAllMocks()

    const { ref } = await import('vue')

    // Mock router
    mockRouter = {
      push: vi.fn()
    }

    // Mock useArticle with proper ref
    mockUseArticle = {
      create: vi.fn(),
      loading: ref(false)
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handleSubmit', () => {
    it('should call buildNewArticlePayload with form values', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue({
        title: 'Test',
        slug: 'test'
      } as NewArticle)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      const formValues: ArticleFormValues = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        publishSetting: 'publish-immediate'
      }

      await articleForm.vm.$emit('submit', formValues)

      expect(buildNewArticlePayload).toHaveBeenCalledWith(formValues)
    })

    it('should call create with payload from buildNewArticlePayload', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')

      const mockPayload: NewArticle = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        published_at: '2023-01-01T00:00:00Z'
      }

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue(mockPayload)
      mockUseArticle.create.mockResolvedValue(undefined)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      const formValues: ArticleFormValues = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        publishSetting: 'publish-immediate'
      }

      await articleForm.vm.$emit('submit', formValues)
      await wrapper.vm.$nextTick()

      expect(mockUseArticle.create).toHaveBeenCalledWith(mockPayload)
    })

    it('should show success toast with "Article published successfully" for publish-immediate', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')
      const { toast } = await import('vue-sonner')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue({} as NewArticle)
      mockUseArticle.create.mockResolvedValue(undefined)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      const formValues: ArticleFormValues = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishSetting: 'publish-immediate'
      }

      await articleForm.vm.$emit('submit', formValues)
      await wrapper.vm.$nextTick()

      expect(toast.success).toHaveBeenCalledWith('Article published successfully')
    })

    it('should show success toast with "Article scheduled successfully" for publish-scheduled', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')
      const { toast } = await import('vue-sonner')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue({} as NewArticle)
      mockUseArticle.create.mockResolvedValue(undefined)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      const formValues: ArticleFormValues = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishSetting: 'publish-scheduled',
        scheduledDateTime: '2025-12-31T10:00'
      }

      await articleForm.vm.$emit('submit', formValues)
      await wrapper.vm.$nextTick()

      expect(toast.success).toHaveBeenCalledWith('Article scheduled successfully')
    })

    it('should show success toast with "Draft saved successfully" for save-draft', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')
      const { toast } = await import('vue-sonner')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue({} as NewArticle)
      mockUseArticle.create.mockResolvedValue(undefined)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      const formValues: ArticleFormValues = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishSetting: 'save-draft'
      }

      await articleForm.vm.$emit('submit', formValues)
      await wrapper.vm.$nextTick()

      expect(toast.success).toHaveBeenCalledWith('Draft saved successfully')
    })

    it('should call create and expect it to throw when create fails', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')
      const { toast } = await import('vue-sonner')

      const mockError = new Error('API Error')
      const mockPayload: NewArticle = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        published_at: '2023-01-01T00:00:00Z'
      }

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue(mockPayload)
      mockUseArticle.create.mockRejectedValue(mockError)

      const wrapper = mount(NewArticlePage, {
        global: {
          config: {
            errorHandler: () => {
              // Suppress Vue error warnings for this test
            }
          }
        }
      })
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      const formValues: ArticleFormValues = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishSetting: 'publish-immediate'
      }

      // Emit the submit event (this will trigger handleSubmit)
      articleForm.vm.$emit('submit', formValues)
      await wrapper.vm.$nextTick()

      // Verify create was called with the payload
      expect(mockUseArticle.create).toHaveBeenCalledWith(mockPayload)

      // Success toast should not be called when error occurs
      expect(toast.success).not.toHaveBeenCalled()

      // Navigation should not occur
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should pass loading state to ArticleForm', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)

      mockUseArticle.loading.value = true

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      expect(articleForm.props('loading')).toBe(true)
    })

    it('should update when loading state changes', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)

      mockUseArticle.loading.value = false

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      expect(articleForm.props('loading')).toBe(false)

      mockUseArticle.loading.value = true
      await wrapper.vm.$nextTick()

      expect(articleForm.props('loading')).toBe(true)
    })
  })

  describe('getSuccessMessage', () => {
    it('should return correct message for publish-immediate', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')
      const { toast } = await import('vue-sonner')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue({} as NewArticle)
      mockUseArticle.create.mockResolvedValue(undefined)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      await articleForm.vm.$emit('submit', {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishSetting: 'publish-immediate'
      })
      await wrapper.vm.$nextTick()

      expect(toast.success).toHaveBeenCalledWith('Article published successfully')
    })

    it('should return correct message for publish-scheduled', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')
      const { toast } = await import('vue-sonner')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue({} as NewArticle)
      mockUseArticle.create.mockResolvedValue(undefined)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      await articleForm.vm.$emit('submit', {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishSetting: 'publish-scheduled',
        scheduledDateTime: '2025-12-31T10:00'
      })
      await wrapper.vm.$nextTick()

      expect(toast.success).toHaveBeenCalledWith('Article scheduled successfully')
    })

    it('should return correct message for save-draft', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')
      const { buildNewArticlePayload } = await import('@/composables/useArticlePayload')
      const { toast } = await import('vue-sonner')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)
      vi.mocked(buildNewArticlePayload).mockReturnValue({} as NewArticle)
      mockUseArticle.create.mockResolvedValue(undefined)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      await articleForm.vm.$emit('submit', {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishSetting: 'save-draft'
      })
      await wrapper.vm.$nextTick()

      expect(toast.success).toHaveBeenCalledWith('Draft saved successfully')
    })
  })

  describe('page rendering', () => {
    it('should render page title and description', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)

      const wrapper = mount(NewArticlePage)

      expect(wrapper.text()).toContain('New Article')
      expect(wrapper.text()).toContain('Create a new blog article')
    })

    it('should render ArticleForm component', async () => {
      const { useRouter } = await import('vue-router')
      const { useArticle } = await import('@/composables/useArticle')

      vi.mocked(useRouter).mockReturnValue(mockRouter as never)
      vi.mocked(useArticle).mockReturnValue(mockUseArticle as never)

      const wrapper = mount(NewArticlePage)
      const articleForm = wrapper.findComponent({ name: 'ArticleForm' })

      expect(articleForm.exists()).toBe(true)
    })
  })
})
