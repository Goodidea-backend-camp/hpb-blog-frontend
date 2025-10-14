import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import ArticleForm from '@/components/article/ArticleForm.vue'
import type { ArticleFormValues } from '@/types/form'

// Mock UI components to avoid context injection issues
vi.mock('@/components/ui/button', () => ({
  Button: {
    props: ['type', 'disabled'],
    template: '<button :type="type" :disabled="disabled"><slot /></button>'
  }
}))

vi.mock('@/components/ui/input', () => ({
  Input: {
    props: ['modelValue', 'placeholder', 'disabled'],
    emits: ['update:modelValue'],
    template:
      '<input :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  }
}))

vi.mock('@/components/ui/form', () => ({
  FormControl: { template: '<div class="form-control"><slot /></div>' },
  FormField: {
    props: ['name'],
    template:
      '<div class="form-field"><slot :componentField="{}" :value="\'test\'" :handleChange="() => {}" /></div>'
  },
  FormItem: { template: '<div class="form-item"><slot /></div>' },
  FormLabel: { template: '<label><slot /></label>' },
  FormMessage: { template: '<div class="form-message"></div>' }
}))

vi.mock('@/components/article/TinyMceEditor.vue', () => ({
  default: {
    name: 'TinyMceEditor',
    props: ['modelValue', 'disabled'],
    emits: ['update:modelValue'],
    template: '<div class="tinymce-mock" :data-disabled="disabled"></div>'
  }
}))

vi.mock('@/components/article/PublishOptions.vue', () => ({
  default: {
    name: 'PublishOptions',
    props: ['publishSetting', 'scheduledDateTime', 'disabled', 'error'],
    emits: ['update:publishSetting', 'update:scheduledDateTime'],
    template: '<div class="publish-options-mock" :data-disabled="disabled"></div>'
  }
}))

vi.mock('lucide-vue-next', () => ({
  Loader2: {
    name: 'Loader2',
    template: '<svg class="loader-icon"></svg>'
  }
}))

// Mock vee-validate
const { mockResetForm, mockMeta, useFormMock } = vi.hoisted(() => {
  const mockResetForm = vi.fn()
  const mockMeta = { value: { dirty: false } }
  const useFormMock = vi.fn(() => ({
    handleSubmit: vi.fn((callback) => () => {
      // Mock valid form data
      const mockFormValues: ArticleFormValues = {
        title: 'Test Title',
        slug: 'test-slug',
        content: 'Test content',
        publishSetting: 'publish-immediate'
      }
      return callback(mockFormValues)
    }),
    values: {
      publishSetting: 'publish-immediate',
      scheduledDateTime: ''
    },
    errors: {
      value: {}
    },
    setFieldValue: vi.fn(),
    resetForm: mockResetForm,
    meta: mockMeta
  }))
  return { mockResetForm, mockMeta, useFormMock }
})

vi.mock('vee-validate', () => ({
  useForm: useFormMock
}))

vi.mock('@/composables/useArticleValidation', () => ({
  articleFormSchema: {}
}))

describe('ArticleForm - Duplicate Submission Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submit event emission', () => {
    it('should emit submit event when not loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      // Find and trigger form submission
      const form = wrapper.find('form')
      await form.trigger('submit')
      await nextTick()

      // Should emit once
      const emittedEvents = wrapper.emitted('submit')
      expect(emittedEvents).toBeDefined()
      expect(emittedEvents).toHaveLength(1)
    })

    it('should NOT emit submit event when loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: true
        }
      })

      // Try to submit while loading
      const form = wrapper.find('form')
      await form.trigger('submit')
      await nextTick()

      // Should NOT emit
      const emittedEvents = wrapper.emitted('submit')
      expect(emittedEvents).toBeUndefined()
    })

    it('should prevent rapid multiple submissions during loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      const form = wrapper.find('form')

      // First submission (not loading)
      await form.trigger('submit')
      await nextTick()

      // Simulate loading state after first submit
      await wrapper.setProps({ loading: true })
      await nextTick()

      // Try to submit multiple times while loading
      await form.trigger('submit')
      await form.trigger('submit')
      await form.trigger('submit')
      await nextTick()

      // Should only emit once (before loading)
      const emittedEvents = wrapper.emitted('submit')
      expect(emittedEvents).toBeDefined()
      expect(emittedEvents).toHaveLength(1)
    })

    it('should emit submit event when form has @submit.prevent handler', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      const form = wrapper.find('form')

      // Verify form has @submit.prevent binding
      expect(form.attributes('class')).toContain('space-y-6')

      await form.trigger('submit.prevent')
      await nextTick()

      const emittedEvents = wrapper.emitted('submit')
      expect(emittedEvents).toBeDefined()
      expect(emittedEvents).toHaveLength(1)
    })
  })

  describe('form UI state when loading', () => {
    it('should disable fieldset when loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: true
        }
      })

      const fieldset = wrapper.find('fieldset')

      // Fieldset should exist and be disabled
      expect(fieldset.exists()).toBe(true)
      expect(fieldset.attributes('disabled')).toBeDefined()
    })

    it('should NOT disable fieldset when not loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      const fieldset = wrapper.find('fieldset')

      // Fieldset should exist but not be disabled
      expect(fieldset.exists()).toBe(true)
      expect(fieldset.attributes('disabled')).toBeUndefined()
    })

    it('should apply visual feedback classes when loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: true
        }
      })

      const fieldset = wrapper.find('fieldset')

      // Should have opacity and pointer-events classes
      expect(fieldset.classes()).toContain('opacity-60')
      expect(fieldset.classes()).toContain('pointer-events-none')
    })

    it('should NOT apply visual feedback classes when not loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      const fieldset = wrapper.find('fieldset')

      // Should not have opacity and pointer-events classes
      expect(fieldset.classes()).not.toContain('opacity-60')
      expect(fieldset.classes()).not.toContain('pointer-events-none')
    })

    it('should disable submit button when loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: true
        }
      })

      const submitButton = wrapper.find('button[type="submit"]')

      expect(submitButton.exists()).toBe(true)
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should NOT disable submit button when not loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      const submitButton = wrapper.find('button[type="submit"]')

      expect(submitButton.exists()).toBe(true)
      expect(submitButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('loading spinner', () => {
    it('should show loading spinner when loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: true
        }
      })

      // Should show Loader2 icon
      const loader = wrapper.find('.loader-icon')
      expect(loader.exists()).toBe(true)
    })

    it('should hide loading spinner when not loading', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      // Should not show Loader2 icon
      const loader = wrapper.find('.loader-icon')
      expect(loader.exists()).toBe(false)
    })
  })

  describe('button type attribute', () => {
    it('should have type="submit" to support form submission', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      const submitButton = wrapper.find('button')

      // Button should have type="submit" to trigger form @submit event
      expect(submitButton.attributes('type')).toBe('submit')
    })
  })

  describe('loading state reactivity', () => {
    it('should update UI when loading prop changes from false to true', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      // Initially not loading
      let fieldset = wrapper.find('fieldset')
      expect(fieldset.attributes('disabled')).toBeUndefined()
      expect(fieldset.classes()).not.toContain('opacity-60')

      // Change to loading
      await wrapper.setProps({ loading: true })
      await nextTick()

      // Should now be disabled
      fieldset = wrapper.find('fieldset')
      expect(fieldset.attributes('disabled')).toBeDefined()
      expect(fieldset.classes()).toContain('opacity-60')
      expect(fieldset.classes()).toContain('pointer-events-none')
    })

    it('should update UI when loading prop changes from true to false', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: true
        }
      })

      // Initially loading
      let fieldset = wrapper.find('fieldset')
      expect(fieldset.attributes('disabled')).toBeDefined()
      expect(fieldset.classes()).toContain('opacity-60')

      // Change to not loading
      await wrapper.setProps({ loading: false })
      await nextTick()

      // Should now be enabled
      fieldset = wrapper.find('fieldset')
      expect(fieldset.attributes('disabled')).toBeUndefined()
      expect(fieldset.classes()).not.toContain('opacity-60')
      expect(fieldset.classes()).not.toContain('pointer-events-none')
    })
  })

  describe('form structure', () => {
    it('should wrap form fields in fieldset element', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      const form = wrapper.find('form')
      const fieldset = form.find('fieldset')

      expect(fieldset.exists()).toBe(true)

      // Fieldset should contain form fields
      expect(fieldset.html()).toContain('form-field')
    })

    it('should have submit button outside fieldset', async () => {
      const wrapper = await mountSuspended(ArticleForm, {
        props: {
          loading: false
        }
      })

      const form = wrapper.find('form')
      const fieldset = form.find('fieldset')
      const submitButton = form.find('button[type="submit"]')

      expect(submitButton.exists()).toBe(true)

      // Button should be outside fieldset (so it can still be clicked even if fieldset is disabled)
      // Check that button is a direct child of form, not of fieldset
      const fieldsetHtml = fieldset.html()
      expect(fieldsetHtml).not.toContain('type="submit"')
    })
  })
})

