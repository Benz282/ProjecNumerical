<template>
  <div class="newton-page">
    <h1 class="page-title">Newton Divided Difference</h1>
    <hr class="page-divider" />
    <div class="content-container">
      <h3>Data Points</h3>
      <table class="data-points-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>X</th>
            <th>Y(fx)</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(point, i) in points" :key="i">
            <td><input type="checkbox" v-model="point.selected" /></td>
            <td><input type="number" v-model.number="point.x" /></td>
            <td><input type="number" v-model.number="point.y" /></td>
            <td><button @click="removePoint(i)">❌</button></td>
          </tr>
        </tbody>
      </table>

      <button @click="addPoint" class="add-point-btn">+ Add Point</button>

      <div class="input-section">
        <div class="input-item">
          <label>Decimal places:</label>
          <input type="number" v-model.number="decimal" min="0" max="10" />
        </div>
        <div class="input-item">
          <label>Target x:</label>
          <input type="number" v-model.number="targetX" />
        </div>

        <button @click="calculate" class="calculate-btn">Calculate</button>
        <button @click="reset" class="reset-btn">Reset</button>
      </div>

      <div v-if="resultData" class="result-container">
        <h3>Result</h3>

        <div class="result-grid">
          <div class="result-section">
            <h4>Summary:</h4>
            <p class="mono">
              f({{ targetX !== null ? targetX : "—" }}) =
              <strong v-if="result !== null">{{ result }}</strong>
              <span v-else>— (No Target x)</span>
            </p>
            <p class="mono">
              Newton form: P(x) =
              <span class="wrap">{{ polynomial }}</span>
            </p>
            <p class="mono" v-if="resultData.powerPoly">
              Expanded (power basis): P(x) =
              <span class="wrap">{{ resultData.powerPoly }}</span>
            </p>
          </div>

          <div class="result-section">
            <h4>Points used ({{ resultData.selected.length }})</h4>
            <table class="result-table">
              <thead>
                <tr>
                  <th>i</th>
                  <th>x</th>
                  <th>y</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in resultData.selected" :key="'pt' + i">
                  <td>{{ i + 1 }}</td>
                  <td class="mono">{{ fmt(p.x) }}</td>
                  <td class="mono">{{ fmt(p.y) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="result-section">
            <h4>Divided-difference coefficients c<sub>k</sub></h4>
            <ul class="mono tight">
              <li v-for="(c, i) in resultData.coef" :key="'c' + i">
                c{{ i }} = {{ fmt(c) }}
              </li>
            </ul>
          </div>

          <div class="table-scroll result-section">
            <h4>Divided Difference Table</h4>
            <table class="result-table">
              <thead>
                <tr>
                  <th>i</th>
                  <th>x<sub>i</sub></th>
                  <th>f[x<sub>i</sub>]</th>
                  <th v-for="j in resultData.n - 1" :key="'head' + j">
                    Δ<sup>{{ j }}</sup>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in resultData.ddRows" :key="'dd' + i">
                  <td>{{ i }}</td>
                  <td class="mono">{{ fmt(row.x) }}</td>
                  <td class="mono">{{ fmt(row.cols[0]) }}</td>
                  <td
                    v-for="(val, j) in row.cols.slice(1)"
                    :key="'col' + i + '-' + j"
                    class="mono"
                  >
                    {{ val === null ? "" : fmt(val) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="resultData.evalSteps && resultData.evalSteps.length"
            class="result-section"
          >
            <h4>Evaluation steps (nested form)</h4>
            <ol class="mono tight">
              <li v-for="(st, k) in resultData.evalSteps" :key="'st' + k">
                p = c{{ st.i }} + (x* − x{{ st.i }})·p = {{ fmt(st.c) }} + ({{
                  fmt(st.xstarMinusXi)
                }})·{{ fmt(st.prev) }} =
                <strong>{{ fmt(st.next) }}</strong>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewtonDivided",
  data() {
    return {
      points: [
        { x: 0, y: 0, selected: false },
        { x: 1, y: 0, selected: false },
      ],
      decimal: 6,
      targetX: null,
      polynomial: "",
      result: null,
      resultData: null,
    };
  },
  methods: {
    addPoint() {
      this.points.push({ x: 0, y: 0, selected: false });
    },
    removePoint(i) {
      this.points.splice(i, 1);
    },
    reset() {
      this.points = [
        { x: 0, y: 0, selected: false },
        { x: 1, y: 0, selected: false },
      ];
      this.result = null;
      this.polynomial = "";
      this.targetX = null;
      this.resultData = null;
    },
    fmt(v) {
      return Number(v).toFixed(this.decimal);
    },
    polyMul(a, b) {
      const res = Array(a.length + b.length - 1).fill(0);
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
          res[i + j] += a[i] * b[j];
        }
      }
      return res;
    },
    polyAdd(a, b) {
      const n = Math.max(a.length, b.length);
      const res = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        res[i] = (a[i] || 0) + (b[i] || 0);
      }
      return res;
    },
    polyToString(coeffs) {
      const terms = [];
      for (let k = coeffs.length - 1; k >= 0; k--) {
        const c = coeffs[k];
        const isZeroish = Math.abs(c) < 1e-12;
        if (isZeroish) continue;
        const coefStr = this.fmt(c);
        if (k === 0) {
          terms.push(`${coefStr}`);
        } else if (k === 1) {
          terms.push(`${coefStr}*x`);
        } else {
          terms.push(`${coefStr}*x^${k}`);
        }
      }
      return terms.length ? terms.join(" + ") : "0";
    },
    calculate() {
      let selected = this.points.filter((p) => p.selected);
      if (selected.length === 0) selected = this.points;
      if (selected.length < 2) {
        alert("Please select at least two points.");
        return;
      }
      const n = selected.length;
      const x = selected.map((p) => p.x);
      const y = selected.map((p) => p.y);
      const xSet = new Set(x);
      if (xSet.size !== x.length) {
        alert("Duplicate x values are not allowed.");
        return;
      }
      const dd = Array.from({ length: n }, () => Array(n).fill(null));
      for (let i = 0; i < n; i++) dd[i][0] = y[i];
      for (let i = 1; i < n; i++) {
        for (let j = 1; j <= i; j++) {
          dd[i][j] = (dd[i][j - 1] - dd[i - 1][j - 1]) / (x[i] - x[i - j]);
        }
      }
      const coef = Array.from({ length: n }, (_, k) => dd[k][k]);
      const terms = [`${this.fmt(coef[0])}`];
      for (let i = 1; i < n; i++) {
        let term = this.fmt(coef[i]);
        for (let j = 0; j < i; j++) term += `*(x-${x[j]})`;
        terms.push(term);
      }
      this.polynomial = terms.join(" + ");
      let power = Array(n).fill(0);
      let basis = [1];
      for (let k = 0; k < n; k++) {
        power = this.polyAdd(power, basis.map((v) => v * coef[k]));
        basis = this.polyMul(basis, [-x[k], 1]);
      }
      const powerPoly = this.polyToString(power);
      let evalSteps = [];
      let px = null;
      if (this.targetX !== null && !Number.isNaN(this.targetX)) {
        px = coef[n - 1];
        for (let i = n - 2; i >= 0; i--) {
          const prev = px;
          const xstarMinusXi = this.targetX - x[i];
          px = coef[i] + xstarMinusXi * px;
          evalSteps.push({
            i,
            c: coef[i],
            prev,
            xstarMinusXi,
            next: px,
          });
        }
        this.result = this.fmt(px);
        evalSteps = evalSteps.reverse();
      } else {
        this.result = null;
        evalSteps = [];
      }
      const ddRows = x.map((xi, i) => ({
        x: xi,
        cols: dd[i],
      }));
      this.resultData = {
        n,
        selected: selected.map((p) => ({ x: p.x, y: p.y })),
        coef,
        ddRows,
        powerCoeffs: power,
        powerPoly,
        evalSteps,
      };
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.newton-page {
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
  background-color: #dc2424;
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

.input-section input[type="number"] {
  width: 90px;
  background-color: #6a1b9a;
  color: #e0e0e0;
  border: 1px solid #8e24aa;
  border-radius: 6px;
  padding: 10px;
  font-size: 16px;
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

.result-container h3 {
  color: #d1c4e9;
  margin-bottom: 20px;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .result-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.result-section {
  padding: 15px;
  background-color: #4a148c;
  border: 1px solid #673ab7;
  border-radius: 8px;
}

.result-section h4 {
  margin-top: 0;
  color: #ba68c8;
  border-bottom: 1px solid #673ab7;
  padding-bottom: 5px;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background-color: #4a148c;
  border-radius: 10px;
  overflow: hidden;
}

.result-table th,
.result-table td {
  border: 1px solid #6a1b9a;
  padding: 12px;
  text-align: center;
  color: #e0e0e0;
}

.result-table th {
  background-color: #673ab7;
  color: white;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.result-table tr:hover {
  background-color: rgba(103, 58, 183, 0.2);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #e0e0e0;
}

.wrap {
  word-break: break-all;
  white-space: pre-wrap;
}

.tight {
  padding: 0;
  list-style-type: none;
}
</style>