import { v4 as uuidv4 } from 'uuid';

export interface PackingItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface PackingCategory {
  id: string;
  title: string;
  items: PackingItem[];
  isOpen: boolean;
}

export const initialData: PackingCategory[] = [
  {
    id: uuidv4(),
    title: '文件類',
    isOpen: true,
    items: ['護照', '身分證', '機票'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '支付',
    isOpen: true,
    items: ['信用卡', '外幣', '台幣'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '電子用品',
    isOpen: true,
    items: ['eSIM', '充電器', 'Type c線', 'iPhone線', '萬用插頭', '行動電源', '腳架'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '盥洗用品',
    isOpen: true,
    items: ['洗髮精/潤髮乳/護髮油', '沐浴乳', '洗面乳', '牙刷', '牙膏、牙線', '隱適美盒', '新牙套', '毛巾/拋棄式毛巾', '化妝棉', '眼唇卸妝/卸妝水', '漱口水', '頭蜜粉'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '美容用品',
    isOpen: true,
    items: ['隱形眼鏡', '眼鏡/眼鏡盒', '各類化妝品', '髮捲', '平板夾', '香水'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '生活用品',
    isOpen: true,
    items: ['眼藥水', '棉花棒', '鏡子', '小剪刀', '行李秤', '休足時間', '撒隆巴斯', '止汗劑', '眼罩', '後背包', '耳塞', '口罩', '杯袋', '頸枕', '痘痘貼', '衣架', '刮毛刀', '保溫杯', '風倍清', '衛生棉', '垃圾袋'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '保養品',
    isOpen: true,
    items: ['化妝水', '精華液', '臉部乳液/B5雙', '身體乳液', '護手霜', '面膜', '護唇膏'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '衣物與配件',
    isOpen: true,
    items: ['衣物', '內衣', '免洗內褲', '襪子', '睡衣', '外出衣', '外套', '保暖內搭', '拖鞋', '球鞋', '墨鏡', '帽子', '包包', '購物袋', '行李袋'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '藥品',
    isOpen: true,
    items: ['感冒藥', '止痛藥', '腸胃藥', '過敏藥', '蚊蟲藥', '外傷藥', '防蚊液', '保健食品'].map(name => ({ id: uuidv4(), name, checked: false }))
  },
  {
    id: uuidv4(),
    title: '隨身用品',
    isOpen: true,
    items: ['酒精', '面紙', '濕紙巾', '雨傘', '防曬乳', '水壺', '護身符', '小包漱口水'].map(name => ({ id: uuidv4(), name, checked: false }))
  }
];
