<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import type { PackingCategory, PackingItem } from '../data/initialData';
import { ChevronDown, ChevronUp, Trash2, Edit2, Check, X, Plus } from 'lucide-vue-next';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
  category: PackingCategory;
  autoEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: 'delete'): void;
  (e: 'update-title', title: string): void;
  (e: 'toggle'): void;
  (e: 'edit-started'): void;
}>();

// Edit Category Title
const isEditingTitle = ref(false);
const editingTitleValue = ref('');

onMounted(() => {
  if (props.autoEdit) {
    startEditTitle();
  }
});

const startEditTitle = () => {
  editingTitleValue.value = props.category.title;
  isEditingTitle.value = true;
};

const saveTitle = () => {
  if (editingTitleValue.value.trim()) {
    emit('update-title', editingTitleValue.value.trim());
  }
  isEditingTitle.value = false;
};

const cancelEditTitle = () => {
  isEditingTitle.value = false;
};

// Items Management
const newItemName = ref('');
const newItemInput = ref<HTMLInputElement | null>(null);

const addItem = () => {
  const name = newItemName.value.trim();
  if (name) {
    props.category.items.push({
      id: uuidv4(),
      name,
      checked: false
    });
    newItemName.value = '';
    // Continuous typing: keep focus on the input
    nextTick(() => {
      newItemInput.value?.focus();
    });
  }
};

const deleteItem = (id: string) => {
  const index = props.category.items.findIndex(item => item.id === id);
  if (index !== -1) {
    props.category.items.splice(index, 1);
  }
};

// Edit Item Name
const editingItemId = ref<string | null>(null);
const editingItemValue = ref('');

const startEditItem = (item: PackingItem) => {
  editingItemId.value = item.id;
  editingItemValue.value = item.name;
};

const saveItem = (item: PackingItem) => {
  if (editingItemValue.value.trim()) {
    item.name = editingItemValue.value.trim();
  }
  editingItemId.value = null;
};

const cancelEditItem = () => {
  editingItemId.value = null;
};

// Long Press Management
const pressTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const handlePressStart = (item: PackingItem) => {
  pressTimer.value = setTimeout(() => {
    startEditItem(item);
    if (navigator.vibrate) navigator.vibrate(50);
  }, 600);
};

const handlePressEnd = () => {
  if (pressTimer.value) {
    clearTimeout(pressTimer.value);
    pressTimer.value = null;
  }
};

const completedCount = computed(() => {
  return props.category.items.filter(item => item.checked).length;
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
    <!-- Category Header -->
    <div 
      class="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors select-none"
      @click="!isEditingTitle && emit('toggle')"
    >
      <div class="flex items-center gap-4 flex-1">
        <div v-if="isEditingTitle" class="flex items-center gap-2 w-full max-w-sm" @click.stop>
          <input 
            v-model="editingTitleValue" 
            @keyup.enter="saveTitle"
            @keyup.esc="cancelEditTitle"
            class="flex-1 px-3 h-10 text-lg font-bold border border-slate-300 rounded focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
            autoFocus
          />
          <button @click="saveTitle" class="shrink-0 p-2 text-emerald-600 hover:bg-emerald-50 rounded">
            <Check class="w-6 h-6" />
          </button>
          <button @click="cancelEditTitle" class="shrink-0 p-2 text-slate-400 hover:bg-slate-100 rounded">
            <X class="w-6 h-6" />
          </button>
        </div>
        <div v-else class="flex items-center gap-4 w-full">
          <div class="text-slate-400">
            <ChevronUp v-if="category.isOpen" class="w-6 h-6" />
            <ChevronDown v-else class="w-6 h-6" />
          </div>
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-slate-800">{{ category.title }}</h2>
            <span class="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">
              {{ completedCount }} / {{ category.items.length }}
            </span>
          </div>
          <button 
            @click.stop="startEditTitle" 
            class="p-2 text-slate-300 hover:text-slate-600 rounded transition-colors ml-auto md:ml-0"
          >
            <Edit2 class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <button 
        v-if="!isEditingTitle"
        @click.stop="emit('delete')" 
        class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors ml-2"
        title="刪除分類"
      >
        <Trash2 class="w-5 h-5" />
      </button>
    </div>

    <!-- Category Content (Items) -->
    <div 
      class="grid transition-all duration-300 ease-in-out"
      :class="category.isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
    >
      <div class="overflow-hidden">
        <div class="border-t border-slate-50 p-4 pt-2">
          <ul class="space-y-1">
            <li 
              v-for="item in category.items" 
              :key="item.id"
              class="group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors active:bg-slate-100/50"
              @mousedown="handlePressStart(item)"
              @touchstart="handlePressStart(item)"
              @mouseup="handlePressEnd"
              @touchend="handlePressEnd"
              @touchmove="handlePressEnd"
              @mouseleave="handlePressEnd"
            >
              <div v-if="editingItemId === item.id" class="flex items-center gap-2 flex-1 w-full" @mousedown.stop @touchstart.stop>
                <input 
                  v-model="editingItemValue" 
                  @keyup.enter="saveItem(item)"
                  @keyup.esc="cancelEditItem"
                  class="flex-1 px-3 h-10 text-base border border-slate-300 rounded focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  autoFocus
                />
                <button @click="saveItem(item)" class="shrink-0 p-2 text-emerald-600 hover:bg-emerald-50 rounded">
                  <Check class="w-5 h-5" />
                </button>
                <button @click="cancelEditItem" class="shrink-0 p-2 text-slate-400 hover:bg-slate-100 rounded">
                  <X class="w-5 h-5" />
                </button>
              </div>
              <div v-else class="flex items-center gap-3 flex-1">
                <label class="relative flex items-center cursor-pointer group/check gap-3 w-full">
                  <input 
                    type="checkbox" 
                    v-model="item.checked"
                    class="peer sr-only"
                  />
                  <div class="shrink-0 w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-slate-800 peer-checked:border-slate-800 flex items-center justify-center transition-all">
                    <Check 
                      class="w-3.5 h-3.5 text-white transition-opacity duration-200" 
                      :class="item.checked ? 'opacity-100' : 'opacity-0'"
                      stroke-width="4" 
                    />
                  </div>
                  <span 
                    class="text-slate-700 select-none transition-all duration-300 text-base"
                    :class="{ 'text-slate-400 font-normal': item.checked }"
                  >
                    {{ item.name }}
                  </span>
                </label>
              </div>

              <div v-if="editingItemId !== item.id" class="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button @click.stop="deleteItem(item.id)" class="p-1.5 text-slate-300 md:text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded ml-1">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </li>
          </ul>

          <!-- Add New Item -->
          <div class="mt-3 flex items-center gap-2 px-2 pb-2">
            <Plus class="w-4 h-4 text-slate-400" />
            <input 
              ref="newItemInput"
              v-model="newItemName"
              @keyup.enter="addItem"
              @blur="addItem"
              placeholder="新增項目..."
              class="flex-1 bg-transparent text-base text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
