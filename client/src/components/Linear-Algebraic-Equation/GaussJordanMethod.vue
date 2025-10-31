<template>
  <div class="gauss-jordan-page">
    <h1 class="page-title">Gauss-Jordan Method</h1>
    <hr class="page-divider" />
    <div class="content-container">
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
        <button class="calculate-btn" @click="gaussJordan">Calculate</button>
      </div>

      <div v-if="steps.length > 0" class="steps-container">
        <h3>Matrix Transformation Steps:</h3>
        <div v-for="(step, index) in steps" :key="index" class="step-matrix">
          <h4>{{ step.description }}</h4>
          <table class="matrix">
            <tr v-for="(row, i) in step.matrix" :key="i">
              <td v-for="(val, j) in row" :key="j">
                {{ val.toFixed(3) }}
              </td>
            </tr>
          </table>
        </div>
      </div>

      <div v-if="result.length > 0" class="result-container">
        <h3>Result:</h3>
        <table>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(x, i) in result" :key="i">
              <td>x{{ i + 1 }}</td>
              <td>{{ x.toFixed(6) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
// โค้ดส่วนนี้ยังคงเดิม ไม่มีการแก้ไข
export default {
  name: "GaussJordan",
  data() {
    return {
      n: 2,
      A: [],
      B: [],
      result: [],
      steps: [],
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
      this.steps = [];
    },
    snapshotMatrix(a, b) {
      return a.map((row, i) => [...row, b[i]]);
    },
    gaussJordan() {
      const allZeroA = this.A.every((row) => row.every((val) => val === 0));
      if (allZeroA ) {
        alert(
          "Please Input all values in Matrix A and Matrix B "
        );
        return;
      }
      const n = this.n;
      let a = this.A.map((row) => [...row]);
      let b = [...this.B];
      this.steps = [];

      this.steps.push({
        matrix: this.snapshotMatrix(a, b),
        description: "Initial Augmented Matrix",
      });

      for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) {
            maxRow = k;
          }
        }
        if (maxRow !== i) {
          [a[i], a[maxRow]] = [a[maxRow], a[i]];
          [b[i], b[maxRow]] = [b[maxRow], b[i]];
          this.steps.push({
            matrix: this.snapshotMatrix(a, b),
            description: `Swap R${i + 1} <-> R${maxRow + 1}`,
          });
        }
        if (a[i][i] === 0) {
          alert("No unique solution (zero pivot encountered).");
          return;
        }

        const pivot = a[i][i];
        for (let j = 0; j < n; j++) {
          a[i][j] /= pivot;
        }
        b[i] /= pivot;
        this.steps.push({
          matrix: this.snapshotMatrix(a, b),
          description: `Normalize R${i + 1} (divide by ${pivot.toFixed(3)})`,
        });

        for (let k = 0; k < n; k++) {
          if (k !== i) {
            const factor = a[k][i];
            for (let j = 0; j < n; j++) {
              a[k][j] -= factor * a[i][j];
            }
            b[k] -= factor * b[i];

            let sign = factor < 0 ? "+" : "-";
            this.steps.push({
              matrix: this.snapshotMatrix(a, b),
              description: `R${k + 1} ${sign} ${Math.abs(factor).toFixed(
                3
              )} * R${i + 1}`,
            });
          }
        }
      }
      this.result = b;
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

#cramer-container-page {
  font-family: 'Roboto', sans-serif;
  background-color: #0b0c1b;
  color: #c0c0c0;
  min-height: 100vh;
  padding: 40px;
}

.page-title {
  text-align: center;
  font-size: 3em;
  color: #fff;
  text-shadow: 0 0 10px #e6f7ff, 0 0 20px #8a2be2, 0 0 30px #4169e1;
  margin-top: 0;
}

.page-divider {
  border: none;
  height: 2px;
  background-image: linear-gradient(to right, transparent, #8a2be2, #4169e1, transparent);
  margin: 20px auto 40px auto;
  width: 70%;
}

.content-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  border: 1px solid #330066;
  border-radius: 15px;
  background-color: #1a0133;
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.5);
}

.form-group {
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
}

label {
  font-weight: bold;
  color: #d1c4e9;
}

.inline-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

input[type="number"] {
  width: 70px;
  padding: 10px;
  background-color: #3e2765;
  border: 1px solid #673ab7;
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
  background: linear-gradient(45deg, #9c27b0, #7b1fa2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(156, 39, 176, 0.3);
}

.calculate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(156, 39, 176, 0.5);
}

.result-container {
  margin-top: 40px;
  padding: 25px;
  background-color: #3e2765;
  border: 1px solid #673ab7;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(103, 58, 183, 0.3);
}

.result-container h3 {
  margin-top: 0;
  color: #d1c4e9;
  text-shadow: none;
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
  margin-top: 15px;
  width: 100%;
  border-collapse: collapse;
  background-color: #4a148c;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
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