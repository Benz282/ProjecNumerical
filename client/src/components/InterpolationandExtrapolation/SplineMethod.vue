<template>
  <div class="spline-page">
    <h1 class="page-title">Spline Interpolation Method</h1>
    <hr class="page-divider" />
    <div class="content-container">
      <h3>Data Points</h3>
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
            <td><input type="number" v-model.number="point.x" step="any" /></td>
            <td><input type="number" v-model.number="point.y" step="any" /></td>
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
          <input type="number" v-model.number="targetX" step="any" />
        </div>
      </div>

      <div class="input-section">
        <div class="input-item">
          <label>Method:</label>
          <select v-model="method">
            <option value="linear">Linear Spline</option>
            <option value="quadratic">Quadratic Spline (Natural)</option>
            <option value="cubic">Cubic Spline (Natural)</option>
          </select>
        </div>
        <div class="method-info">
          <small v-if="method === 'linear'">Linear spline: Connects points with straight lines.</small>
          <small v-else-if="method === 'quadratic'">Quadratic spline: natural condition $S''(x_0)=0$</small>
          <small v-else-if="method === 'cubic'">Cubic spline: natural condition $S''(x_0)=S''(x_n)=0$</small>
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
        <p>
          Interpolated Segment: S<sub>{{ segmentIndex }}</sub
          >(x) on [{{ segmentRange[0] }}, {{ segmentRange[1] }}]
        </p>
        <p>f({{ targetX }}) = {{ result }}</p>

        <h4 class="piece-title">Piece coefficients for each segment:</h4>
        <div v-if="method === 'linear'">
          <div v-for="(seg, i) in pieces" :key="i" class="piece-section">
            <p>
              <strong>Segment {{ i }}:</strong> S<sub>{{ i }}</sub
              >(x) = {{ seg.a }} + {{ seg.m }}*(x-{{ seg.x0 }}) &nbsp; on [{{
                seg.x0
              }}, {{ seg.x1 }}]
            </p>
          </div>
        </div>

        <div v-else-if="method === 'quadratic'">
          <div v-for="(seg, i) in pieces" :key="i" class="piece-section">
            <p>
              <strong>Segment {{ i }}:</strong> S<sub>{{ i }}</sub
              >(x) = {{ seg.a }} + {{ seg.b }}*(x-{{ seg.x0 }}) +
              {{ seg.c }}*(x-{{ seg.x0 }})^2 &nbsp; on [{{ seg.x0 }},
              {{ seg.x1 }}]
            </p>
          </div>
        </div>

        <div v-else-if="method === 'cubic'">
          <div v-for="(seg, i) in pieces" :key="i" class="piece-section">
            <p>
              <strong>Segment {{ i }}:</strong>
            </p>
            <pre style="white-space: pre-wrap">
