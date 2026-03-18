import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePreferredDark } from '@vueuse/core'

export const useUiStore = defineStore('ui', () => {
  const prefersDark = usePreferredDark()
  const dark = ref(localStorage.getItem('theme') === 'dark' ||
    (localStorage.getItem('theme') === null && prefersDark.value))

  function toggleDark() {
    dark.value = !dark.value
    localStorage.setItem('theme', dark.value ? 'dark' : 'light')
  }

  return { dark, toggleDark }
})
