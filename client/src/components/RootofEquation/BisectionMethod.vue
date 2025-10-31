<template>
  <div class="bisection-page">
    <h1 class="page-title">Bisection Method</h1>
    <hr class="page-divider" />
    <div class="content-container">
      <div
        id="calculator-container"
        class="calculator-box"
        style="width: 100%; height: 400px; margin-top: 20px"
      ></div>
      
      <div class="input-form">
        <div class="form-group">
          <label for="equation">Enter the equation </label>
          <label> F(x) : </label>
          <input
            type="text"
            id="equation"
            v-model="equation"
            placeholder="x**2 - 4"
          />
        </div>
        <div class="form-group">
          <label for="a">Initial </label>
          <label>xl : </label>
          <input type="number" id="a" v-model.number="a" />
        </div>
        <div class="form-group">
          <label for="b">Initial</label>
          <label>xr : </label>
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
        <button type="button" @click="calculateBisection">Calculate</button>
      </div>

      <div v-if="result !== null" class="result-container">
        <h3>Result:</h3>
        <p v-if="isConverged">
          The approximate root of the equation is <b>{{ result.toFixed(6) }}</b>
        </p>
        <p v-else>
          Non-convergent or the equation has no root in the specified interval.
        </p>
      </div>

      <div v-if="iterations.length > 0" class="iteration-table">
        <h3>The iteration table:</h3>
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th>xl</th>
              <th>xr</th>
              <th>xm</th>
              <th>F(xm)</th>
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

    <small class="input-hint">
      <b>Notes:</b> <br />
      <code>exp(x)</code> for <b>e<sup>x</sup></b>,
      <code>sqrt(x)</code> for <b>√x</b>,
      <code>sin(x)</code> for <b>sin(x)</b>,
      <code>cos(x)</code> for <b>cos(x)</b>,
      <code>log(x)</code> for <b>ln(x)</b>,
      <b><code>pow(x, 1/3)</code> for ∛x</b>
    </small>
  </div>
</template>

<script>
export default {
  name: "BisectionMethod",
  data() {
    return {
      equation: "x**2 - 2",
      a: -1,
      b: 2,
      epsilon: 0.0001,
      result: null,
      isConverged: true,
      iterations: [],
      calculator: null,
    };
  },
  mounted() {
    const loadDesmos = () => {
      return new Promise((resolve) => {
        if (window.Desmos) resolve();
        else {
          const script = document.createElement("script");
          script.src = "https://www.desmos.com/api/v1.6/calculator.js";
          script.onload = resolve;
          document.head.appendChild(script);
        }
      });
    };

    loadDesmos().then(() => {
      this.initDesmos();
      setTimeout(() => this.updateDesmosGraph(), 100);
    });
  },
  watch: {
    equation() {
      this.updateDesmosGraph();
      if (this.result !== null) this.plotRootPoint(this.result);
    },
  },
  methods: {
    initDesmos() {
      const elt = document.getElementById("calculator-container");
      if (elt && window.Desmos && !this.calculator) {
        this.calculator = new window.Desmos.GraphingCalculator(elt);
      }
    },
    convertEquationToLatex(equation) {
      let latex = equation
        .replace(/\*\*/g, "^")
        .replace(/pow\(([^,]+),([^)]+)\)/g, "($1)^($2)")
        .replace(/exp\(([^)]+)\)/g, "e^($1)")
        .replace(/sqrt\(([^)]+)\)/g, "sqrt($1)");
      return "y=" + latex;
    },
    updateDesmosGraph() {
      if (this.calculator && this.equation) {
        const latex = this.convertEquationToLatex(this.equation);
        this.calculator.setExpression({ id: "graph1", latex });
      } else if (this.calculator) {
        this.calculator.removeExpression({ id: "graph1" });
      }
    },
    plotRootPoint(root) {
      if (this.calculator) {
        this.calculator.removeExpression({ id: "rootPoint" });
        if (root !== null) {
          this.calculator.setExpression({
            id: "rootPoint",
            latex: `(${root}, 0)`,
            pointStyle: "POINT",
            color: "#ff0000",
            label: `root: ${root.toFixed(6)}`,
            showLabel: true,
            labelOrientation: "above",
          });
        }
      }
    },
    parseEquation(equationString) {
      try {
        const equationWithMath = equationString.replace(
          /pow\(([^,]+),([^)]+)\)/g,
          "Math.pow($1,$2)"
        );
        return new Function("x", "with(Math){ return " + equationWithMath + "}");
      } catch (error) {
        console.error("Invalid equation:", error);
        return null;
      }
    },
    calculateBisection() {
      if (!this.equation || typeof this.a !== "number" || typeof this.b !== "number") {
        alert("Please enter valid inputs");
        return;
      }
      const func = this.parseEquation(this.equation);
      if (!func) {
        alert("Your equation is invalid!");
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

      if (this.calculator) {
        this.calculator.removeExpression({ id: "graph1" });
        this.calculator.removeExpression({ id: "rootPoint" });
      }

      if (fa * fb >= 0) {
        this.result = null;
        this.isConverged = false;
        alert("Function must have different signs at endpoints.");
        return;
      }

      const maxIterations = 100;
      for (let i = 0; i < maxIterations; i++) {
        p = (a + b) / 2;
        fp = func(p);
        let error = prevP !== null ? Math.abs((p - prevP) / p) * 100 : null;

        this.iterations.push({ a, b, p, fp, error });

        if (Math.abs(fp) < this.epsilon || Math.abs(b - a) / 2 < this.epsilon) {
          this.result = p;
          this.updateDesmosGraph();
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
      this.updateDesmosGraph();
      this.plotRootPoint(null);
    },
  },
};
</script>

<style scoped>
.bisection-page {
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
  background-image: linear-gradient(
    to right,
    transparent,
    #8a2be2,
    #4169e1,
    transparent
  );
  margin: 20px 0 40px;
}
.content-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #5a5f82;
  border-radius: 8px;
  background-color: rgba(20, 20, 40, 0.8);
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
}
button {
  background-color: #4169e1;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 12px;
  cursor: pointer;
}
.result-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #5a5f82;
  border-radius: 8px;
  background-color: rgba(20, 20, 40, 0.8);
}
.iteration-table {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #5a5f82;
  padding: 10px;
  text-align: center;
}
</style>
