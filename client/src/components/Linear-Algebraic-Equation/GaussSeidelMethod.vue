<template>
  <div class="gauss-seidel-page">
    <h1 class="page-title">Gauss-Seidel Iteration Method</h1>
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
        <h2>Enter the values of Matrix A and Matrix B:</h2>
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

        <div class="x0-row">
          <h2 class="x0-label">Initial X (X₀):</h2>
          <div class="x0-inputs">
            <div v-for="(val, i) in X0" :key="'x0' + i" class="x0-cell">
              <span>x{{ i + 1 }}</span>
              <input type="number" v-model.number="X0[i]" />
            </div>
          </div>
        </div>

        <button class="calculate-btn" @click="gaussSeidel">Calculate</button>
      </div>

      <div v-if="result.length > 0" class="result-container">
        <h3>Result:</h3>
        <div v-for="(val, i) in result" :key="i">
          x{{ i + 1 }} = <b>{{ val.toFixed(6) }}</b>
        </div>
      </div>

      <div v-if="iterations.length > 0" class="iteration-table">
        <h3>The iteration table:</h3>
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th v-for="i in n" :key="'x' + i">x{{ i }}</th>
              <th>Error (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, idx) in iterations" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td v-for="x in it.x" :key="x">{{ x.toFixed(6) }}</td>
              <td>
                <span v-if="it.error !== null">{{ it.error.toFixed(6) }}</span>
                <span v-else>N/A</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GaussSeidelMethod",
  data() {
    return {
      n: 2,
      A: [],
      B: [],
      X0: [],
      iterations: [],
      result: [],
      maxIter: 50,
      epsilon: 0.00001,
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
      this.X0 = Array(this.n).fill(0);
      this.iterations = [];
      this.result = [];
    },
    gaussSeidel() {
      const allZeroA = this.A.every((row) => row.every((val) => val === 0));

      if (allZeroA) {
        alert("Please input all values in Matrix A and Matrix B. and Initial X (X₀).");
        return;
      }
      const n = this.n;
      const A = this.A.map((row) => [...row]);
      const B = [...this.B];
      let X = [...this.X0];
      let iterations = [];
      let error = null;

      for (let iter = 0; iter < this.maxIter; iter++) {
        let X_old = [...X];

        for (let i = 0; i < n; i++) {
          let sum = 0;
          for (let j = 0; j < n; j++) {
            if (j !== i) sum += A[i][j] * X[j];
          }
          if (A[i][i] === 0) {
            alert(`Error: Division by zero detected at A[${i}][${i}]`);
            return;
          }
          X[i] = (B[i] - sum) / A[i][i];
          if (isNaN(X[i]) || !isFinite(X[i])) {
            alert(`Error: Computation resulted in NaN/Infinity at iteration ${iter + 1}, variable x${i + 1}`);
            return;
          }
        }
        error = Math.max(...X.map((xi, i) => Math.abs((xi - X_old[i]) / (xi || 1)) * 100));
        iterations.push({
          x: [...X],
          error: iter === 0 ? null : error,
        });
        if (error < this.epsilon) break;
      }
      this.iterations = iterations;
      this.result = [...X];
    },
  },
  mounted() {
    this.initMatrix();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.gauss-seidel-page {
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

h2, h3 {
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
.vector input,
.x0-inputs input {
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

.x0-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.x0-label {
  margin-bottom: 10px;
}

.x0-inputs {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.x0-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ba68c8;
  font-weight: bold;
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
}

.result-container div {
  text-align: center;
  margin: 8px 0;
  font-size: 1.1em;
}

.iteration-table {
  margin-top: 40px;
  padding: 25px;
  background-color: #2c005b;
  border: 1px solid #4a148c;
  border-radius: 12px;
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.5);
  overflow-x: auto;
}

.iteration-table h3 {
  color: #ba68c8;
  text-align: center;
  margin-bottom: 20px;
}

.iteration-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background-color: #4a148c;
  border-radius: 10px;
  overflow: hidden;
}

.iteration-table th,
.iteration-table td {
  border: 1px solid #6a1b9a;
  padding: 12px;
  text-align: center;
  color: #e0e0e0;
  white-space: nowrap;
}

.iteration-table th {
  background-color: #673ab7;
  color: white;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.iteration-table tr:hover {
  background-color: rgba(103, 58, 183, 0.2);
}
</style>