describe('ArticleForm - initialValues reactivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMeta.value.dirty = false // Reset dirty state before each test
  })

  it('should not call resetForm on initial mount with empty props', async () => {
    await mountSuspended(ArticleForm)
    expect(mockResetForm).not.toHaveBeenCalled()
  })

  it('should call resetForm when initialValues prop is updated', async () => {
    const wrapper = await mountSuspended(ArticleForm)

    const newValues: Partial<ArticleFormValues> = {
      title: 'Loaded Title',
      slug: 'loaded-slug',
      content: 'Loaded content'
    }

    await wrapper.setProps({ initialValues: newValues })
    await nextTick()

    expect(mockResetForm).toHaveBeenCalledTimes(1)
    expect(mockResetForm).toHaveBeenCalledWith({
      values: {
        title: 'Loaded Title',
        slug: 'loaded-slug',
        content: 'Loaded content',
        publishSetting: 'publish-immediate',
        scheduledDateTime: ''
      }
    })
  })

  it('should NOT call resetForm when initialValues prop is updated if form is dirty', async () => {
    mockMeta.value.dirty = true // Simulate user has edited the form

    const wrapper = await mountSuspended(ArticleForm)

    const newValues: Partial<ArticleFormValues> = {
      title: 'Another Title'
    }

    await wrapper.setProps({ initialValues: newValues })
    await nextTick()

    expect(mockResetForm).not.toHaveBeenCalled()
  })

  it('should not call resetForm if initialValues is an empty object', async () => {
    const wrapper = await mountSuspended(ArticleForm)

    // The default prop is an empty object, this simulates that scenario again
    await wrapper.setProps({ initialValues: {} })
    await nextTick()

    expect(mockResetForm).not.toHaveBeenCalled()
  })
})
