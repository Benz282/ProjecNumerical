import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue';
import Bisection from '../components/RootofEquation/BisectionMethod.vue';
import Graphical from '../components/RootofEquation/GraphicalMethod.vue';
import FalsePosition from '../components/RootofEquation/FalsePositionMethod.vue';
import OnePoint from '../components/RootofEquation/OnePointMethod.vue';
import NewtonRaphson from '../components/RootofEquation/NewtonRaphsonMethod.vue';
import Secant from '../components/RootofEquation/SecantMethod.vue';
import Cramer from '../components/Linear-Algebraic-Equation/CramerRuleMethod.vue'
import GaussElimination from '../components/Linear-Algebraic-Equation/GaussEliminationMethod.vue';
import GaussJordan from '../components/Linear-Algebraic-Equation/GaussJordanMethod.vue';
import MatrixInversion from '../components/Linear-Algebraic-Equation/MatrixInversion.vue';
import LU from '../components/Linear-Algebraic-Equation/LUDecompositionMethod.vue';
import Cholesky from '../components/Linear-Algebraic-Equation/CholeskyDecompositionMethod.vue';
import Jacobi from '../components/Linear-Algebraic-Equation/JacobiMethod.vue';
import GaussSeidel from '../components/Linear-Algebraic-Equation/GaussSeidelMethod.vue';
import ConjugateGradient from '../components/Linear-Algebraic-Equation/ConjugateGradientMethod.vue';
import NewtonDivided from '../components/InterpolationandExtrapolation/NewtonDiviedDiffMethod.vue';
import Lagrange from '../components/InterpolationandExtrapolation/LagrangeMethod.vue';
import Spline from '../components/InterpolationandExtrapolation/SplineMethod.vue'
import Linear_Polynomial_Regress from '../components/Least-Squares-Regression/LinearandPolynomialRegression.vue';
import MultipleRegression from '../components/Least-Squares-Regression/MultipleRegression.vue';
import Trapezoidal from '../components/Integration-and-Differentiation/TrapezoidalMethod.vue';
import Simpson from '../components/Integration-and-Differentiation/SimpsonsRuleMethod.vue';
import Differentiation from '../components/Integration-and-Differentiation/DifferentiationMethod.vue';
import Romberg from '../components/Integration-and-Differentiation/RombergMethod.vue';
import GaussIntegration from '../components/Integration-and-Differentiation/GaussIntegrationMethod.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/bisection', component: Bisection },
  { path: '/Graphical', component: Graphical },
  { path: '/False-Position', component: FalsePosition },
  { path: '/One-Point' , component: OnePoint },
  { path: '/NewtonRaphson' , component: NewtonRaphson },
  { path: '/Secant' , component: Secant },
  { path: '/Cramer' , component: Cramer },
  { path: '/GaussElimination' , component: GaussElimination },
  { path: '/GaussJordan' , component: GaussJordan },
  { path: '/MatrixInversion' , component: MatrixInversion },
  { path: '/LU' , component: LU },
  { path: '/Cholesky' , component: Cholesky },
  { path: '/Jacobi' , component: Jacobi },
  { path: '/GaussSeidel' , component: GaussSeidel },
  { path: '/ConjugateGradient' , component: ConjugateGradient },
  { path: '/NewtonDivided' , component: NewtonDivided },
  { path: '/Lagrange' , component: Lagrange},
  { path: '/Spline' , component: Spline },
  { path: '/Linear_Polynomial_Regress' , component: Linear_Polynomial_Regress},
  { path: '/MultipleRegression' , component: MultipleRegression },
  { path: '/Trapezoidal' , component: Trapezoidal },
  { path: '/Simpson' , component: Simpson }, 
  { path: '/Differentiation' , component: Differentiation },
  { path: '/Romberg' , component: Romberg},
  { path: '/GaussIntegration' , component: GaussIntegration }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router