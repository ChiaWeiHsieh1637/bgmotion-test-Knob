<template>
  <div 
    class="knob-container" 
    :style="{ width: `${size}px`, height: `${size}px` }"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <svg :width="size" :height="size" viewBox="0 0 100 100">
      <!-- 內環背景 -->
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        :fill="backgroundColor" 
      />
      
      <!-- 背景環 -->
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        :stroke="trackColor" 
        stroke-width="10" 
      />
      
      <!-- 進度環 -->
      <path
        :d="arcPath"
        :stroke="showProgress ? color : 'rgba(0,0,0,0.001)'"
        stroke-width="10"
        fill="none"
        stroke-linecap="round"
      />
      
      <!-- 拖動點 -->
      <circle 
        :cx="handlePosition.x"
        :cy="handlePosition.y"
        r="6"
        :fill="color"
        class="handle-point"
      />
    </svg>
    
    <div class="knob-value" :style="{ color: textColor, fontSize: size / 5 + 'px' }">
      {{ displayValue }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

/**
 * Knob 元件屬性定義
 */
const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  size: {
    type: Number,
    default: 100
  },
  startAngle: {
    type: Number,
    default: -90 // 12點鐘方向（頂部）為-90度
  },
  color: {
    type: String,
    default: '#4a90e2'
  },
  trackColor: {
    type: String,
    default: '#eee'
  },
  textColor: {
    type: String,
    default: '#333'
  },
  backgroundColor: {
    type: String,
    default: 'transparent'
  },
  decimals: {
    type: Number,
    default: 0
  },
  totalAngle: {
    type: Number,
    default: 270
  },
  step: {
    type: Number,
    default: 1
  }
});

/**
 * 定義元件發出的事件
 */
const emit = defineEmits(['update:modelValue', 'update:backgroundColor', 'change']);

/**
 * 內部狀態變數
 */
const internalValue = ref(props.modelValue); // 內部值，用於處理拖動過程中的臨時值
const isDragging = ref(false); // 是否正在拖動

/**
 * 監聽外部modelValue的變化
 * 只有在非拖動狀態下才更新內部值，避免拖動時的值衝突
 */
watch(() => props.modelValue, (newVal) => {
  if (!isDragging.value) {
    internalValue.value = newVal;
  }
});

/**
 * 監聽backgroundColor的變化並發出事件
 */
watch(() => props.backgroundColor, (newVal) => {
  emit('update:backgroundColor', newVal);
});

/**
 * 計算進度環的半徑
 */
const radius = computed(() => 45);

/**
 * 計算當前值與最小最大值之間的比例
 * 用於確定進度環的填充比例
 */
const ratio = computed(() => {
  const range = props.max - props.min;
  if (range === 0) return 0;
  return (internalValue.value - props.min) / range;
});

/**
 * 判斷是否顯示進度環
 * 當值非常接近最小值時，可能不顯示進度環
 */
const showProgress = computed(() => {
  const epsilon = 0.0001;
  return internalValue.value - props.min >= epsilon;
});

/**
 * 計算進度環路徑
 * 使用多段弧形繪製技術，避免在50%處的視覺跳變問題
 */
const arcPath = computed(() => {
  // 如果進度為0，返回空路徑
  if (ratio.value === 0) return '';
  
  // 使用props.startAngle作為起始角度
  const startAngleRad = (props.startAngle * Math.PI) / 180;
  // 計算結束角度（起始角度 + 進度比例 * 總角度）
  const endAngleRad = ((props.startAngle + ratio.value * props.totalAngle) * Math.PI) / 180;
  
  // 使用多段弧形來避免在50%處的跳變
  // 將整個弧分成多個小段（這裡分成4段）
  const segments = 4;
  const path = [];
  
  // 計算起點
  let lastX = 50 + radius.value * Math.cos(startAngleRad);
  let lastY = 50 + radius.value * Math.sin(startAngleRad);
  
  // 添加起點
  path.push(`M ${lastX} ${lastY}`);
  
  // 計算每段的角度
  const totalRadians = endAngleRad - startAngleRad;
  const segmentRadians = totalRadians / segments;
  
  // 繪製每一段弧
  for (let i = 1; i <= segments; i++) {
    // 如果剩餘角度不足一段，則使用實際剩餘角度
    const currentSegmentRadians = Math.min(segmentRadians, totalRadians - segmentRadians * (i - 1));
    if (currentSegmentRadians <= 0) break;
    
    // 計算當前段的結束點
    const segmentEndRad = startAngleRad + segmentRadians * i;
    const endX = 50 + radius.value * Math.cos(segmentEndRad);
    const endY = 50 + radius.value * Math.sin(segmentEndRad);
    
    // 添加弧段，每段都使用小弧，確保平滑過渡
    path.push(`A ${radius.value} ${radius.value} 0 0 1 ${endX} ${endY}`);
    
    // 更新上一個點
    lastX = endX;
    lastY = endY;
  }
  
  return path.join(' ');
});

