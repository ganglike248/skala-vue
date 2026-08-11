<script setup>
import SampleOne from './components/practice/basic/SampleOne.vue'
import SampleTwo from './components/practice/basic/SampleTwo.vue'
import VueBind from './components/practice/basic/VueBind.vue'
import VueBindclass from './components/practice/basic/VueBindClass.vue'
import VueBindShorthand from './components/practice/basic/VueBindShorthand.vue'
import VueBindStyle from './components/practice/basic/VueBindStyle.vue'
import VueIf from './components/practice/basic/VueIf.vue'
import VueShow from './components/practice/basic/VueShow.vue'
import VueFor from './components/practice/basic/VueFor.vue'
import AppExercise from './views/AppExercise.vue'
import ReactiveRef from './components/practice/composition/ReactiveRef.vue'
import ReactiveReactive from './components/practice/composition/ReactiveReactive.vue'
import ComputedBasic from './components/practice/composition/ComputedBasic.vue'
</script>

<template>
  <div style="padding: 20px">
    <h1>day1</h1>
    <SampleOne />
    <SampleTwo />
    <VueBind />
    <VueBindclass />
    <VueBindShorthand />
    <VueBindStyle />
    <VueIf />
    <VueShow />
    <VueFor />
    <h1>day2</h1>
    <AppExercise />
    <ReactiveRef />
    <ReactiveReactive />
    <ComputedBasic />
  </div>
</template>

<style>
@import '@/assets/practice.css';
</style>