S{{ i }}(x) = {{ seg.A }}*(x-{{ seg.x0 }})^3 + {{ seg.B }}*(x-{{
                seg.x0
              }})^2 + {{ seg.C }}*(x-{{ seg.x0 }}) + {{ seg.D }} on [{{
                seg.x0
              }}, {{ seg.x1 }}]</pre
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
function zeros(n) {
  return Array.from({ length: n }, () => 0);
}
function solveLinear(A, b) {
  const n = A.length;
  A = A.map((row) => row.slice());
  b = b.slice();
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    if (Math.abs(A[maxRow][i]) < 1e-12) {
      continue;
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];
    for (let k = i + 1; k < n; k++) {
      const c = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) A[k][j] -= c * A[i][j];
      b[k] -= c * b[i];
    }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = Math.abs(A[i][i]) < 1e-12 ? 0 : s / A[i][i];
  }
  return x;
}
function solveTridiagonal(L, D, U, b) {
  const n = D.length;
  const cp = Array(n).fill(0);
  const dp = Array(n).fill(0);
  if (n === 0) return [];
  cp[0] = U[0] / D[0];
  dp[0] = b[0] / D[0];
  for (let i = 1; i < n; i++) {
    const denom = D[i] - L[i - 1] * cp[i - 1];
    if (Math.abs(denom) < 1e-12) {
      return zeros(n);
    }
    cp[i] = i < n - 1 ? U[i] / denom : 0;
    dp[i] = (b[i] - L[i - 1] * dp[i - 1]) / denom;
  }
  const x = Array(n).fill(0);
  x[n - 1] = dp[n - 1];
  for (let i = n - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
  return x;
}
export default {
  name: "QuadraticCubicNaturalSpline",
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
      result: null,
      pieces: [],
      segmentIndex: null,
      segmentRange: [null, null],
    };
  },
  computed: {
    minPoints() {
      return this.method === "cubic" ? 3 : 2;
    },
    methodLabel() {
      if (this.method === "linear") return "Linear Spline";
      return this.method === "cubic"
        ? "Cubic Spline (Natural)"
        : "Quadratic Spline (Natural)";
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
      this.pieces = [];
      this.segmentIndex = null;
      this.segmentRange = [null, null];
    },

    validateAndPrep() {
      const pts = this.points.slice().sort((a, b) => a.x - b.x);
      const n = pts.length;
      if (n < this.minPoints) {
        alert(
          `Need at least ${this.minPoints} points for ${this.method} spline.`
        );
        return null;
      }
      const x = pts.map((p) => p.x);
      const y = pts.map((p) => p.y);
      const setx = new Set(x);
      if (setx.size !== x.length) {
        alert("Duplicate x values not allowed.");
        return null;
      }
      if (this.targetX === null || typeof this.targetX === "undefined") {
        alert("Enter target x");
        return null;
      }
      let k = -1;
      for (let i = 0; i < n - 1; i++) {
        if (this.targetX >= x[i] && this.targetX <= x[i + 1]) {
          k = i;
          break;
        }
      }
      if (k === -1) {
        alert("targetX outside data range");
        return null;
      }
      const h = [];
      for (let i = 0; i < n - 1; i++) h.push(x[i + 1] - x[i]);
      return { n, x, y, h, k, pts };
    },
    calculateLinear({ n, x, y, h, k }) {
      const m = n - 1;
      const pieces = [];
      for (let i = 0; i < m; i++) {
        const h_i = h[i];
        const slope = (y[i + 1] - y[i]) / h_i;
        pieces.push({
          x0: x[i],
          x1: x[i + 1],
          a: Number(y[i].toFixed(this.decimal)),
          m: Number(slope.toFixed(this.decimal)),
        });
      }
      const seg = pieces[k];
      const dx = this.targetX - seg.x0;
      const Sx = seg.a + seg.m * dx;
      return { Sx, pieces };
    },
    calculateQuadratic({ n, x, y, h, k }) {
      const m = n - 1;
      const N = 2 * m;
      const A = Array.from({ length: N }, () => Array(N).fill(0));
      const rhs = Array(N).fill(0);
      for (let i = 0; i < m; i++) {
        A[i][i] = h[i];
        A[i][m + i] = h[i] * h[i];
        rhs[i] = y[i + 1] - y[i];
      }
      for (let j = 1; j < m; j++) {
        const idx = m + (j - 1);
        A[idx][j] = 1;
        A[idx][j - 1] = -1;
        A[idx][m + (j - 1)] = -2 * h[j - 1];
        rhs[idx] = 0;
      }
      if (m > 0) {
        A[N - 1][m + 0] = 1;
        rhs[N - 1] = 0;
      }
      const sol = solveLinear(A, rhs);
      const b_coeffs = sol.slice(0, m);
      const c_coeffs = sol.slice(m, m + m);
      const pieces = [];
      for (let i = 0; i < m; i++) {
        const a = y[i];
        pieces.push({
          x0: x[i],
          x1: x[i + 1],
          a: Number(a.toFixed(this.decimal)),
          b: Number(b_coeffs[i].toFixed(this.decimal)),
          c: Number(c_coeffs[i].toFixed(this.decimal)),
        });
      }
      const seg = pieces[k];
      const dx = this.targetX - seg.x0;
      const Sx = seg.a + seg.b * dx + seg.c * dx * dx;
      return { Sx, pieces };
    },
    calculateCubic({ n, x, y, h, k }) {
      const m = n - 2;
      let M = Array(n).fill(0);
      if (m > 0) {
        const L = [],
          D = [],
          U = [],
          rhs = [];
        for (let i = 1; i < n - 1; i++) {
          if (i > 1) L.push(h[i - 1]);
          D.push(2 * (h[i - 1] + h[i]));
          if (i < n - 2) U.push(h[i]);
          const val =
            6 * ((y[i + 1] - y[i]) / h[i] - (y[i] - y[i - 1]) / h[i - 1]);
          rhs.push(val);
        }
        const M_inner = solveTridiagonal(L, D, U, rhs);
        for (let i = 1; i < n - 1; i++) M[i] = M_inner[i - 1];
      }
      const pieces = [];
      for (let i = 0; i < n - 1; i++) {
        const h_i = h[i];
        const Mi = M[i],
          Mi1 = M[i + 1];
        const yi = y[i],
          yi1 = y[i + 1];
        const a3 = (Mi1 - Mi) / (6 * h_i);
        const a2 = Mi / 2;
        const a1 = (yi1 - yi) / h_i - (h_i * (2 * Mi + Mi1)) / 6;
        const a0 = yi;
        pieces.push({
          x0: x[i],
          x1: x[i + 1],
          A: Number(a3.toFixed(this.decimal)),
          B: Number(a2.toFixed(this.decimal)),
          C: Number(a1.toFixed(this.decimal)),
          D: Number(a0.toFixed(this.decimal)),
        });
      }
      const seg = pieces[k];
      const t = this.targetX - seg.x0;
      const Sx = seg.A * t * t * t + seg.B * t * t + seg.C * t + seg.D;
      return { Sx, pieces, M };
    },
    calculate() {
      const data = this.validateAndPrep();
      if (!data) {
        this.result = null;
        return;
      }
      let res;
      if (this.method === "linear") {
        res = this.calculateLinear(data);
      } else if (this.method === "quadratic") {
        res = this.calculateQuadratic(data);
      } else if (this.method === "cubic") {
        res = this.calculateCubic(data);
      } else {
        return;
      }
      this.pieces = res.pieces;
      this.result = Number(res.Sx).toFixed(this.decimal);
      this.segmentIndex = data.k;
      this.segmentRange = [data.x[data.k], data.x[data.k + 1]];
    },
  },
  mounted() {
    this.points.sort((a, b) => a.x - b.x);
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.spline-page {
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

.input-section select {
  padding: 10px;
  background-color: #3e2765;
  border: 1px solid #673ab7;
  color: #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
}

.input-section select:focus {
  outline: none;
  border-color: #ba68c8;
  box-shadow: 0 0 10px rgba(186, 104, 200, 0.7);
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

.piece-section {
  padding: 15px;
  background-color: #4a148c;
  border: 1px solid #673ab7;
  border-radius: 8px;
  margin-bottom: 20px;
}

.piece-section p {
  color: #e0e0e0;
  line-height: 1.6;
}

.piece-title {
  color: #ba68c8;
}

pre {
  color: #e0e0e0;
}
</style>