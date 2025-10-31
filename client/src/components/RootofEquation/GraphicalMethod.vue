<template>
  <div class="graphical-page">
    <h1 class="page-title">Graphical Method</h1>
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
          <label for="xmin">Xmin:</label>
          <input type="number" id="xmin" v-model.number="xmin" />
        </div>
        <div class="form-group">
          <label for="xmax">Xmax:</label>
          <input type="number" id="xmax" v-model.number="xmax" />
        </div>
        <button type="button" @click="onPlotButton">Calculate</button>
      </div>

      <div v-if="root !== null" class="result-container">
        <h3>Result:</h3>
        <p>
          <span v-if="rootFound">
            The approximate root of the equation is <b>{{ root.toFixed(6) }}</b>
          </span>
          <span v-else>No root found in the specified interval.</span>
        </p>
      </div>

      <div v-if="tableData.length > 0" class="iteration-table">
        <h3>The iteration table of x and f(x):</h3>
        <table>
          <thead>
            <tr>
              <th>x</th>
              <th>f(x)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in tableData" :key="idx">
              <td>{{ row.x.toFixed(6) }}</td>
              <td>{{ row.fx.toFixed(6) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <small class="input-hint">
    <b>Notes:</b> <br />
    <code>exp(x)</code> for <b>e<sup>x</sup></b>, <code>sqrt(x)</code> for <b>√x</b>, <code>sin(x)</code> for <b>sin(x)</b>, <code>cos(x)</code> for <b>cos(x)</b>, <code>log(x)</code> for <b>ln(x)</b>, <b><code>pow(x, 1/3)</code> for ∛x</b>
  </small>
</template>

<script>
// โค้ดส่วนนี้ยังคงเดิม ไม่มีการแก้ไข
export default {
  name: "GraphicalMethod",
  data() {
    return {
      equation: "x**2-4",
      xmin: -5,
      xmax: 5,
      calculator: null,
      root: null,
      rootFound: false,
      tableData: [],
    };
  },
  mounted() {
    const checkDesmosReady = () => {
      if (window.Desmos) {
        this.initDesmos();
      } else {
        setTimeout(checkDesmosReady, 100);
      }
    };
    checkDesmosReady();
  },
  methods: {
    initDesmos() {
      const elt = document.getElementById("calculator-container");
      if (elt && window.Desmos && !this.calculator) {
        this.calculator = new window.Desmos.GraphingCalculator(elt);
      }
    },
    autoPlotGraph() {
      this.plotGraph(false);
    },
    onPlotButton() {
      this.plotGraph(true);
    },
    plotGraph(showAlertIfNoRoot) {
      if (
        !this.equation ||
        typeof this.xmin !== "number" ||
        typeof this.xmax !== "number"
      ) {
        return;
      }
      if (!this.calculator) return;

      this.calculator.setBlank();

      const latex = "y=" + this.equation.replace(/\*\*/g, "^");
      this.calculator.setExpression({ id: "graph1", latex: latex });

      this.calculator.setExpression({
        id: "xaxis",
        latex: "y=0",
        color: "#666",
        lineWidth: 1,
      });

      this.tableData = [];
      const func = this.parseEquation(this.equation);
      if (!func) {
        if (showAlertIfNoRoot) {
          alert("Your equation is invalid! Please check again.");
        }
        return;
      }

      const N = 500;
      let foundRoot = false;
      let approxRoot = null;
      let prevX = this.xmin;
      let prevFx = func(prevX);
      this.tableData.push({ x: prevX, fx: prevFx });

      for (let i = 1; i <= N; i++) {
        const x = this.xmin + ((this.xmax - this.xmin) * i) / N;
        const fx = func(x);
        this.tableData.push({ x, fx });

        if (fx === 0) {
          approxRoot = x;
          foundRoot = true;
        } else if (prevFx === 0) {
          approxRoot = prevX;
          foundRoot = true;
        } else if (prevFx * fx < 0) {
          approxRoot = (prevX + x) / 2;
          foundRoot = true;
        }
        prevX = x;
        prevFx = fx;
      }

      this.root = approxRoot;
      this.rootFound = foundRoot;

      this.calculator.removeExpression({ id: "rootPoint" });
      if (foundRoot && approxRoot !== null) {
        this.calculator.setExpression({
          id: "rootPoint",
          latex: `\\left(${approxRoot},0\\right)`,
          color: "#ff0000",
          label: `root ≈ ${approxRoot.toFixed(6)}`,
          showLabel: true,
        });
      }

      if (showAlertIfNoRoot && !foundRoot) {
        alert("No root in the specified interval!");
      }
    },
    parseEquation(equationString) {
      try {
        const fn = new Function(
          "x",
          "with(Math){ return " + equationString + "}"
        );
        fn(1); // test
        return fn;
      } catch (error) {
        return null;
      }
    },
  },
};
</script>

<style scoped>
/* --- GALAXY THEME STYLES --- */
.graphical-page {
  background: #000;
  color: #c0c0e0;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  padding: 40px;
}

.page-title {
  text-align: center;
  font-size: 4em;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.calculator-box {
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.4), 0 0 10px rgba(65, 105, 225, 0.3);
  padding: 10px;
}

.input-form {
  background-color: rgba(20, 20, 40, 0.8);
  border-radius: 10px;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
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
  width: 100%;
  max-width: 400px;
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