<template>
  <div class="gauss-page">
    <h1 class="page-title">Gaussian Integration Method</h1>
    <hr class="page-divider" />
    <div class="content-container">
      <div class="input-section">
        <div class="input-item">
          <label>Begin:</label>
          <input type="number" v-model.number="a" />
        </div>

        <div class="input-item">
          <label>End:</label>
          <input type="number" v-model.number="b" />
        </div>

        <div class="input-row">
          <label>Equation:</label>
          <div class="equation-wrapper">
            <input type="text" v-model="fx" placeholder="x^2 + 3*x + 1" />
            <div class="preview" ref="preview"></div>
          </div>
        </div>
      </div>

      <div class="input-section">
        <div class="input-item">
          <label>Number of Points (n):</label>
          <input type="number" v-model.number="n" min="2" max="5" />
        </div>
      </div>

      <div class="input-section-buttons">
        <button @click="calculate">Calculate</button>
        <button @click="reset" class="reset-btn">Reset</button>
      </div>

      <div v-if="result !== null" class="result-container">
        <h3>Result:</h3>
        <p class="result-eq-line">
          I = ∫<sub>{{ a }}</sub><sup>{{ b }}</sup> f(x) dx
        </p>
        <p><b>Exact:</b> {{ exact }}</p>
        <p><b>Approximation:</b> {{ result }}</p>
        <p><b>Error (%):</b> {{ relError }}</p>
        <p class="result-eq-line"><b>Equation:</b> ( (b - a)/2 ) × Σ [ w<sub>i</sub> · f(x<sub>i</sub>) ]</p>

        <div class="steps">
          <h4>Steps:</h4>
          <p class="step-eq">
            Transformation formula: <br />
            x = ( (b - a)/2 )·t + ( (b + a)/2 ) , where t ∈ [-1, 1]
          </p>

          <table class="steps-table">
            <thead>
              <tr>
                <th>tᵢ</th>
                <th>wᵢ</th>
                <th>xᵢ</th>
                <th>f(xᵢ)</th>
                <th>wᵢ·f(xᵢ)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in tableData" :key="i">
                <td>{{ row.t }}</td>
                <td>{{ row.w }}</td>
                <td>{{ row.x }}</td>
                <td>{{ row.fx }}</td>
                <td>{{ row.term }}</td>
              </tr>
            </tbody>
          </table>

          <p>
            Final Result: I ≈ {{ result }}
          </p>
        </div>
      </div>
    </div>
    <small class="input-hint">
      <b>Notes:</b> <br />
      Supports Gaussian Quadrature up to 5 points<br />
      Functions: <code>exp(x)</code>, <code>sqrt(x)</code>, <code>sin(x)</code>,
      <code>log(x)</code> (mathjs syntax)
    </small>
  </div>
</template>

<script>
import { evaluate } from "mathjs";

