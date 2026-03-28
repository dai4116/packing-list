<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { initialData, type PackingCategory } from '../data/initialData';
import Category from './Category.vue';
import { Plus, RotateCcw, Trash2 } from 'lucide-vue-next';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'packing-list-data';
const categories = ref<PackingCategory[]>([]);

// Load from local storage or use initial data
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      categories.value = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved data', e);
      categories.value = JSON.parse(JSON.stringify(initialData));
    }
  } else {
    categories.value = JSON.parse(JSON.stringify(initialData));
  }
});

// Save to local storage on change
watch(categories, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

// Statistics
const totalItems = computed(() => {
  return categories.value.reduce((acc, cat) => acc + cat.items.length, 0);
});

const checkedItems = computed(() => {
  return categories.value.reduce((acc, cat) => {
    return acc + cat.items.filter(item => item.checked).length;
  }, 0);
});

const progressPercentage = computed(() => {
  if (totalItems.value === 0) return 0;
  return Math.round((checkedItems.value / totalItems.value) * 100);
});

// Actions
const addCategory = () => {
  categories.value.push({
    id: uuidv4(),
    title: '新分類',
    isOpen: true,
    items: []
  });
};

const deleteCategory = (id: string) => {
  if (confirm('確定要刪除這個分類及其所有項目嗎？')) {
    categories.value = categories.value.filter(c => c.id !== id);
  }
};

const resetAll = () => {
  if (confirm('確定要清除所有已勾選的狀態嗎？')) {
    categories.value.forEach(cat => {
      cat.items.forEach(item => {
        item.checked = false;
      });
    });
  }
};

const clearAll = () => {
  if (confirm('確定要回復到預設清單嗎？所有自訂修改將會消失！')) {
    categories.value = JSON.parse(JSON.stringify(initialData));
  }
};

const updateCategoryTitle = (id: string, newTitle: string) => {
  const category = categories.value.find(c => c.id === id);
  if (category) category.title = newTitle;
};

const toggleCategory = (id: string) => {
  const category = categories.value.find(c => c.id === id);
  if (category) category.isOpen = !category.isOpen;
};
</script>

<template>
  <div class="relative">
     <!-- Global Actions -->
    <div class="pt-6 pb-6 border-t border-slate-200 flex flex-wrap gap-3 justify-center">
      <button 
        @click="addCategory"
        class="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm shadow-sm"
      >
        <Plus class="w-4 h-4" />
        新增分類
      </button>
      <button 
        @click="resetAll"
        class="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm shadow-sm"
      >
        <RotateCcw class="w-4 h-4" />
        重設狀態
      </button>
      <button 
        @click="clearAll"
        class="flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-colors text-sm shadow-sm"
      >
        <Trash2 class="w-4 h-4" />
        回復預設
      </button>
    </div>
    <!-- Floating Circular Progress Indicator -->
    <div class="fixed bottom-8 right-8 z-50 group">
      <div class="relative w-16 h-16 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 flex items-center justify-center transition-transform active:scale-95">
        <!-- SVG Circular Progress -->
        <svg class="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            stroke-width="7"
            fill="transparent"
            class="text-slate-100"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            stroke-width="7"
            fill="transparent"
            :stroke-dasharray="2 * Math.PI * 36"
            :stroke-dashoffset="2 * Math.PI * 36 * (1 - progressPercentage / 100)"
            stroke-linecap="round"
            class="text-slate-500 transition-all duration-500 ease-out"
          />
        </svg>
        <span class="text-base font-bold text-slate-600">{{ progressPercentage }}%</span>
      </div>
    </div>

    <!-- Category List -->
    <div class="space-y-4 pb-24">
      <Category 
        v-for="category in categories" 
        :key="category.id"
        :category="category"
        @delete="deleteCategory(category.id)"
        @update-title="(title) => updateCategoryTitle(category.id, title)"
        @toggle="toggleCategory(category.id)"
      />
    </div>

   
  </div>
</template>
