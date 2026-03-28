<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { initialData, type PackingCategory } from '../data/initialData';
import Category from './Category.vue';
import { Plus, RotateCcw, Trash2, Download, Upload, MoreVertical, Sun, Moon, ChevronsDown, ChevronsUp } from 'lucide-vue-next';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'packing-list-data';
const THEME_KEY = 'theme-dark';

const categories = ref<PackingCategory[]>([]);
const newCategoryId = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isMenuOpen = ref(false);
const isDark = ref(false);

// Load from local storage or use initial data
onMounted(() => {
  // Load List Data
  const savedList = localStorage.getItem(STORAGE_KEY);
  if (savedList) {
    try {
      categories.value = JSON.parse(savedList);
    } catch (e) {
      console.error('Failed to parse saved data', e);
      categories.value = JSON.parse(JSON.stringify(initialData));
    }
  } else {
    categories.value = JSON.parse(JSON.stringify(initialData));
  }

  // Load Theme Preference
  const savedTheme = localStorage.getItem(THEME_KEY);
  isDark.value = savedTheme === 'true'; // Default to false if not found
  updateTheme();
});

// Save to local storage on change
watch(categories, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

watch(isDark, (val) => {
  localStorage.setItem(THEME_KEY, val.toString());
  updateTheme();
});

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const toggleDark = () => {
  isDark.value = !isDark.value;
};

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
  const id = uuidv4();
  categories.value.push({
    id,
    title: '',
    isOpen: true,
    items: []
  });
  newCategoryId.value = id;
  
  // Scroll to bottom after DOM updates
  nextTick(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
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

const isAllOpen = computed(() => {
  return categories.value.some(cat => cat.isOpen);
});

const toggleAllCategories = () => {
  const targetState = !isAllOpen.value;
  categories.value.forEach(cat => {
    cat.isOpen = targetState;
  });
};

// Export & Import Logic
const exportData = () => {
  const dataStr = JSON.stringify(categories.value, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `packing-list-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

const triggerImport = () => {
  fileInput.value?.click();
};

const importData = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      if (Array.isArray(json) && confirm('確定要匯入此清單嗎？這將會覆蓋您目前的資料！')) {
        categories.value = json;
        alert('匯入成功！');
      }
    } catch (err) {
      alert('檔案格式錯誤，請確保匯入的是正確的 JSON 備份檔。');
      console.error(err);
    }
    // Reset file input
    target.value = '';
    isMenuOpen.value = false;
  };
  
  reader.readAsText(file);
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <div class="relative">
    <!-- Header with Title, Theme Toggle and Menu -->
    <header class="mb-10 flex items-center justify-between">
      <div class="flex items-center">
        <!-- Theme Toggle Button -->
        <button 
          @click="toggleDark"
          class="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full transition-all"
        >
          <Sun v-if="isDark" class="w-6 h-6" />
          <Moon v-else class="w-6 h-6" />
        </button>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight ml-[14px]">行李清單</h1>
      </div>

      <div class="relative">
        <button 
          @click="toggleMenu"
          class="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full transition-all"
          :class="{ 'text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm': isMenuOpen }"
        >
          <MoreVertical class="w-6 h-6" />
        </button>

        <!-- Dropdown -->
        <div 
          v-if="isMenuOpen"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-[60]"
        >
          <button @click="toggleAllCategories(); isMenuOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            <component :is="isAllOpen ? ChevronsUp : ChevronsDown" class="w-4 h-4 text-slate-400" />
            {{ isAllOpen ? '全部收合' : '全部展開' }}
          </button>
          <div class="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
          <button @click="exportData(); isMenuOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Download class="w-4 h-4 text-slate-400" />
            匯出備份
          </button>
          <button @click="triggerImport(); isMenuOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Upload class="w-4 h-4 text-slate-400" />
            匯入清單
          </button>
          <div class="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
          <button @click="resetAll(); isMenuOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RotateCcw class="w-4 h-4 text-slate-400" />
            重設狀態
          </button>
          <button @click="clearAll(); isMenuOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30">
            <Trash2 class="w-4 h-4 text-rose-400" />
            回復預設
          </button>
        </div>
      </div>
    </header>

    <!-- Hidden Input for Import -->
    <input 
      ref="fileInput"
      type="file" 
      accept=".json" 
      class="hidden" 
      @change="importData"
    />

    <!-- Category List -->
    <div class="space-y-4 pb-4">
      <Category 
        v-for="category in categories" 
        :key="category.id"
        :category="category"
        :auto-edit="newCategoryId === category.id"
        @delete="deleteCategory(category.id)"
        @update-title="(title) => { updateCategoryTitle(category.id, title); newCategoryId = null; }"
        @toggle="toggleCategory(category.id)"
      />
    </div>

    <!-- Add Category Button (Primary Action) -->
    <div class="pt-8 pb-16 flex justify-center">
      <button 
        @click="addCategory"
        class="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full hover:bg-slate-800 dark:hover:bg-white transition-all shadow-xl active:scale-95 font-bold"
      >
        <Plus class="w-6 h-6" />
        新增分類
      </button>
    </div>

    <!-- Floating Circular Progress Indicator -->
    <div class="fixed bottom-8 right-8 z-50 group">
      <div class="relative w-16 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95">
        <!-- SVG Circular Progress -->
        <svg class="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            stroke-width="7"
            fill="transparent"
            class="text-slate-100 dark:text-slate-800"
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
            class="text-slate-500 dark:text-slate-400 transition-all duration-500 ease-out"
          />
        </svg>
        <span class="text-base font-bold text-slate-600 dark:text-slate-300">{{ progressPercentage }}%</span>
      </div>
    </div>
  </div>
</template>
