<template>
  <div class="tiptap-editor">
    <div v-if="editor" class="toolbar">
      <n-button-group size="small">
        <n-button :type="editor.isActive('bold') ? 'primary' : 'default'" @click="editor.chain().focus().toggleBold().run()">B</n-button>
        <n-button :type="editor.isActive('italic') ? 'primary' : 'default'" @click="editor.chain().focus().toggleItalic().run()"><em>I</em></n-button>
        <n-button :type="editor.isActive('strike') ? 'primary' : 'default'" @click="editor.chain().focus().toggleStrike().run()"><s>S</s></n-button>
      </n-button-group>
      <n-button-group size="small" style="margin-left:8px">
        <n-button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</n-button>
        <n-button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</n-button>
      </n-button-group>
      <n-button-group size="small" style="margin-left:8px">
        <n-button @click="editor.chain().focus().toggleBulletList().run()">• 列表</n-button>
        <n-button @click="editor.chain().focus().toggleOrderedList().run()">1. 列表</n-button>
        <n-button @click="editor.chain().focus().toggleBlockquote().run()">引用</n-button>
        <n-button @click="editor.chain().focus().toggleCodeBlock().run()">代码块</n-button>
      </n-button-group>
      <n-button-group size="small" style="margin-left:8px">
        <n-button @click="addLink">链接</n-button>
        <n-button @click="addImage">图片</n-button>
      </n-button-group>
      <n-button-group size="small" style="margin-left:8px">
        <n-button @click="editor.chain().focus().undo().run()">撤销</n-button>
        <n-button @click="editor.chain().focus().redo().run()">重做</n-button>
      </n-button-group>
    </div>
    <editor-content :editor="editor" class="content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { watch } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: '开始写作…' }),
  ],
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

watch(() => props.modelValue, val => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

function addLink() {
  const url = window.prompt('链接 URL')
  if (url) editor.value?.chain().focus().setLink({ href: url }).run()
}

function addImage() {
  const url = window.prompt('图片 URL')
  if (url) editor.value?.chain().focus().setImage({ src: url }).run()
}
</script>

<style scoped>
.tiptap-editor { display: flex; flex-direction: column; }
.toolbar { padding: 10px 12px; border-bottom: 1px solid rgba(128,128,128,0.2); display: flex; flex-wrap: wrap; gap: 4px; }
.content { flex: 1; }
</style>

<style>
.tiptap { padding: 20px; min-height: 400px; outline: none; line-height: 1.8; }
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #aaa;
  pointer-events: none;
  height: 0;
}
.tiptap h2 { font-size: 1.5em; font-weight: 700; margin: 1.2em 0 0.5em; }
.tiptap h3 { font-size: 1.2em; font-weight: 600; margin: 1em 0 0.4em; }
.tiptap blockquote { border-left: 3px solid #ccc; padding-left: 12px; opacity: 0.75; }
.tiptap pre { background: rgba(128,128,128,0.1); padding: 12px; border-radius: 6px; }
.tiptap img { max-width: 100%; border-radius: 6px; }
</style>
