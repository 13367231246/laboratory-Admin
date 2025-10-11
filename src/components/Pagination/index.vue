<template>
  <!-- 分页 -->
  <a-card style="margin-top: 16px" v-if="total > 0">
    <div class="pagination-wrap">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :page-size-options="['10', '20', '50', '100']"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :show-total="(total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`"
        :total="total"
        @change="handleCurrentChange"
        @show-size-change="handleSizeChange"
      />
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
defineOptions({ name: 'Pagination' })

const props = defineProps({
  total: {
    type: Number,
    required: true,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const pageSize = computed({
  get: () => props.limit,
  set: (val) => emit('update:limit', val)
})

const handleSizeChange = (val) => {
  emit('update:limit', val)
  emit('pagination', { page: currentPage.value, limit: val })
}

const handleCurrentChange = (val) => {
  emit('update:page', val)
  emit('pagination', { page: val, limit: pageSize.value })
}
</script>

<style lang="scss" scoped>
.pagination-wrap {
  display: flex;
  justify-content: center;
  position: relative;

  z-index: 1;
}

:deep(.ant-pagination) {
  font-size: 14px;
}
</style>
