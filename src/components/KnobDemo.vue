<template>
  <div class="knob-demo-container">
    <div class="knob-section">
      <Knob
        v-model="currentValue"
        v-model:backgroundColor="backgroundColor"
        :min="minValue"
        :max="maxValue"
        :size="knobSize"
        :startAngle="startAngle"
        :totalAngle="totalAngle"
        :color="knobColor"
        :trackColor="trackColor"
        :textColor="textColor"
        :decimals="decimals"
        :step="step"
        @change="onKnobChange"
      />
      <div class="current-value">
        當前值: {{ currentValue.toFixed(decimals) }}
      </div>
    </div>
    
    <div class="controls-section">
      <h3>參數調整</h3>
      
      <div class="control-group">
        <label for="current-value">當前值:</label>
        <div class="input-with-buttons">
          <button @click="decrementValue" :disabled="currentValue <= minValue">-</button>
          <input
            id="current-value"
            type="number"
            v-model.number="currentValue"
            :min="minValue"
            :max="maxValue"
            :step="step"
          />
          <button @click="incrementValue" :disabled="currentValue >= maxValue">+</button>
        </div>
      </div>
      
      <div class="control-group">
        <label for="min-value">最小值:</label>
        <input
          id="min-value"
          type="number"
          v-model.number="minValue"
          @change="validateMinMax"
        />
      </div>
      
      <div class="control-group">
        <label for="max-value">最大值:</label>
        <input
          id="max-value"
          type="number"
          v-model.number="maxValue"
          @change="validateMinMax"
        />
      </div>
      
      <div class="control-group">
        <label for="step-value">步進值:</label>
        <input
          id="step-value"
          type="number"
          v-model.number="step"
          min="0.01"
          step="0.01"
          @change="validateStep"
        />
      </div>
      
      <div class="control-group">
        <label for="decimals">小數位數:</label>
        <input
          id="decimals"
          type="number"
          v-model.number="decimals"
          min="0"
          max="10"
          step="1"
          @change="validateDecimals"
        />
      </div>
      
      <div class="control-group">
        <label for="knob-size">尺寸 (px):</label>
        <input
          id="knob-size"
          type="number"
          v-model.number="knobSize"
          min="50"
          max="500"
          step="10"
        />
      </div>
      
      <div class="control-group">
        <label for="start-angle">起始角度 (°):</label>
        <input
          id="start-angle"
          type="number"
          v-model.number="startAngle"
          min="0"
          max="359"
          step="15"
        />
      </div>
      
      <div class="control-group">
        <label for="total-angle">總角度範圍 (°):</label>
        <input
          id="total-angle"
          type="number"
          v-model.number="totalAngle"
          min="90"
          max="360"
          step="15"
          @change="validateTotalAngle"
        />
      </div>
      
      <div class="control-group">
        <label for="knob-color">進度環顏色:</label>
        <input
          id="knob-color"
          type="color"
          v-model="knobColor"
        />
      </div>
      
      <div class="control-group">
        <label for="track-color">背景環顏色:</label>
        <input
          id="track-color"
          type="color"
          v-model="trackColor"
        />
      </div>
      
      <div class="control-group">
        <label for="text-color">文字顏色:</label>
        <input
          id="text-color"
          type="color"
          v-model="textColor"
        />
      </div>
      
      <div class="control-group">
        <label for="background-color">內環背景顏色:</label>
        <div class="color-with-transparent">
          <select v-model="backgroundColorOption" @change="updateBackgroundColor">
            <option value="transparent">透明</option>
            <option value="custom">自訂</option>
          </select>
          <input
            v-if="backgroundColorOption === 'custom'"
            id="background-color"
            type="color"
            v-model="customBackgroundColor"
            @input="updateBackgroundColor"
          />
        </div>
      </div>
      
      <div class="control-group">
        <button class="reset-button" @click="resetToDefaults">重置為預設值</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Knob from './Knob.vue';

// 定義響應式狀態
const currentValue = ref(50);
const minValue = ref(0);
const maxValue = ref(100);
const step = ref(1);
const decimals = ref(0);
const knobSize = ref(150);
const startAngle = ref(0);
const totalAngle = ref(270);
const knobColor = ref('#4a90e2');
const trackColor = ref('#eeeeee');
const textColor = ref('#333333');
const backgroundColor = ref('transparent');
const backgroundColorOption = ref('transparent');
const customBackgroundColor = ref('#ffffff');

// 當Knob值變化時的回調
const onKnobChange = (value) => {
  // 可以在這裡執行額外的邏輯，例如記錄或發送事件
  console.log('Knob值變化:', value);
};

// 增加/減少當前值
const incrementValue = () => {
  const newValue = Math.min(maxValue.value, currentValue.value + step.value);
  currentValue.value = roundToStep(newValue);
};

