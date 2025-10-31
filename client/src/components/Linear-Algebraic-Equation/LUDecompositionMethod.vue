<template>
  <div class="lu-page">
    <h1 class="page-title">LU Decomposition Method</h1>
    <hr class="page-divider" />
    <div class="content-container">
      <div class="form-group">
        <label>Matrix size (n):</label>
        <div class="inline-input">
          <input type="number" v-model.number="n" min="2" max="8" />
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
        <button class="calculate-btn" @click="luDecomposition">Calculate</button>
      </div>

      <div v-if="L.length > 0 && U.length > 0" class="result-container">
        <h3>Lower Triangular Matrix (L):</h3>
        <table>
          <tr v-for="(row, i) in L" :key="i">
            <td v-for="(val, j) in row" :key="j">
              {{ val.toFixed(6) }}
            </td>
          </tr>
        </table>
        <br />
        <h3>Upper Triangular Matrix (U):</h3>
        <table>
          <tr v-for="(row, i) in U" :key="i">
            <td v-for="(val, j) in row" :key="j">
              {{ val.toFixed(6) }}
            </td>
          </tr>
        </table>
      </div>
      <div v-if="Y.length > 0" class="result-container">
        <h3>Forward Substitution (solve L·Y = B):</h3>
        <table>
          <thead>
            <tr>
              <th>yi</th>
              <th>result</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(val, i) in Y" :key="i">
              <td>y{{ i + 1 }}</td>
              <td>{{ val.toFixed(6) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="X.length > 0" class="result-container">
        <h3>Backward Substitution (solve U·X = Y):</h3>
        <table>
          <thead>
            <tr>
              <th>xi</th>
              <th>result</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(val, i) in X" :key="i">
              <td>x{{ i + 1 }}</td>
              <td>{{ val.toFixed(6) }}</td>
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
  name: "LUDecomposition",
  data() {
    return {
      n: 2,
      A: [],
      B: [],
      L: [],
      U: [],
      Y: [],
      X: [],
    };
  },
  methods: {
    initMatrix() {
      if (this.n < 2 || this.n > 8) {
        alert("Matrix size n must be between 2 and 8.");
        this.n = 2;
        return;
      }
      this.A = Array.from({ length: this.n }, () => Array(this.n).fill(0));
      this.B = Array(this.n).fill(0);
      this.L = [];
      this.U = [];
      this.Y = [];
      this.X = [];
    },
    luDecomposition() {
      const allZeroA = this.A.every((row) => row.every((val) => val === 0));
      if (allZeroA ) {
        alert(
          "Please Input all values in Matrix A and Matrix B "
        );
        return;
      }
      const n = this.n;
      let A = this.A.map((row) => [...row]);
      let L = Array.from({ length: n }, () =>
        Array(n).fill(0)
      );
      let U = Array.from({ length: n }, () =>
        Array(n).fill(0)
      );
      for (let i = 0; i < n; i++) {
        for (let k = i; k < n; k++) {
          let sum = 0;
          for (let j = 0; j < i; j++) {
            sum += L[i][j] * U[j][k];
          }
          U[i][k] = A[i][k] - sum;
        }
        for (let k = i; k < n; k++) {
          if (i === k) {
            L[i][i] = 1;
          } else {
            let sum = 0;
            for (let j = 0; j < i; j++) {
              sum += L[k][j] * U[j][i];
            }
            if (U[i][i] === 0) {
              alert("Zero pivot encountered, cannot decompose.");
              return;
            }
            L[k][i] = (A[k][i] - sum) / U[i][i];
          }
        }
      }
      this.L = L;
      this.U = U;
      let Y = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += L[i][j] * Y[j];
        }
        Y[i] = this.B[i] - sum;
      }
      this.Y = Y;
      let X = Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
          sum += U[i][j] * X[j];
        }
        X[i] = (Y[i] - sum) / U[i][i];
      }
      this.X = X;
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