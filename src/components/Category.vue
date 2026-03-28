<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PackingCategory, PackingItem } from '../data/initialData';
import { ChevronDown, ChevronUp, Trash2, Edit2, Check, X, Plus } from 'lucide-vue-next';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
  category: PackingCategory;
}>();

const emit = defineEmits<{
  (e: 'delete'): void;
  (e: 'update-title', title: string): void;
  (e: 'toggle'): void;
}>();

// Edit Category Title
const isEditingTitle = ref(false);
const editingTitleValue = ref('');

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

const addItem = () => {
  if (newItemName.value.trim()) {
    props.category.items.push({
      id: uuidv4(),
      name: newItemName.value.trim(),
      checked: false
    });
    newItemName.value = '';
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

const completedCount = computed(() => {
  return props.category.items.filter(item => item.checked).length;
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
    <!-- Category Header -->
    <div 
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
      @click="!isEditingTitle && emit('toggle')"
    >
      <div class="flex items-center gap-3 flex-1" @click.stop>
        <div v-if="isEditingTitle" class="flex items-center gap-2 w-full max-w-sm">
          <input 
            v-model="editingTitleValue" 
            @keyup.enter="saveTitle"
            @keyup.esc="cancelEditTitle"
            class="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            autoFocus
          />
          <button @click="saveTitle" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
            <Check class="w-4 h-4" />
          </button>
          <button @click="cancelEditTitle" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div v-else class="flex items-center gap-3">
          <button @click="emit('toggle')" class="text-slate-400 hover:text-slate-600">
            <ChevronUp v-if="category.isOpen" class="w-5 h-5" />
            <ChevronDown v-else class="w-5 h-5" />
          </button>
          <h2 class="text-lg font-medium text-slate-800">{{ category.title }}</h2>
          <span class="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
            {{ completedCount }} / {{ category.items.length }}
          </span>
          <button @click="startEditTitle" class="p-1 text-slate-300 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
            <Edit2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <button 
        v-if="!isEditingTitle"
        @click.stop="emit('delete')" 
        class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
        title="刪除分類"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Category Content (Items) -->
    <div v-show="category.isOpen" class="border-t border-slate-50 p-4 pt-2">
      <ul class="space-y-1">
        <li 
          v-for="item in category.items" 
          :key="item.id"
          class="group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <div v-if="editingItemId === item.id" class="flex items-center gap-2 flex-1 w-full">
            <input 
              v-model="editingItemValue" 
              @keyup.enter="saveItem(item)"
              @keyup.esc="cancelEditItem"
              class="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              autoFocus
            />
            <button @click="saveItem(item)" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
              <Check class="w-4 h-4" />
            </button>
            <button @click="cancelEditItem" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
              <X class="w-4 h-4" />
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
                class="text-slate-700 select-none transition-all duration-300"
                :class="{ 'text-slate-400 font-normal': item.checked }"
              >
                {{ item.name }}
              </span>
            </label>
          </div>

          <div v-if="editingItemId !== item.id" class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="startEditItem(item)" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button @click="deleteItem(item.id)" class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded ml-1">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </li>
      </ul>

      <!-- Add New Item -->
      <div class="mt-3 flex items-center gap-2 px-2">
        <Plus class="w-4 h-4 text-slate-400" />
        <input 
          v-model="newItemName"
          @keyup.enter="addItem"
          placeholder="新增項目..."
          class="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        <button 
          v-if="newItemName.trim()"
          @click="addItem"
          class="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200"
        >
          新增
        </button>
      </div>
    </div>
  </div>
</template>
