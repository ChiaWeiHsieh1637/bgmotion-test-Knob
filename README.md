# Vue3 Knob 元件

這是一個使用Vue3開發的旋鈕(Knob)元件，不依賴任何外部套件，僅使用Vue3內建功能實現。

## 功能特點

- 圓形旋鈕控制器，支援滑鼠和觸控操作
- 可自訂最小值、最大值、顏色、尺寸等屬性
- 支援v-model雙向綁定（包括值和背景顏色）
- 支援自訂起始角度和總角度範圍
- 支援小數點顯示格式化
- 支援步進值設定，控制數值變化的精確度
- 支援自訂內環背景顏色
- 完全使用SVG繪製，適應不同尺寸和解析度
- 平滑的拖曳體驗，無跳變問題
- 精確的角度計算和值轉換
- 視覺回饋豐富的拖曳點

## 技術實現

- 使用SVG路徑(`<path>`)繪製進度環，而非簡單的圓形，提供更精確的視覺效果
- 採用多段弧形繪製技術，避免在50%處的視覺跳變問題
- 最佳化的拖曳處理邏輯，支援整個元件區域的拖曳操作
- 精確的角度計算，確保在任何起始角度下都能正確運作
- 拖曳點具有懸停和啟動效果，提供更好的視覺回饋

## 線上展示

您可以訪問以下網址查看元件的線上展示：

[Vue3 Knob 元件展示](https://w-bgmotion-knob.deno.dev/)

該展示網站呈現了 Knob 元件的各種功能和設定選項，您可以直接體驗元件的互動效果和視覺表現。

## 安裝與執行

```bash
# 安裝相依套件
npm install

# 開發模式執行
npm run dev

# 建置生產版本
npm run build
```

## 展示頁面

展示頁面提供互動式介面，可以即時調整所有參數並查看其對Knob元件的影響：

- 調整當前值、最小值、最大值
- 設定步進值，控制數值變化的精確度
- 自訂小數位數顯示
- 調整尺寸、起始角度和總角度範圍
- 自訂進度環、背景環、文字和內環背景的顏色

## Knob元件屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| modelValue | Number | - | 當前值，支援v-model綁定 |
| min | Number | 0 | 最小值 |
| max | Number | 100 | 最大值 |
| size | Number | 100 | 元件尺寸(像素) |
| startAngle | Number | -90 | 起始角度(-90度為12點鐘方向) |
| totalAngle | Number | 270 | 總角度範圍(旋轉角度) |
| color | String | '#4a90e2' | 進度環顏色 |
| trackColor | String | '#eee' | 背景環顏色 |
| textColor | String | '#333' | 文字顏色 |
| backgroundColor | String | 'transparent' | 內環背景顏色，支援v-model:backgroundColor綁定 |
| decimals | Number | 0 | 顯示小數位數 |
| step | Number | 1 | 步進值，控制值變化的最小單位 |

## 事件

| 事件名 | 說明 | 參數 |
|--------|------|------|
| update:modelValue | 當值變化時觸發 | 新的值 |
| update:backgroundColor | 當背景顏色變化時觸發 | 新的顏色 |
| change | 當拖曳結束時觸發 | 當前值 |

## 基本使用範例

```vue
<template>
  <div>
    <Knob v-model="value" />
    <p>當前值: {{ value }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Knob from './components/Knob.vue';

const value = ref(50);
</script>
```

## 步進值使用範例

步進值決定了數值變化的最小單位，可以控制精確度。

```vue
<template>
  <div>
    <Knob 
      v-model="value" 
      :min="0" 
      :max="1" 
      :step="0.01" 
      :decimals="2" 
    />
    <p>當前值: {{ value.toFixed(2) }}</p>
    <div>
      <label>步進值:</label>
      <select v-model="step">
        <option :value="0.01">0.01</option>
        <option :value="0.05">0.05</option>
        <option :value="0.1">0.1</option>
        <option :value="0.25">0.25</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Knob from './components/Knob.vue';

const value = ref(0.5);
const step = ref(0.01);
</script>
```

## 自訂背景顏色範例

可以使用v-model:backgroundColor來雙向綁定內環背景顏色。

```vue
<template>
  <div>
    <Knob 
      v-model="value"
      v-model:backgroundColor="bgColor"
      :size="150"
      color="#FF5733"
    />
    
    <div class="controls">
      <div>
        <label>內環背景顏色:</label>
        <select v-model="colorOption">
          <option value="transparent">透明</option>
          <option value="custom">自訂</option>
        </select>
        <input 
          v-if="colorOption === 'custom'" 
          type="color" 
          v-model="customColor" 
          @input="updateColor"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Knob from './components/Knob.vue';

const value = ref(50);
const bgColor = ref('transparent');
const colorOption = ref('transparent');
const customColor = ref('#ffffff');

const updateColor = () => {
  bgColor.value = colorOption.value === 'transparent' ? 'transparent' : customColor.value;
};

watch(colorOption, updateColor);
</script>
```

## 自訂起始角度範例

可以自訂起始角度，控制進度環的起始位置。

```vue
<template>
  <div>
    <Knob 
      v-model="value"
      :startAngle="-180"
      :totalAngle="360"
      :size="150"
    />
    <p>當前值: {{ value }}</p>
    <div>
      <label>起始角度:</label>
      <input type="range" min="-180" max="180" step="15" v-model.number="startAngle" />
      <span>{{ startAngle }}°</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Knob from './components/Knob.vue';

const value = ref(50);
const startAngle = ref(-180);
</script>
```

## 完整設定範例

```vue
<template>
  <div>
    <Knob 
      v-model="customValue"
      v-model:backgroundColor="bgColor"
      :min="0"
      :max="200"
      :size="180"
      :startAngle="-90"
      :totalAngle="315"
      :decimals="1"
      :step="0.5"
      color="#9c27b0"
      trackColor="#e0e0e0"
      textColor="#333333"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Knob from './components/Knob.vue';

const customValue = ref(125);
const bgColor = ref('#f5f5f5');
</script>
``` 

