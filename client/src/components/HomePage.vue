<template>
  <div class="HomePage">
    <h1 class="galaxy-title">Numerical Method</h1>
    <hr class="galaxy-hr" />
    <section class="All_Bottons">
      <h2 class="section-title" @click="openPopup('Root of Equation')">Root of Equation</h2>
      <div class="ButtonGrid">
        <router-link to="/bisection" class="router-btn">
          <button>Bisection Method</button>
        </router-link>
        <router-link to="/False-Position" class="router-btn">
          <button>False-Position Method</button>
        </router-link>
        <router-link to="/One-Point" class="router-btn">
          <button>One-Point Iteration Method</button>
        </router-link>
        <router-link to="/NewtonRaphson" class="router-btn">
          <button>Newton-Raphson Method</button>
        </router-link>
        <router-link to="/Secant" class="router-btn">
          <button>Secant Method</button>
        </router-link>
        <router-link to="/Graphical" class="router-btn">
          <button>Graphical Method</button>
        </router-link>
      </div>

      <h2 class="section-title" @click="openPopup('Linear Algebraic Equation')">Linear Algebraic Equation</h2>
      <div class="ButtonGrid">
        <router-link to="/Cramer" class="router-btn">
          <button>Cramer's Rule Method</button>
        </router-link>
        <router-link to="/GaussElimination" class="router-btn">
          <button>Gauss Elimination Method</button>
        </router-link>
        <router-link to="/GaussJordan" class="router-btn">
          <button>Gauss Jordan Method</button>
        </router-link>
        <router-link to="/MatrixInversion" class="router-btn">
          <button>Matrix Inversion Method</button>
        </router-link>
        <router-link to="/LU" class="router-btn">
          <button>LU Decomposition Method</button>
        </router-link>
        <router-link to="/Cholesky" class="router-btn">
          <button>Cholesky Decomposition Method</button>
        </router-link>
        <router-link to="/Jacobi" class="router-btn">
          <button>Jacobi Iteration Method</button>
        </router-link>
        <router-link to="/GaussSeidel" class="router-btn">
          <button>Gauss-Seidel Iteration Method</button>
        </router-link>
        <router-link to="ConjugateGradient" class="router-btn">
          <button>Conjugate Gradient Method</button>
        </router-link>
      </div>

      <h2 class="section-title" @click="openPopup('Interpolation and Extrapolation')">Interpolation and Extrapolation</h2>
      <div class="ButtonGrid">
        <router-link to="/NewtonDivided" class="router-btn">
          <button>Newton's divided-differences Method</button>
        </router-link>
        <router-link to="/Lagrange" class="router-btn">
          <button>Lagrange Interpolation Method</button>
        </router-link>
        <router-link to="/Spline" class="router-btn">
          <button>Splie Interpolation Method</button>
        </router-link>
      </div>

      <h2 class="section-title" @click="openPopup('Least Squares Regression')">Least Squares Regression</h2>
      <div class="ButtonGrid">
        <router-link to="/Linear_Polynomial_Regress" class="router-btn">
          <button>Linear&Polynomial Regression</button>
        </router-link>
        <router-link to="/MultipleRegression" class="router-btn">
          <button>Multiple Regression</button>
        </router-link>
      </div>
      
      <h2 class="section-title" @click="openPopup('Integration and Differentiation')">Integration and Differentiation</h2>
      <div class="ButtonGrid">
        <router-link to="/Trapezoidal" class="router-btn">
          <button>Trapezoidal Rule Method</button>
        </router-link>
        <router-link to="/Simpson" class="router-btn">
          <button>Simpson's Rule Method</button>
        </router-link>
        <router-link to="/Romberg" class="router-btn">
          <button>Romberg Integration Method</button>
        </router-link>
        <router-link to="/GaussIntegration" class="router-btn">
          <button>Gauss Integration Method</button>
        </router-link>
        <router-link to="/Differentiation" class="router-btn">
          <button>Differentiation Method</button>
        </router-link>
      </div>
    </section>

    <PopupModal 
      :isVisible="isPopupVisible" 
      :title="popupTitle" 
      @close="closePopup"
    >
      <p>This section includes methods for **{{ popupTitle }}**.</p>
    </PopupModal>
  </div>
</template>

<script>
import PopupModal from './PopupModal.vue';

export default {
  name: "HomePage",
  components: {
    PopupModal
  },
  data() {
    return {
      isPopupVisible: false,
      popupTitle: ''
    };
  },
  methods: {
    openPopup(title) {
      this.popupTitle = title;
      this.isPopupVisible = true;
    },
    closePopup() {
      this.isPopupVisible = false;
      this.popupTitle = '';
    }
  }
};
</script>

<style>
/* --- GALAXY THEME STYLES --- */
body {
  background: #000;
}

.HomePage {
  background: radial-gradient(circle at top left, rgba(62, 28, 114, 0.8), transparent 70%),
              radial-gradient(circle at bottom right, rgba(28, 114, 114, 0.8), transparent 70%),
              radial-gradient(circle at center, rgba(14, 21, 58, 0.8), #000 70%);
  color: #e0e0e0;
  font-family: 'Arial', sans-serif;
  min-height: 100vh;
  padding: 20px;
}

.galaxy-title {
  text-align: center;
  font-size: 4em;
  color: #fff;
  text-shadow: 0 0 10px #f0f;
  margin-top: 10px;
}

.galaxy-hr {
  border: 0;
  height: 0.5em;
  background-image: linear-gradient(to right, transparent, #8a2be2, transparent);
  margin: 20px 0;
}

.section-title {
  text-align: center;
  color: #d5d0d0;
  font-size: 2.5em;
  padding: 10px 0;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.All_Bottons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  margin-top: 20px;
  padding-bottom: 45px;
}

.ButtonGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 600px;
}

.router-btn {
  text-decoration: none;
}

.All_Bottons button {
  background-color: rgba(30, 0, 80, 0.7);
  color: #fff;
  border: 1px solid rgba(138, 43, 226, 0.5);
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.3em;
  text-align: center;
  display: block;
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, background-color 0.3s;
}

.All_Bottons button:hover {
  transform: scale(1.05) rotate(1deg);
  background-color: rgba(60, 20, 120, 0.9);
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.8);
}
</style>
