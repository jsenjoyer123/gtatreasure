<template>
  <router-view />
</template>

<style>
:root {
  --primary-color: #1a1a1a;
  --secondary-color: #2d2d2f;
  --accent-color: #007aff;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  color: #fff;
  overflow: hidden;
  user-select: none;
}

html, body, #app {
  height: 100%;
  margin: 0;
}
</style>