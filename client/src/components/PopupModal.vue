<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <span class="close-btn" @click="closeModal">&times;</span>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s forwards;
}

.modal-content {
  background: #0d0d21;
  color: #c9c9e0;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  border: 2px solid #3a3f5a;
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.5), 0 0 10px rgba(65, 105, 225, 0.3);
  transform: scale(0.9);
  animation: modal-enter 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #5a5f82;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.8em;
  color: #8a2be2;
  text-shadow: 0 0 5px #4169e1;
}

.close-btn {
  font-size: 2.5em;
  cursor: pointer;
  color: #d1d1f0;
  transition: color 0.3s ease-in-out;
}

.close-btn:hover {
  color: #8a2be2;
  transform: rotate(90deg);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-enter {
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>