export default {
  name: "GaussMethod",
  data() {
    return {
      a: 0,
      b: 1,
      fx: "sin(x)",
      n: 2,
      result: null,
      exact: null,
      relError: null,
      steps: [],
      tableData: [],
    };
  },
  computed: {
    latexExpr() {
      let expr = this.fx.replace(/\*\*/g, "^");
      expr = expr.replace(/sqrt\((.*?)\)/g, "\\sqrt[ $1 ]");
      expr = expr.replace(/exp\((.*?)\)/g, "e^[ $1 ]");
      expr = expr.replace(/sin\((.*?)\)/g, "\\sin[ $1 ]");
      expr = expr.replace(/cos\((.*?)\)/g, "\\cos[ $1 ]");
      expr = expr.replace(/tan\((.*?)\)/g, "\\tan[ $1 ]");
      expr = expr.replace(/log\((.*?)\)/g, "\\log[ $1 ]}");
      expr = expr.replace(/ln\((.*?)\)/g, "\\ln[ $1 ]}");
      return `I = \\∫{${this.a}} to {${this.b}} [${expr}]\\, dx`;
      
    },
  },
  mounted() {
    this.renderMath();
  },
  watch: {
    a() {
      this.renderMath();
    },
    b() {
      this.renderMath();
    },
    fx() {
      this.renderMath();
    },
  },
  methods: {
    renderMath() {
      if (this.$refs.preview) {
        this.$refs.preview.innerHTML = `\\(${this.latexExpr}\\)`;
        if (window.MathJax) {
          window.MathJax.typesetClear([this.$refs.preview]);
          window.MathJax.typesetPromise([this.$refs.preview]);
        }
      }
    },
    f(x) {
      try {
        const expr = this.fx.replace(/\*\*/g, "^");
        const val = evaluate(expr, { x });
        if (isNaN(val)) throw new Error("Invalid expression");
        return val;
      } catch (err) {
        alert("Invalid equation format. Please check your input.");
        throw err;
      }
    },
    getExact() {
      const N = 10000;
      const h = (this.b - this.a) / N;
      let sum = this.f(this.a) + this.f(this.b);
      for (let i = 1; i < N; i++) {
        sum += 2 * this.f(this.a + i * h);
      }
      return (h / 2) * sum;
    },
    getGaussCoeffs(n) {
      switch (n) {
        case 2:
          return { x: [-0.5773502692, 0.5773502692], w: [1, 1] };
        case 3:
          return {
            x: [-0.7745966692, 0, 0.7745966692],
            w: [0.5555555556, 0.8888888889, 0.5555555556],
          };
        case 4:
          return {
            x: [-0.8611363116, -0.3399810436, 0.3399810436, 0.8611363116],
            w: [0.3478548451, 0.6521451549, 0.6521451549, 0.3478548451],
          };
        case 5:
          return {
            x: [-0.9061798459, -0.5384693101, 0, 0.5384693101, 0.9061798459],
            w: [
              0.2369268851, 0.4786286705, 0.5688888889, 0.4786286705,
              0.2369268851,
            ],
          };
        default:
          throw new Error("Only supports n = 2 to 5");
      }
    },
    calculate() {
      this.steps = [];
      this.tableData = [];
      let coeffs;
      try {
        coeffs = this.getGaussCoeffs(this.n);
      } catch (err) {
        alert(err.message);
        return;
      }
      const c1 = (this.b - this.a) / 2;
      const c2 = (this.b + this.a) / 2;
      let approx = 0;
      for (let i = 0; i < this.n; i++) {
        const ti = coeffs.x[i];
        const wi = coeffs.w[i];
        const xi = c1 * ti + c2;
        const fxi = this.f(xi);
        const term = wi * fxi;
        this.steps.push(
          `t${i} = ${ti.toFixed(6)}, w${i} = ${wi.toFixed(6)}, x${i} = ${xi.toFixed(6)}, f(x${i}) = ${fxi.toFixed(6)}, w${i}*f(x${i}) = ${term.toFixed(6)}`
        );
        this.tableData.push({
          t: ti.toFixed(6),
          w: wi.toFixed(6),
          x: xi.toFixed(6),
          fx: fxi.toFixed(6),
          term: term.toFixed(6),
        });
        approx += term;
      }
      approx *= c1;
      this.result = approx.toFixed(6);
      const exactVal = this.getExact();
      this.exact = exactVal.toFixed(6);
      const relErr = (Math.abs(exactVal - approx) / Math.abs(exactVal)) * 100;
      this.relError = relErr.toFixed(4) + "%";
      this.renderMath();
    },
    reset() {
      this.a = 0;
      this.b = 1;
      this.fx = "sin(x)";
      this.n = 2;
      this.result = null;
      this.exact = null;
      this.relError = null;
      this.steps = [];
      this.tableData = [];
      this.renderMath();
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.gauss-page {
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

.input-section {
  margin: 15px 0;
  display: flex;
  flex-wrap: wrap;
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

.input-section input[type="text"],
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

.input-section input[type="text"]:focus,
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

.input-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-top: 10px;
  width: 100%;
}

.equation-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.equation-wrapper input {
  width: 100%;
  text-align: left;
}

.preview {
  margin-top: 8px;
  font-size: 1.6em;
  font-style: italic;
  color: #e0e0e0;
  min-height: 40px;
  background-color: #4a148c;
  border: 1px solid #673ab7;
  border-radius: 5px;
  padding: 8px;
  box-shadow: 0 0 5px rgba(138, 43, 226, 0.3);
}

.input-section-buttons {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 20px;
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
}

button:hover {
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

.result-container p {
  line-height: 1.6;
  margin-bottom: 15px;
}

.result-container p b {
  color: #fff;
}

.result-eq-line {
  font-family: monospace;
  font-size: 1.1em;
}

.steps {
  margin-top: 25px;
  padding: 20px;
  background-color: #4a148c;
  border: 1px dashed #673ab7;
  border-radius: 8px;
}

.steps h4 {
  color: #ba68c8;
  margin-top: 0;
  border-bottom: 1px solid #673ab7;
  padding-bottom: 5px;
}

.step-eq {
  font-family: monospace;
  white-space: pre-wrap;
}

.steps-table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  background-color: #4a148c;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
}

.steps-table th,
.steps-table td {
  border: 1px solid #6a1b9a;
  padding: 12px;
  text-align: center;
  font-family: monospace;
  color: #e0e0e0;
}

.steps-table th {
  background-color: #512da8;
  color: white;
}

.input-hint {
  display: block;
  margin-top: 20px;
  text-align: center;
  color: #d1c4e9;
  font-size: 0.9em;
}

.input-hint b {
  color: #fff;
}
</style>