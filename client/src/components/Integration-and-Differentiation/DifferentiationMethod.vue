<template>
  <div class="differentiation-page-container">
    <h1>Differentiation Method</h1><hr/>
    
    <div id="differentiation-container">
      
      <div id="calculator-container" style="width: 100%; height: 400px; margin-top: 20px; border-radius: 10px; overflow: hidden;"></div>
      
      <div class="input-form">
        <div class="form-group">
          <label for="fx">Enter the equation f(x):</label>
          <input type="text" id="fx" v-model="fx" placeholder="x^2 + x + 4" />
        </div>
        
        <div class="input-hint">
          <b>Notes: </b>
          <code>exp(x)</code> for <b>e<sup>x</sup></b>, <code>sqrt(x)</code> for <b>√x</b>, 
          <code>sin(x)</code> for <b>sin(x)</b>, <code>cos(x)</code> for <b>cos(x)</b>, 
          <code>log(x)</code> for <b>ln(x)</b>, <code>pow(x, n)</code> for <b>xⁿ</b>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="method">Differentiation Method:</label>
            <select id="method" v-model="method">
              <option value="forward">Forward Divided-Difference</option>
              <option value="backward">Backward Divided-Difference</option>
              <option value="central">Central Divided-Difference</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="order">Order:</label>
            <select id="order" v-model="order">
              <option value="h">O(h)</option>
              <option value="h2">O(h²)</option>
              <option value="h4" v-if="method === 'central'">O(h⁴)</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="x">Point x:</label>
            <input type="text" id="x" v-model="xInput" />
          </div>
          
          <div class="form-group">
            <label for="h">Step Size h:</label>
            <input type="text" id="h" v-model="hInput" />
          </div>
        </div>
        
        <button type="button" @click="calculateDifferentiation">Calculate</button>
      </div>

      <div v-if="result !== null" class="result-container">
        <h3>Result:</h3>
        <div class="result-grid">
          <div class="result-item">
            <span class="result-label">Method:</span>
            <span class="result-value">{{ getMethodName() }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Order:</span>
            <span class="result-value">{{ order === 'h' ? 'O(h)' : order === 'h2' ? 'O(h²)' : 'O(h⁴)' }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Point:</span>
            <span class="result-value">x = {{ calculatedX }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Exact Derivative:</span>
            <span class="result-value exact">{{ exactDerivative !== null ? exactDerivative.toFixed(8) : 'N/A' }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Estimated Result:</span>
            <span class="result-value estimated">{{ result.toFixed(8) }}</span>
          </div>
          <div class="result-item" v-if="error !== null">
            <span class="result-label">Error:</span>
            <span class="result-value error">{{ error.toFixed(8) }}%</span>
          </div>
        </div>
        <p class="points-used">
          <b>Points used:</b> {{ pointsUsed.map(p => p.toFixed(4)).join(', ') }}
        </p>
      </div>

      <div v-if="calculationSteps.length > 0" class="steps-container">
        <h3>Calculation Steps:</h3>
        <div class="step" v-for="(step, index) in calculationSteps" :key="index">
          <p><b>{{ step.label }}:</b> {{ step.value }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
// ต้อง install mathjs ก่อน: npm install mathjs
import { create, all } from 'mathjs';
const math = create(all);

export default {
  name: "DifferentiationMethod",
  data() {
    return {
      fx: 'x^2 + x + 4', // ค่าเริ่มต้น
      method: 'forward',
      order: 'h',
      xInput: '2',
      hInput: '0.1',
      
      result: null,
      exactDerivative: null,
      error: null,
      calculatedX: null,
      pointsUsed: [],
      calculationSteps: [],

      calculator: null // สำหรับ Desmos
    };
  },
  
  // ตรวจสอบการเปลี่ยนแปลง: ถ้าเลือก O(h4) แล้วเปลี่ยนวิธี, ให้เด้งกลับไป O(h2)
  watch: {
    method(newMethod) {
      if (newMethod !== 'central' && this.order === 'h4') {
        this.order = 'h2'; 
      }
    },
    fx() {
      this.updateGraph();
    }
  },

  mounted() {
    // ถ้าคุณโหลด Desmos API ใน index.html, กราฟจะทำงาน
    // (เพิ่ม <script src="..."></scr` + `ipt> ใน index.html)
    // หรือใช้เวอร์ชันฟรี (ไม่ต้องใช้ API Key): <script src="..."></scr` + `ipt>
    const elt = document.getElementById('calculator-container');
    if (window.Desmos && elt) {
      this.calculator = window.Desmos.GraphingCalculator(elt);
      this.updateGraph();
    }
  },

  methods: {
    // --- ฟังก์ชันหลักในการคำนวณ ---
    calculateDifferentiation() {
      // 1. รีเซ็ตค่า
      this.result = null;
      this.exactDerivative = null;
      this.error = null;
      this.pointsUsed = [];
      this.calculationSteps = [];

      // 2. แปลงค่า Input
      let x, h, compiledFx;
      try {
        x = parseFloat(this.xInput);
        h = parseFloat(this.hInput);
        if (isNaN(x) || isNaN(h)) {
          throw new Error("Invalid input: x and h must be numbers.");
        }
        if (h === 0) {
          throw new Error("Invalid input: h cannot be zero.");
        }
        compiledFx = math.compile(this.fx);
      } catch (e) {
        alert(`Error parsing input: ${e.message}`);
        return;
      }
      
      const f = (val) => compiledFx.evaluate({ x: val });
      this.calculatedX = x;

      // 3. คำนวณค่าอนุพันธ์จริง (Exact)
      try {
        const derivative = math.derivative(this.fx, 'x');
        this.exactDerivative = derivative.evaluate({ x: x });
        this.calculationSteps.push({ label: 'Exact Derivative f\'(x)', value: `${derivative.toString()} = ${this.exactDerivative.toFixed(8)}` });
      } catch (e) {
        console.warn("Could not calculate exact derivative:", e.message);
        this.exactDerivative = null; 
      }

      // 4. คำนวณค่าประมาณ (Numerical Differentiation)
      let estimatedResult;
      
      if (this.method === 'forward') {
        if (this.order === 'h') {
          // O(h) Forward: [f(x+h) - f(x)] / h
          const fxVal = f(x);
          const fxh = f(x + h);
          estimatedResult = (fxh - fxVal) / h;
          this.pointsUsed = [x, x + h];
          this.calculationSteps.push({ label: 'f(x)', value: `f(${x}) = ${fxVal.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x+h)', value: `f(${x + h}) = ${fxh.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f\'(x) ≈ [f(x+h) - f(x)] / h', value: `[${fxh.toFixed(8)} - ${fxVal.toFixed(8)}] / ${h} = ${estimatedResult.toFixed(8)}` });
        } else { // O(h²) Forward
          // O(h²) Forward: [-f(x+2h) + 4f(x+h) - 3f(x)] / 2h
          const fxVal = f(x);
          const fxh = f(x + h);
          const fx2h = f(x + 2 * h);
          estimatedResult = (-fx2h + 4 * fxh - 3 * fxVal) / (2 * h);
          this.pointsUsed = [x, x + h, x + 2 * h];
          this.calculationSteps.push({ label: 'f(x)', value: `f(${x}) = ${fxVal.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x+h)', value: `f(${x + h}) = ${fxh.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x+2h)', value: `f(${x + 2 * h}) = ${fx2h.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f\'(x) ≈ [-f(x+2h) + 4f(x+h) - 3f(x)] / 2h', value: `[-${fx2h.toFixed(8)} + 4*${fxh.toFixed(8)} - 3*${fxVal.toFixed(8)}] / ${2 * h} = ${estimatedResult.toFixed(8)}` });
        }
      } else if (this.method === 'backward') {
        if (this.order === 'h') {
          // O(h) Backward: [f(x) - f(x-h)] / h
          const fxVal = f(x);
          const fx_h = f(x - h);
          estimatedResult = (fxVal - fx_h) / h;
          this.pointsUsed = [x - h, x];
          this.calculationSteps.push({ label: 'f(x)', value: `f(${x}) = ${fxVal.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x-h)', value: `f(${x - h}) = ${fx_h.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f\'(x) ≈ [f(x) - f(x-h)] / h', value: `[${fxVal.toFixed(8)} - ${fx_h.toFixed(8)}] / ${h} = ${estimatedResult.toFixed(8)}` });
        } else { // O(h²) Backward
          // O(h²) Backward: [3f(x) - 4f(x-h) + f(x-2h)] / 2h
          const fxVal = f(x);
          const fx_h = f(x - h);
          const fx_2h = f(x - 2 * h);
          estimatedResult = (3 * fxVal - 4 * fx_h + fx_2h) / (2 * h);
          this.pointsUsed = [x - 2 * h, x - h, x];
          this.calculationSteps.push({ label: 'f(x)', value: `f(${x}) = ${fxVal.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x-h)', value: `f(${x - h}) = ${fx_h.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x-2h)', value: `f(${x - 2 * h}) = ${fx_2h.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f\'(x) ≈ [3f(x) - 4f(x-h) + f(x-2h)] / 2h', value: `[3*${fxVal.toFixed(8)} - 4*${fx_h.toFixed(8)} + ${fx_2h.toFixed(8)}] / ${2 * h} = ${estimatedResult.toFixed(8)}` });
        }
      } else { // 'central'
        if (this.order === 'h2') {
          // O(h²) Central: [f(x+h) - f(x-h)] / 2h
          const fxh = f(x + h);
          const fx_h = f(x - h);
          estimatedResult = (fxh - fx_h) / (2 * h);
          this.pointsUsed = [x - h, x + h];
          this.calculationSteps.push({ label: 'f(x+h)', value: `f(${x + h}) = ${fxh.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x-h)', value: `f(${x - h}) = ${fx_h.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f\'(x) ≈ [f(x+h) - f(x-h)] / 2h', value: `[${fxh.toFixed(8)} - ${fx_h.toFixed(8)}] / ${2 * h} = ${estimatedResult.toFixed(8)}` });
        } else { // O(h⁴) Central
          // O(h⁴) Central: [-f(x+2h) + 8f(x+h) - 8f(x-h) + f(x-2h)] / 12h
          const fx2h = f(x + 2 * h);
          const fxh = f(x + h);
          const fx_h = f(x - h);
          const fx_2h = f(x - 2 * h);
          estimatedResult = (-fx2h + 8 * fxh - 8 * fx_h + fx_2h) / (12 * h);
          this.pointsUsed = [x - 2 * h, x - h, x + h, x + 2 * h];
          this.calculationSteps.push({ label: 'f(x+2h)', value: `f(${x + 2 * h}) = ${fx2h.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x+h)', value: `f(${x + h}) = ${fxh.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x-h)', value: `f(${x - h}) = ${fx_h.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f(x-2h)', value: `f(${x - 2 * h}) = ${fx_2h.toFixed(8)}` });
          this.calculationSteps.push({ label: 'f\'(x) ≈ [-f(x+2h) + 8f(x+h) - ... ] / 12h', value: `${estimatedResult.toFixed(8)}` });
        }
      }

      // 5. แสดงผลลัพธ์
      this.result = estimatedResult;
      if (this.exactDerivative !== null) {
        // ป้องกันการหารด้วย 0
        if(Math.abs(this.exactDerivative) < 1e-9) {
          this.error = Math.abs(this.exactDerivative - this.result);
        } else {
          this.error = Math.abs((this.exactDerivative - this.result) / this.exactDerivative) * 100;
        }
      }
      
      // 6. อัปเดตกราฟ
      this.updateGraph(x, f(x), estimatedResult);
    },

    // --- ฟังก์ชันช่วย ---
    getMethodName() {
      switch (this.method) {
        case 'forward': return 'Forward Divided-Difference';
        case 'backward': return 'Backward Divided-Difference';
        case 'central': return 'Central Divided-Difference';
        default: return '';
      }
    },
    
    updateGraph(pointX, pointY, slope) {
      if (!this.calculator) return;
      
      this.calculator.setBlank(); // ล้างกราฟเก่า
      
      try {
        // วาดฟังก์ชันหลัก
        this.calculator.setExpression({ id: 'func', latex: `y = ${math.parse(this.fx).toTex()}` });
        
        // วาดจุดและเส้นสัมผัส ถ้ามีการคำนวณแล้ว
        if (pointX !== undefined && pointY !== undefined && slope !== undefined) {
          // พล็อตจุด
          this.calculator.setExpression({ id: 'point', latex: `(${pointX}, ${pointY})`, label: 'Point', showLabel: true });
          
          // วาดเส้นสัมผัสที่ได้จากการประมาณ (เส้นประ)
          this.calculator.setExpression({ id: 'approx-tangent', latex: `y - ${pointY} = ${slope}(x - ${pointX})`, lineStyle: 'DASHED' });
          
          // วาดเส้นสัมผัสจริง (ถ้ามี)
          if(this.exactDerivative !== null) {
            this.calculator.setExpression({ id: 'true-tangent', latex: `y - ${pointY} = ${this.exactDerivative}(x - ${pointX})`, color: '#4caf50' });
          }
        }
      } catch (e) {
        console.error("Error drawing graph:", e.message);
      }
    }
  }
};
</script>

<style scoped>
/* นี่คือ CSS ที่เขียนขึ้นใหม่ทั้งหมด
  เพื่อให้เข้ากับ HTML ใน Template และธีมสีที่ดูเหมือนคุณพยายามจะใช้
*/
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

/* คอนเทนเนอร์หลักของหน้า */
.differentiation-page-container {
  font-family: 'Roboto', sans-serif;
  background-color: #0b0c1b; /* พื้นหลังสีน้ำเงินเข้ม */
  color: #c0c0c0; /* ข้อความสีอ่อน */
  min-height: 100vh;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2.5em;
  color: #fff;
  text-shadow: 0 0 10px #e6f7ff, 0 0 20px #8a2be2;
  margin-bottom: 10px;
}

hr {
  border: none;
  height: 2px;
  background-image: linear-gradient(to right, transparent, #8a2be2, #4169e1, transparent);
  margin-bottom: 30px;
}

#differentiation-container {
  display: grid;
  grid-template-columns: 1fr; /* Layout คอลัมน์เดียว */
  gap: 30px;
}

/* --- สไตล์ฟอร์มรับข้อมูล --- */
.input-form {
  background-color: #1a0133; /* สีม่วงเข้ม */
  border: 1px solid #330066;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #d1c4e9;
  font-weight: bold;
  font-size: 1.1em;
}

.form-group input[type="text"],
.form-group select {
  background-color: #3e2765;
  color: #e0e0e0;
  border: 1px solid #8e24aa;
  border-radius: 6px;
  padding: 12px;
  font-size: 1em;
}

.form-group input[type="text"]:focus,
.form-group select:focus {
  outline: none;
  border-color: #ba68c8;
  box-shadow: 0 0 10px rgba(186, 104, 200, 0.7);
}

.form-row {
  display: flex;
  flex-wrap: wrap; /* ให้ขึ้นบรรทัดใหม่ได้ถ้าจอเล็ก */
  gap: 20px;
}

.form-row .form-group {
  flex: 1; /* แบ่งพื้นที่เท่าๆ กัน */
  min-width: 200px; /* ขนาดขั้นต่ำ */
}

.input-hint {
  font-size: 0.9em;
  color: #d1c4e9;
  background-color: #2a024f;
  padding: 10px;
  border-radius: 5px;
  line-height: 1.6;
}
.input-hint b {
  color: #fff;
}
.input-hint code {
  font-family: monospace;
  background-color: #3e2765;
  padding: 2px 4px;
  border-radius: 3px;
  color: #ffeb3b;
}

button {
  padding: 12px 30px;
  background: linear-gradient(45deg, #9c27b0, #7b1fa2);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.15em;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(156, 39, 176, 0.3);
  margin-top: 10px;
  align-self: center;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(156, 39, 176, 0.5);
}

/* --- สไตล์ส่วนผลลัพธ์และขั้นตอน --- */
.result-container, .steps-container {
  background-color: #1a0133;
  border: 1px solid #330066;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.3);
}

h3 {
  color: #ba68c8;
  margin-top: 0;
  margin-bottom: 20px;
  text-shadow: 0 0 8px rgba(186, 104, 200, 0.5);
  border-bottom: 1px solid #3e2765;
  padding-bottom: 10px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.result-item {
  background-color: #3e2765;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.result-label {
  display: block;
  font-size: 0.9em;
  color: #d1c4e9;
  margin-bottom: 5px;
}

.result-value {
  font-size: 1.2em;
  font-weight: bold;
  color: #fff;
  word-break: break-all;
}
.result-value.exact { color: #4caf50; } /* สีเขียว */
.result-value.estimated { color: #ffeb3b; } /* สีเหลือง */
.result-value.error { color: #f44336; } /* สีแดง */

.points-used {
  font-size: 0.9em;
  color: #c0c0c0;
  font-style: italic;
  margin-top: 15px;
}

.step {
  background-color: #2a024f;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  font-family: monospace;
  font-size: 1.1em;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
.step b {
  color: #ba68c8;
}
</style>