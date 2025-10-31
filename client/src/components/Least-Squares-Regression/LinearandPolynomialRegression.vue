<template>
  <div class="regression-page">
    <h1 class="page-title">Linear & Polynomial Regression</h1>
    <hr class="page-divider" />

    <div class="content-container">
      <h3>Data Points</h3>
      <div class="table-wrapper">
        <table class="data-points-table">
          <thead>
            <tr>
              <th>X</th>
              <th>Y(fx)</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(point, i) in points" :key="i">
              <td>
                <input type="number" v-model.number="point.x" step="any" />
              </td>
              <td>
                <input type="number" v-model.number="point.y" step="any" />
              </td>
              <td>
                <button @click="removePoint(i)">❌</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button @click="addPoint" class="add-point-btn">+ Add Point</button>

      <div class="input-section">
        <div class="input-item">
          <label>Decimal places:</label>
          <input type="number" v-model.number="decimal" min="0" max="10" />
        </div>
        <div class="input-item">
          <label>Target x:</label>
          <input type="number" v-model.number="targetX" step="any" />
        </div>
      </div>

      <div class="input-section">
        <div class="input-item">
          <label>Method:</label>
          <select v-model="method">
            <option value="linear">Linear Regression</option>
            <option value="polynomial">Polynomial Regression</option>
          </select>
        </div>

        <div v-if="method === 'linear'">
          <small class="method-info">Linear regression: Fit a line y = a₀ + a₁x</small>
        </div>
        <div v-if="method === 'polynomial'" class="input-item">
          <label>Degree:</label>
          <input type="number" v-model.number="degree" min="2" max="6" />
          <small class="method-info">Polynomial regression: Fit y = a₀ + a₁x + a₂x² + ...</small>
        </div>
      </div>

      <div class="input-section">
        <button @click="calculate" :disabled="points.length < minPoints" class="calculate-btn">
          Calculate
        </button>
        <button @click="reset" class="reset-btn">Reset</button>
      </div>

      <div v-if="result !== null" class="result-container">
        <h3>Result ({{ methodLabel }}):</h3>
        <p>f({{ targetX }}) = <b>{{ result }}</b></p>

        <h4 class="result-subtitle">Summations:</h4>
        <div class="summation-display">
          <p v-for="(sum, label) in summations" :key="label">
            {{ label }} = {{ sum }}
          </p>
        </div>

        <h4 class="result-subtitle">Normal Equations:</h4>
        <div class="equation-scroll">
          <div class="matrix-display">
            <span class="bracket left-bracket">[</span>
            <div class="matrix-content">
              <div
                v-for="(row, r) in normalEquations.A"
                :key="'A' + r"
                class="matrix-row"
              >
                <span v-for="(val, c) in row" :key="'A' + r + c">{{ val }}</span>
              </div>
            </div>
            <span class="bracket right-bracket">]</span>

            <span class="matrix-symbol">{</span>
            <div class="matrix-content coefficient-vector">
              <div
                v-for="(coeff, i) in normalEquations.coeffs"
                :key="'C' + i"
                class="matrix-row"
              >
                <span>{{ coeff }}</span>
              </div>
            </div>
            <span class="matrix-symbol">}</span>

            <span class="matrix-symbol">=</span>

            <span class="matrix-symbol">{</span>
            <div class="matrix-content result-vector">
              <div
                v-for="(val, i) in normalEquations.B"
                :key="'B' + i"
                class="matrix-row"
              >
                <span>{{ val }}</span>
              </div>
            </div>
            <span class="matrix-symbol">}</span>
          </div>
        </div>

        <h4 class="result-subtitle">Equation:</h4>
        <p class="mono">{{ equation }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// The script section remains unchanged from your original code.
export default {
  name: "LeastSquaresRegression",
  data() {
    return {
      points: [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 2, y: 1 },
      ],
      decimal: 6,
      targetX: 0.5,
      method: "linear",
      degree: 2,
      result: null,
      coeffs: [],
      equation: "",
      normalEquations: {
        A: [],
        B: [],
        coeffs: [],
      },
      summations: {},
    };
  },
  computed: {
    minPoints() {
      return this.method === "linear" ? 2 : this.degree + 1;
    },
    methodLabel() {
      return this.method === "linear"
        ? "Linear Regression"
        : `Polynomial Regression (deg ${this.degree})`;
    },
  },
  methods: {
    addPoint() {
      const lastX = this.points.length
        ? this.points[this.points.length - 1].x
        : 0;
      this.points.push({ x: lastX + 1, y: 0 });
      this.points.sort((a, b) => a.x - b.x);
    },
    removePoint(i) {
      this.points.splice(i, 1);
    },
    reset() {
      this.points = [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 2, y: 1 },
      ];
      this.result = null;
      this.coeffs = [];
      this.equation = "";
      this.normalEquations = { A: [], B: [], coeffs: [] };
      this.summations = {};
    },

    calculateLinear() {
      const n = this.points.length;
      const sumX = this.points.reduce((s, p) => s + p.x, 0);
      const sumY = this.points.reduce((s, p) => s + p.y, 0);
      const sumXY = this.points.reduce((s, p) => s + p.x * p.y, 0);
      const sumX2 = this.points.reduce((s, p) => s + p.x * p.x, 0);
      this.summations = {
        n: n.toFixed(0),
        'Σx': sumX.toFixed(this.decimal),
        'Σy': sumY.toFixed(this.decimal),
        'Σx²': sumX2.toFixed(this.decimal),
        'Σxy': sumXY.toFixed(this.decimal),
      };
      this.normalEquations.A = [
        [n.toFixed(this.decimal), sumX.toFixed(this.decimal)],
        [sumX.toFixed(this.decimal), sumX2.toFixed(this.decimal)],
      ];
      this.normalEquations.B = [
        sumY.toFixed(this.decimal),
        sumXY.toFixed(this.decimal),
      ];
      this.normalEquations.coeffs = ["a₀", "a₁"];
      const denominator = n * sumX2 - sumX * sumX;
      if (denominator === 0) {
        alert("The determinant is zero. Cannot solve for a unique linear equation.");
        return NaN;
      }
      const b = (n * sumXY - sumX * sumY) / denominator;
      const a = sumY / n - b * (sumX / n);
      const yPred = a + b * this.targetX;
      this.coeffs = [a, b];
      this.equation = `y = ${a.toFixed(this.decimal)} + ${b.toFixed(this.decimal)}x`;
      return yPred;
    },

    calculatePolynomial() {
      const m = this.degree + 1;
      const A = Array.from({ length: m }, () => Array(m).fill(0));
      const B = Array(m).fill(0);
      const tempSums = {};
      for (let row = 0; row < m; row++) {
        for (let col = 0; col < m; col++) {
          const power = row + col;
          if (!tempSums[`x${power}`]) {
            tempSums[`x${power}`] = this.points.reduce(
              (s, p) => s + Math.pow(p.x, power),
              0
            );
          }
          A[row][col] = tempSums[`x${power}`];
        }
        const powerY = row;
        B[row] = this.points.reduce(
          (s, p) => s + p.y * Math.pow(p.x, powerY),
          0
        );
        tempSums[`yx${powerY}`] = B[row];
      }
      const displaySums = {};
      for (let i = 0; i <= 2 * this.degree; i++) {
        const key = i === 0 ? "n" : `Σx^${i}`;
        if (tempSums[`x${i}`] !== undefined) {
          displaySums[key] =
            i === 0
              ? tempSums["x0"].toFixed(0)
              : tempSums[`x${i}`].toFixed(this.decimal);
        }
      }
      for (let i = 0; i <= this.degree; i++) {
        const key = i === 0 ? "Σy" : `Σyx^${i}`;
        if (tempSums[`yx${i}`] !== undefined) {
          displaySums[key] = tempSums[`yx${i}`].toFixed(this.decimal);
        }
      }
      this.summations = displaySums;
      this.normalEquations.A = A.map((row) =>
        row.map((val) => val.toFixed(this.decimal))
      );
      this.normalEquations.B = B.map((val) => val.toFixed(this.decimal));
      this.normalEquations.coeffs = Array.from({ length: m }, (_, i) => "a" + i);
      const coeffs = this.solveLinear(A, B);
      this.coeffs = coeffs;
      if (coeffs.some((c) => isNaN(c))) return NaN;
      let equationString = coeffs
        .map((c, i) => {
          const termValue = Math.abs(c);
          if (termValue < 1e-10) return "";
          const termStr = termValue.toFixed(this.decimal);
          let xTerm = "";
          if (i === 1) xTerm = "x";
          else if (i > 1) xTerm = `x^${i}`;
          const valStr =
            i > 0 && termStr === "1.000000" && xTerm !== "" ? "" : termStr;
          let sign = c >= 0 ? " + " : " - ";
          if (i === 0) sign = "";
          return `${sign}${valStr}${xTerm}`;
        })
        .filter((term) => term !== "")
        .join("");
      if (equationString.startsWith(" + ")) {
        equationString = equationString.substring(3);
      } else if (equationString.startsWith(" - ")) {
        equationString = "-" + equationString.substring(3);
      }
      this.equation = "y = " + (equationString || "0");
      const yPred = coeffs.reduce(
        (s, c, i) => s + c * Math.pow(this.targetX, i),
        0
      );
      return yPred;
    },
    solveLinear(A, B) {
      const n = A.length;
      A = A.map((row) => row.slice());
      B = B.slice();
      for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
        }
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [B[i], B[maxRow]] = [B[maxRow], B[i]];
        if (Math.abs(A[i][i]) < 1e-12) {
          console.error("Matrix is singular or nearly singular.");
          return Array(n).fill(NaN);
        }
        for (let k = i + 1; k < n; k++) {
          const c = A[k][i] / A[i][i];
          for (let j = i; j < n; j++) A[k][j] -= c * A[i][j];
          B[k] -= c * B[i];
        }
      }
      const x = Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let sum = B[i];
        for (let j = i + 1; j < n; j++) sum -= A[i][j] * x[j];
        x[i] = sum / A[i][i];
      }
      return x;
    },
    calculate() {
      if (this.points.length < this.minPoints) {
        alert(`Need at least ${this.minPoints} points for this method.`);
        return;
      }
      let result;
      if (this.method === "linear") {
        result = this.calculateLinear();
      } else {
        result = this.calculatePolynomial();
      }
      this.result = !isNaN(result)
        ? result.toFixed(this.decimal)
        : "N/A (Solver Error)";
    },
  },
  mounted() {
    this.points.sort((a, b) => a.x - b.x);
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.regression-page {
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

h3,
h4 {
  color: #ba68c8;
  margin-bottom: 20px;
  text-shadow: 0 0 8px rgba(186, 104, 200, 0.5);
}

.data-points-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: #3e2765;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
}

.data-points-table th,
.data-points-table td {
  border: 1px solid #673ab7;
  padding: 12px;
  text-align: center;
  color: #e0e0e0;
}

.data-points-table th {
  background-color: #512da8;
  color: white;
  font-weight: bold;
}

.data-points-table tr:nth-child(even) {
  background-color: rgba(62, 39, 101, 0.5);
}

.data-points-table input[type="number"] {
  width: 70px;
  background-color: #6a1b9a;
  color: #e0e0e0;
  border: 1px solid #8e24aa;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
}

.data-points-table input[type="number"]:focus {
  outline: none;
  border-color: #ba68c8;
  box-shadow: 0 0 8px rgba(186, 104, 200, 0.7);
}

.data-points-table button {
  background-color: #e57373;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 8px 12px;
  transition: background-color 0.3s, transform 0.2s;
}

.data-points-table button:hover {
  background-color: #ef5350;
  transform: translateY(-2px);
}

.add-point-btn {
  display: block;
  margin: 15px auto 30px;
  padding: 12px 30px;
  background: linear-gradient(45deg, #4169e1, #673ab7);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.15em;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(65, 105, 225, 0.3);
}

.add-point-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(65, 105, 225, 0.5);
}

.input-section {
  margin: 15px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #3e2765;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
}

.input-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-section label {
  color: #d1c4e9;
  font-weight: bold;
}

.input-section input[type="number"],
.input-section select {
  width: 90px;
  background-color: #6a1b9a;
  color: #e0e0e0;
  border: 1px solid #8e24aa;
  border-radius: 6px;
  padding: 10px;
  font-size: 16px;
  text-align: center;
}

.input-section input[type="number"]:focus,
.input-section select:focus {
  outline: none;
  border-color: #ba68c8;
  box-shadow: 0 0 10px rgba(186, 104, 200, 0.7);
}

.input-section select {
  width: auto;
  padding: 10px;
  cursor: pointer;
}

.calculate-btn,
.reset-btn {
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
}

.calculate-btn:hover,
.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(156, 39, 176, 0.5);
}

