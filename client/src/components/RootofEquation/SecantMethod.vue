<template>
  <div class="secant-page">
    <h1 class="page-title">Secant Method</h1>
    <hr class="page-divider" />
    <div class="content-container">
      <div
        id="calculator-container"
        class="calculator-box"
        style="width: 100%; height: 400px; margin-top: 20px"
      ></div>

      <div class="input-form">
        <div class="form-group">
          <label for="fx">Enter the equation f(x):</label>
          <input type="text" id="fx" v-model="fx" placeholder="เช่น x^2 - 4" />
        </div>
        <div class="form-group">
          <label for="x0">Initial X0:</label>
          <input type="number" id="x0" v-model.number="x0" />
        </div>
        <div class="form-group">
          <label for="x1">Initial X1:</label>
          <input type="number" id="x1" v-model.number="x1" />
        </div>
        <div class="form-group">
          <label for="epsilon">Error (ε):</label>
          <input
            type="number"
            id="epsilon"
            v-model.number="epsilon"
            step="0.00001"
          />
        </div>
        <button type="button" @click="calculateSecant">Calculate</button>
      </div>

      <div v-if="result !== null" class="result-container">
        <h3>Result:</h3>
        <p v-if="isConverged">
          The root of this equation is <b>{{ result.toFixed(6) }}</b>
        </p>
        <p v-else>non-convergent or The equation has no root in the specified interval.</p>
      </div>

      <div v-if="iterations.length > 0" class="iteration-table">
        <h3>The iteration table:</h3>
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th>Xi-1</th>
              <th>Xi</th>
              <th>f(Xi-1)</th>
              <th>f(Xi)</th>
              <th>Error (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, index) in iterations" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ it.x_prev.toFixed(6) }}</td>
              <td>{{ it.xi.toFixed(6) }}</td>
              <td>{{ it.fx_prev.toFixed(6) }}</td>
              <td>{{ it.fxi.toFixed(6) }}</td>
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
  <small class="input-hint">
    <b>Notes:</b> <br />
    <code>exp(x)</code> for <b>e<sup>x</sup></b
    >, <code>sqrt(x)</code> for <b>√x</b>, <code>sin(x)</code> for
    <b>sin(x)</b>, <code>cos(x)</code> for <b>cos(x)</b>,
    <code>log(x)</code> for <b>ln(x)</b>,
    <b><code>pow(x, 1/3)</code> for ∛x</b>
  </small>
</template>

