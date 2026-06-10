<script setup lang="ts">
import {computed} from "vue"
import Chart from 'chart.js/auto';

//TODO: Implémenter une Chart de type LINE
//Get Data from API

import { getRelativePosition } from "chart.js/helpers";


</script>

<template>
    <div>
        <canvas id="LineChart" width="600" height="400">

        </canvas>
    </div>
</template>

<style scoped></style>