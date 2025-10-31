<template>
 <router-view/>
</template>

<script>

export default {
}
</script>

<style> 
body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #b3e0ff 0%, #e6f7ff 100%);
  min-height: 100vh;
}
hr {
  border: none;
  border-top: 2px solid darkblue;
  width: 100vw;
  margin: 20px 0 20px 0;
  display: block;
  padding-bottom: 20px;
}
h1 {
  text-align: center;
  text-decoration: underline;
  color: darkblue;
  padding-bottom: 30px;
  padding-top: 20px;
  font-size: 45px;
}
</style>