<script>
// โค้ดส่วนนี้ยังคงเดิม ไม่มีการแก้ไข
export default {
  name: "SecantMethod",
  data() {
    return {
      fx: "x**2 - 4",
      x0: 0,
      x1: 2,
      epsilon: 0.0001,
      result: null,
      isConverged: true,
      iterations: [],
      calculator: null,
    };
  },
  mounted() {
    const checkDesmosReady = () => {
      if (window.Desmos) {
        this.initDesmos();
        this.updateDesmosGraph();
      } else {
        setTimeout(checkDesmosReady, 100);
      }
    };
    checkDesmosReady();
  },
  watch: {
    fx() {
      this.updateDesmosGraph();
    },
  },
  methods: {
    initDesmos() {
      const elt = document.getElementById("calculator-container");
      if (elt && window.Desmos && !this.calculator) {
        this.calculator = new window.Desmos.GraphingCalculator(elt);
        this.calculator.setExpression({
          id: "xaxis",
          latex: "y=0",
          color: "#aaa",
          lineWidth: 1,
        });
      }
    },
    updateDesmosGraph() {
      if (this.calculator && this.fx) {
        const latex = "y=" + this.fx.replace(/\*\*/g, "^");
        this.calculator.setExpression({
          id: "graph1",
          latex,
          color: "#007bff",
        });
        this.calculator.removeExpression({ id: "rootPoint" });
      }
    },
    plotRootPoint(root) {
      if (this.calculator) {
        this.calculator.removeExpression({ id: "rootPoint" });
        if (root !== null && !isNaN(root) && isFinite(root)) {
          this.calculator.setExpression({
            id: "rootPoint",
            latex: `(${root}, 0)`,
            color: "#ff0000",
            label: `root: ${root.toFixed(6)}`,
            showLabel: true,
          });
        }
      }
    },
    parseEquation(equationString) {
      try {
        return new Function("x", "with(Math){ return " + equationString + "}");
      } catch (error) {
        console.error("Invalid equation:", error);
        return null;
      }
    },
    calculateSecant() {
      if (!this.fx || typeof this.x0 !== "number" || typeof this.x1 !== "number") {
        alert("Please enter valid inputs");
        return;
      }

      const func = this.parseEquation(this.fx);
      if (!func) {
        alert("Invalid equation");
        return;
      }

      let x_prev = this.x0;
      let xi = this.x1;
      this.iterations = [];
      this.isConverged = true;
      let maxIterations = 100;

      for (let i = 0; i < maxIterations; i++) {
        const fx_prev = func(x_prev);
        const fxi = func(xi);

        const denominator = fxi - fx_prev;
        if (denominator === 0) {
          this.isConverged = false;
          this.result = null;
          alert("Division by zero (f(xi) - f(xi-1) = 0)");
          return;
        }

        const x_new = xi - (fxi * (xi - x_prev)) / denominator;

        let error = null;
        if (x_new !== 0) {
            error = Math.abs((x_new - xi) / x_new) * 100;
        }

        this.iterations.push({
          x_prev,
          xi,
          fx_prev,
          fxi,
          error,
        });

        if (error < this.epsilon) {
          this.result = x_new;
          this.plotRootPoint(x_new);
          return;
        }

        x_prev = xi;
        xi = x_new;
      }

      this.result = xi;
      this.isConverged = false;
      this.plotRootPoint(null);
    },
  },
};
</script>

<style scoped>
/* GALAXY THEME STYLES */
.secant-page {
  background: #000;
  color: #c0c0e0;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  padding: 40px;
}
.page-title {
  text-align: center;
  font-size: 3em;
  color: #fff;
  text-shadow: 0 0 10px #e0e0f0, 0 0 20px #8a2be2;
  margin-top: 0;
}
.page-divider {
  border: 0;
  height: 2px;
  background-image: linear-gradient(to right, transparent, #8a2be2, #4169e1, transparent);
  margin: 20px 0 40px;
}
.content-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #5a5f82;
  border-radius: 8px;
  background-color: rgba(20, 20, 40, 0.8);
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
}
.calculator-box {
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.4), 0 0 10px rgba(65, 105, 225, 0.3);
  padding: 10px;
}
.input-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #b0b0e0;
}
input[type="text"],
input[type="number"] {
  background-color: #1a1a3a;
  color: #fff;
  border: 1px solid #4a4a6e;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}
input[type="text"]:focus,
input[type="number"]:focus {
  outline: none;
  border-color: #8a2be2;
  box-shadow: 0 0 8px rgba(138, 43, 226, 0.5);
}
button {
  background-color: #4169e1;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 12px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
button:hover {
  background-color: #cd4e0f;
  transform: translateY(-2px);
}
.result-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #5a5f82;
  border-radius: 8px;
  background-color: rgba(20, 20, 40, 0.8);
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
}
.result-container h3 {
  margin-top: 0;
  color: #8a2be2;
}
.iteration-table {
  margin-top: 20px;
}
.iteration-table h3 {
  color: #8a2be2;
}
table {
  width: 100%;
  border-collapse: collapse;
  background-color: rgba(20, 20, 40, 0.8);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
}
th,
td {
  border: 1px solid #5a5f82;
  padding: 10px;
  text-align: center;
}
th {
  background-color: #3a3f5a;
  color: #fff;
}
tbody tr:nth-child(even) {
  background-color: rgba(30, 30, 60, 0.7);
}
</style>