.reset-btn {
  background: linear-gradient(45deg, #ff5722, #e64a19);
}

.reset-btn:hover {
  background: linear-gradient(45deg, #e64a19, #d84315);
}

.result-container {
  margin-top: 40px;
  padding: 25px;
  border: 1px solid #673ab7;
  border-radius: 12px;
  background-color: #3e2765;
  box-shadow: 0 0 20px rgba(103, 58, 183, 0.3);
}

.result-container h3,
.result-container h4 {
  color: #d1c4e9;
  margin-bottom: 20px;
}

.result-subtitle {
  color: #ba68c8;
}

.summation-display {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 25px;
  padding: 12px;
  margin-bottom: 15px;
  background-color: #4a148c;
  border-radius: 8px;
  font-family: monospace;
}

.summation-display p {
  margin: 0;
  white-space: nowrap;
}

.equation-scroll {
  overflow-x: auto;
  padding: 10px 0;
}

.matrix-display {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05em;
  font-family: monospace;
  min-width: max-content;
  color: #e0e0e0;
}

.matrix-content {
  display: flex;
  flex-direction: column;
  padding: 0 6px;
}

.matrix-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 2px 0;
}

.matrix-row span {
  min-width: 70px;
  text-align: right;
  padding: 2px 4px;
}

.bracket {
  font-size: 2.6em;
  line-height: 1;
  font-family: serif;
  color: #d1c4e9;
}

.left-bracket,
.right-bracket {
  transform: scaleY(1.4);
  margin: 0 4px;
}

.matrix-symbol {
  font-size: 3em;
  line-height: 1;
  color: #8a2be2;
  margin: 0 10px;
  font-weight: bold;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #e0e0e0;
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 10px;
}

.data-points-table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  background-color: #3e2765;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
}

.data-points-table th,
.data-points-table td {
  border: 1px solid #673ab7;
  padding: 12px;
  text-align: center;
  color: #e0e0e0;
}

.data-points-table th {
  background-color: #512da8;
  color: white;
  font-weight: bold;
}

.data-points-table tr:nth-child(even) {
  background-color: rgba(62, 39, 101, 0.5);
}

.data-points-table input[type="number"] {
  width: 70px;
  background-color: #6a1b9a;
  color: #e0e0e0;
  border: 1px solid #8e24aa;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
}

.data-points-table input[type="number"]:focus {
  outline: none;
  border-color: #ba68c8;
  box-shadow: 0 0 8px rgba(186, 104, 200, 0.7);
}

.data-points-table button {
  background-color: #e57373;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 8px 12px;
  transition: background-color 0.3s, transform 0.2s;
}

.data-points-table button:hover {
  background-color: #ef5350;
  transform: translateY(-2px);
}
</style>