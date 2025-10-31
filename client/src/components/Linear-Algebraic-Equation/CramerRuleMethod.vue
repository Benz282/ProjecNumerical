<template>
  <h1>Cramer's Rule Method</h1>
  <hr />

  <div id="cramer-container">
    <div class="form-group">
      <label>Matrix size (n):</label>
      <div class="inline-input">
        <input type="number" v-model.number="n" min="2" max="10" />
        <button @click="initMatrix">Create Matrix</button>
      </div>
    </div>

    <div v-if="A.length > 0" class="matrix-section">
      <h3>Enter the values of Matrix A and Matrix B:</h3>
      <div class="matrix-grid">
        <table class="matrix">
          <tr v-for="(row, i) in A" :key="i">
            <td v-for="(val, j) in row" :key="j">
              <input type="number" v-model.number="A[i][j]" />
            </td>
          </tr>
        </table>
        <div class="vector">
          <div v-for="(val, i) in B" :key="i">
            <input type="number" v-model.number="B[i]" />
          </div>
        </div>
      </div>
      <button class="calculate-btn" @click="calculateCramer">Calculate</button>
    </div>

    <div v-if="result.length > 0" class="result-container">
      <h3>Result:</h3>
      <p><b>det(A)</b> = {{ detA.toFixed(6) }}</p>

      <div
        v-for="(matrix, i) in AiMatrices"
        :key="'Ai-' + i"
        class="matrix-display"
      >
        <h4>Matrix A{{ i + 1 }}</h4>
        <table class="matrix">
          <tr v-for="(row, rowIndex) in matrix" :key="rowIndex">
            <td v-for="(val, colIndex) in row" :key="colIndex">
              {{ val.toFixed(2) }}
            </td>
          </tr>
        </table>
      </div>

      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>det(A<sub>i</sub>)</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(x, i) in result" :key="i">
            <td>x{{ i + 1 }}</td>
            <td>{{ detAiList[i].toFixed(6) }}</td>
            <td>{{ x.toFixed(6) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "CramerRule",
  data() {
    return {
      n: 2,
      A: [],
      B: [],
      result: [],
      detA: 0,
      detAiList: [],
      AiMatrices: [], // ตัวแปรสำหรับเก็บเมทริกซ์ Ai
    };
  },
  methods: {
    initMatrix() {
      if (this.n < 2 || this.n > 10) {
        alert("Matrix size n must be between 2 and 10.");
        this.n = 2;
        return;
      }

      this.A = Array.from({ length: this.n }, () => Array(this.n).fill(0));
      this.B = Array(this.n).fill(0);
      this.result = [];
      this.detA = 0;
      this.detAiList = [];
      this.AiMatrices = []; // เคลียร์ array เมื่อสร้างเมทริกซ์ใหม่
    },
    determinant(matrix) {
      const n = matrix.length;
      if (n === 1) return matrix[0][0];
      if (n === 2)
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

      let det = 0;
      for (let j = 0; j < n; j++) {
        const subMatrix = matrix
          .slice(1)
          .map((row) => row.filter((_, colIndex) => colIndex !== j));
        det +=
          (j % 2 === 0 ? 1 : -1) * matrix[0][j] * this.determinant(subMatrix);
      }
      return det;
    },
    calculateCramer() {
      const allZeroA = this.A.every((row) => row.every((val) => val === 0));
      if (allZeroA) {
        alert(
          "Please Input all values in Matrix A and Matrix B "
        );
        return;
      }
      this.detA = this.determinant(this.A);
      if (this.detA === 0) {
        alert("Det(A) = 0 → No unique solution");
        this.result = [];
        this.detAiList = [];
        this.AiMatrices = [];
        return;
      }

      // เคลียร์ค่าเก่าก่อนเริ่มการคำนวณใหม่
      this.result = [];
      this.detAiList = [];
      this.AiMatrices = [];

      // ลูปเดียวที่ทำงานถูกต้องและมีประสิทธิภาพ
      for (let i = 0; i < this.n; i++) {
        // สร้างเมทริกซ์ Ai โดยการคัดลอก A
        let Ai = this.A.map((row) => [...row]);
        // แทนที่คอลัมน์ i ด้วยเวกเตอร์ B
        for (let row = 0; row < this.n; row++) {
          Ai[row][i] = this.B[row];
        }

        // เก็บเมทริกซ์ Ai เพื่อแสดงผล
        this.AiMatrices.push(Ai);

        // คำนวณ det(Ai)
        const detAi = this.determinant(Ai);
        this.detAiList.push(detAi);

        // คำนวณค่า x_i และเก็บผลลัพธ์
        this.result.push(detAi / this.detA);
      }
    },
  },
};
</script>

<style scoped>
/* GENERAL STYLES */
body {
  font-family: Arial, sans-serif;
  background-color: #1a1a2e;
  color: #e0e0e0;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

/* HEADER */
h1 {
  text-align: center;
  color: #e0e0e0;
  font-size: 3em;
  margin-top: 50px;
  text-shadow: 0 0 10px #e0e0f0, 0 0 20px #8a2be2;
}

hr {
  border: none;
  height: 2px;
  background: linear-gradient(to right, transparent, #8a2be2, #4169e1, transparent);
  margin: 20px auto 40px auto;
  
}

/* MAIN CONTAINER */
#cramer-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  border: 1px solid #4a148c;
  border-radius: 15px;
  background-color: #2c005b;
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.5);
}

/* FORM ELEMENTS */
.form-group {
  margin-bottom: 25px;
  
}

label {
  font-weight: bold;
  color: #b39ddb;
}

.inline-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

input[type="number"] {
  width: 70px;
  padding: 10px;
  background-color: #4a148c;
  border: 1px solid #6a1b9a;
  color: #e0e0e0;
  border-radius: 8px;
  text-align: center;
  font-size: 1em;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input[type="number"]:focus {
  outline: none;
  border-color: #ba68c8;
  box-shadow: 0 0 10px rgba(186, 104, 200, 0.7);
}

button {
  padding: 10px 20px;
  background-color: #673ab7;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

button:hover {
  background-color: #512da8;
  box-shadow: 0 5px 15px rgba(103, 58, 183, 0.4);
}

/* MATRIX SECTION */
.matrix-section {
  margin-top: 30px;
}

h3 {
  color: #ba68c8;
  margin-bottom: 20px;
  text-shadow: 0 0 8px rgba(186, 104, 200, 0.5);
}

.matrix-grid {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 25px;
}

.matrix,
.vector {
  border: 2px solid #673ab7;
  border-radius: 10px;
  padding: 15px;
  background-color: #4a148c;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
}

.matrix td {
  padding: 8px;
}

/* Specific styling for inputs within matrices/vectors */
.matrix input,
.vector input {
  width: 70px;
  padding: 8px;
  background-color: #6a1b9a;
  border: 1px solid #8e24aa;
  color: #e0e0e0;
  border-radius: 6px;
  text-align: center;
  font-size: 0.95em;
}

.vector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calculate-btn {
  display: block;
  margin: 30px auto 0;
  padding: 12px 30px;
  font-size: 1.15em;
  background-color: #9c27b0;
}

.calculate-btn:hover {
  background-color: #7b1fa2;
  box-shadow: 0 8px 20px rgba(156, 39, 176, 0.5);
}

/* RESULT SECTION */
.result-container {
  margin-top: 40px;
  padding: 25px;
  background-color: #3e2765;
  border: 1px solid #673ab7;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(103, 58, 183, 0.3);
}

.result-container p {
  font-size: 1.1em;
  font-weight: bold;
  color: #d1c4e9;
  margin-bottom: 20px;
}

.matrix-display {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #4a148c;
  border: 1px solid #6a1b9a;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.matrix-display h4 {
  margin-top: 0;
  color: #ba68c8;
  text-align: center;
  text-shadow: 0 0 5px rgba(186, 104, 200, 0.3);
}

.matrix-display table {
  width: 100%;
  border-collapse: collapse;
}

.matrix-display td {
  padding: 8px;
  border: 1px solid #6a1b9a;
  text-align: center;
  font-weight: bold;
  color: #e0e0e0;
}

.matrix-display tr:nth-child(even) {
  background-color: rgba(74, 20, 140, 0.2);
}

.result-container table {
  margin-top: 25px;
  width: 100%;
  border-collapse: collapse;
  background-color: #4a148c;
  border-radius: 10px;
  overflow: hidden;
}

.result-container th,
.result-container td {
  border: 1px solid #6a1b9a;
  padding: 12px;
  text-align: center;
  color: #e0e0e0;
}

.result-container th {
  background-color: #673ab7;
  color: white;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.result-container tr:hover {
  background-color: rgba(103, 58, 183, 0.2);
}
</style>