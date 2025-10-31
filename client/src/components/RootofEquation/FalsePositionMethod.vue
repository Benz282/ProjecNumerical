<template>
  <div class="false-position-page">
    <h1 class="page-title">False-Position Method</h1>
    <hr class="page-divider" />
    <div class="content-container">
      <div
        id="calculator-container"
        class="calculator-box"
        style="width: 100%; height: 400px; margin-top: 20px"
      ></div>
      <div class="input-form">
        <div class="form-group">
          <label for="equation">Enter the equation f(x):</label>
          <input
            type="text"
            id="equation"
            v-model="equation"
            placeholder="x**2 - 4"
          />
        </div>
        <div class="form-group">
          <label for="a">Initail Xl:</label>
          <input type="number" id="a" v-model.number="a" />
        </div>
        <div class="form-group">
          <label for="b">Initail Xr:</label>
          <input type="number" id="b" v-model.number="b" />
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
        <button type="button" @click="calculateFalsePosition">Calculate</button>
      </div>

      <div v-if="result !== null" class="result-container">
        <h3>Result:</h3>
        <p v-if="isConverged">
          The root of this equation is <b>{{ result.toFixed(6) }}</b>
        </p>
        <p v-else>
          non-convergent or The equation has no root in the specified interval.
        </p>
      </div>

      <div v-if="iterations.length > 0" class="iteration-table">
        <h3>The iteration table:</h3>
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th>Xl</th>
              <th>Xr</th>
              <th>Xm</th>
              <th>f(Xm)</th>
              <th>Error (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, index) in iterations" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ it.a.toFixed(6) }}</td>
              <td>{{ it.b.toFixed(6) }}</td>
              <td>{{ it.p.toFixed(6) }}</td>
              <td>{{ it.fp.toFixed(6) }}</td>
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
  name: "FalsePositionMethod",
  data() {
    return {
      equation: "x**2 - 4",
      a: 1,
      b: 3,
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
    equation() {
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
          color: "#666",
          lineWidth: 1,
        });
      }
    },
    updateDesmosGraph() {
      if (this.calculator && this.equation) {
        const latex = "y=" + this.equation.replace(/\*\*/g, "^");
        this.calculator.setExpression({
          id: "graph1",
          latex,
          color: "#007bff",
        });
        this.calculator.removeExpression({ id: "rootPoint" });
      } else if (this.calculator) {
        this.calculator.removeExpression({ id: "graph1" });
        this.calculator.removeExpression({ id: "rootPoint" });
      }
    },
    plotRootPoint(root) {
      if (this.calculator) {
        this.calculator.removeExpression({ id: "rootPoint" });
        if (root !== null && !isNaN(root)) {
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
    calculateFalsePosition() {
      if (
        !this.equation ||
        typeof this.a !== "number" ||
        typeof this.b !== "number"
      ) {
        alert("Please enter valid inputs");
        return;
      }

      const func = this.parseEquation(this.equation);
      if (!func) {
        alert("Your equation is invalid! Please check again.");
        return;
      }

      let a = this.a;
      let b = this.b;
      let fa = func(a);
      let fb = func(b);
      let p, fp;
      let prevP = null;

      this.isConverged = true;
      this.iterations = [];

      this.plotRootPoint(null);
      this.updateDesmosGraph();

      if (fa * fb >= 0) {
        this.result = null;
        this.isConverged = false;
        alert(
          "The function must have differnt signs at the endpoints a and b."
        );
        return;
      }

      let maxIterations = 100;
      for (let i = 0; i < maxIterations; i++) {
        p = a - (fa * (b - a)) / (fb - fa);
        fp = func(p);

        let error = null;
        if (prevP !== null && p !== 0) {
          error = Math.abs((p - prevP) / p) * 100;
        }

        this.iterations.push({
          a: a,
          b: b,
          p: p,
          fp: fp,
          error: error,
        });

        if (
          Math.abs(fp) < this.epsilon ||
          (error !== null && error < this.epsilon)
        ) {
          this.result = p;
          this.plotRootPoint(p);
          return;
        }

        if (fa * fp < 0) {
          b = p;
          fb = fp;
        } else {
          a = p;
          fa = fp;
        }
        prevP = p;
      }

      this.result = p;
      this.isConverged = false;
      this.plotRootPoint(null);
    },
  },
};
</script>

<style scoped>
/* GALAXY THEME STYLES */
.false-position-page {
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