const decrementValue = () => {
  const newValue = Math.max(minValue.value, currentValue.value - step.value);
  currentValue.value = roundToStep(newValue);
};

// 驗證最小值和最大值
const validateMinMax = () => {
  // 確保最小值小於最大值
  if (minValue.value >= maxValue.value) {
    minValue.value = maxValue.value - step.value;
  }
  
  // 確保當前值在範圍內
  if (currentValue.value < minValue.value) {
    currentValue.value = minValue.value;
  } else if (currentValue.value > maxValue.value) {
    currentValue.value = maxValue.value;
  }
  
  // 四捨五入到步進值
  currentValue.value = roundToStep(currentValue.value);
};

// 驗證步進值
const validateStep = () => {
  if (step.value <= 0) {
    step.value = 0.01;
  }
  
  // 調整當前值以符合新的步進
  currentValue.value = roundToStep(currentValue.value);
};

// 驗證小數位數
const validateDecimals = () => {
  if (decimals.value < 0) {
    decimals.value = 0;
  } else if (decimals.value > 10) {
    decimals.value = 10;
  }
  
  // 確保小數位數是整數
  decimals.value = Math.floor(decimals.value);
};

// 驗證總角度範圍
const validateTotalAngle = () => {
  if (totalAngle.value < 90) {
    totalAngle.value = 90;
  } else if (totalAngle.value > 360) {
    totalAngle.value = 360;
  }
};

// 將值四捨五入到最接近的步進值
const roundToStep = (value) => {
  if (step.value === 0) return value;
  
  // 確保值在範圍內
  const clampedValue = Math.max(minValue.value, Math.min(maxValue.value, value));
  
  // 計算相對於最小值的偏移量
  const offset = clampedValue - minValue.value;
  
  // 將偏移量四捨五入到最接近的步進值
  const roundedOffset = Math.round(offset / step.value) * step.value;
  
  // 將四捨五入後的偏移量加回最小值
  return minValue.value + roundedOffset;
};

// 更新背景顏色
const updateBackgroundColor = () => {
  if (backgroundColorOption.value === 'transparent') {
    backgroundColor.value = 'transparent';
  } else {
    backgroundColor.value = customBackgroundColor.value;
  }
};

// 重置為預設值
const resetToDefaults = () => {
  currentValue.value = 50;
  minValue.value = 0;
  maxValue.value = 100;
  step.value = 1;
  decimals.value = 0;
  knobSize.value = 150;
  startAngle.value = 0;
  totalAngle.value = 270;
  knobColor.value = '#4a90e2';
  trackColor.value = '#eeeeee';
  textColor.value = '#333333';
  backgroundColor.value = 'transparent';
  backgroundColorOption.value = 'transparent';
  customBackgroundColor.value = '#ffffff';
};

// 監聽最小值和最大值的變化，確保當前值在範圍內
watch([minValue, maxValue], () => {
  validateMinMax();
});

// 監聽步進值的變化
watch(step, () => {
  validateStep();
});

computed(() => {
  console.log('currentValue', currentValue.value);
});

watch(currentValue, () => {
  console.log('currentValue', currentValue.value);
}); 

// 監聽小數位數的變化
watch(decimals, () => {
  validateDecimals();
});

// 監聽總角度範圍的變化
watch(totalAngle, () => {
  validateTotalAngle();
  console.log('mousedown')
});

// 監聽背景顏色選項變化
watch(backgroundColorOption, () => {
  updateBackgroundColor();
  console.log('mousedown');
});
</script>

<style scoped>
.knob-demo-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.knob-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}

.current-value {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
}

.controls-section {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}

.control-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

label {
  display: inline-block;
  width: 120px;
  margin-right: 10px;
  font-size: 14px;
}

input[type="number"],
input[type="color"] {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 80px;
}

input[type="color"] {
  height: 30px;
  padding: 0;
  cursor: pointer;
}

.input-with-buttons {
  display: flex;
  align-items: center;
}

.input-with-buttons button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  user-select: none;
}

.input-with-buttons button:first-child {
  border-radius: 4px 0 0 4px;
}

.input-with-buttons button:last-child {
  border-radius: 0 4px 4px 0;
}

.input-with-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-with-buttons input {
  width: 60px;
  text-align: center;
  border-left: none;
  border-right: none;
  border-radius: 0;
}

.color-with-transparent {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-with-transparent select {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.reset-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.reset-button:hover {
  background-color: #e5e5e5;
}

@media (max-width: 768px) {
  .knob-demo-container {
    flex-direction: column;
  }
  
  .knob-section,
  .controls-section {
    width: 100%;
  }
  
  .control-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  label {
    width: 100%;
    margin-bottom: 5px;
  }
  
  input[type="number"],
  input[type="color"] {
    width: 100%;
  }
  
  .input-with-buttons {
    width: 100%;
  }
  
  .input-with-buttons input {
    flex: 1;
  }
}
</style> 