/**
 * 計算當前角度
 * 用於確定拖動點的位置
 */
const currentAngle = computed(() => {
  return props.startAngle + ratio.value * props.totalAngle;
});

/**
 * 計算拖動點位置
 * 基於當前角度計算拖動點在SVG座標系中的位置
 */
const handlePosition = computed(() => {
  const angleRad = (currentAngle.value * Math.PI) / 180;
  return {
    x: 50 + radius.value * Math.cos(angleRad),
    y: 50 + radius.value * Math.sin(angleRad)
  };
});

/**
 * 顯示值（根據小數位數格式化）
 * 將內部數值格式化為指定小數位數的字符串
 */
const displayValue = computed(() => {
  return Number(internalValue.value).toFixed(props.decimals);
});

/**
 * 將值四捨五入到最接近的步進值
 * @param {Number} value - 需要四捨五入的值
 * @returns {Number} - 四捨五入後的值
 */
const roundToStep = (value) => {
  if (props.step === 0) return value;
  
  // 確保值在範圍內
  const clampedValue = Math.max(props.min, Math.min(props.max, value));
  
  // 計算相對於最小值的偏移量
  const offset = clampedValue - props.min;
  
  // 將偏移量四捨五入到最接近的步進值
  const roundedOffset = Math.round(offset / props.step) * props.step;
  
  // 將四捨五入後的偏移量加回最小值
  return props.min + roundedOffset;
};

/**
 * 開始拖動
 * 處理滑鼠按下或觸控開始事件
 * @param {Event} event - 滑鼠或觸控事件對象
 */
const startDrag = (event) => {
  // 阻止默認行為
  event.preventDefault();
  
  // 設置拖曳狀態
  isDragging.value = true;
  
  // 添加事件監聽器
  if (event.type === 'mousedown') {
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
  } else if (event.type === 'touchstart') {
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
  }
  
  // 處理初始拖動位置
  handleDrag(event);
};

/**
 * 處理拖動
 * 根據滑鼠或觸控位置計算新值
 * @param {Event} event - 滑鼠或觸控事件對象
 */
const handleDrag = (event) => {
  if (!isDragging.value) return;
  
  // 獲取容器位置
  const rect = event.target.closest('.knob-container').getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // 獲取游標位置
  let clientX, clientY;
  if (event.type === 'touchmove' || event.type === 'touchstart') {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
    event.preventDefault(); // 防止拖動時滾動干擾
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }
  
  // 計算角度
  const deltaX = clientX - centerX;
  const deltaY = clientY - centerY;
  let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
  // 標準化角度到0-360度
  angle = (angle + 360) % 360;
  
  // 計算相對於起始角度的位置，使用props.startAngle
  let relativeAngle = (angle - props.startAngle + 360) % 360;
  
  // 確保角度在總角度範圍內
  relativeAngle = Math.min(relativeAngle, props.totalAngle);
  
  // 計算新值
  const newRatio = relativeAngle / props.totalAngle;
  let newValue = props.min + newRatio * (props.max - props.min);
  
  // 應用步進值
  if (props.step > 0) {
    newValue = roundToStep(newValue);
  }
  
  // 更新值
  internalValue.value = newValue;
  
  // 發出更新事件
  emit('update:modelValue', newValue);
};

/**
 * 結束拖動
 * 處理滑鼠釋放或觸控結束事件
 */
const endDrag = () => {
  if (!isDragging.value) return;
  
  // 重置拖曳狀態
  isDragging.value = false;
  
  // 解綁事件監聽器
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('touchend', endDrag);
  
  // 發出 change 事件
  emit('change', internalValue.value);
};

/**
 * 元件掛載時的初始化
 * 確保初始值在範圍內並符合步進值
 */
onMounted(() => {
  // 確保值在範圍內
  if (internalValue.value < props.min) {
    internalValue.value = props.min;
  } else if (internalValue.value > props.max) {
    internalValue.value = props.max;
  }
  
  // 確保初始值符合步進
  const steppedValue = roundToStep(internalValue.value);
  if (steppedValue !== internalValue.value) {
    internalValue.value = steppedValue;
    emit('update:modelValue', steppedValue);
  }
});

/**
 * 元件卸載時的清理
 * 移除所有事件監聽器
 */
onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('touchend', endDrag);
});
</script>

<style scoped>
.knob-container {
  position: relative;
  user-select: none;
  touch-action: none; /* 防止觸控設備上的滾動干擾 */
}

.knob-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: Arial, sans-serif;
  font-weight: bold;
}

.handle-point {
  cursor: grab;
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.3));
  transition: r 0.1s ease;
}

.handle-point:hover {
  r: 7;
}

.handle-point:active {
  cursor: grabbing;
  r: 8;
}
</style>
