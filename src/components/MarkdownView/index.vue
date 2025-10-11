<template>
  <MdPreview v-model="props.content" />
</template>

<script setup>
import { MdPreview } from 'md-editor-v3'
import { defineOptions } from 'vue'
import 'md-editor-v3/lib/style.css'

// 定义组件属性
const props = defineProps({
  content: {
    type: String,
    required: true
  }
})
</script>
