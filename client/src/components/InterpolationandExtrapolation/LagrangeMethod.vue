<template>
  <div class="lagrange-page">
    <h1 class="page-title">Lagrange Interpolation Method</h1>
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

        <div class="result-section">
          <h4>Summary</h4>
          <p class="mono">
            f({{ targetX !== null ? targetX : "—" }}) =
            <strong v-if="result !== null">{{ result }}</strong>
            <span v-else>— (No Target x)</span>
          </p>
          <p class="mono">
            Lagrange form: P(x) = Σ yᵢ·Lᵢ(x)
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
              <tr><th>i</th><th>x</th><th>y</th></tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in resultData.selected" :key="'pt'+i">
                <td>{{ i+1 }}</td>
                <td class="mono">{{ fmt(p.x) }}</td>
                <td class="mono">{{ fmt(p.y) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="result-section">
          <h4>Lagrange contributions at x*</h4>
          <table class="result-table">
            <thead>
              <tr>
                <th>i</th>
                <th>yᵢ</th>
                <th>Formula Lᵢ(x)</th>
                <th>Lᵢ(x*)</th>
                <th>yᵢ·Lᵢ(x*)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in resultData.basisRows" :key="'b'+i">
                <td>{{ i }}</td>
                <td class="mono">{{ fmt(resultData.selected[i].y) }}</td>
                <td class="mono wrap">{{ row.liFormula }}</td>
                <td class="mono">{{ row.liAtXstar === null ? "—" : fmt(row.liAtXstar) }}</td>
                <td class="mono"><strong>{{ row.contrib === null ? "—" : fmt(row.contrib) }}</strong></td>
              </tr>
              <tr>
                <td colspan="4"><strong>Total</strong></td>
                <td class="mono"><strong>{{ result }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LagrangeInterpolation",
  data() {
    return {
      points: [
        { x: 0, y: 0, selected: false },
        { x: 0, y: 0, selected: false },
      ],
      decimal: 6,
      targetX: null,
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
        { x: 0, y: 0, selected: false },
      ];
      this.result = null;
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
      for (let i = 0; i < n; i++) res[i] = (a[i] || 0) + (b[i] || 0);
      return res;
    },
    polyToString(coeffs) {
      const terms = [];
      for (let k = coeffs.length - 1; k >= 0; k--) {
        const c = coeffs[k];
        if (Math.abs(c) < 1e-12) continue;
        const cs = this.fmt(c);
        if (k === 0) terms.push(`${cs}`);
        else if (k === 1) terms.push(`${cs}*x`);
        else terms.push(`${cs}*x^${k}`);
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

      const basisRows = [];
      let px = 0;
      const hasTarget = this.targetX !== null && !Number.isNaN(this.targetX);

      let power = Array(n).fill(0);

      for (let i = 0; i < n; i++) {
        let den = 1;
        const formulaParts = [];
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            den *= (x[i] - x[j]);
            formulaParts.push(`(x-${x[j]})/(${x[i]}-${x[j]})`);
          }
        }
        const liFormula = `L${i}(x) = ${formulaParts.join(" * ")}`;

        let liAtXstar = null, contrib = null;
        if (hasTarget) {
          let num = 1;
          for (let j = 0; j < n; j++) {
            if (i !== j) num *= (this.targetX - x[j]);
          }
          liAtXstar = num / den;
          contrib = y[i] * liAtXstar;
          px += contrib;
        }

        basisRows.push({ liFormula, liAtXstar, contrib });

        let basis = [1];
        for (let j = 0; j < n; j++) {
          if (i !== j) basis = this.polyMul(basis, [-x[j], 1]);
        }
        const scale = y[i] / den;
        basis = basis.map((c) => c * scale);
        power = this.polyAdd(power, basis);
      }

      this.result = hasTarget ? this.fmt(px) : null;
      const powerPoly = this.polyToString(power);
      this.resultData = {
        selected: selected.map((p) => ({ x: p.x, y: p.y })),
        basisRows,
        powerPoly,
      };
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.lagrange-page {
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

h3, h4 {
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
  color: rgb(154, 47, 47);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 8px 12px;
  transition: background-color 0.3s, transform 0.2s;
}

.data-points-table button:hover {
  background-color: #d5c6c6;
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

.result-section {
  padding: 15px;
  background-color: #4a148c;
  border: 1px solid #673ab7;
  border-radius: 8px;
  margin-bottom: 20px;
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
</style>